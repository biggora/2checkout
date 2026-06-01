import { Buffer } from 'node:buffer';
import { createHmac } from 'node:crypto';

import { describe, expect, it, vi } from 'vitest';

import {
  TwoCheckoutApiError,
  createTwoCheckoutClient,
  verifyIpnSignature,
} from '../src';
import type { FetchLike, FetchRequestInput } from '../src';

const FIXED_DATE = new Date(Date.UTC(2026, 4, 11, 13, 0, 0));

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

function signedIpnPayload(overrides: Record<string, string> = {}): Record<string, string> {
  const payload = {
    REFNO: 'order-100',
    TOTAL: '49.99',
    CURRENCY: 'USD',
    ...overrides,
  };
  const signed = `${Buffer.byteLength(payload.REFNO, 'utf8')}${payload.REFNO}` +
    `${Buffer.byteLength(payload.TOTAL, 'utf8')}${payload.TOTAL}` +
    `${Buffer.byteLength(payload.CURRENCY, 'utf8')}${payload.CURRENCY}`;

  return {
    ...payload,
    HASH: createHmac('sha256', 'ipn-secret').update(signed, 'utf8').digest('hex'),
  };
}

describe('OSTW-SDK-014 coverage expansion', () => {
  it('returns a mocked REST 6.0 order placement response and sends the expected request body', async () => {
    const restOrderResponse = {
      RefNo: '113031758',
      ExternalReference: 'cart-42',
      Status: 'AUTHRECEIVED',
      Currency: 'USD',
      Items: [{ ProductCode: 'plan-pro', Quantity: 1 }],
    };
    const fetchMock = vi.fn<FetchLike>(async () => jsonResponse(restOrderResponse));
    const client = createTwoCheckoutClient({
      merchantCode: 'MERCHANT',
      secretKey: 'secret',
      baseUrl: 'https://api.test/rest/6.0/',
      fetch: fetchMock,
      now: () => FIXED_DATE,
    });

    const result = await client.orders.place({
      Currency: 'USD',
      ExternalReference: 'cart-42',
      Items: [{ ProductCode: 'plan-pro', Quantity: 1 }],
    });

    expect(result).toEqual(restOrderResponse);
    const call = fetchMock.mock.calls[0];
    if (!call) throw new Error('Expected fetch call.');
    expect(new URL(String(call[0])).pathname).toBe('/rest/6.0/orders/');
    expect(call[1]?.method).toBe('POST');
    expect(JSON.parse(call[1]?.body as string)).toEqual({
      Currency: 'USD',
      ExternalReference: 'cart-42',
      Items: [{ ProductCode: 'plan-pro', Quantity: 1 }],
    });
  });

  it('routes the change-plan compatibility alias to the official upgrade endpoint', async () => {
    const fetchMock = vi.fn<FetchLike>(async () =>
      jsonResponse({
        SubscriptionReference: 'sub-1',
        Status: 'ACTIVE',
        ProductCode: 'plan-enterprise',
      }),
    );
    const client = createTwoCheckoutClient({
      merchantCode: 'MERCHANT',
      secretKey: 'secret',
      baseUrl: 'https://api.test/rest/6.0/',
      fetch: fetchMock,
      now: () => FIXED_DATE,
    });

    const result = await client.subscriptions.changePlan('sub-1', {
      ProductCode: 'plan-enterprise',
      Prorate: true,
    });

    expect(result).toMatchObject({
      SubscriptionReference: 'sub-1',
      Status: 'ACTIVE',
      ProductCode: 'plan-enterprise',
    });
    const call = fetchMock.mock.calls[0];
    if (!call) throw new Error('Expected fetch call.');
    expect(new URL(String(call[0])).pathname).toBe('/rest/6.0/subscriptions/sub-1/upgrade/');
    expect(call[1]?.method).toBe('PUT');
    expect(JSON.parse(call[1]?.body as string)).toEqual({
      ProductCode: 'plan-enterprise',
      Prorate: true,
    });
  });

  it('omits nullish query parameters while preserving false and zero values', async () => {
    const fetchMock = vi.fn<FetchLike>(async () => jsonResponse({ Items: [] }));
    const client = createTwoCheckoutClient({
      merchantCode: 'MERCHANT',
      secretKey: 'secret',
      baseUrl: 'https://api.test/rest/6.0/',
      fetch: fetchMock,
      now: () => FIXED_DATE,
    });

    await client.orders.list({
      Offset: 0,
      IncludeTestOrders: false,
      Missing: undefined,
      Empty: null,
    });

    const call = fetchMock.mock.calls[0];
    if (!call) throw new Error('Expected fetch call.');
    const search = new URL(String(call[0])).searchParams;
    expect(search.get('Offset')).toBe('0');
    expect(search.get('IncludeTestOrders')).toBe('false');
    expect(search.has('Missing')).toBe(false);
    expect(search.has('Empty')).toBe(false);
  });

  it('normalizes non-JSON REST errors while retaining status, request id, and raw details', async () => {
    const fetchMock = vi.fn<FetchLike>(async () =>
      new Response('Forbidden merchant account', {
        status: 403,
        statusText: 'Forbidden',
        headers: { 'x-request-id': 'req-denied' },
      }),
    );
    const client = createTwoCheckoutClient({
      merchantCode: 'MERCHANT',
      secretKey: 'secret',
      baseUrl: 'https://api.test/rest/6.0/',
      fetch: fetchMock,
      now: () => FIXED_DATE,
    });

    await expect(client.orders.get('113031758')).rejects.toMatchObject({
      name: 'TwoCheckoutApiError',
      status: 403,
      message: 'Forbidden',
      requestId: 'req-denied',
      details: 'Forbidden merchant account',
      raw: 'Forbidden merchant account',
    } satisfies Partial<TwoCheckoutApiError>);
  });

  it('verifies a valid HMAC signature from an object IPN payload', () => {
    expect(
      verifyIpnSignature(signedIpnPayload(), {
        secret: 'ipn-secret',
        fieldOrder: ['REFNO', 'TOTAL', 'CURRENCY'],
      }),
    ).toBe(true);
  });

  it('rejects an invalid same-length HMAC signature from an object IPN payload', () => {
    const payload = signedIpnPayload({ TOTAL: '49.99' });
    const originalHash = payload.HASH;
    if (!originalHash) throw new Error('Expected generated IPN hash.');
    payload.HASH = '0'.repeat(originalHash.length);

    expect(
      verifyIpnSignature(payload, {
        secret: 'ipn-secret',
        fieldOrder: ['REFNO', 'TOTAL', 'CURRENCY'],
      }),
    ).toBe(false);
  });
});
