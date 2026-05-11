import type { HttpClient } from '../core/http-client.js';
import type {
  JsonRecord,
  QueryRecord,
  TwoCheckoutCoupon,
  TwoCheckoutList,
  TwoCheckoutPromotion,
} from '../core/types.js';

export type CreatePromotionInput = JsonRecord;
export type UpdatePromotionInput = JsonRecord;
export type AddCouponsInput = JsonRecord;

export class PromotionsResource {
  constructor(private readonly httpClient: HttpClient) {}

  list(query?: QueryRecord): Promise<TwoCheckoutList<TwoCheckoutPromotion>> {
    return this.httpClient.request({
      method: 'GET',
      path: 'promotions/',
      query,
    });
  }

  get(code: string): Promise<TwoCheckoutPromotion> {
    return this.httpClient.request({
      method: 'GET',
      path: `promotions/${encodeURIComponent(code)}/`,
    });
  }

  create(body: CreatePromotionInput): Promise<TwoCheckoutPromotion> {
    return this.httpClient.request({
      method: 'POST',
      path: 'promotions/',
      body,
    });
  }

  update(code: string, body: UpdatePromotionInput): Promise<TwoCheckoutPromotion> {
    return this.httpClient.request({
      method: 'PUT',
      path: `promotions/${encodeURIComponent(code)}/`,
      body,
    });
  }

  delete(code: string): Promise<void> {
    return this.httpClient.request({
      method: 'DELETE',
      path: `promotions/${encodeURIComponent(code)}/`,
    });
  }

  listCoupons(code: string): Promise<TwoCheckoutList<TwoCheckoutCoupon>> {
    return this.httpClient.request({
      method: 'GET',
      path: `promotions/${encodeURIComponent(code)}/coupons/`,
    });
  }

  addCoupons(code: string, body: AddCouponsInput): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'POST',
      path: `promotions/${encodeURIComponent(code)}/coupons/`,
      body,
    });
  }

  removeCoupon(code: string, couponCode: string): Promise<void> {
    return this.httpClient.request({
      method: 'DELETE',
      path: `promotions/${encodeURIComponent(code)}/coupons/${encodeURIComponent(couponCode)}/`,
    });
  }
}
