import type { HttpClient } from '../core/http-client.js';
import type { JsonRecord, QueryRecord, TwoCheckoutList } from '../core/types.js';

export class TaxCategoriesResource {
  constructor(private readonly httpClient: HttpClient) {}

  list(query?: QueryRecord): Promise<TwoCheckoutList<JsonRecord>> {
    return this.httpClient.request({
      method: 'GET',
      path: 'taxcategories/',
      query,
    });
  }
}
