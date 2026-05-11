# @biggora/2checkout

[![npm version](https://img.shields.io/npm/v/@biggora/2checkout.svg)](https://www.npmjs.com/package/@biggora/2checkout)
[![Unit Tests](https://github.com/biggora/2checkout/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/biggora/2checkout/actions/workflows/unit-tests.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TypeScript SDK and optional NestJS adapter for the [2Checkout (Verifone) REST API 6.0](https://verifone.cloud/docs/2checkout/API-Integration/REST-6.0-Reference).

## Features

- Full coverage of REST 6.0 resource groups: **products, pricing, customers, subscriptions, orders, refunds, promotions, cross-sell, shipping**.
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
await tc.products.delete('pro');
await tc.products.search({ Search: 'plan' });
await tc.products.listPriceOptions('pro');
```

### Pricing

```ts
await tc.pricing.listConfigurations();
await tc.pricing.getConfiguration('default');
await tc.pricing.createConfiguration({ Name: 'EU' });
await tc.pricing.updateConfiguration('default', { Default: true });
await tc.pricing.deleteConfiguration('legacy');
await tc.pricing.savePrices('pro', { Prices: [/* ... */] });
await tc.pricing.getPrices('pro');
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
await tc.subscriptions.cancel('sub-1', { Reason: 'churn', Comment: 'user request' });
await tc.subscriptions.disable('sub-1');
await tc.subscriptions.enable('sub-1');
await tc.subscriptions.changePlan('sub-1', { ProductCode: 'plan-2', BillingCycle: 1 });
await tc.subscriptions.updatePaymentInfo('sub-1', { Token: '...' });
```

### Orders & Refunds

```ts
await tc.orders.list();
await tc.orders.get('order-1');
await tc.orders.place({ Currency: 'USD', Country: 'US', Items: [/* ... */] });
await tc.orders.update('order-1', { ExternalReference: 'crm-1' });
await tc.orders.refund('order-1', { Amount: 19.99, Reason: 'requested' });
await tc.orders.listRefunds('order-1');
await tc.orders.issueInvoice('order-1');
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
await tc.shipping.createFee({ Name: 'EU shipping', Amount: 5, Currency: 'EUR' });
await tc.shipping.updateFee('fee-1', { Amount: 7 });
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

## License

MIT © Aleksejs Gordejevs
