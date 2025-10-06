# List Public Assets Use Case

**Original Request**: Query publicly visible assets (IsPublic=true)

**List Public Assets** is a filtered query operation that retrieves all assets marked as public, enabling community asset browsing and discovery. This use case operates within the Assets area and enables users to discover and use assets shared by other Game Masters.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model

---

## Use Case Overview

### Business Context
- **Parent Feature**: Asset Management
- **Owning Area**: Assets
- **Business Value**: Community asset sharing fostering collaboration and reducing duplicate content creation
- **User Benefit**: Access to public asset library created by community

### Scope Definition
- **Primary Actor**: Authenticated User (any role)
- **Scope**: Query assets where IsPublic=true
- **Level**: User Goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP/GraphQL

- **Endpoint**: GET /api/assets/public
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/GraphQL
- **Response Format**: JSON array of Asset objects

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: AssetService.GetPublicAssetsAsync()
- **Domain Entities**: Asset (aggregate root)
- **Domain Services**: IAssetStorage.GetPublicAssetsAsync()
- **Infrastructure Dependencies**: DbContext (Asset query with IsPublic filter)

### Hexagonal Architecture
- **Primary Port Operation**: IAssetStorage.GetPublicAssetsAsync()
- **Secondary Port Dependencies**:
  - DbContext.Assets.Where(a => a.IsPublic == true).ToListAsync()
- **Adapter Requirements**: HTTP adapter, database adapter (indexed query on IsPublic)

### DDD Alignment
- **Bounded Context**: Assets
- **Ubiquitous Language**: Public assets, shared assets, community library
- **Business Invariants**: None (read-only operation)
- **Domain Events**: None (read-only operation)

---

## Functional Specification

### Input Requirements
- **Input Data**: None (returns all public assets)
- **Input Validation**: User must be authenticated
- **Preconditions**:
  - User is authenticated

### Business Logic
- **Business Rules**:
  - Returns only assets where IsPublic=true
  - Any authenticated user can query public assets
  - Includes assets from all owners (community-wide)
  - May include both published and unpublished public assets (IsPublished state independent of IsPublic)
- **Processing Steps**:
  1. Authenticate user
  2. Query assets where IsPublic=true via IAssetStorage.GetPublicAssetsAsync()
  3. Return asset list
- **Domain Coordination**: Simple filtered query
- **Validation Logic**: Authentication check only

### Output Specification
- **Output Data**: List of Asset entities where IsPublic=true
- **Output Format**: JSON array
  ```json
  [
    {
      "id": "guid1",
      "ownerId": "user-guid1",
      "type": "Creature",
      "name": "Goblin",
      "isPublished": true,
      "isPublic": true,
      ...
    },
    {
      "id": "guid2",
      "ownerId": "user-guid2",
      "type": "Token",
      "name": "Hero Token",
      "isPublished": false,
      "isPublic": true,
      ...
    }
  ]
  ```
- **Postconditions**: None (read-only, no state changes)

### Error Scenarios
- **Unauthenticated**: Return 401 Unauthorized if user not authenticated
- **Database Error**: Return 500 Internal Server Error with "Failed to retrieve public assets"

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```csharp
  public interface IAssetStorage
  {
      Task<List<Asset>> GetPublicAssetsAsync();
  }
  ```
- **Data Access Patterns**: Indexed query on IsPublic boolean column, consider pagination
- **External Integration**: None
- **Performance Requirements**: <500ms for <10,000 public assets (recommend pagination for larger datasets)

### Architecture Compliance
- **Layer Responsibilities**:
  - Application: Authentication check, orchestrate query
  - Domain: Entity definition
  - Infrastructure: Database query with IsPublic filter
- **Dependency Direction**: Application → Domain ← Infrastructure
- **Interface Abstractions**: IAssetStorage
- **KISS Validation**: Simple IsPublic filter with authentication

### Testing Strategy
- **Unit Testing**:
  - Test authentication check
- **Integration Testing**:
  - Test query returns only public assets (IsPublic=true)
  - Test private assets excluded (IsPublic=false)
  - Test results include assets from multiple owners
  - Test empty result when no public assets exist
  - Test performance with large datasets
- **Acceptance Criteria**: See section below
- **BDD Scenarios**:
  - Given 5 public assets and 3 private assets exist, When querying public assets, Then 5 assets returned
  - Given no public assets exist, When querying public assets, Then empty array returned
  - Given user queries public assets, When query submitted, Then assets from all owners returned

---

## Acceptance Criteria

- **AC-01**: Retrieve all public assets
  - **Given**: 5 public assets (IsPublic=true) and 3 private assets (IsPublic=false) exist
  - **When**: GetPublicAssetsQuery submitted
  - **Then**: 5 public assets returned, private assets excluded

- **AC-02**: Empty result when no public assets
  - **Given**: No public assets exist in database
  - **When**: GetPublicAssetsQuery submitted
  - **Then**: Empty array [] returned

- **AC-03**: Any authenticated user can query public assets
  - **Given**: User "user-123" is authenticated
  - **When**: GetPublicAssetsQuery submitted by user-123
  - **Then**: All public assets returned (regardless of ownership)

- **AC-04**: Public assets from multiple owners returned
  - **Given**: User-A owns 2 public assets, User-B owns 3 public assets
  - **When**: User-C queries public assets
  - **Then**: All 5 public assets returned (from both User-A and User-B)

- **AC-05**: Includes both published and unpublished public assets
  - **Given**: 3 public-published assets (IsPublic=true, IsPublished=true) and 2 public-unpublished assets (IsPublic=true, IsPublished=false)
  - **When**: GetPublicAssetsQuery submitted
  - **Then**: All 5 public assets returned (IsPublished state does not affect IsPublic query)

- **AC-06**: Unauthenticated user cannot query
  - **Given**: No user authenticated
  - **When**: GetPublicAssetsQuery attempted
  - **Then**: 401 Unauthorized

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Authentication check → IsPublic filter query → Return list
- **Code Organization**: AssetService.GetPublicAssetsAsync() in application layer
- **Testing Approach**: Unit tests for authentication, integration tests for filtered queries
- **Pagination Recommendation**: Implement pagination for production use (skip/take or cursor-based)

### Dependencies
- **Technical Dependencies**: EF Core for database access
- **Area Dependencies**: None (self-contained)
- **External Dependencies**: Database

### Architectural Considerations
- **Area Boundary Respect**: Assets owns query, no cross-area dependencies
- **Interface Design**: Simple contract returning filtered list
- **Error Handling**: Minimal error scenarios (authentication only)
- **Performance**: Index on IsPublic column, add pagination for scale
- **Community Feature**: Enables asset sharing and discovery across users

---

This List Public Assets use case provides comprehensive implementation guidance for community asset browsing within the Assets area while maintaining security and architectural integrity.
