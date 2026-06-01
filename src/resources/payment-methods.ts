import type { HttpClient } from '../core/http-client.js';
import type { JsonRecord, JsonValue, QueryRecord } from '../core/types.js';

export type CreateEesTokenInput = JsonRecord;
export type StartApplePaySessionInput = JsonRecord;
export type DecryptApplePayDataInput = JsonRecord;
export type GetPayPalExpressRedirectUrlInput = JsonRecord;

export class PaymentMethodsResource {
  constructor(private readonly httpClient: HttpClient) {}

  createToken(body: CreateEesTokenInput): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'POST',
      path: 'tokens/',
      body,
    });
  }

  startApplePaySession(body: StartApplePaySessionInput): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'POST',
      path: 'payments/startapplepaysession/',
      body,
    });
  }

  decryptApplePayData(body: DecryptApplePayDataInput): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'POST',
      path: 'payments/decryptApplePayData/',
      body,
    });
  }

  listIdealIssuerBanks(): Promise<JsonValue> {
    return this.httpClient.request({
      method: 'GET',
      path: 'paymentmethods/IDEAL/issuerbanks/',
    });
  }

  getPayPalExpressRedirectUrl(body: GetPayPalExpressRedirectUrlInput): Promise<JsonValue> {
    return this.httpClient.request({
      method: 'PUT',
      path: 'paymentmethods/PAYPAL_EXPRESS/redirecturl/',
      body,
    });
  }

  validatePreviousOrderReference(orderReference: string): Promise<JsonValue> {
    return this.httpClient.request({
      method: 'GET',
      path: `paymentmethods/PREVIOUS_ORDER/refno/${encodeURIComponent(orderReference)}/`,
    });
  }

  getInstallments(query: QueryRecord): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'GET',
      path: 'orders/0/installments/',
      query,
    });
  }
}
