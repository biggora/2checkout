import type { HttpClient } from '../core/http-client.js';
import type {
  JsonRecord,
  QueryRecord,
  TwoCheckoutList,
  TwoCheckoutShippingFee,
  TwoCheckoutShippingMethod,
} from '../core/types.js';

export type CreateShippingFeeInput = JsonRecord;
export type UpdateShippingFeeInput = JsonRecord;

export class ShippingResource {
  constructor(private readonly httpClient: HttpClient) {}

  listMethods(query?: QueryRecord): Promise<TwoCheckoutList<TwoCheckoutShippingMethod>> {
    return this.httpClient.request({
      method: 'GET',
      path: 'shipping/methods/',
      query,
    });
  }

  getMethod(code: string): Promise<TwoCheckoutShippingMethod> {
    return this.httpClient.request({
      method: 'GET',
      path: `shipping/methods/${encodeURIComponent(code)}/`,
    });
  }

  listFees(query?: QueryRecord): Promise<TwoCheckoutList<TwoCheckoutShippingFee>> {
    return this.httpClient.request({
      method: 'GET',
      path: 'shipping/fees/',
      query,
    });
  }

  getFee(code: string): Promise<TwoCheckoutShippingFee> {
    return this.httpClient.request({
      method: 'GET',
      path: `shipping/fees/${encodeURIComponent(code)}/`,
    });
  }

  createFee(body: CreateShippingFeeInput): Promise<TwoCheckoutShippingFee> {
    return this.httpClient.request({
      method: 'POST',
      path: 'shipping/fees/',
      body,
    });
  }

  updateFee(code: string, body: UpdateShippingFeeInput): Promise<TwoCheckoutShippingFee> {
    return this.httpClient.request({
      method: 'PUT',
      path: `shipping/fees/${encodeURIComponent(code)}/`,
      body,
    });
  }

  deleteFee(code: string): Promise<void> {
    return this.httpClient.request({
      method: 'DELETE',
      path: `shipping/fees/${encodeURIComponent(code)}/`,
    });
  }
}
