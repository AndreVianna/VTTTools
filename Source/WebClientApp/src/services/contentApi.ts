import { createApi } from '@reduxjs/toolkit/query/react';
import { createEnhancedBaseQuery } from './enhancedBaseQuery';
import type { Adventure } from '@/types/domain';

export interface ContentFilters {
    after?: string;
    limit?: number;
    contentType?: 'adventure' | 'campaign' | 'epic';
    style?: number;
    isOneShot?: boolean;
    minSceneCount?: number;
    maxSceneCount?: number;
    isPublished?: boolean;
    search?: string;
    owner?: 'mine' | 'public';
}

export interface PagedContentResponse {
    data: Adventure[];
    nextCursor: string | null;
    hasMore: boolean;
}

export const contentApi = createApi({
    reducerPath: 'contentApi',
    baseQuery: createEnhancedBaseQuery('/api/library'),
    tagTypes: ['Content'],
    endpoints: (builder) => ({
        getContent: builder.query<PagedContentResponse, ContentFilters>({
            query: (filters = {}) => ({
                url: '/',
                params: {
                    after: filters.after,
                    limit: filters.limit || 20,
                    contentType: filters.contentType,
                    style: filters.style,
                    isOneShot: filters.isOneShot,
                    minSceneCount: filters.minSceneCount,
                    maxSceneCount: filters.maxSceneCount,
                    isPublished: filters.isPublished,
                    search: filters.search,
                    owner: filters.owner
                }
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({ type: 'Content' as const, id })),
                        { type: 'Content', id: 'LIST' }
                    ]
                    : [{ type: 'Content', id: 'LIST' }],
            serializeQueryArgs: ({ queryArgs }) => {
                const { after, limit, ...cacheKey } = queryArgs;
                return JSON.stringify(cacheKey);
            },
            merge: (currentCache, newResponse, { arg }) => {
                if (!arg.after) {
                    return newResponse;
                }
                return {
                    ...newResponse,
                    data: [...(currentCache?.data || []), ...newResponse.data]
                };
            },
            forceRefetch: ({ currentArg, previousArg }) => {
                if (!previousArg) return true;

                if (currentArg?.after !== previousArg?.after) return true;

                const { after: ca, limit: cl, ...currFilters } = currentArg || {};
                const { after: pa, limit: pl, ...prevFilters } = previousArg || {};

                return JSON.stringify(currFilters) !== JSON.stringify(prevFilters);
            }
        })
    })
});

export const { useGetContentQuery } = contentApi;
