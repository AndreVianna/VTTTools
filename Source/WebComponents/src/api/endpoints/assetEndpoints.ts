import type { EndpointBuilder } from '@reduxjs/toolkit/query/react';
import type { Asset, AssetKind, CreateAssetRequest, UpdateAssetRequest } from '../../types/domain';

export const createAssetEndpoints = (builder: EndpointBuilder<any, string, string>) => ({
    getAssets: builder.query<
        Asset[],
        {
            kind?: AssetKind;
            search?: string;
            published?: boolean;
            owner?: 'mine' | 'public' | 'all';
        }
    >({
        query: (params = {}) => ({
            url: '',
            params,
        }),
        providesTags: (result) =>
            result
                ? [
                      ...result.map(({ id }) => ({ type: 'Asset' as const, id })),
                      { type: 'Asset' as const, id: 'LIST' },
                  ]
                : [{ type: 'Asset' as const, id: 'LIST' }],
    }),

    getAssetsPaged: builder.query<
        {
            data: Asset[];
            page: number;
            pageSize: number;
            totalCount: number;
            totalPages: number;
        },
        {
            kind?: AssetKind;
            search?: string;
            published?: boolean;
            owner?: 'mine' | 'public' | 'all';
            page: number;
            pageSize: number;
        }
    >({
        query: (params) => ({
            url: '',
            params,
        }),
        providesTags: (result) =>
            result?.data
                ? [
                      ...result.data.map(({ id }) => ({ type: 'Asset' as const, id })),
                      { type: 'Asset' as const, id: 'LIST' },
                  ]
                : [{ type: 'Asset' as const, id: 'LIST' }],
    }),

    getAsset: builder.query<Asset, string>({
        query: (id) => `/${id}`,
        providesTags: (_result, _error, arg) => [{ type: 'Asset' as const, id: arg }],
    }),

    createAsset: builder.mutation<Asset, CreateAssetRequest>({
        query: (request) => ({
            url: '',
            method: 'POST',
            body: request,
        }),
        invalidatesTags: [{ type: 'Asset' as const, id: 'LIST' }],
    }),

    updateAsset: builder.mutation<void, { id: string; request: UpdateAssetRequest }>({
        query: ({ id, request }) => ({
            url: `/${id}`,
            method: 'PATCH',
            body: request,
        }),
        invalidatesTags: (_result, _error, { id }) => [
            { type: 'Asset' as const, id },
            { type: 'Asset' as const, id: 'LIST' },
        ],
    }),

    deleteAsset: builder.mutation<void, string>({
        query: (id) => ({
            url: `/${id}`,
            method: 'DELETE',
        }),
        invalidatesTags: (_result, _error, arg) => [
            { type: 'Asset' as const, id: arg },
            { type: 'Asset' as const, id: 'LIST' },
        ],
    }),
});

export const assetTagTypes = ['Asset'] as const;
export type AssetTagType = (typeof assetTagTypes)[number];
