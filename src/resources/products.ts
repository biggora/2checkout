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
export type SetProductUpgradeSchemaInput = JsonRecord;

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

  enable(code: string, body?: JsonRecord): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'POST',
      path: `products/${encodeURIComponent(code)}/`,
      body,
    });
  }

  disable(code: string): Promise<void> {
    return this.httpClient.request({
      method: 'DELETE',
      path: `products/${encodeURIComponent(code)}/`,
    });
  }

  /**
   * @deprecated REST 6.0 disables products with DELETE /products/{ProductCode}/.
   * Use disable(code) for the official endpoint name.
   */
  delete(code: string): Promise<void> {
    return this.disable(code);
  }

  /**
   * Alias for list(query). The official REST 6.0 product search endpoint is
   * GET /products/ with filters as query parameters.
   */
  search(query: SearchProductsQuery): Promise<TwoCheckoutList<TwoCheckoutProduct>> {
    return this.list(query);
  }

  listImages(code: string, query?: QueryRecord): Promise<TwoCheckoutList<JsonRecord>> {
    return this.httpClient.request({
      method: 'GET',
      path: `products/${encodeURIComponent(code)}/productimages/`,
      query,
    });
  }

  getImage(code: string, imageFilter: string): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'GET',
      path:
        `products/${encodeURIComponent(code)}/productimages/` +
        `${encodeURIComponent(imageFilter)}/`,
    });
  }

  listCrossSells(code: string, query?: QueryRecord): Promise<TwoCheckoutList<JsonRecord>> {
    return this.httpClient.request({
      method: 'GET',
      path: `products/${encodeURIComponent(code)}/crosssells/`,
      query,
    });
  }

  setUpgradeSchema(code: string, body: SetProductUpgradeSchemaInput): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'POST',
      path: `products/${encodeURIComponent(code)}/upgrade/`,
      body,
    });
  }

  listPriceOptions(code: string): Promise<TwoCheckoutList<JsonRecord>> {
    return this.httpClient.request({
      method: 'GET',
      path: `products/${encodeURIComponent(code)}/priceoptions/`,
    });
  }

  listPromotions(code: string): Promise<TwoCheckoutList<JsonRecord>> {
    return this.httpClient.request({
      method: 'GET',
      path: `products/${encodeURIComponent(code)}/promotions/`,
    });
  }

  getPromotion(code: string, promotionCode: string): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'GET',
      path:
        `products/${encodeURIComponent(code)}/promotions/` +
        `${encodeURIComponent(promotionCode)}/`,
    });
  }
}
