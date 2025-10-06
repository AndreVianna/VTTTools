# Adventure Management Feature

**Original Request**: Manage individual game modules (Adventure entities) with multiple scenes within campaign hierarchy or standalone

**Adventure Management** is a content organization feature that enables Game Masters to create, manage, and organize individual game modules or scenarios with categorization support. This feature affects the Library area and enables Game Masters to structure their game content into adventure-level modules that can optionally belong to a campaign or exist standalone.

---

## Change Log
- *2025-10-02* — **1.0.0** — Feature specification created from domain model extraction

---

## Feature Overview

### Business Value
- **User Benefit**: Game Masters can organize multiple scenes into complete game modules with type categorization (Generic, OpenWorld, DungeonCrawl, etc.), with flexibility to nest adventures within campaigns or maintain them as standalone content
- **Business Objective**: Provide adventure-level organizational structure for hierarchical game content management with optional campaign association and type categorization (Epic → Campaign → Adventure → Scene)
- **Success Criteria**: Game Masters can create adventures (standalone or within campaigns), categorize adventures by type, update adventure properties, move adventures between campaign/standalone, clone adventures with all scenes, control visibility, and delete adventures with proper cascade handling

### Area Assignment
- **Primary Area**: Library
- **Secondary Areas**: None (Library bounded context)
- **Cross-Area Impact**:
  - Identity context: OwnerId references User entities
  - Media context: Background property references Resource entities for visual backdrops
  - Library (internal): CampaignId optionally references parent Campaign entity

---

## UI Presentation

### Feature UI Overview
- **Has UI Components**: no
- **UI Components**: None (API/Backend feature)
- **Access Method**: API endpoints or internal services

### Use Case UI Breakdown
- **Create Adventure**: API_ENDPOINT - POST /api/library/adventures
- **Update Adventure**: API_ENDPOINT - PUT /api/library/adventures/:id
- **Get Adventure By ID**: API_ENDPOINT - GET /api/library/adventures/:id
- **Clone Adventure**: API_ENDPOINT - POST /api/library/adventures/:id/clone
- **Move Adventure To Campaign**: API_ENDPOINT - PATCH /api/library/adventures/:id/move-to-campaign
- **Make Adventure Standalone**: API_ENDPOINT - PATCH /api/library/adventures/:id/make-standalone
- **Delete Adventure**: API_ENDPOINT - DELETE /api/library/adventures/:id

---

## Architecture Analysis

### Area Impact Assessment
- **Library**: Core adventure management logic, persistence operations, hierarchy management, cascade delete enforcement, optional campaign association, adventure cloning with scene duplication
- **Identity (External)**: Adventure ownership validation (OwnerId must reference existing User)
- **Media (External)**: Background resource validation (must be valid Image resource if provided)

### Use Case Breakdown
- **Create Adventure** (Library): Create new adventure with optional campaign association and scenes, enforce invariants INV-01 through INV-08
- **Update Adventure** (Library): Modify adventure properties (including Type), enforce publication rules (INV-04)
- **Get Adventure By ID** (Library): Retrieve single adventure by identifier with optional eager loading of scenes
- **Clone Adventure** (Library): Duplicate adventure with all owned scenes (deep copy operation)
- **Move Adventure To Campaign** (Library): Associate standalone adventure with campaign (set CampaignId)
- **Make Adventure Standalone** (Library): Remove adventure from campaign (set CampaignId=null)
- **Delete Adventure** (Library): Remove adventure and cascade delete all owned scenes (AGG-05 aggregate rule)

### Architectural Integration
- **New Interfaces Needed**: ILibraryStorage.CreateAdventureAsync, UpdateAdventureAsync, GetAdventureByIdAsync, CloneAdventureAsync, MoveAdventureToCampaignAsync, MakeAdventureStandaloneAsync, DeleteAdventureAsync
- **External Dependencies**: IUserStorage (Identity), IMediaStorage (Media)
- **Implementation Priority**: Phase 3 (implement after Campaign Management due to optional campaign association)

---

## Technical Considerations

### Area Interactions
- **Library** → **Identity**: Adventure creation validates OwnerId references existing User
- **Library** → **Media**: Adventure creation/update validates Background references valid Image resource
- **Library (internal)** → **Library**: Adventure optionally references parent Campaign (nullable FK, INV-08), owns Scene entities (cascade)

### Integration Requirements
- **Data Sharing**: Adventure.OwnerId shared with Identity context, Adventure.Background shared with Media context, Adventure.CampaignId references Campaign within Library
- **Interface Contracts**: ILibraryStorage interface defines adventure operations, IUserStorage validates ownership, IMediaStorage validates resources
- **Dependency Management**: Library depends on Identity and Media abstractions (ports), not concrete implementations; Adventure has optional self-reference to Campaign within bounded context

### Implementation Guidance
- **Development Approach**:
  - Implement Adventure entity as immutable record (data contract) with nullable CampaignId and AdventureType enum
  - ILibraryStorage service enforces invariants (INV-01 through INV-08) and aggregate rules (AGG-05, AGG-06)
  - Use EF Core for persistence with cascade delete configuration and nullable FK for optional campaign association
  - Validate OwnerId via IUserStorage port
  - Validate Background via IMediaStorage port
  - Support hierarchy movement operations (add to campaign, make standalone)
  - Implement deep clone operation for adventure and all owned scenes
- **Testing Strategy**:
  - Unit tests for invariant enforcement (name validation, type validation, publication rules, optional campaign reference)
  - Integration tests for cascade delete behavior, hierarchy movement, and adventure cloning
  - Acceptance tests for ownership validation, campaign association, standalone mode, and scene duplication
- **Architecture Compliance**:
  - Domain entities are anemic data contracts
  - Business logic resides in ILibraryStorage application service
  - Dependencies point inward (Infrastructure → Application → Domain)
  - Optional parent reference (nullable FK) enables flexible hierarchy
  - AdventureType enum provides type safety for categorization

---

## Use Case Implementation Plan

### Implementation Phases

#### Phase 1: Core Adventure Operations
- **Create Adventure**: Foundation capability for adventure creation with optional campaign association and scene ownership
- **Get Adventure By ID**: Essential retrieval operation for single adventure access
- **Update Adventure**: Enable property modifications (including type changes) and publication

#### Phase 2: Adventure Management
- **Move Adventure To Campaign**: Add hierarchy management for campaign association
- **Make Adventure Standalone**: Add hierarchy management for standalone mode
- **Clone Adventure**: Add deep copy capability for adventure reuse with all scenes
- **Delete Adventure**: Add removal capability with cascade delete enforcement (AGG-05)

### Dependencies & Prerequisites
- **Technical Dependencies**: EF Core, IUserStorage, IMediaStorage abstractions, Campaign entity
- **Area Dependencies**: Identity context (User entity), Media context (Resource entity), Library (Campaign entity for optional association)
- **External Dependencies**: Database with cascade delete configuration and nullable FK support

---

This Adventure Management feature provides clear guidance for implementing individual game module organization within the Library area while maintaining architectural integrity, area boundary respect, flexible hierarchy management, and adventure reuse capabilities.

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
✅ 5pts: Implementation priority clearly stated (Phase 3 after Campaign)
✅ 5pts: Technical considerations address integration requirements

## Target Score: 100/100 ✅
-->
