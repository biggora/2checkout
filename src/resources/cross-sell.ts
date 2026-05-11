import type { HttpClient } from '../core/http-client.js';
import type {
  JsonRecord,
  QueryRecord,
  TwoCheckoutCrossSellCampaign,
  TwoCheckoutList,
} from '../core/types.js';

export type CreateCrossSellCampaignInput = JsonRecord;
export type UpdateCrossSellCampaignInput = JsonRecord;
export type UpdateCrossSellTextsInput = JsonRecord;

export class CrossSellResource {
  constructor(private readonly httpClient: HttpClient) {}

  listCampaigns(query?: QueryRecord): Promise<TwoCheckoutList<TwoCheckoutCrossSellCampaign>> {
    return this.httpClient.request({
      method: 'GET',
      path: 'crosssell/campaigns/',
      query,
    });
  }

  getCampaign(code: string): Promise<TwoCheckoutCrossSellCampaign> {
    return this.httpClient.request({
      method: 'GET',
      path: `crosssell/campaigns/${encodeURIComponent(code)}/`,
    });
  }

  createCampaign(body: CreateCrossSellCampaignInput): Promise<TwoCheckoutCrossSellCampaign> {
    return this.httpClient.request({
      method: 'POST',
      path: 'crosssell/campaigns/',
      body,
    });
  }

  updateCampaign(
    code: string,
    body: UpdateCrossSellCampaignInput,
  ): Promise<TwoCheckoutCrossSellCampaign> {
    return this.httpClient.request({
      method: 'PUT',
      path: `crosssell/campaigns/${encodeURIComponent(code)}/`,
      body,
    });
  }

  deleteCampaign(code: string): Promise<void> {
    return this.httpClient.request({
      method: 'DELETE',
      path: `crosssell/campaigns/${encodeURIComponent(code)}/`,
    });
  }

  listTexts(code: string): Promise<TwoCheckoutList<JsonRecord>> {
    return this.httpClient.request({
      method: 'GET',
      path: `crosssell/campaigns/${encodeURIComponent(code)}/texts/`,
    });
  }

  updateTexts(code: string, body: UpdateCrossSellTextsInput): Promise<JsonRecord> {
    return this.httpClient.request({
      method: 'PUT',
      path: `crosssell/campaigns/${encodeURIComponent(code)}/texts/`,
      body,
    });
  }
}
