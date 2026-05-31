import type { RequestOptions, TwoCheckoutClientOptions } from './core/http-client.js';
import { HttpClient } from './core/http-client.js';
import { CartSettingsResource } from './resources/cart-settings.js';
import { CrossSellResource } from './resources/cross-sell.js';
import { CustomersResource } from './resources/customers.js';
import { InvoicesResource } from './resources/invoices.js';
import { OrdersResource } from './resources/orders.js';
import { PaymentMethodsResource } from './resources/payment-methods.js';
import { PriceOptionsResource } from './resources/price-options.js';
import { PricingResource } from './resources/pricing.js';
import { PricingConfigurationsResource } from './resources/pricing-configurations.js';
import { ProductGroupsResource } from './resources/product-groups.js';
import { ProductSkuResource } from './resources/product-sku.js';
import { ProductsResource } from './resources/products.js';
import { ProposalsResource } from './resources/proposals.js';
import { PromotionsResource } from './resources/promotions.js';
import { ShippingResource } from './resources/shipping.js';
import { SubscriptionsResource } from './resources/subscriptions.js';
import { TaxCategoriesResource } from './resources/tax-categories.js';

export class TwoCheckoutClient {
  readonly products: ProductsResource;
  readonly productSku: ProductSkuResource;
  readonly productGroups: ProductGroupsResource;
  readonly priceOptions: PriceOptionsResource;
  readonly pricingConfigurations: PricingConfigurationsResource;
  readonly pricing: PricingResource;
  readonly customers: CustomersResource;
  readonly subscriptions: SubscriptionsResource;
  readonly orders: OrdersResource;
  readonly promotions: PromotionsResource;
  readonly crossSell: CrossSellResource;
  readonly shipping: ShippingResource;
  readonly paymentMethods: PaymentMethodsResource;
  readonly cartSettings: CartSettingsResource;
  readonly invoices: InvoicesResource;
  readonly proposals: ProposalsResource;
  readonly taxCategories: TaxCategoriesResource;
  private readonly httpClient: HttpClient;

  constructor(options: TwoCheckoutClientOptions) {
    this.httpClient = new HttpClient(options);
    this.products = new ProductsResource(this.httpClient);
    this.productSku = new ProductSkuResource(this.httpClient);
    this.productGroups = new ProductGroupsResource(this.httpClient);
    this.priceOptions = new PriceOptionsResource(this.httpClient);
    this.pricingConfigurations = new PricingConfigurationsResource(this.httpClient);
    this.pricing = new PricingResource(this.httpClient);
    this.customers = new CustomersResource(this.httpClient);
    this.subscriptions = new SubscriptionsResource(this.httpClient);
    this.orders = new OrdersResource(this.httpClient);
    this.promotions = new PromotionsResource(this.httpClient);
    this.crossSell = new CrossSellResource(this.httpClient);
    this.shipping = new ShippingResource(this.httpClient);
    this.paymentMethods = new PaymentMethodsResource(this.httpClient);
    this.cartSettings = new CartSettingsResource(this.httpClient);
    this.invoices = new InvoicesResource(this.httpClient);
    this.proposals = new ProposalsResource(this.httpClient);
    this.taxCategories = new TaxCategoriesResource(this.httpClient);
  }

  request<TResponse, TBody = unknown>(options: RequestOptions<TBody>): Promise<TResponse> {
    return this.httpClient.request<TResponse, TBody>(options);
  }
}

export function createTwoCheckoutClient(options: TwoCheckoutClientOptions): TwoCheckoutClient {
  return new TwoCheckoutClient(options);
}
