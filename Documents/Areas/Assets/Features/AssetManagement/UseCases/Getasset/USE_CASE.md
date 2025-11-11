# Get Asset Use Case

**Original Request**: Retrieve single asset by ID

**Get Asset** is a retrieval operation that fetches a specific asset template by its unique identifier. This use case operates within the Assets area and enables users to view asset details for editing, viewing, or placement on encounters.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model

---

## Use Case Overview

### Business Context
- **Parent Feature**: Asset Management
- **Owning Area**: Assets
- **Business Value**: Essential retrieval operation enabling asset viewing and editing workflows
- **User Benefit**: Fast access to specific asset details by ID

### Scope Definition
- **Primary Actor**: Authenticated User
- **Scope**: Single asset retrieval by ID with authorization
- **Level**: Subfunction

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP/GraphQL

- **Endpoint**: GET /api/assets/:id
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/GraphQL
- **Response Format**: JSON with Asset object

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: AssetService.GetByIdAsync(Guid assetId)
- **Domain Entities**: Asset (aggregate root)
- **Domain Services**: IAssetStorage.GetByIdAsync()
- **Infrastructure Dependencies**: DbContext (Asset query)

### Hexagonal Architecture
- **Primary Port Operation**: IAssetStorage.GetByIdAsync(Guid assetId)
- **Secondary Port Dependencies**:
  - DbContext.Assets.FindAsync(assetId)
- **Adapter Requirements**: HTTP adapter (REST/GraphQL), database adapter (EF Core)

### DDD Alignment
- **Bounded Context**: Assets
- **Ubiquitous Language**: Get asset, retrieve asset, asset lookup
- **Business Invariants**: None (read-only operation)
- **Domain Events**: None (read-only operation)

---

## Functional Specification

### Input Requirements
- **Input Data**: Asset ID (Guid, required)
- **Input Validation**: Asset ID must be valid Guid format
- **Preconditions**:
  - User is authenticated
  - Asset exists in database

### Business Logic
- **Business Rules**:
  - Authorization: User can view asset if owner OR asset is public (IsPublic=true)
  - Admin users can view any asset
- **Processing Steps**:
  1. Validate assetId is valid Guid
  2. Query Asset by ID via IAssetStorage.GetByIdAsync()
  3. If asset not found, return 404
  4. Check authorization: current user is owner OR asset is public OR user is admin
  5. If not authorized, return 403
  6. Return Asset entity
- **Domain Coordination**: Simple entity retrieval, no modifications
- **Validation Logic**: ID format, existence check, authorization check

### Output Specification
- **Output Data**: Asset entity with all properties
- **Output Format**: JSON response with Asset object
- **Postconditions**: None (read-only, no state changes)

### Error Scenarios
- **Invalid ID Format**: Return 400 Bad Request with "Invalid asset ID format"
- **Asset Not Found**: Return 404 Not Found with "Asset not found"
- **Unauthorized Access**: Return 403 Forbidden with "Access denied - asset is private"
- **Database Error**: Return 500 Internal Server Error with "Failed to retrieve asset"
- **Unauthenticated**: Return 401 Unauthorized if user not authenticated

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```csharp
  public interface IAssetStorage
  {
      Task<Asset?> GetByIdAsync(Guid assetId);
  }
  ```
- **Data Access Patterns**: Direct entity lookup by primary key
- **External Integration**: None
- **Performance Requirements**: <100ms query time, index on Id (primary key)

### Architecture Compliance
- **Layer Responsibilities**:
  - Application: Authorization check, orchestrate retrieval
  - Domain: Entity definition
  - Infrastructure: Database query
- **Dependency Direction**: Application → Domain ← Infrastructure
- **Interface Abstractions**: IAssetStorage
- **KISS Validation**: Simple ID lookup with authorization

### Testing Strategy
- **Unit Testing**:
  - Test Guid validation
  - Test authorization logic (owner, public, admin scenarios)
- **Integration Testing**:
  - Test retrieval of existing asset returns data
  - Test non-existent ID returns 404
  - Test authorization for private vs public assets
- **Acceptance Criteria**: See section below
- **BDD Scenarios**:
  - Given valid asset ID owned by user, When retrieving, Then asset returned
  - Given public asset ID, When any user retrieves, Then asset returned
  - Given private asset ID not owned, When retrieving, Then 403 forbidden

---

## Acceptance Criteria

- **AC-01**: Owner retrieves own asset
  - **Given**: User owns asset with ID "abc-123"
  - **When**: GetAssetQuery submitted with ID "abc-123"
  - **Then**: Asset returned with full details

- **AC-02**: Any user retrieves public asset
  - **Given**: Asset with ID "xyz-789" is public (IsPublic=true)
  - **When**: Any authenticated user retrieves ID "xyz-789"
  - **Then**: Asset returned with full details

- **AC-03**: Non-owner cannot retrieve private asset
  - **Given**: Asset with ID "def-456" is private (IsPublic=false) and owned by different user
  - **When**: User attempts to retrieve ID "def-456"
  - **Then**: 403 Forbidden with "Access denied - asset is private"

- **AC-04**: Admin retrieves any asset
  - **Given**: User has admin role, asset with ID "ghi-012" is private
  - **When**: Admin retrieves ID "ghi-012"
  - **Then**: Asset returned with full details

- **AC-05**: Non-existent asset returns 404
  - **Given**: No asset exists with ID "nonexistent-id"
  - **When**: User attempts to retrieve "nonexistent-id"
  - **Then**: 404 Not Found with "Asset not found"

- **AC-06**: Invalid ID format rejected
  - **Given**: Invalid Guid format "not-a-guid"
  - **When**: User attempts to retrieve "not-a-guid"
  - **Then**: 400 Bad Request with "Invalid asset ID format"

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Query → Authorization → Repository lookup → Return
- **Code Organization**: AssetService.GetByIdAsync() in application layer
- **Testing Approach**: Unit tests for authorization, integration tests for queries

### Dependencies
- **Technical Dependencies**: EF Core for database access
- **Area Dependencies**: None (self-contained in Assets)
- **External Dependencies**: Database

### Architectural Considerations
- **Area Boundary Respect**: Assets owns retrieval, no cross-area dependencies for basic get
- **Interface Design**: Simple contract with optional return (Asset?)
- **Error Handling**: Clear error messages, security-conscious (don't leak information about private assets)

---

This Get Asset use case provides comprehensive implementation guidance for asset retrieval within the Assets area while maintaining security and architectural integrity.
