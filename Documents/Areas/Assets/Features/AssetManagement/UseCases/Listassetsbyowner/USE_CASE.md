# List Assets By Owner Use Case

**Original Request**: Query assets owned by specific user

**List Assets By Owner** is a filtered query operation that retrieves all assets belonging to a specific user. This use case operates within the Assets area and enables users to view their personal asset library.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model

---

## Use Case Overview

### Business Context
- **Parent Feature**: Asset Management
- **Owning Area**: Assets
- **Business Value**: Personal asset library management enabling efficient content organization
- **User Benefit**: View all assets owned by user for editing and organization

### Scope Definition
- **Primary Actor**: Authenticated User
- **Scope**: Query assets filtered by OwnerId
- **Level**: User Goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP/GraphQL

- **Endpoint**: GET /api/assets?ownerId=:userId
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/GraphQL
- **Response Format**: JSON array of Asset objects

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: AssetService.GetByOwnerAsync(Guid ownerId)
- **Domain Entities**: Asset (aggregate root)
- **Domain Services**: IAssetStorage.GetByOwnerAsync()
- **Infrastructure Dependencies**: DbContext (Asset query with OwnerId filter)

### Hexagonal Architecture
- **Primary Port Operation**: IAssetStorage.GetByOwnerAsync(Guid ownerId)
- **Secondary Port Dependencies**:
  - DbContext.Assets.Where(a => a.OwnerId == ownerId).ToListAsync()
- **Adapter Requirements**: HTTP adapter, database adapter (indexed query on OwnerId)

### DDD Alignment
- **Bounded Context**: Assets
- **Ubiquitous Language**: My assets, owned assets, user library
- **Business Invariants**: None (read-only operation)
- **Domain Events**: None (read-only operation)

---

## Functional Specification

### Input Requirements
- **Input Data**: Owner ID (Guid, required, references User.Id)
- **Input Validation**: OwnerId must be valid Guid format
- **Preconditions**:
  - User is authenticated
  - User can query own assets OR is admin (authorization)

### Business Logic
- **Business Rules**:
  - Users can view their own assets (all, including private/unpublished)
  - Admins can view any user's assets
  - Non-owners cannot view another user's private assets (use List Public Assets instead)
- **Processing Steps**:
  1. Validate ownerId is valid Guid
  2. Authorize: current user matches ownerId OR user is admin
  3. Query assets where OwnerId = ownerId via IAssetStorage.GetByOwnerAsync()
  4. Return asset list
- **Domain Coordination**: Simple filtered query
- **Validation Logic**: Authorization check (own assets or admin)

### Output Specification
- **Output Data**: List of Asset entities owned by specified user
- **Output Format**: JSON array with Asset objects
- **Postconditions**: None (read-only, no state changes)

### Error Scenarios
- **Invalid OwnerId Format**: Return 400 Bad Request with "Invalid owner ID format"
- **Unauthorized**: Return 403 Forbidden with "Access denied - can only view own assets" (non-admin querying other user's assets)
- **Unauthenticated**: Return 401 Unauthorized if user not authenticated
- **Database Error**: Return 500 Internal Server Error with "Failed to retrieve assets"

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```csharp
  public interface IAssetStorage
  {
      Task<List<Asset>> GetByOwnerAsync(Guid ownerId);
  }
  ```
- **Data Access Patterns**: Indexed query on OwnerId foreign key
- **External Integration**: None
- **Performance Requirements**: <200ms query, database index on OwnerId column

### Architecture Compliance
- **Layer Responsibilities**:
  - Application: Authorization (own assets or admin), orchestrate query
  - Domain: Entity definition
  - Infrastructure: Database query with filter
- **Dependency Direction**: Application → Domain ← Infrastructure
- **Interface Abstractions**: IAssetStorage
- **KISS Validation**: Simple OwnerId filter with authorization

### Testing Strategy
- **Unit Testing**:
  - Test authorization logic (owner allowed, non-owner rejected, admin allowed)
  - Test Guid validation
- **Integration Testing**:
  - Test query returns only assets for specified owner
  - Test authorization enforcement
  - Test empty result when user has no assets
  - Test performance with indexed queries
- **Acceptance Criteria**: See section below
- **BDD Scenarios**:
  - Given user owns 5 assets, When querying by OwnerId, Then 5 assets returned
  - Given user attempts to query another user's assets, When query submitted, Then 403 forbidden (unless admin)
  - Given admin queries any user's assets, When query submitted, Then assets returned

---

## Acceptance Criteria

- **AC-01**: User retrieves own assets
  - **Given**: User with ID "user-123" owns 3 assets
  - **When**: GetAssetsByOwnerQuery with ownerId="user-123" submitted by same user
  - **Then**: 3 assets returned (all owned by user-123)

- **AC-02**: Empty result when user has no assets
  - **Given**: User with ID "user-456" owns 0 assets
  - **When**: GetAssetsByOwnerQuery with ownerId="user-456" submitted by same user
  - **Then**: Empty array [] returned

- **AC-03**: Non-admin cannot query other user's assets
  - **Given**: User "user-123" attempts to query assets of "user-456"
  - **When**: GetAssetsByOwnerQuery with ownerId="user-456" submitted by user-123
  - **Then**: 403 Forbidden with "Access denied - can only view own assets"

- **AC-04**: Admin can query any user's assets
  - **Given**: Admin user queries assets of "user-789"
  - **When**: GetAssetsByOwnerQuery with ownerId="user-789" submitted by admin
  - **Then**: All assets owned by user-789 returned

- **AC-05**: Invalid OwnerId format rejected
  - **Given**: Invalid Guid format "not-a-guid"
  - **When**: GetAssetsByOwnerQuery submitted
  - **Then**: 400 Bad Request with "Invalid owner ID format"

- **AC-06**: Query includes all asset states
  - **Given**: User owns 2 published assets and 3 unpublished assets
  - **When**: User queries own assets
  - **Then**: All 5 assets returned (published and unpublished)

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Authorization → OwnerId filter query → Return list
- **Code Organization**: AssetService.GetByOwnerAsync() in application layer
- **Testing Approach**: Unit tests for authorization, integration tests for filtered queries
- **Indexing**: Ensure database index on OwnerId column for performance

### Dependencies
- **Technical Dependencies**: EF Core for database access
- **Area Dependencies**: None (self-contained)
- **External Dependencies**: Database

### Architectural Considerations
- **Area Boundary Respect**: Assets owns query, OwnerId references Identity but no join needed
- **Interface Design**: Simple contract with OwnerId parameter
- **Error Handling**: Clear authorization error messages
- **Performance**: Index on OwnerId critical for fast queries
- **Privacy**: Authorization prevents viewing other users' private assets

---

This List Assets By Owner use case provides comprehensive implementation guidance for personal asset library queries within the Assets area while maintaining security and architectural integrity.
