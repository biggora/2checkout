import type { HttpClient } from '../core/http-client.js';
import type {
  JsonRecord,
  QueryRecord,
  TwoCheckoutList,
  TwoCheckoutProduct,
} from '../core/types.js';

export type CreateProductInput = JsonRecord;
export type UpdateProductInput = JsonRecord;
export type ListProductsQuery = QueryRecord;
export type SearchProductsQuery = QueryRecord;

export class ProductsResource {
  constructor(private readonly httpClient: HttpClient) {}

  list(query?: ListProductsQuery): Promise<TwoCheckoutList<TwoCheckoutProduct>> {
    return this.httpClient.request({
      method: 'GET',
      path: 'products/',
      query,
    });
  }

  get(code: string): Promise<TwoCheckoutProduct> {
    return this.httpClient.request({
      method: 'GET',
      path: `products/${encodeURIComponent(code)}/`,
    });
  }

  create(body: CreateProductInput): Promise<TwoCheckoutProduct> {
    return this.httpClient.request({
      method: 'POST',
      path: 'products/',
      body,
    });
  }

  update(code: string, body: UpdateProductInput): Promise<TwoCheckoutProduct> {
    return this.httpClient.request({
      method: 'PUT',
      path: `products/${encodeURIComponent(code)}/`,
      body,
    });
  }

  delete(code: string): Promise<void> {
    return this.httpClient.request({
      method: 'DELETE',
      path: `products/${encodeURIComponent(code)}/`,
    });
  }

  search(query: SearchProductsQuery): Promise<TwoCheckoutList<TwoCheckoutProduct>> {
    return this.httpClient.request({
      method: 'GET',
      path: 'products/search/',
      query,
    });
  }

  listPriceOptions(code: string): Promise<TwoCheckoutList<JsonRecord>> {
    return this.httpClient.request({
      method: 'GET',
      path: `products/${encodeURIComponent(code)}/prices/`,
    });
  }
}
