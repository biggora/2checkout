export type TwoCheckoutApiErrorOptions = {
  status?: number | undefined;
  code?: string | undefined;
  details?: unknown;
  raw?: unknown;
  requestId?: string | null | undefined;
  cause?: unknown;
};

export class TwoCheckoutApiError extends Error {
  status: number | undefined;
  code: string | undefined;
  details: unknown;
  raw: unknown;
  requestId: string | null | undefined;

  constructor(message: string, options: TwoCheckoutApiErrorOptions = {}) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = 'TwoCheckoutApiError';
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.raw = options.raw;
    this.requestId = options.requestId;
  }
}

type ErrorRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ErrorRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pickString(record: ErrorRecord, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  return undefined;
}

function pickRequestId(response: Response): string | null {
  return (
    response.headers.get('x-avangate-request-id') ??
    response.headers.get('x-request-id') ??
    response.headers.get('request-id') ??
    null
  );
}

export async function createTwoCheckoutApiError(response: Response): Promise<TwoCheckoutApiError> {
  const requestId = pickRequestId(response);
  const contentType = response.headers.get('content-type') ?? '';
  let raw: unknown;

  if (contentType.includes('application/json')) {
    try {
      raw = await response.json();
    } catch {
      raw = undefined;
    }
  } else {
    const text = await response.text().catch(() => '');
    raw = text.length > 0 ? text : undefined;
  }

  const record = isRecord(raw) ? raw : undefined;
  const message = record
    ? pickString(record, ['error_description', 'message', 'detail', 'description', 'Message', 'error'])
    : undefined;
  const code = record
    ? pickString(record, ['error_code', 'code', 'error', 'ErrorCode', 'Code'])
    : undefined;
  const details = record?.errors ?? record?.details ?? record?.Errors ?? raw;

  return new TwoCheckoutApiError(message ?? response.statusText ?? '2Checkout API request failed.', {
    status: response.status,
    code,
    details,
    raw,
    requestId,
  });
}

export function createTwoCheckoutRequestError(error: unknown): TwoCheckoutApiError {
  if (error instanceof TwoCheckoutApiError) {
    return error;
  }

  if (error instanceof Error && error.name === 'AbortError') {
    return new TwoCheckoutApiError('2Checkout API request timed out.', {
      code: 'request_timeout',
      cause: error,
    });
  }

  return new TwoCheckoutApiError(
    error instanceof Error ? error.message : '2Checkout API request failed.',
    {
      code: 'network_error',
      cause: error,
    },
  );
}
