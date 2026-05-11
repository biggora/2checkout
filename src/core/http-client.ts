import { buildAuthHeader } from './auth.js';
import {
  TwoCheckoutApiError,
  createTwoCheckoutApiError,
  createTwoCheckoutRequestError,
} from './error.js';
import type { JsonRecord, QueryRecord, TwoCheckoutAlgorithm } from './types.js';

export type FetchRequestInput = string | URL | Request;
export type FetchLike = (input: FetchRequestInput, init?: RequestInit) => Promise<Response>;

export type TwoCheckoutClientOptions = {
  merchantCode: string;
  secretKey: string;
  baseUrl?: string | undefined;
  algorithm?: TwoCheckoutAlgorithm | undefined;
  sandbox?: boolean | undefined;
  timeoutMs?: number | undefined;
  fetch?: FetchLike | undefined;
  userAgent?: string | undefined;
  now?: (() => Date) | undefined;
};

export type RequestOptions<TBody = unknown> = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path?: string | undefined;
  absoluteUrl?: string | undefined;
  query?: QueryRecord | undefined;
  body?: TBody | undefined;
  signal?: AbortSignal | undefined;
  /** Skip the sandbox `demo: true` injection for the current request. */
  skipDemoInjection?: boolean | undefined;
};

export class HttpClient {
  readonly merchantCode: string;
  readonly secretKey: string;
  readonly baseUrl: string;
  readonly algorithm: TwoCheckoutAlgorithm;
  readonly sandbox: boolean;
  readonly timeoutMs: number;
  readonly userAgent: string | undefined;
  private readonly fetchImpl: FetchLike;
  private readonly clock: () => Date;

  constructor(options: TwoCheckoutClientOptions) {
    this.merchantCode = options.merchantCode;
    this.secretKey = options.secretKey;
    this.baseUrl = ensureTrailingSlash(options.baseUrl ?? 'https://api.2checkout.com/rest/6.0/');
    this.algorithm = options.algorithm ?? 'sha256';
    this.sandbox = options.sandbox ?? false;
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.userAgent = options.userAgent;
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.clock = options.now ?? (() => new Date());
  }

  async request<TResponse, TBody = unknown>(options: RequestOptions<TBody>): Promise<TResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const combinedSignal = options.signal
      ? AbortSignal.any([controller.signal, options.signal])
      : controller.signal;

    const body = this.maybeInjectDemo(options.body, options.method, options.skipDemoInjection ?? false);

    try {
      const init: RequestInit = {
        method: options.method,
        headers: this.buildHeaders(body),
        signal: combinedSignal,
      };
      if (body !== undefined) {
        init.body = JSON.stringify(body);
      }

      const response = await this.fetchImpl(this.buildUrl(options), init);

      if (!response.ok) {
        throw await createTwoCheckoutApiError(response);
      }

      if (response.status === 204) {
        return undefined as TResponse;
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        return undefined as TResponse;
      }

      return await response.json() as TResponse;
    } catch (error) {
      throw error instanceof TwoCheckoutApiError ? error : createTwoCheckoutRequestError(error);
    } finally {
      clearTimeout(timeout);
    }
  }

  private maybeInjectDemo<TBody>(body: TBody, method: string, skip: boolean): TBody {
    if (!this.sandbox || skip) {
      return body;
    }
    if (method === 'GET' || method === 'DELETE') {
      return body;
    }
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      if (body === undefined || body === null) {
        return { demo: true } as unknown as TBody;
      }
      return body;
    }
    return { ...(body as JsonRecord), demo: true } as TBody;
  }

  private buildUrl(options: RequestOptions<unknown>): URL {
    const url = options.absoluteUrl
      ? new URL(options.absoluteUrl)
      : new URL(stripLeadingSlash(options.path ?? ''), this.baseUrl);

    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value === undefined || value === null) {
        continue;
      }

      if (Array.isArray(value)) {
        for (const entry of value) {
          url.searchParams.append(key, String(entry));
        }
        continue;
      }

      url.searchParams.set(key, String(value));
    }

    return url;
  }

  private buildHeaders(body: unknown): Headers {
    const headers = new Headers({
      accept: 'application/json',
      'x-avangate-authentication': buildAuthHeader({
        merchantCode: this.merchantCode,
        secretKey: this.secretKey,
        date: this.clock(),
        algorithm: this.algorithm,
      }),
    });

    if (body !== undefined) {
      headers.set('content-type', 'application/json');
    }

    if (this.userAgent) {
      headers.set('user-agent', this.userAgent);
    }

    return headers;
  }
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}

function stripLeadingSlash(value: string): string {
  return value.startsWith('/') ? value.slice(1) : value;
}
