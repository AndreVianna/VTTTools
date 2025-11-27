import type { EndpointBuilder } from '@reduxjs/toolkit/query/react';
import type {
    Adventure,
    CreateAdventureRequest,
    CreateEncounterRequest,
    Encounter,
    UpdateAdventureRequest,
} from '../../types/domain';

export const createAdventureEndpoints = (builder: EndpointBuilder<any, string, string>) => ({
    getAdventures: builder.query<Adventure[], void>({
        query: () => '',
        providesTags: ['Adventure'],
    }),

    getAdventure: builder.query<Adventure, string>({
        query: (id) => `/${id}`,
        providesTags: (_result, _error, id) => [{ type: 'Adventure' as const, id }],
    }),

    createAdventure: builder.mutation<Adventure, CreateAdventureRequest>({
        query: (request) => ({
            url: '',
            method: 'POST',
            body: request,
        }),
        invalidatesTags: ['Adventure'],
    }),

    updateAdventure: builder.mutation<Adventure, { id: string; request: UpdateAdventureRequest }>({
        query: ({ id, request }) => ({
            url: `/${id}`,
            method: 'PATCH',
            body: request,
        }),
        invalidatesTags: (_result, _error, { id }) => [{ type: 'Adventure' as const, id }],
    }),

    deleteAdventure: builder.mutation<void, string>({
        query: (id) => ({
            url: `/${id}`,
            method: 'DELETE',
        }),
        invalidatesTags: ['Adventure'],
    }),

    cloneAdventure: builder.mutation<Adventure, { id: string; name?: string }>({
        query: ({ id, name }) => ({
            url: `/${id}/clone`,
            method: 'POST',
            body: { name },
        }),
        invalidatesTags: ['Adventure'],
    }),

    getEncounters: builder.query<Encounter[], string>({
        query: (adventureId) => `/${adventureId}/encounters`,
        providesTags: (_result, _error, adventureId) => [{ type: 'AdventureEncounters' as const, id: adventureId }],
    }),

    createEncounter: builder.mutation<Encounter, { adventureId: string; request: CreateEncounterRequest }>({
        query: ({ adventureId, request }) => ({
            url: `/${adventureId}/encounters`,
            method: 'POST',
            body: request,
        }),
        invalidatesTags: (_result, _error, { adventureId }) => [{ type: 'AdventureEncounters' as const, id: adventureId }],
    }),

    cloneEncounter: builder.mutation<Encounter, { adventureId: string; encounterId: string; name?: string }>({
        query: ({ adventureId, encounterId, name }) => ({
            url: `/${adventureId}/encounters/${encounterId}/clone`,
            method: 'POST',
            body: name ? { name } : undefined,
        }),
        invalidatesTags: (_result, _error, { adventureId }) => [{ type: 'AdventureEncounters' as const, id: adventureId }],
    }),

    searchAdventures: builder.query<
        Adventure[],
        {
            query?: string;
            type?: string;
            tags?: string[];
            limit?: number;
        }
    >({
        query: (params) => ({
            url: '/search',
            params,
        }),
        providesTags: ['Adventure'],
    }),
});

export const adventureTagTypes = ['Adventure', 'AdventureEncounters'] as const;
export type AdventureTagType = (typeof adventureTagTypes)[number];
