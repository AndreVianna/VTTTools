import { createApi } from '@reduxjs/toolkit/query/react';
import type {
    CreateEncounterRequest,
    Encounter,
    EncounterAsset,
    UpdateEncounterRequest,
} from '@/types/domain';
import { createEnhancedBaseQuery } from './enhancedBaseQuery';

export interface UpdateEncounterWithVersionRequest extends UpdateEncounterRequest {
    id: string;
    version: number;
}

export interface VersionConflictError {
    message: string;
    serverVersion: number;
    clientVersion: number;
    conflictType: 'version_mismatch';
}

export interface EncounterAssetBulkUpdate {
    index: number;
    position?: { x: number; y: number };
    size?: { width: number; height: number };
    rotation?: number;
    elevation?: number;
}

export const encounterApi = createApi({
    reducerPath: 'encounterApi',
    baseQuery: createEnhancedBaseQuery('/api/encounters'),
    tagTypes: ['Encounter', 'EncounterAsset'],
    endpoints: (builder) => ({
        getEncounter: builder.query<Encounter, string>({
            query: (id) => `/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Encounter', id }],
            keepUnusedDataFor: 0, // Don't cache - always fetch fresh
        }),

        getEncounters: builder.query<Encounter[], { adventureId?: string }>({
            query: (params) => ({
                url: '',
                params,
            }),
            providesTags: (result) =>
                result
                    ? [...result.map(({ id }) => ({ type: 'Encounter' as const, id })), { type: 'Encounter', id: 'LIST' }]
                    : [{ type: 'Encounter', id: 'LIST' }],
        }),

        createEncounter: builder.mutation<Encounter, CreateEncounterRequest>({
            query: (data) => ({
                url: '',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'Encounter', id: 'LIST' }],
        }),

        updateEncounter: builder.mutation<Encounter, UpdateEncounterWithVersionRequest>({
            query: ({ id, version, ...data }) => ({
                url: `/${id}`,
                method: 'PUT',
                body: { ...data, version },
            }),
            onQueryStarted: async ({ id, ...patch }, { dispatch, queryFulfilled }) => {
                const patchResult = dispatch(
                    encounterApi.util.updateQueryData('getEncounter', id, (draft) => {
                        Object.assign(draft, patch);
                    }),
                );

                try {
                    await queryFulfilled;
                } catch (error) {
                    patchResult.undo();

                    const err = error as { error: { data: VersionConflictError } };
                    if (err?.error?.data?.conflictType === 'version_mismatch') {
                        console.error('Version conflict detected', err.error.data);
                    }
                }
            },
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Encounter', id }],
        }),

        patchEncounter: builder.mutation<Encounter, { id: string; request: UpdateEncounterRequest }>({
            query: ({ id, request }) => ({
                url: `/${id}`,
                method: 'PATCH',
                body: request,
            }),
            // No invalidatesTags - will manually refetch in component
        }),

        deleteEncounter: builder.mutation<void, string>({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'Encounter', id },
                { type: 'Encounter', id: 'LIST' },
            ],
        }),

        getEncounterAssets: builder.query<EncounterAsset[], string>({
            query: (encounterId) => `/${encounterId}/assets`,
            providesTags: (result, _error, encounterId) =>
                result
                    ? [
                        ...result.map(({ id }) => ({
                            type: 'EncounterAsset' as const,
                            id,
                        })),
                        { type: 'EncounterAsset', id: `ENCOUNTER_${encounterId}` },
                    ]
                    : [{ type: 'EncounterAsset', id: `ENCOUNTER_${encounterId}` }],
        }),

        addEncounterAsset: builder.mutation<
            void,
            {
                encounterId: string;
                libraryAssetId: string;
                position: { x: number; y: number };
                size: { width: number; height: number };
                rotation?: number;
                tokenId?: string;
                portraitId?: string;
                notes?: string;
                isVisible?: boolean;
            }
        >({
            query: ({ encounterId, libraryAssetId, position, size, rotation, tokenId, portraitId, notes, isVisible }) => ({
                url: `/${encounterId}/assets/${libraryAssetId}`,
                method: 'POST',
                body: {
                    position: { x: position.x, y: position.y },
                    size: {
                        width: size.width,
                        height: size.height,
                    },
                    frame: {
                        shape: 0,
                        borderColor: '#0d6efd',
                        borderThickness: 1,
                        background: '#00000000',
                    },
                    rotation: rotation || 0,
                    elevation: 0,
                    ...(tokenId && { tokenId }),
                    ...(portraitId && { portraitId }),
                    ...(notes && { notes }),
                    ...(isVisible !== undefined && { isVisible }),
                },
            }),
            invalidatesTags: (_result, _error, { encounterId }) => [encounterId ? { type: 'Encounter' as const, id: encounterId } : { type: 'Encounter' as const, id: 'unknown' }],
        }),

        updateEncounterAsset: builder.mutation<
            void,
            {
                encounterId: string;
                assetNumber: number;
                position?: { x: number; y: number };
                size?: { width: number; height: number };
                rotation?: number;
                name?: string | undefined;
                tokenId?: string;
                portraitId?: string;
                notes?: string;
                visible?: boolean;
                locked?: boolean;
            }
        >({
            query: ({
                encounterId,
                assetNumber,
                position,
                size,
                rotation,
                name,
                tokenId,
                portraitId,
                notes,
                visible,
                locked,
            }) => ({
                url: `/${encounterId}/assets/${assetNumber}`,
                method: 'PATCH',
                body: {
                    ...(position && { position: { x: position.x, y: position.y } }),
                    ...(size && {
                        size: {
                            width: size.width,
                            height: size.height,
                        },
                    }),
                    ...(rotation !== undefined && { rotation }),
                    ...(name !== undefined && { name }),
                    ...(tokenId && { tokenId }),
                    ...(portraitId && { portraitId }),
                    ...(notes !== undefined && { notes }),
                    ...(visible !== undefined && { visible }),
                    ...(locked !== undefined && { locked }),
                },
            }),
            invalidatesTags: (_result, _error, { encounterId }) => [encounterId ? { type: 'Encounter' as const, id: encounterId } : { type: 'Encounter' as const, id: 'unknown' }],
        }),

        bulkUpdateEncounterAssets: builder.mutation<void, { encounterId: string; updates: EncounterAssetBulkUpdate[] }>({
            query: ({ encounterId, updates }) => ({
                url: `/${encounterId}/assets`,
                method: 'PATCH',
                body: {
                    updates: updates.map((update) => ({
                        index: update.index,
                        ...(update.position && {
                            position: { x: update.position.x, y: update.position.y },
                        }),
                        ...(update.size && {
                            size: {
                                width: update.size.width,
                                height: update.size.height,
                            },
                        }),
                        ...(update.rotation !== undefined && { rotation: update.rotation }),
                        ...(update.elevation !== undefined && {
                            elevation: update.elevation,
                        }),
                    })),
                },
            }),
            invalidatesTags: (_result, _error, { encounterId }) => [encounterId ? { type: 'Encounter' as const, id: encounterId } : { type: 'Encounter' as const, id: 'unknown' }],
        }),

        removeEncounterAsset: builder.mutation<void, { encounterId: string; assetNumber: number }>({
            query: ({ encounterId, assetNumber }) => ({
                url: `/${encounterId}/assets/${assetNumber}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, { encounterId }) => [encounterId ? { type: 'Encounter' as const, id: encounterId } : { type: 'Encounter' as const, id: 'unknown' }],
        }),

        bulkDeleteEncounterAssets: builder.mutation<void, { encounterId: string; assetIndices: number[] }>({
            query: ({ encounterId, assetIndices }) => ({
                url: `/${encounterId}/assets`,
                method: 'DELETE',
                body: { indices: assetIndices },
            }),
            invalidatesTags: (_result, _error, { encounterId }) => [encounterId ? { type: 'Encounter' as const, id: encounterId } : { type: 'Encounter' as const, id: 'unknown' }],
        }),

        bulkAddEncounterAssets: builder.mutation<
            void,
            {
                encounterId: string;
                assets: Array<{
                    assetId: string;
                    position: { x: number; y: number };
                    size: { width: number; height: number };
                    rotation?: number;
                    elevation?: number;
                    tokenId?: string;
                    portraitId?: string;
                    name?: string | undefined;
                    notes?: string;
                    isVisible?: boolean;
                }>;
            }
        >({
            query: ({ encounterId, assets }) => ({
                url: `/${encounterId}/assets`,
                method: 'POST',
                body: {
                    assets: assets.map((a) => ({
                        assetId: a.assetId,
                        position: { x: a.position.x, y: a.position.y },
                        size: {
                            width: a.size.width,
                            height: a.size.height,
                        },
                        frame: {
                            shape: 0,
                            borderColor: '#0d6efd',
                            borderThickness: 1,
                            background: '#00000000',
                        },
                        rotation: a.rotation || 0,
                        elevation: a.elevation || 0,
                        ...(a.tokenId && { tokenId: a.tokenId }),
                        ...(a.portraitId && { portraitId: a.portraitId }),
                        ...(a.name && { name: a.name }),
                        ...(a.notes && { notes: a.notes }),
                        ...(a.isVisible !== undefined && { isVisible: a.isVisible }),
                    })),
                },
            }),
            invalidatesTags: (_result, _error, { encounterId }) => [encounterId ? { type: 'Encounter' as const, id: encounterId } : { type: 'Encounter' as const, id: 'unknown' }],
        }),
    }),
});

export const {
    useGetEncounterQuery,
    useGetEncountersQuery,
    useCreateEncounterMutation,
    useUpdateEncounterMutation,
    usePatchEncounterMutation,
    useDeleteEncounterMutation,
    useGetEncounterAssetsQuery,
    useAddEncounterAssetMutation,
    useUpdateEncounterAssetMutation,
    useBulkUpdateEncounterAssetsMutation,
    useRemoveEncounterAssetMutation,
    useBulkDeleteEncounterAssetsMutation,
    useBulkAddEncounterAssetsMutation,
} = encounterApi;
