import { createApi } from '@reduxjs/toolkit/query/react';
import { createEnhancedBaseQuery } from './enhancedBaseQuery';
import type {
    Source,
    SceneSource,
    CreateSourceRequest,
    UpdateSourceRequest,
    PlaceSceneSourceRequest,
    UpdateSceneSourceRequest
} from '@/types/domain';

export const sourceApi = createApi({
    reducerPath: 'sourceApi',
    baseQuery: createEnhancedBaseQuery('/api/library'),
    tagTypes: ['Source', 'SceneSource', 'Scene'],
    endpoints: (builder) => ({
        getSources: builder.query<Source[], { page?: number; pageSize?: number }>({
            query: ({ page = 1, pageSize = 50 }) => `/sources?page=${page}&pageSize=${pageSize}`,
            providesTags: (result) =>
                result
                    ? [...result.map(({ id }) => ({ type: 'Source' as const, id })), 'Source']
                    : ['Source'],
        }),

        getSourceById: builder.query<Source, string>({
            query: (id) => `/sources/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Source', id }],
        }),

        createSource: builder.mutation<Source, CreateSourceRequest>({
            query: (body) => ({
                url: '/sources',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Source'],
        }),

        updateSource: builder.mutation<Source, { id: string; body: UpdateSourceRequest }>({
            query: ({ id, body }) => ({
                url: `/sources/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Source', id }, 'Source'],
        }),

        deleteSource: builder.mutation<void, string>({
            query: (id) => ({
                url: `/sources/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Source', id }, 'Source', 'SceneSource'],
        }),

        placeSceneSource: builder.mutation<SceneSource, { sceneId: string; body: PlaceSceneSourceRequest }>({
            query: ({ sceneId, body }) => ({
                url: `/scenes/${sceneId}/sources`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['SceneSource', 'Scene'],
        }),

        updateSceneSource: builder.mutation<SceneSource, { sceneId: string; id: string; body: UpdateSceneSourceRequest }>({
            query: ({ sceneId, id, body }) => ({
                url: `/scenes/${sceneId}/sources/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'SceneSource', id }, 'SceneSource', 'Scene'],
        }),

        removeSceneSource: builder.mutation<void, { sceneId: string; id: string }>({
            query: ({ sceneId, id }) => ({
                url: `/scenes/${sceneId}/sources/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'SceneSource', id }, 'SceneSource', 'Scene'],
        }),
    }),
});

export const {
    useGetSourcesQuery,
    useGetSourceByIdQuery,
    useCreateSourceMutation,
    useUpdateSourceMutation,
    useDeleteSourceMutation,
    usePlaceSceneSourceMutation,
    useUpdateSceneSourceMutation,
    useRemoveSceneSourceMutation,
} = sourceApi;
