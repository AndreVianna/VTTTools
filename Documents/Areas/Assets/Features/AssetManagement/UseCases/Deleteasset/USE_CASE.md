# Delete Asset Use Case

**Original Request**: Remove asset from system

**Delete Asset** is a deletion operation that removes an asset template after validating it is not in use. This use case operates within the Assets area and enables Game Masters to clean up unused assets from their library.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model

---

## Use Case Overview

### Business Context
- **Parent Feature**: Asset Management
- **Owning Area**: Assets
- **Business Value**: Enable asset library cleanup reducing clutter and storage costs
- **User Benefit**: Remove unused or incorrect assets safely

### Scope Definition
- **Primary Actor**: Authenticated User (Asset Owner or Admin)
- **Scope**: Asset deletion with usage validation
- **Level**: User Goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP/GraphQL

- **Endpoint**: DELETE /api/assets/:id
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/GraphQL
- **Response Format**: 204 No Content on success

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: AssetService.DeleteAsync(Guid assetId)
- **Domain Entities**: Asset (for validation)
- **Domain Services**: IAssetStorage.DeleteAsync(), ISceneAssetQuery (usage check)
- **Infrastructure Dependencies**: DbContext, ISceneAssetRepository (Library area query)

### Hexagonal Architecture
- **Primary Port Operation**: IAssetStorage.DeleteAsync(Guid assetId)
- **Secondary Port Dependencies**:
  - ISceneAssetRepository.AnyByAssetIdAsync(assetId) - check usage
  - DbContext.Assets.Remove()
- **Adapter Requirements**: HTTP adapter, database adapter, cross-area query adapter

### DDD Alignment
- **Bounded Context**: Assets
- **Ubiquitous Language**: Delete asset, remove asset, asset in use
- **Business Invariants**: AGG-03 (cannot delete if in use)
- **Domain Events**: AssetDeleted (future implementation)

---

## Functional Specification

### Input Requirements
- **Input Data**: Asset ID (Guid, required)
- **Input Validation**: Asset ID must be valid Guid format
- **Preconditions**:
  - User is authenticated
  - Asset exists
  - User is owner or admin
  - Asset is not in use in any scene (SceneAsset references)

### Business Logic
- **Business Rules**:
  - BR-05: Only owner can delete asset (except admins)
  - BR-06: Asset cannot be deleted if in use (AGG-03)
- **Processing Steps**:
  1. Validate assetId format and asset exists
  2. Authorize: current user is owner OR admin
  3. Query Library area: check if SceneAsset references exist for assetId
  4. If in use, return error (BR-06)
  5. Delete Asset via IAssetStorage.DeleteAsync()
  6. Return 204 No Content
  7. (Future) Publish AssetDeleted domain event
- **Domain Coordination**: Cross-area query to Library for usage check
- **Validation Logic**: Authorization check, usage check before deletion

### Output Specification
- **Output Data**: None (204 No Content)
- **Output Format**: HTTP 204 response
- **Postconditions**:
  - Asset removed from database
  - No orphaned SceneAsset references (validated before deletion)

### Error Scenarios
- **Asset Not Found**: Return 404 Not Found with "Asset not found"
- **Unauthorized**: Return 403 Forbidden with "Access denied - must be asset owner" (BR-05)
- **Asset In Use**: Return 409 Conflict with "Cannot delete asset - in use in N scenes" (BR-06)
- **Database Error**: Return 500 Internal Server Error with "Failed to delete asset"
- **Unauthenticated**: Return 401 Unauthorized if user not authenticated

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```csharp
  public interface IAssetStorage
  {
      Task DeleteAsync(Guid assetId);
  }

  public interface ISceneAssetQuery
  {
      Task<bool> AnyByAssetIdAsync(Guid assetId);
      Task<int> CountByAssetIdAsync(Guid assetId);
  }
  ```
- **Data Access Patterns**: Soft delete (recommended) or hard delete with cascades prevented
- **External Integration**: Query Library area for SceneAsset usage
- **Performance Requirements**: <200ms delete operation, usage check <100ms

### Architecture Compliance
- **Layer Responsibilities**:
  - Application: Authorization, orchestrate usage check, coordinate deletion
  - Domain: Entity definition
  - Infrastructure: Persistence, cross-area query
- **Dependency Direction**: Application → Domain ← Infrastructure, Assets query Library
- **Interface Abstractions**: IAssetStorage, ISceneAssetQuery
- **KISS Validation**: Simple existence and usage checks

### Testing Strategy
- **Unit Testing**:
  - Test authorization logic (owner allowed, non-owner rejected, admin allowed)
  - Test usage check logic
- **Integration Testing**:
  - Test deletion of unused asset succeeds
  - Test deletion of asset in use returns 409 Conflict
  - Test authorization enforcement
  - Test cross-area query integration
- **Acceptance Criteria**: See section below
- **BDD Scenarios**:
  - Given unused asset owned by user, When deleting, Then asset removed
  - Given asset in use on scene, When attempting delete, Then conflict error
  - Given non-owner attempts delete, When command submitted, Then forbidden

---

## Acceptance Criteria

- **AC-01**: Owner deletes unused asset
  - **Given**: User owns asset "abc-123" not used in any scenes
  - **When**: DeleteAssetCommand submitted
  - **Then**: Asset deleted, 204 No Content returned

- **AC-02**: Admin deletes any unused asset
  - **Given**: User has admin role, asset "xyz-789" not in use
  - **When**: Admin submits DeleteAssetCommand
  - **Then**: Asset deleted, 204 No Content returned

- **AC-03**: Non-owner cannot delete asset
  - **Given**: User does not own asset "def-456"
  - **When**: User attempts DeleteAssetCommand
  - **Then**: 403 Forbidden with "Access denied - must be asset owner" (BR-05)

- **AC-04**: Cannot delete asset in use
  - **Given**: Asset "ghi-789" is used in 3 scenes
  - **When**: Owner attempts DeleteAssetCommand
  - **Then**: 409 Conflict with "Cannot delete asset - in use in 3 scenes" (BR-06)

- **AC-05**: Non-existent asset returns 404
  - **Given**: No asset exists with ID "nonexistent-id"
  - **When**: User attempts DeleteAssetCommand
  - **Then**: 404 Not Found with "Asset not found"

- **AC-06**: Invalid ID format rejected
  - **Given**: Invalid Guid format "not-a-guid"
  - **When**: User attempts DeleteAssetCommand
  - **Then**: 400 Bad Request with "Invalid asset ID format"

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Command → Authorization → Usage check → Delete
- **Code Organization**: AssetService.DeleteAsync() in application layer
- **Testing Approach**: Unit tests for authorization/usage logic, integration tests for cross-area queries

### Dependencies
- **Technical Dependencies**: EF Core for database access
- **Area Dependencies**: Library (ISceneAssetQuery for usage check)
- **External Dependencies**: Database

### Architectural Considerations
- **Area Boundary Respect**: Assets owns deletion, queries Library for usage (read-only)
- **Interface Design**: Clean deletion contract with void return
- **Error Handling**: Clear error messages indicating why deletion failed
- **Data Integrity**: Prevent orphaned references via usage check before deletion
- **Soft Delete Recommendation**: Consider soft delete (IsDeleted flag) instead of hard delete for audit trail

---

This Delete Asset use case provides comprehensive implementation guidance for safe asset removal within the Assets area while maintaining referential integrity and architectural integrity.
