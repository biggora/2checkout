import type { HttpClient } from '../core/http-client.js';
import type { JsonRecord, QueryRecord, TwoCheckoutList } from '../core/types.js';

export type CreateProductGroupInput = JsonRecord;
export type ListProductGroupsQuery = QueryRecord;

export class ProductGroupsResource {
  constructor(private readonly httpClient: HttpClient) {}

  list(query?: ListProductGroupsQuery): Promise<TwoCheckoutList<JsonRecord>> {
    return this.httpClient.request({
      method: 'GET',
      path: 'productgroups/',
      query,
    });
  }

  create(body: CreateProductGroupInput): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'POST',
      path: 'productgroups/',
      body,
    });
  }

  get(productGroupCode: string): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'GET',
      path: `productgroups/${encodeURIComponent(productGroupCode)}/`,
    });
  }

  getForProduct(productCode: string): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'GET',
      path: `products/${encodeURIComponent(productCode)}/productgroups/`,
    });
  }

  assignToProduct(productCode: string, productGroupCode: string): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'POST',
      path:
        `products/${encodeURIComponent(productCode)}/productgroups/` +
        `${encodeURIComponent(productGroupCode)}/`,
    });
  }

  unassignFromProduct(productCode: string, productGroupCode: string): Promise<void> {
    return this.httpClient.request({
      method: 'DELETE',
      path:
        `products/${encodeURIComponent(productCode)}/productgroups/` +
        `${encodeURIComponent(productGroupCode)}/`,
    });
  }
}
