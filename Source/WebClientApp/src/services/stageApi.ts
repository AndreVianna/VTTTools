import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  Stage,
  StageListItem,
  CreateStageRequest,
  UpdateStageRequest,
  CreateWallRequest,
  UpdateWallRequest,
  CreateRegionRequest,
  UpdateRegionRequest,
  CreateLightRequest,
  UpdateLightRequest,
  CreateElementRequest,
  UpdateElementRequest,
  CreateSoundRequest,
  UpdateSoundRequest,
  StageWall,
  StageRegion,
  StageLight,
  StageElement,
  StageSound,
} from '@/types/stage';
import { createEnhancedBaseQuery } from './enhancedBaseQuery';

export const stageApi = createApi({
  reducerPath: 'stageApi',
  baseQuery: createEnhancedBaseQuery('/api/stages'),
  tagTypes: ['Stage', 'StageWall', 'StageRegion', 'StageLight', 'StageElement', 'StageSound'],
  endpoints: (builder) => ({
    // === Stage CRUD ===

    getStages: builder.query<StageListItem[], void>({
      query: () => '',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Stage' as const, id })), { type: 'Stage', id: 'LIST' }]
          : [{ type: 'Stage', id: 'LIST' }],
    }),

    getStageById: builder.query<Stage, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Stage', id }],
    }),

    createStage: builder.mutation<Stage, CreateStageRequest>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Stage', id: 'LIST' }],
    }),

    updateStage: builder.mutation<Stage, { id: string; data: UpdateStageRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Stage', id }],
    }),

    deleteStage: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Stage', id },
        { type: 'Stage', id: 'LIST' },
      ],
    }),

    cloneStage: builder.mutation<Stage, string>({
      query: (id) => ({
        url: `/${id}/clone`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Stage', id: 'LIST' }],
    }),

    // === Walls ===

    addWall: builder.mutation<StageWall, { stageId: string; data: CreateWallRequest }>({
      query: ({ stageId, data }) => ({
        url: `/${stageId}/walls`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { stageId }) => [
        { type: 'StageWall', id: `STAGE_${stageId}` },
        { type: 'Stage', id: stageId },
      ],
    }),

    updateWall: builder.mutation<void, { stageId: string; index: number; data: UpdateWallRequest }>({
      query: ({ stageId, index, data }) => ({
        url: `/${stageId}/walls/${index}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { stageId, index }) => [
        { type: 'StageWall', id: `${stageId}-${index}` },
        { type: 'StageWall', id: `STAGE_${stageId}` },
        { type: 'Stage', id: stageId },
      ],
    }),

    deleteWall: builder.mutation<void, { stageId: string; index: number }>({
      query: ({ stageId, index }) => ({
        url: `/${stageId}/walls/${index}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { stageId, index }) => [
        { type: 'StageWall', id: `${stageId}-${index}` },
        { type: 'StageWall', id: `STAGE_${stageId}` },
        { type: 'Stage', id: stageId },
      ],
    }),

    // === Regions ===

    addRegion: builder.mutation<StageRegion, { stageId: string; data: CreateRegionRequest }>({
      query: ({ stageId, data }) => ({
        url: `/${stageId}/regions`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { stageId }) => [
        { type: 'StageRegion', id: `STAGE_${stageId}` },
        { type: 'Stage', id: stageId },
      ],
    }),

    updateRegion: builder.mutation<void, { stageId: string; index: number; data: UpdateRegionRequest }>({
      query: ({ stageId, index, data }) => ({
        url: `/${stageId}/regions/${index}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { stageId, index }) => [
        { type: 'StageRegion', id: `${stageId}-${index}` },
        { type: 'StageRegion', id: `STAGE_${stageId}` },
        { type: 'Stage', id: stageId },
      ],
    }),

    deleteRegion: builder.mutation<void, { stageId: string; index: number }>({
      query: ({ stageId, index }) => ({
        url: `/${stageId}/regions/${index}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { stageId, index }) => [
        { type: 'StageRegion', id: `${stageId}-${index}` },
        { type: 'StageRegion', id: `STAGE_${stageId}` },
        { type: 'Stage', id: stageId },
      ],
    }),

    // === Lights ===

    addLight: builder.mutation<StageLight, { stageId: string; data: CreateLightRequest }>({
      query: ({ stageId, data }) => ({
        url: `/${stageId}/lights`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { stageId }) => [
        { type: 'StageLight', id: `STAGE_${stageId}` },
        { type: 'Stage', id: stageId },
      ],
    }),

    updateLight: builder.mutation<void, { stageId: string; index: number; data: UpdateLightRequest }>({
      query: ({ stageId, index, data }) => ({
        url: `/${stageId}/lights/${index}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { stageId, index }) => [
        { type: 'StageLight', id: `${stageId}-${index}` },
        { type: 'StageLight', id: `STAGE_${stageId}` },
        { type: 'Stage', id: stageId },
      ],
    }),

    deleteLight: builder.mutation<void, { stageId: string; index: number }>({
      query: ({ stageId, index }) => ({
        url: `/${stageId}/lights/${index}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { stageId, index }) => [
        { type: 'StageLight', id: `${stageId}-${index}` },
        { type: 'StageLight', id: `STAGE_${stageId}` },
        { type: 'Stage', id: stageId },
      ],
    }),

    // === Elements (Decorations) ===

    addElement: builder.mutation<StageElement, { stageId: string; data: CreateElementRequest }>({
      query: ({ stageId, data }) => ({
        url: `/${stageId}/elements`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { stageId }) => [
        { type: 'StageElement', id: `STAGE_${stageId}` },
        { type: 'Stage', id: stageId },
      ],
    }),

    updateElement: builder.mutation<void, { stageId: string; index: number; data: UpdateElementRequest }>({
      query: ({ stageId, index, data }) => ({
        url: `/${stageId}/elements/${index}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { stageId, index }) => [
        { type: 'StageElement', id: `${stageId}-${index}` },
        { type: 'StageElement', id: `STAGE_${stageId}` },
        { type: 'Stage', id: stageId },
      ],
    }),

    deleteElement: builder.mutation<void, { stageId: string; index: number }>({
      query: ({ stageId, index }) => ({
        url: `/${stageId}/elements/${index}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { stageId, index }) => [
        { type: 'StageElement', id: `${stageId}-${index}` },
        { type: 'StageElement', id: `STAGE_${stageId}` },
        { type: 'Stage', id: stageId },
      ],
    }),

    // === Sounds ===

    addSound: builder.mutation<StageSound, { stageId: string; data: CreateSoundRequest }>({
      query: ({ stageId, data }) => ({
        url: `/${stageId}/sounds`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { stageId }) => [
        { type: 'StageSound', id: `STAGE_${stageId}` },
        { type: 'Stage', id: stageId },
      ],
    }),

    updateSound: builder.mutation<void, { stageId: string; index: number; data: UpdateSoundRequest }>({
      query: ({ stageId, index, data }) => ({
        url: `/${stageId}/sounds/${index}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { stageId, index }) => [
        { type: 'StageSound', id: `${stageId}-${index}` },
        { type: 'StageSound', id: `STAGE_${stageId}` },
        { type: 'Stage', id: stageId },
      ],
    }),

    deleteSound: builder.mutation<void, { stageId: string; index: number }>({
      query: ({ stageId, index }) => ({
        url: `/${stageId}/sounds/${index}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { stageId, index }) => [
        { type: 'StageSound', id: `${stageId}-${index}` },
        { type: 'StageSound', id: `STAGE_${stageId}` },
        { type: 'Stage', id: stageId },
      ],
    }),
  }),
});

export const {
  // Stage CRUD
  useGetStagesQuery,
  useGetStageByIdQuery,
  useCreateStageMutation,
  useUpdateStageMutation,
  useDeleteStageMutation,
  useCloneStageMutation,
  // Walls
  useAddWallMutation,
  useUpdateWallMutation,
  useDeleteWallMutation,
  // Regions
  useAddRegionMutation,
  useUpdateRegionMutation,
  useDeleteRegionMutation,
  // Lights
  useAddLightMutation,
  useUpdateLightMutation,
  useDeleteLightMutation,
  // Elements
  useAddElementMutation,
  useUpdateElementMutation,
  useDeleteElementMutation,
  // Sounds
  useAddSoundMutation,
  useUpdateSoundMutation,
  useDeleteSoundMutation,
} = stageApi;
