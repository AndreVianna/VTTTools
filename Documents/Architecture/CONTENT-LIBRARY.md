# Content Library Architecture

**Created**: 2025-10-23
**Version**: 1.0
**Status**: Phase 7 Foundation

---

## Overview

The Content Library is VTTTools' organizational system for managing tabletop content through a four-level hierarchy: World → Campaign → Adventure → Encounter. This document defines the architecture, design patterns, and implementation strategy.

## Hierarchy Model

### Structure

```text
World (optional)
  └─→ Campaign (optional)
        └─→ Adventure (optional)
              └─→ Encounter (required for gameplay)
```

### Characteristics

**Optional at Every Level:**
- Encounter.adventureId: `Guid?` (nullable) - Encounters can be standalone
- Adventure.campaignId: `Guid?` (nullable) - Adventures independent
- Campaign.worldId: `Guid?` (nullable) - Campaigns independent

**Progressive Enhancement:**
- Phase 7: Encounters only
- Phase 8: Encounters + Adventures
- Phase 9: Full hierarchy (when backend ready)

### Common Properties (All Levels)

```typescript
interface ContentListItem {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Level-Specific Properties

**Encounter** (Leaf - Visual Content):
```typescript
interface Encounter extends ContentListItem {
  adventureId: string | null;
  grid: GridConfig;
  stage: StageConfig;
  assets: EncounterAsset[];
}
```

**Adventure** (Container):
```typescript
interface Adventure extends ContentListItem {
  campaignId: string | null;
  encounterIds: string[];
  thumbnailId: string | null;
}
```

**Campaign** (Container):
```typescript
interface Campaign extends ContentListItem {
  worldId: string | null;
  adventureIds: string[];
  theme: string | null;
  setting: string | null;
}
```

**World** (Top-Level Container):
```typescript
interface World extends ContentListItem {
  campaignIds: string[];
  coverImageId: string | null;
  genre: string | null;
}
```

---

## Revolutionary Pattern: Editor-as-CRUD

### Traditional CRUD Pattern (NOT Using)

```text
Content List → [Edit Button] → Dialog Form → [Save] → Back to List
              [New Button]  → Dialog Form → [Save] → Back to List
```

**Drawbacks:**
- Context switching (list ↔ dialog)
- Modal interrupts workflow
- Separate edit vs view modes
- Less immersive

### Editor-as-CRUD Pattern (Our Approach)

```text
Content List → [Click Item] → Full Editor (properties in menus) → Auto-save → [Back] → List
              [New Button] → Full Editor (blank) → Auto-save → [Back] → List
```

**Benefits:**
- Unified editing experience
- Properties accessible without modals
- Familiar pattern (Figma, Google Docs, Notion)
- More immersive and professional

### Inspiration

**Figma**: File list → Click → Canvas with properties in panels
**Google Docs**: Document list → Click → Editor with file menu
**Notion**: Page list → Click → Page editor with properties

---

## Architecture Layers

### 1. Routing Layer

**Content Library:**
```text
/content-library → ContentLibraryPage (tabs)
  ├─ /encounters → EncounterListView
  ├─ /adventures → AdventureListView (Phase 8)
  ├─ /campaigns → DisabledView (Phase 9)
  └─ /worlds → DisabledView (Phase 9)
```

**Editors:**
```text
/encounter-editor/:encounterId → EncounterEditorPage (EditorLayout)
/encounter-editor/new → EncounterEditorPage (creates new)
/adventure-editor/:adventureId → AdventureEditorPage (Phase 8)
```

**Navigation Flow:**
- Dashboard → Content Library → Encounters tab → Encounter card → Encounter Editor
- Encounter Editor back button → Content Library (Encounters tab)

### 2. Component Architecture

**Shared Components (Built in Phase 7, Reused Later):**

```text
content-library/components/shared/
  ├─ ContentCard.tsx          Base card for all content types
  ├─ ContentListLayout.tsx    Grid + search + filter framework
  ├─ EditableTitle.tsx        Click-to-edit title component
  ├─ PublishToggle.tsx        Publish/unpublish switch
  └─ SaveIndicator.tsx        "Saving..." / "Saved" status
```

**Type-Specific Components:**

```text
content-library/components/encounters/
  ├─ EncounterCard.tsx            Extends ContentCard
  ├─ EncounterMetadataMenu.tsx    Encounter menu contents
  └─ EncounterListView.tsx        Encounter list page
```

**Reusability**: ~60-70% of Phase 7 code reused in Phase 8

### 3. State Management

**RTK Query Slices:**
```text
api/adventuresApi.ts  → /api/library/adventures (Phase 7)
api/encountersApi.ts      → /api/library/encounters
```

**Cache Strategy:**
- List queries: Tag 'Encounters', 'Adventures'
- Detail queries: Tag by ID
- Mutations invalidate appropriate tags
- Optimistic updates for responsive UX

**Auto-Save Pattern:**
```typescript
// Debounced auto-save hook
const useAutoSave = (encounterId, data, delay = 3000) => {
  const [updateEncounter] = useUpdateEncounterMutation();

  useEffect(() => {
    const timer = setTimeout(() => {
      updateEncounter({ id: encounterId, ...data });
    }, delay);

    return () => clearTimeout(timer);
  }, [data, delay]);
};
```

### 4. Data Mapping Layer

**Challenge**: Frontend needs full Asset objects, backend stores references.

**EncounterAsset (Backend)**:
```typescript
{
  id: string;
  assetId: string;  // Reference only
  position: {x, y};
  size: {w, h};
  rotation: number;
  layer: string;
}
```

**PlacedAsset (Frontend)**:
```typescript
{
  id: string;
  assetId: string;
  asset: Asset;  // Full object with image URL, properties
  position: {x, y};
  size: {w, h};
  rotation: number;
  layer: string;
}
```

**Mapping Functions**:
```typescript
// Load: EncounterAsset → PlacedAsset
const hydratePlacedAssets = async (
  encounterAssets: EncounterAsset[],
  getAsset: (id: string) => Promise<Asset>
): Promise<PlacedAsset[]> => {
  const assets = await Promise.all(
    encounterAssets.map(sa => getAsset(sa.assetId))
  );

  return encounterAssets.map((sa, i) => ({
    ...sa,
    asset: assets[i]
  }));
};

// Save: PlacedAsset → EncounterAsset
const dehydratePlacedAssets = (
  placedAssets: PlacedAsset[]
): EncounterAsset[] => {
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

## Encounter Editor Integration

### Enhanced Menu Bar

**Current Structure:**
```text
[Stage ▼] [Structures ▼] [Objects ▼] [Creatures ▼] ... [↶ ↷ | ⊖ 100% ⊕]
```

**New Structure (Phase 7)**:
```text
[Encounter ▼] [Stage ▼] [Structures ▼] [Objects ▼] [Creatures ▼] ... [↶ ↷ | ⊖ 100% ⊕]
```

### Encounter Menu (NEW)

**Purpose**: Encounter metadata and publishing

**Contents**:
- Adventure selector (dropdown, optional)
- Description (click to edit, multi-line)
- Published toggle (checkbox/switch)
- Duplicate Encounter action
- Delete Encounter action

**Organization**:
```text
┌──────────────────────────┐
│ Encounter Properties         │
├──────────────────────────┤
│ Adventure               │
│ [None ▼]                │
│                          │
│ Description             │
│ ┌──────────────────────┐ │
│ │ (click to edit...)   │ │
│ └──────────────────────┘ │
│                          │
│ ☐ Published             │
├──────────────────────────┤
│ Duplicate Encounter         │
│ Delete Encounter            │
└──────────────────────────┘
```

### Stage Menu (ENHANCED)

**Purpose**: Canvas configuration

**Contents (Reorganized)**:
- **Background Section**
  - Upload background image
- **Stage Size** (NEW)
  - Width/Height inputs
- **View Controls**
  - Reset zoom & pan
- **Grid Configuration** (MOVED from Encounter)
  - Grid Type selector
  - Cell Size (W/H with +/- controls)
  - Offset (X/Y with +/- controls)
  - Snap to Grid toggle

**Rationale**: Groups all visual/display settings together

### Header Enhancement

**Current Header (EditorLayout)**:
```text
[VTT Tools] ... [☀][👤]
```

**Enhanced Header**:
```text
[← Back to Encounters] [Encounter Name (click to edit)] [💾 Saved] ... [☀][👤]
```

**Editable Title Pattern:**
- Click encounter name → Becomes input field
- Edit name → Auto-focus
- Press Enter or blur → Save
- Show save indicator during/after save

---

## Implementation Strategy

### Progressive Enhancement

**Phase 7** (Encounters Only):
- Content Library tabs: [Encounters (active)] [Adventures (disabled)] ...
- Only Encounters clickable
- Infrastructure ready for expansion

**Phase 8** (+ Adventures):
- Enable Adventures tab
- Reuse: ContentCard, ContentListLayout, EditableTitle
- Add: AdventureListView, Adventure menu

**Phase 9** (+ Campaigns/Worlds):
- Enable remaining tabs
- Minimal new code (reuse infrastructure)

### Code Reuse Strategy

**Shared Across All Levels:**
- ContentCard component (70% reusable)
- ContentListLayout (100% reusable)
- EditableTitle (100% reusable)
- PublishToggle (100% reusable)
- Auto-save hook (100% reusable)
- useContentList hook (80% reusable)

**Type-Specific Per Level:**
- Menu contents (Encounter vs Adventure vs Campaign properties)
- Card metadata display
- Editor content area (canvas vs list vs organizer)

**Estimated Reuse:**
- Phase 8: 60-70% code reuse from Phase 7
- Phase 9: 70-80% code reuse from Phases 7-8

---

## Technical Specifications

### TypeScript Type System

**Base Interface:**
```typescript
type ContentType = 'encounter' | 'adventure' | 'campaign' | 'world';

interface ContentListItem {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Type Discrimination:**
```typescript
type ContentItemByType<T extends ContentType> =
  T extends 'encounter' ? Encounter :
  T extends 'adventure' ? Adventure :
  T extends 'campaign' ? Campaign :
  T extends 'world' ? World :
  never;
```

**Generic Component Props:**
```typescript
interface ContentListProps<T extends ContentType> {
  type: T;
  items: ContentItemByType<T>[];
  onSelect: (id: string) => void;
  renderCard: (item: ContentItemByType<T>) => ReactNode;
}
```

### Auto-Save Mechanism

**Debounce Strategy:**
- Timer: 3 seconds after last change
- Cancel on new change
- Show "Saving..." during request
- Show "Saved" on success (fade after 2s)
- Show error on failure (persist)

**What Triggers Auto-Save:**
- Name change (debounced)
- Description change (debounced)
- Published toggle (immediate)
- Adventure change (immediate)
- Grid config change (debounced)
- Asset placed/moved/deleted (debounced)

**localStorage Backup:**
- Mirror changes to localStorage as safety net
- Restore on crash/refresh
- Clear after successful backend save

---

## Material-UI Integration

### Theme Compliance

All components use theme tokens:
- Colors: `theme.palette.*` (no hardcoded colors)
- Spacing: `theme.spacing(n)`
- Typography: `theme.typography.*`
- Dark/Light mode support: Automatic via theme

### Component Standards

- EditableTitle: TextField with theme-aware styling
- ContentCard: Card with proper elevation, theme-aware background
- Menus: Consistent with EncounterEditorMenuBar pattern
- Buttons: Primary/secondary following theme

---

## Accessibility

**WCAG 2.1 AA Compliance:**
- Editable title: Proper focus management, keyboard navigation
- Menus: aria-labels, keyboard shortcuts
- Cards: Semantic HTML, proper heading hierarchy
- Save indicators: aria-live regions for screen readers

---

## Future Considerations

### Phase 8: Adventure Editor

Different canvas type (not visual like encounters):
- Encounter thumbnail grid (organize encounters)
- Drag to reorder
- Add/remove encounters
- Different menu structure

### Phase 9: Campaign/World Editors

Further specialized editors for organizational content.

### Real-Time Collaboration (Phase 10+)

- Multiple users editing same encounter
- Conflict resolution
- Presence indicators
- Shared cursors

---

## Success Metrics

**Phase 7 Foundation:**
- ✅ Architecture scales to full hierarchy
- ✅ 60-70% code reuse in Phase 8
- ✅ Clean separation of concerns
- ✅ Type-safe implementation
- ✅ Material-UI compliant
- ✅ Accessible (WCAG AA)

**User Experience:**
- ✅ No modal dialogs (seamless workflow)
- ✅ Auto-save (no "Save" button anxiety)
- ✅ Unified editing (properties + content together)
- ✅ Fast navigation (list ↔ editor)
