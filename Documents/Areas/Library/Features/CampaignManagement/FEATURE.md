# Campaign Management Feature

**Original Request**: Manage multi-adventure storylines (Campaign entities) within epic hierarchy or standalone

**Campaign Management** is a content organization feature that enables Game Masters to create, manage, and organize multi-adventure storylines connecting related adventures. This feature affects the Library area and enables Game Masters to structure their game content into campaign-level narratives that can optionally belong to an epic or exist standalone.

---

## Change Log
- *2025-10-02* — **1.0.0** — Feature specification created from domain model extraction

---

## Feature Overview

### Business Value
- **User Benefit**: Game Masters can organize multiple adventures into connected storylines, with flexibility to nest campaigns within epics or maintain them as standalone content
- **Business Objective**: Provide mid-level organizational structure for hierarchical game content management with optional epic association (Epic → Campaign → Adventure → Scene)
- **Success Criteria**: Game Masters can create campaigns (standalone or within epics), update campaign properties, move campaigns between epic/standalone, control visibility, and delete campaigns with proper cascade handling

### Area Assignment
- **Primary Area**: Library
- **Secondary Areas**: None (Library bounded context)
- **Cross-Area Impact**:
  - Identity context: OwnerId references User entities
  - Media context: Background property references Resource entities for visual backdrops
  - Library (internal): EpicId optionally references parent Epic entity

---

## UI Presentation

### Feature UI Overview
- **Has UI Components**: no
- **UI Components**: None (API/Backend feature)
- **Access Method**: API endpoints or internal services

### Use Case UI Breakdown
- **Create Campaign**: API_ENDPOINT - POST /api/library/campaigns
- **Update Campaign**: API_ENDPOINT - PUT /api/library/campaigns/:id
- **Get Campaign By ID**: API_ENDPOINT - GET /api/library/campaigns/:id
- **Get Campaigns By Epic**: API_ENDPOINT - GET /api/library/campaigns?epicId=:epicId
- **Move Campaign To Epic**: API_ENDPOINT - PATCH /api/library/campaigns/:id/move-to-epic
- **Make Campaign Standalone**: API_ENDPOINT - PATCH /api/library/campaigns/:id/make-standalone
- **Delete Campaign**: API_ENDPOINT - DELETE /api/library/campaigns/:id

---

## Architecture Analysis

### Area Impact Assessment
- **Library**: Core campaign management logic, persistence operations, hierarchy management, cascade delete enforcement, optional epic association
- **Identity (External)**: Campaign ownership validation (OwnerId must reference existing User)
- **Media (External)**: Background resource validation (must be valid Image resource if provided)

### Use Case Breakdown
- **Create Campaign** (Library): Create new campaign with optional epic association and adventures, enforce invariants INV-01 through INV-06
- **Update Campaign** (Library): Modify campaign properties, enforce publication rules (INV-04)
- **Get Campaign By ID** (Library): Retrieve single campaign by identifier with optional eager loading of adventures
- **Get Campaigns By Epic** (Library): Query campaigns within specific epic (or standalone with EpicId=null)
- **Move Campaign To Epic** (Library): Associate standalone campaign with epic (set EpicId)
- **Make Campaign Standalone** (Library): Remove campaign from epic (set EpicId=null)
- **Delete Campaign** (Library): Remove campaign and cascade delete all owned adventures (AGG-03 aggregate rule)

### Architectural Integration
- **New Interfaces Needed**: ILibraryStorage.CreateCampaignAsync, UpdateCampaignAsync, GetCampaignByIdAsync, GetCampaignsByEpicAsync, MoveCampaignToEpicAsync, MakeCampaignStandaloneAsync, DeleteCampaignAsync
- **External Dependencies**: IUserStorage (Identity), IMediaStorage (Media)
- **Implementation Priority**: Phase 2 (implement after Epic Management due to optional epic association)

---

## Technical Considerations

### Area Interactions
- **Library** → **Identity**: Campaign creation validates OwnerId references existing User
- **Library** → **Media**: Campaign creation/update validates Background references valid Image resource
- **Library (internal)** → **Library**: Campaign optionally references parent Epic (nullable FK, INV-06)

### Integration Requirements
- **Data Sharing**: Campaign.OwnerId shared with Identity context, Campaign.Background shared with Media context, Campaign.EpicId references Epic within Library
- **Interface Contracts**: ILibraryStorage interface defines campaign operations, IUserStorage validates ownership, IMediaStorage validates resources
- **Dependency Management**: Library depends on Identity and Media abstractions (ports), not concrete implementations; Campaign has optional self-reference to Epic within bounded context

### Implementation Guidance
- **Development Approach**:
  - Implement Campaign entity as immutable record (data contract) with nullable EpicId
  - ILibraryStorage service enforces invariants (INV-01 through INV-06) and aggregate rules (AGG-03, AGG-04)
  - Use EF Core for persistence with cascade delete configuration and nullable FK for optional epic association
  - Validate OwnerId via IUserStorage port
  - Validate Background via IMediaStorage port
  - Support hierarchy movement operations (add to epic, make standalone)
- **Testing Strategy**:
  - Unit tests for invariant enforcement (name validation, publication rules, optional epic reference)
  - Integration tests for cascade delete behavior and hierarchy movement
  - Acceptance tests for ownership validation, epic association, and standalone mode
- **Architecture Compliance**:
  - Domain entities are anemic data contracts
  - Business logic resides in ILibraryStorage application service
  - Dependencies point inward (Infrastructure → Application → Domain)
  - Optional parent reference (nullable FK) enables flexible hierarchy

---

## Use Case Implementation Plan

### Implementation Phases

#### Phase 1: Core Campaign Operations
- **Create Campaign**: Foundation capability for campaign creation with optional epic association and adventure ownership
- **Get Campaign By ID**: Essential retrieval operation for single campaign access
- **Get Campaigns By Epic**: Essential for retrieving campaigns within epic or standalone

#### Phase 2: Campaign Management
- **Update Campaign**: Build on foundation to enable property modifications and publication
- **Move Campaign To Epic**: Add hierarchy management for epic association
- **Make Campaign Standalone**: Add hierarchy management for standalone mode
- **Delete Campaign**: Add removal capability with cascade delete enforcement (AGG-03)

### Dependencies & Prerequisites
- **Technical Dependencies**: EF Core, IUserStorage, IMediaStorage abstractions, Epic entity
- **Area Dependencies**: Identity context (User entity), Media context (Resource entity), Library (Epic entity for optional association)
- **External Dependencies**: Database with cascade delete configuration and nullable FK support

---

This Campaign Management feature provides clear guidance for implementing multi-adventure storyline organization within the Library area while maintaining architectural integrity, area boundary respect, and flexible hierarchy management.

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
✅ 10pts: All feature use cases identified and listed (7 use cases)
✅ 5pts: Each use case assigned to appropriate area (Library)
✅ 5pts: Use case purposes clearly stated
✅ 5pts: Implementation phases logically ordered by dependencies

## Implementation Guidance (20 points)
✅ 5pts: New interfaces needed are identified (ILibraryStorage operations)
✅ 5pts: External dependencies documented (Identity, Media contexts)
✅ 5pts: Implementation priority clearly stated (Phase 2 after Epic)
✅ 5pts: Technical considerations address integration requirements

## Target Score: 100/100 ✅
-->
