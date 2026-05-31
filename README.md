# @biggora/2checkout

[![npm version](https://img.shields.io/npm/v/@biggora/2checkout.svg)](https://www.npmjs.com/package/@biggora/2checkout)
[![Unit Tests](https://github.com/biggora/2checkout/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/biggora/2checkout/actions/workflows/unit-tests.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TypeScript SDK and optional NestJS adapter for the [2Checkout (Verifone) REST API 6.0](https://verifone.cloud/docs/2checkout/API-Integration/REST-6.0-Reference).

## Official Verifone docs

- REST API 6.0 reference: [verifone.cloud/docs/2checkout/API-Integration/REST-6.0-Reference](https://verifone.cloud/docs/2checkout/API-Integration/REST-6.0-Reference)
- IPN hash signature guide: [verifone.cloud/docs/2checkout/API-Integration/Webhooks/06Instant_Payment_Notification_%28IPN%29/Calculate-the-IPN-HASH-signature](https://verifone.cloud/docs/2checkout/API-Integration/Webhooks/06Instant_Payment_Notification_%28IPN%29/Calculate-the-IPN-HASH-signature)

## Features

- Full coverage of REST 6.0 resource groups: **products, product SKUs, product groups, price options, product pricing configurations, tax categories, customers, subscriptions, orders, refunds, checkout, payment methods, invoices, proposals, promotions, cross-sell, shipping**.
- HMAC `X-Avangate-Authentication` header with `sha256` (default) and `sha3-256` support — MD5 omitted (deprecated by 2Checkout).
- Sandbox mode auto-injects `demo: true` into mutating request bodies; toggle with a single option.
- IPN webhook parser (form-urlencoded + JSON) and timing-safe HMAC signature verifier.
- Optional NestJS module: `forRoot` / `forRootAsync`, `@InjectTwoCheckoutClient()` decorator, `TwoCheckoutIpnVerifier` service.
- ESM + CJS bundles, fully typed (TypeScript 5.x), zero runtime dependencies on Node ≥ 20.

## Install

```bash
npm install @biggora/2checkout
```

NestJS users additionally need `@nestjs/common`, `@nestjs/core`, `reflect-metadata`, and `rxjs` (already common Nest dependencies).

## Quick start

```ts
import { createTwoCheckoutClient } from '@biggora/2checkout';

const tc = createTwoCheckoutClient({
  merchantCode: process.env.TWOCHECKOUT_MERCHANT_CODE!,
  secretKey: process.env.TWOCHECKOUT_SECRET_KEY!,
  sandbox: true, // injects { demo: true } into POST/PUT/PATCH bodies
});

const order = await tc.orders.place({
  Currency: 'USD',
  Country: 'US',
  Items: [{ Code: 'sku-1', Quantity: 1 }],
  BillingDetails: { Email: 'buyer@example.com', FirstName: 'A', LastName: 'B' },
});

console.log(order.RefNo);
```

## Configuration

`createTwoCheckoutClient(options)` accepts:

| Option         | Type                              | Default                                  | Notes                                                                 |
| -------------- | --------------------------------- | ---------------------------------------- | --------------------------------------------------------------------- |
| `merchantCode` | `string`                          | —                                        | Required. Your 2Checkout merchant code.                               |
| `secretKey`    | `string`                          | —                                        | Required. The HMAC secret associated with your account.               |
| `baseUrl`      | `string`                          | `https://api.2checkout.com/rest/6.0/`    | Override for proxies/mocks. Trailing slash auto-added.                |
| `algorithm`    | `'sha256' \| 'sha3-256'`          | `'sha256'`                               | Signature algorithm for the `X-Avangate-Authentication` header.       |
| `sandbox`      | `boolean`                         | `false`                                  | When `true`, injects `demo: true` into POST/PUT/PATCH bodies.         |
| `timeoutMs`    | `number`                          | `30000`                                  | Request timeout. Aborts via `AbortController`.                        |
| `fetch`        | `typeof fetch`                    | `globalThis.fetch`                       | Inject a custom fetch (useful in tests).                              |
| `userAgent`    | `string`                          | unset                                    | Optional `User-Agent` header value.                                   |
| `now`          | `() => Date`                      | `() => new Date()`                       | Override the clock so signatures are deterministic in tests.          |

## Resources

Every resource exposes typed CRUD-style methods. All input bodies are `JsonRecord` for forward compatibility, all responses are typed shapes from `core/types.ts`.

### Products

```ts
await tc.products.list({ Limit: 20 });
await tc.products.get('sku-1');
await tc.products.create({ ProductName: 'Pro Plan', ProductCode: 'pro' });
await tc.products.update('pro', { Enabled: true });
await tc.products.enable('pro');
await tc.products.disable('pro');
await tc.products.search({ Name: 'plan' }); // alias for GET /products/ with query filters
await tc.products.listImages('pro');
await tc.products.getImage('pro', 'default');
await tc.products.listCrossSells('pro');
await tc.products.setUpgradeSchema('pro', { Upgrades: [/* ... */] });
await tc.products.listPriceOptions('pro');
await tc.products.listPromotions('pro');
await tc.products.getPromotion('pro', 'promo-1');
await tc.products.getPriceMatrix([
  { productCode: 'pro', pricingConfigurationCode: 'default' },
]);
```

### Product SKUs & Groups

```ts
await tc.productSku.generateSchema({ ProductCode: 'pro' });
await tc.productSku.search({ ProductCode: 'pro' });
await tc.productSku.delete({ ProductCode: 'pro', SKUCode: 'sku-a' });

await tc.productGroups.list();
await tc.productGroups.create({ Name: 'SaaS' });
await tc.productGroups.get('group-1');
await tc.productGroups.getForProduct('pro');
await tc.productGroups.assignToProduct('pro', 'group-1');
await tc.productGroups.unassignFromProduct('pro', 'group-1');
```

### Price Options & Pricing Configurations

```ts
await tc.priceOptions.list();
await tc.priceOptions.create({ Name: 'Seats' });
await tc.priceOptions.get('seats');
await tc.priceOptions.update('seats', { Name: 'Users' });
await tc.priceOptions.listForProduct('pro');

await tc.pricingConfigurations.list('pro');
await tc.pricingConfigurations.get('pro', 'default');
await tc.pricingConfigurations.create('pro', { Name: 'EU' });
await tc.pricingConfigurations.update('pro', 'default', { Default: true });
await tc.pricingConfigurations.updatePrices('pro', 'default', { Prices: [/* ... */] });
await tc.pricingConfigurations.assignPriceOption('pro', 'default', 'seats');
await tc.pricingConfigurations.unassignPriceOption('pro', 'default', 'seats');
await tc.pricingConfigurations.getSkuCodeByDetails('pro', 'default', { Country: 'US' });
await tc.pricingConfigurations.getSkuDetails('pro', 'default', 'sku-a');
```

`tc.pricing` remains as a deprecated alias for the product-scoped
`tc.pricingConfigurations` methods. It no longer calls the non-official
`/pricing/configurations/` routes.

### Tax Categories

```ts
await tc.taxCategories.list();
```

### Customers

```ts
await tc.customers.list();
await tc.customers.get(42);
await tc.customers.getByExternalReference('crm-42');
await tc.customers.create({ Email: 'buyer@example.com', FirstName: 'A', LastName: 'B' });
await tc.customers.update(42, { Email: 'new@example.com' });
await tc.customers.delete(42);
await tc.customers.search({ Email: 'buyer@example.com' });
```

### Subscriptions

```ts
await tc.subscriptions.list({ Status: 'ACTIVE' });
await tc.subscriptions.get('sub-1');
await tc.subscriptions.update('sub-1', { Trial: false });
await tc.subscriptions.disable('sub-1');
await tc.subscriptions.enable('sub-1');
await tc.subscriptions.getRenewal('sub-1');
await tc.subscriptions.renew('sub-1', { Currency: 'USD' });
await tc.subscriptions.setRenewalGracePeriod('sub-1', { Days: 7 });
await tc.subscriptions.convertTrial('sub-1', { Currency: 'USD', Days: 30 });
await tc.subscriptions.pause('sub-1', { PauseDate: '2026-06-01' });
await tc.subscriptions.unpause('sub-1');
await tc.subscriptions.copyPaymentInfo('sub-1', 'source-subscription-ref');
await tc.subscriptions.updatePaymentInfo('sub-1', {
  PaymentDetails: { Type: 'EES_TOKEN_PAYMENT', PaymentMethod: { EesToken: '...' } },
});
await tc.subscriptions.listUpgradeOptions('sub-1');
await tc.subscriptions.upgrade('sub-1', { ProductCode: 'plan-2', BillingCycle: 1 });
await tc.subscriptions.getUpgradePrice('sub-1', 'plan-2', 'USD', { Quantity: 2 });
await tc.subscriptions.listUsages('sub-1', { Limit: 20 });
await tc.subscriptions.saveUsages('sub-1', { Usages: [/* ... */] });
await tc.subscriptions.deleteUsages('sub-1', { UsageReference: 123 });
await tc.subscriptions.triggerUsageBilling('sub-1');
await tc.subscriptions.getSignOnUrl('sub-1', 'my_products', {
  Email: 'buyer@example.com',
  ValidityTime: 25,
});
```

The subscription resource follows the official REST 6.0 lifecycle paths, including
additional information, customer reassignment, end-user updates, history extension,
payment copy/update, renewal controls, upgrade pricing, scheduled product updates,
usage billing, subscription SSO, deal change/cancel, and churn-prevention campaigns.

Compatibility caveats:

- `subscriptions.search(query)` is kept as an alias for `list(query)` because the
  official search endpoint is `GET /subscriptions/`.
- `subscriptions.changePlan(reference, body)` is kept as an alias for
  `upgrade(reference, body)`, which calls `PUT /subscriptions/{reference}/upgrade/`.
- `subscriptions.cancel(reference)` is kept as an alias for `disable(reference)`,
  which calls `DELETE /subscriptions/{reference}/`.

### Checkout & Payment Methods

```ts
await tc.paymentMethods.createToken({ /* 2Pay.js / EES token payload */ });
await tc.paymentMethods.startApplePaySession({ /* Apple Pay validation payload */ });
await tc.paymentMethods.decryptApplePayData({ /* Apple Pay payment data */ });
await tc.paymentMethods.listIdealIssuerBanks();
await tc.paymentMethods.getPayPalExpressRedirectUrl({ ReturnUrl: 'https://shop.example/ok' });
await tc.paymentMethods.validatePreviousOrderReference('previous-order-ref');
await tc.paymentMethods.getInstallments({
  Amount: 100,
  Country: 'BR',
  Currency: 'BRL',
  CardBin: '411111',
});

await tc.cartSettings.listPaymentMethods({ CountryCode: 'US', PaymentMethod: 'CC' });
await tc.cartSettings.listCurrencies({ CountryCode: 'US', PaymentMethod: 'CC' });
await tc.cartSettings.listCountries({ Language: 'en' });
await tc.cartSettings.listCountryStates('US');
await tc.cartSettings.getDynamicProductSession({ Items: [/* ... */] });
await tc.cartSettings.getPrice({ Item: { Code: 'plan-pro', Quantity: 1 } });
await tc.cartSettings.getShippingPrice({ Country: 'US', Items: [/* ... */] });
```

### Orders, Refunds & Invoices

```ts
await tc.orders.list();
await tc.orders.get('order-1');
await tc.orders.place({ Currency: 'USD', Country: 'US', Items: [/* ... */] });
await tc.orders.update('order-1', { ExternalReference: 'crm-1' });
await tc.orders.refund('order-1', { Amount: 19.99, Reason: 'requested' });
await tc.orders.listRefunds('order-1');
await tc.orders.cancelRefund('order-1');
await tc.orders.cancel('purchase-order-ref');
await tc.orders.uploadForm('purchase-order-ref', { FileContent: 'base64' });
await tc.orders.getReferenceBySaleId(123);
await tc.orders.getReferenceByInvoiceId('INV-1');
await tc.orders.issueInvoice('order-1');

await tc.invoices.getOrderInvoice('order-1');
await tc.invoices.getRefundInvoice('order-1', 'refunds', 0);
```

### Proposals

```ts
await tc.proposals.list({ Name: 'renewal' });
await tc.proposals.create({ Name: 'Renewal proposal', Items: [/* ... */] });
await tc.proposals.get('proposal-1');
await tc.proposals.update('proposal-1', { Name: 'Updated proposal' });
await tc.proposals.executeAction('proposal-1', { Action: 'send' });
await tc.proposals.listHistory('proposal-1');
await tc.proposals.getHistoryVersion('proposal-1', 2);
```

### Promotions

```ts
await tc.promotions.list();
await tc.promotions.create({ Name: 'Spring sale', Type: 'PERCENT', Value: 10 });
await tc.promotions.addCoupons('promo-1', { Codes: ['SPRING10', 'SPRING20'] });
await tc.promotions.listCoupons('promo-1');
await tc.promotions.removeCoupon('promo-1', 'SPRING20');
```

### Cross-sell

```ts
await tc.crossSell.listCampaigns();
await tc.crossSell.createCampaign({ Name: 'Bundle deal' });
await tc.crossSell.updateTexts('camp-1', { Header: 'Add this and save 20%' });
```

### Shipping

```ts
await tc.shipping.listMethods();
await tc.shipping.listFees();
await tc.shipping.getFee('fee-1');
```

## Error handling

Every failure is normalized into a `TwoCheckoutApiError`:

```ts
import { TwoCheckoutApiError } from '@biggora/2checkout';

try {
  await tc.orders.place({ /* invalid */ });
} catch (error) {
  if (error instanceof TwoCheckoutApiError) {
    console.log(error.status);     // HTTP status (or undefined for network errors)
    console.log(error.code);       // 'request_timeout' | 'network_error' | 2Checkout error_code
    console.log(error.message);    // Human-readable message
    console.log(error.requestId);  // X-Avangate-Request-Id, when returned
    console.log(error.details);    // Raw error list / details payload
  }
  throw error;
}
```

Special `code` values:

- `request_timeout` — request aborted by the `timeoutMs` option.
- `network_error` — `fetch` threw before a response was received.

## IPN webhooks

2Checkout posts Instant Payment Notifications as `application/x-www-form-urlencoded` (default) or `application/json`. Use the bundled helpers to parse and verify:

```ts
import { parseIpnEvent, verifyIpnSignature } from '@biggora/2checkout';

const rawBody = req.rawBody; // Buffer or string captured before any body parser
const event = parseIpnEvent(rawBody, { contentType: req.headers['content-type'] });

const ok = verifyIpnSignature(rawBody, {
  secret: process.env.TWOCHECKOUT_SECRET_KEY!,
  // override if your IPN profile lists additional fields:
  // fieldOrder: ['IPN_PID', 'IPN_PNAME', 'IPN_DATE', 'REFNO', 'REFNOEXT', 'TOTAL', 'CURRENCY'],
});
if (!ok) {
  return res.status(403).send('invalid signature');
}

// Process event.IPN_PID / event.REFNO / etc.
```

The signature is reconstructed from `LEN(value) + value` concatenations per the [official IPN HASH guide](https://verifone.cloud/docs/2checkout/API-Integration/Webhooks/06Instant_Payment_Notification_%28IPN%29/Calculate-the-IPN-HASH-signature). UTF-8 byte length is used for `LEN`. The default `fieldOrder` covers the documented standard set; pass `fieldOrder` explicitly when your account is configured to send extra fields.

> **Express tip:** mount `express.raw({ type: '*/*' })` (or `app.use(express.urlencoded({ extended: false }))` plus `express.json()`) on the webhook route so `req.rawBody` (or the body buffer) is preserved for verification.

## NestJS usage

```ts
import { Module } from '@nestjs/common';
import { TwoCheckoutModule } from '@biggora/2checkout/nestjs';

@Module({
  imports: [
    TwoCheckoutModule.forRoot({
      merchantCode: process.env.TWOCHECKOUT_MERCHANT_CODE!,
      secretKey: process.env.TWOCHECKOUT_SECRET_KEY!,
      sandbox: process.env.NODE_ENV !== 'production',
    }),
  ],
})
export class BillingModule {}
```

Async configuration with the standard Nest pattern:

```ts
TwoCheckoutModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    merchantCode: config.getOrThrow('TWOCHECKOUT_MERCHANT_CODE'),
    secretKey: config.getOrThrow('TWOCHECKOUT_SECRET_KEY'),
    sandbox: config.get('NODE_ENV') !== 'production',
  }),
});
```

Inject the client and the IPN verifier:

```ts
import { Injectable } from '@nestjs/common';
import { InjectTwoCheckoutClient, TwoCheckoutIpnVerifier } from '@biggora/2checkout/nestjs';
import type { TwoCheckoutClient } from '@biggora/2checkout';

@Injectable()
export class BillingService {
  constructor(
    @InjectTwoCheckoutClient() private readonly tc: TwoCheckoutClient,
    private readonly ipn: TwoCheckoutIpnVerifier,
  ) {}

  async placeOrder() {
    return this.tc.orders.place({ Currency: 'USD', Items: [/* ... */] });
  }

  handleWebhook(rawBody: Buffer, contentType: string) {
    if (!this.ipn.verify(rawBody)) {
      throw new Error('invalid IPN signature');
    }
    return this.ipn.parse(rawBody, contentType);
  }
}
```

## Sandbox & testing

- Set `sandbox: true` and 2Checkout will route the request as a demo transaction; the module automatically appends `demo: true` to POST/PUT/PATCH bodies. For specific endpoints that reject extra fields, pass `skipDemoInjection: true` on the per-request `client.request(...)` call.
- Inject a custom `fetch` to mock the HTTP layer in unit tests (see `test/client-core.test.ts`).
- Inject a custom `now` so the HMAC header is deterministic in golden tests.

## Scripts

```bash
npm test
npm run typecheck
npm run build
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution workflow, local verification steps, and PR expectations.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history.

## License

MIT © Aleksejs Gordejevs
