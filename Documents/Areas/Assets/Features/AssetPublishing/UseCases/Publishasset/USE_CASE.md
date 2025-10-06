# Publish Asset Use Case

**Original Request**: Transition asset from unpublished to published state

**Publish Asset** is a workflow operation that marks an asset as published (IsPublished=true) after validating it is public. This use case operates within the Assets area and enables Game Masters to approve assets for use in production game sessions.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model

---

## Use Case Overview

### Business Context
- **Parent Feature**: Asset Publishing
- **Owning Area**: Assets
- **Business Value**: Enable controlled asset approval workflow ensuring only vetted content used in live sessions
- **User Benefit**: Mark assets as production-ready separating drafts from approved content

### Scope Definition
- **Primary Actor**: Authenticated User (Asset Owner or Admin)
- **Scope**: Asset publication state transition with validation
- **Level**: User Goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP/GraphQL

- **Endpoint**: POST /api/assets/:id/publish
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/GraphQL
- **Response Format**: JSON with updated Asset object (IsPublished=true)

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: AssetPublishingService.PublishAsync(Guid assetId)
- **Domain Entities**: Asset (aggregate root)
- **Domain Services**: IAssetStorage.UpdateAsync() (used for state change persistence)
- **Infrastructure Dependencies**: DbContext (Asset update)

### Hexagonal Architecture
- **Primary Port Operation**: IAssetPublishingService.PublishAsync(Guid assetId)
- **Secondary Port Dependencies**:
  - IAssetStorage.GetByIdAsync(assetId)
  - IAssetStorage.UpdateAsync(asset with { IsPublished = true })
- **Adapter Requirements**: HTTP adapter, database adapter

### DDD Alignment
- **Bounded Context**: Assets
- **Ubiquitous Language**: Publish asset, approve asset, production-ready, asset approval
- **Business Invariants**: INV-04 (published assets must be public)
- **Domain Events**: AssetPublished(assetId, ownerId, timestamp) (future implementation)

---

## Functional Specification

### Input Requirements
- **Input Data**: Asset ID (Guid, required)
- **Input Validation**: Asset ID must be valid Guid format
- **Preconditions**:
  - User is authenticated
  - Asset exists
  - User is owner or admin (authorization)
  - Asset IsPublic=true (required before publishing, BR-04)

### Business Logic
- **Business Rules**:
  - BR-04: Published assets must be public (INV-04)
  - BR-05: Only owner can publish asset (except admins)
  - Cannot publish already-published asset (idempotent: return success if already published)
- **Processing Steps**:
  1. Validate assetId format and asset exists
  2. Authorize: current user is owner OR admin
  3. Check current state: if already IsPublished=true, return success (idempotent)
  4. Validate IsPublic=true (BR-04: published implies public)
  5. If IsPublic=false, return validation error requiring IsPublic=true first
  6. Update asset: set IsPublished=true via IAssetStorage.UpdateAsync()
  7. Return updated Asset
  8. (Future) Publish AssetPublished domain event
- **Domain Coordination**: Asset immutable update (with expression) enforcing invariant INV-04
- **Validation Logic**: Authorization check, public-before-publish validation

### Output Specification
- **Output Data**: Updated Asset entity with IsPublished=true
- **Output Format**: JSON response
  ```json
  {
    "id": "asset-guid",
    "ownerId": "user-guid",
    "type": "Creature",
    "name": "Dragon",
    "isPublished": true,
    "isPublic": true,
    ...
  }
  ```
- **Postconditions**:
  - Asset IsPublished=true
  - Asset remains IsPublic=true (unchanged, required precondition)
  - Asset approved for production use

### Error Scenarios
- **Asset Not Found**: Return 404 Not Found with "Asset not found"
- **Unauthorized**: Return 403 Forbidden with "Access denied - must be asset owner" (BR-05)
- **Not Public**: Return 400 Bad Request with "Cannot publish private asset - set IsPublic=true first" (BR-04)
- **Invalid ID Format**: Return 400 Bad Request with "Invalid asset ID format"
- **Database Error**: Return 500 Internal Server Error with "Failed to publish asset"
- **Unauthenticated**: Return 401 Unauthorized if user not authenticated

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```csharp
  public interface IAssetPublishingService
  {
      Task<Asset> PublishAsync(Guid assetId);
  }
  ```
- **Data Access Patterns**: Load asset, validate, update IsPublished flag
- **External Integration**: None
- **Performance Requirements**: <150ms publish operation

### Architecture Compliance
- **Layer Responsibilities**:
  - Application: Authorization, orchestrate workflow, enforce BR-04 (public before publish)
  - Domain: Invariant definition (INV-04), immutable entity update
  - Infrastructure: Persistence
- **Dependency Direction**: Application → Domain ← Infrastructure
- **Interface Abstractions**: IAssetPublishingService, IAssetStorage
- **KISS Validation**: Simple state transition with public-first validation

### Testing Strategy
- **Unit Testing**:
  - Test authorization (owner allowed, non-owner rejected, admin allowed)
  - Test public-before-publish validation (IsPublic=false rejected)
  - Test idempotency (already published returns success)
  - Test state transition (IsPublished false → true)
- **Integration Testing**:
  - Test full publish workflow persists IsPublished=true
  - Test validation error when IsPublic=false
  - Test authorization enforcement
- **Acceptance Criteria**: See section below
- **BDD Scenarios**:
  - Given public unpublished asset, When owner publishes, Then IsPublished=true
  - Given private unpublished asset, When attempting publish, Then validation error
  - Given already published asset, When publishing again, Then success (idempotent)

---

## Acceptance Criteria

- **AC-01**: Owner publishes public unpublished asset
  - **Given**: User owns asset "abc-123" with IsPublic=true, IsPublished=false
  - **When**: PublishAssetCommand submitted
  - **Then**: Asset IsPublished=true, AssetPublished event published (future)

- **AC-02**: Admin publishes any public unpublished asset
  - **Given**: Admin user, asset "xyz-789" owned by another user, IsPublic=true, IsPublished=false
  - **When**: Admin submits PublishAssetCommand
  - **Then**: Asset IsPublished=true

- **AC-03**: Non-owner cannot publish asset
  - **Given**: User does not own asset "def-456"
  - **When**: User attempts PublishAssetCommand
  - **Then**: 403 Forbidden with "Access denied - must be asset owner" (BR-05)

- **AC-04**: Cannot publish private asset
  - **Given**: Asset "ghi-789" with IsPublic=false
  - **When**: Owner attempts PublishAssetCommand
  - **Then**: 400 Bad Request with "Cannot publish private asset - set IsPublic=true first" (BR-04)

- **AC-05**: Idempotent publish (already published)
  - **Given**: Asset "jkl-012" with IsPublished=true
  - **When**: Owner attempts PublishAssetCommand again
  - **Then**: Success, asset remains IsPublished=true (no error, idempotent)

- **AC-06**: Publish requires public first
  - **Given**: Asset with IsPublic=false, IsPublished=false
  - **When**: User first sets IsPublic=true via Update Asset, then submits PublishAssetCommand
  - **Then**: Asset IsPublished=true (two-step workflow: make public, then publish)

- **AC-07**: Asset not found returns 404
  - **Given**: No asset exists with ID "nonexistent-id"
  - **When**: User attempts PublishAssetCommand
  - **Then**: 404 Not Found with "Asset not found"

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Authorize → Load asset → Validate IsPublic → Update IsPublished → Persist
- **Code Organization**: AssetPublishingService.PublishAsync() in application layer
- **Testing Approach**: Unit tests for workflow logic, integration tests for persistence
- **Workflow**: Two-step process (Update Asset to set IsPublic=true, then Publish Asset)

### Dependencies
- **Technical Dependencies**: EF Core for persistence
- **Area Dependencies**: None (self-contained in Assets)
- **External Dependencies**: Database

### Architectural Considerations
- **Area Boundary Respect**: Publishing is internal Assets area workflow
- **Interface Design**: Dedicated publishing service for workflow operations
- **Error Handling**: Clear validation messages guiding user through prerequisite steps
- **Business Rule Enforcement**: BR-04 (published implies public) strictly enforced
- **Idempotency**: Repeated publish calls safe (return success if already published)

---

This Publish Asset use case provides comprehensive implementation guidance for asset publication workflow within the Assets area while maintaining business rule integrity and architectural standards.
