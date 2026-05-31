import type { HttpClient } from '../core/http-client.js';
import type { JsonRecord, JsonValue, QueryRecord, TwoCheckoutList } from '../core/types.js';

export type CreateProposalInput = JsonRecord;
export type UpdateProposalInput = JsonRecord;
export type ExecuteProposalActionInput = JsonRecord;

export class ProposalsResource {
  constructor(private readonly httpClient: HttpClient) {}

  list(query?: QueryRecord): Promise<TwoCheckoutList<JsonRecord>> {
    return this.httpClient.request({
      method: 'GET',
      path: 'proposals/',
      query,
    });
  }

  create(body: CreateProposalInput): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'POST',
      path: 'proposals/',
      body,
    });
  }

  get(proposalId: string): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'GET',
      path: `proposals/${encodeURIComponent(proposalId)}`,
    });
  }

  update(proposalId: string, body: UpdateProposalInput): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'PATCH',
      path: `proposals/${encodeURIComponent(proposalId)}`,
      body,
    });
  }

  executeAction(proposalId: string, body: ExecuteProposalActionInput): Promise<JsonValue> {
    return this.httpClient.request({
      method: 'POST',
      path: `proposals/${encodeURIComponent(proposalId)}/action`,
      body,
    });
  }

  listHistory(proposalId: string, query?: QueryRecord): Promise<TwoCheckoutList<JsonRecord>> {
    return this.httpClient.request({
      method: 'GET',
      path: `proposals/${encodeURIComponent(proposalId)}/history`,
      query,
    });
  }

  getHistoryVersion(proposalId: string, versionNumber: string | number): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'GET',
      path:
        `proposals/${encodeURIComponent(proposalId)}/history/` +
        `${encodeURIComponent(String(versionNumber))}`,
    });
  }
}
