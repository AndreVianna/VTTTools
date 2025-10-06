# Configure Stage Use Case

**Original Request**: Allow Game Masters to configure the Stage (background image, viewport, dimensions) for a Scene

**Configure Stage** is a Scene Configuration Operation that enables Game Masters to configure Stage rendering properties for tactical map visual foundation. This use case operates within the Library area and enables Game Masters (scene owners) to set scene background image, viewport, and stage dimensions.

---

## Change Log
- *2025-10-03* — **1.0.0** — Use case specification created from Scene Management feature

---

## Use Case Overview

### Business Context
- **Parent Feature**: Scene Management
- **Owning Area**: Library
- **Business Value**: Enables Game Masters to establish visual foundation for tactical maps
- **User Benefit**: Can customize scene appearance with background images and rendering configuration

### Scope Definition
- **Primary Actor**: Game Master
- **Scope**: Scene aggregate Stage value object configuration
- **Level**: User Goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: HTTP PATCH request

- **Endpoint**: PATCH /api/library/scenes/{id:guid}/stage
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP
- **Response Format**: JSON with updated Scene object including Stage configuration

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: ILibraryStorage (ConfigureStageAsync method)
- **Domain Entities**: [Scene Entity (Aggregate Root), Stage Value Object]
- **Domain Services**: None (validation in application service)
- **Infrastructure Dependencies**: [EF Core for persistence, IMediaStorage for resource validation]

### Hexagonal Architecture
- **Primary Port Operation**: ConfigureStageAsync(Guid sceneId, Stage stage, CancellationToken ct)
- **Secondary Port Dependencies**: [IMediaStorage.GetResourceByIdAsync (validate BackgroundResourceId if provided)]
- **Adapter Requirements**: [HTTP endpoint adapter (PATCH handler), EF Core persistence adapter (update Scene.Stage)]

### DDD Alignment
- **Bounded Context**: Library
- **Ubiquitous Language**: [Stage (rendering configuration), Viewport (visible area), Background Resource (image), Scene (aggregate)]
- **Business Invariants**: [INV-09: Stage.Width > 0 and Stage.Height > 0]
- **Domain Events**: [SceneStageConfigured (when stage updated)]

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - sceneId: Guid (path parameter) - Identifier of the scene to configure
  - stage: Stage value object with properties:
    - BackgroundResourceId: Guid? (optional reference to background image)
    - ViewportX: int (X offset for viewport positioning)
    - ViewportY: int (Y offset for viewport positioning)
    - ViewportWidth: int (width of visible viewport area)
    - ViewportHeight: int (height of visible viewport area)
    - Width: int (total stage width in pixels)
    - Height: int (total stage height in pixels)
- **Input Validation**:
  - sceneId must reference existing Scene entity
  - Width must be greater than 0 (INV-09)
  - Height must be greater than 0 (INV-09)
  - ViewportWidth must be greater than 0
  - ViewportHeight must be greater than 0
  - BackgroundResourceId must reference existing Resource with Type=Image if provided
- **Preconditions**:
  - User is authenticated
  - Scene exists with given ID
  - User owns the scene (OwnerId matches authenticated user)

### Business Logic
- **Business Rules**:
  - Stage dimensions must be positive (INV-09): Width > 0 and Height > 0
  - BackgroundResourceId must reference valid Image resource if provided
  - Scene.Stage value object is immutable and replaced atomically
- **Processing Steps**:
  1. Load scene by ID from database
  2. Validate user ownership (Scene.OwnerId matches authenticated user)
  3. Validate Stage dimensions (Width > 0, Height > 0) per INV-09
  4. Validate viewport dimensions (ViewportWidth > 0, ViewportHeight > 0)
  5. If BackgroundResourceId provided, validate resource exists and is Image type via IMediaStorage
  6. Create new Stage value object with provided properties
  7. Update Scene.Stage with new value object
  8. Save Scene to database via EF Core
  9. Publish SceneStageConfigured domain event
  10. Return updated Scene entity
- **Domain Coordination**: Scene entity coordination with Stage value object replacement
- **Validation Logic**:
  - Stage dimension validation ensures positive values (INV-09)
  - Background resource validation ensures valid Image resource reference
  - Ownership validation ensures only owner can configure stage

### Output Specification
- **Output Data**: Updated Scene entity with new Stage configuration
- **Output Format**: JSON representation of Scene entity including:
  - Scene.Id (Guid)
  - Scene.Name (string)
  - Scene.Description (string)
  - Scene.Stage (Stage value object with all properties)
  - Scene.Grid (Grid value object)
  - Scene.Assets (List of SceneAsset value objects)
  - Scene.IsPublished (bool)
  - Scene.OwnerId (Guid)
  - Scene.AdventureId (Guid?)
- **Postconditions**:
  - Scene.Stage updated with new configuration in database
  - Background resource validated (if provided)
  - Stage dimensions validated per INV-09
  - SceneStageConfigured domain event published to event bus

### Error Scenarios
- **Scene Not Found**: Return 404 Not Found with scene ID in error message
- **Unauthorized Access**: Return 403 Forbidden if authenticated user doesn't own scene
- **Invalid Stage Dimensions**: Return 400 Bad Request if Width ≤ 0 or Height ≤ 0 (INV-09 violation) with validation message
- **Invalid Viewport Dimensions**: Return 400 Bad Request if ViewportWidth ≤ 0 or ViewportHeight ≤ 0 with validation message
- **Background Resource Not Found**: Return 404 Not Found if BackgroundResourceId provided but resource doesn't exist in Media context
- **Invalid Background Resource Type**: Return 400 Bad Request if Background resource is not Image type with resource type error message

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
```csharp
public interface ILibraryStorage
{
    Task<Scene> ConfigureStageAsync(
        Guid sceneId,
        Stage stage,
        CancellationToken cancellationToken = default);
}
```
- **Data Access Patterns**:
  - Load Scene by ID with ownership validation
  - Validate BackgroundResourceId via IMediaStorage.GetResourceByIdAsync
  - Update Scene.Stage value object (owned entity in EF Core)
  - Save changes via DbContext.SaveChangesAsync
- **External Integration**:
  - IMediaStorage interface for Background resource validation (Media bounded context)
  - Domain event publisher for SceneStageConfigured event
- **Performance Requirements**:
  - Stage configuration should complete within 500ms for typical scenes
  - Background resource validation via secondary port should be async
  - EF Core change tracking optimized for value object updates

### Architecture Compliance
- **Layer Responsibilities**:
  - Domain Layer: Stage value object immutability, Scene entity as data contract
  - Application Layer: ILibraryStorage service enforces INV-09, coordinates resource validation
  - Infrastructure Layer: EF Core adapter persists Stage as owned entity, HTTP adapter handles PATCH endpoint
- **Dependency Direction**:
  - UI Layer → Application Layer (ILibraryStorage)
  - Application Layer → Domain Layer (Scene, Stage entities)
  - Application Layer → Infrastructure Layer (IMediaStorage port)
  - Infrastructure Layer implements ports (no reverse dependencies)
- **Interface Abstractions**:
  - ILibraryStorage primary port for scene operations
  - IMediaStorage secondary port for resource validation
  - Stage value object enforces immutability
- **KISS Validation**:
  - Stage is simple value object (6 properties)
  - No complex hierarchies or abstractions
  - Direct property validation without frameworks
  - Single responsibility: configure stage rendering properties

### Testing Strategy
- **Unit Testing**:
  - Test Stage dimension validation (INV-09) with positive/negative/zero values
  - Test viewport dimension validation with boundary conditions
  - Test BackgroundResourceId validation logic (null, valid, invalid)
  - Test ownership authorization logic
  - Test Scene.Stage value object replacement
- **Integration Testing**:
  - Test EF Core Stage value object persistence with owned entity configuration
  - Test IMediaStorage integration for Background resource validation
  - Test domain event publishing with in-memory event bus
  - Test complete workflow from load to save with database
- **Acceptance Criteria**:
  - End-to-end test: Configure Stage with valid inputs, verify Scene.Stage updated
  - Error handling: Test all 6 error scenarios with appropriate HTTP status codes
  - Authorization: Verify non-owner cannot configure stage (403 Forbidden)
  - Validation: Verify INV-09 enforcement for all dimension properties
- **BDD Scenarios**: Covered in Scene Management BDD feature file (Configure Stage.feature) with 33 total scenarios for scene operations

---

## Acceptance Criteria

- **AC-01**: Scene stage configured successfully with valid inputs
  - **Given**: User owns scene, Stage data has Width > 0 and Height > 0, BackgroundResourceId references valid Image resource (or null)
  - **When**: ConfigureStageAsync called with valid sceneId and Stage value object
  - **Then**: Scene.Stage updated in database, SceneStageConfigured event published, 200 OK returned with updated Scene JSON

- **AC-02**: Background resource validation enforced
  - **Given**: BackgroundResourceId provided in Stage configuration
  - **When**: ConfigureStageAsync called
  - **Then**: IMediaStorage.GetResourceByIdAsync called to validate resource existence and Image type, error returned if validation fails (404 or 400)

- **AC-03**: Stage dimension validation enforced (INV-09)
  - **Given**: Stage data has Width ≤ 0 or Height ≤ 0
  - **When**: ConfigureStageAsync called
  - **Then**: 400 Bad Request returned with dimension validation error message, Scene.Stage not modified

- **AC-04**: Viewport dimension validation enforced
  - **Given**: Stage data has ViewportWidth ≤ 0 or ViewportHeight ≤ 0
  - **When**: ConfigureStageAsync called
  - **Then**: 400 Bad Request returned with viewport dimension validation error message

- **AC-05**: Ownership authorization enforced
  - **Given**: Authenticated user doesn't own scene (OwnerId mismatch)
  - **When**: ConfigureStageAsync called
  - **Then**: 403 Forbidden returned, Scene.Stage not modified

- **AC-06**: Scene not found handled gracefully
  - **Given**: sceneId doesn't reference existing Scene
  - **When**: ConfigureStageAsync called
  - **Then**: 404 Not Found returned with scene identifier in error message

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**:
  - Anemic domain entities (Scene, Stage as data contracts)
  - Business logic in ILibraryStorage application service
  - Value object immutability enforced via C# record types
  - EF Core owned entity configuration for Stage persistence
- **Code Organization**:
  - Domain Layer: Scene entity (Source/Domain/Library/Scene.cs), Stage value object (Source/Domain/Library/Stage.cs)
  - Application Layer: ILibraryStorage interface (Source/Core/Library/ILibraryStorage.cs)
  - Infrastructure Layer: LibraryStorage implementation (Source/Data/Library/LibraryStorage.cs), HTTP endpoint (Source/WebApp/Controllers/ScenesController.cs)
- **Testing Approach**:
  - Unit tests in Source/Tests/Domain.Tests/Library/ for Stage value object
  - Integration tests in Source/Tests/Integration.Tests/Library/ for EF Core persistence
  - E2E tests in Source/Tests/E2E.Tests/Scenes/ for complete workflow

### Dependencies
- **Technical Dependencies**:
  - Entity Framework Core 9.0 for persistence
  - IMediaStorage interface for Background resource validation (Media context)
  - ASP.NET Core 9.0 for HTTP endpoint adapter
  - Domain event publisher infrastructure
- **Area Dependencies**:
  - Media context: Resource entity for Background validation (external bounded context)
  - Identity context: User entity for ownership validation (OwnerId FK)
- **External Dependencies**:
  - SQL Server database with owned entity support for Stage value object
  - Azure Blob Storage for Background image resources (via IMediaStorage)

### Architectural Considerations
- **Area Boundary Respect**:
  - Library context owns Scene and Stage entities
  - Media context owns Resource entities (cross-boundary reference via BackgroundResourceId)
  - IMediaStorage secondary port maintains bounded context isolation
  - No direct database access to Media tables from Library
- **Interface Design**:
  - ConfigureStageAsync takes complete Stage value object (atomic replacement)
  - No partial updates (Stage is immutable)
  - CancellationToken support for async operation cancellation
  - Returns complete Scene entity for client state synchronization
- **Error Handling**:
  - 404 Not Found: Scene or Resource not found
  - 400 Bad Request: Validation failures (dimensions, resource type)
  - 403 Forbidden: Authorization failures (ownership)
  - 500 Internal Server Error: Database or infrastructure failures
  - All errors include descriptive messages for debugging

---

This Configure Stage use case provides comprehensive implementation guidance for set scene background image, viewport, and stage dimensions within the Library area while maintaining architectural integrity and area boundary respect.

<!--
═══════════════════════════════════════════════════════════════
USE CASE SPECIFICATION QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════

## Business Context (20 points)
✅ 5pts: Parent feature clearly identified (Scene Management)
✅ 5pts: Owning area correctly assigned (Library)
✅ 5pts: Business value explicitly stated
✅ 5pts: Primary actor and scope defined

## Architecture Integration (30 points)
✅ 10pts: Clean Architecture mapping complete (ILibraryStorage service, Scene/Stage entities)
✅ 10pts: Hexagonal Architecture elements defined (ConfigureStageAsync port, IMediaStorage adapter)
✅ 5pts: DDD alignment documented (Library bounded context, INV-09, SceneStageConfigured event)
✅ 5pts: Infrastructure dependencies identified (EF Core, IMediaStorage)
✅ UI Presentation: UI type specified (API_ENDPOINT)
✅ UI Presentation: Endpoint path specified (PATCH /api/library/scenes/{id:guid}/stage)
✅ UI Presentation: Response format documented (JSON with Scene entity)

## Functional Specification (30 points)
✅ 5pts: Input requirements fully specified with 7 Stage properties and validation rules
✅ 5pts: Business rules clearly documented (INV-09, resource validation, ownership)
✅ 5pts: Processing steps detailed (10 steps from load to event publishing)
✅ 5pts: Output specification complete (Scene entity with Stage JSON structure)
✅ 5pts: Error scenarios comprehensive (6 error conditions with HTTP status codes)
✅ 5pts: Preconditions and postconditions explicit

## Implementation Guidance (20 points)
✅ 5pts: Interface contract defined (ConfigureStageAsync signature)
✅ 5pts: Testing strategy includes unit, integration, and acceptance criteria
✅ 5pts: Acceptance criteria in Given/When/Then format (6 ACs)
✅ 5pts: Architecture compliance validated (layers, dependencies, KISS)

## Target Score: 100/100 ✅

### Quality Notes:
✅ Complete architectural alignment (DDD, Clean Architecture, Hexagonal)
✅ Comprehensive error handling (6 scenarios with HTTP codes)
✅ Clear validation rules (INV-09 enforcement documented)
✅ Domain events specified (SceneStageConfigured)
✅ 6 acceptance criteria in proper Given/When/Then format
✅ Cross-context integration documented (Media resource validation)
✅ Implementation pattern follows anemic domain with service orchestration
✅ Performance requirements specified (500ms target)
-->
