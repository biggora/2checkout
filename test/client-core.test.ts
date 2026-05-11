import { Buffer } from 'node:buffer';
import { createHmac } from 'node:crypto';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { TwoCheckoutApiError, createTwoCheckoutClient } from '../src';
import type { FetchLike, FetchRequestInput } from '../src';

const FIXED_DATE = new Date(Date.UTC(2026, 4, 11, 13, 0, 0));
const FIXED_DATE_STR = '2026-05-11 13:00:00';

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

function expectedAuthHeader(merchant: string, secret: string, algo: 'sha256' | 'sha3-256' = 'sha256'): string {
  const signed = `${Buffer.byteLength(merchant, 'utf8')}${merchant}${Buffer.byteLength(FIXED_DATE_STR, 'utf8')}${FIXED_DATE_STR}`;
  const hash = createHmac(algo, secret).update(signed, 'utf8').digest('hex');
  return `code="${merchant}" date="${FIXED_DATE_STR}" hash="${hash}" algo="${algo}"`;
}

describe('TwoCheckoutClient core behavior', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('sends X-Avangate-Authentication on every request without a token round-trip', async () => {
    const fetchMock = vi.fn<FetchLike>(async () => jsonResponse({ ProductCode: 'sku-1' }));
    const client = createTwoCheckoutClient({
      merchantCode: 'MERCHANT',
      secretKey: 'secret',
      baseUrl: 'https://api.test/rest/6.0/',
      fetch: fetchMock,
      now: () => FIXED_DATE,
    });

    await client.products.get('sku-1');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls[0];
    if (!call) throw new Error('Expected fetch call.');
    const [, init] = call;
    const headers = new Headers(init?.headers);

    expect(headers.get('x-avangate-authentication')).toBe(
      expectedAuthHeader('MERCHANT', 'secret'),
    );
    expect(headers.get('accept')).toBe('application/json');
    expect(headers.get('content-type')).toBeNull();
  });

  it('injects demo: true into POST body when sandbox is enabled', async () => {
    const fetchMock = vi.fn<FetchLike>(async () => jsonResponse({ RefNo: 'order-1' }));
    const client = createTwoCheckoutClient({
      merchantCode: 'M',
      secretKey: 's',
      sandbox: true,
      baseUrl: 'https://api.test/rest/6.0/',
      fetch: fetchMock,
      now: () => FIXED_DATE,
    });

    await client.orders.place({ Currency: 'USD', Items: [] });

    const call = fetchMock.mock.calls[0];
    if (!call) throw new Error('Expected fetch call.');
    const [, init] = call;
    expect(typeof init?.body).toBe('string');
    expect(JSON.parse(init?.body as string)).toEqual({
      Currency: 'USD',
      Items: [],
      demo: true,
    });
    const headers = new Headers(init?.headers);
    expect(headers.get('content-type')).toBe('application/json');
  });

  it('does not inject demo flag on GET or DELETE requests', async () => {
    const fetchMock = vi.fn<FetchLike>(async () => jsonResponse({}));
    const client = createTwoCheckoutClient({
      merchantCode: 'M',
      secretKey: 's',
      sandbox: true,
      baseUrl: 'https://api.test/rest/6.0/',
      fetch: fetchMock,
      now: () => FIXED_DATE,
    });

    await client.products.list({ Limit: 10 });
    await client.products.delete('sku-1');

    for (const [, init] of fetchMock.mock.calls) {
      expect(init?.body).toBeUndefined();
    }
  });

  it('skips demo injection when skipDemoInjection is true on a request', async () => {
    const fetchMock = vi.fn<FetchLike>(async () => jsonResponse({}));
    const client = createTwoCheckoutClient({
      merchantCode: 'M',
      secretKey: 's',
      sandbox: true,
      baseUrl: 'https://api.test/rest/6.0/',
      fetch: fetchMock,
      now: () => FIXED_DATE,
    });

    await client.request({
      method: 'POST',
      path: 'custom/',
      body: { foo: 'bar' },
      skipDemoInjection: true,
    });

    const call = fetchMock.mock.calls[0];
    if (!call) throw new Error('Expected fetch call.');
    expect(JSON.parse(call[1]?.body as string)).toEqual({ foo: 'bar' });
  });

  it('does not inject demo flag when sandbox is false (default)', async () => {
    const fetchMock = vi.fn<FetchLike>(async () => jsonResponse({}));
    const client = createTwoCheckoutClient({
      merchantCode: 'M',
      secretKey: 's',
      baseUrl: 'https://api.test/rest/6.0/',
      fetch: fetchMock,
      now: () => FIXED_DATE,
    });

    await client.orders.place({ Currency: 'USD' });

    const call = fetchMock.mock.calls[0];
    if (!call) throw new Error('Expected fetch call.');
    expect(JSON.parse(call[1]?.body as string)).toEqual({ Currency: 'USD' });
  });

  it('serializes query parameters; arrays are appended as repeated keys', async () => {
    const fetchMock = vi.fn<FetchLike>(async () => jsonResponse({ Items: [] }));
    const client = createTwoCheckoutClient({
      merchantCode: 'M',
      secretKey: 's',
      baseUrl: 'https://api.test/rest/6.0/',
      fetch: fetchMock,
      now: () => FIXED_DATE,
    });

    await client.products.list({ Limit: 25, Status: ['ACTIVE', 'DISABLED'] });

    const call = fetchMock.mock.calls[0];
    if (!call) throw new Error('Expected fetch call.');
    const url = new URL(String(call[0]));
    expect(url.pathname).toBe('/rest/6.0/products/');
    expect(url.searchParams.get('Limit')).toBe('25');
    expect(url.searchParams.getAll('Status')).toEqual(['ACTIVE', 'DISABLED']);
  });

  it('sets User-Agent header when userAgent option is provided', async () => {
    const fetchMock = vi.fn<FetchLike>(async () => jsonResponse({}));
    const client = createTwoCheckoutClient({
      merchantCode: 'M',
      secretKey: 's',
      baseUrl: 'https://api.test/rest/6.0/',
      fetch: fetchMock,
      userAgent: 'integration-test/1.0',
      now: () => FIXED_DATE,
    });

    await client.products.list();

    const call = fetchMock.mock.calls[0];
    if (!call) throw new Error('Expected fetch call.');
    const headers = new Headers(call[1]?.headers);
    expect(headers.get('user-agent')).toBe('integration-test/1.0');
  });

  it('normalizes 4xx JSON error responses into TwoCheckoutApiError with request id', async () => {
    const fetchMock = vi.fn<FetchLike>(async () =>
      new Response(JSON.stringify({ error_code: 'INVALID_INPUT', message: 'Missing Currency' }), {
        status: 400,
        headers: {
          'content-type': 'application/json',
          'x-avangate-request-id': 'req-42',
        },
      }),
    );

    const client = createTwoCheckoutClient({
      merchantCode: 'M',
      secretKey: 's',
      baseUrl: 'https://api.test/rest/6.0/',
      fetch: fetchMock,
      now: () => FIXED_DATE,
    });

    await expect(client.orders.place({})).rejects.toMatchObject({
      name: 'TwoCheckoutApiError',
      status: 400,
      code: 'INVALID_INPUT',
      message: 'Missing Currency',
      requestId: 'req-42',
    } satisfies Partial<TwoCheckoutApiError>);
  });

  it('maps AbortError to TwoCheckoutApiError code request_timeout', async () => {
    const fetchMock = vi.fn<FetchLike>(
      async (_input: FetchRequestInput, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        }),
    );

    const client = createTwoCheckoutClient({
      merchantCode: 'M',
      secretKey: 's',
      timeoutMs: 5,
      baseUrl: 'https://api.test/rest/6.0/',
      fetch: fetchMock,
      now: () => FIXED_DATE,
    });

    await expect(client.products.list()).rejects.toMatchObject({
      name: 'TwoCheckoutApiError',
      code: 'request_timeout',
    } satisfies Partial<TwoCheckoutApiError>);
  });

  it('wraps network rejections into TwoCheckoutApiError code network_error', async () => {
    const fetchMock = vi.fn<FetchLike>(async () => {
      throw new Error('ECONNREFUSED');
    });

    const client = createTwoCheckoutClient({
      merchantCode: 'M',
      secretKey: 's',
      baseUrl: 'https://api.test/rest/6.0/',
      fetch: fetchMock,
      now: () => FIXED_DATE,
    });

    await expect(client.products.list()).rejects.toMatchObject({
      name: 'TwoCheckoutApiError',
      code: 'network_error',
      message: 'ECONNREFUSED',
    } satisfies Partial<TwoCheckoutApiError>);
  });

  it('returns undefined for 204 No Content responses', async () => {
    const fetchMock = vi.fn<FetchLike>(async () => new Response(null, { status: 204 }));
    const client = createTwoCheckoutClient({
      merchantCode: 'M',
      secretKey: 's',
      baseUrl: 'https://api.test/rest/6.0/',
      fetch: fetchMock,
      now: () => FIXED_DATE,
    });

    const result = await client.products.delete('sku-1');
    expect(result).toBeUndefined();
  });

  it('returns undefined when 2xx response is not JSON', async () => {
    const fetchMock = vi.fn<FetchLike>(async () =>
      new Response('OK', {
        status: 200,
        headers: { 'content-type': 'text/plain' },
      }),
    );
    const client = createTwoCheckoutClient({
      merchantCode: 'M',
      secretKey: 's',
      baseUrl: 'https://api.test/rest/6.0/',
      fetch: fetchMock,
      now: () => FIXED_DATE,
    });

    const result = await client.products.list();
    expect(result).toBeUndefined();
  });
});
