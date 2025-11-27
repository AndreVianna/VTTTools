# API Endpoint Definitions

This directory contains reusable RTK Query endpoint definitions that can be used by consuming applications.

## Design Philosophy

RTK Query APIs are tightly coupled to Redux stores, so this library provides **endpoint definitions** rather than complete API slices. Consuming apps will use these definitions with their own store configuration.

## Available Endpoint Builders

- `createWorldEndpoints` - World and world-scoped campaign operations
- `createCampaignEndpoints` - Campaign and campaign-scoped adventure operations
- `createAdventureEndpoints` - Adventure and adventure-scoped encounter operations
- `createEncounterEndpoints` - Encounter, assets, walls, regions, sources, openings
- `createAssetEndpoints` - Asset library management (CRUD, search, pagination)

## Usage Example

```typescript
// In your app's store setup
import { createApi } from '@reduxjs/toolkit/query/react';
import { createApiBaseQuery } from '@vtttools/web-components';
import {
    createWorldEndpoints,
    createCampaignEndpoints,
    createAdventureEndpoints,
    createEncounterEndpoints,
    createAssetEndpoints,
    worldTagTypes,
    campaignTagTypes,
    adventureTagTypes,
    encounterTagTypes,
    assetTagTypes,
} from '@vtttools/web-components';

// Create your app's base query with your config
const baseQuery = createApiBaseQuery({
    baseUrl: '/api/worlds',
    getAuthToken: () => localStorage.getItem('token'),
    getUserId: () => localStorage.getItem('userId'),
    onUnauthorized: () => {
        // Handle unauthorized
    },
});

// Create your API with the endpoint definitions
export const worldsApi = createApi({
    reducerPath: 'worldsApi',
    baseQuery,
    tagTypes: [...worldTagTypes],
    endpoints: (builder) => ({
        ...createWorldEndpoints(builder),
        // Add custom endpoints if needed
        customEndpoint: builder.query({
            query: () => '/custom',
        }),
    }),
});

// Similarly for other APIs
export const campaignsApi = createApi({
    reducerPath: 'campaignsApi',
    baseQuery: createApiBaseQuery({ baseUrl: '/api/campaigns', ... }),
    tagTypes: [...campaignTagTypes],
    endpoints: (builder) => createCampaignEndpoints(builder),
});

export const adventuresApi = createApi({
    reducerPath: 'adventuresApi',
    baseQuery: createApiBaseQuery({ baseUrl: '/api/adventures', ... }),
    tagTypes: [...adventureTagTypes],
    endpoints: (builder) => createAdventureEndpoints(builder),
});

export const encounterApi = createApi({
    reducerPath: 'encounterApi',
    baseQuery: createApiBaseQuery({ baseUrl: '/api/encounters', ... }),
    tagTypes: [...encounterTagTypes],
    endpoints: (builder) => createEncounterEndpoints(builder),
});

export const assetsApi = createApi({
    reducerPath: 'assetsApi',
    baseQuery: createApiBaseQuery({ baseUrl: '/api/assets', ... }),
    tagTypes: [...assetTagTypes],
    endpoints: (builder) => createAssetEndpoints(builder),
});

// Export hooks
export const {
    useGetWorldsQuery,
    useGetWorldQuery,
    useCreateWorldMutation,
    useUpdateWorldMutation,
    useDeleteWorldMutation,
    useCloneWorldMutation,
    useGetCampaignsQuery,
    useCreateCampaignMutation,
    useCloneCampaignMutation,
    useRemoveCampaignMutation,
} = worldsApi;
```

## Tag Types

Each endpoint builder exports a constant array of tag types that should be registered with your API:

- `worldTagTypes`: `['World', 'WorldCampaigns']`
- `campaignTagTypes`: `['Campaign', 'CampaignAdventures']`
- `adventureTagTypes`: `['Adventure', 'AdventureEncounters']`
- `encounterTagTypes`: `['Encounter', 'EncounterAsset', 'EncounterWall', 'EncounterOpening', 'EncounterRegion', 'EncounterSource']`
- `assetTagTypes`: `['Asset']`

## Benefits

1. **Reusability**: Share endpoint logic across multiple applications
2. **Type Safety**: Full TypeScript support with domain types
3. **Flexibility**: Apps can customize base queries and add custom endpoints
4. **Consistency**: Standardized API patterns across the codebase
5. **Maintainability**: Update endpoints in one place, affects all consumers

## Available Endpoints

### World Endpoints
- `getWorlds` - Get all worlds
- `getWorld` - Get single world by ID
- `createWorld` - Create new world
- `updateWorld` - Update world
- `deleteWorld` - Delete world
- `cloneWorld` - Clone existing world
- `getCampaigns` - Get campaigns for a world
- `createCampaign` - Create campaign in world
- `cloneCampaign` - Clone campaign in world
- `removeCampaign` - Remove campaign from world

### Campaign Endpoints
- `getCampaigns` - Get all campaigns
- `getCampaign` - Get single campaign
- `createCampaign` - Create campaign
- `updateCampaign` - Update campaign
- `deleteCampaign` - Delete campaign
- `cloneCampaign` - Clone campaign
- `getAdventures` - Get adventures for campaign
- `createAdventure` - Create adventure in campaign
- `cloneAdventure` - Clone adventure in campaign
- `removeAdventure` - Remove adventure from campaign

### Adventure Endpoints
- `getAdventures` - Get all adventures
- `getAdventure` - Get single adventure
- `createAdventure` - Create adventure
- `updateAdventure` - Update adventure
- `deleteAdventure` - Delete adventure
- `cloneAdventure` - Clone adventure
- `getEncounters` - Get encounters for adventure
- `createEncounter` - Create encounter in adventure
- `cloneEncounter` - Clone encounter in adventure
- `searchAdventures` - Search adventures with filters

### Encounter Endpoints
- `getEncounter` - Get single encounter
- `getEncounters` - Get all encounters
- `createEncounter` - Create encounter
- `updateEncounter` - Update encounter (with versioning)
- `patchEncounter` - Patch encounter (without cache invalidation)
- `deleteEncounter` - Delete encounter
- **Assets**: `addEncounterAsset`, `updateEncounterAsset`, `bulkUpdateEncounterAssets`, `removeEncounterAsset`, `bulkDeleteEncounterAssets`, `bulkAddEncounterAssets`
- **Walls**: `getEncounterWalls`, `addEncounterWall`, `updateEncounterWall`, `removeEncounterWall`
- **Regions**: `getEncounterRegions`, `addEncounterRegion`, `updateEncounterRegion`, `removeEncounterRegion`
- **Sources**: `getEncounterSources`, `addEncounterSource`, `updateEncounterSource`, `removeEncounterSource`
- **Openings**: `addEncounterOpening`, `updateEncounterOpening`, `removeEncounterOpening`

### Asset Endpoints
- `getAssets` - Get all assets (non-paginated, with filters)
- `getAssetsPaged` - Get assets with pagination
- `getAsset` - Get single asset by ID
- `createAsset` - Create new asset
- `updateAsset` - Update asset
- `deleteAsset` - Delete asset

## Notes

- All endpoints use the C# API contracts from the Domain layer for type safety
- Cache invalidation is handled automatically via RTK Query tags
- The `encounterApi` includes optimistic updates for better UX
- Pagination support is available for assets via `getAssetsPaged`
