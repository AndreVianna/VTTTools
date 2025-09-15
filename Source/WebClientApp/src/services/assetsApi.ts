import { createApi } from '@reduxjs/toolkit/query/react';
import type { CreateAssetRequest, UpdateAssetRequest, Asset } from '@/types/domain';
import { createEnhancedBaseQuery } from './enhancedBaseQuery';

// Assets API consuming existing Assets microservice
export const assetsApi = createApi({
  reducerPath: 'assetsApi',
  baseQuery: createEnhancedBaseQuery('/api/assets'),
  tagTypes: ['Asset'],
  endpoints: (builder) => ({
    // Get all assets
    getAssets: builder.query<Asset[], {
      type?: string;
      search?: string;
      limit?: number;
      offset?: number;
    }>({
      query: (params = {}) => ({
        url: '',
        params,
      }),
      providesTags: ['Asset'],
    }),

    // Get single asset
    getAsset: builder.query<Asset, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Asset', id }],
    }),

    // Create asset using existing CreateAssetRequest from Domain.Assets.ApiContracts
    createAsset: builder.mutation<Asset, CreateAssetRequest>({
      query: (request) => ({
        url: '',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Asset'],
    }),

    // Update asset using existing UpdateAssetRequest from Domain.Assets.ApiContracts
    updateAsset: builder.mutation<Asset, { id: string; request: UpdateAssetRequest }>({
      query: ({ id, request }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: request,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Asset', id }],
    }),

    // Delete asset
    deleteAsset: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Asset'],
    }),

    // Search assets
    searchAssets: builder.query<Asset[], {
      query: string;
      type?: string;
      tags?: string[];
      limit?: number;
    }>({
      query: (params) => ({
        url: '/search',
        params,
      }),
      providesTags: ['Asset'],
    }),

    // Get assets by type
    getAssetsByType: builder.query<Asset[], string>({
      query: (type) => `/type/${type}`,
      providesTags: ['Asset'],
    }),

    // Get asset categories/types
    getAssetTypes: builder.query<string[], void>({
      query: () => '/types',
    }),

    // Bulk delete assets
    bulkDeleteAssets: builder.mutation<void, string[]>({
      query: (ids) => ({
        url: '/bulk-delete',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: ['Asset'],
    }),

    // Bulk update assets
    bulkUpdateAssets: builder.mutation<Asset[], {
      ids: string[];
      updates: Partial<UpdateAssetRequest>;
    }>({
      query: ({ ids, updates }) => ({
        url: '/bulk-update',
        method: 'PUT',
        body: { ids, updates },
      }),
      invalidatesTags: ['Asset'],
    }),

    // Clone asset
    cloneAsset: builder.mutation<Asset, { id: string; name?: string }>({
      query: ({ id, name }) => ({
        url: `/${id}/clone`,
        method: 'POST',
        body: { name },
      }),
      invalidatesTags: ['Asset'],
    }),

    // Get asset usage (where it's used in scenes)
    getAssetUsage: builder.query<{
      scenes: Array<{ id: string; name: string; adventureId: string }>;
      totalUsages: number;
    }, string>({
      query: (id) => `/${id}/usage`,
    }),

    // Import assets from external source
    importAssets: builder.mutation<Asset[], {
      source: 'url' | 'upload';
      data: any;
    }>({
      query: ({ source, data }) => ({
        url: '/import',
        method: 'POST',
        body: { source, data },
      }),
      invalidatesTags: ['Asset'],
    }),
  }),
});

export const {
  useGetAssetsQuery,
  useGetAssetQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
  useSearchAssetsQuery,
  useGetAssetsByTypeQuery,
  useGetAssetTypesQuery,
  useBulkDeleteAssetsMutation,
  useBulkUpdateAssetsMutation,
  useCloneAssetMutation,
  useGetAssetUsageQuery,
  useImportAssetsMutation,
} = assetsApi;