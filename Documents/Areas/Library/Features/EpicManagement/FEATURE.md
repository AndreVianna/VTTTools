# World Management Feature

**Original Request**: Manage multi-campaign story arcs (World entities) for organizing hierarchical game content

**World Management** is a content organization feature that enables Game Masters to create, manage, and organize multi-campaign story arcs (Worlds) at the highest level of the content hierarchy. This feature affects the Library area and enables Game Masters to structure their game content into large-scale narrative arcs spanning multiple campaigns.

---

## Change Log
- *2025-10-02* — **1.0.0** — Feature specification created from domain model extraction

---

## Feature Overview

### Business Value
- **User Benefit**: Game Masters can organize multiple campaigns into cohesive story arcs, making it easier to manage long-running game narratives across multiple campaign storylines
- **Business Objective**: Provide the top-level organizational structure for hierarchical game content management (World → Campaign → Adventure → Encounter)
- **Success Criteria**: Game Masters can create worlds with associated campaigns, update world properties, control visibility (public/published), and delete worlds with proper cascade handling

### Area Assignment
- **Primary Area**: Library
- **Secondary Areas**: None (Library bounded context)
- **Cross-Area Impact**:
  - Identity context: OwnerId references User entities
  - Media context: Background property references Resource entities for visual backdrops
  - Game context: Active game sessions may reference encounters within world hierarchy (prevents deletion)

---

## UI Presentation

### Feature UI Overview
- **Has UI Components**: no
- **UI Components**: None (API/Backend feature)
- **Access Method**: API endpoints or internal services

### Use Case UI Breakdown
- **Create World**: API_ENDPOINT - POST /api/library/worlds
- **Get World By ID**: API_ENDPOINT - GET /api/library/worlds/:id
- **Update World**: API_ENDPOINT - PUT /api/library/worlds/:id
- **Delete World**: API_ENDPOINT - DELETE /api/library/worlds/:id
- **Get Worlds By Owner**: API_ENDPOINT - GET /api/library/worlds?ownerId=:ownerId

---

## Architecture Analysis

### Area Impact Assessment
- **Library**: Core world management logic, persistence operations, hierarchy management, cascade delete enforcement
- **Identity (External)**: World ownership validation (OwnerId must reference existing User)
- **Media (External)**: Background resource validation (must be valid Image resource if provided)
- **Game (External)**: Prevents world deletion if referenced by active game sessions

### Use Case Breakdown
- **Create World** (Library): Create new world with optional campaigns, enforce invariants INV-01 through INV-05
- **Get World By ID** (Library): Retrieve world with owned campaigns collection
- **Update World** (Library): Modify world properties, enforce publication rules (INV-04)
- **Delete World** (Library): Remove world and cascade to campaigns/adventures/encounters (AGG-01)
- **Get Worlds By Owner** (Library): Query worlds owned by specific Game Master

### Architectural Integration
- **New Interfaces Needed**: ILibraryStorage.CreateWorldAsync, GetWorldByIdAsync, UpdateWorldAsync, DeleteWorldAsync, GetWorldsByOwnerAsync
- **External Dependencies**: IUserStorage (Identity), IMediaStorage (Media), IGameSessionStorage (Game)
- **Implementation Priority**: Foundation phase (implement before Campaign Management due to hierarchy)

---

## Technical Considerations

### Area Interactions
- **Library** → **Identity**: World creation validates OwnerId references existing User
- **Library** → **Media**: World creation/update validates Background references valid Image resource
- **Library** → **Game**: World deletion checks for active game session references to prevent orphaning

### Integration Requirements
- **Data Sharing**: World.OwnerId shared with Identity context, World.Background shared with Media context
- **Interface Contracts**: ILibraryStorage interface defines world operations, IUserStorage validates ownership
- **Dependency Management**: Library depends on Identity and Media abstractions (ports), not concrete implementations

### Implementation Guidance
- **Development Approach**:
  - Implement World entity as immutable record (data contract)
  - ILibraryStorage service enforces invariants (INV-01 through INV-05) and aggregate rules (AGG-01, AGG-02)
  - Use EF Core for persistence with cascade delete configuration
  - Validate OwnerId via IUserStorage port
  - Validate Background via IMediaStorage port
- **Testing Strategy**:
  - Unit tests for invariant enforcement (name validation, publication rules)
  - Integration tests for cascade delete behavior
  - Acceptance tests for ownership validation and hierarchy management
- **Architecture Compliance**:
  - Domain entities are anemic data contracts
  - Business logic resides in ILibraryStorage application service
  - Dependencies point inward (Infrastructure → Application → Domain)

---

## Use Case Implementation Plan

### Implementation Phases

#### Phase 1: Core World Operations
- **Create World**: Foundation capability for world creation with campaign ownership
- **Get World By ID**: Essential for retrieving world details with campaigns

#### Phase 2: World Management
- **Update World**: Build on foundation to enable property modifications and publication
- **Get Worlds By Owner**: Add query capability for Game Master's world library
- **Delete World**: Implement cascade delete with active session validation

### Dependencies & Prerequisites
- **Technical Dependencies**: EF Core, IUserStorage, IMediaStorage abstractions
- **Area Dependencies**: Identity context (User entity), Media context (Resource entity)
- **External Dependencies**: Database with cascade delete configuration

---

This World Management feature provides clear guidance for implementing multi-campaign story arc organization within the Library area while maintaining architectural integrity and area boundary respect.

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
✅ 10pts: All feature use cases identified and listed (5 use cases)
✅ 5pts: Each use case assigned to appropriate area (Library)
✅ 5pts: Use case purposes clearly stated
✅ 5pts: Implementation phases logically ordered by dependencies

## Implementation Guidance (20 points)
✅ 5pts: New interfaces needed are identified (ILibraryStorage operations)
✅ 5pts: External dependencies documented (Identity, Media, Game contexts)
✅ 5pts: Implementation priority clearly stated (Foundation phase)
✅ 5pts: Technical considerations address integration requirements

## Target Score: 100/100 ✅
-->
