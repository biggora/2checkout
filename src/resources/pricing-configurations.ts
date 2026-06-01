import type { HttpClient } from '../core/http-client.js';
import type {
  JsonRecord,
  QueryRecord,
  TwoCheckoutList,
  TwoCheckoutPricingConfiguration,
} from '../core/types.js';

export type CreatePricingConfigurationInput = JsonRecord;
export type UpdatePricingConfigurationInput = JsonRecord;
export type UpdatePricingConfigurationPricesInput = JsonRecord;

export class PricingConfigurationsResource {
  constructor(private readonly httpClient: HttpClient) {}

  list(
    productCode: string,
    query?: QueryRecord,
  ): Promise<TwoCheckoutList<TwoCheckoutPricingConfiguration>> {
    return this.httpClient.request({
      method: 'GET',
      path: `products/${encodeURIComponent(productCode)}/pricingconfigurations/`,
      query,
    });
  }

  get(productCode: string, code: string): Promise<TwoCheckoutPricingConfiguration> {
    return this.httpClient.request({
      method: 'GET',
      path:
        `products/${encodeURIComponent(productCode)}/pricingconfigurations/` +
        `${encodeURIComponent(code)}/`,
    });
  }

  create(
    productCode: string,
    body: CreatePricingConfigurationInput,
  ): Promise<TwoCheckoutPricingConfiguration> {
    return this.httpClient.request({
      method: 'POST',
      path: `products/${encodeURIComponent(productCode)}/pricingconfigurations/`,
      body,
    });
  }

  update(
    productCode: string,
    code: string,
    body: UpdatePricingConfigurationInput,
  ): Promise<TwoCheckoutPricingConfiguration> {
    return this.httpClient.request({
      method: 'PUT',
      path:
        `products/${encodeURIComponent(productCode)}/pricingconfigurations/` +
        `${encodeURIComponent(code)}/`,
      body,
    });
  }

  updatePrices(
    productCode: string,
    pricingConfigurationCode: string,
    body: UpdatePricingConfigurationPricesInput,
  ): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'PUT',
      path:
        `products/${encodeURIComponent(productCode)}/pricingconfigurations/` +
        `${encodeURIComponent(pricingConfigurationCode)}/prices`,
      body,
    });
  }

  assignPriceOption(
    productCode: string,
    pricingConfigurationCode: string,
    priceOptionCode: string,
    body?: JsonRecord,
  ): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'POST',
      path:
        `products/${encodeURIComponent(productCode)}/pricingconfigurations/` +
        `${encodeURIComponent(pricingConfigurationCode)}/priceoptions/` +
        `${encodeURIComponent(priceOptionCode)}/`,
      body,
    });
  }

  unassignPriceOption(
    productCode: string,
    pricingConfigurationCode: string,
    priceOptionCode: string,
  ): Promise<void> {
    return this.httpClient.request({
      method: 'DELETE',
      path:
        `products/${encodeURIComponent(productCode)}/pricingconfigurations/` +
        `${encodeURIComponent(pricingConfigurationCode)}/priceoptions/` +
        `${encodeURIComponent(priceOptionCode)}/`,
    });
  }

  getSkuCodeByDetails(
    productCode: string,
    code: string,
    query?: QueryRecord,
  ): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'GET',
      path:
        `products/${encodeURIComponent(productCode)}/pricingconfigurations/` +
        `${encodeURIComponent(code)}/sku/match/`,
      query,
    });
  }

  getSkuDetails(
    productCode: string,
    pricingConfigurationCode: string,
    skuCode: string,
  ): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'GET',
      path:
        `products/${encodeURIComponent(productCode)}/pricingconfigurations/` +
        `${encodeURIComponent(pricingConfigurationCode)}/sku/` +
        `${encodeURIComponent(skuCode)}/`,
    });
  }
}
