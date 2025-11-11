# Configure Grid Use Case

**Original Request**: Allow Game Masters to configure the Grid (type, size, offset, color) for a Encounter

**Configure Grid** is a Encounter Configuration Operation that allows Game Masters to configure the Grid (type, size, offset, color) for a Encounter. This use case operates within the Library area and enables Game Masters (encounter owners) to set grid overlay type, size, offset, and color for tactical measurement.

---

## Change Log
- *2025-10-03* — **1.0.0** — Use case specification created from Encounter Management feature

---

## Use Case Overview

### Business Context
- **Parent Feature**: Encounter Management
- **Owning Area**: Library
- **Business Value**: Enables Game Masters to establish tactical measurement system for grid-based gameplay
- **User Benefit**: Can configure grid overlays matching different game systems (D&D square, hex-based games, isometric views)

### Scope Definition
- **Primary Actor**: Game Master
- **Scope**: Encounter aggregate Grid value object configuration
- **Level**: User Goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: HTTP PATCH request

- **Endpoint**: PATCH /api/library/encounters/{id:guid}/grid
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP
- **Response Format**: JSON with updated Encounter object including Grid configuration

---

## Functional Specification

### Input Specification

**Parameters**:
1. **encounterId** (Guid, path parameter)
   - Encounter identifier to configure
   - Must reference existing Encounter entity
   - User must own the encounter

2. **grid** (Grid value object, request body)
   - **Type** (GridType enum): Grid type - NoGrid, Square, HexH (Hexagonal Horizontal), HexV (Hexagonal Vertical), or Isometric
   - **CellWidth** (int): Grid cell width in pixels (must be > 0, INV-10)
   - **CellHeight** (int): Grid cell height in pixels (must be > 0, INV-10)
   - **OffsetX** (int): Grid horizontal offset in pixels
   - **OffsetY** (int): Grid vertical offset in pixels
   - **Color** (string): Grid line color in hex format (#RRGGBB)
   - **SnapToGrid** (bool): Enable snap-to-grid for asset placement

**Validation Rules**:
- encounterId must reference existing Encounter
- Grid.CellWidth > 0 (INV-10)
- Grid.CellHeight > 0 (INV-10)
- Grid.Type must be valid GridType enum value
- Grid.Color must be valid hex color format (#RRGGBB)
- User must own the encounter

### Processing Workflow

1. Load Encounter entity by encounterId
2. Validate Encounter exists (return 404 if not found)
3. Validate user owns Encounter (return 403 if unauthorized)
4. Validate Grid.CellWidth > 0 and Grid.CellHeight > 0 (INV-10, return 400 if invalid)
5. Validate Grid.Type is valid GridType enum value (return 400 if invalid)
6. Validate Grid.Color is valid hex format #RRGGBB (return 400 if invalid)
7. Update Encounter.Grid value object with new configuration
8. Save Encounter to database via EF Core
9. Publish EncounterGridConfigured domain event
10. Return updated Encounter entity with 200 OK

### Output Specification

**Success Response** (200 OK):
```json
{
  "id": "encounter-guid",
  "ownerId": "user-guid",
  "name": "Goblin Ambush",
  "stage": { ... },
  "grid": {
    "type": "Square",
    "cellWidth": 50,
    "cellHeight": 50,
    "offsetX": 0,
    "offsetY": 0,
    "color": "#000000",
    "snapToGrid": true
  },
  "assets": [ ... ]
}
```

**Postconditions**:
- Encounter.Grid updated with new configuration
- Grid dimensions validated (INV-10)
- Grid type and color validated
- EncounterGridConfigured event published
- Changes persisted to database

---

## Error Scenarios

### ES-01: Encounter Not Found
- **Condition**: encounterId doesn't reference existing Encounter
- **Handling**: Return 404 Not Found
- **Response**: `{"error": "Encounter not found", "encounterId": "{id}"}`

### ES-02: Unauthorized Access
- **Condition**: User doesn't own the Encounter
- **Handling**: Return 403 Forbidden
- **Response**: `{"error": "Forbidden: You do not own this encounter"}`

### ES-03: Invalid Grid Cell Dimensions
- **Condition**: Grid.CellWidth ≤ 0 or Grid.CellHeight ≤ 0 (INV-10 violation)
- **Handling**: Return 400 Bad Request
- **Response**: `{"error": "Grid cell dimensions must be positive", "cellWidth": X, "cellHeight": Y}`

### ES-04: Invalid Grid Type
- **Condition**: Grid.Type not a valid GridType enum value
- **Handling**: Return 400 Bad Request
- **Response**: `{"error": "Invalid grid type", "validTypes": ["NoGrid", "Square", "HexH", "HexV", "Isometric"]}`

### ES-05: Invalid Grid Color Format
- **Condition**: Grid.Color doesn't match hex format #RRGGBB
- **Handling**: Return 400 Bad Request
- **Response**: `{"error": "Grid color must be hex format #RRGGBB", "providedColor": "{color}"}`

---

## Acceptance Criteria

### AC-01: Grid Configured Successfully
- **Given**: User is authenticated and owns Encounter with ID
- **And**: Valid Grid configuration provided (Type=Square, CellWidth=50, CellHeight=50, Color=#000000)
- **When**: PATCH /api/library/encounters/{id}/grid called with Grid data
- **Then**: Encounter.Grid updated with new configuration
- **And**: EncounterGridConfigured event published
- **And**: 200 OK returned with updated Encounter

### AC-02: Grid Cell Dimension Validation Enforced (INV-10)
- **Given**: User owns Encounter
- **And**: Grid.CellWidth = 0 or Grid.CellHeight = -50
- **When**: ConfigureGridAsync called
- **Then**: 400 Bad Request returned
- **And**: Error message indicates cell dimension validation failure (INV-10)

### AC-03: Grid Type Validation Enforced
- **Given**: User owns Encounter
- **And**: Grid.Type = "InvalidType" (not in GridType enum)
- **When**: ConfigureGridAsync called
- **Then**: 400 Bad Request returned
- **And**: Error lists valid grid types

### AC-04: Ownership Authorization Enforced
- **Given**: User is authenticated but doesn't own Encounter
- **When**: ConfigureGridAsync called
- **Then**: 403 Forbidden returned
- **And**: Encounter.Grid not modified

### AC-05: Grid Color Validation Enforced
- **Given**: User owns Encounter
- **And**: Grid.Color = "red" or "rgb(255,0,0)" (not hex format)
- **When**: ConfigureGridAsync called
- **Then**: 400 Bad Request returned
- **And**: Error indicates color must be hex format #RRGGBB

### AC-06: All Grid Types Supported
- **Given**: User owns Encounter
- **When**: ConfigureGridAsync called with Type = NoGrid, Square, HexH, HexV, or Isometric
- **Then**: Grid configuration succeeds for all valid types
- **And**: Grid rendered correctly based on type

---

## Architecture Integration

### Clean Architecture Mapping

**Application Layer**:
- Service: ILibraryStorage.ConfigureGridAsync method
- Responsibility: Orchestrate Grid configuration with validation and persistence
- Location: Source/Library/Services/LibraryStorage.cs (or EncounterService.cs)

**Domain Layer**:
- Aggregate Root: Encounter entity
- Value Object: Grid (Type, CellWidth, CellHeight, OffsetX, OffsetY, Color, SnapToGrid)
- Enum: GridType (NoGrid, Square, HexH, HexV, Isometric)
- Invariants: INV-10 (Grid cell dimensions > 0)
- Domain Event: EncounterGridConfigured

**Infrastructure Layer**:
- Persistence: EF Core owned entity configuration for Grid
- HTTP Adapter: PATCH endpoint handler

### Hexagonal Architecture Integration

**Primary Port** (Inbound):
```csharp
Task<Result<Encounter>> ConfigureGridAsync(
    Guid encounterId,
    Grid grid,
    CancellationToken ct = default);
```

**Secondary Ports** (Outbound):
- IEncounterRepository.GetByIdAsync(Guid encounterId) - Load encounter
- IEncounterRepository.UpdateAsync(Encounter encounter) - Persist changes

**Adapters**:
- HTTP Endpoint Adapter: Maps PATCH request to ConfigureGridAsync call
- EF Core Adapter: Persists Grid as owned entity within Encounter aggregate

### DDD Integration

**Bounded Context**: Library
**Aggregate**: Encounter (Aggregate Root contains Grid value object)
**Value Object**: Grid (immutable, 7 properties)
**Enum**: GridType (5 values)
**Invariants**: INV-10 enforced by service before persistence
**Domain Events**: EncounterGridConfigured published after successful update
**Ubiquitous Language**: Grid, Cell, Offset, Snap-to-Grid, Square Grid, Hexagonal Grid, Isometric Grid

---

## Implementation Guidance

### Interface Definition

```csharp
// Source/Domain/Library/Encounters/Storage/ILibraryStorage.cs
public interface ILibraryStorage {
    Task<Result<Encounter>> ConfigureGridAsync(
        Guid encounterId,
        Grid grid,
        CancellationToken ct = default);
}

// Source/Domain/Library/Encounters/Grid.cs
public record Grid(
    GridType Type,
    int CellWidth,
    int CellHeight,
    int OffsetX,
    int OffsetY,
    string Color,
    bool SnapToGrid);

// Source/Domain/Library/Encounters/GridType.cs
public enum GridType {
    NoGrid = 0,
    Square = 1,
    HexH = 2,      // Hexagonal Horizontal
    HexV = 3,      // Hexagonal Vertical
    Isometric = 4
}
```

### Service Implementation Pattern

```csharp
// Source/Library/Services/LibraryStorage.cs or EncounterService.cs
public async Task<Result<Encounter>> ConfigureGridAsync(
    Guid encounterId,
    Grid grid,
    CancellationToken ct) {

    // Load encounter
    var encounter = await _repository.GetByIdAsync(encounterId, ct);
    if (encounter == null)
        return Result.Failure("Encounter not found");

    // Validate ownership
    if (encounter.OwnerId != _currentUserId)
        return Result.Failure("Forbidden");

    // Validate Grid cell dimensions (INV-10)
    if (grid.CellWidth <= 0 || grid.CellHeight <= 0)
        return Result.Failure("Grid cell dimensions must be positive");

    // Validate Grid.Type
    if (!Enum.IsDefined(typeof(GridType), grid.Type))
        return Result.Failure("Invalid grid type");

    // Validate color format
    if (!Regex.IsMatch(grid.Color, "^#[0-9A-Fa-f]{6}$"))
        return Result.Failure("Grid color must be hex format #RRGGBB");

    // Update Encounter.Grid
    var updatedEncounter = encounter with { Grid = grid };

    // Persist
    await _repository.UpdateAsync(updatedEncounter, ct);

    // Publish event
    await _eventBus.PublishAsync(
        new EncounterGridConfigured(encounterId, grid), ct);

    return Result.Success(updatedEncounter);
}
```

### Testing Strategy

**Unit Tests**:
- Test Grid cell dimension validation (INV-10) - reject CellWidth/CellHeight ≤ 0
- Test GridType enum validation - reject invalid values
- Test color format validation - accept #RRGGBB, reject other formats
- Test ownership authorization - reject non-owners
- Test Encounter.Grid update - verify value object replacement

**Integration Tests**:
- Test EF Core owned entity persistence for Grid value object
- Test EncounterGridConfigured event publishing
- Test all GridType variations (NoGrid, Square, HexH, HexV, Isometric)

**BDD/Acceptance Tests**:
- Reference Configure Grid scenarios in Encounter Management.feature (33 total scenarios)
- Test complete workflow: Load encounter → Configure grid → Verify update

**Performance Target**: < 500ms for Grid configuration operation

---

## Technical Dependencies

**Domain Dependencies**:
- Encounter entity (Aggregate Root)
- Grid value object definition
- GridType enum definition
- INV-10 invariant (Grid cell dimensions > 0)

**Infrastructure Dependencies**:
- IEncounterRepository (or ILibraryStorage persistence)
- EF Core owned entity configuration
- Event bus for domain events

**External Dependencies**:
- Database with Encounter table and Grid owned entity columns

---

## Cross-Area Coordination

**Library → Identity**:
- Encounter.OwnerId references Identity.User
- Ownership validation for authorization

---

This Configure Grid use case provides implementation-ready specification for configuring Encounter tactical grid overlay while maintaining Library bounded context integrity.

<!--
═══════════════════════════════════════════════════════════════
USE CASE SPECIFICATION QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════

## Business Clarity (15 points)
✅ 5pts: Use case purpose clearly stated
✅ 5pts: Business value articulated
✅ 5pts: User benefit explicit

## Functional Completeness (25 points)
✅ 5pts: Input specification complete with validation
✅ 5pts: Processing workflow detailed (10 steps)
✅ 5pts: Output specification clear
✅ 5pts: Error scenarios comprehensive (5 scenarios)
✅ 5pts: Acceptance criteria testable (6 criteria)

## Architecture Alignment (30 points)
✅ 10pts: Area assignment correct (Library)
✅ 5pts: Clean Architecture mapping (Application/Domain/Infrastructure)
✅ 5pts: Hexagonal Architecture ports defined
✅ 5pts: DDD alignment (Encounter aggregate, Grid value object, GridType enum, INV-10)
✅ 5pts: Cross-area coordination documented (Identity)

## Implementation Readiness (20 points)
✅ 5pts: Interface contracts defined
✅ 5pts: Service implementation pattern provided
✅ 5pts: Testing strategy complete
✅ 5pts: Technical dependencies identified

## Documentation Quality (10 points)
✅ 5pts: Clear and professional writing
✅ 5pts: Proper structure and formatting

Target Score: 100/100 ✅
-->
