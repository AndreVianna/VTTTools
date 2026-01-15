import { createApi } from '@reduxjs/toolkit/query/react';
import type { MediaResource, ResourceFilterData, ResourceFilterResponse } from '@/types/domain';
import { createEnhancedBaseQuery } from './enhancedBaseQuery';

export const mediaApi = createApi({
    reducerPath: 'mediaApi',
    baseQuery: createEnhancedBaseQuery('/api'),
    tagTypes: ['MediaResource'],
    endpoints: (builder) => ({
        filterResources: builder.query<ResourceFilterResponse, ResourceFilterData>({
            query: (filter = {}) => {
                const { mediaTypes, ...rest } = filter;
                const params: Record<string, unknown> = { ...rest };
                if (mediaTypes && mediaTypes.length > 0) {
                    params.mediaTypes = mediaTypes.join(',');
                }
                return {
                    url: '/resources',
                    params,
                };
            },
            serializeQueryArgs: ({ queryArgs }) => {
                // biome-ignore lint/correctness/noUnusedVariables: skip/take intentionally excluded from cache key
                const { skip, take, ...cacheKey } = queryArgs ?? {};
                return JSON.stringify(cacheKey);
            },
            merge: (currentCache, newItems, { arg }) => {
                if (!arg?.skip) {
                    return newItems;
                }
                return {
                    ...newItems,
                    items: [...(currentCache?.items ?? []), ...newItems.items],
                };
            },
            forceRefetch: ({ currentArg, previousArg }) => {
                if (!previousArg) return true;
                if (currentArg?.skip !== previousArg?.skip) return true;
                if (currentArg?.take !== previousArg?.take) return true;

                // biome-ignore lint/correctness/noUnusedVariables: pagination params excluded for filter comparison
                const { skip: _cs, take: _ct, ...currFilters } = currentArg ?? {};
                // biome-ignore lint/correctness/noUnusedVariables: pagination params excluded for filter comparison
                const { skip: _ps, take: _pt, ...prevFilters } = previousArg ?? {};
                return JSON.stringify(currFilters) !== JSON.stringify(prevFilters);
            },
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
                role?: string;
                ownerId?: string;
            }
        >({
            query: ({ file, role = 'Token', ownerId }) => {
                const formData = new FormData();
                formData.append('role', role);
                formData.append('file', file);

                if (ownerId) {
                    formData.append('ownerId', ownerId);
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
