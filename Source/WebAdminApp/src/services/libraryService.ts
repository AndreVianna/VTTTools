import apiClient from '@api/client';

const API_BASE = '/api/admin/library';

export type ContentType = 'world' | 'campaign' | 'adventure' | 'encounter' | 'asset';
export type OwnerType = 'master' | 'user' | 'all';
export type TransferAction = 'take' | 'grant';

export interface LibrarySearchRequest {
  skip?: number;
  take?: number;
  search?: string;
  ownerId?: string;
  ownerType?: OwnerType;
  isPublished?: boolean;
  isPublic?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  kind?: string;
  category?: string;
  type?: string;
  subtype?: string;
}

export interface LibraryContentResponse {
  id: string;
  ownerId: string;
  ownerName?: string;
  name: string;
  description: string;
  isPublished: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LibraryContentSearchResponse {
  content: LibraryContentResponse[];
  totalCount: number;
  hasMore: boolean;
}

export interface LibraryConfigResponse {
  masterUserId: string;
}

export interface CreateContentRequest {
  name: string;
  description?: string;
}

export interface UpdateContentRequest {
  name?: string;
  description?: string;
  isPublished?: boolean;
  isPublic?: boolean;
}

export interface TransferOwnershipRequest {
  action: TransferAction;
  targetUserId?: string;
}

export interface AssetTaxonomyNode {
  id: string;
  label: string;
  count: number;
  path: string[];
  children: AssetTaxonomyNode[];
}

function buildSearchParams(request: LibrarySearchRequest): URLSearchParams {
  const params = new URLSearchParams();

  if (request.skip !== undefined) params.append('skip', request.skip.toString());
  if (request.take !== undefined) params.append('take', request.take.toString());
  if (request.search) params.append('search', request.search);
  if (request.ownerId) params.append('ownerId', request.ownerId);
  if (request.ownerType) params.append('ownerType', request.ownerType);
  if (request.isPublished !== undefined) params.append('isPublished', request.isPublished.toString());
  if (request.isPublic !== undefined) params.append('isPublic', request.isPublic.toString());
  if (request.sortBy) params.append('sortBy', request.sortBy);
  if (request.sortOrder) params.append('sortOrder', request.sortOrder);
  if (request.kind) params.append('kind', request.kind);
  if (request.category) params.append('category', request.category);
  if (request.type) params.append('type', request.type);
  if (request.subtype) params.append('subtype', request.subtype);

  return params;
}

export const libraryService = {
  async getConfig(): Promise<LibraryConfigResponse> {
    const response = await apiClient.get<LibraryConfigResponse>(`${API_BASE}/config`);
    return response.data;
  },

  async searchWorlds(request: LibrarySearchRequest): Promise<LibraryContentSearchResponse> {
    const params = buildSearchParams(request);
    const response = await apiClient.get<LibraryContentSearchResponse>(
      `${API_BASE}/worlds?${params.toString()}`
    );
    return response.data;
  },

  async getWorldById(id: string): Promise<LibraryContentResponse> {
    const response = await apiClient.get<LibraryContentResponse>(`${API_BASE}/worlds/${id}`);
    return response.data;
  },

  async createWorld(request: CreateContentRequest): Promise<LibraryContentResponse> {
    const response = await apiClient.post<LibraryContentResponse>(`${API_BASE}/worlds`, request);
    return response.data;
  },

  async updateWorld(id: string, request: UpdateContentRequest): Promise<LibraryContentResponse> {
    const response = await apiClient.patch<LibraryContentResponse>(`${API_BASE}/worlds/${id}`, request);
    return response.data;
  },

  async deleteWorld(id: string): Promise<void> {
    await apiClient.delete(`${API_BASE}/worlds/${id}`);
  },

  async transferWorldOwnership(id: string, request: TransferOwnershipRequest): Promise<void> {
    await apiClient.post(`${API_BASE}/worlds/${id}/transfer`, request);
  },

  async searchCampaigns(request: LibrarySearchRequest): Promise<LibraryContentSearchResponse> {
    const params = buildSearchParams(request);
    const response = await apiClient.get<LibraryContentSearchResponse>(
      `${API_BASE}/campaigns?${params.toString()}`
    );
    return response.data;
  },

  async getCampaignById(id: string): Promise<LibraryContentResponse> {
    const response = await apiClient.get<LibraryContentResponse>(`${API_BASE}/campaigns/${id}`);
    return response.data;
  },

  async createCampaign(request: CreateContentRequest): Promise<LibraryContentResponse> {
    const response = await apiClient.post<LibraryContentResponse>(`${API_BASE}/campaigns`, request);
    return response.data;
  },

  async updateCampaign(id: string, request: UpdateContentRequest): Promise<LibraryContentResponse> {
    const response = await apiClient.patch<LibraryContentResponse>(`${API_BASE}/campaigns/${id}`, request);
    return response.data;
  },

  async deleteCampaign(id: string): Promise<void> {
    await apiClient.delete(`${API_BASE}/campaigns/${id}`);
  },

  async transferCampaignOwnership(id: string, request: TransferOwnershipRequest): Promise<void> {
    await apiClient.post(`${API_BASE}/campaigns/${id}/transfer`, request);
  },

  async searchAdventures(request: LibrarySearchRequest): Promise<LibraryContentSearchResponse> {
    const params = buildSearchParams(request);
    const response = await apiClient.get<LibraryContentSearchResponse>(
      `${API_BASE}/adventures?${params.toString()}`
    );
    return response.data;
  },

  async getAdventureById(id: string): Promise<LibraryContentResponse> {
    const response = await apiClient.get<LibraryContentResponse>(`${API_BASE}/adventures/${id}`);
    return response.data;
  },

  async createAdventure(request: CreateContentRequest): Promise<LibraryContentResponse> {
    const response = await apiClient.post<LibraryContentResponse>(`${API_BASE}/adventures`, request);
    return response.data;
  },

  async updateAdventure(id: string, request: UpdateContentRequest): Promise<LibraryContentResponse> {
    const response = await apiClient.patch<LibraryContentResponse>(`${API_BASE}/adventures/${id}`, request);
    return response.data;
  },

  async deleteAdventure(id: string): Promise<void> {
    await apiClient.delete(`${API_BASE}/adventures/${id}`);
  },

  async transferAdventureOwnership(id: string, request: TransferOwnershipRequest): Promise<void> {
    await apiClient.post(`${API_BASE}/adventures/${id}/transfer`, request);
  },

  async searchEncounters(request: LibrarySearchRequest): Promise<LibraryContentSearchResponse> {
    const params = buildSearchParams(request);
    const response = await apiClient.get<LibraryContentSearchResponse>(
      `${API_BASE}/encounters?${params.toString()}`
    );
    return response.data;
  },

  async getEncounterById(id: string): Promise<LibraryContentResponse> {
    const response = await apiClient.get<LibraryContentResponse>(`${API_BASE}/encounters/${id}`);
    return response.data;
  },

  async createEncounter(request: CreateContentRequest): Promise<LibraryContentResponse> {
    const response = await apiClient.post<LibraryContentResponse>(`${API_BASE}/encounters`, request);
    return response.data;
  },

  async updateEncounter(id: string, request: UpdateContentRequest): Promise<LibraryContentResponse> {
    const response = await apiClient.patch<LibraryContentResponse>(`${API_BASE}/encounters/${id}`, request);
    return response.data;
  },

  async deleteEncounter(id: string): Promise<void> {
    await apiClient.delete(`${API_BASE}/encounters/${id}`);
  },

  async transferEncounterOwnership(id: string, request: TransferOwnershipRequest): Promise<void> {
    await apiClient.post(`${API_BASE}/encounters/${id}/transfer`, request);
  },

  async searchAssets(request: LibrarySearchRequest): Promise<LibraryContentSearchResponse> {
    const params = buildSearchParams(request);
    const response = await apiClient.get<LibraryContentSearchResponse>(
      `${API_BASE}/assets?${params.toString()}`
    );
    return response.data;
  },

  async getAssetById(id: string): Promise<LibraryContentResponse> {
    const response = await apiClient.get<LibraryContentResponse>(`${API_BASE}/assets/${id}`);
    return response.data;
  },

  async createAsset(request: CreateContentRequest): Promise<LibraryContentResponse> {
    const response = await apiClient.post<LibraryContentResponse>(`${API_BASE}/assets`, request);
    return response.data;
  },

  async updateAsset(id: string, request: UpdateContentRequest): Promise<LibraryContentResponse> {
    const response = await apiClient.patch<LibraryContentResponse>(`${API_BASE}/assets/${id}`, request);
    return response.data;
  },

  async deleteAsset(id: string): Promise<void> {
    await apiClient.delete(`${API_BASE}/assets/${id}`);
  },

  async transferAssetOwnership(id: string, request: TransferOwnershipRequest): Promise<void> {
    await apiClient.post(`${API_BASE}/assets/${id}/transfer`, request);
  },

  async getCampaignsByWorldId(worldId: string): Promise<LibraryContentResponse[]> {
    const response = await apiClient.get<LibraryContentResponse[]>(`${API_BASE}/worlds/${worldId}/campaigns`);
    return response.data;
  },

  async createCampaignForWorld(worldId: string, request: CreateContentRequest): Promise<LibraryContentResponse> {
    const response = await apiClient.post<LibraryContentResponse>(
      `${API_BASE}/worlds/${worldId}/campaigns`,
      request
    );
    return response.data;
  },

  async cloneCampaignInWorld(worldId: string, campaignId: string, name?: string): Promise<LibraryContentResponse> {
    const response = await apiClient.post<LibraryContentResponse>(
      `${API_BASE}/worlds/${worldId}/campaigns/${campaignId}/clone`,
      { name }
    );
    return response.data;
  },

  async removeCampaignFromWorld(worldId: string, campaignId: string): Promise<void> {
    await apiClient.delete(`${API_BASE}/worlds/${worldId}/campaigns/${campaignId}`);
  },

  async getAdventuresByCampaignId(campaignId: string): Promise<LibraryContentResponse[]> {
    const response = await apiClient.get<LibraryContentResponse[]>(`${API_BASE}/campaigns/${campaignId}/adventures`);
    return response.data;
  },

  async createAdventureForCampaign(campaignId: string, request: CreateContentRequest): Promise<LibraryContentResponse> {
    const response = await apiClient.post<LibraryContentResponse>(
      `${API_BASE}/campaigns/${campaignId}/adventures`,
      request
    );
    return response.data;
  },

  async cloneAdventureInCampaign(campaignId: string, adventureId: string, name?: string): Promise<LibraryContentResponse> {
    const response = await apiClient.post<LibraryContentResponse>(
      `${API_BASE}/campaigns/${campaignId}/adventures/${adventureId}/clone`,
      { name }
    );
    return response.data;
  },

  async removeAdventureFromCampaign(campaignId: string, adventureId: string): Promise<void> {
    await apiClient.delete(`${API_BASE}/campaigns/${campaignId}/adventures/${adventureId}`);
  },

  async getEncountersByAdventureId(adventureId: string): Promise<LibraryContentResponse[]> {
    const response = await apiClient.get<LibraryContentResponse[]>(`${API_BASE}/adventures/${adventureId}/encounters`);
    return response.data;
  },

  async createEncounterForAdventure(adventureId: string, request: CreateContentRequest): Promise<LibraryContentResponse> {
    const response = await apiClient.post<LibraryContentResponse>(
      `${API_BASE}/adventures/${adventureId}/encounters`,
      request
    );
    return response.data;
  },

  async cloneEncounterInAdventure(adventureId: string, encounterId: string, name?: string): Promise<LibraryContentResponse> {
    const response = await apiClient.post<LibraryContentResponse>(
      `${API_BASE}/adventures/${adventureId}/encounters/${encounterId}/clone`,
      { name }
    );
    return response.data;
  },

  async removeEncounterFromAdventure(adventureId: string, encounterId: string): Promise<void> {
    await apiClient.delete(`${API_BASE}/adventures/${adventureId}/encounters/${encounterId}`);
  },

  async searchContent(
    contentType: ContentType,
    request: LibrarySearchRequest
  ): Promise<LibraryContentSearchResponse> {
    const endpointMap: Record<ContentType, string> = {
      world: 'worlds',
      campaign: 'campaigns',
      adventure: 'adventures',
      encounter: 'encounters',
      asset: 'assets',
    };

    const params = buildSearchParams(request);
    const response = await apiClient.get<LibraryContentSearchResponse>(
      `${API_BASE}/${endpointMap[contentType]}?${params.toString()}`
    );
    return response.data;
  },

  async getContentById(contentType: ContentType, id: string): Promise<LibraryContentResponse> {
    const endpointMap: Record<ContentType, string> = {
      world: 'worlds',
      campaign: 'campaigns',
      adventure: 'adventures',
      encounter: 'encounters',
      asset: 'assets',
    };

    const response = await apiClient.get<LibraryContentResponse>(
      `${API_BASE}/${endpointMap[contentType]}/${id}`
    );
    return response.data;
  },

  async updateContent(
    contentType: ContentType,
    id: string,
    request: UpdateContentRequest
  ): Promise<LibraryContentResponse> {
    const endpointMap: Record<ContentType, string> = {
      world: 'worlds',
      campaign: 'campaigns',
      adventure: 'adventures',
      encounter: 'encounters',
      asset: 'assets',
    };

    const response = await apiClient.patch<LibraryContentResponse>(
      `${API_BASE}/${endpointMap[contentType]}/${id}`,
      request
    );
    return response.data;
  },

  async deleteContent(contentType: ContentType, id: string): Promise<void> {
    const endpointMap: Record<ContentType, string> = {
      world: 'worlds',
      campaign: 'campaigns',
      adventure: 'adventures',
      encounter: 'encounters',
      asset: 'assets',
    };

    await apiClient.delete(`${API_BASE}/${endpointMap[contentType]}/${id}`);
  },

  async transferContentOwnership(
    contentType: ContentType,
    id: string,
    request: TransferOwnershipRequest
  ): Promise<void> {
    const endpointMap: Record<ContentType, string> = {
      world: 'worlds',
      campaign: 'campaigns',
      adventure: 'adventures',
      encounter: 'encounters',
      asset: 'assets',
    };

    await apiClient.post(`${API_BASE}/${endpointMap[contentType]}/${id}/transfer`, request);
  },

  async getAssetTaxonomy(): Promise<AssetTaxonomyNode[]> {
    const response = await apiClient.get<AssetTaxonomyNode[]>(`${API_BASE}/assets/taxonomy`);
    return response.data;
  },
};
