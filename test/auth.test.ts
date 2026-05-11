import { Buffer } from 'node:buffer';
import { createHmac } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { buildAuthHeader, formatDate } from '../src';

const FIXED_DATE = '2026-05-11 13:00:00';

function headerRegex(algo: string, hashLen: number): RegExp {
  return new RegExp(`^code="[^"]+" date="[^"]+" hash="[a-f0-9]{${hashLen}}" algo="${algo}"$`);
}

describe('buildAuthHeader', () => {
  it('emits header in documented X-Avangate-Authentication format with sha256 default', () => {
    const header = buildAuthHeader({
      merchantCode: 'ABC123',
      secretKey: 'super-secret',
      date: FIXED_DATE,
    });

    expect(header).toMatch(headerRegex('sha256', 64));
    expect(header).toContain('code="ABC123"');
    expect(header).toContain(`date="${FIXED_DATE}"`);
    expect(header).toContain('algo="sha256"');
  });

  it('uses UTF-8 byte length, not character length, when building the signed string', () => {
    const merchantCode = 'мерчант'; // 7 characters / 14 UTF-8 bytes
    const secret = 'test';
    const expectedSigned = `${Buffer.byteLength(merchantCode, 'utf8')}${merchantCode}` +
      `${Buffer.byteLength(FIXED_DATE, 'utf8')}${FIXED_DATE}`;
    const expectedHash = createHmac('sha256', secret).update(expectedSigned, 'utf8').digest('hex');

    const header = buildAuthHeader({
      merchantCode,
      secretKey: secret,
      date: FIXED_DATE,
    });

    expect(expectedSigned.startsWith('14')).toBe(true);
    expect(header).toContain(`hash="${expectedHash}"`);
  });

  it('matches HMAC-SHA256 computed independently from node:crypto', () => {
    const signed = `6ABC12319${FIXED_DATE}`;
    const expectedHash = createHmac('sha256', 'top-secret').update(signed, 'utf8').digest('hex');

    const header = buildAuthHeader({
      merchantCode: 'ABC123',
      secretKey: 'top-secret',
      date: FIXED_DATE,
    });

    expect(header).toContain(`hash="${expectedHash}"`);
  });

  it('switches to sha3-256 when algorithm option is set', () => {
    const signed = `6ABC12319${FIXED_DATE}`;
    const sha256Hash = createHmac('sha256', 'k').update(signed, 'utf8').digest('hex');
    const sha3Hash = createHmac('sha3-256', 'k').update(signed, 'utf8').digest('hex');

    const header = buildAuthHeader({
      merchantCode: 'ABC123',
      secretKey: 'k',
      date: FIXED_DATE,
      algorithm: 'sha3-256',
    });

    expect(header).toContain('algo="sha3-256"');
    expect(header).toContain(`hash="${sha3Hash}"`);
    expect(sha3Hash).not.toBe(sha256Hash);
  });
});

describe('formatDate', () => {
  it('formats Date to YYYY-MM-DD HH:mm:ss in UTC regardless of host timezone', () => {
    // 2026-05-11T13:00:00Z in any timezone
    const date = new Date(Date.UTC(2026, 4, 11, 13, 0, 0));
    expect(formatDate(date)).toBe('2026-05-11 13:00:00');
  });

  it('pads single-digit components with leading zeros', () => {
    const date = new Date(Date.UTC(2026, 0, 3, 4, 5, 6));
    expect(formatDate(date)).toBe('2026-01-03 04:05:06');
  });

  it('passes pre-formatted string input through unchanged', () => {
    expect(formatDate('already formatted')).toBe('already formatted');
  });
});
