# Asset Categorization & Picker Implementation

**Date**: 2025-10-04
**Epic**: EPIC-001 - UI Migration (Blazor to React)
**Phase**: Phase 3 - Scene Editor Core
**Feature**: Asset Placement Foundation

---

## Summary

Implemented DDD-based asset categorization model with behavioral categories and reusable asset picker component to enable asset placement in Phase 3.

## Domain Model Changes

### 1. AssetCategory Enum (`types/domain.ts`)

```typescript
enum AssetCategory {
  Static = 'Static',    // Structural/environmental, locked in place
  Passive = 'Passive',  // Manipulable objects
  Active = 'Active'     // Autonomous entities with actions
}
```

**Rationale**: Captures behavioral capabilities, not just visual types. Determines:
- Placement rules (locked vs draggable)
- Manipulation constraints (resize, rotate, delete)
- Layer assignment (terrain, objects, tokens)
- UI organization (Structures/Objects/Entities menus)

### 2. Updated Asset Interface

```typescript
interface Asset {
  id: string;
  type: AssetType;
  category: AssetCategory;  // NEW
  name: string;
  description: string;
  displayId?: string;
  imageUrl?: string;        // NEW - visual representation
  createdAt: string;
  updatedAt: string;
}
```

### 3. PlacementBehavior Value Object (`types/placement.ts`)

Encapsulates placement rules derived from category:

```typescript
interface PlacementBehavior {
  // Movement capabilities
  canMove: boolean;
  canRotate: boolean;
  canResize: boolean;
  canDelete: boolean;
  canDuplicate: boolean;

  // Snapping behavior
  snapMode: 'grid' | 'free' | 'edge' | 'corner';
  snapToGrid: boolean;

  // Locking behavior
  requiresLocking: boolean;
  lockedByDefault: boolean;

  // Layer constraints
  allowLayerChange: boolean;
  defaultLayer: number;

  // Visual indicators
  showBoundingBox: boolean;
  showRotationHandle: boolean;
  showResizeHandles: boolean;

  // Interaction
  selectable: boolean;
  draggable: boolean;
}
```

**Category-Specific Defaults**:

| Behavior | Static | Passive | Active |
|----------|--------|---------|--------|
| canMove | ❌ | ✅ | ✅ |
| canRotate | ❌ | ✅ | ✅ |
| snapToGrid | ✅ | Optional | ✅ |
| lockedByDefault | ✅ | ❌ | ❌ |
| defaultLayer | 1 (Terrain) | 2 (Objects) | 3 (Tokens) |
| draggable | ❌ | ✅ | ✅ |

### 4. SceneAsset Enhancement

```typescript
interface SceneAsset {
  // ... existing properties
  customBehavior?: Partial<PlacementBehavior>;  // NEW - per-instance overrides
}
```

## UI Components

### 1. AssetPicker Component (`components/common/AssetPicker.tsx`)

**Features**:
- ✅ Filter by single category (required)
- ✅ Optional filter by asset types
- ✅ Search functionality
- ✅ Grid display with image previews
- ✅ Category-color coded selection
- ✅ Responsive dialog (md width, 80vh height)

**Usage**:
```typescript
<AssetPicker
  open={open}
  onClose={handleClose}
  onSelect={handleAssetSelected}
  category={AssetCategory.Static}
  allowedTypes={[AssetType.Wall, AssetType.Door]}  // Optional
/>
```

**Category Colors**:
- Static: `#9E9E9E` (Gray)
- Passive: `#795548` (Brown)
- Active: `#4CAF50` (Green)

### 2. Menu Integration (`SceneEditorMenuBar.tsx`)

**Menu Structure**:
```
[Stage ▼] [Structures ▼] [Objects ▼] [Entities ▼]
```

- **Structures** → Opens picker with `category: Static`
- **Objects** → Opens picker with `category: Passive`
- **Entities** → Opens picker with `category: Active`

**Props Added**:
```typescript
interface SceneEditorMenuBarProps {
  // ... existing props
  onAssetSelect: (asset: Asset) => void;  // NEW
}
```

### 3. Scene Editor Page (`SceneEditorPage.tsx`)

**Handler Added**:
```typescript
const handleAssetSelect = (asset: Asset) => {
  console.log('Asset selected for placement:', asset);
  // TODO: Phase 3 - Implement asset placement
  // 1. Get placement behavior from asset.category
  // 2. Enter placement mode with cursor preview
  // 3. Place on canvas click with layer/transform
  // 4. Create SceneAsset entity
};
```

## Mock Data

Added 6 test assets (2 per category) in `mockApi.ts`:

### Static Assets
1. **Stone Wall** - Gray placeholder, Environment type
2. **Wooden Door** - Brown placeholder, Environment type

### Passive Assets
3. **Wooden Crate** - Brown placeholder, Item type
4. **Treasure Chest** - Gold placeholder, Item type

### Active Assets
5. **Hero Character** - Green placeholder, Character type
6. **Goblin** - Red placeholder, Monster type

All use `https://via.placeholder.com` for images with category-appropriate colors.

## Next Steps (Phase 3 Continuation)

### Immediate: Asset Placement
1. **Implement placement mode**:
   - Show asset preview at cursor position
   - Apply grid snapping based on PlacementBehavior
   - Handle click to place

2. **Create TokenLayer component**:
   - Render placed SceneAssets
   - Use Konva Image nodes
   - Apply transforms (position, rotation, scale)

3. **Implement selection/manipulation**:
   - Click to select placed assets
   - Show transformation handles based on PlacementBehavior
   - Drag, rotate, resize based on capabilities
   - Lock/unlock for Static assets

### Medium-term: Asset Library (Phase 4)
1. Full asset CRUD interface
2. Image upload/management
3. Asset template system
4. Batch operations

## DDD Principles Applied

✅ **Value Objects**: PlacementBehavior encapsulates behavior logic
✅ **Aggregates**: Asset as root with category driving behavior
✅ **Bounded Context**: Scene placement rules separate from asset definition
✅ **Strategy Pattern**: Behavior derived from category, customizable per instance
✅ **Open/Closed**: New categories can be added without modifying existing code

## Files Changed

### New Files
- `src/types/placement.ts` - PlacementBehavior value object
- `src/components/common/AssetPicker.tsx` - Reusable asset selection dialog
- `Documents/Tasks/EPIC-001/ASSET_CATEGORIZATION_IMPLEMENTATION.md` - This document

### Modified Files
- `src/types/domain.ts` - Added AssetCategory, updated Asset & SceneAsset
- `src/services/mockApi.ts` - Added 6 categorized mock assets
- `src/components/common/index.ts` - Exported AssetPicker
- `src/components/scene/SceneEditorMenuBar.tsx` - Integrated asset picker
- `src/pages/SceneEditorPage.tsx` - Added asset selection handler

## Testing Status

✅ TypeScript compilation passes (no new errors)
⏳ Manual testing pending (requires running app)
⏳ Asset placement logic pending (next task)

---

**Status**: ✅ Complete - Ready for asset placement implementation
