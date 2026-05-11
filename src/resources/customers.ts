import type { HttpClient } from '../core/http-client.js';
import type {
  JsonRecord,
  QueryRecord,
  TwoCheckoutCustomer,
  TwoCheckoutList,
} from '../core/types.js';

export type CreateCustomerInput = JsonRecord;
export type UpdateCustomerInput = JsonRecord;

export class CustomersResource {
  constructor(private readonly httpClient: HttpClient) {}

  list(query?: QueryRecord): Promise<TwoCheckoutList<TwoCheckoutCustomer>> {
    return this.httpClient.request({
      method: 'GET',
      path: 'customers/',
      query,
    });
  }

  get(reference: string | number): Promise<TwoCheckoutCustomer> {
    return this.httpClient.request({
      method: 'GET',
      path: `customers/${encodeURIComponent(String(reference))}/`,
    });
  }

  getByExternalReference(reference: string): Promise<TwoCheckoutCustomer> {
    return this.httpClient.request({
      method: 'GET',
      path: `customers/external/${encodeURIComponent(reference)}/`,
    });
  }

  create(body: CreateCustomerInput): Promise<TwoCheckoutCustomer> {
    return this.httpClient.request({
      method: 'POST',
      path: 'customers/',
      body,
    });
  }

  update(reference: string | number, body: UpdateCustomerInput): Promise<TwoCheckoutCustomer> {
    return this.httpClient.request({
      method: 'PUT',
      path: `customers/${encodeURIComponent(String(reference))}/`,
      body,
    });
  }

  delete(reference: string | number): Promise<void> {
    return this.httpClient.request({
      method: 'DELETE',
      path: `customers/${encodeURIComponent(String(reference))}/`,
    });
  }

  search(query: QueryRecord): Promise<TwoCheckoutList<TwoCheckoutCustomer>> {
    return this.httpClient.request({
      method: 'GET',
      path: 'customers/search/',
      query,
    });
  }
}
