import type { RequestOptions, TwoCheckoutClientOptions } from './core/http-client.js';
import { HttpClient } from './core/http-client.js';
import { CrossSellResource } from './resources/cross-sell.js';
import { CustomersResource } from './resources/customers.js';
import { OrdersResource } from './resources/orders.js';
import { PricingResource } from './resources/pricing.js';
import { ProductsResource } from './resources/products.js';
import { PromotionsResource } from './resources/promotions.js';
import { ShippingResource } from './resources/shipping.js';
import { SubscriptionsResource } from './resources/subscriptions.js';

export class TwoCheckoutClient {
  readonly products: ProductsResource;
  readonly pricing: PricingResource;
  readonly customers: CustomersResource;
  readonly subscriptions: SubscriptionsResource;
  readonly orders: OrdersResource;
  readonly promotions: PromotionsResource;
  readonly crossSell: CrossSellResource;
  readonly shipping: ShippingResource;
  private readonly httpClient: HttpClient;

  constructor(options: TwoCheckoutClientOptions) {
    this.httpClient = new HttpClient(options);
    this.products = new ProductsResource(this.httpClient);
    this.pricing = new PricingResource(this.httpClient);
    this.customers = new CustomersResource(this.httpClient);
    this.subscriptions = new SubscriptionsResource(this.httpClient);
    this.orders = new OrdersResource(this.httpClient);
    this.promotions = new PromotionsResource(this.httpClient);
    this.crossSell = new CrossSellResource(this.httpClient);
    this.shipping = new ShippingResource(this.httpClient);
  }

  request<TResponse, TBody = unknown>(options: RequestOptions<TBody>): Promise<TResponse> {
    return this.httpClient.request<TResponse, TBody>(options);
  }
}

export function createTwoCheckoutClient(options: TwoCheckoutClientOptions): TwoCheckoutClient {
  return new TwoCheckoutClient(options);
}
