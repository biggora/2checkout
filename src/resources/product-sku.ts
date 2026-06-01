import type { HttpClient } from '../core/http-client.js';
import type { JsonRecord, QueryRecord, TwoCheckoutList } from '../core/types.js';

export type GenerateProductSkuSchemaQuery = QueryRecord;
export type SearchProductSkuQuery = QueryRecord;
export type DeleteProductSkuInput = JsonRecord;

export class ProductSkuResource {
  constructor(private readonly httpClient: HttpClient) {}

  generateSchema(query?: GenerateProductSkuSchemaQuery): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'GET',
      path: 'productsku/',
      query,
    });
  }

  search(query?: SearchProductSkuQuery): Promise<TwoCheckoutList<JsonRecord>> {
    return this.httpClient.request({
      method: 'GET',
      path: 'productsku/search',
      query,
    });
  }

  delete(body: DeleteProductSkuInput): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'POST',
      path: 'productsku/delete',
      body,
    });
  }
}
