# Create Asset Use Case

**Original Request**: Create new reusable game asset template

**Create Asset** is a content creation operation that validates and persists a new asset template with specified properties. This use case operates within the Assets area and enables Game Masters to add new creatures, characters, props, and other game elements to their asset library.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model

---

## Use Case Overview

### Business Context
- **Parent Feature**: Asset Management
- **Owning Area**: Assets
- **Business Value**: Enable Game Masters to build reusable content libraries reducing repetitive setup work
- **User Benefit**: Quick asset creation with validation ensuring data integrity

### Scope Definition
- **Primary Actor**: Authenticated User (Game Master)
- **Scope**: Asset creation from user input to database persistence
- **Level**: User Goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP/GraphQL

- **Endpoint**: POST /api/assets
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/GraphQL
- **Response Format**: JSON with created Asset object

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: AssetService.CreateAsync(CreateAssetCommand)
- **Domain Entities**: Asset (aggregate root), Display (value object), Frame (value object)
- **Domain Services**: IAssetStorage.CreateAsync()
- **Infrastructure Dependencies**: DbContext (Asset persistence), IUserRepository (owner validation), IResourceRepository (display validation)

### Hexagonal Architecture
- **Primary Port Operation**: IAssetStorage.CreateAsync(Asset asset)
- **Secondary Port Dependencies**:
  - IUserRepository.GetByIdAsync(ownerId) - validate owner exists
  - IResourceRepository.GetByIdAsync(resourceId) - validate display resource
  - DbContext.Assets.Add() - persist entity
- **Adapter Requirements**: HTTP adapter (REST/GraphQL), database adapter (EF Core)

### DDD Alignment
- **Bounded Context**: Assets
- **Ubiquitous Language**: Create asset, asset template, ownership, asset type, display resource
- **Business Invariants**: INV-01 (name required), INV-02 (name length), INV-03 (description length), INV-05 (owner exists), INV-06 (valid type)
- **Domain Events**: AssetCreated (future implementation)

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - Name (string, required, 1-128 characters, no leading/trailing whitespace)
  - Type (AssetType enum, required, one of 15 valid types)
  - OwnerId (Guid, required, references User.Id)
  - Description (string, optional, max 4096 characters)
  - Display (Display value object, optional, references Resource with Type=Image)
    - ResourceId (Guid, optional)
    - Frame (Frame value object, optional)
      - Shape (FrameShape enum: Square, Circle)
      - Color (hex color string, e.g., "#FF5733")
      - BorderColor (hex color string)
- **Input Validation**:
  - Name: Not empty, not whitespace-only, length 1-128
  - Type: Valid AssetType enum value (Placeholder, Creature, Character, NPC, Object, Wall, Door, Window, Overlay, Elevation, Effect, Sound, Music, Vehicle, Token)
  - OwnerId: References existing User entity
  - Description: Length <= 4096 characters
  - Display.ResourceId: If provided, references existing Resource with Type=Image
  - Frame colors: Valid hex color format if provided
- **Preconditions**:
  - User is authenticated
  - User exists in system (OwnerId valid)
  - If Display.ResourceId provided, Resource exists and is Type=Image

### Business Logic
- **Business Rules**:
  - BR-01: Asset name must not be empty (INV-01)
  - BR-02: Asset name length must not exceed 128 characters (INV-02)
  - BR-03: Asset description length must not exceed 4096 characters (INV-03)
  - BR-07: Asset type must be valid enum value (INV-06)
  - BR-08: OwnerId must reference existing User (INV-05)
  - BR-09: Display.ResourceId must reference existing Resource with Type=Image
  - New assets default: IsPublished=false, IsPublic=false
- **Processing Steps**:
  1. Validate input: name not empty, name length <= 128, description length <= 4096
  2. Validate OwnerId references existing User (query User repository)
  3. Validate Type is valid AssetType enum
  4. If Display.ResourceId provided, validate Resource exists and Type=Image
  5. Create Asset entity with provided properties
  6. Set Id (new Guid), IsPublished=false, IsPublic=false
  7. Persist Asset via IAssetStorage.CreateAsync()
  8. Return persisted Asset with generated Id
  9. (Future) Publish AssetCreated domain event
- **Domain Coordination**:
  - Asset entity construction with validated inputs
  - Display value object creation if resource provided
  - Frame value object creation if styling provided
- **Validation Logic**:
  - Frontend validation: required fields, length constraints, format validation
  - Backend validation: referential integrity (User, Resource), business rules enforcement

### Output Specification
- **Output Data**: Asset entity with all properties including generated Id
- **Output Format**: JSON response
  ```json
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "ownerId": "user-guid",
    "type": "Creature",
    "name": "Ancient Red Dragon",
    "description": "Legendary dragon with flame breath",
    "isPublished": false,
    "isPublic": false,
    "display": {
      "resourceId": "resource-guid",
      "frame": {
        "shape": "Circle",
        "color": "#FF0000",
        "borderColor": "#8B0000"
      }
    }
  }
  ```
- **Postconditions**:
  - Asset persisted to database with generated Id
  - Asset is unpublished (IsPublished=false)
  - Asset is private (IsPublic=false)
  - Asset owned by authenticated user (OwnerId set)

### Error Scenarios
- **Empty Name**: Return 400 Bad Request with "Asset name is required" message (BR-01)
- **Name Too Long**: Return 400 Bad Request with "Asset name must not exceed 128 characters" message (BR-02)
- **Description Too Long**: Return 400 Bad Request with "Asset description must not exceed 4096 characters" message (BR-03)
- **Invalid Type**: Return 400 Bad Request with "Invalid asset type. Valid types: Placeholder, Creature, Character..." message (BR-07)
- **Owner Not Found**: Return 404 Not Found with "User not found" message (BR-08)
- **Resource Not Found**: Return 404 Not Found with "Display resource not found" message (BR-09)
- **Resource Wrong Type**: Return 400 Bad Request with "Display resource must be an image" message (BR-09)
- **Database Error**: Return 500 Internal Server Error with "Failed to create asset" message
- **Unauthorized**: Return 401 Unauthorized if user not authenticated

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```csharp
  public interface IAssetStorage
  {
      Task<Asset> CreateAsync(Asset asset);
  }

  public record CreateAssetCommand(
      string Name,
      AssetType Type,
      Guid OwnerId,
      string Description = "",
      Display? Display = null
  );
  ```
- **Data Access Patterns**: Repository pattern - IAssetStorage.CreateAsync(), IUserRepository.GetByIdAsync(), IResourceRepository.GetByIdAsync()
- **External Integration**: Database persistence via EF Core, foreign key validation
- **Performance Requirements**: Asset creation <200ms, index on OwnerId for ownership queries

### Architecture Compliance
- **Layer Responsibilities**:
  - UI: None (future REST API endpoint)
  - Application: Orchestrate validation, coordinate services, handle CreateAssetCommand
  - Domain: Asset entity definition (anemic), validation rules (enforced by service)
  - Infrastructure: Persistence, foreign key enforcement, database constraints
- **Dependency Direction**: Application → Domain ← Infrastructure
- **Interface Abstractions**: IAssetStorage (domain contract), IUserRepository, IResourceRepository
- **KISS Validation**: Simple validation checks, no complex workflows

### Testing Strategy
- **Unit Testing**:
  - Test name validation (empty, whitespace, length)
  - Test type validation (valid enum, invalid enum)
  - Test description length validation
  - Test default values (IsPublished=false, IsPublic=false)
  - Test Asset entity construction
- **Integration Testing**:
  - Test CreateAsync with valid inputs persists correctly
  - Test owner validation rejects non-existent users
  - Test resource validation rejects non-existent resources
  - Test resource type validation rejects non-image resources
- **Acceptance Criteria**: See section below
- **BDD Scenarios**:
  - Given valid asset data, When creating asset, Then asset persisted with defaults
  - Given empty name, When creating asset, Then validation error returned
  - Given non-existent owner, When creating asset, Then not found error returned

---

## Acceptance Criteria

- **AC-01**: Successful asset creation with minimal data
  - **Given**: Authenticated user with valid OwnerId, name "Goblin Scout", type "Creature"
  - **When**: CreateAssetCommand submitted
  - **Then**: Asset created with Id, IsPublished=false, IsPublic=false, Description=""

- **AC-02**: Successful asset creation with full data
  - **Given**: Valid inputs including description and display with frame
  - **When**: CreateAssetCommand submitted
  - **Then**: Asset created with all properties, Display.ResourceId references image, Frame styling applied

- **AC-03**: Name validation - empty name rejected
  - **Given**: CreateAssetCommand with empty name ""
  - **When**: Command submitted
  - **Then**: 400 Bad Request with "Asset name is required" error (BR-01)

- **AC-04**: Name validation - whitespace-only name rejected
  - **Given**: CreateAssetCommand with name "   "
  - **When**: Command submitted
  - **Then**: 400 Bad Request with "Asset name is required" error (BR-01)

- **AC-05**: Name validation - name too long rejected
  - **Given**: CreateAssetCommand with name of 129 characters
  - **When**: Command submitted
  - **Then**: 400 Bad Request with "Asset name must not exceed 128 characters" error (BR-02)

- **AC-06**: Description validation - description too long rejected
  - **Given**: CreateAssetCommand with description of 4097 characters
  - **When**: Command submitted
  - **Then**: 400 Bad Request with "Asset description must not exceed 4096 characters" error (BR-03)

- **AC-07**: Owner validation - non-existent owner rejected
  - **Given**: CreateAssetCommand with OwnerId not in database
  - **When**: Command submitted
  - **Then**: 404 Not Found with "User not found" error (BR-08)

- **AC-08**: Type validation - invalid type rejected
  - **Given**: CreateAssetCommand with invalid AssetType value
  - **When**: Command submitted
  - **Then**: 400 Bad Request with valid type list (BR-07)

- **AC-09**: Resource validation - non-existent resource rejected
  - **Given**: CreateAssetCommand with Display.ResourceId not in database
  - **When**: Command submitted
  - **Then**: 404 Not Found with "Display resource not found" error (BR-09)

- **AC-10**: Resource type validation - non-image resource rejected
  - **Given**: CreateAssetCommand with Display.ResourceId referencing Resource with Type=Audio
  - **When**: Command submitted
  - **Then**: 400 Bad Request with "Display resource must be an image" error (BR-09)

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Command pattern → Application Service → Domain validation → Infrastructure persistence
- **Code Organization**:
  - Domain: Asset entity, Display/Frame value objects, IAssetStorage interface
  - Application: CreateAssetCommandHandler, validation logic
  - Infrastructure: AssetStorageService (IAssetStorage implementation), DbContext configuration
- **Testing Approach**: Unit tests for validation, integration tests for persistence, BDD for workflows

### Dependencies
- **Technical Dependencies**:
  - EF Core for database access
  - ASP.NET Core for REST API (future)
  - FluentValidation for input validation (optional)
- **Area Dependencies**:
  - Identity: User entity for ownership validation
  - Media: Resource entity for display validation
- **External Dependencies**:
  - Database (SQL Server/PostgreSQL)

### Architectural Considerations
- **Area Boundary Respect**: Assets owns Asset creation, queries Identity/Media only for validation
- **Interface Design**: IAssetStorage as clean contract, implementation details hidden
- **Error Handling**: Descriptive validation errors, security-conscious messages (don't expose internal structure)
- **Data Integrity**: Foreign key constraints, validation before persistence, transaction support

---

This Create Asset use case provides comprehensive implementation guidance for asset creation within the Assets area while maintaining architectural integrity, data validation, and area boundary respect.
