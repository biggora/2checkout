export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonRecord = Record<string, JsonValue>;

export type QueryPrimitive = string | number | boolean;
export type QueryValue = QueryPrimitive | QueryPrimitive[] | null | undefined;
export type QueryRecord = Record<string, QueryValue>;

export type TwoCheckoutAlgorithm = 'sha256' | 'sha3-256';

export type TwoCheckoutPagination = {
  Page?: number;
  Limit?: number;
  Count?: number;
};

export type TwoCheckoutList<TItem = JsonRecord> = {
  Items?: TItem[];
  data?: TItem[];
  Pagination?: TwoCheckoutPagination;
  [key: string]: unknown;
};

export type TwoCheckoutMoney = {
  Amount: number;
  Currency: string;
};

export type TwoCheckoutProduct = JsonRecord & {
  ProductCode?: string;
  ProductName?: string;
  ProductType?: string;
  Enabled?: boolean;
  Prices?: JsonRecord[];
  PricingConfigurations?: JsonRecord[];
};

export type TwoCheckoutPricingConfiguration = JsonRecord & {
  Name?: string;
  Code?: string;
  Default?: boolean;
  BillingCountries?: string[];
  PriceType?: string;
};

export type TwoCheckoutCustomer = JsonRecord & {
  CustomerReference?: number | string;
  ExternalCustomerReference?: string;
  Email?: string;
  FirstName?: string;
  LastName?: string;
  Enabled?: boolean;
};

export type TwoCheckoutSubscriptionStatus =
  | 'ACTIVE'
  | 'CANCELED'
  | 'EXPIRED'
  | 'TRIAL'
  | 'PASTDUE'
  | 'DISABLED'
  | string;

export type TwoCheckoutSubscription = JsonRecord & {
  SubscriptionReference?: string;
  Status?: TwoCheckoutSubscriptionStatus;
  CustomerReference?: number | string;
  ProductCode?: string;
  ProductName?: string;
  StartDate?: string;
  ExpirationDate?: string;
};

export type TwoCheckoutOrderStatus =
  | 'AUTHRECEIVED'
  | 'PENDING'
  | 'PURCHASEPENDING'
  | 'COMPLETE'
  | 'REFUND'
  | 'CANCELED'
  | string;

export type TwoCheckoutOrder = JsonRecord & {
  RefNo?: string;
  ExternalReference?: string;
  Status?: TwoCheckoutOrderStatus;
  Currency?: string;
  Items?: JsonRecord[];
  BillingDetails?: JsonRecord;
};

export type TwoCheckoutRefund = JsonRecord & {
  RefNo?: string;
  Amount?: number;
  Currency?: string;
  Reason?: string;
  Comment?: string;
};

export type TwoCheckoutPromotion = JsonRecord & {
  PromotionCode?: string;
  Name?: string;
  Type?: string;
  Enabled?: boolean;
};

export type TwoCheckoutCoupon = JsonRecord & {
  Code?: string;
  Type?: string;
};

export type TwoCheckoutCrossSellCampaign = JsonRecord & {
  CampaignCode?: string;
  Name?: string;
  Enabled?: boolean;
};

export type TwoCheckoutShippingMethod = JsonRecord & {
  Code?: string;
  Name?: string;
  Enabled?: boolean;
};

export type TwoCheckoutShippingFee = JsonRecord & {
  Code?: string;
  Name?: string;
  Amount?: number;
  Currency?: string;
};

export type TwoCheckoutIpnEvent<TPayload = JsonRecord> = TPayload & {
  IPN_PID?: string[];
  IPN_PNAME?: string[];
  IPN_DATE?: string;
  REFNO?: string;
  REFNOEXT?: string;
  HASH?: string;
  HASH_ALGO?: string;
  [key: string]: unknown;
};
