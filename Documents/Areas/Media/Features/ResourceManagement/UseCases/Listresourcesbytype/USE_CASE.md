# List Resources By Type Use Case

**Original Request**: Filter resources by type (Image, Animation, Video)

**List Resources By Type** is a query operation that retrieves Resource entities filtered by ResourceType. This use case operates within the Media area and enables users to discover resources of a specific type for specialized workflows (e.g., selecting only images for asset displays).

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model

---

## Use Case Overview

### Business Context
- **Parent Feature**: Resource Management
- **Owning Area**: Media
- **Business Value**: Enables type-specific resource discovery for specialized workflows
- **User Benefit**: Quickly find resources of specific type (images for assets, videos for animations)

### Scope Definition
- **Primary Actor**: Game Master or Application
- **Scope**: Database query with type filter
- **Level**: User Goal (discovery and selection)

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP GET with query parameter

- **Endpoint**: GET /api/media/resources?type={resourceType}
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP GET request with type query parameter
- **Response Format**: JSON array of Resource entities (Id, Type, Path, Metadata, Tags)

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: MediaStorageService.GetByTypeAsync(ResourceType type)
- **Domain Entities**: Resource (aggregate root), ResourceMetadata (value object), ResourceType (enum)
- **Domain Services**: None (simple filtered read operation)
- **Infrastructure Dependencies**: DbContext, IResourceRepository

### Hexagonal Architecture
- **Primary Port Operation**: IMediaStorage.GetByTypeAsync(ResourceType type)
- **Secondary Port Dependencies**:
  - IResourceRepository.GetByTypeAsync(type) → Query Resource entities by Type property
- **Adapter Requirements**: Database adapter (EF Core)

### DDD Alignment
- **Bounded Context**: Media
- **Ubiquitous Language**: List resources by type, filter by media type, resource type query
- **Business Invariants**: None (read-only operation)
- **Domain Events**: None (no state changes)

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - type: ResourceType enum (required, Undefined | Image | Animation | Video)
- **Input Validation**:
  - type: Must be valid ResourceType enum value
- **Preconditions**:
  - User has read permissions (authorization handled by API layer)
  - Database is accessible

### Business Logic
- **Business Rules**: None (simple filtered query operation)
- **Processing Steps**:
  1. Validate type parameter is valid ResourceType enum value
  2. Query database for Resource entities WHERE Type = type
  3. Return list of matching Resource entities (may be empty if no matches)
- **Domain Coordination**: Resource aggregate roots retrieved as complete entities with metadata
- **Validation Logic**: ResourceType enum validation

### Output Specification
- **Output Data**:
  - Success: List<Resource> with resources of specified type (Id, Type, Path, Metadata, Tags)
  - Empty: Empty list [] if no resources of specified type exist
  - Error: { error: string, code: string }
- **Output Format**: JSON array of Resource entities
- **Postconditions**: None (read-only, no state changes)

### Error Scenarios
- **Invalid Resource Type**: Return 400 Bad Request, "Invalid resource type. Valid values: Undefined, Image, Animation, Video"
- **Database Unavailable**: Return 503 Service Unavailable, "Database is temporarily unavailable"
- **Database Query Failed**: Return 500 Internal Server Error, "Failed to retrieve resources by type"

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```csharp
  public interface IMediaStorage
  {
      Task<List<Resource>> GetByTypeAsync(ResourceType type);
  }

  public enum ResourceType
  {
      Undefined = 0,
      Image = 1,
      Animation = 2,
      Video = 3
  }
  ```
- **Data Access Patterns**: Repository pattern with filtered query (WHERE clause on Type column)
- **External Integration**: None (internal database query)
- **Performance Requirements**:
  - Query response time <100ms for indexed Type column
  - Support result sets up to 5,000 resources per type

### Architecture Compliance
- **Layer Responsibilities**:
  - API: Accept GET request with type parameter, authorize user, call MediaStorageService
  - Application: Validate ResourceType enum, delegate to repository
  - Domain: Define ResourceType enum and Resource.Type property
  - Infrastructure: Execute filtered database query via EF Core
- **Dependency Direction**: API → Application → Domain ← Infrastructure
- **Interface Abstractions**: IResourceRepository
- **KISS Validation**: Simple WHERE clause filter, no complex joins or aggregations

### Testing Strategy
- **Unit Testing**:
  - Test invalid ResourceType validation
  - Test repository call with valid type
  - Test empty list return when no resources of type exist
- **Integration Testing**:
  - Test full query flow with test database
  - Test filtering accuracy (Image returns only images, not videos)
  - Test result set ordering (by upload date, alphabetical path, etc.)
- **Acceptance Criteria**: See section below
- **BDD Scenarios**:
  - Given resources of type Image exist, When GetByTypeAsync(Image) called, Then only Image resources returned
  - Given no resources of type Video exist, When GetByTypeAsync(Video) called, Then empty list returned

---

## Acceptance Criteria

- **AC-01**: Successful retrieval of resources by type
  - **Given**: Database contains 3 Image resources, 2 Video resources, 1 Animation resource
  - **When**: GetByTypeAsync(ResourceType.Image) called
  - **Then**: List of 3 Image resources returned (videos and animations excluded)

- **AC-02**: Empty list when no resources of specified type exist
  - **Given**: Database contains no Video resources
  - **When**: GetByTypeAsync(ResourceType.Video) called
  - **Then**: Empty list [] returned (not null, not error)

- **AC-03**: Invalid resource type validation
  - **Given**: Invalid type value "InvalidType" passed as string
  - **When**: API endpoint called with invalid type parameter
  - **Then**: 400 Bad Request returned "Invalid resource type. Valid values: Undefined, Image, Animation, Video"

- **AC-04**: All resource properties included
  - **Given**: Database contains Image resources with Id, Type, Path, Metadata, Tags
  - **When**: GetByTypeAsync(ResourceType.Image) called
  - **Then**: Returned resources include all properties (no lazy loading issues)

- **AC-05**: Undefined type handling
  - **Given**: Database contains resources with Type=Undefined (uploaded but not classified)
  - **When**: GetByTypeAsync(ResourceType.Undefined) called
  - **Then**: List of Undefined resources returned

- **AC-06**: Performance with indexed Type column
  - **Given**: Database contains 10,000 resources (5,000 Image, 3,000 Video, 2,000 Animation)
  - **When**: GetByTypeAsync(ResourceType.Image) called
  - **Then**: Query completes within 100ms, 5,000 Image resources returned

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: API endpoint → MediaStorageService → Repository → Database
- **Code Organization**:
  - Service: Source/Media/Services/MediaStorageService.cs
  - Repository: Source/Infrastructure/Repositories/ResourceRepository.cs
  - Enum: Source/Domain/Media/ResourceType.cs
- **Testing Approach**: XUnit for unit tests, integration tests with test database

### Dependencies
- **Technical Dependencies**:
  - EF Core DbContext for filtered database query
  - No external services required
- **Area Dependencies**: None (self-contained query operation)
- **External Dependencies**: Database (PostgreSQL via EF Core)

### Architectural Considerations
- **Area Boundary Respect**: Media area owns Resource.Type property, exposes filtered query via IMediaStorage
- **Interface Design**: Simple Task<List<Resource>> return type, empty list for no results
- **Error Handling**: Return empty list for no results, validate enum before query
- **Performance Considerations**:
  - **Indexing**: Create database index on Resource.Type column for fast filtering
  - **Pagination**: Consider adding pagination parameters (skip, take) for large result sets (future enhancement)
  - **Caching**: Consider caching results for 1-2 minutes if frequently accessed
  - **Ordering**: Consider adding ORDER BY clause (e.g., by upload date DESC, path ASC)
- **Extensibility Considerations**:
  - Future: Combine with tag filtering (type AND tag)
  - Future: Add pagination support
  - Future: Add sorting options (by date, name, size)
  - Future: Add metadata filtering (e.g., images >1920px width)

---

This List Resources By Type use case provides comprehensive implementation guidance for type-based resource filtering within the Media area while maintaining query performance and extensibility for future enhancements.
