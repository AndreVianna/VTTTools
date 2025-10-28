import { createApi } from '@reduxjs/toolkit/query/react';
import type { Scene, UpdateSceneRequest, CreateSceneRequest, SceneAsset } from '@/types/domain';
import { createEnhancedBaseQuery } from './enhancedBaseQuery';

export interface UpdateSceneWithVersionRequest extends UpdateSceneRequest {
    id: string;
    version: number;
}

export interface VersionConflictError {
    message: string;
    serverVersion: number;
    clientVersion: number;
    conflictType: 'version_mismatch';
}

export interface SceneAssetBulkUpdate {
    index: number;
    position?: { x: number; y: number };
    size?: { width: number; height: number };
    rotation?: number;
    elevation?: number;
}

export const sceneApi = createApi({
    reducerPath: 'sceneApi',
    baseQuery: createEnhancedBaseQuery('/api/scenes'),
    tagTypes: ['Scene', 'SceneAsset'],
    endpoints: (builder) => ({
        getScene: builder.query<Scene, string>({
            query: (id) => `/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Scene', id }],
            keepUnusedDataFor: 0  // Don't cache - always fetch fresh
        }),

        getScenes: builder.query<Scene[], { adventureId?: string }>({
            query: (params) => ({
                url: '',
                params
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'Scene' as const, id })),
                        { type: 'Scene', id: 'LIST' }
                    ]
                    : [{ type: 'Scene', id: 'LIST' }]
        }),

        createScene: builder.mutation<Scene, CreateSceneRequest>({
            query: (data) => ({
                url: '',
                method: 'POST',
                body: data
            }),
            invalidatesTags: [{ type: 'Scene', id: 'LIST' }]
        }),

        updateScene: builder.mutation<Scene, UpdateSceneWithVersionRequest>({
            query: ({ id, version, ...data }) => ({
                url: `/${id}`,
                method: 'PUT',
                body: { ...data, version }
            }),
            onQueryStarted: async ({ id, ...patch }, { dispatch, queryFulfilled }) => {
                const patchResult = dispatch(
                    sceneApi.util.updateQueryData('getScene', id, (draft) => {
                        Object.assign(draft, patch);
                    })
                );

                try {
                    await queryFulfilled;
                } catch (error) {
                    patchResult.undo();

                    const err = error as any;
                    if (err?.error?.data?.conflictType === 'version_mismatch') {
                        console.error('Version conflict detected', err.error.data);
                    }
                }
            },
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Scene', id }]
        }),

        patchScene: builder.mutation<Scene, { id: string; request: UpdateSceneRequest }>({
            query: ({ id, request }) => ({
                url: `/${id}`,
                method: 'PATCH',
                body: request
            })
            // No invalidatesTags - will manually refetch in component
        }),

        deleteScene: builder.mutation<void, string>({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'Scene', id },
                { type: 'Scene', id: 'LIST' }
            ]
        }),

        getSceneAssets: builder.query<SceneAsset[], string>({
            query: (sceneId) => `/${sceneId}/assets`,
            providesTags: (result, _error, sceneId) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'SceneAsset' as const, id })),
                        { type: 'SceneAsset', id: `SCENE_${sceneId}` }
                    ]
                    : [{ type: 'SceneAsset', id: `SCENE_${sceneId}` }]
        }),

        addSceneAsset: builder.mutation<void, { sceneId: string; libraryAssetId: string; position: { x: number; y: number }; size: { width: number; height: number }; rotation?: number }>({
            query: ({ sceneId, libraryAssetId, position, size, rotation }) => ({
                url: `/${sceneId}/assets/${libraryAssetId}`,
                method: 'POST',
                body: {
                    position: { x: position.x, y: position.y },
                    size: { width: size.width, height: size.height, isSquare: Math.abs(size.width - size.height) < 0.001 },
                    rotation: rotation || 0,
                    elevation: 0
                }
            }),
            invalidatesTags: (_result, _error, { sceneId }) => [
                { type: 'Scene', id: sceneId }
            ]
        }),

        updateSceneAsset: builder.mutation<void, { sceneId: string; assetNumber: number; position?: { x: number; y: number }; size?: { width: number; height: number }; rotation?: number }>({
            query: ({ sceneId, assetNumber, position, size, rotation }) => ({
                url: `/${sceneId}/assets/${assetNumber}`,
                method: 'PATCH',
                body: {
                    ...(position && { position: { x: position.x, y: position.y } }),
                    ...(size && { size: { width: size.width, height: size.height, isSquare: Math.abs(size.width - size.height) < 0.001 } }),
                    ...(rotation !== undefined && { rotation })
                }
            }),
            invalidatesTags: (_result, _error, { sceneId }) => [
                { type: 'Scene', id: sceneId }
            ]
        }),

        bulkUpdateSceneAssets: builder.mutation<void, { sceneId: string; updates: SceneAssetBulkUpdate[] }>({
            query: ({ sceneId, updates }) => ({
                url: `/${sceneId}/assets`,
                method: 'PATCH',
                body: {
                    updates: updates.map(update => ({
                        index: update.index,
                        ...(update.position && { position: { x: update.position.x, y: update.position.y } }),
                        ...(update.size && { size: { width: update.size.width, height: update.size.height, isSquare: Math.abs(update.size.width - update.size.height) < 0.001 } }),
                        ...(update.rotation !== undefined && { rotation: update.rotation }),
                        ...(update.elevation !== undefined && { elevation: update.elevation })
                    }))
                }
            }),
            invalidatesTags: (_result, _error, { sceneId }) => [
                { type: 'Scene', id: sceneId }
            ]
        }),

        removeSceneAsset: builder.mutation<void, { sceneId: string; assetNumber: number }>({
            query: ({ sceneId, assetNumber }) => ({
                url: `/${sceneId}/assets/${assetNumber}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, { sceneId }) => [
                { type: 'Scene', id: sceneId }
            ]
        }),

        bulkDeleteSceneAssets: builder.mutation<void, { sceneId: string; assetIndices: number[] }>({
            query: ({ sceneId, assetIndices }) => ({
                url: `/${sceneId}/assets`,
                method: 'DELETE',
                body: { assetIndices }
            }),
            invalidatesTags: (_result, _error, { sceneId }) => [
                { type: 'Scene', id: sceneId }
            ]
        }),

        bulkAddSceneAssets: builder.mutation<void, {
            sceneId: string;
            assets: Array<{
                assetId: string;
                position: { x: number; y: number };
                size: { width: number; height: number };
                rotation?: number;
                elevation?: number;
                resourceId?: string;
                name?: string;
                description?: string;
            }>
        }>({
            query: ({ sceneId, assets }) => ({
                url: `/${sceneId}/assets`,
                method: 'POST',
                body: {
                    assets: assets.map(a => ({
                        assetId: a.assetId,
                        position: { x: a.position.x, y: a.position.y },
                        size: { width: a.size.width, height: a.size.height, isSquare: Math.abs(a.size.width - a.size.height) < 0.001 },
                        rotation: a.rotation || 0,
                        elevation: a.elevation || 0,
                        ...(a.resourceId && { resourceId: a.resourceId }),
                        ...(a.name && { name: a.name }),
                        ...(a.description && { description: a.description })
                    }))
                }
            }),
            invalidatesTags: (_result, _error, { sceneId }) => [
                { type: 'Scene', id: sceneId }
            ]
        })
    })
});

export const {
    useGetSceneQuery,
    useGetScenesQuery,
    useCreateSceneMutation,
    useUpdateSceneMutation,
    usePatchSceneMutation,
    useDeleteSceneMutation,
    useGetSceneAssetsQuery,
    useAddSceneAssetMutation,
    useUpdateSceneAssetMutation,
    useBulkUpdateSceneAssetsMutation,
    useRemoveSceneAssetMutation,
    useBulkDeleteSceneAssetsMutation,
    useBulkAddSceneAssetsMutation
} = sceneApi;
