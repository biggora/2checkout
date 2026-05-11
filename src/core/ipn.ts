import { Buffer } from 'node:buffer';
import { createHmac, timingSafeEqual } from 'node:crypto';

import type { JsonRecord, TwoCheckoutAlgorithm, TwoCheckoutIpnEvent } from './types.js';

export class TwoCheckoutIpnVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TwoCheckoutIpnVerificationError';
  }
}

export type ParseIpnInput = Buffer | string;

export type ParseIpnOptions = {
  contentType?: string | undefined;
};

/**
 * Default IPN field order documented by 2Checkout for HASH/HASH_ALGO calculation.
 * Override via `verifyIpnSignature({ fieldOrder })` if your integration uses a
 * different field set (e.g. when extra IPN_PNOTIFY items are appended by Verifone).
 *
 * Reference:
 * https://verifone.cloud/docs/2checkout/API-Integration/Webhooks/06Instant_Payment_Notification_%28IPN%29/Calculate-the-IPN-HASH-signature
 */
export const DEFAULT_IPN_FIELD_ORDER: readonly string[] = [
  'IPN_PID',
  'IPN_PNAME',
  'IPN_DATE',
  'REFNO',
  'REFNOEXT',
  'TOTAL',
  'CURRENCY',
];

export type VerifyIpnSignatureOptions = {
  secret: string;
  algorithm?: TwoCheckoutAlgorithm | undefined;
  fieldOrder?: readonly string[] | undefined;
  hashField?: string | undefined;
  algoField?: string | undefined;
};

function normalizeRawBody(rawBody: ParseIpnInput): string {
  return Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody;
}

function looksLikeJson(text: string): boolean {
  const trimmed = text.trimStart();
  return trimmed.startsWith('{') || trimmed.startsWith('[');
}

function parseFormUrlEncoded(text: string): JsonRecord {
  const params = new URLSearchParams(text);
  const result: Record<string, string | string[]> = {};

  for (const [rawKey, value] of params.entries()) {
    const isArray = rawKey.endsWith('[]');
    const key = isArray ? rawKey.slice(0, -2) : rawKey;
    const existing = result[key];

    if (isArray || Array.isArray(existing)) {
      if (Array.isArray(existing)) {
        existing.push(value);
      } else if (existing !== undefined) {
        result[key] = [existing, value];
      } else {
        result[key] = [value];
      }
      continue;
    }

    if (existing !== undefined) {
      result[key] = [existing, value];
      continue;
    }

    result[key] = value;
  }

  return result as JsonRecord;
}

export function parseIpnEvent<TPayload = JsonRecord>(
  rawBody: ParseIpnInput,
  options: ParseIpnOptions = {},
): TwoCheckoutIpnEvent<TPayload> {
  const text = normalizeRawBody(rawBody);
  const contentType = options.contentType?.toLowerCase() ?? '';
  const isJson =
    contentType.includes('application/json') || (contentType === '' && looksLikeJson(text));

  if (isJson) {
    const parsed = JSON.parse(text) as unknown;
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new TwoCheckoutIpnVerificationError('IPN JSON payload must be an object.');
    }
    return parsed as TwoCheckoutIpnEvent<TPayload>;
  }

  return parseFormUrlEncoded(text) as TwoCheckoutIpnEvent<TPayload>;
}

function appendLenValue(parts: string[], value: unknown): void {
  if (value === undefined || value === null) {
    parts.push('0');
    return;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      appendLenValue(parts, entry);
    }
    return;
  }

  const str = typeof value === 'string' ? value : String(value);
  const length = Buffer.byteLength(str, 'utf8');
  parts.push(`${length}${str}`);
}

function readField(record: JsonRecord, name: string): unknown {
  if (Object.prototype.hasOwnProperty.call(record, name)) {
    return record[name];
  }
  return undefined;
}

function asEventRecord(input: ParseIpnInput | JsonRecord): JsonRecord {
  if (typeof input === 'string' || Buffer.isBuffer(input)) {
    return parseIpnEvent(input);
  }
  return input;
}

/**
 * Verify the IPN HASH for a 2Checkout webhook payload.
 *
 * Concatenates `LEN(value) + value` for each field listed in `fieldOrder`
 * (UTF-8 byte length, decimal string prefix), then compares the resulting
 * HMAC against the `HASH` field using `timingSafeEqual`.
 *
 * For multi-value fields (e.g. `IPN_PID[]`) the LEN+value pair is repeated
 * for every element in document order.
 *
 * Returns `false` on any mismatch, missing hash, unsupported algorithm, or
 * decoding error — does not throw, so it is safe to call directly inside a
 * webhook controller without extra try/catch.
 */
export function verifyIpnSignature(
  rawBody: ParseIpnInput | JsonRecord,
  options: VerifyIpnSignatureOptions,
): boolean {
  if (typeof options.secret !== 'string' || options.secret.length === 0) {
    return false;
  }

  let record: JsonRecord;
  try {
    record = asEventRecord(rawBody);
  } catch {
    return false;
  }

  const hashField = options.hashField ?? 'HASH';
  const algoField = options.algoField ?? 'HASH_ALGO';
  const providedHashRaw = record[hashField];
  if (typeof providedHashRaw !== 'string' || providedHashRaw.length === 0) {
    return false;
  }
  const providedHash = providedHashRaw.toLowerCase();

  const payloadAlgo = record[algoField];
  const algorithm: TwoCheckoutAlgorithm =
    options.algorithm ??
    (payloadAlgo === 'sha3-256' ? 'sha3-256' : 'sha256');

  if (algorithm !== 'sha256' && algorithm !== 'sha3-256') {
    return false;
  }

  const order = options.fieldOrder ?? DEFAULT_IPN_FIELD_ORDER;
  const parts: string[] = [];
  for (const field of order) {
    appendLenValue(parts, readField(record, field));
  }
  const signedString = parts.join('');

  let computedHash: string;
  try {
    computedHash = createHmac(algorithm, options.secret)
      .update(signedString, 'utf8')
      .digest('hex');
  } catch {
    return false;
  }

  if (computedHash.length !== providedHash.length) {
    return false;
  }

  try {
    return timingSafeEqual(Buffer.from(computedHash, 'utf8'), Buffer.from(providedHash, 'utf8'));
  } catch {
    return false;
  }
}
