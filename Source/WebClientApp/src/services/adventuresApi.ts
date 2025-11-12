import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  Adventure,
  CreateAdventureRequest,
  CreateEncounterRequest,
  Encounter,
  UpdateAdventureRequest,
} from '@/types/domain';
import { contentApi } from './contentApi';
import { createEnhancedBaseQuery } from './enhancedBaseQuery';

// Adventures API consuming existing Library microservice
export const adventuresApi = createApi({
  reducerPath: 'adventuresApi',
  baseQuery: createEnhancedBaseQuery('/api/adventures'),
  tagTypes: ['Adventure', 'AdventureEncounters'],
  endpoints: (builder) => ({
    // Adventure management endpoints
    getAdventures: builder.query<Adventure[], void>({
      query: () => '',
      providesTags: ['Adventure'],
    }),

    getAdventure: builder.query<Adventure, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Adventure', id }],
    }),

    // Create adventure using existing CreateAdventureRequest from Domain.Library.Adventures.ApiContracts
    createAdventure: builder.mutation<Adventure, CreateAdventureRequest>({
      query: (request) => ({
        url: '',
        method: 'POST',
        body: request, // Matches existing C# contract exactly
      }),
      invalidatesTags: ['Adventure'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(contentApi.util.invalidateTags(['Content']));
      },
    }),

    // Update adventure using existing UpdateAdventureRequest from Domain layer
    updateAdventure: builder.mutation<Adventure, { id: string; request: UpdateAdventureRequest }>({
      query: ({ id, request }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: request,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Adventure', id }],
    }),

    deleteAdventure: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Adventure'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(contentApi.util.invalidateTags(['Content']));
      },
    }),

    // Adventure cloning
    cloneAdventure: builder.mutation<Adventure, { id: string; name?: string }>({
      query: ({ id, name }) => ({
        url: `/${id}/clone`,
        method: 'POST',
        body: { name },
      }),
      invalidatesTags: ['Adventure'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(contentApi.util.invalidateTags(['Content']));
      },
    }),

    // Adventure-scoped Encounter endpoints (operations through Adventure aggregate)
    // Uses 'AdventureEncounters' tag to avoid conflict with encounterApi's 'Encounter' tag
    getEncounters: builder.query<Encounter[], string>({
      query: (adventureId) => `/${adventureId}/encounters`,
      providesTags: (_result, _error, adventureId) => [{ type: 'AdventureEncounters', id: adventureId }],
    }),

    createEncounter: builder.mutation<Encounter, { adventureId: string; request: CreateEncounterRequest }>({
      query: ({ adventureId, request }) => ({
        url: `/${adventureId}/encounters`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: (_result, _error, { adventureId }) => [{ type: 'AdventureEncounters', id: adventureId }],
    }),

    cloneEncounter: builder.mutation<Encounter, { adventureId: string; encounterId: string; name?: string }>({
      query: ({ adventureId, encounterId, name }) => ({
        url: `/${adventureId}/encounters/${encounterId}/clone`,
        method: 'POST',
        body: name ? { name } : undefined,
      }),
      invalidatesTags: (_result, _error, { adventureId }) => [{ type: 'AdventureEncounters', id: adventureId }],
    }),

    // Search adventures
    searchAdventures: builder.query<
      Adventure[],
      {
        query?: string;
        type?: string;
        tags?: string[];
        limit?: number;
      }
    >({
      query: (params) => ({
        url: '/search',
        params,
      }),
      providesTags: ['Adventure'],
    }),
  }),
});

export const {
  useGetAdventuresQuery,
  useGetAdventureQuery,
  useCreateAdventureMutation,
  useUpdateAdventureMutation,
  useDeleteAdventureMutation,
  useCloneAdventureMutation,
  useGetEncountersQuery,
  useCreateEncounterMutation,
  useCloneEncounterMutation,
  useSearchAdventuresQuery,
} = adventuresApi;
