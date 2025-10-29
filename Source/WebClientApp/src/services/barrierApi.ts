import { createApi } from '@reduxjs/toolkit/query/react';
import { createEnhancedBaseQuery } from './enhancedBaseQuery';
import type {
    Barrier,
    SceneBarrier,
    CreateBarrierRequest,
    UpdateBarrierRequest,
    PlaceSceneBarrierRequest,
    UpdateSceneBarrierRequest
} from '@/types/domain';

export const barrierApi = createApi({
    reducerPath: 'barrierApi',
    baseQuery: createEnhancedBaseQuery('/api/library'),
    tagTypes: ['Barrier', 'SceneBarrier', 'Scene'],
    endpoints: (builder) => ({
        getBarriers: builder.query<Barrier[], { page?: number; pageSize?: number }>({
            query: ({ page = 1, pageSize = 50 }) => `/barriers?page=${page}&pageSize=${pageSize}`,
            providesTags: (result) =>
                result
                    ? [...result.map(({ id }) => ({ type: 'Barrier' as const, id })), 'Barrier']
                    : ['Barrier'],
        }),

        getBarrierById: builder.query<Barrier, string>({
            query: (id) => `/barriers/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Barrier', id }],
        }),

        createBarrier: builder.mutation<Barrier, CreateBarrierRequest>({
            query: (body) => ({
                url: '/barriers',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Barrier'],
        }),

        updateBarrier: builder.mutation<Barrier, { id: string; body: UpdateBarrierRequest }>({
            query: ({ id, body }) => ({
                url: `/barriers/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Barrier', id }, 'Barrier'],
        }),

        deleteBarrier: builder.mutation<void, string>({
            query: (id) => ({
                url: `/barriers/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Barrier', id }, 'Barrier', 'SceneBarrier'],
        }),

        placeSceneBarrier: builder.mutation<SceneBarrier, { sceneId: string; body: PlaceSceneBarrierRequest }>({
            query: ({ sceneId, body }) => ({
                url: `/scenes/${sceneId}/barriers`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['SceneBarrier', 'Scene'],
        }),

        updateSceneBarrier: builder.mutation<SceneBarrier, { sceneId: string; id: string; body: UpdateSceneBarrierRequest }>({
            query: ({ sceneId, id, body }) => ({
                url: `/scenes/${sceneId}/barriers/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'SceneBarrier', id }, 'SceneBarrier', 'Scene'],
        }),

        removeSceneBarrier: builder.mutation<void, { sceneId: string; id: string }>({
            query: ({ sceneId, id }) => ({
                url: `/scenes/${sceneId}/barriers/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'SceneBarrier', id }, 'SceneBarrier', 'Scene'],
        }),
    }),
});

export const {
    useGetBarriersQuery,
    useGetBarrierByIdQuery,
    useCreateBarrierMutation,
    useUpdateBarrierMutation,
    useDeleteBarrierMutation,
    usePlaceSceneBarrierMutation,
    useUpdateSceneBarrierMutation,
    useRemoveSceneBarrierMutation,
} = barrierApi;
