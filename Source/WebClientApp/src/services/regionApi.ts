import { createApi } from '@reduxjs/toolkit/query/react';
import { createEnhancedBaseQuery } from './enhancedBaseQuery';
import type {
    Region,
    SceneRegion,
    CreateRegionRequest,
    UpdateRegionRequest,
    PlaceSceneRegionRequest,
    UpdateSceneRegionRequest
} from '@/types/domain';

export const regionApi = createApi({
    reducerPath: 'regionApi',
    baseQuery: createEnhancedBaseQuery('/api/library'),
    tagTypes: ['Region', 'SceneRegion', 'Scene'],
    endpoints: (builder) => ({
        getRegions: builder.query<Region[], { page?: number; pageSize?: number }>({
            query: ({ page = 1, pageSize = 50 }) => `/regions?page=${page}&pageSize=${pageSize}`,
            providesTags: (result) =>
                result
                    ? [...result.map(({ id }) => ({ type: 'Region' as const, id })), 'Region']
                    : ['Region'],
        }),

        getRegionById: builder.query<Region, string>({
            query: (id) => `/regions/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Region', id }],
        }),

        createRegion: builder.mutation<Region, CreateRegionRequest>({
            query: (body) => ({
                url: '/regions',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Region'],
        }),

        updateRegion: builder.mutation<Region, { id: string; body: UpdateRegionRequest }>({
            query: ({ id, body }) => ({
                url: `/regions/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Region', id }, 'Region'],
        }),

        deleteRegion: builder.mutation<void, string>({
            query: (id) => ({
                url: `/regions/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Region', id }, 'Region', 'SceneRegion'],
        }),

        placeSceneRegion: builder.mutation<SceneRegion, { sceneId: string; body: PlaceSceneRegionRequest }>({
            query: ({ sceneId, body }) => ({
                url: `/scenes/${sceneId}/regions`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['SceneRegion', 'Scene'],
        }),

        updateSceneRegion: builder.mutation<SceneRegion, { sceneId: string; id: string; body: UpdateSceneRegionRequest }>({
            query: ({ sceneId, id, body }) => ({
                url: `/scenes/${sceneId}/regions/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'SceneRegion', id }, 'SceneRegion', 'Scene'],
        }),

        removeSceneRegion: builder.mutation<void, { sceneId: string; id: string }>({
            query: ({ sceneId, id }) => ({
                url: `/scenes/${sceneId}/regions/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'SceneRegion', id }, 'SceneRegion', 'Scene'],
        }),
    }),
});

export const {
    useGetRegionsQuery,
    useGetRegionByIdQuery,
    useCreateRegionMutation,
    useUpdateRegionMutation,
    useDeleteRegionMutation,
    usePlaceSceneRegionMutation,
    useUpdateSceneRegionMutation,
    useRemoveSceneRegionMutation,
} = regionApi;
