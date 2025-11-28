import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  CreateEncounterRequest,
  Encounter,
  EncounterAsset,
  EncounterOpening,
  EncounterRegion,
  EncounterSource,
  EncounterWall,
  OpeningOpacity,
  OpeningState,
  OpeningVisibility,
  Point,
  Pole,
  UpdateEncounterRequest,
  WallVisibility,
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
  tagTypes: ['Encounter', 'EncounterAsset', 'EncounterWall', 'EncounterOpening', 'EncounterRegion', 'EncounterSource'],
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
            isSquare: Math.abs(size.width - size.height) < 0.001,
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
      invalidatesTags: (_result, _error, { encounterId }) => [{ type: 'Encounter', id: encounterId }],
    }),

    updateEncounterAsset: builder.mutation<
      void,
      {
        encounterId: string;
        assetNumber: number;
        position?: { x: number; y: number };
        size?: { width: number; height: number };
        rotation?: number;
        name?: string;
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
              isSquare: Math.abs(size.width - size.height) < 0.001,
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
      invalidatesTags: (_result, _error, { encounterId }) => [{ type: 'Encounter', id: encounterId }],
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
                isSquare: Math.abs(update.size.width - update.size.height) < 0.001,
              },
            }),
            ...(update.rotation !== undefined && { rotation: update.rotation }),
            ...(update.elevation !== undefined && {
              elevation: update.elevation,
            }),
          })),
        },
      }),
      invalidatesTags: (_result, _error, { encounterId }) => [{ type: 'Encounter', id: encounterId }],
    }),

    removeEncounterAsset: builder.mutation<void, { encounterId: string; assetNumber: number }>({
      query: ({ encounterId, assetNumber }) => ({
        url: `/${encounterId}/assets/${assetNumber}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { encounterId }) => [{ type: 'Encounter', id: encounterId }],
    }),

    bulkDeleteEncounterAssets: builder.mutation<void, { encounterId: string; assetIndices: number[] }>({
      query: ({ encounterId, assetIndices }) => ({
        url: `/${encounterId}/assets`,
        method: 'DELETE',
        body: { indices: assetIndices },
      }),
      invalidatesTags: (_result, _error, { encounterId }) => [{ type: 'Encounter', id: encounterId }],
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
          name?: string;
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
              isSquare: Math.abs(a.size.width - a.size.height) < 0.001,
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
      invalidatesTags: (_result, _error, { encounterId }) => [{ type: 'Encounter', id: encounterId }],
    }),

    getEncounterWalls: builder.query<EncounterWall[], string>({
      query: (encounterId) => `/${encounterId}/walls`,
      providesTags: (result, _error, encounterId) => [
        ...(result?.map(({ index }) => ({
          type: 'EncounterWall' as const,
          id: `${encounterId}-${index}`,
        })) ?? []),
        { type: 'EncounterWall', id: `ENCOUNTER_${encounterId}` },
      ],
    }),

    addEncounterWall: builder.mutation<
      EncounterWall,
      {
        encounterId: string;
        name: string | undefined;
        poles: Pole[] | undefined;
        visibility: WallVisibility | undefined;
        isClosed: boolean | undefined;
        color?: string | undefined;
      }
    >({
      query: ({ encounterId, ...body }) => {
        return {
          url: `/${encounterId}/walls`,
          method: 'POST',
          body,
        };
      },
      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error('[encounterApi.addEncounterWall] Error:', error);
        }
      },
      invalidatesTags: (_result, _error, { encounterId }) => [
        { type: 'EncounterWall', id: `ENCOUNTER_${encounterId}` },
        { type: 'Encounter', id: encounterId },
      ],
    }),

    updateEncounterWall: builder.mutation<
      void,
      {
        encounterId: string;
        wallIndex: number;
        name?: string | undefined;
        poles?: Pole[] | undefined;
        visibility?: WallVisibility | undefined;
        isClosed?: boolean | undefined;
        color?: string | undefined;
      }
    >({
      query: ({ encounterId, wallIndex, ...body }) => {
        return {
          url: `/${encounterId}/walls/${wallIndex}`,
          method: 'PATCH',
          body,
        };
      },
      invalidatesTags: (_result, _error, { encounterId, wallIndex }) => [
        { type: 'EncounterWall', id: `${encounterId}-${wallIndex}` },
        { type: 'EncounterWall', id: `ENCOUNTER_${encounterId}` },
        { type: 'Encounter', id: encounterId },
      ],
    }),

    removeEncounterWall: builder.mutation<void, { encounterId: string; wallIndex: number }>({
      query: ({ encounterId, wallIndex }) => ({
        url: `/${encounterId}/walls/${wallIndex}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { encounterId, wallIndex }) => [
        { type: 'EncounterWall', id: `${encounterId}-${wallIndex}` },
        { type: 'EncounterWall', id: `ENCOUNTER_${encounterId}` },
        { type: 'Encounter', id: encounterId },
      ],
    }),

    getEncounterRegions: builder.query<EncounterRegion[], string>({
      query: (encounterId) => `/${encounterId}/regions`,
      providesTags: (result, _error, encounterId) => [
        ...(result?.map(({ index }) => ({
          type: 'EncounterRegion' as const,
          id: `${encounterId}-${index}`,
        })) ?? []),
        { type: 'EncounterRegion', id: `ENCOUNTER_${encounterId}` },
      ],
    }),

    addEncounterRegion: builder.mutation<
      EncounterRegion,
      {
        encounterId: string;
        name: string;
        type: string;
        vertices: Point[];
        value?: number;
        label?: string;
        color?: string;
      }
    >({
      query: ({ encounterId, ...body }) => ({
        url: `/${encounterId}/regions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { encounterId }) => [
        { type: 'EncounterRegion', id: `ENCOUNTER_${encounterId}` },
        { type: 'Encounter', id: encounterId },
      ],
    }),

    updateEncounterRegion: builder.mutation<
      void,
      {
        encounterId: string;
        regionIndex: number;
        name?: string;
        type?: string;
        vertices?: Point[];
        value?: number;
        label?: string;
        color?: string;
      }
    >({
      query: ({ encounterId, regionIndex, ...body }) => ({
        url: `/${encounterId}/regions/${regionIndex}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { encounterId, regionIndex }) => [
        { type: 'EncounterRegion', id: `${encounterId}-${regionIndex}` },
        { type: 'Encounter', id: encounterId },
      ],
    }),

    removeEncounterRegion: builder.mutation<void, { encounterId: string; regionIndex: number }>({
      query: ({ encounterId, regionIndex }) => ({
        url: `/${encounterId}/regions/${regionIndex}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { encounterId, regionIndex }) => [
        { type: 'EncounterRegion', id: `${encounterId}-${regionIndex}` },
        { type: 'EncounterRegion', id: `ENCOUNTER_${encounterId}` },
        { type: 'Encounter', id: encounterId },
      ],
    }),

    getEncounterSources: builder.query<EncounterSource[], string>({
      query: (encounterId) => `/${encounterId}/sources`,
      providesTags: (result, _error, encounterId) => [
        ...(result?.map(({ index }) => ({
          type: 'EncounterSource' as const,
          id: `${encounterId}-${index}`,
        })) ?? []),
        { type: 'EncounterSource', id: `ENCOUNTER_${encounterId}` },
      ],
    }),

    addEncounterSource: builder.mutation<
      EncounterSource,
      {
        encounterId: string;
        name: string;
        type: string;
        position: Point;
        isDirectional: boolean;
        direction: number;
        spread: number;
        range?: number;
        intensity?: number;
        color?: string;
        hasGradient: boolean;
      }
    >({
      query: ({ encounterId, ...body }) => ({
        url: `/${encounterId}/sources`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { encounterId }) => [
        { type: 'EncounterSource', id: `ENCOUNTER_${encounterId}` },
        { type: 'Encounter', id: encounterId },
      ],
    }),

    updateEncounterSource: builder.mutation<
      void,
      {
        encounterId: string;
        sourceIndex: number;
        name?: string;
        type?: string;
        position?: Point;
        isDirectional?: boolean;
        direction?: number;
        spread?: number;
        range?: number;
        intensity?: number;
        color?: string;
        hasGradient?: boolean;
      }
    >({
      query: ({ encounterId, sourceIndex, ...body }) => ({
        url: `/${encounterId}/sources/${sourceIndex}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { encounterId, sourceIndex }) => [
        { type: 'EncounterSource', id: `${encounterId}-${sourceIndex}` },
        { type: 'Encounter', id: encounterId },
      ],
    }),

    removeEncounterSource: builder.mutation<void, { encounterId: string; sourceIndex: number }>({
      query: ({ encounterId, sourceIndex }) => ({
        url: `/${encounterId}/sources/${sourceIndex}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { encounterId, sourceIndex }) => [
        { type: 'EncounterSource', id: `${encounterId}-${sourceIndex}` },
        { type: 'EncounterSource', id: `ENCOUNTER_${encounterId}` },
        { type: 'Encounter', id: encounterId },
      ],
    }),

    addEncounterOpening: builder.mutation<
      EncounterOpening,
      {
        encounterId: string;
        name?: string;
        description?: string;
        type: string;
        wallIndex: number;
        startPole: { x: number; y: number; h: number };
        endPole: { x: number; y: number; h: number };
        visibility?: OpeningVisibility;
        state?: OpeningState;
        opacity?: OpeningOpacity;
        material?: string;
        color?: string;
      }
    >({
      query: ({ encounterId, ...body }) => ({
        url: `/${encounterId}/openings`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { encounterId }) => [
        { type: 'EncounterOpening', id: `ENCOUNTER_${encounterId}` },
        { type: 'Encounter', id: encounterId },
      ],
    }),

    updateEncounterOpening: builder.mutation<
      void,
      {
        encounterId: string;
        openingIndex: number;
        name?: string;
        description?: string;
        type?: string;
        width?: number;
        height?: number;
        visibility?: OpeningVisibility;
        state?: OpeningState;
        opacity?: OpeningOpacity;
        material?: string;
        color?: string;
      }
    >({
      query: ({ encounterId, openingIndex, ...body }) => ({
        url: `/${encounterId}/openings/${openingIndex}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { encounterId, openingIndex }) => [
        { type: 'EncounterOpening', id: `${encounterId}-${openingIndex}` },
        { type: 'Encounter', id: encounterId },
      ],
    }),

    removeEncounterOpening: builder.mutation<void, { encounterId: string; openingIndex: number }>({
      query: ({ encounterId, openingIndex }) => ({
        url: `/${encounterId}/openings/${openingIndex}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { encounterId, openingIndex }) => [
        { type: 'EncounterOpening', id: `${encounterId}-${openingIndex}` },
        { type: 'EncounterOpening', id: `ENCOUNTER_${encounterId}` },
        { type: 'Encounter', id: encounterId },
      ],
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
  useGetEncounterWallsQuery,
  useAddEncounterWallMutation,
  useUpdateEncounterWallMutation,
  useRemoveEncounterWallMutation,
  useGetEncounterRegionsQuery,
  useAddEncounterRegionMutation,
  useUpdateEncounterRegionMutation,
  useRemoveEncounterRegionMutation,
  useGetEncounterSourcesQuery,
  useAddEncounterSourceMutation,
  useUpdateEncounterSourceMutation,
  useRemoveEncounterSourceMutation,
  useAddEncounterOpeningMutation,
  useUpdateEncounterOpeningMutation,
  useRemoveEncounterOpeningMutation,
} = encounterApi;
