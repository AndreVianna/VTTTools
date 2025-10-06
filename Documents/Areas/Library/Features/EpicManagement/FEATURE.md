# Epic Management Feature

**Original Request**: Manage multi-campaign story arcs (Epic entities) for organizing hierarchical game content

**Epic Management** is a content organization feature that enables Game Masters to create, manage, and organize multi-campaign story arcs (Epics) at the highest level of the content hierarchy. This feature affects the Library area and enables Game Masters to structure their game content into large-scale narrative arcs spanning multiple campaigns.

---

## Change Log
- *2025-10-02* — **1.0.0** — Feature specification created from domain model extraction

---

## Feature Overview

### Business Value
- **User Benefit**: Game Masters can organize multiple campaigns into cohesive story arcs, making it easier to manage long-running game narratives across multiple campaign storylines
- **Business Objective**: Provide the top-level organizational structure for hierarchical game content management (Epic → Campaign → Adventure → Scene)
- **Success Criteria**: Game Masters can create epics with associated campaigns, update epic properties, control visibility (public/published), and delete epics with proper cascade handling

### Area Assignment
- **Primary Area**: Library
- **Secondary Areas**: None (Library bounded context)
- **Cross-Area Impact**:
  - Identity context: OwnerId references User entities
  - Media context: Background property references Resource entities for visual backdrops
  - Game context: Active game sessions may reference scenes within epic hierarchy (prevents deletion)

---

## UI Presentation

### Feature UI Overview
- **Has UI Components**: no
- **UI Components**: None (API/Backend feature)
- **Access Method**: API endpoints or internal services

### Use Case UI Breakdown
- **Create Epic**: API_ENDPOINT - POST /api/library/epics
- **Get Epic By ID**: API_ENDPOINT - GET /api/library/epics/:id
- **Update Epic**: API_ENDPOINT - PUT /api/library/epics/:id
- **Delete Epic**: API_ENDPOINT - DELETE /api/library/epics/:id
- **Get Epics By Owner**: API_ENDPOINT - GET /api/library/epics?ownerId=:ownerId

---

## Architecture Analysis

### Area Impact Assessment
- **Library**: Core epic management logic, persistence operations, hierarchy management, cascade delete enforcement
- **Identity (External)**: Epic ownership validation (OwnerId must reference existing User)
- **Media (External)**: Background resource validation (must be valid Image resource if provided)
- **Game (External)**: Prevents epic deletion if referenced by active game sessions

### Use Case Breakdown
- **Create Epic** (Library): Create new epic with optional campaigns, enforce invariants INV-01 through INV-05
- **Get Epic By ID** (Library): Retrieve epic with owned campaigns collection
- **Update Epic** (Library): Modify epic properties, enforce publication rules (INV-04)
- **Delete Epic** (Library): Remove epic and cascade to campaigns/adventures/scenes (AGG-01)
- **Get Epics By Owner** (Library): Query epics owned by specific Game Master

### Architectural Integration
- **New Interfaces Needed**: ILibraryStorage.CreateEpicAsync, GetEpicByIdAsync, UpdateEpicAsync, DeleteEpicAsync, GetEpicsByOwnerAsync
- **External Dependencies**: IUserStorage (Identity), IMediaStorage (Media), IGameSessionStorage (Game)
- **Implementation Priority**: Foundation phase (implement before Campaign Management due to hierarchy)

---

## Technical Considerations

### Area Interactions
- **Library** → **Identity**: Epic creation validates OwnerId references existing User
- **Library** → **Media**: Epic creation/update validates Background references valid Image resource
- **Library** → **Game**: Epic deletion checks for active game session references to prevent orphaning

### Integration Requirements
- **Data Sharing**: Epic.OwnerId shared with Identity context, Epic.Background shared with Media context
- **Interface Contracts**: ILibraryStorage interface defines epic operations, IUserStorage validates ownership
- **Dependency Management**: Library depends on Identity and Media abstractions (ports), not concrete implementations

### Implementation Guidance
- **Development Approach**:
  - Implement Epic entity as immutable record (data contract)
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

#### Phase 1: Core Epic Operations
- **Create Epic**: Foundation capability for epic creation with campaign ownership
- **Get Epic By ID**: Essential for retrieving epic details with campaigns

#### Phase 2: Epic Management
- **Update Epic**: Build on foundation to enable property modifications and publication
- **Get Epics By Owner**: Add query capability for Game Master's epic library
- **Delete Epic**: Implement cascade delete with active session validation

### Dependencies & Prerequisites
- **Technical Dependencies**: EF Core, IUserStorage, IMediaStorage abstractions
- **Area Dependencies**: Identity context (User entity), Media context (Resource entity)
- **External Dependencies**: Database with cascade delete configuration

---

This Epic Management feature provides clear guidance for implementing multi-campaign story arc organization within the Library area while maintaining architectural integrity and area boundary respect.

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
