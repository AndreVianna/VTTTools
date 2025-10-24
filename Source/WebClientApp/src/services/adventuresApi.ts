import { createApi } from '@reduxjs/toolkit/query/react';
import { createEnhancedBaseQuery } from './enhancedBaseQuery';
import type {
  CreateAdventureRequest,
  UpdateAdventureRequest,
  Adventure,
  CreateSceneRequest,
  UpdateSceneRequest,
  Scene
} from '@/types/domain';

// Adventures API consuming existing Library microservice
export const adventuresApi = createApi({
  reducerPath: 'adventuresApi',
  baseQuery: createEnhancedBaseQuery('/api/adventures'),
  tagTypes: ['Adventure', 'Scene'],
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

    // Scene endpoints - also in Library microservice
    getScenes: builder.query<Scene[], string>({
      query: (adventureId) => `/${adventureId}/scenes`,
      providesTags: ['Scene'],
    }),

    getScene: builder.query<Scene, { adventureId: string; sceneId: string }>({
      query: ({ adventureId, sceneId }) => `/${adventureId}/scenes/${sceneId}`,
      providesTags: (_result, _error, { sceneId }) => [{ type: 'Scene', id: sceneId }],
    }),

    createScene: builder.mutation<Scene, { adventureId: string; request: CreateSceneRequest }>({
      query: ({ adventureId, request }) => ({
        url: `/${adventureId}/scenes`,
        method: 'POST',
        body: request, // Uses existing Domain.Library.Scenes.ApiContracts
      }),
      invalidatesTags: ['Scene'],
    }),

    updateScene: builder.mutation<Scene, {
      adventureId: string;
      sceneId: string;
      request: UpdateSceneRequest
    }>({
      query: ({ adventureId, sceneId, request }) => ({
        url: `/${adventureId}/scenes/${sceneId}`,
        method: 'PUT',
        body: request, // Uses existing Domain.Library.Scenes.ApiContracts
      }),
      invalidatesTags: (_result, _error, { sceneId }) => [{ type: 'Scene', id: sceneId }],
    }),

    deleteScene: builder.mutation<void, { adventureId: string; sceneId: string }>({
      query: ({ adventureId, sceneId }) => ({
        url: `/${adventureId}/scenes/${sceneId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Scene'],
    }),

    // Clone scene
    cloneScene: builder.mutation<Scene, {
      adventureId: string;
      sceneId: string;
      name?: string
    }>({
      query: ({ adventureId, sceneId, name }) => ({
        url: `/${adventureId}/scenes/${sceneId}/clone`,
        method: 'POST',
        body: { name },
      }),
      invalidatesTags: ['Scene'],
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
  useGetSceneQuery,
  useCreateSceneMutation,
  useUpdateSceneMutation,
  useDeleteSceneMutation,
  useCloneSceneMutation,
  useSearchAdventuresQuery,
} = adventuresApi;