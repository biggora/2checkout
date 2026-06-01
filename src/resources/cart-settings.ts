import type { HttpClient } from '../core/http-client.js';
import type { JsonRecord, JsonValue, QueryRecord } from '../core/types.js';

export type GetDynamicProductSessionInput = JsonRecord;
export type GetPriceInput = JsonRecord;
export type GetShippingPriceInput = JsonRecord;

export class CartSettingsResource {
  constructor(private readonly httpClient: HttpClient) {}

  listPaymentMethods(query?: QueryRecord): Promise<JsonValue> {
    return this.httpClient.request({
      method: 'GET',
      path: 'paymentmethods/',
      query,
    });
  }

  listCurrencies(query?: QueryRecord): Promise<JsonValue> {
    return this.httpClient.request({
      method: 'GET',
      path: 'currencies/',
      query,
    });
  }

  listCountries(query?: QueryRecord): Promise<JsonValue> {
    return this.httpClient.request({
      method: 'GET',
      path: 'countries/',
      query,
    });
  }

  listCountryStates(countryCode: string): Promise<JsonValue> {
    return this.httpClient.request({
      method: 'GET',
      path: `countries/${encodeURIComponent(countryCode)}/states/`,
    });
  }

  getDynamicProductSession(body: GetDynamicProductSessionInput): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'PUT',
      path: 'orders/0/',
      body,
    });
  }

  getPrice(body: GetPriceInput): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'PUT',
      path: 'orders/0/price/',
      body,
    });
  }

  getShippingPrice(body: GetShippingPriceInput): Promise<JsonValue> {
    return this.httpClient.request({
      method: 'PUT',
      path: 'orders/0/shipping/',
      body,
    });
  }
}
