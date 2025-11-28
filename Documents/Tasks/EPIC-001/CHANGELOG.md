# EPIC-001: Change Log

Concise version history with links to detailed phase documentation.

---

## 2025-11 (Phase 8.8 - Manual Testing & Refinements)

### 2025-11-27 (v1.22.0) - Asset Management System Redesign

**Delivered**: Complete asset management system overhaul with new Browser and Studio pages
**Effort**: 40h+
**Status**: ✅ Complete
**Grade**: A

**Key Changes**:

**Asset Browser** (New Page):
- Taxonomy tree navigation with hierarchical category/subcategory filtering
- Dual view modes: Card grid view and Table view
- Asset inspector panel with detailed asset information
- Token carousel for assets with multiple tokens
- Attribute range sliders for filtering by numeric properties
- Compact asset cards with hover previews
- Browser toolbar with search, filters, and view controls

**Asset Studio** (New Page):
- Dedicated asset editing environment
- Breadcrumb taxonomy input for category navigation
- Data panel for core asset properties
- Metadata panel for extended attributes
- Property grid for structured property editing
- Visual identity panel for portrait/token management
- Studio toolbar with save/cancel/delete actions
- Streamlined `AssetResourceManager` component

**Quick Summon System**:
- `QuickSummonDialog` - Modal for rapid asset searching and selection
- `QuickSummonResultsTable` - Paginated results with sorting
- `QuickSummonStagingPanel` - Stage multiple assets before placement
- `useQuickSummon` hook - State management for summon workflow
- Support for batch asset placement on encounter map

**Domain Model Updates**:
- Simplified asset type definitions in `domain.ts`
- Removed redundant property forms (Character/Monster/Object)
- Updated asset helpers and display utilities
- Streamlined scope filtering logic

**Files Created**:
- `components/assets/browser/` - 8 new components
- `components/assets/studio/` - 7 new components
- `components/encounter/quicksummon/` - 5 new files
- `hooks/useAssetBrowser.ts` - Browser state management
- `pages/AssetStudioPage.tsx` - New studio page

**Files Removed**:
- `AssetCreateDialog.tsx`, `AssetEditDialog.tsx` - Replaced by Studio
- `CharacterPropertiesForm.tsx`, `MonsterPropertiesForm.tsx`, `ObjectPropertiesForm.tsx`

---

### 2025-11-27 (v1.21.0) - Region System Enhancements Complete

**Delivered**: Region clipping, null regions, and illumination opacity improvements
**Effort**: 8h
**Status**: ✅ Complete
**Grade**: A

**Key Changes**:

**Region Clipping** (Same type, different value):
- When placing/editing a region that overlaps existing regions of the same type but different value/label, existing regions are now clipped (trimmed)
- Uses `polygon-clipping` library's `.difference()` operation
- Three scenarios handled:
  - Complete coverage → delete existing region
  - Partial overlap → update vertices
  - Split into parts → create multiple new regions with suffixed names (a, b, c...)
- Proper undo/redo support via BatchCommand

**Null Regions** (Normal Terrain/Illumination):
- "Normal" terrain and "Normal" illumination now act as erasers
- Placing Normal clips ALL overlapping regions of that type without creating a new region
- Restores area to default state (no region coverage)
- Functions: `isNullRegion()`, `findRegionsForNullClip()`, `detectNullRegionClip()`

**Illumination Opacity**:
- Illumination regions now use black color with varying transparency
- Bright: 25% opacity (yellow tint)
- Normal: 0% (transparent - no region)
- Dim: 50% opacity (black)
- Dark: 75% opacity (black)
- Dynamic opacity rendering in RegionRenderer and RegionTransformer

**Snapping Removed from Merge/Clip**:
- Vertices from merge/clip operations are now placed at exact computed coordinates
- Prevents gaps between adjacent regions
- Snapping only applies when user manually edits vertices

**Left Toolbar UX**:
- Panel now auto-opens on hover when a scope is already selected
- No click required if scope is active

**Files Modified**:
- `regionMergeUtils.ts` - Added clipping functions, null region detection
- `regionColorUtils.ts` - Illumination opacity system
- `useRegionTransaction.ts` - Clip and null clip detection
- `useClipRegions.ts` (NEW) - Clip execution hook
- `useRegionHandlers.ts` - Clip and null clip handling
- `RegionRenderer.tsx`, `RegionTransformer.tsx` - Dynamic opacity
- `LeftToolBar.tsx` - Hover-to-open behavior

**Tests**: Updated unit tests for new signatures

---

### 2025-11-08 (v1.13.0) - Asset Rotation System Complete

**Delivered**: Interactive rotation handles for encounter assets with mouse-based interaction
**Effort**: 12-16h (11+ debugging iterations)
**Status**: ✅ Complete
**Grade**: A

**Key Changes**:
- Visual rotation handle (dashed line + circle grab handle, 75% of asset dimension)
- Mouse event-based rotation (onMouseDown + stage mousemove/mouseup)
- Angle calculation with 15° snapping (0° = north)
- Ghost handle bug fixed after 11 iterations (duplicate rendering on Layer 9)
- Multi-asset rotation simplified to single-asset only
- EF Core navigation property bug fixed (resource data corruption)

**Critical Fix**: Resources cleared when placing assets - fixed by setting foreign keys (PortraitId, TokenId) instead of navigation properties

**Files**: RotationHandle.tsx, TokenDragHandle.tsx, TokenPlacement.tsx, Mapper.cs, rotationUtils.ts
**Tests**: Manual testing + integration validation
**Lessons**: [18-21](./LESSONS_LEARNED.md#lesson-18-21)
**Details**: [PHASE_8_ENCOUNTER_MGMT.md#asset-rotation-system](./phases/PHASE_8_ENCOUNTER_MGMT.md#asset-rotation-system)

---

### 2025-11-04 (v1.18.0) - Wall Undo/Redo System Complete

**Delivered**: Dual-queue undo/redo for wall placement and editing
**Effort**: 18h
**Status**: ✅ Complete
**Grade**: A (Excellent)

**Key Changes**:
- Local undo system (transaction-scoped, 7 action types)
- Global undo system (4 command classes with redo support)
- Keyboard routing (Ctrl+Z/Y with smart local/global routing)
- Encounter state synchronization via callbacks (prevents React batching issues)

**Critical Fix**: Wall break undo ghost bug - 3-part fix (preserve segment association, callback sync, encounterRef for stale closure)

**Files Created**: wallUndoActions.ts (535 LOC), wallCommands.ts (207 LOC), + 5 test files (4,760 LOC tests)
**Tests**: 132 tests (103 unit + 29 BDD scenarios), 95%+ coverage
**Lessons**: [13-17](./LESSONS_LEARNED.md#lesson-13-17)
**Details**: [PHASE_8_ENCOUNTER_MGMT.md#phase-8-8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8)

---

### 2025-11-03 (v1.17.0) - Transactional Wall Editing Complete

**Delivered**: Eliminated debounced API calls, instant feedback, atomic commits
**Effort**: 26h
**Status**: ✅ Complete
**Grade**: A+ (96/100)

**Key Changes**:
- Transactional placement mode (single API call on commit, 0ms latency vs 300ms)
- Transactional edit mode (instant feedback, 90-95% latency reduction)
- Atomic wall breaking (both segments commit together, auto-naming with `.1`/`.2` suffixes)
- Multi-segment editing (independent WallTransformer instances)

**Critical Fixes**:
- Placement properties lost bug (added placementProperties to transaction)
- Duplicate wall creation bug (deferred API to commit boundary)
- Wall break ESC rollback bug (complete originalWall restoration)
- Z-order event blocking bug (conditional background rect with `enableBackgroundRect` prop)
- Pole hit area interference bug (dynamic `listening={!isShiftPressed}`)

**Features**: Pole insertion preview with Shift+hover (dashed orange circle at snap point)

**Lessons**: [1-12](./LESSONS_LEARNED.md#lesson-1-12)
**Details**: [PHASE_8_ENCOUNTER_MGMT.md#phase-8-8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8)

---

### 2025-11-03 (v1.16.0) - Wall Delete & Break Operations

**Delivered**: Pole/line deletion and wall breaking functionality
**Effort**: 8h
**Status**: ✅ Complete

**Key Changes**:
- DELETE key operations (poles, lines, min 2 poles enforced)
- ALT+DELETE wall breaking (open walls split into 2, closed walls reorder and open)
- Deferred pole cleaning (runs only on Enter key, allows intentional duplicates)
- Visual consistency (dashed closing lines, proper z-order)

**Critical Fixes**: Whole wall deletion during vertex editing (added `!isEditingVertices` guard)

**Details**: [PHASE_8_ENCOUNTER_MGMT.md#phase-8-8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8)

---

### 2025-11-02 (v1.15.0) - Wall Placement & Editing UX Refinements

**Delivered**: Industry-standard UX patterns for wall editing
**Effort**: 12h (vs 6-8h est, 150-200%)
**Status**: ✅ Complete

**Key Changes**:
- ConfirmDialog restoration (fixed React import, Portal click detection)
- Keyboard semantics (Escape cancels, Enter/double-click saves)
- Wall auto-naming (max+1 strategy prevents duplicates)
- Industry-standard cursors (crosshair=create, default=edit, move=draggable, grabbing=drag, custom Shift+line cursor)
- Escape revert in editing mode (restores original poles via API)

**Pattern**: Custom cursor utility using base64-encoded SVG generation

**Details**: [PHASE_8_ENCOUNTER_MGMT.md#phase-8-8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8)

---

### 2025-10-31 (v1.14.0) - Wall Placement & Edit Mode Implementation Started

**Delivered**: Wall placement and editing core features
**Effort**: 5h (ongoing)
**Status**: 🚧 In Progress

**Key Changes**:
- WallDrawingTool (click-to-place poles, grid snapping, visual feedback, keyboard controls, min 1 pole)
- WallTransformer (pole selection/drag/delete, line selection/drag, snapping with modifiers)
- Snapping system (HalfSnap/QuarterSnap/Free via Alt/Ctrl keys in mouse events)

**Lessons**: Hit area sizing (≥2x snap distance), modifier keys in mouse events (NOT keyboard), coordinate transformation

**Current Work**: Debugging marquee selection
**Deferred**: Pole insertion on line segment

**Details**: [PHASE_8_ENCOUNTER_MGMT.md#phase-8-8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8)

---

## 2025-10 (Phases 8.5-8.7 - Structures Implementation)

### 2025-10-31 (v1.13.0) - Phase 11 Complete & EPIC-002 Defined

**Delivered**: Complete account management (profile, security, 2FA, email confirmation)
**Effort**: 16h (100% of estimate)
**Status**: ✅ Complete

**Key Changes**:
- ProfilePage with tabbed interface (Profile/Security/2FA/Recovery Codes)
- Avatar upload/delete and profile editing
- 2FA setup with QR code and horizontal stepper UI
- Recovery codes grid with download capability
- Email verification with resend confirmation flow

**Backend**: EmailConfirmed field, ResendEmailConfirmationAsync, ConfirmEmailAsync endpoints

**EPIC-002**: Admin Application (40-60h) defined as separate track - REQUIRED before Phase 13 release

**Roadmap Changes**: Added Phase 12 (Audit Logging, 13h), Phase 13 (Release Prep, 5h), Phase 14 (Performance, 16h optional)

**Details**: [PHASE_11_ACCOUNT_MGMT.md](./phases/PHASE_11_ACCOUNT_MGMT.md)

---

### 2025-10-29 (v1.12.0) - Phase 8.7 Complete (Structures Frontend)

**Delivered**: Complete drawing tools, Konva rendering, Encounter Editor integration
**Effort**: 67h (89% of 75h est)
**Status**: ✅ Complete
**Grade**: A- (92/100)

**Key Deliverables**:
- 6 TypeScript interfaces (Barrier, Region, Source + Encounter variants)
- 3 RTK Query API slices (18 backend endpoints)
- Library UI with 3 searchable tabs and editor dialogs
- 3 drawing tools (barriers click-to-place, regions polygon, sources click-drag range)
- Snap-to-grid (HalfSnap/QuarterSnap/Free, 10px threshold)
- 3 Konva renderers (Lines, Polygons with labels, Circles with line-of-sight)
- Line-of-sight ray-casting (72 rays at 5° increments)
- Command pattern undo/redo
- 4-layer Konva architecture (Static/GameWorld/Effects/UIOverlay)

**Tests**: 246+ tests passing, ≥75% coverage
**Production Readiness**: 90%

**Details**: [PHASE_8_ENCOUNTER_MGMT.md#phase-8-7](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-7)

---

### 2025-10-28 (v1.11.0) - Phase 8.6 Complete (Structures Backend)

**Delivered**: Complete structures backend API (Barriers, Regions, Sources)
**Effort**: 37h (97% of 38h est)
**Status**: ✅ Complete
**Grade**: A- (93/100)

**Key Deliverables**:
- 6 domain models (Barrier, Region, Source + Encounter variants)
- Database migration (6 tables)
- 18 API endpoints
- 3 service classes with EncounterService extensions
- 3 storage classes (complete CRUD)
- 45 unit tests (≥85% coverage)

**Technical Achievements**:
- RegionType/SourceType as extensible strings (NOT enums)
- Decimal precision (Range 5,2, Intensity 3,2)
- Single Point position for Sources
- JSON columns for complex types

**Details**: [PHASE_8_ENCOUNTER_MGMT.md#phase-8-6](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-6)

---

### 2025-10-28 (v1.10.0) - Roadmap Expansion (Structures Phases Added)

**Changes**: Added Phase 8.6 (Structures Backend, 32-42h) and Phase 8.7 (Structures Frontend, 56-76h)
**Reason**: Structures are NOT assets - three distinct categories with different behaviors
**Total Effort**: 282h → 370h (+88-118h)

**Details**: [Main Roadmap](./ROADMAP.md)

---

### 2025-10-28 (v1.9.0) - Phase 8.5 Partial Complete (Incomplete Items)

**Delivered**: 5 of 6 incomplete items from Phases 6-8
**Effort**: 9h
**Status**: 🚧 Partial

**Completed**:
- Encounter duplication with smart naming (3h)
- Adventure duplication with smart naming (2h)
- Auto-naming assets (0h - verified complete)
- Selection undo/redo (0h - verified correct)
- Bulk asset operations (4h - collection-level clone/delete)

**Pending**: Structure placement (4-6h - needs clarification)

**Details**: [PHASE_8_ENCOUNTER_MGMT.md#phase-8-5](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-5)

---

### 2025-10-26 (v1.8.1) - Phase 8 Complete (Encounter Management)

**Delivered**: Encounter Editor backend persistence and properties panel
**Effort**: 23h (vs 12h est, 192%)
**Status**: ✅ Complete
**Grade**: A- (88/100)

**Key Changes**:
- Encounter Editor backend persistence (all fields)
- Properties panel (collapsible, responsive 3-column layout)
- Encounter operations (duplicate/delete)
- Navigation (back button, editable name)
- Save status indicators
- Grid configuration persistence

**Critical Fixes**: 7 regressions fixed (asset selection, marquee, grid, multi-asset drag, modifier keys, persistence)
**Backend**: IsPublished field added, circular reference fix

**Details**: [PHASE_8_ENCOUNTER_MGMT.md#phase-8-0](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-0)

---

### 2025-10-25 (v1.8.0) - Phase 7 Complete (Adventure Management)

**Delivered**: Library page with adventure management
**Effort**: 19h (vs 21h est, 90%)
**Status**: ✅ Complete
**Grade**: A- (92/100)

**Key Changes**:
- Library page (unified content view)
- Adventure List (infinite scroll, 4 filters, debounced search)
- Adventure Detail page (inline editing, auto-save, background upload, encounter management)
- Type system consolidated (domain.ts source of truth)
- GridConfig structure updated (nested cellSize/offset)

**Architecture**: Discovered DDD aggregate pattern, swapped Phase 7/8 to align

**Details**: [PHASE_7_ADVENTURE_MGMT.md](./phases/PHASE_7_ADVENTURE_MGMT.md)

---

### 2025-10-23 (v1.7.0) - Phase 6 Complete (Encounter Editor - Tokens, Undo, Offline)

**Delivered**: Complete encounter editor with major enhancements beyond spec
**Effort**: 30h+ (vs 25h est, 120%)
**Status**: ✅ Complete
**Grade**: A+ (5/5 stars - GO FOR PRODUCTION)

**Major Enhancements**:
- Multi-asset selection system (click/Ctrl+click, marquee, persistence)
- Advanced snap modes (Alt/Ctrl/Ctrl+Alt, size-aware)
- Collision detection (real-time overlap, red X markers)
- Group dragging (maintains relative positions)
- Enhanced undo/redo (batch commands, Memento pattern)
- Layout architecture separation (EditorLayout vs AppLayout)

**Tests**: 255+ tests passing (85% coverage)
**Quality**: 89.4% fix rate (42/47 issues resolved)

**Details**: [PHASE_6_ENCOUNTER_EDITOR.md](./phases/PHASE_6_ENCOUNTER_EDITOR.md)

---

## 2025-09/10 (Phases 1-5 - Foundation & Encounter Basics)

### 2025-10-11 (v1.4.0) - Phase 5 Complete (Asset Library)

**Delivered**: Asset library UI with major scope expansion
**Effort**: 70h (vs 16h est, 437%)
**Status**: ✅ Complete
**Grade**: A

**Scope Expansion**:
- Phase 5.5: Multi-resource system, NamedSize, Accordion UI (14h)
- Phase 5.6: Resource redesign, SVG→PNG conversion, keyboard shortcuts (16h)
- Phase 5.7: Blob storage architecture, GUID v7, metadata (4h)

**Quality**: 110+ tests passing, 0 errors, 0 warnings

**Details**: [PHASE_5_ASSET_LIBRARY.md](./phases/PHASE_5_ASSET_LIBRARY.md)

---

### 2025-10-05 (v1.3.0) - Phase 4 Complete (Grid & Layers)

**Delivered**: Grid rendering system with 5 grid types and layer management
**Effort**: 12h (100%)
**Status**: ✅ Complete
**Grade**: A

**Details**: [PHASE_4_GRID_LAYERS.md](./phases/PHASE_4_GRID_LAYERS.md)

---

### 2025-10-04 (v1.2.0) - Phase 3 Complete (Encounter Pan/Zoom)

**Delivered**: Konva Stage with pan/zoom + authentication improvements
**Effort**: 28h (vs 16h est, 175%)
**Status**: ✅ Complete
**Grade**: A

**Scope Expansion**: Auth state management (8h), authorization documentation (4h)

**Details**: [PHASE_3_ENCOUNTER_PAN_ZOOM.md](./phases/PHASE_3_ENCOUNTER_PAN_ZOOM.md)

---

### 2025-10-01 (v1.1.0) - Phase 2 Complete (Auth & Landing)

**Delivered**: Login, registration, 2FA, password reset pages + landing page
**Effort**: 16h (100%)
**Status**: ✅ Complete
**Grade**: A

**Note**: 2FA setup UI deferred to Phase 11

**Details**: [PHASE_2_AUTH_LANDING.md](./phases/PHASE_2_AUTH_LANDING.md)

---

### 2025-09-28 (v1.0.0) - Phase 1 Complete (Foundation)

**Delivered**: React 19 + TypeScript + Vite + Redux Toolkit + React Router
**Effort**: 8h (100%)
**Status**: ✅ Complete
**Grade**: A

**Details**: [PHASE_1_FOUNDATION.md](./phases/PHASE_1_FOUNDATION.md)

---

## Roadmap Milestones

- **2025-10-03** (v0.2.0): Fixed 6 dependency errors in roadmap
- **2025-10-03** (v0.1.0): Initial roadmap generated for EPIC-001 with 11 phases

---

## Related Documentation

- [Phase Files](./phases/) - Detailed phase documentation
- [LESSONS_LEARNED.md](./LESSONS_LEARNED.md) - Technical insights (23 lessons)
- [Main Roadmap](./ROADMAP.md) - Overall progress
