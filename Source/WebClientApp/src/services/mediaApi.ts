import { createApi } from '@reduxjs/toolkit/query/react';
import type { UploadRequest, AddResourceRequest, UpdateResourceRequest, MediaResource } from '@/types/domain';
import { createEnhancedBaseQuery } from './enhancedBaseQuery';

// Media API consuming existing Media microservice
export const mediaApi = createApi({
  reducerPath: 'mediaApi',
  baseQuery: createEnhancedBaseQuery('/api/media'),
  tagTypes: ['MediaResource'],
  endpoints: (builder) => ({
    // Get all media resources
    getMediaResources: builder.query<MediaResource[], {
      type?: string;
      search?: string;
      tags?: string[];
      limit?: number;
      offset?: number;
    }>({
      query: (params = {}) => ({
        url: '',
        params,
      }),
      providesTags: ['MediaResource'],
    }),

    // Get single media resource
    getMediaResource: builder.query<MediaResource, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'MediaResource', id }],
    }),

    // Upload file using existing UploadRequest from Domain.Media.ApiContracts
    uploadFile: builder.mutation<{ uploadUrl: string; resourceId?: string }, {
      file: File;
      metadata?: Partial<UploadRequest>;
    }>({
      query: ({ file, metadata = {} }) => {
        const formData = new FormData();
        formData.append('file', file);

        // Add metadata from UploadRequest contract
        if (metadata.fileName) formData.append('fileName', metadata.fileName);
        if (metadata.contentType) formData.append('contentType', metadata.contentType);
        if (metadata.fileSize !== undefined) formData.append('fileSize', metadata.fileSize.toString());
        if (metadata.tags) formData.append('tags', JSON.stringify(metadata.tags));

        return {
          url: '/upload',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['MediaResource'],
    }),

    // Add resource using existing AddResourceRequest from Domain.Media.ApiContracts
    addResource: builder.mutation<MediaResource, AddResourceRequest>({
      query: (request) => ({
        url: '/resources',
        method: 'POST',
        body: request, // Matches existing C# contract exactly
      }),
      invalidatesTags: ['MediaResource'],
    }),

    // Update resource using existing UpdateResourceRequest from Domain.Media.ApiContracts
    updateResource: builder.mutation<MediaResource, { id: string; request: UpdateResourceRequest }>({
      query: ({ id, request }) => ({
        url: `/resources/${id}`,
        method: 'PUT',
        body: request, // Matches existing C# contract exactly
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'MediaResource', id }],
    }),

    // Delete resource
    deleteResource: builder.mutation<void, string>({
      query: (id) => ({
        url: `/resources/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MediaResource'],
    }),

    // Get resources by type
    getResourcesByType: builder.query<MediaResource[], string>({
      query: (type) => `/resources/type/${type}`,
      providesTags: ['MediaResource'],
    }),

    // Search resources
    searchResources: builder.query<MediaResource[], {
      query: string;
      type?: string;
      tags?: string[];
      limit?: number;
    }>({
      query: (params) => ({
        url: '/resources/search',
        params,
      }),
      providesTags: ['MediaResource'],
    }),

    // Get resource download URL
    getResourceDownloadUrl: builder.query<{ downloadUrl: string; expiresAt: string }, string>({
      query: (id) => `/resources/${id}/download`,
    }),

    // Get resource thumbnail URL
    getResourceThumbnailUrl: builder.query<{ thumbnailUrl: string }, {
      id: string;
      size?: 'small' | 'medium' | 'large';
    }>({
      query: ({ id, size = 'medium' }) => `/resources/${id}/thumbnail?size=${size}`,
    }),

    // Bulk upload files
    bulkUploadFiles: builder.mutation<Array<{
      file: string;
      resourceId?: string;
      error?: string;
    }>, {
      files: File[];
      metadata?: Partial<UploadRequest>;
    }>({
      query: ({ files, metadata = {} }) => {
        const formData = new FormData();

        files.forEach((file, index) => {
          formData.append(`files[${index}]`, file);
        });

        // Add metadata
        if (metadata.tags) formData.append('tags', JSON.stringify(metadata.tags));

        return {
          url: '/upload/bulk',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['MediaResource'],
    }),

    // Bulk delete resources
    bulkDeleteResources: builder.mutation<void, string[]>({
      query: (ids) => ({
        url: '/resources/bulk-delete',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: ['MediaResource'],
    }),

    // Get upload progress (for chunked uploads)
    getUploadProgress: builder.query<{
      uploadId: string;
      progress: number;
      status: 'uploading' | 'processing' | 'complete' | 'error';
      error?: string;
    }, string>({
      query: (uploadId) => `/upload/${uploadId}/progress`,
    }),

    // Cancel upload
    cancelUpload: builder.mutation<void, string>({
      query: (uploadId) => ({
        url: `/upload/${uploadId}/cancel`,
        method: 'DELETE',
      }),
    }),

    // Get storage statistics
    getStorageStats: builder.query<{
      totalFiles: number;
      totalSize: number;
      usedStorage: number;
      storageLimit: number;
      fileTypes: Array<{ type: string; count: number; size: number }>;
    }, void>({
      query: () => '/stats',
    }),

    // Optimize resource (compress, resize, etc.)
    optimizeResource: builder.mutation<MediaResource, {
      id: string;
      optimizations: {
        resize?: { width: number; height: number };
        compress?: { quality: number };
        format?: string;
      };
    }>({
      query: ({ id, optimizations }) => ({
        url: `/resources/${id}/optimize`,
        method: 'POST',
        body: optimizations,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'MediaResource', id }],
    }),
  }),
});

export const {
  useGetMediaResourcesQuery,
  useGetMediaResourceQuery,
  useUploadFileMutation,
  useAddResourceMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
  useGetResourcesByTypeQuery,
  useSearchResourcesQuery,
  useGetResourceDownloadUrlQuery,
  useGetResourceThumbnailUrlQuery,
  useBulkUploadFilesMutation,
  useBulkDeleteResourcesMutation,
  useGetUploadProgressQuery,
  useCancelUploadMutation,
  useGetStorageStatsQuery,
  useOptimizeResourceMutation,
} = mediaApi;