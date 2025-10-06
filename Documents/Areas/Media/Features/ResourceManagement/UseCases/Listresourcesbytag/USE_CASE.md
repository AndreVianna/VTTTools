# List Resources By Tag Use Case

**Original Request**: Query resources by tag for organization and discovery

**List Resources By Tag** is a query operation that retrieves Resource entities containing a specific tag. This use case operates within the Media area and enables users to discover resources tagged with keywords for organization, themed searches, and content curation.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model

---

## Use Case Overview

### Business Context
- **Parent Feature**: Resource Management
- **Owning Area**: Media
- **Business Value**: Enables tag-based resource discovery for organization and themed workflows
- **User Benefit**: Quickly find resources tagged with specific keywords (e.g., "fantasy", "dungeon", "dark")

### Scope Definition
- **Primary Actor**: Game Master or Application
- **Scope**: Database query with tag filter (array contains check)
- **Level**: User Goal (discovery and organization)

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP GET with query parameter

- **Endpoint**: GET /api/media/resources?tag={tagName}
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP GET request with tag query parameter
- **Response Format**: JSON array of Resource entities (Id, Type, Path, Metadata, Tags)

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: MediaStorageService.GetByTagAsync(string tag)
- **Domain Entities**: Resource (aggregate root), ResourceMetadata (value object)
- **Domain Services**: None (simple filtered read operation)
- **Infrastructure Dependencies**: DbContext, IResourceRepository

### Hexagonal Architecture
- **Primary Port Operation**: IMediaStorage.GetByTagAsync(string tag)
- **Secondary Port Dependencies**:
  - IResourceRepository.GetByTagAsync(tag) → Query Resource entities WHERE Tags contains tag (case-insensitive)
- **Adapter Requirements**: Database adapter (EF Core with JSON array query or array contains support)

### DDD Alignment
- **Bounded Context**: Media
- **Ubiquitous Language**: List resources by tag, tag-based search, filter by tag, tag query
- **Business Invariants**: None (read-only operation)
- **Domain Events**: None (no state changes)

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - tag: string (required, keyword to search for)
- **Input Validation**:
  - tag: Non-empty string, max length 50 characters
  - tag: Case-insensitive matching (normalize to lowercase before query)
- **Preconditions**:
  - User has read permissions (authorization handled by API layer)
  - Database is accessible

### Business Logic
- **Business Rules**:
  - Tag search is case-insensitive (normalize input to lowercase before query)
  - Partial matches are not supported (exact tag match only)
  - Tag is trimmed of leading/trailing whitespace before search
- **Processing Steps**:
  1. Validate tag parameter is non-empty and ≤50 characters
  2. Normalize tag: trim whitespace, convert to lowercase
  3. Query database for Resource entities WHERE Tags array contains normalized tag
  4. Return list of matching Resource entities (may be empty if no matches)
- **Domain Coordination**: Resource aggregate roots retrieved as complete entities with metadata
- **Validation Logic**: Tag length validation, normalization (trim, lowercase)

### Output Specification
- **Output Data**:
  - Success: List<Resource> with resources containing specified tag (Id, Type, Path, Metadata, Tags)
  - Empty: Empty list [] if no resources with specified tag exist
  - Error: { error: string, code: string }
- **Output Format**: JSON array of Resource entities
- **Postconditions**: None (read-only, no state changes)

### Error Scenarios
- **Empty Tag**: Return 400 Bad Request, "Tag parameter cannot be empty"
- **Tag Too Long**: Return 400 Bad Request, "Tag exceeds maximum length of 50 characters"
- **Database Unavailable**: Return 503 Service Unavailable, "Database is temporarily unavailable"
- **Database Query Failed**: Return 500 Internal Server Error, "Failed to retrieve resources by tag"

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```csharp
  public interface IMediaStorage
  {
      Task<List<Resource>> GetByTagAsync(string tag);
  }
  ```
- **Data Access Patterns**: Repository pattern with array contains filter (EF Core: `.Where(r => r.Tags.Contains(tag))`)
- **External Integration**: None (internal database query)
- **Performance Requirements**:
  - Query response time <100ms for indexed Tags column or JSON search
  - Support result sets up to 1,000 resources per tag

### Architecture Compliance
- **Layer Responsibilities**:
  - API: Accept GET request with tag parameter, authorize user, call MediaStorageService
  - Application: Validate and normalize tag, delegate to repository
  - Domain: Define Resource.Tags property as string array
  - Infrastructure: Execute filtered database query via EF Core with array contains
- **Dependency Direction**: API → Application → Domain ← Infrastructure
- **Interface Abstractions**: IResourceRepository
- **KISS Validation**: Simple array contains query, no complex full-text search or ranking

### Testing Strategy
- **Unit Testing**:
  - Test empty tag validation
  - Test tag length validation
  - Test tag normalization (trim, lowercase)
  - Test repository call with normalized tag
- **Integration Testing**:
  - Test full query flow with test database
  - Test case-insensitive matching (search "Fantasy" finds "fantasy")
  - Test exact match requirement (search "fan" does NOT find "fantasy")
  - Test multiple resources with same tag returned
  - Test empty list when no resources with tag exist
- **Acceptance Criteria**: See section below
- **BDD Scenarios**:
  - Given resources tagged with "fantasy", When GetByTagAsync("fantasy") called, Then all resources with "fantasy" tag returned
  - Given resources tagged with "fantasy" (lowercase), When GetByTagAsync("FANTASY") called (uppercase), Then resources returned (case-insensitive)
  - Given no resources tagged with "scifi", When GetByTagAsync("scifi") called, Then empty list returned

---

## Acceptance Criteria

- **AC-01**: Successful retrieval of resources by tag
  - **Given**: Database contains 3 resources tagged with "fantasy", 2 resources tagged with "scifi"
  - **When**: GetByTagAsync("fantasy") called
  - **Then**: List of 3 resources with "fantasy" tag returned (scifi resources excluded)

- **AC-02**: Case-insensitive tag matching
  - **Given**: Database contains resources tagged with "fantasy" (lowercase)
  - **When**: GetByTagAsync("FANTASY") called (uppercase)
  - **Then**: Resources with "fantasy" tag returned (case-insensitive match successful)

- **AC-03**: Empty list when no resources with specified tag exist
  - **Given**: Database contains no resources tagged with "scifi"
  - **When**: GetByTagAsync("scifi") called
  - **Then**: Empty list [] returned (not null, not error)

- **AC-04**: Tag normalization (trim whitespace)
  - **Given**: Database contains resources tagged with "fantasy" (no leading/trailing spaces)
  - **When**: GetByTagAsync(" fantasy ") called (with spaces)
  - **Then**: Resources with "fantasy" tag returned (spaces trimmed before query)

- **AC-05**: Exact tag match requirement (no partial matches)
  - **Given**: Database contains resources tagged with "fantasy" (full word)
  - **When**: GetByTagAsync("fan") called (partial word)
  - **Then**: Empty list [] returned (partial matches not supported)

- **AC-06**: Multiple tags on resource
  - **Given**: Resource has tags ["fantasy", "dungeon", "dark"]
  - **When**: GetByTagAsync("dungeon") called
  - **Then**: Resource returned (any tag match qualifies resource)

- **AC-07**: Empty tag validation
  - **Given**: Tag parameter is empty string ""
  - **When**: GetByTagAsync("") called
  - **Then**: 400 Bad Request returned "Tag parameter cannot be empty"

- **AC-08**: Tag length validation
  - **Given**: Tag parameter exceeds 50 characters
  - **When**: GetByTagAsync(longTag) called
  - **Then**: 400 Bad Request returned "Tag exceeds maximum length of 50 characters"

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: API endpoint → MediaStorageService → Repository → Database
- **Code Organization**:
  - Service: Source/Media/Services/MediaStorageService.cs
  - Repository: Source/Infrastructure/Repositories/ResourceRepository.cs
  - Query: EF Core LINQ `.Where(r => r.Tags.Contains(normalizedTag))`
- **Testing Approach**: XUnit for unit tests, integration tests with test database

### Dependencies
- **Technical Dependencies**:
  - EF Core DbContext for array contains query
  - SQL Server JSON support or array column type
  - No external services required
- **Area Dependencies**: None (self-contained query operation)
- **External Dependencies**: Database (SQL Server via EF Core)

### Architectural Considerations
- **Area Boundary Respect**: Media area owns Resource.Tags property, exposes tag-based query via IMediaStorage
- **Interface Design**: Simple Task<List<Resource>> return type, empty list for no results
- **Error Handling**: Return empty list for no results, validate tag before query
- **Performance Considerations**:
  - **Indexing**: Consider full-text index or GIN index on Tags column for fast array contains queries
  - **Query Optimization**: SQL Server: Use `OPENJSON` or array contains for JSON columns
  - **Pagination**: Consider adding pagination parameters (skip, take) for large result sets (future enhancement)
  - **Caching**: Consider caching popular tags (e.g., "fantasy", "scifi") for 2-5 minutes
  - **Ordering**: Consider adding ORDER BY clause (e.g., by upload date DESC, path ASC)
- **Extensibility Considerations**:
  - Future: Multi-tag search (AND/OR operations): `tags=fantasy&tags=dungeon` (resources with both tags)
  - Future: Tag suggestions/autocomplete based on existing tags
  - Future: Tag usage statistics (most popular tags)
  - Future: Full-text search across tags (partial matches, fuzzy search)
  - Future: Combine with type filtering: `?type=Image&tag=fantasy`

### Database Schema Considerations
- **Storage Format**: Store Tags as JSON array or SQL array column
  - SQL Server: `nvarchar(max)` with JSON functions or SQL Server 2016+ JSON support
  - PostgreSQL: `text[]` array column type with GIN index for fast contains queries
- **Indexing Strategy**:
  - SQL Server: Consider computed column with full-text index on Tags JSON
  - PostgreSQL: Create GIN index on Tags array column: `CREATE INDEX idx_resource_tags ON resource USING GIN (tags);`

---

This List Resources By Tag use case provides comprehensive implementation guidance for tag-based resource discovery within the Media area while maintaining query performance and extensibility for future enhanced search capabilities.
