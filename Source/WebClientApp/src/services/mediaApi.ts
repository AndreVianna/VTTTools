import { createApi } from '@reduxjs/toolkit/query/react';
import type { MediaResource, ResourceFilterData, ResourceFilterResponse } from '@/types/domain';
import { createEnhancedBaseQuery } from './enhancedBaseQuery';

export const mediaApi = createApi({
  reducerPath: 'mediaApi',
  baseQuery: createEnhancedBaseQuery('/api'),
  tagTypes: ['MediaResource'],
  endpoints: (builder) => ({
    filterResources: builder.query<ResourceFilterResponse, ResourceFilterData>({
      query: (filter = {}) => ({
        url: '/resources',
        params: filter,
      }),
      providesTags: ['MediaResource'],
    }),

    getMediaResource: builder.query<MediaResource, string>({
      query: (id) => `/resources/${id}/info`,
      providesTags: (_result, _error, id) => [{ type: 'MediaResource', id }],
    }),

    uploadFile: builder.mutation<
      MediaResource,
      {
        file: File;
        resourceType?: string;
        entityId?: string;
      }
    >({
      query: ({ file, resourceType = 'token', entityId }) => {
        const formData = new FormData();
        formData.append('resourceType', resourceType);
        formData.append('file', file);

        if (entityId) {
          formData.append('entityId', entityId);
        }

        return {
          url: '/resources',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['MediaResource'],
    }),

    deleteResource: builder.mutation<void, string>({
      query: (id) => ({
        url: `/resources/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MediaResource'],
    }),
  }),
});

export const {
  useFilterResourcesQuery,
  useGetMediaResourceQuery,
  useUploadFileMutation,
  useDeleteResourceMutation,
} = mediaApi;
