import type { HttpClient } from '../core/http-client.js';
import type {
  JsonRecord,
  QueryRecord,
  TwoCheckoutList,
  TwoCheckoutSubscription,
} from '../core/types.js';

export type UpdateSubscriptionInput = JsonRecord;
export type ChangePlanInput = JsonRecord;
export type UpdatePaymentInfoInput = JsonRecord;

export type CancelSubscriptionInput = {
  Reason?: string;
  Comment?: string;
} & JsonRecord;

export class SubscriptionsResource {
  constructor(private readonly httpClient: HttpClient) {}

  list(query?: QueryRecord): Promise<TwoCheckoutList<TwoCheckoutSubscription>> {
    return this.httpClient.request({
      method: 'GET',
      path: 'subscriptions/',
      query,
    });
  }

  get(reference: string): Promise<TwoCheckoutSubscription> {
    return this.httpClient.request({
      method: 'GET',
      path: `subscriptions/${encodeURIComponent(reference)}/`,
    });
  }

  update(reference: string, body: UpdateSubscriptionInput): Promise<TwoCheckoutSubscription> {
    return this.httpClient.request({
      method: 'PUT',
      path: `subscriptions/${encodeURIComponent(reference)}/`,
      body,
    });
  }

  cancel(reference: string, body?: CancelSubscriptionInput): Promise<void> {
    return this.httpClient.request({
      method: 'POST',
      path: `subscriptions/${encodeURIComponent(reference)}/cancel/`,
      body,
    });
  }

  disable(reference: string): Promise<void> {
    return this.httpClient.request({
      method: 'POST',
      path: `subscriptions/${encodeURIComponent(reference)}/disable/`,
    });
  }

  enable(reference: string): Promise<void> {
    return this.httpClient.request({
      method: 'POST',
      path: `subscriptions/${encodeURIComponent(reference)}/enable/`,
    });
  }

  changePlan(reference: string, body: ChangePlanInput): Promise<TwoCheckoutSubscription> {
    return this.httpClient.request({
      method: 'POST',
      path: `subscriptions/${encodeURIComponent(reference)}/change-plan/`,
      body,
    });
  }

  updatePaymentInfo(
    reference: string,
    body: UpdatePaymentInfoInput,
  ): Promise<TwoCheckoutSubscription> {
    return this.httpClient.request({
      method: 'PUT',
      path: `subscriptions/${encodeURIComponent(reference)}/payment-information/`,
      body,
    });
  }

  search(query: QueryRecord): Promise<TwoCheckoutList<TwoCheckoutSubscription>> {
    return this.httpClient.request({
      method: 'GET',
      path: 'subscriptions/search/',
      query,
    });
  }
}
