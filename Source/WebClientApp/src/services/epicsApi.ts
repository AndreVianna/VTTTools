import { createApi } from '@reduxjs/toolkit/query/react';
import { createEnhancedBaseQuery } from './enhancedBaseQuery';
import type {
  CreateEpicRequest,
  UpdateEpicRequest,
  Epic,
  CreateCampaignRequest,
  Campaign
} from '@/types/domain';

export const epicsApi = createApi({
  reducerPath: 'epicsApi',
  baseQuery: createEnhancedBaseQuery('/api/epics'),
  tagTypes: ['Epic', 'EpicCampaigns'],
  endpoints: (builder) => ({
    getEpics: builder.query<Epic[], void>({
      query: () => '',
      providesTags: ['Epic'],
    }),

    getEpic: builder.query<Epic, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Epic', id }],
    }),

    createEpic: builder.mutation<Epic, CreateEpicRequest>({
      query: (request) => ({
        url: '',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Epic'],
    }),

    updateEpic: builder.mutation<Epic, { id: string; request: UpdateEpicRequest }>({
      query: ({ id, request }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: request,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Epic', id }],
    }),

    deleteEpic: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Epic'],
    }),

    cloneEpic: builder.mutation<Epic, { id: string; name?: string }>({
      query: ({ id, name }) => ({
        url: `/${id}/clone`,
        method: 'POST',
        body: { name },
      }),
      invalidatesTags: ['Epic'],
    }),

    getCampaigns: builder.query<Campaign[], string>({
      query: (epicId) => `/${epicId}/campaigns`,
      providesTags: (_result, _error, epicId) => [
        { type: 'EpicCampaigns', id: epicId }
      ],
    }),

    createCampaign: builder.mutation<Campaign, { epicId: string; request: CreateCampaignRequest }>({
      query: ({ epicId, request }) => ({
        url: `/${epicId}/campaigns`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: (_result, _error, { epicId }) => [
        { type: 'EpicCampaigns', id: epicId }
      ],
    }),

    cloneCampaign: builder.mutation<Campaign, { epicId: string; campaignId: string; name?: string }>({
      query: ({ epicId, campaignId, name }) => ({
        url: `/${epicId}/campaigns/${campaignId}/clone`,
        method: 'POST',
        body: name ? { name } : undefined,
      }),
      invalidatesTags: (_result, _error, { epicId }) => [
        { type: 'EpicCampaigns', id: epicId }
      ],
    }),

    removeCampaign: builder.mutation<void, { epicId: string; campaignId: string }>({
      query: ({ epicId, campaignId }) => ({
        url: `/${epicId}/campaigns/${campaignId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { epicId }) => [
        { type: 'EpicCampaigns', id: epicId }
      ],
    }),
  }),
});

export const {
  useGetEpicsQuery,
  useGetEpicQuery,
  useCreateEpicMutation,
  useUpdateEpicMutation,
  useDeleteEpicMutation,
  useCloneEpicMutation,
  useGetCampaignsQuery,
  useCreateCampaignMutation,
  useCloneCampaignMutation,
  useRemoveCampaignMutation,
} = epicsApi;
