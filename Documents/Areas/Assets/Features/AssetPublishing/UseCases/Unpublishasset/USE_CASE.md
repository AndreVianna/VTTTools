# Unpublish Asset Use Case

**Original Request**: Transition asset from published to unpublished state

**Unpublish Asset** is a workflow operation that marks an asset as unpublished (IsPublished=false) for revision or deactivation. This use case operates within the Assets area and enables Game Masters to revert assets to draft state for updates or removal from production use.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model

---

## Use Case Overview

### Business Context
- **Parent Feature**: Asset Publishing
- **Owning Area**: Assets
- **Business Value**: Enable asset revision workflow allowing corrections without deleting and recreating assets
- **User Benefit**: Revert assets to draft state for updates or deactivation from live sessions

### Scope Definition
- **Primary Actor**: Authenticated User (Asset Owner or Admin)
- **Scope**: Asset publication state transition (published → unpublished)
- **Level**: User Goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP/GraphQL

- **Endpoint**: POST /api/assets/:id/unpublish
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/GraphQL
- **Response Format**: JSON with updated Asset object (IsPublished=false)

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: AssetPublishingService.UnpublishAsync(Guid assetId)
- **Domain Entities**: Asset (aggregate root)
- **Domain Services**: IAssetStorage.UpdateAsync() (used for state change persistence)
- **Infrastructure Dependencies**: DbContext (Asset update)

### Hexagonal Architecture
- **Primary Port Operation**: IAssetPublishingService.UnpublishAsync(Guid assetId)
- **Secondary Port Dependencies**:
  - IAssetStorage.GetByIdAsync(assetId)
  - IAssetStorage.UpdateAsync(asset with { IsPublished = false })
- **Adapter Requirements**: HTTP adapter, database adapter

### DDD Alignment
- **Bounded Context**: Assets
- **Ubiquitous Language**: Unpublish asset, revert to draft, deactivate asset
- **Business Invariants**: None (unpublishing relaxes INV-04 constraint)
- **Domain Events**: AssetUnpublished(assetId, ownerId, timestamp) (future implementation)

---

## Functional Specification

### Input Requirements
- **Input Data**: Asset ID (Guid, required)
- **Input Validation**: Asset ID must be valid Guid format
- **Preconditions**:
  - User is authenticated
  - Asset exists
  - User is owner or admin (authorization)

### Business Logic
- **Business Rules**:
  - BR-05: Only owner can unpublish asset (except admins)
  - Cannot unpublish already-unpublished asset (idempotent: return success if already unpublished)
  - Unpublishing does NOT change IsPublic state (IsPublic remains unchanged)
  - No constraint on IsPublic when unpublishing (can unpublish public or private assets)
- **Processing Steps**:
  1. Validate assetId format and asset exists
  2. Authorize: current user is owner OR admin
  3. Check current state: if already IsPublished=false, return success (idempotent)
  4. Update asset: set IsPublished=false via IAssetStorage.UpdateAsync()
  5. Return updated Asset (IsPublished=false, IsPublic unchanged)
  6. (Future) Publish AssetUnpublished domain event
- **Domain Coordination**: Asset immutable update (with expression) setting IsPublished=false
- **Validation Logic**: Authorization check only (no business rule constraints)

### Output Specification
- **Output Data**: Updated Asset entity with IsPublished=false
- **Output Format**: JSON response
  ```json
  {
    "id": "asset-guid",
    "ownerId": "user-guid",
    "type": "Creature",
    "name": "Dragon",
    "isPublished": false,
    "isPublic": true,  // or false, unchanged by unpublish
    ...
  }
  ```
- **Postconditions**:
  - Asset IsPublished=false
  - Asset IsPublic unchanged (independent state)
  - Asset reverted to draft/revision mode

### Error Scenarios
- **Asset Not Found**: Return 404 Not Found with "Asset not found"
- **Unauthorized**: Return 403 Forbidden with "Access denied - must be asset owner" (BR-05)
- **Invalid ID Format**: Return 400 Bad Request with "Invalid asset ID format"
- **Database Error**: Return 500 Internal Server Error with "Failed to unpublish asset"
- **Unauthenticated**: Return 401 Unauthorized if user not authenticated

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```csharp
  public interface IAssetPublishingService
  {
      Task<Asset> UnpublishAsync(Guid assetId);
  }
  ```
- **Data Access Patterns**: Load asset, validate authorization, update IsPublished flag
- **External Integration**: None
- **Performance Requirements**: <150ms unpublish operation

### Architecture Compliance
- **Layer Responsibilities**:
  - Application: Authorization, orchestrate workflow
  - Domain: Immutable entity update
  - Infrastructure: Persistence
- **Dependency Direction**: Application → Domain ← Infrastructure
- **Interface Abstractions**: IAssetPublishingService, IAssetStorage
- **KISS Validation**: Simple state transition with authorization

### Testing Strategy
- **Unit Testing**:
  - Test authorization (owner allowed, non-owner rejected, admin allowed)
  - Test idempotency (already unpublished returns success)
  - Test state transition (IsPublished true → false)
  - Test IsPublic unchanged (remains true or false after unpublish)
- **Integration Testing**:
  - Test full unpublish workflow persists IsPublished=false
  - Test authorization enforcement
  - Test IsPublic independence (unpublish public asset keeps IsPublic=true)
- **Acceptance Criteria**: See section below
- **BDD Scenarios**:
  - Given published asset, When owner unpublishes, Then IsPublished=false
  - Given already unpublished asset, When unpublishing again, Then success (idempotent)
  - Given non-owner attempts unpublish, When command submitted, Then forbidden

---

## Acceptance Criteria

- **AC-01**: Owner unpublishes published asset
  - **Given**: User owns asset "abc-123" with IsPublished=true
  - **When**: UnpublishAssetCommand submitted
  - **Then**: Asset IsPublished=false, AssetUnpublished event published (future)

- **AC-02**: Admin unpublishes any published asset
  - **Given**: Admin user, asset "xyz-789" owned by another user, IsPublished=true
  - **When**: Admin submits UnpublishAssetCommand
  - **Then**: Asset IsPublished=false

- **AC-03**: Non-owner cannot unpublish asset
  - **Given**: User does not own asset "def-456"
  - **When**: User attempts UnpublishAssetCommand
  - **Then**: 403 Forbidden with "Access denied - must be asset owner" (BR-05)

- **AC-04**: Idempotent unpublish (already unpublished)
  - **Given**: Asset "ghi-789" with IsPublished=false
  - **When**: Owner attempts UnpublishAssetCommand again
  - **Then**: Success, asset remains IsPublished=false (no error, idempotent)

- **AC-05**: IsPublic unchanged by unpublish
  - **Given**: Asset with IsPublished=true, IsPublic=true
  - **When**: Owner unpublishes asset
  - **Then**: Asset IsPublished=false, IsPublic=true (IsPublic unchanged)

- **AC-06**: Can unpublish public asset
  - **Given**: Asset with IsPublished=true, IsPublic=true
  - **When**: Owner unpublishes asset
  - **Then**: Success, asset IsPublished=false, IsPublic=true (public unpublished asset allowed)

- **AC-07**: Asset not found returns 404
  - **Given**: No asset exists with ID "nonexistent-id"
  - **When**: User attempts UnpublishAssetCommand
  - **Then**: 404 Not Found with "Asset not found"

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Authorize → Load asset → Update IsPublished=false → Persist
- **Code Organization**: AssetPublishingService.UnpublishAsync() in application layer
- **Testing Approach**: Unit tests for workflow logic, integration tests for persistence
- **Workflow**: Single-step process (no preconditions, simpler than Publish)

### Dependencies
- **Technical Dependencies**: EF Core for persistence
- **Area Dependencies**: None (self-contained in Assets)
- **External Dependencies**: Database

### Architectural Considerations
- **Area Boundary Respect**: Unpublishing is internal Assets area workflow
- **Interface Design**: Dedicated publishing service for workflow operations
- **Error Handling**: Minimal error scenarios (authorization only)
- **State Independence**: IsPublic and IsPublished are independent states (unpublish does not affect IsPublic)
- **Idempotency**: Repeated unpublish calls safe (return success if already unpublished)
- **Use Cases**: Revision workflow (unpublish → update → republish), deactivation (unpublish to remove from production)

---

This Unpublish Asset use case provides comprehensive implementation guidance for asset unpublication workflow within the Assets area while maintaining simplicity and architectural standards.
