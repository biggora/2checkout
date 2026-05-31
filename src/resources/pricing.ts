import { PricingConfigurationsResource } from './pricing-configurations.js';

export type {
  CreatePricingConfigurationInput,
  UpdatePricingConfigurationInput,
  UpdatePricingConfigurationPricesInput,
} from './pricing-configurations.js';

/**
 * @deprecated Use client.pricingConfigurations. This alias remains for callers
 * migrating from the earlier SDK surface, but it now uses official product-scoped
 * REST 6.0 pricing configuration paths.
 */
export class PricingResource extends PricingConfigurationsResource {
  listConfigurations: PricingConfigurationsResource['list'] = this.list.bind(this);
  getConfiguration: PricingConfigurationsResource['get'] = this.get.bind(this);
  createConfiguration: PricingConfigurationsResource['create'] = this.create.bind(this);
  updateConfiguration: PricingConfigurationsResource['update'] = this.update.bind(this);
  savePrices: PricingConfigurationsResource['updatePrices'] = this.updatePrices.bind(this);
}
