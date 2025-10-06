# Get Resource Metadata Use Case

**Original Request**: Retrieve resource metadata by ID for display and validation

**Get Resource Metadata** is a read operation that retrieves Resource entity metadata without fetching the actual file. This use case operates within the Media area and enables applications to access resource properties for display, validation, and decision-making without downloading large files.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model

---

## Use Case Overview

### Business Context
- **Parent Feature**: Resource Management
- **Owning Area**: Media
- **Business Value**: Enables efficient metadata access without downloading large media files
- **User Benefit**: Fast retrieval of resource information for UI display and validation

### Scope Definition
- **Primary Actor**: Application (Assets, Library, or any consumer)
- **Scope**: Single database query to retrieve Resource entity by ID
- **Level**: Subfunction (supporting other use cases)

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP/GraphQL

- **Endpoint**: GET /api/media/resources/:id
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP GET request
- **Response Format**: JSON with Resource entity (Id, Type, Path, Metadata, Tags)

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: MediaStorageService.GetByIdAsync(Guid resourceId)
- **Domain Entities**: Resource (aggregate root), ResourceMetadata (value object)
- **Domain Services**: None (simple read operation)
- **Infrastructure Dependencies**: DbContext, IResourceRepository

### Hexagonal Architecture
- **Primary Port Operation**: IMediaStorage.GetByIdAsync(Guid resourceId)
- **Secondary Port Dependencies**:
  - IResourceRepository.FindByIdAsync(resourceId) → Query Resource entity from database
- **Adapter Requirements**: Database adapter (EF Core)

### DDD Alignment
- **Bounded Context**: Media
- **Ubiquitous Language**: Resource metadata, retrieve, query by ID
- **Business Invariants**: None (read-only operation)
- **Domain Events**: None (no state changes)

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - resourceId: Guid (required, unique identifier)
- **Input Validation**:
  - resourceId: Must not be empty Guid (Guid.Empty)
- **Preconditions**:
  - User has read permissions (authorization handled by API layer)
  - Database is accessible

### Business Logic
- **Business Rules**: None (simple read operation)
- **Processing Steps**:
  1. Validate resourceId is not empty Guid
  2. Query database for Resource entity by Id
  3. Return Resource entity if found, null if not found
- **Domain Coordination**: Resource aggregate root retrieved as complete entity with metadata
- **Validation Logic**: Guid format validation only

### Output Specification
- **Output Data**:
  - Success: Resource entity with Id, Type, Path, Metadata (Width, Height, FileSize, ContentType, Encoding), Tags
  - Not Found: null (or 404 HTTP status)
  - Error: { error: string, code: string }
- **Output Format**: JSON representation of Resource entity
- **Postconditions**: None (read-only, no state changes)

### Error Scenarios
- **Empty Resource ID**: Return 400 Bad Request, "Resource ID cannot be empty"
- **Resource Not Found**: Return 404 Not Found, "Resource with ID {resourceId} not found"
- **Database Unavailable**: Return 503 Service Unavailable, "Database is temporarily unavailable"
- **Database Query Failed**: Return 500 Internal Server Error, "Failed to retrieve resource metadata"

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```csharp
  public interface IMediaStorage
  {
      Task<Resource?> GetByIdAsync(Guid resourceId);
  }
  ```
- **Data Access Patterns**: Repository pattern with single entity lookup by primary key
- **External Integration**: None (internal database query)
- **Performance Requirements**:
  - Query response time <50ms (indexed primary key lookup)
  - No N+1 query issues (eager load ResourceMetadata value object)

### Architecture Compliance
- **Layer Responsibilities**:
  - API: Accept GET request with resourceId, authorize user, call MediaStorageService
  - Application: Validate Guid, delegate to repository
  - Domain: Define Resource aggregate structure
  - Infrastructure: Execute database query via EF Core
- **Dependency Direction**: API → Application → Domain ← Infrastructure
- **Interface Abstractions**: IResourceRepository
- **KISS Validation**: Simple database lookup by primary key, no complex logic

### Testing Strategy
- **Unit Testing**:
  - Test empty Guid validation
  - Test repository call with valid Guid
  - Test null return when resource not found
- **Integration Testing**:
  - Test full query flow with test database
  - Test Resource entity deserialization with metadata
  - Test not found scenario with non-existent ID
- **Acceptance Criteria**: See section below
- **BDD Scenarios**:
  - Given existing resource ID, When GetByIdAsync called, Then Resource entity returned
  - Given non-existent resource ID, When GetByIdAsync called, Then null returned

---

## Acceptance Criteria

- **AC-01**: Successful metadata retrieval for existing resource
  - **Given**: Resource exists with ID "12345678-1234-1234-1234-123456789abc"
  - **When**: GetByIdAsync called with resource ID
  - **Then**: Resource entity returned with all properties (Id, Type, Path, Metadata, Tags)

- **AC-02**: Not found handling for non-existent resource
  - **Given**: No resource exists with ID "00000000-0000-0000-0000-000000000000"
  - **When**: GetByIdAsync called with non-existent ID
  - **Then**: null returned (or 404 HTTP status from API)

- **AC-03**: Empty Guid validation
  - **Given**: resourceId parameter is Guid.Empty
  - **When**: GetByIdAsync called
  - **Then**: Validation error returned "Resource ID cannot be empty"

- **AC-04**: Metadata included in response
  - **Given**: Resource exists with Width=1920, Height=1080, FileSize=2MB
  - **When**: GetByIdAsync called
  - **Then**: Returned Resource includes ResourceMetadata with all properties populated

- **AC-05**: Tags included in response
  - **Given**: Resource exists with tags ["fantasy", "dungeon"]
  - **When**: GetByIdAsync called
  - **Then**: Returned Resource includes Tags array ["fantasy", "dungeon"]

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: API endpoint → MediaStorageService → Repository → Database
- **Code Organization**:
  - Service: Source/Media/Services/MediaStorageService.cs
  - Repository: Source/Infrastructure/Repositories/ResourceRepository.cs
  - Interface: Source/Domain/Media/IMediaStorage.cs
- **Testing Approach**: XUnit for unit tests, integration tests with test database

### Dependencies
- **Technical Dependencies**:
  - EF Core DbContext for database access
  - No external services required (database only)
- **Area Dependencies**: None (self-contained read operation)
- **External Dependencies**: Database (SQL Server via EF Core)

### Architectural Considerations
- **Area Boundary Respect**: Media area owns Resource entity, exposes read-only access via IMediaStorage
- **Interface Design**: Simple Task<Resource?> return type, null for not found
- **Error Handling**: Return null for not found, throw exceptions for infrastructure errors
- **Performance Considerations**:
  - Database index on Resource.Id (primary key, automatic)
  - Eager load ResourceMetadata to avoid N+1 queries
  - Consider caching for frequently accessed resources

---

This Get Resource Metadata use case provides comprehensive implementation guidance for efficient metadata retrieval within the Media area while maintaining performance and simplicity.
