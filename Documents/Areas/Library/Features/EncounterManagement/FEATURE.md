# Encounter Management Feature

**Original Request**: Manage interactive tactical maps (Encounter entities) with stage, grid, and asset placement within adventure hierarchy or standalone

**Encounter Management** is a tactical map design feature that enables Game Masters to create, manage, and configure interactive tactical maps with visual rendering (Stage), grid overlays (Grid), and asset placements (EncounterAsset). This feature affects the Library area and enables Game Masters to design the most granular content unit with full encounter composition capabilities that can optionally belong to an adventure or exist standalone.

---

## Change Log
- *2025-10-03* — **1.3.0** — Created Place Asset use case specification
- *2025-10-03* — **1.2.0** — Created Configure Grid use case specification
- *2025-10-03* — **1.1.0** — Created Configure Stage use case specification
- *2025-10-02* — **1.0.0** — Feature specification created from domain model extraction

---

## Feature Overview

### Business Value
- **User Benefit**: Game Masters can design complete tactical maps with background images, grid configurations (square, hexagonal, isometric), and placed asset instances, with flexibility to nest encounters within adventures or maintain them as standalone content
- **Business Objective**: Provide encounter-level tactical map design capabilities with comprehensive composition features (background, grid, asset placement) within hierarchical game content management with optional adventure association (World → Campaign → Adventure → Encounter)
- **Success Criteria**: Game Masters can create encounters (standalone or within adventures), configure stage rendering (background, viewport, dimensions), configure grid overlay (type, size, offset, color), place/move/remove assets, clone encounters with all assets, and delete encounters with active game session validation

### Area Assignment
- **Primary Area**: Library
- **Secondary Areas**: None (Library bounded context)
- **Cross-Area Impact**:
  - Identity context: OwnerId references User entities
  - Media context: Stage.Background references Resource entities for visual backdrops
  - Assets context: EncounterAsset.AssetId references Asset template entities
  - Library (internal): AdventureId optionally references parent Adventure entity
  - Game context: Encounters may be referenced by active GameSession entities (prevents deletion)

---

## UI Presentation

### Feature UI Overview
- **Has UI Components**: no
- **UI Components**: None (API/Backend feature)
- **Access Method**: API endpoints or internal services

### Use Case UI Breakdown
- **Create Encounter**: API_ENDPOINT - POST /api/library/encounters
- **Update Encounter**: API_ENDPOINT - PUT /api/library/encounters/:id
- **Get Encounter By ID**: API_ENDPOINT - GET /api/library/encounters/:id
- **Configure Stage**: API_ENDPOINT - PATCH /api/library/encounters/:id/stage
- **Configure Grid**: API_ENDPOINT - PATCH /api/library/encounters/:id/grid
- **Place Asset**: API_ENDPOINT - POST /api/library/encounters/:id/assets
- **Move Asset**: API_ENDPOINT - PATCH /api/library/encounters/:id/assets/:assetId/move
- **Remove Asset**: API_ENDPOINT - DELETE /api/library/encounters/:id/assets/:assetId
- **Clone Encounter**: API_ENDPOINT - POST /api/library/encounters/:id/clone
- **Delete Encounter**: API_ENDPOINT - DELETE /api/library/encounters/:id

---

## Architecture Analysis

### Area Impact Assessment
- **Library**: Core encounter management logic, persistence operations, hierarchy management, encounter composition (Stage, Grid, EncounterAsset), active game session validation for deletion
- **Identity (External)**: Encounter ownership validation (OwnerId must reference existing User)
- **Media (External)**: Stage.Background resource validation (must be valid Image resource if provided)
- **Assets (External)**: EncounterAsset.AssetId validation (must reference existing Asset template)
- **Game (External)**: Prevents encounter deletion if referenced by active game sessions (AGG-09)

### Use Case Breakdown
- **Create Encounter** (Library): Create new encounter with optional adventure association, Stage, Grid, and assets, enforce invariants INV-01, INV-02, INV-03, INV-05, INV-09, INV-10, INV-11
- **Update Encounter** (Library): Modify encounter properties (name, description, IsPublished)
- **Get Encounter By ID** (Library): Retrieve single encounter by identifier with Stage, Grid, and EncounterAsset compositions
- **Configure Stage** (Library): Update Stage value object (background, viewport, dimensions), enforce INV-09
- **Configure Grid** (Library): Update Grid value object (type, size, offset, color), enforce INV-10
- **Place Asset** (Library): Add EncounterAsset to Assets collection, validate AssetId, enforce INV-11
- **Move Asset** (Library): Update EncounterAsset position (X, Y) and optionally dimensions/ZIndex/rotation
- **Remove Asset** (Library): Remove EncounterAsset from Assets collection
- **Clone Encounter** (Library): Duplicate encounter with all Stage, Grid, and EncounterAsset configurations (deep copy operation)
- **Delete Encounter** (Library): Remove encounter with active game session validation (AGG-09 prevents deletion if referenced)

### Architectural Integration
- **New Interfaces Needed**: ILibraryStorage.CreateEncounterAsync, UpdateEncounterAsync, GetEncounterByIdAsync, ConfigureStageAsync, ConfigureGridAsync, PlaceAssetAsync, MoveAssetAsync, RemoveAssetAsync, CloneEncounterAsync, DeleteEncounterAsync
- **External Dependencies**: IUserStorage (Identity), IMediaStorage (Media), IAssetStorage (Assets), IGameSessionStorage (Game)
- **Implementation Priority**: Phase 4 (implement after Adventure Management due to optional adventure association, requires Asset context integration)

---

## Technical Considerations

### Area Interactions
- **Library** → **Identity**: Encounter creation validates OwnerId references existing User
- **Library** → **Media**: Encounter stage configuration validates Background references valid Image resource
- **Library** → **Assets**: Encounter asset placement validates AssetId references existing Asset template
- **Library** → **Game**: Encounter deletion checks for active game session references to prevent orphaning (AGG-09)
- **Library (internal)** → **Library**: Encounter optionally references parent Adventure (nullable FK)

### Integration Requirements
- **Data Sharing**: Encounter.OwnerId shared with Identity context, Encounter.Stage.Background shared with Media context, EncounterAsset.AssetId shared with Assets context, Encounter.AdventureId references Adventure within Library
- **Interface Contracts**: ILibraryStorage interface defines encounter operations, IUserStorage validates ownership, IMediaStorage validates resources, IAssetStorage validates asset templates, IGameSessionStorage validates active references
- **Dependency Management**: Library depends on Identity, Media, Assets, and Game abstractions (ports), not concrete implementations; Encounter has optional self-reference to Adventure within bounded context

### Implementation Guidance
- **Development Approach**:
  - Implement Encounter entity as immutable record (data contract) with nullable AdventureId, Stage value object, Grid value object, and EncounterAsset collection
  - ILibraryStorage service enforces invariants (INV-01, INV-02, INV-03, INV-05, INV-09, INV-10, INV-11) and aggregate rules (AGG-07, AGG-08, AGG-09)
  - Use EF Core for persistence with nullable FK for optional adventure association and owned entity configuration for Stage/Grid value objects
  - Validate OwnerId via IUserStorage port
  - Validate Stage.Background via IMediaStorage port
  - Validate EncounterAsset.AssetId via IAssetStorage port
  - Validate active game session references via IGameSessionStorage port before deletion
  - Implement deep clone operation for encounter and all value objects (Stage, Grid, EncounterAssets)
  - Enforce Stage dimension validation (Width > 0, Height > 0) via INV-09
  - Enforce Grid configuration consistency via INV-10
  - Optionally enforce EncounterAsset position validation (within Stage bounds) via INV-11
- **Testing Strategy**:
  - Unit tests for invariant enforcement (name validation, stage dimensions, grid configuration, asset positions)
  - Integration tests for value object persistence, active game session validation, and encounter cloning
  - Acceptance tests for ownership validation, adventure association, asset placement, and deletion prevention
- **Architecture Compliance**:
  - Domain entities are anemic data contracts
  - Value objects (Stage, Grid, EncounterAsset) are immutable and validated
  - Business logic resides in ILibraryStorage application service
  - Dependencies point inward (Infrastructure → Application → Domain)
  - Optional parent reference (nullable FK) enables flexible hierarchy
  - EncounterAssets are value objects with no independent existence (AGG-08)

---

## Use Case Implementation Plan

### Implementation Phases

#### Phase 1: Core Encounter Operations
- **Create Encounter**: Foundation capability for encounter creation with optional adventure association, Stage, Grid, and initial assets
- **Get Encounter By ID**: Essential retrieval operation for single encounter access with full composition
- **Update Encounter**: Enable property modifications (name, description, publication)

#### Phase 2: Encounter Composition
- **Configure Stage**: Add stage rendering configuration (background, viewport, dimensions)
- **Configure Grid**: Add grid overlay configuration (type, size, offset, color)

#### Phase 3: Asset Placement Management
- **Place Asset**: Add asset placement capability with position and dimensions
- **Move Asset**: Enable asset repositioning and transformation (X, Y, Width, Height, ZIndex, Rotation)
- **Remove Asset**: Add asset removal capability

#### Phase 4: Encounter Reuse & Deletion
- **Clone Encounter**: Add deep copy capability for encounter reuse with all composition elements
- **Delete Encounter**: Add removal capability with active game session validation (AGG-09)

### Dependencies & Prerequisites
- **Technical Dependencies**: EF Core, IUserStorage, IMediaStorage, IAssetStorage, IGameSessionStorage abstractions, Adventure entity
- **Area Dependencies**: Identity context (User entity), Media context (Resource entity), Assets context (Asset entity), Game context (GameSession entity), Library (Adventure entity for optional association)
- **External Dependencies**: Database with nullable FK support and owned entity configuration for value objects

---

This Encounter Management feature provides clear guidance for implementing interactive tactical map design within the Library area while maintaining architectural integrity, area boundary respect, comprehensive encounter composition capabilities, and game session safety.

<!--
═══════════════════════════════════════════════════════════════
FEATURE SPECIFICATION QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════

## Business Clarity (25 points)
✅ 5pts: Feature has clear user benefit statement
✅ 5pts: Business objective is specific and measurable
✅ 5pts: Success criteria are defined and testable
✅ 5pts: Target users clearly identified (Game Masters)
✅ 5pts: User value explicitly stated

## UI Presentation (check within Architecture Alignment)
✅ Has UI specified: no
✅ Use case UI types listed (all API_ENDPOINT)

## Architecture Alignment (30 points)
✅ 10pts: Primary area correctly assigned based on core responsibility (Library)
✅ 5pts: Secondary areas identified if cross-cutting (none within bounded context)
✅ 5pts: Area impact assessment complete for all affected areas
✅ 5pts: Area interactions documented with clear direction
✅ 5pts: No circular dependencies between areas

## Use Case Coverage (25 points)
✅ 10pts: All feature use cases identified and listed (10 use cases)
✅ 5pts: Each use case assigned to appropriate area (Library)
✅ 5pts: Use case purposes clearly stated
✅ 5pts: Implementation phases logically ordered by dependencies

## Implementation Guidance (20 points)
✅ 5pts: New interfaces needed are identified (ILibraryStorage operations)
✅ 5pts: External dependencies documented (Identity, Media, Assets, Game contexts)
✅ 5pts: Implementation priority clearly stated (Phase 4 after Adventure)
✅ 5pts: Technical considerations address integration requirements

## Target Score: 100/100 ✅
-->
