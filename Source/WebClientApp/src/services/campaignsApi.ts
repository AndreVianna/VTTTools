import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  Adventure,
  Campaign,
  CreateAdventureRequest,
  CreateCampaignRequest,
  UpdateCampaignRequest,
} from '@/types/domain';
import { createEnhancedBaseQuery } from './enhancedBaseQuery';

export const campaignsApi = createApi({
  reducerPath: 'campaignsApi',
  baseQuery: createEnhancedBaseQuery('/api/campaigns'),
  tagTypes: ['Campaign', 'CampaignAdventures'],
  endpoints: (builder) => ({
    getCampaigns: builder.query<Campaign[], void>({
      query: () => '',
      providesTags: ['Campaign'],
    }),

    getCampaign: builder.query<Campaign, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Campaign', id }],
    }),

    createCampaign: builder.mutation<Campaign, CreateCampaignRequest>({
      query: (request) => ({
        url: '',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Campaign'],
    }),

    updateCampaign: builder.mutation<Campaign, { id: string; request: UpdateCampaignRequest }>({
      query: ({ id, request }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: request,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Campaign', id }],
    }),

    deleteCampaign: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Campaign'],
    }),

    cloneCampaign: builder.mutation<Campaign, { id: string; name?: string }>({
      query: ({ id, name }) => ({
        url: `/${id}/clone`,
        method: 'POST',
        body: { name },
      }),
      invalidatesTags: ['Campaign'],
    }),

    getAdventures: builder.query<Adventure[], string>({
      query: (campaignId) => `/${campaignId}/adventures`,
      providesTags: (_result, _error, campaignId) => [{ type: 'CampaignAdventures', id: campaignId }],
    }),

    createAdventure: builder.mutation<Adventure, { campaignId: string; request: CreateAdventureRequest }>({
      query: ({ campaignId, request }) => ({
        url: `/${campaignId}/adventures`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: (_result, _error, { campaignId }) => [{ type: 'CampaignAdventures', id: campaignId }],
    }),

    cloneAdventure: builder.mutation<Adventure, { campaignId: string; adventureId: string; name?: string }>({
      query: ({ campaignId, adventureId, name }) => ({
        url: `/${campaignId}/adventures/${adventureId}/clone`,
        method: 'POST',
        body: name ? { name } : undefined,
      }),
      invalidatesTags: (_result, _error, { campaignId }) => [{ type: 'CampaignAdventures', id: campaignId }],
    }),

    removeAdventure: builder.mutation<void, { campaignId: string; adventureId: string }>({
      query: ({ campaignId, adventureId }) => ({
        url: `/${campaignId}/adventures/${adventureId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { campaignId }) => [{ type: 'CampaignAdventures', id: campaignId }],
    }),
  }),
});

export const {
  useGetCampaignsQuery,
  useGetCampaignQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useCloneCampaignMutation,
  useGetAdventuresQuery,
  useCreateAdventureMutation,
  useCloneAdventureMutation,
  useRemoveAdventureMutation,
} = campaignsApi;
