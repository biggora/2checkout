import type { HttpClient } from '../core/http-client.js';
import type { JsonRecord } from '../core/types.js';

export type InvoiceType = 'sale' | 'refunds' | string;

export class InvoicesResource {
  constructor(private readonly httpClient: HttpClient) {}

  getOrderInvoice(orderReference: string): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'GET',
      path: `invoices/${encodeURIComponent(orderReference)}/`,
    });
  }

  getRefundInvoice(
    orderReference: string,
    type: InvoiceType,
    count: string | number,
  ): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'GET',
      path:
        `invoices/${encodeURIComponent(orderReference)}/` +
        `${encodeURIComponent(type)}/${encodeURIComponent(String(count))}/`,
    });
  }
}
