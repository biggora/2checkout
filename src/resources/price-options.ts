import type { HttpClient } from '../core/http-client.js';
import type { JsonRecord, QueryRecord, TwoCheckoutList } from '../core/types.js';

export type CreatePriceOptionGroupInput = JsonRecord;
export type UpdatePriceOptionGroupInput = JsonRecord;
export type ListPriceOptionGroupsQuery = QueryRecord;

export class PriceOptionsResource {
  constructor(private readonly httpClient: HttpClient) {}

  list(query?: ListPriceOptionGroupsQuery): Promise<TwoCheckoutList<JsonRecord>> {
    return this.httpClient.request({
      method: 'GET',
      path: 'priceoptions/',
      query,
    });
  }

  create(body: CreatePriceOptionGroupInput): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'POST',
      path: 'priceoptions/',
      body,
    });
  }

  get(groupCode: string): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'GET',
      path: `priceoptions/${encodeURIComponent(groupCode)}/`,
    });
  }

  update(groupCode: string, body: UpdatePriceOptionGroupInput): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'PUT',
      path: `priceoptions/${encodeURIComponent(groupCode)}/`,
      body,
    });
  }

  listForProduct(productCode: string): Promise<TwoCheckoutList<JsonRecord>> {
    return this.httpClient.request({
      method: 'GET',
      path: `products/${encodeURIComponent(productCode)}/priceoptions/`,
    });
  }
}
