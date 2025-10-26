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

        addSceneAsset: builder.mutation<SceneAsset, { sceneId: string; assetData: Partial<SceneAsset> }>({
            query: ({ sceneId, assetData }) => ({
                url: `/${sceneId}/assets`,
                method: 'POST',
                body: assetData
            }),
            invalidatesTags: (_result, _error, { sceneId }) => [
                { type: 'SceneAsset', id: `SCENE_${sceneId}` }
            ]
        }),

        updateSceneAsset: builder.mutation<SceneAsset, { sceneId: string; assetId: string; data: Partial<SceneAsset> }>({
            query: ({ sceneId, assetId, data }) => ({
                url: `/${sceneId}/assets/${assetId}`,
                method: 'PUT',
                body: data
            }),
            onQueryStarted: async ({ sceneId, assetId, data }, { dispatch, queryFulfilled }) => {
                const patchResult = dispatch(
                    sceneApi.util.updateQueryData('getSceneAssets', sceneId, (draft: SceneAsset[]) => {
                        const index = draft.findIndex(a => a.id === assetId);
                        if (index !== -1 && draft[index]) {
                            Object.assign(draft[index]!, data);
                        }
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: (_result, _error, { assetId }) => [{ type: 'SceneAsset', id: assetId }]
        }),

        removeSceneAsset: builder.mutation<void, { sceneId: string; assetId: string }>({
            query: ({ sceneId, assetId }) => ({
                url: `/${sceneId}/assets/${assetId}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, { sceneId, assetId }) => [
                { type: 'SceneAsset', id: assetId },
                { type: 'SceneAsset', id: `SCENE_${sceneId}` }
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
    useRemoveSceneAssetMutation
} = sceneApi;
