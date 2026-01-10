# Update Resource Tags Use Case

**Original Request**: Modify resource tags for organization and searchability

**Update Resource Tags** is an update operation that modifies the tags array of a Resource entity. This use case operates within the Media area and enables Game Masters to organize and categorize media resources using custom keywords for improved discoverability.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model

---

## Use Case Overview

### Business Context
- **Parent Feature**: Resource Management
- **Owning Area**: Media
- **Business Value**: Enables flexible resource organization and tag-based discovery
- **User Benefit**: Organize media files with custom tags for easy searching and filtering

### Scope Definition
- **Primary Actor**: Game Master
- **Scope**: Validate resource existence, update tags array, persist changes
- **Level**: User Goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP PATCH or PUT

- **Endpoint**: PATCH /api/media/resources/:id/tags
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP PATCH request with JSON body
- **Response Format**: JSON with updated Resource entity (Id, Type, Path, Metadata, Tags)

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: MediaStorageService.UpdateTagsAsync(Guid resourceId, string[] tags)
- **Domain Entities**: Resource (aggregate root)
- **Domain Services**: None (simple property update)
- **Infrastructure Dependencies**: DbContext, IResourceRepository

### Hexagonal Architecture
- **Primary Port Operation**: IMediaStorage.UpdateTagsAsync(Guid resourceId, string[] tags)
- **Secondary Port Dependencies**:
  - IResourceRepository.FindByIdAsync(resourceId) → Retrieve Resource entity
  - IResourceRepository.UpdateAsync(resource) → Persist updated entity
- **Adapter Requirements**: Database adapter (EF Core)

### DDD Alignment
- **Bounded Context**: Media
- **Ubiquitous Language**: Tags, update tags, resource organization, tag-based search
- **Business Invariants**: None (tags are metadata, no strict business rules)
- **Domain Events**: ResourceTagsUpdated(resourceId, oldTags, newTags, timestamp) [future implementation]

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - resourceId: Guid (required, unique identifier)
  - tags: string[] (required, new tags array, can be empty to remove all tags)
- **Input Validation**:
  - resourceId: Must not be empty Guid (Guid.Empty)
  - tags: Each tag max length 50 characters, alphanumeric with spaces/hyphens, case-insensitive
  - tags: Array max length 20 tags
  - tags: Trim whitespace, remove duplicates (case-insensitive)
- **Preconditions**:
  - User has update permissions (authorization handled by API layer)
  - Resource entity exists in database

### Business Logic
- **Business Rules**:
  - Tags are case-insensitive (store as lowercase for consistency)
  - Duplicate tags are removed automatically (case-insensitive comparison)
  - Empty string tags are removed
  - Tags are trimmed of leading/trailing whitespace
  - Empty tags array is valid (removes all tags)
- **Processing Steps**:
  1. Validate resourceId is not empty Guid
  2. Validate tags array: each tag ≤50 chars, ≤20 tags total
  3. Normalize tags: trim whitespace, convert to lowercase, remove empty strings, remove duplicates
  4. Query database for Resource entity by Id
  5. If Resource not found, return 404 error
  6. Update Resource.Tags property with normalized tags array
  7. Persist updated Resource entity to database
  8. Return updated Resource entity
- **Domain Coordination**: Resource aggregate root property update (Tags array)
- **Validation Logic**:
  - Guid validation
  - Tag length and count validation
  - Tag normalization (trim, lowercase, deduplication)

### Output Specification
- **Output Data**:
  - Success: Resource entity with updated Tags array
  - Error: { error: string, code: string, validationErrors?: object }
- **Output Format**: JSON representation of updated Resource entity
- **Postconditions**:
  - On success: Resource.Tags updated in database, normalized tags stored
  - On error: No changes (Resource.Tags remains unchanged)

### Error Scenarios
- **Empty Resource ID**: Return 400 Bad Request, "Resource ID cannot be empty"
- **Resource Not Found**: Return 404 Not Found, "Resource with ID {resourceId} not found"
- **Tag Too Long**: Return 400 Bad Request, "Tag '{tag}' exceeds maximum length of 50 characters"
- **Too Many Tags**: Return 400 Bad Request, "Maximum of 20 tags allowed, received {count}"
- **Invalid Tag Format**: Return 400 Bad Request, "Tag '{tag}' contains invalid characters. Only alphanumeric, spaces, and hyphens allowed."
- **Database Unavailable**: Return 503 Service Unavailable, "Database is temporarily unavailable"
- **Database Update Failed**: Return 500 Internal Server Error, "Failed to update resource tags"

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```csharp
  public interface IMediaStorage
  {
      Task<Resource> UpdateTagsAsync(Guid resourceId, string[] tags);
  }

  public class UpdateTagsCommand
  {
      public Guid ResourceId { get; init; }
      public string[] Tags { get; init; }
  }
  ```
- **Data Access Patterns**: Repository pattern for entity lookup and update
- **External Integration**: None (internal database update)
- **Performance Requirements**:
  - Update operation <100ms
  - Tag normalization <10ms

### Architecture Compliance
- **Layer Responsibilities**:
  - API: Accept PATCH request with tags JSON array, authorize user, call MediaStorageService
  - Application: Validate and normalize tags, orchestrate entity update
  - Domain: Define Resource.Tags property structure
  - Infrastructure: Execute database update via EF Core
- **Dependency Direction**: API → Application → Domain ← Infrastructure
- **Interface Abstractions**: IResourceRepository
- **KISS Validation**: Simple array replacement, no complex merge logic

### Testing Strategy
- **Unit Testing**:
  - Test tag normalization (trim, lowercase, deduplication)
  - Test tag length validation
  - Test tag count validation
  - Test empty tags array handling (removes all tags)
  - Test resource not found handling
- **Integration Testing**:
  - Test full update flow with test database
  - Test concurrent tag updates to same resource
  - Test tags persisted correctly after update
- **Acceptance Criteria**: See section below
- **BDD Scenarios**:
  - Given existing resource, When tags updated with valid array, Then Resource.Tags updated and persisted
  - Given tags with duplicates, When update requested, Then duplicates removed automatically
  - Given tags with mixed case, When update requested, Then tags normalized to lowercase

---

## Acceptance Criteria

- **AC-01**: Successful tag update for existing resource
  - **Given**: Resource exists with ID "12345678-1234-1234-1234-123456789abc" and current tags ["old", "tags"]
  - **When**: UpdateTagsAsync called with tags ["fantasy", "dungeon", "dark"]
  - **Then**: Resource.Tags updated to ["fantasy", "dungeon", "dark"], updated Resource returned

- **AC-02**: Tag normalization (trim, lowercase, deduplication)
  - **Given**: Resource exists
  - **When**: UpdateTagsAsync called with tags [" Fantasy ", "Dungeon", "fantasy", "DARK "]
  - **Then**: Resource.Tags updated to ["fantasy", "dungeon", "dark"] (duplicates removed, trimmed, lowercased)

- **AC-03**: Empty tags array removes all tags
  - **Given**: Resource exists with tags ["fantasy", "dungeon"]
  - **When**: UpdateTagsAsync called with empty array []
  - **Then**: Resource.Tags updated to [], all tags removed

- **AC-04**: Tag length validation
  - **Given**: Resource exists
  - **When**: UpdateTagsAsync called with tag longer than 50 characters
  - **Then**: 400 Bad Request returned "Tag '{tag}' exceeds maximum length of 50 characters"

- **AC-05**: Tag count validation
  - **Given**: Resource exists
  - **When**: UpdateTagsAsync called with 25 tags
  - **Then**: 400 Bad Request returned "Maximum of 20 tags allowed, received 25"

- **AC-06**: Resource not found handling
  - **Given**: No resource exists with ID "00000000-0000-0000-0000-000000000000"
  - **When**: UpdateTagsAsync called
  - **Then**: 404 Not Found returned "Resource with ID {resourceId} not found"

- **AC-07**: Invalid tag character validation
  - **Given**: Resource exists
  - **When**: UpdateTagsAsync called with tag "fantasy@dungeon!"
  - **Then**: 400 Bad Request returned "Tag 'fantasy@dungeon!' contains invalid characters"

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: API endpoint → MediaStorageService → Repository → Database
- **Code Organization**:
  - Service: Source/Media/Services/MediaStorageService.cs
  - Repository: Source/Infrastructure/Repositories/ResourceRepository.cs
  - Validation: Tag normalization in MediaStorageService
- **Testing Approach**: XUnit for unit tests, integration tests with test database

### Dependencies
- **Technical Dependencies**:
  - EF Core DbContext for database update
  - No external services required
- **Area Dependencies**: None (self-contained update operation)
- **External Dependencies**: Database (PostgreSQL via EF Core)

### Architectural Considerations
- **Area Boundary Respect**: Media area owns Resource.Tags property, no cross-context dependencies
- **Interface Design**: Simple Task<Resource> return type with updated entity
- **Error Handling**: Return 400 for validation errors, 404 for not found, 500 for database errors
- **Performance Considerations**:
  - Indexing: Consider full-text search index on Tags column for fast tag-based queries
  - Normalization: Perform client-side in service layer, not in database
  - Concurrent updates: Use optimistic concurrency (EF Core RowVersion) if needed
- **Extensibility Considerations**:
  - Future: Tag suggestions based on existing tags
  - Future: Tag usage statistics (most popular tags)
  - Future: Tag hierarchies or categories

---

This Update Resource Tags use case provides comprehensive implementation guidance for flexible resource organization within the Media area while maintaining data quality through normalization and validation.
