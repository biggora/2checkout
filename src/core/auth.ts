import { Buffer } from 'node:buffer';
import { createHmac } from 'node:crypto';

import type { TwoCheckoutAlgorithm } from './types.js';

export type BuildAuthHeaderInput = {
  merchantCode: string;
  secretKey: string;
  date: Date | string;
  algorithm?: TwoCheckoutAlgorithm | undefined;
};

export function formatDate(value: Date | string): string {
  if (typeof value === 'string') {
    return value;
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())} ` +
    `${pad(value.getUTCHours())}:${pad(value.getUTCMinutes())}:${pad(value.getUTCSeconds())}`
  );
}

/**
 * Build the `X-Avangate-Authentication` header per 2Checkout REST API 6.0.
 *
 * Header shape:
 *   code="{MERCHANT_CODE}" date="{REQUEST_DATE_TIME}" hash="{HASH}" algo="{ALGO}"
 *
 * Signed string:
 *   LEN(merchantCode) + merchantCode + LEN(date) + date
 * where LEN is the UTF-8 byte length expressed as a decimal string.
 *
 * Hash: hex-encoded HMAC(secretKey, signedString) using the chosen algorithm
 * (`sha256` by default, `sha3-256` also supported).
 */
export function buildAuthHeader(input: BuildAuthHeaderInput): string {
  const algorithm = input.algorithm ?? 'sha256';
  const dateStr = formatDate(input.date);
  const merchantLen = Buffer.byteLength(input.merchantCode, 'utf8');
  const dateLen = Buffer.byteLength(dateStr, 'utf8');
  const signedString = `${merchantLen}${input.merchantCode}${dateLen}${dateStr}`;
  const hash = createHmac(algorithm, input.secretKey).update(signedString, 'utf8').digest('hex');
  return `code="${input.merchantCode}" date="${dateStr}" hash="${hash}" algo="${algorithm}"`;
}
