# Phase 7: Scene Management - Design Specification

**Phase**: 7
**Version**: 1.0
**Created**: 2025-10-23
**Status**: Design - Ready for Implementation

---

## Overview

Phase 7 implements Scene Management with an integrated editor-as-CRUD approach, where the Scene Editor serves as both the creation and editing interface. This eliminates traditional CRUD dialogs in favor of a seamless, modern editing experience.

## User Journeys

### Journey 1: Creating a New Scene

**Starting Point**: User on Dashboard or Content Library

**Steps**:
1. User navigates to Content Library
2. Clicks "Scenes" tab (active)
3. Sees existing scenes as cards in grid
4. Clicks "New Scene" button
5. System creates blank scene in backend with auto-generated name
6. Navigates to `/scene-editor/:newSceneId`
7. Scene Editor opens with:
   - Header: "Untitled Scene" (editable, focused for immediate rename)
   - Scene menu: Adventure=None, Description=empty, Published=false
   - Stage menu: Default grid configuration
   - Canvas: Empty (no assets placed)
8. User immediately clicks title, renames to "Goblin Ambush"
9. Opens Scene menu, selects parent Adventure "Campaign Quest Arc"
10. Adds description: "Forest clearing where goblins ambush the party"
11. Opens Stage menu, changes grid to Hex-H, sets cell size to 50×50
12. Places assets from library onto canvas (trees, goblins, treasure)
13. All changes auto-save continuously (debounced)
14. User clicks "Back" button in header
15. Returns to Content Library, sees new scene "Goblin Ambush" in list

**Auto-Save Timeline**:
```
0:00 - Name changed → Timer starts
0:03 - Save name
0:05 - Adventure selected → Save immediately
0:08 - Description edited → Timer starts
0:11 - Save description
0:15 - Grid changed → Timer starts
0:18 - Save grid config
0:20 - Asset placed → Timer starts
0:23 - Save assets
...
```

### Journey 2: Editing Existing Scene

**Starting Point**: User on Content Library (Scenes tab)

**Steps**:
1. User sees scene card "Goblin Ambush"
   - Card shows: Thumbnail, name, Hex-H badge, 15 assets, Published badge
2. Clicks scene card
3. Navigates to `/scene-editor/:sceneId`
4. Scene Editor loads from backend:
   - Fetches scene data (name, description, grid, stage, assets)
   - Fetches full Asset objects for all placed assets
   - Renders canvas with 15 existing assets
5. User makes changes:
   - Moves goblin token to different position
   - Adds new tree asset
   - Opens Scene menu, toggles Published to true
6. Each change auto-saves after 3-second debounce
7. User clicks "Back"
8. Returns to Content Library
9. Scene card now shows "Published" badge and 16 assets

### Journey 3: Duplicating a Scene

**Starting Point**: User on Content Library

**Steps**:
1. User hovers over scene card "Goblin Ambush"
2. Clicks "Duplicate" action (three-dot menu or button)
3. System creates copy in backend:
   - New ID generated
   - Name: "Goblin Ambush (Copy)"
   - All properties copied (grid, stage, assets)
   - Published: false (copies are drafts)
4. New card appears in scene list
5. User can click to edit copy

### Journey 4: Deleting a Scene

**Starting Point**: User on Content Library

**Steps**:
1. User hovers over scene card
2. Clicks "Delete" action
3. Confirmation dialog appears:
   - "Delete 'Goblin Ambush'?"
   - "This cannot be undone. This scene will be permanently deleted."
   - [Cancel] [Delete]
4. User confirms
5. Scene deleted from backend
6. Card removed from list with fade animation
7. Success notification: "Scene deleted"

---

## UI Wireframes

### Content Library Page

```
┌─────────────────────────────────────────────────────────┐
│  VTT Tools    Assets    Scene Editor         [☀][👤]   │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  Content Library                                        │
│  ┌─────────┬──────────────┬────────────┬──────────┐    │
│  │ Scenes  │ Adventures   │ Campaigns  │  Epics   │    │
│  │ (active)│  (disabled)  │ (disabled) │(disabled)│    │
│  └─────────┴──────────────┴────────────┴──────────┘    │
│                                                         │
│  ┌───────────────────────────────────────┬──────────┐  │
│  │ [🔍 Search scenes...]                 │ [+ New]  │  │
│  └───────────────────────────────────────┴──────────┘  │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  🗺️         │  │  🗺️         │  │  🗺️         │    │
│  │ Goblin      │  │ Dragon's    │  │ Tavern      │    │
│  │ Ambush      │  │ Lair        │  │ Brawl       │    │
│  │ Hex-H       │  │ Square      │  │ No Grid     │    │
│  │ 15 assets   │  │ 8 assets    │  │ 3 assets    │    │
│  │ 📝 Published│  │             │  │             │    │
│  │ ⋮           │  │ ⋮           │  │ ⋮           │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  About | Contact | Terms | Privacy      © 2025 VTT Tools│
└─────────────────────────────────────────────────────────┘
```

### Scene Editor (Enhanced)

```
┌─────────────────────────────────────────────────────────┐
│  [← Back] [Goblin Ambush (click)] [💾] ...   [☀][👤]  │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│[Scene▼][Stage▼][Structures▼][Objects▼][Creatures▼] ↶↷⊖100%⊕│
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                  (Konva Canvas)                         │
│                                                         │
│  🎲🎲  🌲🌲🌲                                           │
│        👹👹                                              │
│                  🏰                                      │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘

Scene Menu Dropdown:
┌──────────────────────────┐
│ Adventure               │
│ [Campaign Quest Arc ▼]  │
│                          │
│ Description             │
│ ┌──────────────────────┐ │
│ │ Forest clearing      │ │
│ │ where goblins...     │ │
│ └──────────────────────┘ │
│                          │
│ ☑ Published             │
├──────────────────────────┤
│ Duplicate Scene         │
│ Delete Scene            │
└──────────────────────────┘
```

---

## Component Specifications

### 1. ContentLibraryPage

**Location**: `src/features/content-library/pages/ContentLibraryPage.tsx`

**Purpose**: Main container with tabs for hierarchy navigation

**Props**: None (routes control content)

**Structure**:
```tsx
<AppLayout>
  <Box>
    <Typography variant="h4">Content Library</Typography>
    <Tabs value={currentTab}>
      <Tab label="Scenes" value="scenes" />
      <Tab label="Adventures" value="adventures" disabled />
      <Tab label="Campaigns" value="campaigns" disabled />
      <Tab label="Epics" value="epics" disabled />
    </Tabs>
    <Outlet />  {/* Nested route renders here */}
  </Box>
</AppLayout>
```

**Behavior**:
- Tab click navigates to nested route
- Current tab highlighted based on route
- Disabled tabs show tooltip: "Available in Phase 8/9"

### 2. SceneListView

**Location**: `src/features/content-library/components/scenes/SceneListView.tsx`

**Purpose**: Browse and manage scene list

**Props**: None (uses hooks for data)

**Hooks Used**:
- `useGetScenesQuery()` - Fetch scenes from backend
- `useDeleteSceneMutation()` - Delete scene
- `useDuplicateSceneMutation()` - Duplicate scene
- `useNavigate()` - Navigation

**Features**:
- Search bar (filters by name)
- Filter dropdown (by grid type, published status)
- Sort controls (name, date, asset count)
- Grid layout (responsive, 3-4 columns)
- Empty state: "No scenes yet. Create your first scene!"

### 3. SceneCard

**Location**: `src/features/content-library/components/scenes/SceneCard.tsx`

**Purpose**: Display scene preview in list

**Props**:
```typescript
interface SceneCardProps {
  scene: Scene;
  onClick: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**Display**:
- Thumbnail (placeholder or canvas screenshot)
- Scene name
- Grid type badge (icon + label)
- Asset count (e.g., "15 assets")
- Published badge (if published)
- Last modified date

**Actions**:
- Primary: Click card → Open in editor
- Secondary (menu):
  - Duplicate
  - Delete

### 4. EditableTitle

**Location**: `src/features/content-library/components/shared/EditableTitle.tsx`

**Purpose**: Click-to-edit title component (reusable)

**Props**:
```typescript
interface EditableTitleProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  placeholder?: string;
  maxLength?: number;
  variant?: TypographyVariant;
}
```

**Behavior**:
- Default: Display as Typography (h6)
- Click: Becomes TextField, auto-focus
- Edit: Live validation (max length, required)
- Save: On Enter key or blur
- Cancel: On Escape key
- Loading: Disabled during save
- Error: Show inline if save fails

**Accessibility**:
- aria-label: "Edit scene name"
- Keyboard navigation: Tab, Enter, Escape
- Screen reader: Announces edit mode

### 5. SceneMetadataMenu

**Location**: `src/features/content-library/components/scenes/SceneMetadataMenu.tsx`

**Purpose**: Contents of Scene menu dropdown

**Props**:
```typescript
interface SceneMetadataMenuProps {
  scene: Scene;
  onUpdate: (updates: Partial<Scene>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}
```

**Sections**:

**Adventure Selector**:
- Dropdown with user's adventures
- "None (Standalone)" option
- Only shown in Phase 8 (hidden in Phase 7)
- onChange → Auto-save

**Description Editor**:
- Click to edit (expands textarea)
- Multi-line input
- Max 4096 characters
- onChange → Auto-save (debounced)

**Publish Toggle**:
- Checkbox or Switch
- "Published" vs "Draft" label
- onChange → Auto-save (immediate)

**Actions**:
- Duplicate Scene button
- Delete Scene button (with confirmation)

---

## Data Flow Diagrams

### Scene Load Flow

```
User clicks scene card
  ↓
Navigate to /scene-editor/:sceneId
  ↓
SceneEditorPage mounts
  ↓
useGetSceneQuery(sceneId) ← RTK Query
  ↓
Fetch from backend API
  ↓
Scene data returned (grid, stage, SceneAsset[])
  ↓
Extract assetIds from SceneAsset[]
  ↓
Fetch Asset[] (parallel requests)
  ↓
Hydrate: SceneAsset[] + Asset[] → PlacedAsset[]
  ↓
Set component state:
  - sceneName
  - gridConfig ← scene.grid
  - placedAssets ← hydrated
  - viewport ← scene.stage.panning/zoom
  ↓
Render canvas with assets
```

### Scene Save Flow

```
User makes change (moves asset)
  ↓
Update local state (placedAssets)
  ↓
localStorage backup (immediate)
  ↓
Start debounce timer (3s)
  ↓
Timer expires
  ↓
Dehydrate: PlacedAsset[] → SceneAsset[]
  (Strip full Asset, keep only assetId)
  ↓
Call updateScene mutation
  ↓
Optimistic update (cache updated)
  ↓
Show "Saving..." indicator
  ↓
Backend API request
  ↓
Success:
  - Cache confirmed
  - Show "Saved ✓"
  - Clear localStorage backup
  ↓
Failure:
  - Rollback cache
  - Show error notification
  - Retry option
```

---

## API Integration

### Scenes API Endpoints

**RTK Query Slice**: `src/features/content-library/api/scenesApi.ts`

**Endpoints**:

```typescript
scenesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // List user's scenes
    getScenes: builder.query<Scene[], void>({
      query: () => '/library/scenes',
      providesTags: ['Scenes']
    }),

    // Get single scene
    getScene: builder.query<Scene, string>({
      query: (id) => `/library/scenes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Scene', id }]
    }),

    // Create scene
    createScene: builder.mutation<Scene, CreateSceneRequest>({
      query: (scene) => ({
        method: 'POST',
        url: '/library/scenes',
        body: scene
      }),
      invalidatesTags: ['Scenes']
    }),

    // Update scene
    updateScene: builder.mutation<Scene, UpdateSceneRequest>({
      query: ({ id, ...scene }) => ({
        method: 'PUT',
        url: `/library/scenes/${id}`,
        body: scene
      }),
      invalidatesTags: (result, error, { id }) => [
        'Scenes',
        { type: 'Scene', id }
      ]
    }),

    // Delete scene
    deleteScene: builder.mutation<void, string>({
      query: (id) => ({
        method: 'DELETE',
        url: `/library/scenes/${id}`
      }),
      invalidatesTags: ['Scenes']
    })
  })
});
```

**Request/Response Types**:

```typescript
interface CreateSceneRequest {
  name: string;
  description?: string;
  grid: GridConfig;
  stage?: {
    backgroundId?: string;
    width: number;
    height: number;
  };
}

interface UpdateSceneRequest {
  id: string;
  name?: string;
  description?: string;
  adventureId?: string | null;
  isPublished?: boolean;
  grid?: GridConfig;
  stage?: StageConfig;
  assets?: SceneAsset[];
}

interface Scene {
  id: string;
  ownerId: string;
  adventureId: string | null;
  name: string;
  description: string;
  isPublished: boolean;
  grid: GridConfig;
  stage: StageConfig;
  assets: SceneAsset[];
  createdAt: string;
  updatedAt: string;
}
```

---

## State Management

### SceneEditorPage State

**Current State** (Phase 6 - Hardcoded):
```typescript
const [gridConfig] = useState(getDefaultGrid());
const [placedAssets] = useState(() => {
  // Load from localStorage
});
```

**New State** (Phase 7 - Backend):
```typescript
// Load scene from backend
const { sceneId } = useParams();
const { data: scene, isLoading } = useGetSceneQuery(sceneId);
const [updateScene] = useUpdateSceneMutation();

// Scene metadata state
const [sceneName, setSceneName] = useState('');
const [description, setDescription] = useState('');
const [adventureId, setAdventureId] = useState<string | null>(null);
const [isPublished, setIsPublished] = useState(false);

// Canvas state (from scene)
const [gridConfig, setGridConfig] = useState<GridConfig>();
const [placedAssets, setPlacedAssets] = useState<PlacedAsset[]>([]);
const [viewport, setViewport] = useState<Viewport>();

// Load scene data when fetched
useEffect(() => {
  if (scene) {
    setSceneName(scene.name);
    setDescription(scene.description);
    setAdventureId(scene.adventureId);
    setIsPublished(scene.isPublished);
    setGridConfig(scene.grid);
    setViewport({
      x: scene.stage.panning.x,
      y: scene.stage.panning.y,
      scale: scene.stage.zoomLevel
    });

    // Hydrate assets
    hydrateSceneAssets(scene.assets).then(setPlacedAssets);
  }
}, [scene]);

// Auto-save changes
useAutoSave(sceneId, {
  name: sceneName,
  description,
  adventureId,
  isPublished,
  grid: gridConfig,
  stage: {
    panning: { x: viewport.x, y: viewport.y },
    zoomLevel: viewport.scale
  },
  assets: dehydratePlacedAssets(placedAssets)
}, 3000);
```

### Auto-Save Hook

```typescript
const useAutoSave = (
  sceneId: string,
  data: Partial<Scene>,
  delay: number = 3000
) => {
  const [updateScene] = useUpdateSceneMutation();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    setSaveStatus('idle');
    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await updateScene({ id: sceneId, ...data }).unwrap();
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000); // Clear after 2s
      } catch (error) {
        setSaveStatus('error');
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [sceneId, data, delay]);

  return saveStatus;
};
```

---

## Implementation Sequence

### Phase 7-Prep: Documentation (4-6 hours)

**Deliverables**:
- CONTENT_LIBRARY_ARCHITECTURE.md ✅
- PHASE-7-DESIGN.md (this document) 🔄
- CONTENT_LIBRARY_COMPONENTS.md
- Updated ROADMAP.md

### Phase 7A: Foundation (4h)

**Tasks**:
1. Create folder structure: `src/features/content-library/`
2. Define TypeScript interfaces (ContentItem, Scene, etc.)
3. Create ContentLibraryPage with tabs
4. Set up routing: `/content-library/scenes`
5. Create shared components: EditableTitle, ContentCard base

**Files Created**:
- `types/contentItem.ts`
- `types/scene.ts`
- `pages/ContentLibraryPage.tsx`
- `components/shared/EditableTitle.tsx`
- `components/shared/ContentCard.tsx`

### Phase 7B: Scene List (3h)

**Tasks**:
6. Create SceneListView component
7. Create SceneCard component
8. Implement search functionality
9. Add New/Duplicate/Delete actions
10. Empty state UI

**Files Created**:
- `components/scenes/SceneListView.tsx`
- `components/scenes/SceneCard.tsx`

### Phase 7C: Scenes API (3h)

**Tasks**:
11. Create scenesApi RTK Query slice
12. Implement all CRUD endpoints
13. Add cache invalidation tags
14. Create mappers (SceneAsset ↔ PlacedAsset)
15. Test API integration

**Files Created**:
- `api/scenesApi.ts`
- `types/mappers.ts`

### Phase 7D: Scene Menu Integration (3h)

**Tasks**:
16. Add Scene menu to SceneEditorMenuBar
17. Create SceneMetadataMenu component
18. Adventure selector (placeholder for Phase 8)
19. Description editor
20. Published toggle
21. Duplicate/Delete actions
22. Wire up auto-save

**Files Modified**:
- `src/components/scene/SceneEditorMenuBar.tsx`

**Files Created**:
- `content-library/components/scenes/SceneMetadataMenu.tsx`

### Phase 7E: Header Enhancement (2h)

**Tasks**:
23. Add Back button to EditorLayout header
24. Add EditableTitle for scene name
25. Add save indicator
26. Wire navigation back to Content Library
27. Handle unsaved changes warning

**Files Modified**:
- `src/components/layout/EditorLayout.tsx`

### Phase 7F: Stage Menu Enhancement (2h)

**Tasks**:
28. Move grid configuration to Stage menu
29. Make grid editable (currently view-only)
30. Add stage size inputs
31. Wire grid changes to auto-save
32. Update Stage menu organization

**Files Modified**:
- `src/components/scene/SceneEditorMenuBar.tsx`

---

## Data Mapping Specifications

### SceneAsset Structure (Backend)

```csharp
// From Domain/Library/Scenes/Model/SceneAsset.cs
public record SceneAsset {
  public Guid Id { get; init; }
  public Guid AssetId { get; init; }  // Reference to Asset
  public Point Position { get; init; }
  public Size Size { get; init; }
  public float Rotation { get; init; }
  public string Layer { get; init; }
}
```

### PlacedAsset Structure (Frontend)

```typescript
// From src/types/domain.ts
interface PlacedAsset {
  id: string;
  assetId: string;
  asset: Asset;  // Full object (not in backend)
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  layer: string;
}
```

### Mapping Functions

```typescript
// types/mappers.ts

// Hydrate: Add full Asset objects to SceneAssets
export const hydratePlacedAssets = async (
  sceneAssets: SceneAsset[],
  getAssetFn: (id: string) => Promise<Asset>
): Promise<PlacedAsset[]> => {
  const assetPromises = sceneAssets.map(sa => getAssetFn(sa.assetId));
  const assets = await Promise.all(assetPromises);

  return sceneAssets.map((sa, index) => ({
    id: sa.id,
    assetId: sa.assetId,
    asset: assets[index],
    position: sa.position,
    size: sa.size,
    rotation: sa.rotation,
    layer: sa.layer
  }));
};

// Dehydrate: Remove full Asset objects from PlacedAssets
export const dehydratePlacedAssets = (
  placedAssets: PlacedAsset[]
): SceneAsset[] => {
  return placedAssets.map(pa => ({
    id: pa.id,
    assetId: pa.assetId,
    position: pa.position,
    size: pa.size,
    rotation: pa.rotation,
    layer: pa.layer
  }));
};
```

---

## Auto-Save Behavior

### Trigger Events

**Immediate Save** (no debounce):
- Published toggle changed
- Adventure selected/changed
- Scene deleted

**Debounced Save** (3 seconds):
- Name changed
- Description edited
- Grid configuration changed
- Asset placed/moved/deleted
- Stage size changed
- Viewport changed (zoom/pan)

### Save Indicators

**Location**: Next to scene name in header

**States**:
- **Idle**: No indicator (clean)
- **Saving**: "💾 Saving..." (gray, animated)
- **Saved**: "✓ Saved" (green, fades after 2s)
- **Error**: "⚠ Save failed" (red, persists, shows retry)

### Conflict Resolution

**If save fails**:
1. Show error notification
2. Keep changes in localStorage
3. Offer retry button
4. On retry success: Clear localStorage

**If scene deleted while editing**:
1. Detect 404 on save
2. Show dialog: "Scene was deleted"
3. Options: "Save as New Scene" or "Discard Changes"

---

## Grid Configuration Migration

### Current Behavior (Phase 6)

- Grid config hardcoded: `const [gridConfig] = useState(getDefaultGrid())`
- Changes via Stage menu update local state only
- Not persisted (lost on refresh)

### New Behavior (Phase 7)

- Grid config from scene: `gridConfig = scene.grid`
- Changes via Stage menu update scene.grid
- Auto-saves to backend
- Persists across refreshes

**Stage Menu Sections**:
1. Background (existing)
2. Stage Size (new)
   - Width: [2800]
   - Height: [2100]
3. Grid Configuration (moved from hardcoded)
   - Type: [Square ▼]
   - Cell Size: W[50] H[50]
   - Offset: X[0] Y[0]
   - ☑ Snap to Grid

---

## Testing Strategy

### Unit Tests

**Components**:
- EditableTitle: Edit, save, cancel, validation
- SceneCard: Display, actions, published badge
- SceneMetadataMenu: All form interactions
- Auto-save hook: Debouncing, retry, error handling

**API**:
- scenesApi: All endpoints, cache invalidation
- Mappers: Hydrate/dehydrate functions

### Integration Tests

**User Flows**:
- Create new scene → Edit → Save → View in list
- Edit existing scene → Changes persist
- Delete scene → Confirmation → Removed from list
- Duplicate scene → Copy appears in list

### E2E Tests (BDD)

**Feature**: Scene Management
```gherkin
Scenario: Create new scene
  Given I am on the Content Library
  When I click "New Scene"
  Then I should see the Scene Editor
  And the scene name should be editable
  When I rename it to "Test Scene"
  And I place 3 assets
  Then the changes should auto-save
  When I click "Back"
  Then I should see "Test Scene" in the scene list
```

---

## Success Criteria

### Functional Requirements

✅ User can browse all their scenes
✅ User can create new scene (opens in editor)
✅ User can edit scene name in header
✅ User can edit scene metadata in Scene menu
✅ User can edit grid configuration in Stage menu
✅ User can place/move/delete assets on canvas
✅ All changes auto-save to backend
✅ User can navigate back to scene list
✅ User can duplicate scenes
✅ User can delete scenes with confirmation

### Non-Functional Requirements

✅ Auto-save debounced (3s)
✅ Save indicators visible
✅ Optimistic updates (responsive UX)
✅ Error handling (retry, rollback)
✅ Accessibility (WCAG AA)
✅ Material-UI theme compliant
✅ Test coverage ≥70%

### Infrastructure Requirements

✅ Architecture scales to Adventures (Phase 8)
✅ Shared components reusable (60-70%)
✅ Type-safe implementation
✅ Clean separation of concerns
✅ Documented for future developers

---

## Effort Estimate

**Phase 7-Prep**: 4-6 hours (documentation)
**Phase 7**: 17 hours (implementation)
**Total**: 21-23 hours

**Breakdown**:
- Foundation: 4h
- Scene List: 3h
- Scenes API: 3h
- Scene Menu: 3h
- Header: 2h
- Stage Menu: 2h

---

## Risks & Mitigation

**Risk**: SceneAsset model mismatch
- **Mitigation**: Verify backend model before implementation
- **Status**: ✅ Verified (matches expected structure)

**Risk**: Auto-save conflicts with undo/redo
- **Mitigation**: Debounce prevents rapid saves, undo/redo uses local state
- **Testing**: Stress test rapid undo + auto-save

**Risk**: Large scenes (100+ assets) save performance
- **Mitigation**: Send only changed fields (partial updates)
- **Fallback**: Batch asset updates

**Risk**: User expects immediate save (no auto-save UX understanding)
- **Mitigation**: Clear save indicators, "Last saved" timestamp
- **Education**: Tooltip on first use

---

## Next Steps

1. ✅ Complete documentation (this document + components doc)
2. Review architecture with stakeholders
3. Update ROADMAP.md with revised Phase 7
4. Begin implementation (Phase 7A: Foundation)
