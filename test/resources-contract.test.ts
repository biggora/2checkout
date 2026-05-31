import { describe, expect, it, vi } from 'vitest';

import { createTwoCheckoutClient } from '../src';
import type { FetchLike, FetchRequestInput } from '../src';

describe('2Checkout resource routing', () => {
  it('routes every public method to the documented REST 6.0 path', async () => {
    const calls: Array<{ url: URL; method: string; body: string | undefined }> = [];
    const fetchMock = vi.fn<FetchLike>(async (input: FetchRequestInput, init?: RequestInit) => {
      calls.push({
        url: new URL(String(input)),
        method: init?.method ?? 'GET',
        body: typeof init?.body === 'string' ? init.body : undefined,
      });
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    });

    const client = createTwoCheckoutClient({
      merchantCode: 'MERCHANT',
      secretKey: 'secret',
      baseUrl: 'https://api.test/rest/6.0/',
      fetch: fetchMock,
      now: () => new Date(Date.UTC(2026, 4, 11, 13, 0, 0)),
    });

    // Products
    await client.products.list({ Limit: 10 });
    await client.products.get('sku-1');
    await client.products.create({ ProductName: 'Plan' });
    await client.products.update('sku-1', { Enabled: true });
    await client.products.enable('sku-1');
    await client.products.delete('sku-1');
    await client.products.search({ Search: 'plan' });
    await client.products.listImages('sku-1');
    await client.products.getImage('sku-1', 'default');
    await client.products.listCrossSells('sku-1');
    await client.products.setUpgradeSchema('sku-1', { Upgrades: [] });
    await client.products.listPriceOptions('sku-1');
    await client.products.listPromotions('sku-1');
    await client.products.getPromotion('sku-1', 'promo-1');

    // Product SKU
    await client.productSku.generateSchema({ ProductCode: 'sku-1' });
    await client.productSku.search({ ProductCode: 'sku-1' });
    await client.productSku.delete({ ProductCode: 'sku-1', SKUCode: 'sku-a' });

    // Product groups
    await client.productGroups.list();
    await client.productGroups.create({ Name: 'SaaS' });
    await client.productGroups.get('group-1');
    await client.productGroups.getForProduct('sku-1');
    await client.productGroups.assignToProduct('sku-1', 'group-1');
    await client.productGroups.unassignFromProduct('sku-1', 'group-1');

    // Price options
    await client.priceOptions.list();
    await client.priceOptions.create({ Name: 'Seats' });
    await client.priceOptions.get('seats');
    await client.priceOptions.update('seats', { Name: 'Users' });
    await client.priceOptions.listForProduct('sku-1');

    // Pricing
    await client.pricingConfigurations.list('sku-1');
    await client.pricingConfigurations.get('sku-1', 'default');
    await client.pricingConfigurations.create('sku-1', { Name: 'EU' });
    await client.pricingConfigurations.update('sku-1', 'default', { Name: 'Global' });
    await client.pricingConfigurations.updatePrices('sku-1', 'default', { Prices: [] });
    await client.pricingConfigurations.assignPriceOption('sku-1', 'default', 'seats');
    await client.pricingConfigurations.unassignPriceOption('sku-1', 'default', 'seats');
    await client.pricingConfigurations.getSkuCodeByDetails('sku-1', 'default', { Country: 'US' });
    await client.pricingConfigurations.getSkuDetails('sku-1', 'default', 'sku-a');

    // Customers
    await client.customers.list();
    await client.customers.get(42);
    await client.customers.getByExternalReference('ext-1');
    await client.customers.create({ Email: 'a@b.com' });
    await client.customers.update(42, { Email: 'c@d.com' });
    await client.customers.delete(42);
    await client.customers.search({ Email: 'a@b.com' });

    // Subscriptions
    await client.subscriptions.list();
    await client.subscriptions.get('sub-1');
    await client.subscriptions.update('sub-1', { Status: 'ACTIVE' });
    await client.subscriptions.cancel('sub-1', { Reason: 'churn' });
    await client.subscriptions.disable('sub-1');
    await client.subscriptions.enable('sub-1');
    await client.subscriptions.changePlan('sub-1', { ProductCode: 'plan-2' });
    await client.subscriptions.updatePaymentInfo('sub-1', { Token: 'tok' });
    await client.subscriptions.search({ Status: 'ACTIVE' });

    // Orders
    await client.orders.list();
    await client.orders.get('order-1');
    await client.orders.place({ Currency: 'USD' });
    await client.orders.update('order-1', { ExternalReference: 'ext-1' });
    await client.orders.search({ Status: 'COMPLETE' });
    await client.orders.refund('order-1', { Amount: 10 });
    await client.orders.listRefunds('order-1');
    await client.orders.cancelRefund('order-1');
    await client.orders.cancel('order-1');
    await client.orders.uploadForm('order-1', { FileContent: 'base64' });
    await client.orders.getReferenceBySaleId(123);
    await client.orders.getReferenceByInvoiceId('INV-1');
    await client.orders.issueInvoice('order-1');

    // Checkout, cart settings, payment methods, invoices, proposals
    await client.paymentMethods.createToken({ CardNumber: '4111111111111111' });
    await client.paymentMethods.startApplePaySession({ ValidationURL: 'https://apple.test' });
    await client.paymentMethods.decryptApplePayData({ PaymentData: { token: 'encrypted' } });
    await client.paymentMethods.listIdealIssuerBanks();
    await client.paymentMethods.getPayPalExpressRedirectUrl({ ReturnUrl: 'https://shop.test/ok' });
    await client.paymentMethods.validatePreviousOrderReference('order-1');
    await client.paymentMethods.getInstallments({
      Amount: 100,
      Country: 'BR',
      Currency: 'BRL',
      CardBin: '411111',
    });
    await client.cartSettings.listPaymentMethods({ CountryCode: 'US', PaymentMethod: 'CC' });
    await client.cartSettings.listCurrencies({ CountryCode: 'US', PaymentMethod: 'CC' });
    await client.cartSettings.listCountries({ Language: 'en' });
    await client.cartSettings.listCountryStates('US');
    await client.cartSettings.getDynamicProductSession({ Items: [] });
    await client.cartSettings.getPrice({ Item: { Code: 'sku-1' } });
    await client.cartSettings.getShippingPrice({ Country: 'US', Items: [] });
    await client.invoices.getOrderInvoice('order-1');
    await client.invoices.getRefundInvoice('order-1', 'refunds', 0);
    await client.proposals.list({ Name: 'renewal' });
    await client.proposals.create({ Name: 'Proposal' });
    await client.proposals.get('proposal-1');
    await client.proposals.update('proposal-1', { Name: 'Updated' });
    await client.proposals.executeAction('proposal-1', { Action: 'send' });
    await client.proposals.listHistory('proposal-1', { Limit: 10 });
    await client.proposals.getHistoryVersion('proposal-1', 2);

    // Promotions
    await client.promotions.list();
    await client.promotions.get('promo-1');
    await client.promotions.create({ Name: 'Spring sale' });
    await client.promotions.update('promo-1', { Enabled: true });
    await client.promotions.delete('promo-1');
    await client.promotions.listCoupons('promo-1');
    await client.promotions.addCoupons('promo-1', { Codes: ['A', 'B'] });
    await client.promotions.removeCoupon('promo-1', 'A');

    // Cross-sell
    await client.crossSell.listCampaigns();
    await client.crossSell.getCampaign('camp-1');
    await client.crossSell.createCampaign({ Name: 'Bundle' });
    await client.crossSell.updateCampaign('camp-1', { Enabled: true });
    await client.crossSell.deleteCampaign('camp-1');
    await client.crossSell.listTexts('camp-1');
    await client.crossSell.updateTexts('camp-1', { Header: 'Try this' });

    // Shipping
    await client.shipping.listMethods();
    await client.shipping.listFees();
    await client.shipping.getFee('fee-1');

    // Tax categories
    await client.taxCategories.list();

    expect(calls.map(({ url, method }) => `${method} ${url.pathname}`)).toEqual([
      // Products
      'GET /rest/6.0/products/',
      'GET /rest/6.0/products/sku-1/',
      'POST /rest/6.0/products/',
      'PUT /rest/6.0/products/sku-1/',
      'POST /rest/6.0/products/sku-1/',
      'DELETE /rest/6.0/products/sku-1/',
      'GET /rest/6.0/products/',
      'GET /rest/6.0/products/sku-1/productimages/',
      'GET /rest/6.0/products/sku-1/productimages/default/',
      'GET /rest/6.0/products/sku-1/crosssells/',
      'POST /rest/6.0/products/sku-1/upgrade/',
      'GET /rest/6.0/products/sku-1/priceoptions/',
      'GET /rest/6.0/products/sku-1/promotions/',
      'GET /rest/6.0/products/sku-1/promotions/promo-1/',
      // Product SKU
      'GET /rest/6.0/productsku/',
      'GET /rest/6.0/productsku/search',
      'POST /rest/6.0/productsku/delete',
      // Product groups
      'GET /rest/6.0/productgroups/',
      'POST /rest/6.0/productgroups/',
      'GET /rest/6.0/productgroups/group-1/',
      'GET /rest/6.0/products/sku-1/productgroups/',
      'POST /rest/6.0/products/sku-1/productgroups/group-1/',
      'DELETE /rest/6.0/products/sku-1/productgroups/group-1/',
      // Price options
      'GET /rest/6.0/priceoptions/',
      'POST /rest/6.0/priceoptions/',
      'GET /rest/6.0/priceoptions/seats/',
      'PUT /rest/6.0/priceoptions/seats/',
      'GET /rest/6.0/products/sku-1/priceoptions/',
      // Pricing
      'GET /rest/6.0/products/sku-1/pricingconfigurations/',
      'GET /rest/6.0/products/sku-1/pricingconfigurations/default/',
      'POST /rest/6.0/products/sku-1/pricingconfigurations/',
      'PUT /rest/6.0/products/sku-1/pricingconfigurations/default/',
      'PUT /rest/6.0/products/sku-1/pricingconfigurations/default/prices',
      'POST /rest/6.0/products/sku-1/pricingconfigurations/default/priceoptions/seats/',
      'DELETE /rest/6.0/products/sku-1/pricingconfigurations/default/priceoptions/seats/',
      'GET /rest/6.0/products/sku-1/pricingconfigurations/default/sku/match/',
      'GET /rest/6.0/products/sku-1/pricingconfigurations/default/sku/sku-a/',
      // Customers
      'GET /rest/6.0/customers/',
      'GET /rest/6.0/customers/42/',
      'GET /rest/6.0/customers/external/ext-1/',
      'POST /rest/6.0/customers/',
      'PUT /rest/6.0/customers/42/',
      'DELETE /rest/6.0/customers/42/',
      'GET /rest/6.0/customers/search/',
      // Subscriptions
      'GET /rest/6.0/subscriptions/',
      'GET /rest/6.0/subscriptions/sub-1/',
      'PUT /rest/6.0/subscriptions/sub-1/',
      'DELETE /rest/6.0/subscriptions/sub-1/',
      'DELETE /rest/6.0/subscriptions/sub-1/',
      'POST /rest/6.0/subscriptions/sub-1/',
      'PUT /rest/6.0/subscriptions/sub-1/upgrade/',
      'PUT /rest/6.0/subscriptions/sub-1/payment/',
      'GET /rest/6.0/subscriptions/',
      // Orders
      'GET /rest/6.0/orders/',
      'GET /rest/6.0/orders/order-1/',
      'POST /rest/6.0/orders/',
      'PUT /rest/6.0/orders/order-1/',
      'GET /rest/6.0/orders/search/',
      'POST /rest/6.0/orders/order-1/refund/',
      'GET /rest/6.0/orders/order-1/refund/',
      'DELETE /rest/6.0/orders/order-1/refund/',
      'DELETE /rest/6.0/orders/order-1/',
      'POST /rest/6.0/orders/order-1/upload',
      'GET /rest/6.0/orders/0/sale/',
      'GET /rest/6.0/orders/0/invoice/',
      'POST /rest/6.0/orders/order-1/invoice/',
      // Checkout, cart settings, payment methods, invoices, proposals
      'POST /rest/6.0/tokens/',
      'POST /rest/6.0/payments/startapplepaysession/',
      'POST /rest/6.0/payments/decryptApplePayData/',
      'GET /rest/6.0/paymentmethods/IDEAL/issuerbanks/',
      'PUT /rest/6.0/paymentmethods/PAYPAL_EXPRESS/redirecturl/',
      'GET /rest/6.0/paymentmethods/PREVIOUS_ORDER/refno/order-1/',
      'GET /rest/6.0/orders/0/installments/',
      'GET /rest/6.0/paymentmethods/',
      'GET /rest/6.0/currencies/',
      'GET /rest/6.0/countries/',
      'GET /rest/6.0/countries/US/states/',
      'PUT /rest/6.0/orders/0/',
      'PUT /rest/6.0/orders/0/price/',
      'PUT /rest/6.0/orders/0/shipping/',
      'GET /rest/6.0/invoices/order-1/',
      'GET /rest/6.0/invoices/order-1/refunds/0/',
      'GET /rest/6.0/proposals/',
      'POST /rest/6.0/proposals/',
      'GET /rest/6.0/proposals/proposal-1',
      'PATCH /rest/6.0/proposals/proposal-1',
      'POST /rest/6.0/proposals/proposal-1/action',
      'GET /rest/6.0/proposals/proposal-1/history',
      'GET /rest/6.0/proposals/proposal-1/history/2',
      // Promotions
      'GET /rest/6.0/promotions/',
      'GET /rest/6.0/promotions/promo-1/',
      'POST /rest/6.0/promotions/',
      'PUT /rest/6.0/promotions/promo-1/',
      'DELETE /rest/6.0/promotions/promo-1/',
      'GET /rest/6.0/promotions/promo-1/coupons/',
      'POST /rest/6.0/promotions/promo-1/coupons/',
      'DELETE /rest/6.0/promotions/promo-1/coupons/A/',
      // Cross-sell
      'GET /rest/6.0/crosssell/campaigns/',
      'GET /rest/6.0/crosssell/campaigns/camp-1/',
      'POST /rest/6.0/crosssell/campaigns/',
      'PUT /rest/6.0/crosssell/campaigns/camp-1/',
      'DELETE /rest/6.0/crosssell/campaigns/camp-1/',
      'GET /rest/6.0/crosssell/campaigns/camp-1/texts/',
      'PUT /rest/6.0/crosssell/campaigns/camp-1/texts/',
      // Shipping
      'GET /rest/6.0/shippingmethods',
      'GET /rest/6.0/shippingfees/',
      'GET /rest/6.0/shippingfees/fee-1/',
      // Tax categories
      'GET /rest/6.0/taxcategories/',
    ]);

    // Spot-check query serialization and body content
    expect(calls[0]?.url.searchParams.get('Limit')).toBe('10');
    const ordersPlaceBody = calls.find(
      (c) => c.method === 'POST' && c.url.pathname === '/rest/6.0/orders/',
    )?.body;
    expect(ordersPlaceBody && JSON.parse(ordersPlaceBody)).toEqual({ Currency: 'USD' });

    const invoiceLookupCall = calls.find(
      (c) => c.method === 'GET' && c.url.pathname === '/rest/6.0/orders/0/invoice/',
    );
    expect(invoiceLookupCall?.url.searchParams.get('InvoiceId')).toBe('INV-1');

    const installmentsCall = calls.find(
      (c) => c.method === 'GET' && c.url.pathname === '/rest/6.0/orders/0/installments/',
    );
    expect(installmentsCall?.url.searchParams.get('Amount')).toBe('100');
    expect(installmentsCall?.url.searchParams.get('CardBin')).toBe('411111');

    const paymentMethodsCall = calls.find(
      (c) => c.method === 'GET' && c.url.pathname === '/rest/6.0/paymentmethods/',
    );
    expect(paymentMethodsCall?.url.searchParams.get('CountryCode')).toBe('US');
    expect(paymentMethodsCall?.url.searchParams.get('PaymentMethod')).toBe('CC');
  });

  it('routes official REST 6.0 subscription lifecycle methods', async () => {
    const calls: Array<{ url: URL; method: string; body: string | undefined }> = [];
    const fetchMock = vi.fn<FetchLike>(async (input: FetchRequestInput, init?: RequestInit) => {
      calls.push({
        url: new URL(String(input)),
        method: init?.method ?? 'GET',
        body: typeof init?.body === 'string' ? init.body : undefined,
      });
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    });

    const client = createTwoCheckoutClient({
      merchantCode: 'MERCHANT',
      secretKey: 'secret',
      baseUrl: 'https://api.test/rest/6.0/',
      fetch: fetchMock,
      now: () => new Date(Date.UTC(2026, 4, 11, 13, 0, 0)),
    });

    await client.subscriptions.list({ Status: 'ACTIVE' });
    await client.subscriptions.importTest({ SubscriptionReference: 'sub-1' });
    await client.subscriptions.get('sub-1');
    await client.subscriptions.update('sub-1', { Status: 'ACTIVE' });
    await client.subscriptions.enable('sub-1');
    await client.subscriptions.disable('sub-1');
    await client.subscriptions.listAdditionalInformation('sub-1');
    await client.subscriptions.addAdditionalInformation('sub-1', { Name: 'tier', Value: 'pro' });
    await client.subscriptions.getAdditionalInformation('sub-1', 'tier');
    await client.subscriptions.updateAdditionalInformation('sub-1', 'tier', { Value: 'team' });
    await client.subscriptions.deleteAdditionalInformation('sub-1', 'tier');
    await client.subscriptions.getCustomer('sub-1');
    await client.subscriptions.assignCustomer('sub-1', { CustomerReference: 42 });
    await client.subscriptions.getEndUser('sub-1');
    await client.subscriptions.updateEndUser('sub-1', { Email: 'buyer@example.com' });
    await client.subscriptions.listHistory('sub-1');
    await client.subscriptions.extendHistory('sub-1', { ExpirationDate: '2026-12-31' });
    await client.subscriptions.getHistoryDetail('sub-1', 'order-1');
    await client.subscriptions.getPaymentInfo('sub-1');
    await client.subscriptions.copyPaymentInfo('sub-1', 'source-sub');
    await client.subscriptions.updatePaymentInfo('sub-1', { PaymentDetails: { Type: 'TOKEN' } });
    await client.subscriptions.getRenewal('sub-1');
    await client.subscriptions.renew('sub-1', { Currency: 'USD' });
    await client.subscriptions.enableRecurringBilling('sub-1');
    await client.subscriptions.disableRecurringBilling('sub-1');
    await client.subscriptions.setRenewalGracePeriod('sub-1', { GracePeriod: 7 });
    await client.subscriptions.enableRenewalNotification('sub-1');
    await client.subscriptions.disableRenewalNotification('sub-1');
    await client.subscriptions.enableMerchantDealAutoRenewal('sub-1');
    await client.subscriptions.disableMerchantDealAutoRenewal('sub-1');
    await client.subscriptions.enableClientDealAutoRenewal('sub-1');
    await client.subscriptions.disableClientDealAutoRenewal('sub-1');
    await client.subscriptions.getRenewalPrice('sub-1', 'USD');
    await client.subscriptions.setRenewalPrice('sub-1', 'USD', { Price: 20 });
    await client.subscriptions.convertTrial('sub-1', { Currency: 'USD' });
    await client.subscriptions.getPause('sub-1');
    await client.subscriptions.pause('sub-1', { PauseDate: '2026-06-01' });
    await client.subscriptions.unpause('sub-1');
    await client.subscriptions.triggerUsageBilling('sub-1');
    await client.subscriptions.getSignOnUrl('sub-1', 'my-account', {
      Email: 'buyer@example.com',
      ValidityTime: 25,
    });
    await client.subscriptions.listUpgradeOptions('sub-1');
    await client.subscriptions.upgrade('sub-1', { ProductCode: 'pro' });
    await client.subscriptions.getUpgradePrice('sub-1', 'pro', 'USD', { Quantity: 2 });
    await client.subscriptions.scheduleProductUpdate('sub-1', { ProductCode: 'pro' });
    await client.subscriptions.removeScheduledProductUpdate('sub-1');
    await client.subscriptions.listUsages('sub-1', { Limit: 10 });
    await client.subscriptions.saveUsages('sub-1', { Usages: [] });
    await client.subscriptions.deleteUsages('sub-1', { UsageReference: 1 });
    await client.subscriptions.updateUsage('sub-1', 1, { Units: 3 });
    await client.subscriptions.changeDeal({ Items: [] });
    await client.subscriptions.cancelDeal('sub-1');
    await client.subscriptions.listEligibleChurnCampaigns('sub-1', 'en');
    await client.subscriptions.acceptChurnCampaignDiscount('sub-1', 'campaign-1');
    await client.subscriptions.enterChurnCampaign('sub-1', 'campaign-1', { Reason: 'price' });

    expect(calls.map(({ url, method }) => `${method} ${url.pathname}`)).toEqual([
      'GET /rest/6.0/subscriptions/',
      'POST /rest/6.0/subscriptions/',
      'GET /rest/6.0/subscriptions/sub-1/',
      'PUT /rest/6.0/subscriptions/sub-1/',
      'POST /rest/6.0/subscriptions/sub-1/',
      'DELETE /rest/6.0/subscriptions/sub-1/',
      'GET /rest/6.0/subscriptions/sub-1/additionalinformation/',
      'POST /rest/6.0/subscriptions/sub-1/additionalinformation/',
      'GET /rest/6.0/subscriptions/sub-1/additionalinformation/tier/',
      'PUT /rest/6.0/subscriptions/sub-1/additionalinformation/tier/',
      'DELETE /rest/6.0/subscriptions/sub-1/additionalinformation/tier/',
      'GET /rest/6.0/subscriptions/sub-1/customer/',
      'POST /rest/6.0/subscriptions/sub-1/customer/',
      'GET /rest/6.0/subscriptions/sub-1/enduser/',
      'PUT /rest/6.0/subscriptions/sub-1/enduser/',
      'GET /rest/6.0/subscriptions/sub-1/history/',
      'PUT /rest/6.0/subscriptions/sub-1/history/',
      'GET /rest/6.0/subscriptions/sub-1/history/order-1/',
      'GET /rest/6.0/subscriptions/sub-1/payment/',
      'POST /rest/6.0/subscriptions/sub-1/payment/',
      'PUT /rest/6.0/subscriptions/sub-1/payment/',
      'GET /rest/6.0/subscriptions/sub-1/renewal/',
      'PUT /rest/6.0/subscriptions/sub-1/renewal/',
      'POST /rest/6.0/subscriptions/sub-1/renewal/',
      'DELETE /rest/6.0/subscriptions/sub-1/renewal/',
      'PUT /rest/6.0/subscriptions/sub-1/renewal/graceperiod/',
      'POST /rest/6.0/subscriptions/sub-1/renewal/notification/',
      'DELETE /rest/6.0/subscriptions/sub-1/renewal/notification/',
      'POST /rest/6.0/subscriptions/sub-1/renewal/merchantdealautorenewal/',
      'DELETE /rest/6.0/subscriptions/sub-1/renewal/merchantdealautorenewal/',
      'POST /rest/6.0/subscriptions/sub-1/renewal/clientdealautorenewal/',
      'DELETE /rest/6.0/subscriptions/sub-1/renewal/clientdealautorenewal/',
      'GET /rest/6.0/subscriptions/sub-1/renewal/price/USD/',
      'PUT /rest/6.0/subscriptions/sub-1/renewal/price/USD/',
      'PUT /rest/6.0/subscriptions/sub-1/renewal/trial/',
      'GET /rest/6.0/subscriptions/sub-1/renewal/pause/',
      'POST /rest/6.0/subscriptions/sub-1/renewal/pause/',
      'DELETE /rest/6.0/subscriptions/sub-1/renewal/pause/',
      'PUT /rest/6.0/subscriptions/sub-1/renewal/usage/',
      'GET /rest/6.0/subscriptions/sub-1/signon/my-account/',
      'GET /rest/6.0/subscriptions/sub-1/upgrade/',
      'PUT /rest/6.0/subscriptions/sub-1/upgrade/',
      'GET /rest/6.0/subscriptions/sub-1/upgrade/price/pro/USD/',
      'POST /rest/6.0/subscriptions/sub-1/schedule-product-update',
      'DELETE /rest/6.0/subscriptions/sub-1/remove-scheduled-product-update',
      'GET /rest/6.0/subscriptions/sub-1/usages/',
      'POST /rest/6.0/subscriptions/sub-1/usages/',
      'DELETE /rest/6.0/subscriptions/sub-1/usages/',
      'PUT /rest/6.0/subscriptions/sub-1/usages/1',
      'POST /rest/6.0/subscriptions/deal/change/',
      'DELETE /rest/6.0/subscriptions/sub-1/deal/',
      'GET /rest/6.0/subscriptions/sub-1/eligible-campaigns/en',
      'POST /rest/6.0/subscriptions/sub-1/churn-campaigns/campaign-1/accept-discount',
      'POST /rest/6.0/subscriptions/sub-1/churn-campaigns/campaign-1/enter',
    ]);

    const copyPaymentCall = calls.find(
      (call) =>
        call.method === 'POST' &&
        call.url.pathname === '/rest/6.0/subscriptions/sub-1/payment/',
    );
    expect(copyPaymentCall?.url.searchParams.get('SubscriptionCode')).toBe('source-sub');
    expect(copyPaymentCall?.body).toBeUndefined();

    const upgradePriceCall = calls.find(
      (call) =>
        call.method === 'GET' &&
        call.url.pathname === '/rest/6.0/subscriptions/sub-1/upgrade/price/pro/USD/',
    );
    expect(upgradePriceCall?.url.searchParams.get('Quantity')).toBe('2');

    const signOnCall = calls.find(
      (call) =>
        call.method === 'GET' &&
        call.url.pathname === '/rest/6.0/subscriptions/sub-1/signon/my-account/',
    );
    expect(signOnCall?.url.searchParams.get('Email')).toBe('buyer@example.com');
    expect(signOnCall?.url.searchParams.get('ValidityTime')).toBe('25');
  });

  it('URL-encodes special characters in path segments', async () => {
    const fetchMock = vi.fn<FetchLike>(async () =>
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createTwoCheckoutClient({
      merchantCode: 'M',
      secretKey: 's',
      baseUrl: 'https://api.test/rest/6.0/',
      fetch: fetchMock,
      now: () => new Date(Date.UTC(2026, 4, 11, 13, 0, 0)),
    });

    await client.products.get('a/b c');

    const call = fetchMock.mock.calls[0];
    if (!call) throw new Error('Expected fetch call.');
    expect(new URL(String(call[0])).pathname).toBe('/rest/6.0/products/a%2Fb%20c/');
  });
});
