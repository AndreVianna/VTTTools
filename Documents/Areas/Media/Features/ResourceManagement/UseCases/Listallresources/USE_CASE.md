# List All Resources Use Case

**Original Request**: Retrieve all resources for administrative operations

**List All Resources** is a query operation that retrieves all Resource entities from the database. This use case operates within the Media area and enables administrators to view and manage all media resources in the system for bulk operations, auditing, and maintenance.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model

---

## Use Case Overview

### Business Context
- **Parent Feature**: Resource Management
- **Owning Area**: Media
- **Business Value**: Enables complete resource inventory and administrative operations
- **User Benefit**: View all media resources for auditing, cleanup, and bulk management

### Scope Definition
- **Primary Actor**: Administrator
- **Scope**: Database query to retrieve all Resource entities
- **Level**: User Goal (administrative operation)

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP GET

- **Endpoint**: GET /api/media/resources
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP GET request
- **Response Format**: JSON array of Resource entities (Id, Type, Path, Metadata, Tags)

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: MediaStorageService.GetAllAsync()
- **Domain Entities**: Resource (aggregate root), ResourceMetadata (value object)
- **Domain Services**: None (simple read operation)
- **Infrastructure Dependencies**: DbContext, IResourceRepository

### Hexagonal Architecture
- **Primary Port Operation**: IMediaStorage.GetAllAsync()
- **Secondary Port Dependencies**:
  - IResourceRepository.GetAllAsync() → Query all Resource entities from database
- **Adapter Requirements**: Database adapter (EF Core)

### DDD Alignment
- **Bounded Context**: Media
- **Ubiquitous Language**: List resources, retrieve all, resource inventory
- **Business Invariants**: None (read-only operation)
- **Domain Events**: None (no state changes)

---

## Functional Specification

### Input Requirements
- **Input Data**: None (no parameters, retrieves all resources)
- **Input Validation**: None
- **Preconditions**:
  - User has administrative permissions (authorization handled by API layer)
  - Database is accessible

### Business Logic
- **Business Rules**: None (simple query operation)
- **Processing Steps**:
  1. Query database for all Resource entities
  2. Return list of Resource entities (may be empty if no resources exist)
- **Domain Coordination**: Resource aggregate roots retrieved as complete entities with metadata
- **Validation Logic**: None (no input parameters)

### Output Specification
- **Output Data**:
  - Success: List<Resource> with all resources (Id, Type, Path, Metadata, Tags)
  - Empty: Empty list [] if no resources exist
  - Error: { error: string, code: string }
- **Output Format**: JSON array of Resource entities
- **Postconditions**: None (read-only, no state changes)

### Error Scenarios
- **Database Unavailable**: Return 503 Service Unavailable, "Database is temporarily unavailable"
- **Database Query Failed**: Return 500 Internal Server Error, "Failed to retrieve resources"
- **Timeout (Large Result Set)**: Return 504 Gateway Timeout, "Query timeout. Consider using pagination or filtering."

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```csharp
  public interface IMediaStorage
  {
      Task<List<Resource>> GetAllAsync();
  }
  ```
- **Data Access Patterns**: Repository pattern with full table query
- **External Integration**: None (internal database query)
- **Performance Requirements**:
  - Query response time <500ms for up to 10,000 resources
  - Consider pagination for large result sets (future enhancement)
  - Lazy loading or eager loading for ResourceMetadata value object

### Architecture Compliance
- **Layer Responsibilities**:
  - API: Accept GET request, authorize admin user, call MediaStorageService
  - Application: Delegate to repository
  - Domain: Define Resource aggregate structure
  - Infrastructure: Execute database query via EF Core
- **Dependency Direction**: API → Application → Domain ← Infrastructure
- **Interface Abstractions**: IResourceRepository
- **KISS Validation**: Simple SELECT * query, no complex filtering or joins

### Testing Strategy
- **Unit Testing**:
  - Test repository call
  - Test empty list return when no resources exist
  - Test non-empty list return with multiple resources
- **Integration Testing**:
  - Test full query flow with test database
  - Test large result set performance (1000+ resources)
  - Test Resource entity deserialization with metadata
- **Acceptance Criteria**: See section below
- **BDD Scenarios**:
  - Given resources exist in database, When GetAllAsync called, Then all resources returned
  - Given no resources exist, When GetAllAsync called, Then empty list returned

---

## Acceptance Criteria

- **AC-01**: Successful retrieval of all resources
  - **Given**: Database contains 5 resources with various types and tags
  - **When**: GetAllAsync called
  - **Then**: List of 5 Resource entities returned with all properties populated

- **AC-02**: Empty list when no resources exist
  - **Given**: Database contains zero resources
  - **When**: GetAllAsync called
  - **Then**: Empty list [] returned (not null, not error)

- **AC-03**: All resource properties included
  - **Given**: Database contains resources with Id, Type, Path, Metadata, Tags
  - **When**: GetAllAsync called
  - **Then**: Returned resources include all properties (no lazy loading issues)

- **AC-04**: Performance with large result set
  - **Given**: Database contains 5,000 resources
  - **When**: GetAllAsync called
  - **Then**: Query completes within 500ms, all resources returned

- **AC-05**: Authorization enforcement
  - **Given**: User without admin permissions
  - **When**: GET /api/media/resources request made
  - **Then**: 403 Forbidden returned (enforced by API layer, not service)

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: API endpoint → MediaStorageService → Repository → Database
- **Code Organization**:
  - Service: Source/Media/Services/MediaStorageService.cs
  - Repository: Source/Infrastructure/Repositories/ResourceRepository.cs
  - API: Source/API/Controllers/MediaController.cs (admin-only authorization)
- **Testing Approach**: XUnit for unit tests, integration tests with test database

### Dependencies
- **Technical Dependencies**:
  - EF Core DbContext for database query
  - No external services required
- **Area Dependencies**: None (self-contained query operation)
- **External Dependencies**: Database (PostgreSQL via EF Core)

### Architectural Considerations
- **Area Boundary Respect**: Media area owns Resource entities, exposes read-only list via IMediaStorage
- **Interface Design**: Simple Task<List<Resource>> return type, empty list for no results
- **Error Handling**: Return empty list for no results, throw exceptions for infrastructure errors
- **Performance Considerations**:
  - **Pagination**: Consider adding pagination parameters (skip, take) for large result sets (future enhancement)
  - **Filtering**: Consider adding optional filters (type, tag) to reduce result set size
  - **Projection**: Consider adding "summary" endpoint that returns minimal data (Id, Type, Path only)
  - **Indexing**: No additional indexes needed (primary key already indexed)
  - **Caching**: Consider caching full list for 5-10 minutes if frequently accessed
- **Security Considerations**:
  - Restrict to admin users only (contains all resources, not user-specific)
  - Consider exposing user-specific list endpoint for non-admin users (future)
  - Do not expose internal blob storage paths in public APIs (only admin API)

---

This List All Resources use case provides comprehensive implementation guidance for administrative resource listing within the Media area while maintaining performance and security considerations for large datasets.
