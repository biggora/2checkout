# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-06-30

### Fixed

- Overrode the esbuild advisory path used by the SDK toolchain.

## [1.1.0] - 2026-06-02

### Added

- Coverage for subscription lifecycle operations and expanded subscription query handling (including SSO integration support).
- New API resources for catalog/checkout gaps, including checkout, customers, invoices, tax categories, pricing configurations, and product price matrices.
- Expanded resource surface for cross-sell and shipping flows.

### Fixed

- Consistent request signing and SDK parity improvements across core auth/IPN paths.
- Broader nested query and pagination handling for customer/subscription/order data.

## [1.0.0] - 2026-05-30

### Added

- Initial public release of the TypeScript 2Checkout SDK and optional NestJS adapter.
- Typed resource clients for products, pricing, customers, subscriptions, orders, refunds, promotions, cross-sell, and shipping.
- HMAC request signing, sandbox demo-injection support, and IPN parsing/signature verification helpers.
