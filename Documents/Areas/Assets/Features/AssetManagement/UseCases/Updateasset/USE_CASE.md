# Update Asset Use Case

**Original Request**: Modify existing asset properties

**Update Asset** is a modification operation that validates and persists changes to an existing asset template. This use case operates within the Assets area and enables Game Masters to update asset names, descriptions, types, and display properties.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model

---

## Use Case Overview

### Business Context
- **Parent Feature**: Asset Management
- **Owning Area**: Assets
- **Business Value**: Enable asset refinement and corrections without recreating assets
- **User Benefit**: Update asset properties while preserving ID and references

### Scope Definition
- **Primary Actor**: Authenticated User (Asset Owner or Admin)
- **Scope**: Asset modification from input validation to database persistence
- **Level**: User Goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP/GraphQL

- **Endpoint**: PUT /api/assets/:id
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/GraphQL
- **Response Format**: JSON with updated Asset object

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: AssetService.UpdateAsync(UpdateAssetCommand)
- **Domain Entities**: Asset (aggregate root), Display, Frame
- **Domain Services**: IAssetStorage.UpdateAsync()
- **Infrastructure Dependencies**: DbContext, IResourceRepository

### Hexagonal Architecture
- **Primary Port Operation**: IAssetStorage.UpdateAsync(Asset asset)
- **Secondary Port Dependencies**:
  - DbContext.Assets.Update()
  - IResourceRepository.GetByIdAsync() (if Display changed)
- **Adapter Requirements**: HTTP adapter, database adapter

### DDD Alignment
- **Bounded Context**: Assets
- **Ubiquitous Language**: Update asset, modify properties, asset revision
- **Business Invariants**: INV-01, INV-02, INV-03, INV-04 (if changing IsPublished)
- **Domain Events**: AssetUpdated (future implementation)

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - Id (Guid, required, identifies asset to update)
  - Name (string, optional, 1-128 characters if provided)
  - Type (AssetType enum, optional)
  - Description (string, optional, max 4096 characters)
  - Display (Display value object, optional)
  - IsPublic (bool, optional)
  - IsPublished (bool, optional, requires IsPublic=true if setting to true)
- **Input Validation**:
  - Name: If provided, not empty, not whitespace-only, length 1-128
  - Description: If provided, length <= 4096
  - Type: If provided, valid AssetType enum
  - Display.ResourceId: If provided, references existing Image Resource
  - IsPublished: If setting true, IsPublic must also be true (INV-04)
- **Preconditions**:
  - User is authenticated
  - Asset exists
  - User is owner or admin (authorization)

### Business Logic
- **Business Rules**:
  - BR-01: Asset name must not be empty if updated (INV-01)
  - BR-02: Asset name length must not exceed 128 characters (INV-02)
  - BR-03: Asset description length must not exceed 4096 characters (INV-03)
  - BR-04: Published assets must be public (INV-04)
  - BR-05: Only owner can modify asset (except admins)
  - BR-09: Display.ResourceId must reference existing Image Resource
- **Processing Steps**:
  1. Validate assetId format and asset exists
  2. Authorize: current user is owner OR admin
  3. Validate inputs: name constraints, description length, type validity
  4. If setting IsPublished=true, ensure IsPublic=true (BR-04)
  5. If Display.ResourceId changed, validate resource exists and Type=Image
  6. Create updated Asset using immutable record pattern (with expression)
  7. Persist via IAssetStorage.UpdateAsync()
  8. Return updated Asset
  9. (Future) Publish AssetUpdated domain event
- **Domain Coordination**: Asset entity immutable updates (with expression), validation enforcement
- **Validation Logic**: Same as Create plus authorization and invariant preservation

### Output Specification
- **Output Data**: Updated Asset entity
- **Output Format**: JSON response with Asset object
- **Postconditions**:
  - Asset properties updated in database
  - Asset Id unchanged
  - OwnerId unchanged (ownership cannot be transferred via update)

### Error Scenarios
- **Asset Not Found**: Return 404 Not Found with "Asset not found"
- **Unauthorized**: Return 403 Forbidden with "Access denied - must be asset owner" (BR-05)
- **Empty Name**: Return 400 Bad Request with "Asset name is required" (BR-01)
- **Name Too Long**: Return 400 Bad Request with "Asset name must not exceed 128 characters" (BR-02)
- **Description Too Long**: Return 400 Bad Request with "Asset description must not exceed 4096 characters" (BR-03)
- **Published Without Public**: Return 400 Bad Request with "Published assets must be public" (BR-04)
- **Invalid Type**: Return 400 Bad Request with "Invalid asset type"
- **Resource Not Found**: Return 404 Not Found with "Display resource not found" (BR-09)
- **Resource Wrong Type**: Return 400 Bad Request with "Display resource must be an image" (BR-09)
- **Database Error**: Return 500 Internal Server Error with "Failed to update asset"

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```csharp
  public interface IAssetStorage
  {
      Task<Asset> UpdateAsync(Asset asset);
  }

  public record UpdateAssetCommand(
      Guid Id,
      string? Name = null,
      AssetType? Type = null,
      string? Description = null,
      Display? Display = null,
      bool? IsPublic = null,
      bool? IsPublished = null
  );
  ```
- **Data Access Patterns**: Repository update, optimistic concurrency
- **External Integration**: Resource validation
- **Performance Requirements**: Update <150ms

### Architecture Compliance
- **Layer Responsibilities**:
  - Application: Authorization, orchestrate update, validate invariants
  - Domain: Immutable entity pattern (with expressions)
  - Infrastructure: Persistence, concurrency handling
- **Dependency Direction**: Application → Domain ← Infrastructure
- **Interface Abstractions**: IAssetStorage, IResourceRepository
- **KISS Validation**: Direct property updates with validation

### Testing Strategy
- **Unit Testing**:
  - Test authorization (owner allowed, non-owner rejected, admin allowed)
  - Test validation rules (name, description, published-public constraint)
  - Test immutable update pattern (with expression)
- **Integration Testing**:
  - Test full update flow persists changes
  - Test partial updates preserve unchanged properties
  - Test authorization enforcement
  - Test invariant validation (BR-04)
- **Acceptance Criteria**: See section below
- **BDD Scenarios**:
  - Given owner updates asset name, When command submitted, Then name updated
  - Given non-owner attempts update, When command submitted, Then 403 forbidden
  - Given setting IsPublished=true with IsPublic=false, When command submitted, Then validation error

---

## Acceptance Criteria

- **AC-01**: Owner updates asset name
  - **Given**: User owns asset "abc-123"
  - **When**: UpdateAssetCommand with new name "Updated Dragon"
  - **Then**: Asset name updated, other properties unchanged

- **AC-02**: Owner updates multiple properties
  - **Given**: User owns asset "abc-123"
  - **When**: UpdateAssetCommand with name, description, and display changes
  - **Then**: All specified properties updated, others unchanged

- **AC-03**: Admin updates any asset
  - **Given**: User has admin role, asset "xyz-789" owned by another user
  - **When**: Admin submits UpdateAssetCommand
  - **Then**: Asset updated successfully

- **AC-04**: Non-owner cannot update asset
  - **Given**: User does not own asset "def-456"
  - **When**: User attempts UpdateAssetCommand
  - **Then**: 403 Forbidden with "Access denied - must be asset owner" (BR-05)

- **AC-05**: Published-public constraint enforced
  - **Given**: Asset with IsPublic=false
  - **When**: UpdateAssetCommand sets IsPublished=true without setting IsPublic=true
  - **Then**: 400 Bad Request with "Published assets must be public" (BR-04)

- **AC-06**: Name validation on update
  - **Given**: UpdateAssetCommand with empty name ""
  - **When**: Command submitted
  - **Then**: 400 Bad Request with "Asset name is required" (BR-01)

- **AC-07**: Description length validation
  - **Given**: UpdateAssetCommand with 4097-character description
  - **When**: Command submitted
  - **Then**: 400 Bad Request with "Asset description must not exceed 4096 characters" (BR-03)

- **AC-08**: Resource validation on display update
  - **Given**: UpdateAssetCommand with non-existent Display.ResourceId
  - **When**: Command submitted
  - **Then**: 404 Not Found with "Display resource not found" (BR-09)

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Command → Authorization → Validation → Immutable update (with) → Persist
- **Code Organization**: AssetService.UpdateAsync() in application layer
- **Testing Approach**: Unit tests for validation, integration tests for persistence

### Dependencies
- **Technical Dependencies**: EF Core (optimistic concurrency, tracking)
- **Area Dependencies**: Media (Resource validation)
- **External Dependencies**: Database

### Architectural Considerations
- **Area Boundary Respect**: Assets owns updates, validates Media references
- **Interface Design**: Clean update contract, immutable entity pattern
- **Error Handling**: Security-conscious messages, clear validation feedback
- **Concurrency**: Handle optimistic concurrency conflicts (EF Core RowVersion)

---

This Update Asset use case provides comprehensive implementation guidance for asset modification within the Assets area while maintaining security, data integrity, and architectural integrity.
