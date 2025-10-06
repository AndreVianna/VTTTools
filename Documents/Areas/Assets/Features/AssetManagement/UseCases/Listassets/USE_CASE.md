# List Assets Use Case

**Original Request**: Query all assets (admin operation)

**List Assets** is a comprehensive query operation that retrieves all assets in the system without filtering. This use case operates within the Assets area and enables administrators to view and manage the complete asset catalog.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model

---

## Use Case Overview

### Business Context
- **Parent Feature**: Asset Management
- **Owning Area**: Assets
- **Business Value**: Administrative oversight of complete asset catalog for moderation and analytics
- **User Benefit**: System-wide asset visibility for administrators

### Scope Definition
- **Primary Actor**: Administrator
- **Scope**: Query all assets without filters
- **Level**: Subfunction

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP/GraphQL (admin only)

- **Endpoint**: GET /api/admin/assets
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/GraphQL (requires admin role)
- **Response Format**: JSON array of Asset objects

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: AssetService.GetAllAsync()
- **Domain Entities**: Asset (aggregate root)
- **Domain Services**: IAssetStorage.GetAllAsync()
- **Infrastructure Dependencies**: DbContext (Asset query)

### Hexagonal Architecture
- **Primary Port Operation**: IAssetStorage.GetAllAsync()
- **Secondary Port Dependencies**:
  - DbContext.Assets.ToListAsync()
- **Adapter Requirements**: HTTP adapter (REST/GraphQL), database adapter (EF Core)

### DDD Alignment
- **Bounded Context**: Assets
- **Ubiquitous Language**: List assets, query assets, asset catalog
- **Business Invariants**: None (read-only operation)
- **Domain Events**: None (read-only operation)

---

## Functional Specification

### Input Requirements
- **Input Data**: None (returns all assets)
- **Input Validation**: User must have admin role
- **Preconditions**:
  - User is authenticated
  - User has admin role

### Business Logic
- **Business Rules**:
  - Admin-only operation (non-admins get 403 Forbidden)
  - Returns all assets regardless of ownership or publication status
- **Processing Steps**:
  1. Authenticate user
  2. Authorize: user has admin role
  3. Query all assets via IAssetStorage.GetAllAsync()
  4. Return asset list
- **Domain Coordination**: Simple query, no modifications
- **Validation Logic**: Admin role authorization

### Output Specification
- **Output Data**: List of all Asset entities
- **Output Format**: JSON array
  ```json
  [
    {
      "id": "guid1",
      "ownerId": "user-guid1",
      "type": "Creature",
      "name": "Dragon",
      "isPublished": true,
      "isPublic": true,
      ...
    },
    {
      "id": "guid2",
      "ownerId": "user-guid2",
      "type": "Token",
      "name": "Warrior Token",
      "isPublished": false,
      "isPublic": false,
      ...
    }
  ]
  ```
- **Postconditions**: None (read-only, no state changes)

### Error Scenarios
- **Unauthorized (Non-Admin)**: Return 403 Forbidden with "Admin access required"
- **Unauthenticated**: Return 401 Unauthorized if user not authenticated
- **Database Error**: Return 500 Internal Server Error with "Failed to retrieve assets"

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```csharp
  public interface IAssetStorage
  {
      Task<List<Asset>> GetAllAsync();
  }
  ```
- **Data Access Patterns**: Full table scan (consider pagination for large datasets)
- **External Integration**: None
- **Performance Requirements**: <500ms for <10,000 assets (recommend pagination for larger datasets)

### Architecture Compliance
- **Layer Responsibilities**:
  - Application: Admin authorization, orchestrate query
  - Domain: Entity definition
  - Infrastructure: Database query
- **Dependency Direction**: Application → Domain ← Infrastructure
- **Interface Abstractions**: IAssetStorage
- **KISS Validation**: Simple admin check

### Testing Strategy
- **Unit Testing**:
  - Test admin authorization (admin allowed, non-admin rejected)
- **Integration Testing**:
  - Test query returns all assets
  - Test authorization enforcement
  - Test performance with large datasets
- **Acceptance Criteria**: See section below
- **BDD Scenarios**:
  - Given admin user, When querying all assets, Then all assets returned
  - Given non-admin user, When querying all assets, Then 403 forbidden

---

## Acceptance Criteria

- **AC-01**: Admin retrieves all assets
  - **Given**: User has admin role
  - **When**: GetAllAssetsQuery submitted
  - **Then**: All assets returned (public, private, published, unpublished)

- **AC-02**: Non-admin cannot retrieve all assets
  - **Given**: User does not have admin role
  - **When**: GetAllAssetsQuery submitted
  - **Then**: 403 Forbidden with "Admin access required"

- **AC-03**: Empty catalog returns empty array
  - **Given**: No assets exist in database
  - **When**: Admin submits GetAllAssetsQuery
  - **Then**: Empty array [] returned

- **AC-04**: Query includes all asset types
  - **Given**: Assets of multiple types exist (Creature, Token, Door, etc.)
  - **When**: Admin submits GetAllAssetsQuery
  - **Then**: Assets of all types returned

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Admin authorization → Query all → Return list
- **Code Organization**: AssetService.GetAllAsync() in application layer
- **Testing Approach**: Unit tests for authorization, integration tests for queries
- **Pagination Recommendation**: Implement pagination for production use (skip/take or cursor-based)

### Dependencies
- **Technical Dependencies**: EF Core for database access
- **Area Dependencies**: None (self-contained)
- **External Dependencies**: Database

### Architectural Considerations
- **Area Boundary Respect**: Assets owns query, no cross-area dependencies
- **Interface Design**: Simple contract returning full list
- **Error Handling**: Clear authorization error messages
- **Performance**: Monitor query performance, add pagination if asset count grows large
- **Security**: Admin-only access prevents exposure of private assets

---

This List Assets use case provides comprehensive implementation guidance for administrative asset catalog queries within the Assets area while maintaining security and architectural integrity.
