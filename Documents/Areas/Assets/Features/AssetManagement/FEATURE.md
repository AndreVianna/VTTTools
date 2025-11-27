# Asset Management Feature

**Original Request**: Manage reusable game asset templates for VTT Tools platform

**Asset Management** is a content management feature that enables creation, modification, retrieval, and deletion of reusable game asset templates (creatures, characters, NPCs, objects, tokens, walls, doors, effects). This feature affects the Assets area and enables Game Masters to organize and maintain their library of game assets for use in adventures and encounters.

---

## Change Log
- *2025-11-26* — **2.0.0** — Phase 3 UI implementation completed (Asset Browser + Asset Studio)
- *2025-10-02* — **1.0.0** — Feature specification created from domain model

---

## Feature Overview

### Business Value
- **User Benefit**: Centralized management of reusable game elements with powerful organization and search capabilities
- **Business Objective**: Provide efficient asset library management reducing preparation time for Game Masters
- **Success Criteria**:
  - Asset creation completion rate >95%
  - Average asset retrieval time <200ms
  - Zero data loss incidents
  - Asset reuse rate >70% (assets used in multiple encounters)

### Area Assignment
- **Primary Area**: Assets
- **Secondary Areas**: Identity (ownership), Media (display resources)
- **Cross-Area Impact**:
  - Identity: Asset ownership linked to User entities
  - Media: Asset display properties reference Resource entities
  - Library: Encounters reference Asset templates for placement

---

## UI Presentation

### Feature UI Overview
- **Has UI Components**: yes (implemented)
- **Primary UI Type**: DESKTOP_DASHBOARD (data-rich layout optimized for desktop)
- **UI Complexity**: High - multi-pane layouts, taxonomy tree, search, bulk operations
- **Estimated UI Components**: 20+ components (browser layout, studio layout, panels, grids, toolbars)

### Use Case UI Breakdown
- **Create Asset**: FORM_DIALOG - Asset Studio 3-pane editor (`/assets/new`)
- **Get Asset**: DETAIL_PANEL - Asset Inspector Panel in Browser right sidebar
- **Update Asset**: FORM_DIALOG - Asset Studio 3-pane editor (`/assets/:id/edit`)
- **Delete Asset**: CONFIRM_DIALOG - Confirmation from Browser or Studio toolbar
- **List Assets**: DATA_TABLE/GRID - Asset Browser with card/table views (`/assets`)
- **List Assets By Owner**: FILTER - Ownership filter in Browser left sidebar
- **List Public Assets**: FILTER - Status filter in Browser left sidebar
- **List Assets By Type**: TREE_VIEW - Taxonomy tree in Browser left sidebar

### UI Integration Points
- **Navigation Entries**: "Library" menu item in main navigation
- **Routes**: `/assets` (Browser), `/assets/new` (Create), `/assets/:id/edit` (Edit)
- **Shared Components**: See Component Architecture below

### Component Architecture

#### Asset Browser (Mail Client Layout)
```
┌─────────────────────────────────────────────────────────────────┐
│ AssetLibraryPage                                                │
├──────────────┬────────────────────────────┬─────────────────────┤
│ Left (250px) │ Center (fluid)             │ Right (300px)       │
│              │                            │ (collapsible)       │
├──────────────┼────────────────────────────┼─────────────────────┤
│ • New Asset  │ BrowserToolbar             │ AssetInspectorPanel │
│   Button     │ ├─ Search                  │ ├─ Portrait         │
│              │ ├─ Sort                    │ ├─ Name/Category    │
│ TaxonomyTree │ └─ View Toggle             │ ├─ Tokens           │
│ ├─ Kind      │                            │ ├─ Quick Stats      │
│ ├─ Category  │ AssetTableView (table)     │ └─ Actions          │
│ ├─ Type      │ or                         │                     │
│ └─ Subtype   │ AssetCardCompact (grid)    │                     │
│              │                            │                     │
│ Attributes   │                            │                     │
│ ├─ HP Range  │                            │                     │
│ ├─ AC Range  │                            │                     │
│ └─ CR Range  │                            │                     │
│              │                            │                     │
│ Ownership    │                            │                     │
│ Status       │                            │                     │
└──────────────┴────────────────────────────┴─────────────────────┘
```

**Browser Components** (`src/components/assets/browser/`):
- `AssetBrowserLayout.tsx` - 3-column mail client layout container
- `TaxonomyTree.tsx` - Collapsible tree with Kind/Category/Type/Subtype hierarchy
- `BrowserToolbar.tsx` - Search, sort, view mode toggle
- `AssetTableView.tsx` - MUI DataGrid table view
- `AssetCardCompact.tsx` - Card view for grid display
- `AssetInspectorPanel.tsx` - Right sidebar detail panel
- `AttributeRangeSlider.tsx` - HP/AC/CR range filters

#### Asset Studio (3-Pane Editor)
```
┌─────────────────────────────────────────────────────────────────┐
│ StudioToolbar                                                   │
│ ├─ Back Button                                                  │
│ ├─ Title + Dirty Indicator                                      │
│ ├─ Status Chip (Draft/Published)                                │
│ └─ Actions (Delete, Publish/Unpublish, Save)                    │
├──────────────────┬────────────────────────┬─────────────────────┤
│ Visual (30%)     │ Data (40%)             │ Metadata (30%)      │
├──────────────────┼────────────────────────┼─────────────────────┤
│ VisualIdentity   │ DataPanel              │ MetadataPanel       │
│ Panel            │                        │                     │
│                  │ PropertyGrid           │ ├─ Name             │
│ ├─ Portrait      │ ├─ Core Stats          │ ├─ Description      │
│ │   (large)      │ │  ├─ HP               │ ├─ Classification   │
│ │                │ │  ├─ AC               │ │  (Breadcrumb)     │
│ └─ Tokens        │ │  └─ Speed            │ ├─ Token Size       │
│    (gallery)     │ ├─ Ability Scores      │ └─ Visibility       │
│                  │ │  ├─ STR/DEX/CON      │                     │
│                  │ │  └─ INT/WIS/CHA      │                     │
│                  │ └─ Other               │                     │
│                  │    └─ Custom props     │                     │
└──────────────────┴────────────────────────┴─────────────────────┘
```

**Studio Components** (`src/components/assets/studio/`):
- `AssetStudioLayout.tsx` - 3-pane (30%/40%/30%) layout container
- `StudioToolbar.tsx` - Back, title, save/delete/publish actions
- `VisualIdentityPanel.tsx` - Portrait and tokens management
- `DataPanel.tsx` - Stat blocks with level tabs
- `PropertyGrid.tsx` - VS-style collapsible key/value editor
- `MetadataPanel.tsx` - Name, description, classification, visibility
- `BreadcrumbTaxonomyInput.tsx` - Breadcrumb-style Kind>Category>Type selector

**Page Components** (`src/pages/`):
- `AssetLibraryPage.tsx` - Browser page with filter state management
- `AssetStudioPage.tsx` - Create/Edit page with form state management

**Hooks** (`src/hooks/`):
- `useAssetBrowser.ts` - Browser state: filters, selection, sorting, view mode

---

## Architecture Analysis

### Area Impact Assessment
- **Assets**: Core CRUD operations for Asset entities, type categorization, ownership enforcement
- **Identity**: Ownership validation - assets linked to User.Id via OwnerId foreign key
- **Media**: Display resource references - assets reference Resource.Id via Display value object
- **Library**: Encounter placement - EncounterAsset references Asset.Id when placing assets on encounters

### Use Case Breakdown
- **Create Asset** (Assets): Create new asset template with validation
- **Get Asset** (Assets): Retrieve single asset by ID with authorization check
- **Update Asset** (Assets): Modify existing asset properties with ownership validation
- **Delete Asset** (Assets): Remove asset if not in use with cascade checks
- **List Assets** (Assets): Query all assets with optional filtering (admin operation)
- **List Assets By Owner** (Assets): Query assets owned by specific user
- **List Public Assets** (Assets): Query publicly visible assets (IsPublic=true)
- **List Assets By Type** (Assets): Query assets filtered by AssetType enum

### Architectural Integration
- **New Interfaces Needed**:
  - IAssetStorage (8 operations defined in domain model)
  - IAssetAuthorizationService (ownership and permission checks)
- **External Dependencies**:
  - User entity from Identity context (via OwnerId)
  - Resource entity from Media context (via Display.ResourceId)
  - EncounterAsset query for usage checks (Library context)
- **Implementation Priority**: Phase 1 (CRUD operations) → Phase 2 (Query operations) → Phase 3 (Frontend UI)

---

## Technical Considerations

### Area Interactions
- **Assets** → **Identity**: Validate OwnerId references existing User during creation
- **Assets** → **Media**: Validate Display.ResourceId references existing Image Resource
- **Assets** ← **Library**: Check EncounterAsset usage before allowing deletion
- **Identity** → **Assets**: User deletion should handle orphaned assets (cascade or reassign)

### Integration Requirements
- **Data Sharing**: Asset.Id shared with Library for encounter placement references
- **Interface Contracts**:
  - IAssetStorage interface defines 8 operations (domain layer contract)
  - Application services implement IAssetStorage (infrastructure layer)
  - REST/GraphQL adapters expose operations via HTTP
- **Dependency Management**: Assets depends on Identity and Media for validation, Library depends on Assets for references

### Implementation Guidance
- **Development Approach**:
  - Backend-first implementation (API endpoints)
  - DDD Contracts + Service Implementation pattern
  - Anemic entities with behavior in application services
  - Repository pattern for persistence
- **Testing Strategy**:
  - Unit tests for validation rules (INV-01 through INV-06)
  - Integration tests for service operations
  - BDD scenarios for business rules (BR-01 through BR-09)
  - E2E tests for complete workflows (future UI implementation)
- **Architecture Compliance**:
  - Clean Architecture layers (Domain → Application → Infrastructure → UI)
  - Hexagonal Architecture ports/adapters (IAssetStorage as port)
  - DDD aggregate boundaries (Asset aggregate root with Display/Frame value objects)

---

## Use Case Implementation Plan

### Implementation Phases

#### Phase 1: Core CRUD Operations ✅ COMPLETED
- **Create Asset**: Foundation capability for asset creation with validation
- **Get Asset**: Essential retrieval operation for detail views
- **Update Asset**: Modify asset properties with ownership checks
- **Delete Asset**: Remove assets with usage validation

#### Phase 2: Query Operations ✅ COMPLETED
- **List Assets**: Admin operation for all assets
- **List Assets By Owner**: User's personal asset library
- **List Public Assets**: Community-shared assets browsing
- **List Assets By Type**: Filtered queries by asset category

#### Phase 3: Frontend UI ✅ COMPLETED (2025-11-26)
- **Asset Browser** (Mail Client Layout):
  - 3-column layout: Left sidebar (250px) | Center (fluid) | Right inspector (300px, collapsible)
  - TaxonomyTree with collapsible Kind/Category/Type/Subtype hierarchy
  - Progressive indentation for tree levels
  - Auto-collapse: clicking a Kind collapses other Kinds
  - Card view (large/small) and table view toggle
  - Search, sort, and filter capabilities
  - Attribute range sliders (HP, AC, CR)
  - Ownership and status filters
  - Bulk selection and delete operations

- **Asset Studio** (3-Pane Editor):
  - 3-pane layout: Visual (30%) | Data (40%) | Metadata (30%)
  - Portrait and token management in Visual panel
  - PropertyGrid with collapsible sections (Core Stats, Ability Scores, Other)
  - Breadcrumb-style taxonomy input for classification
  - Token size selector
  - Visibility toggle (Public/Draft)
  - Save/Delete/Publish/Unpublish actions in toolbar
  - Dirty state tracking with unsaved changes warning

#### Phase 4: Smart Resource Picker (Priority: Medium, future work)
- Modal dialog for selecting portraits and tokens
- Integration with Media area for resource browsing
- Upload new resources inline
- Preview and selection capabilities

### Dependencies & Prerequisites
- **Technical Dependencies**:
  - EF Core for persistence
  - ASP.NET Core for REST API
  - Identity area for User entity
  - Media area for Resource entity
  - React 18+ with TypeScript
  - MUI v6+ (Material UI)
  - MUI X Data Grid v8+
  - RTK Query for API state management
- **Area Dependencies**:
  - Identity: User entity and authentication
  - Media: Resource entity for images
- **External Dependencies**:
  - Database (SQL Server or PostgreSQL)
  - File storage for asset images (Azure Blob or S3)

---

## Design Decisions

### Desktop-First Approach
The UI is optimized for desktop use only. VTT (Virtual Tabletop) tools are inherently desktop applications, so no mobile responsiveness is implemented. Fixed widths and multi-column layouts are used throughout.

### TaxonomyTree Behavior
- All root nodes (Kinds) are always visible
- Clicking a Kind expands it and collapses other Kinds
- Children are progressively indented (12px per level)
- Clicking the same node toggles selection off
- Expand/collapse chevrons allow toggling without changing selection

### Asset Studio Layout
The 3-pane layout mirrors professional asset editors:
- **Visual panel** (left): What the asset looks like
- **Data panel** (center): Game mechanics and stats
- **Metadata panel** (right): Organizational and system properties

---

This Asset Management feature provides comprehensive guidance for implementing asset library operations within the Assets area while maintaining architectural integrity and area boundary respect.
