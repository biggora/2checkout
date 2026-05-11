import type { HttpClient } from '../core/http-client.js';
import type {
  JsonRecord,
  QueryRecord,
  TwoCheckoutList,
  TwoCheckoutPricingConfiguration,
} from '../core/types.js';

export type CreatePricingConfigurationInput = JsonRecord;
export type UpdatePricingConfigurationInput = JsonRecord;

export class PricingResource {
  constructor(private readonly httpClient: HttpClient) {}

  listConfigurations(query?: QueryRecord): Promise<TwoCheckoutList<TwoCheckoutPricingConfiguration>> {
    return this.httpClient.request({
      method: 'GET',
      path: 'pricing/configurations/',
      query,
    });
  }

  getConfiguration(code: string): Promise<TwoCheckoutPricingConfiguration> {
    return this.httpClient.request({
      method: 'GET',
      path: `pricing/configurations/${encodeURIComponent(code)}/`,
    });
  }

  createConfiguration(body: CreatePricingConfigurationInput): Promise<TwoCheckoutPricingConfiguration> {
    return this.httpClient.request({
      method: 'POST',
      path: 'pricing/configurations/',
      body,
    });
  }

  updateConfiguration(
    code: string,
    body: UpdatePricingConfigurationInput,
  ): Promise<TwoCheckoutPricingConfiguration> {
    return this.httpClient.request({
      method: 'PUT',
      path: `pricing/configurations/${encodeURIComponent(code)}/`,
      body,
    });
  }

  deleteConfiguration(code: string): Promise<void> {
    return this.httpClient.request({
      method: 'DELETE',
      path: `pricing/configurations/${encodeURIComponent(code)}/`,
    });
  }

  savePrices(productCode: string, body: JsonRecord): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'POST',
      path: `products/${encodeURIComponent(productCode)}/prices/`,
      body,
    });
  }

  getPrices(productCode: string, query?: QueryRecord): Promise<TwoCheckoutList<JsonRecord>> {
    return this.httpClient.request({
      method: 'GET',
      path: `products/${encodeURIComponent(productCode)}/prices/`,
      query,
    });
  }
}
