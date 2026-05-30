import type { HttpClient } from '../core/http-client.js';
import type {
  JsonRecord,
  JsonValue,
  QueryRecord,
  TwoCheckoutList,
  TwoCheckoutSubscription,
} from '../core/types.js';

export type UpdateSubscriptionInput = JsonRecord;
export type ImportTestSubscriptionInput = JsonRecord;
export type AddAdditionalInformationInput = JsonRecord;
export type UpdateAdditionalInformationInput = JsonRecord;
export type AssignCustomerInput = JsonRecord;
export type UpdateEndUserInput = JsonRecord;
export type ExtendSubscriptionHistoryInput = JsonRecord;
export type UpdatePaymentInfoInput = JsonRecord;
export type RenewSubscriptionInput = JsonRecord;
export type SetRenewalGracePeriodInput = JsonRecord;
export type SetRenewalPriceInput = JsonRecord;
export type ConvertTrialInput = JsonRecord;
export type PauseSubscriptionInput = JsonRecord;
export type UpgradeSubscriptionInput = JsonRecord;
export type ScheduleProductUpdateInput = JsonRecord;
export type SaveUsagesInput = JsonRecord;
export type DeleteUsagesInput = JsonRecord;
export type UpdateUsageInput = JsonRecord;
export type ChangeDealInput = JsonRecord;
export type EnterChurnCampaignInput = JsonRecord;

export type ChangePlanInput = UpgradeSubscriptionInput;
export type CancelSubscriptionInput = {
  Reason?: string;
  Comment?: string;
} & JsonRecord;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export class SubscriptionsResource {
  constructor(private readonly httpClient: HttpClient) {}

  list(query?: QueryRecord): Promise<TwoCheckoutList<TwoCheckoutSubscription>> {
    return this.request('GET', 'subscriptions/', { query });
  }

  search(query?: QueryRecord): Promise<TwoCheckoutList<TwoCheckoutSubscription>> {
    return this.list(query);
  }

  importTest(body: ImportTestSubscriptionInput): Promise<JsonValue> {
    return this.request('POST', 'subscriptions/', { body });
  }

  get(reference: string): Promise<TwoCheckoutSubscription> {
    return this.request('GET', this.subscriptionPath(reference));
  }

  update(reference: string, body: UpdateSubscriptionInput): Promise<JsonValue> {
    return this.request('PUT', this.subscriptionPath(reference), { body });
  }

  enable(reference: string): Promise<JsonValue> {
    return this.request('POST', this.subscriptionPath(reference));
  }

  disable(reference: string): Promise<JsonValue> {
    return this.request('DELETE', this.subscriptionPath(reference));
  }

  /**
   * @deprecated REST 6.0 disables a subscription with DELETE /subscriptions/{reference}/.
   * Use disable(reference) for the official endpoint name.
   */
  cancel(reference: string, _body?: CancelSubscriptionInput): Promise<JsonValue> {
    return this.disable(reference);
  }

  listAdditionalInformation(reference: string): Promise<TwoCheckoutList<JsonRecord>> {
    return this.request('GET', this.subscriptionPath(reference, 'additionalinformation/'));
  }

  addAdditionalInformation(
    reference: string,
    body: AddAdditionalInformationInput,
  ): Promise<JsonValue> {
    return this.request('POST', this.subscriptionPath(reference, 'additionalinformation/'), {
      body,
    });
  }

  getAdditionalInformation(reference: string, name: string): Promise<JsonRecord> {
    return this.request(
      'GET',
      this.subscriptionPath(reference, `additionalinformation/${encodeURIComponent(name)}/`),
    );
  }

  updateAdditionalInformation(
    reference: string,
    name: string,
    body: UpdateAdditionalInformationInput,
  ): Promise<JsonValue> {
    return this.request(
      'PUT',
      this.subscriptionPath(reference, `additionalinformation/${encodeURIComponent(name)}/`),
      { body },
    );
  }

  deleteAdditionalInformation(reference: string, name: string): Promise<JsonValue> {
    return this.request(
      'DELETE',
      this.subscriptionPath(reference, `additionalinformation/${encodeURIComponent(name)}/`),
    );
  }

  getCustomer(reference: string): Promise<JsonRecord> {
    return this.request('GET', this.subscriptionPath(reference, 'customer/'));
  }

  assignCustomer(reference: string, body: AssignCustomerInput): Promise<JsonValue> {
    return this.request('POST', this.subscriptionPath(reference, 'customer/'), { body });
  }

  getEndUser(reference: string): Promise<JsonRecord> {
    return this.request('GET', this.subscriptionPath(reference, 'enduser/'));
  }

  updateEndUser(reference: string, body: UpdateEndUserInput): Promise<JsonValue> {
    return this.request('PUT', this.subscriptionPath(reference, 'enduser/'), { body });
  }

  listHistory(reference: string): Promise<TwoCheckoutList<JsonRecord>> {
    return this.request('GET', this.subscriptionPath(reference, 'history/'));
  }

  extendHistory(reference: string, body: ExtendSubscriptionHistoryInput): Promise<JsonValue> {
    return this.request('PUT', this.subscriptionPath(reference, 'history/'), { body });
  }

  getHistoryDetail(reference: string, orderReference: string | number): Promise<JsonRecord> {
    return this.request(
      'GET',
      this.subscriptionPath(reference, `history/${encodeURIComponent(String(orderReference))}/`),
    );
  }

  getPaymentInfo(reference: string): Promise<JsonRecord> {
    return this.request('GET', this.subscriptionPath(reference, 'payment/'));
  }

  copyPaymentInfo(reference: string, sourceSubscriptionCode: string): Promise<JsonValue> {
    return this.request('POST', this.subscriptionPath(reference, 'payment/'), {
      query: { SubscriptionCode: sourceSubscriptionCode },
    });
  }

  updatePaymentInfo(reference: string, body: UpdatePaymentInfoInput): Promise<JsonValue> {
    return this.request('PUT', this.subscriptionPath(reference, 'payment/'), { body });
  }

  getRenewal(reference: string): Promise<JsonRecord> {
    return this.request('GET', this.subscriptionPath(reference, 'renewal/'));
  }

  renew(reference: string, body: RenewSubscriptionInput): Promise<JsonValue> {
    return this.request('PUT', this.subscriptionPath(reference, 'renewal/'), { body });
  }

  enableRecurringBilling(reference: string): Promise<JsonValue> {
    return this.request('POST', this.subscriptionPath(reference, 'renewal/'));
  }

  disableRecurringBilling(reference: string): Promise<JsonValue> {
    return this.request('DELETE', this.subscriptionPath(reference, 'renewal/'));
  }

  setRenewalGracePeriod(
    reference: string,
    body: SetRenewalGracePeriodInput,
  ): Promise<JsonValue> {
    return this.request('PUT', this.subscriptionPath(reference, 'renewal/graceperiod/'), {
      body,
    });
  }

  enableRenewalNotification(reference: string): Promise<JsonValue> {
    return this.request('POST', this.subscriptionPath(reference, 'renewal/notification/'));
  }

  disableRenewalNotification(reference: string): Promise<JsonValue> {
    return this.request('DELETE', this.subscriptionPath(reference, 'renewal/notification/'));
  }

  enableMerchantDealAutoRenewal(reference: string): Promise<JsonValue> {
    return this.request(
      'POST',
      this.subscriptionPath(reference, 'renewal/merchantdealautorenewal/'),
    );
  }

  disableMerchantDealAutoRenewal(reference: string): Promise<JsonValue> {
    return this.request(
      'DELETE',
      this.subscriptionPath(reference, 'renewal/merchantdealautorenewal/'),
    );
  }

  enableClientDealAutoRenewal(reference: string): Promise<JsonValue> {
    return this.request(
      'POST',
      this.subscriptionPath(reference, 'renewal/clientdealautorenewal/'),
    );
  }

  disableClientDealAutoRenewal(reference: string): Promise<JsonValue> {
    return this.request(
      'DELETE',
      this.subscriptionPath(reference, 'renewal/clientdealautorenewal/'),
    );
  }

  getRenewalPrice(reference: string, currency: string): Promise<JsonRecord> {
    return this.request(
      'GET',
      this.subscriptionPath(reference, `renewal/price/${encodeURIComponent(currency)}/`),
    );
  }

  setRenewalPrice(
    reference: string,
    currency: string,
    body: SetRenewalPriceInput,
  ): Promise<JsonValue> {
    return this.request(
      'PUT',
      this.subscriptionPath(reference, `renewal/price/${encodeURIComponent(currency)}/`),
      { body },
    );
  }

  convertTrial(reference: string, body: ConvertTrialInput): Promise<JsonValue> {
    return this.request('PUT', this.subscriptionPath(reference, 'renewal/trial/'), { body });
  }

  getPause(reference: string): Promise<JsonRecord> {
    return this.request('GET', this.subscriptionPath(reference, 'renewal/pause/'));
  }

  pause(reference: string, body: PauseSubscriptionInput): Promise<JsonValue> {
    return this.request('POST', this.subscriptionPath(reference, 'renewal/pause/'), { body });
  }

  unpause(reference: string): Promise<JsonValue> {
    return this.request('DELETE', this.subscriptionPath(reference, 'renewal/pause/'));
  }

  triggerUsageBilling(reference: string): Promise<JsonValue> {
    return this.request('PUT', this.subscriptionPath(reference, 'renewal/usage/'));
  }

  getSignOnUrl(reference: string, pageType: string): Promise<JsonRecord> {
    return this.request(
      'GET',
      this.subscriptionPath(reference, `signon/${encodeURIComponent(pageType)}/`),
    );
  }

  listUpgradeOptions(reference: string): Promise<TwoCheckoutList<JsonRecord>> {
    return this.request('GET', this.subscriptionPath(reference, 'upgrade/'));
  }

  upgrade(reference: string, body: UpgradeSubscriptionInput): Promise<JsonValue> {
    return this.request('PUT', this.subscriptionPath(reference, 'upgrade/'), { body });
  }

  /**
   * @deprecated Use upgrade(reference, body), which maps to the official REST 6.0 upgrade path.
   */
  changePlan(reference: string, body: ChangePlanInput): Promise<JsonValue> {
    return this.upgrade(reference, body);
  }

  getUpgradePrice(
    reference: string,
    productReference: string,
    currencyCode: string,
    query?: QueryRecord,
  ): Promise<JsonRecord> {
    return this.request(
      'GET',
      this.subscriptionPath(
        reference,
        `upgrade/price/${encodeURIComponent(productReference)}/${encodeURIComponent(currencyCode)}/`,
      ),
      { query },
    );
  }

  scheduleProductUpdate(
    reference: string,
    body: ScheduleProductUpdateInput,
  ): Promise<JsonValue> {
    return this.request('POST', this.subscriptionPath(reference, 'schedule-product-update'), {
      body,
    });
  }

  removeScheduledProductUpdate(reference: string): Promise<JsonValue> {
    return this.request('DELETE', this.subscriptionPath(reference, 'remove-scheduled-product-update'));
  }

  listUsages(reference: string, query?: QueryRecord): Promise<TwoCheckoutList<JsonRecord>> {
    return this.request('GET', this.subscriptionPath(reference, 'usages/'), { query });
  }

  saveUsages(reference: string, body: SaveUsagesInput): Promise<JsonValue> {
    return this.request('POST', this.subscriptionPath(reference, 'usages/'), { body });
  }

  deleteUsages(reference: string, body: DeleteUsagesInput): Promise<JsonValue> {
    return this.request('DELETE', this.subscriptionPath(reference, 'usages/'), { body });
  }

  updateUsage(reference: string, usageReference: string | number, body: UpdateUsageInput): Promise<JsonValue> {
    return this.request(
      'PUT',
      this.subscriptionPath(reference, `usages/${encodeURIComponent(String(usageReference))}`),
      { body },
    );
  }

  changeDeal(body: ChangeDealInput): Promise<JsonRecord> {
    return this.request('POST', 'subscriptions/deal/change/', { body });
  }

  cancelDeal(reference: string): Promise<JsonRecord> {
    return this.request('DELETE', this.subscriptionPath(reference, 'deal/'));
  }

  listEligibleChurnCampaigns(reference: string, language: string): Promise<TwoCheckoutList<JsonRecord>> {
    return this.request(
      'GET',
      this.subscriptionPath(reference, `eligible-campaigns/${encodeURIComponent(language)}`),
    );
  }

  acceptChurnCampaignDiscount(reference: string, campaignCode: string): Promise<JsonRecord> {
    return this.request(
      'POST',
      this.subscriptionPath(
        reference,
        `churn-campaigns/${encodeURIComponent(campaignCode)}/accept-discount`,
      ),
    );
  }

  enterChurnCampaign(
    reference: string,
    campaignCode: string,
    body?: EnterChurnCampaignInput,
  ): Promise<JsonRecord> {
    return this.request(
      'POST',
      this.subscriptionPath(reference, `churn-campaigns/${encodeURIComponent(campaignCode)}/enter`),
      { body },
    );
  }

  private subscriptionPath(reference: string, suffix = ''): string {
    return `subscriptions/${encodeURIComponent(reference)}/${suffix}`;
  }

  private request<TResponse>(
    method: HttpMethod,
    path: string,
    options: { body?: JsonRecord | undefined; query?: QueryRecord | undefined } = {},
  ): Promise<TResponse> {
    return this.httpClient.request<TResponse, JsonRecord | undefined>({
      method,
      path,
      body: options.body,
      query: options.query,
      skipDemoInjection: options.body === undefined,
    });
  }
}
