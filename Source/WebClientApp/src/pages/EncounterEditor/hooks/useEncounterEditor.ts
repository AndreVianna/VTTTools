import { useCallback, useMemo } from 'react';
import {
  useGetEncounterQuery,
  usePatchEncounterMutation,
  useAddEncounterAssetMutation,
  useUpdateEncounterAssetMutation,
  useRemoveEncounterAssetMutation,
  useBulkAddEncounterAssetsMutation,
  useBulkUpdateEncounterAssetsMutation,
  useBulkDeleteEncounterAssetsMutation,
} from '@/services/encounterApi';
import {
  useAddWallMutation,
  useUpdateWallMutation,
  useDeleteWallMutation,
  useAddRegionMutation,
  useUpdateRegionMutation,
  useDeleteRegionMutation,
  useAddLightMutation,
  useUpdateLightMutation,
  useDeleteLightMutation,
  useAddSoundMutation,
  useUpdateSoundMutation,
  useDeleteSoundMutation,
  useUpdateStageMutation,
} from '@/services/stageApi';
import type {
  CreateWallRequest,
  UpdateWallRequest,
  CreateRegionRequest,
  UpdateRegionRequest,
  CreateLightRequest,
  UpdateLightRequest,
  CreateSoundRequest,
  UpdateSoundRequest,
  UpdateStageSettingsRequest,
  UpdateStageGridRequest,
  StageWall,
} from '@/types/stage';
import type { UpdateEncounterRequest, Point } from '@/types/domain';

export interface UseEncounterEditorOptions {
  encounterId: string;
  skip?: boolean;
}

export interface UseEncounterEditorResult {
  // Data
  encounter: ReturnType<typeof useGetEncounterQuery>['data'];
  stage: ReturnType<typeof useGetEncounterQuery>['data'] extends { stage: infer S } ? S : undefined;
  stageId: string | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;

  // Encounter mutations (metadata)
  updateEncounter: (data: UpdateEncounterRequest) => Promise<void>;

  // Stage settings mutations
  updateStageSettings: (settings: UpdateStageSettingsRequest) => Promise<void>;
  updateStageGrid: (grid: UpdateStageGridRequest) => Promise<void>;

  // Structural element mutations (→ Stage API)
  addWall: (data: CreateWallRequest) => Promise<StageWall>;
  updateWall: (index: number, data: UpdateWallRequest) => Promise<void>;
  deleteWall: (index: number) => Promise<void>;

  addRegion: (data: CreateRegionRequest) => Promise<void>;
  updateRegion: (index: number, data: UpdateRegionRequest) => Promise<void>;
  deleteRegion: (index: number) => Promise<void>;

  addLight: (data: CreateLightRequest) => Promise<void>;
  updateLight: (index: number, data: UpdateLightRequest) => Promise<void>;
  deleteLight: (index: number) => Promise<void>;

  addSound: (data: CreateSoundRequest) => Promise<void>;
  updateSound: (index: number, data: UpdateSoundRequest) => Promise<void>;
  deleteSound: (index: number) => Promise<void>;

  // Game element mutations (→ Encounter API)
  addAsset: (params: {
    libraryAssetId: string;
    position: Point;
    size: { width: number; height: number };
    rotation?: number;
    tokenId?: string;
    portraitId?: string;
    notes?: string;
    isVisible?: boolean;
  }) => Promise<void>;
  updateAsset: (params: {
    assetNumber: number;
    position?: Point;
    size?: { width: number; height: number };
    rotation?: number;
    name?: string;
    tokenId?: string;
    portraitId?: string;
    notes?: string;
    visible?: boolean;
    locked?: boolean;
  }) => Promise<void>;
  removeAsset: (assetNumber: number) => Promise<void>;
  bulkAddAssets: (assets: Array<{
    assetId: string;
    position: Point;
    size: { width: number; height: number };
    rotation?: number;
    elevation?: number;
    tokenId?: string;
    portraitId?: string;
    name?: string;
    notes?: string;
    isVisible?: boolean;
  }>) => Promise<void>;
  bulkUpdateAssets: (updates: Array<{
    index: number;
    position?: Point;
    size?: { width: number; height: number };
    rotation?: number;
    elevation?: number;
  }>) => Promise<void>;
  bulkDeleteAssets: (assetIndices: number[]) => Promise<void>;
}

export const useEncounterEditor = ({
  encounterId,
  skip = false,
}: UseEncounterEditorOptions): UseEncounterEditorResult => {
  // Fetch encounter (includes stage via navigation property)
  const {
    data: encounter,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetEncounterQuery(encounterId, { skip });

  // Extract stage and stageId
  const stage = encounter?.stage;
  const stageId = stage?.id;

  // Encounter mutations
  const [patchEncounter] = usePatchEncounterMutation();

  // Stage mutations
  const [updateStageMutation] = useUpdateStageMutation();

  // Structural element mutations (Stage API)
  const [addWallMutation] = useAddWallMutation();
  const [updateWallMutation] = useUpdateWallMutation();
  const [deleteWallMutation] = useDeleteWallMutation();

  const [addRegionMutation] = useAddRegionMutation();
  const [updateRegionMutation] = useUpdateRegionMutation();
  const [deleteRegionMutation] = useDeleteRegionMutation();

  const [addLightMutation] = useAddLightMutation();
  const [updateLightMutation] = useUpdateLightMutation();
  const [deleteLightMutation] = useDeleteLightMutation();

  const [addSoundMutation] = useAddSoundMutation();
  const [updateSoundMutation] = useUpdateSoundMutation();
  const [deleteSoundMutation] = useDeleteSoundMutation();

  // Game element mutations (Encounter API)
  const [addAssetMutation] = useAddEncounterAssetMutation();
  const [updateAssetMutation] = useUpdateEncounterAssetMutation();
  const [removeAssetMutation] = useRemoveEncounterAssetMutation();
  const [bulkAddAssetsMutation] = useBulkAddEncounterAssetsMutation();
  const [bulkUpdateAssetsMutation] = useBulkUpdateEncounterAssetsMutation();
  const [bulkDeleteAssetsMutation] = useBulkDeleteEncounterAssetsMutation();

  // Encounter metadata mutation
  const updateEncounter = useCallback(
    async (data: UpdateEncounterRequest) => {
      await patchEncounter({ id: encounterId, request: data }).unwrap();
    },
    [patchEncounter, encounterId]
  );

  // Stage settings mutations
  const updateStageSettings = useCallback(
    async (settings: UpdateStageSettingsRequest) => {
      if (!stageId) throw new Error('Stage not loaded');
      await updateStageMutation({ id: stageId, data: { settings } }).unwrap();
    },
    [updateStageMutation, stageId]
  );

  const updateStageGrid = useCallback(
    async (grid: UpdateStageGridRequest) => {
      if (!stageId) throw new Error('Stage not loaded');
      await updateStageMutation({ id: stageId, data: { grid } }).unwrap();
    },
    [updateStageMutation, stageId]
  );

  // Wall mutations
  const addWall = useCallback(
    async (data: CreateWallRequest): Promise<StageWall> => {
      if (!stageId) throw new Error('Stage not loaded');
      return await addWallMutation({ stageId, data }).unwrap();
    },
    [addWallMutation, stageId]
  );

  const updateWall = useCallback(
    async (index: number, data: UpdateWallRequest) => {
      if (!stageId) throw new Error('Stage not loaded');
      await updateWallMutation({ stageId, index, data }).unwrap();
    },
    [updateWallMutation, stageId]
  );

  const deleteWall = useCallback(
    async (index: number) => {
      if (!stageId) throw new Error('Stage not loaded');
      await deleteWallMutation({ stageId, index }).unwrap();
    },
    [deleteWallMutation, stageId]
  );

  // Region mutations
  const addRegion = useCallback(
    async (data: CreateRegionRequest) => {
      if (!stageId) throw new Error('Stage not loaded');
      await addRegionMutation({ stageId, data }).unwrap();
    },
    [addRegionMutation, stageId]
  );

  const updateRegion = useCallback(
    async (index: number, data: UpdateRegionRequest) => {
      if (!stageId) throw new Error('Stage not loaded');
      await updateRegionMutation({ stageId, index, data }).unwrap();
    },
    [updateRegionMutation, stageId]
  );

  const deleteRegion = useCallback(
    async (index: number) => {
      if (!stageId) throw new Error('Stage not loaded');
      await deleteRegionMutation({ stageId, index }).unwrap();
    },
    [deleteRegionMutation, stageId]
  );

  // Light mutations
  const addLight = useCallback(
    async (data: CreateLightRequest) => {
      if (!stageId) throw new Error('Stage not loaded');
      await addLightMutation({ stageId, data }).unwrap();
    },
    [addLightMutation, stageId]
  );

  const updateLight = useCallback(
    async (index: number, data: UpdateLightRequest) => {
      if (!stageId) throw new Error('Stage not loaded');
      await updateLightMutation({ stageId, index, data }).unwrap();
    },
    [updateLightMutation, stageId]
  );

  const deleteLight = useCallback(
    async (index: number) => {
      if (!stageId) throw new Error('Stage not loaded');
      await deleteLightMutation({ stageId, index }).unwrap();
    },
    [deleteLightMutation, stageId]
  );

  // Sound mutations
  const addSound = useCallback(
    async (data: CreateSoundRequest) => {
      if (!stageId) throw new Error('Stage not loaded');
      await addSoundMutation({ stageId, data }).unwrap();
    },
    [addSoundMutation, stageId]
  );

  const updateSound = useCallback(
    async (index: number, data: UpdateSoundRequest) => {
      if (!stageId) throw new Error('Stage not loaded');
      await updateSoundMutation({ stageId, index, data }).unwrap();
    },
    [updateSoundMutation, stageId]
  );

  const deleteSound = useCallback(
    async (index: number) => {
      if (!stageId) throw new Error('Stage not loaded');
      await deleteSoundMutation({ stageId, index }).unwrap();
    },
    [deleteSoundMutation, stageId]
  );

  // Asset mutations
  const addAsset = useCallback(
    async (params: Parameters<UseEncounterEditorResult['addAsset']>[0]) => {
      await addAssetMutation({ encounterId, ...params }).unwrap();
    },
    [addAssetMutation, encounterId]
  );

  const updateAsset = useCallback(
    async (params: Parameters<UseEncounterEditorResult['updateAsset']>[0]) => {
      await updateAssetMutation({ encounterId, ...params }).unwrap();
    },
    [updateAssetMutation, encounterId]
  );

  const removeAsset = useCallback(
    async (assetNumber: number) => {
      await removeAssetMutation({ encounterId, assetNumber }).unwrap();
    },
    [removeAssetMutation, encounterId]
  );

  const bulkAddAssets = useCallback(
    async (assets: Parameters<UseEncounterEditorResult['bulkAddAssets']>[0]) => {
      await bulkAddAssetsMutation({ encounterId, assets }).unwrap();
    },
    [bulkAddAssetsMutation, encounterId]
  );

  const bulkUpdateAssets = useCallback(
    async (updates: Parameters<UseEncounterEditorResult['bulkUpdateAssets']>[0]) => {
      await bulkUpdateAssetsMutation({ encounterId, updates }).unwrap();
    },
    [bulkUpdateAssetsMutation, encounterId]
  );

  const bulkDeleteAssets = useCallback(
    async (assetIndices: number[]) => {
      await bulkDeleteAssetsMutation({ encounterId, assetIndices }).unwrap();
    },
    [bulkDeleteAssetsMutation, encounterId]
  );

  return useMemo(
    () => ({
      // Data
      encounter,
      stage,
      stageId,
      isLoading,
      isError,
      error,
      refetch,

      // Encounter mutations
      updateEncounter,

      // Stage settings mutations
      updateStageSettings,
      updateStageGrid,

      // Structural element mutations
      addWall,
      updateWall,
      deleteWall,
      addRegion,
      updateRegion,
      deleteRegion,
      addLight,
      updateLight,
      deleteLight,
      addSound,
      updateSound,
      deleteSound,

      // Game element mutations
      addAsset,
      updateAsset,
      removeAsset,
      bulkAddAssets,
      bulkUpdateAssets,
      bulkDeleteAssets,
    }),
    [
      encounter,
      stage,
      stageId,
      isLoading,
      isError,
      error,
      refetch,
      updateEncounter,
      updateStageSettings,
      updateStageGrid,
      addWall,
      updateWall,
      deleteWall,
      addRegion,
      updateRegion,
      deleteRegion,
      addLight,
      updateLight,
      deleteLight,
      addSound,
      updateSound,
      deleteSound,
      addAsset,
      updateAsset,
      removeAsset,
      bulkAddAssets,
      bulkUpdateAssets,
      bulkDeleteAssets,
    ]
  );
};
