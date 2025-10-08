import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  CreateAssetRequest,
  UpdateAssetRequest,
  Asset,
  AssetKind
} from '@/types/domain';
import { createEnhancedBaseQuery } from './enhancedBaseQuery';

/**
 * Assets API - RTK Query slice for Asset CRUD operations
 * Supports ObjectAssets (furniture, traps) and CreatureAssets (characters, monsters)
 * Phase 5 Step 1 - Updated for new domain model (AssetKind, polymorphic properties)
 */
export const assetsApi = createApi({
  reducerPath: 'assetsApi',
  baseQuery: createEnhancedBaseQuery('/api/assets'),
  tagTypes: ['Asset'],
  endpoints: (builder) => ({
    /**
     * Get all assets with optional filtering
     * Query params: kind (Object/Creature), search (name), published, owner
     */
    getAssets: builder.query<Asset[], {
      kind?: AssetKind;
      search?: string;
      published?: boolean;
      owner?: string;
    }>({
      query: (params = {}) => ({
        url: '',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Asset' as const, id })),
              { type: 'Asset', id: 'LIST' },
            ]
          : [{ type: 'Asset', id: 'LIST' }],
    }),

    /**
     * Get single asset by ID
     * Returns ObjectAsset or CreatureAsset based on kind
     */
    getAsset: builder.query<Asset, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Asset', id }],
    }),

    /**
     * Create new asset (ObjectAsset or CreatureAsset)
     * Request must include kind and corresponding properties (objectProps or creatureProps)
     */
    createAsset: builder.mutation<Asset, CreateAssetRequest>({
      query: (request) => ({
        url: '',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: [{ type: 'Asset', id: 'LIST' }],
    }),

    /**
     * Update existing asset
     * Can update common fields (name, description) or kind-specific properties
     */
    updateAsset: builder.mutation<void, { id: string; request: UpdateAssetRequest }>({
      query: ({ id, request }) => ({
        url: `/${id}`,
        method: 'PATCH',  // Changed from PUT to match backend
        body: request,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Asset', id },
        { type: 'Asset', id: 'LIST' },
      ],
    }),

    /**
     * Delete asset
     * Note: May fail if asset is in use on any scenes
     */
    deleteAsset: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Asset', id },
        { type: 'Asset', id: 'LIST' },
      ],
    }),

  }),
});

/**
 * Auto-generated React hooks for Assets API
 * Use these hooks in React components to interact with the Assets API
 */

export const {
  useGetAssetsQuery,
  useGetAssetQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
} = assetsApi;