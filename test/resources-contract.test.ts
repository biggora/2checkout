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
    await client.products.delete('sku-1');
    await client.products.search({ Search: 'plan' });
    await client.products.listPriceOptions('sku-1');

    // Pricing
    await client.pricing.listConfigurations();
    await client.pricing.getConfiguration('default');
    await client.pricing.createConfiguration({ Name: 'EU' });
    await client.pricing.updateConfiguration('default', { Name: 'Global' });
    await client.pricing.deleteConfiguration('default');
    await client.pricing.savePrices('sku-1', { Prices: [] });
    await client.pricing.getPrices('sku-1');

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
    await client.orders.issueInvoice('order-1');

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
    await client.shipping.getMethod('ground');
    await client.shipping.listFees();
    await client.shipping.getFee('fee-1');
    await client.shipping.createFee({ Name: 'EU shipping' });
    await client.shipping.updateFee('fee-1', { Amount: 5 });
    await client.shipping.deleteFee('fee-1');

    expect(calls.map(({ url, method }) => `${method} ${url.pathname}`)).toEqual([
      // Products
      'GET /rest/6.0/products/',
      'GET /rest/6.0/products/sku-1/',
      'POST /rest/6.0/products/',
      'PUT /rest/6.0/products/sku-1/',
      'DELETE /rest/6.0/products/sku-1/',
      'GET /rest/6.0/products/search/',
      'GET /rest/6.0/products/sku-1/prices/',
      // Pricing
      'GET /rest/6.0/pricing/configurations/',
      'GET /rest/6.0/pricing/configurations/default/',
      'POST /rest/6.0/pricing/configurations/',
      'PUT /rest/6.0/pricing/configurations/default/',
      'DELETE /rest/6.0/pricing/configurations/default/',
      'POST /rest/6.0/products/sku-1/prices/',
      'GET /rest/6.0/products/sku-1/prices/',
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
      'POST /rest/6.0/subscriptions/sub-1/cancel/',
      'POST /rest/6.0/subscriptions/sub-1/disable/',
      'POST /rest/6.0/subscriptions/sub-1/enable/',
      'POST /rest/6.0/subscriptions/sub-1/change-plan/',
      'PUT /rest/6.0/subscriptions/sub-1/payment-information/',
      'GET /rest/6.0/subscriptions/search/',
      // Orders
      'GET /rest/6.0/orders/',
      'GET /rest/6.0/orders/order-1/',
      'POST /rest/6.0/orders/',
      'PUT /rest/6.0/orders/order-1/',
      'GET /rest/6.0/orders/search/',
      'POST /rest/6.0/orders/order-1/refund/',
      'GET /rest/6.0/orders/order-1/refund/',
      'POST /rest/6.0/orders/order-1/invoice/',
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
      'GET /rest/6.0/shipping/methods/',
      'GET /rest/6.0/shipping/methods/ground/',
      'GET /rest/6.0/shipping/fees/',
      'GET /rest/6.0/shipping/fees/fee-1/',
      'POST /rest/6.0/shipping/fees/',
      'PUT /rest/6.0/shipping/fees/fee-1/',
      'DELETE /rest/6.0/shipping/fees/fee-1/',
    ]);

    // Spot-check query serialization and body content
    expect(calls[0]?.url.searchParams.get('Limit')).toBe('10');
    const ordersPlaceBody = calls.find(
      (c) => c.method === 'POST' && c.url.pathname === '/rest/6.0/orders/',
    )?.body;
    expect(ordersPlaceBody && JSON.parse(ordersPlaceBody)).toEqual({ Currency: 'USD' });
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
