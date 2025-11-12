import { createApi } from '@reduxjs/toolkit/query/react';
import type { Campaign, CreateCampaignRequest, CreateWorldRequest, UpdateWorldRequest, World } from '@/types/domain';
import { createEnhancedBaseQuery } from './enhancedBaseQuery';

export const worldsApi = createApi({
  reducerPath: 'worldsApi',
  baseQuery: createEnhancedBaseQuery('/api/worlds'),
  tagTypes: ['World', 'WorldCampaigns'],
  endpoints: (builder) => ({
    getWorlds: builder.query<World[], void>({
      query: () => '',
      providesTags: ['World'],
    }),

    getWorld: builder.query<World, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'World', id }],
    }),

    createWorld: builder.mutation<World, CreateWorldRequest>({
      query: (request) => ({
        url: '',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['World'],
    }),

    updateWorld: builder.mutation<World, { id: string; request: UpdateWorldRequest }>({
      query: ({ id, request }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: request,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'World', id }],
    }),

    deleteWorld: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['World'],
    }),

    cloneWorld: builder.mutation<World, { id: string; name?: string }>({
      query: ({ id, name }) => ({
        url: `/${id}/clone`,
        method: 'POST',
        body: { name },
      }),
      invalidatesTags: ['World'],
    }),

    getCampaigns: builder.query<Campaign[], string>({
      query: (worldId) => `/${worldId}/campaigns`,
      providesTags: (_result, _error, worldId) => [{ type: 'WorldCampaigns', id: worldId }],
    }),

    createCampaign: builder.mutation<Campaign, { worldId: string; request: CreateCampaignRequest }>({
      query: ({ worldId, request }) => ({
        url: `/${worldId}/campaigns`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: (_result, _error, { worldId }) => [{ type: 'WorldCampaigns', id: worldId }],
    }),

    cloneCampaign: builder.mutation<Campaign, { worldId: string; campaignId: string; name?: string }>({
      query: ({ worldId, campaignId, name }) => ({
        url: `/${worldId}/campaigns/${campaignId}/clone`,
        method: 'POST',
        body: name ? { name } : undefined,
      }),
      invalidatesTags: (_result, _error, { worldId }) => [{ type: 'WorldCampaigns', id: worldId }],
    }),

    removeCampaign: builder.mutation<void, { worldId: string; campaignId: string }>({
      query: ({ worldId, campaignId }) => ({
        url: `/${worldId}/campaigns/${campaignId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { worldId }) => [{ type: 'WorldCampaigns', id: worldId }],
    }),
  }),
});

export const {
  useGetWorldsQuery,
  useGetWorldQuery,
  useCreateWorldMutation,
  useUpdateWorldMutation,
  useDeleteWorldMutation,
  useCloneWorldMutation,
  useGetCampaignsQuery,
  useCreateCampaignMutation,
  useCloneCampaignMutation,
  useRemoveCampaignMutation,
} = worldsApi;
