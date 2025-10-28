import { createApi } from '@reduxjs/toolkit/query/react';
import { createEnhancedBaseQuery } from './enhancedBaseQuery';
import type {
  CreateAdventureRequest,
  UpdateAdventureRequest,
  Adventure,
  CreateSceneRequest,
  Scene
} from '@/types/domain';

// Adventures API consuming existing Library microservice
export const adventuresApi = createApi({
  reducerPath: 'adventuresApi',
  baseQuery: createEnhancedBaseQuery('/api/adventures'),
  tagTypes: ['Adventure', 'AdventureScenes'],
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
    }),

    // Adventure cloning
    cloneAdventure: builder.mutation<Adventure, { id: string; name?: string }>({
      query: ({ id, name }) => ({
        url: `/${id}/clone`,
        method: 'POST',
        body: { name },
      }),
      invalidatesTags: ['Adventure'],
    }),

    // Adventure-scoped Scene endpoints (operations through Adventure aggregate)
    // Uses 'AdventureScenes' tag to avoid conflict with sceneApi's 'Scene' tag
    getScenes: builder.query<Scene[], string>({
      query: (adventureId) => `/${adventureId}/scenes`,
      providesTags: (_result, _error, adventureId) => [
        { type: 'AdventureScenes', id: adventureId }
      ],
    }),

    createScene: builder.mutation<Scene, { adventureId: string; request: CreateSceneRequest }>({
      query: ({ adventureId, request }) => ({
        url: `/${adventureId}/scenes`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: (_result, _error, { adventureId }) => [
        { type: 'AdventureScenes', id: adventureId }
      ],
    }),

    cloneScene: builder.mutation<Scene, { adventureId: string; sceneId: string; name?: string }>({
      query: ({ adventureId, sceneId, name }) => ({
        url: `/${adventureId}/scenes/${sceneId}/clone`,
        method: 'POST',
        body: name ? { name } : undefined,
      }),
      invalidatesTags: (_result, _error, { adventureId }) => [
        { type: 'AdventureScenes', id: adventureId }
      ],
    }),

    // Search adventures
    searchAdventures: builder.query<Adventure[], {
      query?: string;
      type?: string;
      tags?: string[];
      limit?: number;
    }>({
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
  useGetScenesQuery,
  useCreateSceneMutation,
  useCloneSceneMutation,
  useSearchAdventuresQuery,
} = adventuresApi;