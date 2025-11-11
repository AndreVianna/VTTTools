# Asset Publishing Feature

**Original Request**: Manage asset publication status for VTT Tools platform

**Asset Publishing** is a workflow management feature that controls asset publication state transitions (unpublished → published, published → unpublished). This feature affects the Assets area and enables Game Masters to approve assets for use in game sessions and control asset lifecycle stages.

---

## Change Log
- *2025-10-02* — **1.0.0** — Feature specification created from domain model

---

## Feature Overview

### Business Value
- **User Benefit**: Controlled asset approval workflow separating draft assets from production-ready content
- **Business Objective**: Enable asset quality control and staged content release reducing errors in live game sessions
- **Success Criteria**:
  - Asset publication workflow completion rate >98%
  - Zero accidental publications of draft content
  - Clear distinction between draft and approved assets
  - Asset lifecycle visibility for content management

### Area Assignment
- **Primary Area**: Assets
- **Secondary Areas**: None (self-contained publishing logic)
- **Cross-Area Impact**:
  - Library: Published assets may have additional visibility or placement rules in encounters
  - Future: Notifications when assets published (if notification system implemented)

---

## UI Presentation

### Feature UI Overview
- **Has UI Components**: yes (future implementation)
- **Primary UI Type**: API_ENDPOINT (backend implementation priority) + BUTTON (future UI)
- **UI Complexity**: Low - simple state toggle with validation
- **Estimated UI Components**: 2 components (publish button, unpublish button with confirmation)

### Use Case UI Breakdown
- **Publish Asset**: API_ENDPOINT - No UI yet (backend only, future: BUTTON in asset detail view)
- **Unpublish Asset**: API_ENDPOINT - No UI yet (backend only, future: BUTTON in asset detail view)

### UI Integration Points
- **Navigation Entries**: None (actions in asset detail views, future implementation)
- **Routes Required**: None (actions via API, future: POST /api/assets/:id/publish, POST /api/assets/:id/unpublish)
- **Shared Components**: PublishButton, UnpublishButton with confirmation dialog (future)

---

## Architecture Analysis

### Area Impact Assessment
- **Assets**: Core publishing logic, IsPublished state management, publication workflow enforcement
- **Library**: May reference published status for encounter placement rules (optional, future)

### Use Case Breakdown
- **Publish Asset** (Assets): Transition asset from unpublished to published state with validation
- **Unpublish Asset** (Assets): Transition asset from published to unpublished state (draft/revision mode)

### Architectural Integration
- **New Interfaces Needed**:
  - IAssetPublishingService (publish/unpublish operations with workflow logic)
  - Publishing operations extend IAssetStorage.UpdateAsync() with specialized validation
- **External Dependencies**: None (self-contained in Assets area)
- **Implementation Priority**: Phase 2 (after core CRUD operations)

---

## Technical Considerations

### Area Interactions
- **Assets** → **Assets**: Publishing is internal state management within Assets aggregate
- **Assets** ← **Library** (future): Encounters may query published status for placement rules

### Integration Requirements
- **Data Sharing**: IsPublished boolean flag on Asset entity
- **Interface Contracts**:
  - Publishing operations enforce business rule BR-04 (published → public)
  - State transitions validated before persistence
- **Dependency Management**: Self-contained within Assets, no external area dependencies

### Implementation Guidance
- **Development Approach**:
  - Backend-first implementation (API endpoints)
  - Publishing logic in application services (AssetPublishingService)
  - Immutable entity updates (with expressions) for state transitions
  - Validation before state change persistence
- **Testing Strategy**:
  - Unit tests for publishing workflow validation (BR-04: published implies public)
  - Integration tests for state transition persistence
  - BDD scenarios for publication workflows
  - Edge case tests (already published, already unpublished)
- **Architecture Compliance**:
  - Clean Architecture: Publishing logic in application layer
  - DDD: Publishing enforces aggregate invariants (INV-04)
  - Immutable entities: State changes via with expressions

---

## Use Case Implementation Plan

### Implementation Phases

#### Phase 1: Publication Operations (Priority: High)
- **Publish Asset**: Enable asset approval for production use
- **Unpublish Asset**: Enable asset reversion to draft for revisions

#### Phase 2: Frontend UI (Priority: Medium, future work)
- Publish button in asset detail view
- Unpublish button with confirmation dialog
- Publication status badges in asset lists

#### Phase 3: Advanced Workflow (Priority: Low, future consideration)
- Publication approval workflows (multi-user approval)
- Publication scheduling (publish at specific time)
- Publication notifications (notify on state change)

### Dependencies & Prerequisites
- **Technical Dependencies**:
  - EF Core for persistence
  - ASP.NET Core for REST API
  - Asset Management feature (CRUD operations must exist first)
- **Area Dependencies**: None (self-contained)
- **External Dependencies**: Database

---

This Asset Publishing feature provides comprehensive guidance for implementing asset publication workflow operations within the Assets area while maintaining architectural integrity and business rule enforcement.
