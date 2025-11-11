# Campaign Management Feature

**Original Request**: Manage multi-adventure storylines (Campaign entities) within world hierarchy or standalone

**Campaign Management** is a content organization feature that enables Game Masters to create, manage, and organize multi-adventure storylines connecting related adventures. This feature affects the Library area and enables Game Masters to structure their game content into campaign-level narratives that can optionally belong to an world or exist standalone.

---

## Change Log
- *2025-10-02* — **1.0.0** — Feature specification created from domain model extraction

---

## Feature Overview

### Business Value
- **User Benefit**: Game Masters can organize multiple adventures into connected storylines, with flexibility to nest campaigns within worlds or maintain them as standalone content
- **Business Objective**: Provide mid-level organizational structure for hierarchical game content management with optional world association (World → Campaign → Adventure → Encounter)
- **Success Criteria**: Game Masters can create campaigns (standalone or within worlds), update campaign properties, move campaigns between world/standalone, control visibility, and delete campaigns with proper cascade handling

### Area Assignment
- **Primary Area**: Library
- **Secondary Areas**: None (Library bounded context)
- **Cross-Area Impact**:
  - Identity context: OwnerId references User entities
  - Media context: Background property references Resource entities for visual backdrops
  - Library (internal): WorldId optionally references parent World entity

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
- **Get Campaigns By World**: API_ENDPOINT - GET /api/library/campaigns?worldId=:worldId
- **Move Campaign To World**: API_ENDPOINT - PATCH /api/library/campaigns/:id/move-to-world
- **Make Campaign Standalone**: API_ENDPOINT - PATCH /api/library/campaigns/:id/make-standalone
- **Delete Campaign**: API_ENDPOINT - DELETE /api/library/campaigns/:id

---

## Architecture Analysis

### Area Impact Assessment
- **Library**: Core campaign management logic, persistence operations, hierarchy management, cascade delete enforcement, optional world association
- **Identity (External)**: Campaign ownership validation (OwnerId must reference existing User)
- **Media (External)**: Background resource validation (must be valid Image resource if provided)

### Use Case Breakdown
- **Create Campaign** (Library): Create new campaign with optional world association and adventures, enforce invariants INV-01 through INV-06
- **Update Campaign** (Library): Modify campaign properties, enforce publication rules (INV-04)
- **Get Campaign By ID** (Library): Retrieve single campaign by identifier with optional eager loading of adventures
- **Get Campaigns By World** (Library): Query campaigns within specific world (or standalone with WorldId=null)
- **Move Campaign To World** (Library): Associate standalone campaign with world (set WorldId)
- **Make Campaign Standalone** (Library): Remove campaign from world (set WorldId=null)
- **Delete Campaign** (Library): Remove campaign and cascade delete all owned adventures (AGG-03 aggregate rule)

### Architectural Integration
- **New Interfaces Needed**: ILibraryStorage.CreateCampaignAsync, UpdateCampaignAsync, GetCampaignByIdAsync, GetCampaignsByWorldAsync, MoveCampaignToWorldAsync, MakeCampaignStandaloneAsync, DeleteCampaignAsync
- **External Dependencies**: IUserStorage (Identity), IMediaStorage (Media)
- **Implementation Priority**: Phase 2 (implement after World Management due to optional world association)

---

## Technical Considerations

### Area Interactions
- **Library** → **Identity**: Campaign creation validates OwnerId references existing User
- **Library** → **Media**: Campaign creation/update validates Background references valid Image resource
- **Library (internal)** → **Library**: Campaign optionally references parent World (nullable FK, INV-06)

### Integration Requirements
- **Data Sharing**: Campaign.OwnerId shared with Identity context, Campaign.Background shared with Media context, Campaign.WorldId references World within Library
- **Interface Contracts**: ILibraryStorage interface defines campaign operations, IUserStorage validates ownership, IMediaStorage validates resources
- **Dependency Management**: Library depends on Identity and Media abstractions (ports), not concrete implementations; Campaign has optional self-reference to World within bounded context

### Implementation Guidance
- **Development Approach**:
  - Implement Campaign entity as immutable record (data contract) with nullable WorldId
  - ILibraryStorage service enforces invariants (INV-01 through INV-06) and aggregate rules (AGG-03, AGG-04)
  - Use EF Core for persistence with cascade delete configuration and nullable FK for optional world association
  - Validate OwnerId via IUserStorage port
  - Validate Background via IMediaStorage port
  - Support hierarchy movement operations (add to world, make standalone)
- **Testing Strategy**:
  - Unit tests for invariant enforcement (name validation, publication rules, optional world reference)
  - Integration tests for cascade delete behavior and hierarchy movement
  - Acceptance tests for ownership validation, world association, and standalone mode
- **Architecture Compliance**:
  - Domain entities are anemic data contracts
  - Business logic resides in ILibraryStorage application service
  - Dependencies point inward (Infrastructure → Application → Domain)
  - Optional parent reference (nullable FK) enables flexible hierarchy

---

## Use Case Implementation Plan

### Implementation Phases

#### Phase 1: Core Campaign Operations
- **Create Campaign**: Foundation capability for campaign creation with optional world association and adventure ownership
- **Get Campaign By ID**: Essential retrieval operation for single campaign access
- **Get Campaigns By World**: Essential for retrieving campaigns within world or standalone

#### Phase 2: Campaign Management
- **Update Campaign**: Build on foundation to enable property modifications and publication
- **Move Campaign To World**: Add hierarchy management for world association
- **Make Campaign Standalone**: Add hierarchy management for standalone mode
- **Delete Campaign**: Add removal capability with cascade delete enforcement (AGG-03)

### Dependencies & Prerequisites
- **Technical Dependencies**: EF Core, IUserStorage, IMediaStorage abstractions, World entity
- **Area Dependencies**: Identity context (User entity), Media context (Resource entity), Library (World entity for optional association)
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
✅ 5pts: Implementation priority clearly stated (Phase 2 after World)
✅ 5pts: Technical considerations address integration requirements

## Target Score: 100/100 ✅
-->
