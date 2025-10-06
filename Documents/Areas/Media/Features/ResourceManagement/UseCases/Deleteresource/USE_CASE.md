# Delete Resource Use Case

**Original Request**: Remove resource entity and blob storage file with reference checking

**Delete Resource** is a deletion operation that safely removes a Resource entity and its associated blob storage file. This use case operates within the Media area and enables Game Masters to delete unused media resources while preventing deletion of resources still in use by Assets or Library contexts.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model

---

## Use Case Overview

### Business Context
- **Parent Feature**: Resource Management
- **Owning Area**: Media
- **Business Value**: Safe resource cleanup with referential integrity protection
- **User Benefit**: Delete unused media files to free storage space and maintain organization

### Scope Definition
- **Primary Actor**: Game Master (administrative operation)
- **Scope**: Reference check, entity deletion, and blob storage file removal
- **Level**: User Goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP DELETE

- **Endpoint**: DELETE /api/media/resources/:id
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP DELETE request
- **Response Format**: 204 No Content on success, error JSON on failure

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: MediaStorageService.DeleteAsync(Guid resourceId)
- **Domain Entities**: Resource (aggregate root)
- **Domain Services**: IReferenceCheckService (check usage in Assets and Library)
- **Infrastructure Dependencies**: DbContext, IBlobStorageClient, IAssetRepository, ISceneRepository

### Hexagonal Architecture
- **Primary Port Operation**: IMediaStorage.DeleteAsync(Guid resourceId)
- **Secondary Port Dependencies**:
  - IResourceRepository.FindByIdAsync(resourceId) → Retrieve Resource entity
  - IReferenceCheckService.IsResourceInUseAsync(resourceId) → Check Asset/Scene references
  - IResourceRepository.DeleteAsync(resource) → Remove entity from database
  - IBlobStorageClient.DeleteAsync(path) → Remove file from blob storage
- **Adapter Requirements**: Database adapter (EF Core), blob storage adapter, cross-context reference checking

### DDD Alignment
- **Bounded Context**: Media
- **Ubiquitous Language**: Delete resource, reference check, referential integrity, safe deletion
- **Business Invariants**:
  - Resource cannot be deleted if referenced by any Asset or Scene (AGG-03)
  - Resource entity and blob storage file must be synchronized (BR-05)
- **Domain Events**: ResourceDeleted(resourceId, path, timestamp) [future implementation]

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - resourceId: Guid (required, unique identifier)
- **Input Validation**:
  - resourceId: Must not be empty Guid (Guid.Empty)
- **Preconditions**:
  - User has delete permissions (authorization handled by API layer)
  - Resource entity exists in database
  - Resource is not referenced by any Asset or Scene

### Business Logic
- **Business Rules**:
  - BR-04: Resource cannot be deleted if in use (check Asset.Display.ResourceId and Scene/Adventure/Epic.Background references)
  - BR-05: Resource entity and blob storage file must be synchronized (delete entity first, then file; rollback entity if blob delete fails)
  - AGG-03: Resource cannot be deleted if referenced by any Asset or Scene (aggregate invariant)
- **Processing Steps**:
  1. Validate resourceId is not empty Guid
  2. Query database for Resource entity by Id
  3. If Resource not found, return 404 error
  4. Check if resource is referenced by any Asset (Asset.Display.ResourceId = resourceId)
  5. Check if resource is referenced by any Scene/Adventure/Epic (Background property = resourceId)
  6. If any references found, return 409 Conflict error with reference details
  7. Delete Resource entity from database
  8. Delete blob storage file at Resource.Path
  9. If blob delete fails, log error but do not rollback entity deletion (orphaned blob cleanup)
  10. Return success (204 No Content)
- **Domain Coordination**:
  - Resource aggregate root deletion
  - Cross-context reference checking via IReferenceCheckService
- **Validation Logic**:
  - Guid validation
  - Resource existence check
  - Referential integrity check across Assets and Library bounded contexts

### Output Specification
- **Output Data**:
  - Success: 204 No Content (empty response)
  - Error: { error: string, code: string, references?: object[] }
- **Output Format**: Empty response on success, JSON error on failure
- **Postconditions**:
  - On success: Resource entity deleted, blob storage file removed
  - On error: No changes (entity and file remain intact)
  - On blob delete failure: Entity deleted, orphaned blob logged for cleanup

### Error Scenarios
- **Empty Resource ID**: Return 400 Bad Request, "Resource ID cannot be empty"
- **Resource Not Found**: Return 404 Not Found, "Resource with ID {resourceId} not found"
- **Resource In Use By Assets**: Return 409 Conflict, "Resource cannot be deleted. Referenced by {count} asset(s): {assetIds}"
- **Resource In Use By Scenes**: Return 409 Conflict, "Resource cannot be deleted. Used as background in {count} scene(s): {sceneIds}"
- **Resource In Use By Multiple Contexts**: Return 409 Conflict, "Resource cannot be deleted. Referenced by {assetCount} asset(s) and {sceneCount} scene(s)"
- **Database Unavailable**: Return 503 Service Unavailable, "Database is temporarily unavailable"
- **Blob Storage Delete Failed**: Log error, return 200 OK with warning, "Resource metadata deleted but file removal failed. Orphaned blob logged for cleanup."
- **Database Delete Failed**: Return 500 Internal Server Error, "Failed to delete resource metadata"

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```csharp
  public interface IMediaStorage
  {
      Task DeleteAsync(Guid resourceId);
  }

  public interface IReferenceCheckService
  {
      Task<bool> IsResourceInUseAsync(Guid resourceId);
      Task<ResourceReferences> GetResourceReferencesAsync(Guid resourceId);
  }

  public class ResourceReferences
  {
      public List<Guid> AssetIds { get; init; }
      public List<Guid> SceneIds { get; init; }
      public int TotalReferences => AssetIds.Count + SceneIds.Count;
  }
  ```
- **Data Access Patterns**: Repository pattern for deletion, cross-context queries for reference checking
- **External Integration**: Azure Blob Storage SDK for file deletion, cross-context repository access
- **Performance Requirements**:
  - Reference check query <100ms (indexed foreign key lookups)
  - Total operation time <500ms for delete

### Architecture Compliance
- **Layer Responsibilities**:
  - API: Accept DELETE request, authorize user, call MediaStorageService
  - Application: Orchestrate reference check, entity deletion, blob deletion
  - Domain: Define deletion rules and invariants
  - Infrastructure: Execute database delete, blob storage delete, cross-context queries
- **Dependency Direction**: API → Application → Domain ← Infrastructure
- **Interface Abstractions**: IReferenceCheckService for cross-context queries, IBlobStorageClient for storage
- **KISS Validation**: Sequential reference check → entity delete → blob delete, no complex transactions

### Testing Strategy
- **Unit Testing**:
  - Test empty Guid validation
  - Test resource not found handling
  - Test reference check logic (mocked references)
  - Test successful deletion flow
- **Integration Testing**:
  - Test full deletion with test database and blob storage
  - Test deletion blocked when resource referenced by Asset
  - Test deletion blocked when resource referenced by Scene
  - Test orphaned blob handling when blob delete fails
  - Test concurrent deletion attempts
- **Acceptance Criteria**: See section below
- **BDD Scenarios**:
  - Given unreferenced resource, When DeleteAsync called, Then entity and blob deleted
  - Given resource referenced by Asset, When DeleteAsync called, Then 409 error returned
  - Given resource referenced by Scene, When DeleteAsync called, Then 409 error returned

---

## Acceptance Criteria

- **AC-01**: Successful deletion of unreferenced resource
  - **Given**: Resource exists with ID "12345678-1234-1234-1234-123456789abc", not referenced by any Asset or Scene
  - **When**: DeleteAsync called with resource ID
  - **Then**: Resource entity deleted from database, blob storage file removed, 204 No Content returned

- **AC-02**: Deletion blocked when resource referenced by Asset
  - **Given**: Resource referenced by Asset with Display.ResourceId matching resource ID
  - **When**: DeleteAsync called
  - **Then**: 409 Conflict returned "Resource cannot be deleted. Referenced by 1 asset(s): {assetId}"

- **AC-03**: Deletion blocked when resource referenced by Scene
  - **Given**: Resource referenced by Scene with Background property matching resource ID
  - **When**: DeleteAsync called
  - **Then**: 409 Conflict returned "Resource cannot be deleted. Used as background in 1 scene(s): {sceneId}"

- **AC-04**: Deletion blocked with multiple references
  - **Given**: Resource referenced by 3 Assets and 2 Scenes
  - **When**: DeleteAsync called
  - **Then**: 409 Conflict returned with count and IDs "Referenced by 3 asset(s) and 2 scene(s)"

- **AC-05**: Not found handling for non-existent resource
  - **Given**: No resource exists with ID "00000000-0000-0000-0000-000000000000"
  - **When**: DeleteAsync called
  - **Then**: 404 Not Found returned "Resource with ID {resourceId} not found"

- **AC-06**: Orphaned blob handling when blob delete fails
  - **Given**: Resource entity exists, reference check passes, blob storage delete fails
  - **When**: DeleteAsync called
  - **Then**: Entity deleted, error logged, 200 OK returned with warning about orphaned blob

- **AC-07**: Rollback when entity delete fails
  - **Given**: Resource entity exists, reference check passes, entity delete fails
  - **When**: DeleteAsync called
  - **Then**: No changes made, 500 error returned, blob storage file remains intact

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: API endpoint → MediaStorageService → ReferenceCheckService + Repository + BlobStorageClient
- **Code Organization**:
  - Service: Source/Media/Services/MediaStorageService.cs
  - Reference Checker: Source/Media/Services/ReferenceCheckService.cs
  - Repositories: Source/Infrastructure/Repositories/ResourceRepository.cs, AssetRepository.cs, SceneRepository.cs
- **Testing Approach**: XUnit for unit tests, integration tests with test database and Azurite

### Dependencies
- **Technical Dependencies**:
  - EF Core DbContext for Resource, Asset, Scene entities
  - Azure.Storage.Blobs for blob deletion
  - Cross-context repository access (AssetRepository, SceneRepository)
- **Area Dependencies**: Query-only access to Assets and Library contexts for reference checking
- **External Dependencies**:
  - Azure Blob Storage account
  - Database with Asset and Scene tables for reference checks

### Architectural Considerations
- **Area Boundary Respect**: Media area coordinates deletion, reads from Assets/Library for reference checks (no modifications)
- **Interface Design**: IReferenceCheckService abstracts cross-context queries, maintains loose coupling
- **Error Handling**:
  - Return 409 Conflict with detailed reference information (helpful for users)
  - Log orphaned blob errors for background cleanup jobs
  - Prioritize entity deletion over blob deletion (orphaned blobs less critical than orphaned entities)
- **Security Considerations**:
  - Authorize user has delete permissions before any operations
  - Do not expose internal reference details in errors (use counts, not sensitive data)
  - Rate limit delete operations to prevent abuse
- **Performance Considerations**:
  - Index foreign keys (Asset.Display.ResourceId, Scene.Background) for fast reference checks
  - Consider batch deletion API for multiple resources
  - Implement background job for orphaned blob cleanup

---

This Delete Resource use case provides comprehensive implementation guidance for safe resource deletion with referential integrity protection within the Media area while maintaining data consistency and preventing accidental deletion of in-use resources.
