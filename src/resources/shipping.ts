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
      path: 'shippingmethods',
      query,
    });
  }

  listFees(query?: QueryRecord): Promise<TwoCheckoutList<TwoCheckoutShippingFee>> {
    return this.httpClient.request({
      method: 'GET',
      path: 'shippingfees/',
      query,
    });
  }

  getFee(code: string): Promise<TwoCheckoutShippingFee> {
    return this.httpClient.request({
      method: 'GET',
      path: `shippingfees/${encodeURIComponent(code)}/`,
    });
  }
}
