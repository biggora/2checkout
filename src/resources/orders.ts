import type { HttpClient } from '../core/http-client.js';
import type {
  JsonRecord,
  JsonValue,
  QueryRecord,
  TwoCheckoutList,
  TwoCheckoutOrder,
  TwoCheckoutRefund,
} from '../core/types.js';

export type PlaceOrderInput = JsonRecord;
export type UpdateOrderInput = JsonRecord;
export type RefundOrderInput = JsonRecord;
export type UploadOrderFormInput = JsonRecord;

export class OrdersResource {
  constructor(private readonly httpClient: HttpClient) {}

  list(query?: QueryRecord): Promise<TwoCheckoutList<TwoCheckoutOrder>> {
    return this.httpClient.request({
      method: 'GET',
      path: 'orders/',
      query,
    });
  }

  get(refNo: string): Promise<TwoCheckoutOrder> {
    return this.httpClient.request({
      method: 'GET',
      path: `orders/${encodeURIComponent(refNo)}/`,
    });
  }

  place(body: PlaceOrderInput): Promise<TwoCheckoutOrder> {
    return this.httpClient.request({
      method: 'POST',
      path: 'orders/',
      body,
    });
  }

  update(refNo: string, body: UpdateOrderInput): Promise<TwoCheckoutOrder> {
    return this.httpClient.request({
      method: 'PUT',
      path: `orders/${encodeURIComponent(refNo)}/`,
      body,
    });
  }

  search(query: QueryRecord): Promise<TwoCheckoutList<TwoCheckoutOrder>> {
    return this.httpClient.request({
      method: 'GET',
      path: 'orders/search/',
      query,
    });
  }

  refund(refNo: string, body: RefundOrderInput): Promise<TwoCheckoutRefund> {
    return this.httpClient.request({
      method: 'POST',
      path: `orders/${encodeURIComponent(refNo)}/refund/`,
      body,
    });
  }

  listRefunds(refNo: string): Promise<TwoCheckoutList<TwoCheckoutRefund>> {
    return this.httpClient.request({
      method: 'GET',
      path: `orders/${encodeURIComponent(refNo)}/refund/`,
    });
  }

  cancelRefund(refNo: string): Promise<JsonValue> {
    return this.httpClient.request({
      method: 'DELETE',
      path: `orders/${encodeURIComponent(refNo)}/refund/`,
    });
  }

  cancel(orderReference: string): Promise<JsonValue> {
    return this.httpClient.request({
      method: 'DELETE',
      path: `orders/${encodeURIComponent(orderReference)}/`,
    });
  }

  uploadForm(orderReference: string, body: UploadOrderFormInput): Promise<JsonValue> {
    return this.httpClient.request({
      method: 'POST',
      path: `orders/${encodeURIComponent(orderReference)}/upload`,
      body,
    });
  }

  getReferenceBySaleId(saleId: string | number): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'GET',
      path: 'orders/0/sale/',
      query: { SaleId: saleId },
    });
  }

  getReferenceByInvoiceId(invoiceId: string): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'GET',
      path: 'orders/0/invoice/',
      query: { InvoiceId: invoiceId },
    });
  }

  issueInvoice(refNo: string, body?: JsonRecord): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'POST',
      path: `orders/${encodeURIComponent(refNo)}/invoice/`,
      body,
    });
  }
}
