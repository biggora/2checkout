import { Buffer } from 'node:buffer';
import { createHmac } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  DEFAULT_IPN_FIELD_ORDER,
  TwoCheckoutIpnVerificationError,
  parseIpnEvent,
  verifyIpnSignature,
} from '../src';

function buildSignedString(values: Array<string | string[] | undefined>): string {
  const parts: string[] = [];
  for (const value of values) {
    if (value === undefined) {
      parts.push('0');
      continue;
    }
    if (Array.isArray(value)) {
      for (const v of value) {
        parts.push(`${Buffer.byteLength(v, 'utf8')}${v}`);
      }
      continue;
    }
    parts.push(`${Buffer.byteLength(value, 'utf8')}${value}`);
  }
  return parts.join('');
}

describe('parseIpnEvent', () => {
  it('decodes form-urlencoded body and collects []-suffixed keys into arrays', () => {
    const body =
      'IPN_PID%5B%5D=1&IPN_PID%5B%5D=2&IPN_PNAME%5B%5D=Plan&IPN_DATE=2026-05-11+13%3A00%3A00&REFNO=ref-1';

    const event = parseIpnEvent(body, { contentType: 'application/x-www-form-urlencoded' });

    expect(event.IPN_PID).toEqual(['1', '2']);
    expect(event.IPN_PNAME).toEqual(['Plan']);
    expect(event.IPN_DATE).toBe('2026-05-11 13:00:00');
    expect(event.REFNO).toBe('ref-1');
  });

  it('decodes JSON body when contentType signals application/json', () => {
    const body = JSON.stringify({ REFNO: 'ref-1', TOTAL: '12.34', HASH: 'abc' });

    const event = parseIpnEvent(Buffer.from(body), { contentType: 'application/json; charset=utf-8' });

    expect(event.REFNO).toBe('ref-1');
    expect(event.HASH).toBe('abc');
  });

  it('auto-detects JSON when body begins with a brace and no contentType is given', () => {
    const body = '{"REFNO":"auto","TOTAL":"5.00"}';
    const event = parseIpnEvent(body);
    expect(event.REFNO).toBe('auto');
  });

  it('throws TwoCheckoutIpnVerificationError when JSON payload is not an object', () => {
    expect(() => parseIpnEvent('[1,2,3]', { contentType: 'application/json' })).toThrow(
      TwoCheckoutIpnVerificationError,
    );
  });
});

describe('verifyIpnSignature', () => {
  const SECRET = 'top-secret';
  const VALUES = ['1', ['PlanA', 'PlanB'], '2026-05-11 13:00:00', 'ref-1', 'ext-1', '12.34', 'USD'];

  function makePayloadString(extra: Record<string, string> = {}): { body: string; hash: string } {
    const signed = buildSignedString(VALUES as Array<string | string[] | undefined>);
    const hash = createHmac('sha256', SECRET).update(signed, 'utf8').digest('hex');
    const params = new URLSearchParams();
    params.append('IPN_PID[]', '1');
    params.append('IPN_PNAME[]', 'PlanA');
    params.append('IPN_PNAME[]', 'PlanB');
    params.set('IPN_DATE', '2026-05-11 13:00:00');
    params.set('REFNO', 'ref-1');
    params.set('REFNOEXT', 'ext-1');
    params.set('TOTAL', '12.34');
    params.set('CURRENCY', 'USD');
    for (const [k, v] of Object.entries(extra)) {
      params.set(k, v);
    }
    params.set('HASH', hash);
    return { body: params.toString(), hash };
  }

  it('returns true for a correctly signed payload using the default field order', () => {
    const { body } = makePayloadString();
    const ok = verifyIpnSignature(body, { secret: SECRET });
    expect(ok).toBe(true);
  });

  it('returns false when the payload has been tampered with', () => {
    const { body } = makePayloadString();
    const tampered = body.replace('TOTAL=12.34', 'TOTAL=99.99');
    expect(verifyIpnSignature(tampered, { secret: SECRET })).toBe(false);
  });

  it('returns false when HASH is missing from the payload', () => {
    const params = new URLSearchParams();
    params.append('IPN_PID[]', '1');
    params.set('IPN_DATE', '2026-05-11 13:00:00');
    expect(verifyIpnSignature(params.toString(), { secret: SECRET })).toBe(false);
  });

  it('honors HASH_ALGO=sha3-256 from the payload when algorithm option is not provided', () => {
    const signed = buildSignedString(['only-field']);
    const hash = createHmac('sha3-256', SECRET).update(signed, 'utf8').digest('hex');
    const params = new URLSearchParams();
    params.set('ONLY', 'only-field');
    params.set('HASH', hash);
    params.set('HASH_ALGO', 'sha3-256');

    const ok = verifyIpnSignature(params.toString(), {
      secret: SECRET,
      fieldOrder: ['ONLY'],
    });
    expect(ok).toBe(true);
  });

  it('accepts a custom fieldOrder option', () => {
    const signed = buildSignedString(['only']);
    const hash = createHmac('sha256', SECRET).update(signed, 'utf8').digest('hex');
    const ok = verifyIpnSignature(
      { CUSTOM_FIELD: 'only', HASH: hash },
      { secret: SECRET, fieldOrder: ['CUSTOM_FIELD'] },
    );
    expect(ok).toBe(true);
  });

  it('returns false (does not throw) when provided hash has a different length than computed hash', () => {
    expect(
      verifyIpnSignature(
        { REFNO: 'r', HASH: 'short' },
        { secret: SECRET, fieldOrder: ['REFNO'] },
      ),
    ).toBe(false);
  });

  it('exports the documented default IPN field order', () => {
    expect(DEFAULT_IPN_FIELD_ORDER).toEqual([
      'IPN_PID',
      'IPN_PNAME',
      'IPN_DATE',
      'REFNO',
      'REFNOEXT',
      'TOTAL',
      'CURRENCY',
    ]);
  });
});
