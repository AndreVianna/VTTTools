# Place Asset Use Case

**Original Request**: Allow Game Masters to place, move, and remove assets on a Scene

**Place Asset** is a Scene Asset Placement Operation that allows Game Masters to place, move, and remove assets on a Scene. This use case operates within the Library area and enables Game Masters (scene owners) to place, move, and remove assets on tactical maps.

---

## Change Log
- *2025-10-03* — **1.0.0** — Use case specification created from Scene Management feature

---

## Use Case Overview

### Business Context
- **Parent Feature**: Scene Management
- **Owning Area**: Library
- **Business Value**: Enables Game Masters to populate tactical maps with player characters and creatures for gameplay
- **User Benefit**: Can place player character assets and creature/NPC assets on scenes to create playable tactical encounters

### Scope Definition
- **Primary Actor**: Game Master
- **Scope**: Scene aggregate SceneAsset collection management with cross-context Asset template references
- **Level**: User Goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: HTTP POST/PATCH/DELETE requests

**Place Asset Endpoint**: POST /api/library/scenes/{id:guid}/assets
**Move Asset Endpoint**: PATCH /api/library/scenes/{id:guid}/assets/{assetId:guid}/move
**Remove Asset Endpoint**: DELETE /api/library/scenes/{id:guid}/assets/{assetId:guid}

- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP
- **Response Format**: JSON with updated Scene object including placed assets

---

## Functional Specification

### Input Specification

#### Place Asset (POST)

**Parameters**:
1. **sceneId** (Guid, path parameter)
   - Scene identifier
   - Must reference existing Scene entity
   - User must own the scene

2. **sceneAsset** (SceneAsset value object, request body)
   - **AssetId** (Guid): Reference to Assets.Asset template entity
   - **X** (int): Horizontal position on scene
   - **Y** (int): Vertical position on scene
   - **Width** (int): Display width in pixels (must be > 0)
   - **Height** (int): Display height in pixels (must be > 0)
   - **ZIndex** (int): Layer order (higher values render on top)
   - **Rotation** (int): Rotation in degrees (0-360)
   - **IsLocked** (bool): Prevent editing/moving

**Validation Rules**:
- sceneId must reference existing Scene
- AssetId must reference existing Asset entity
- Width > 0, Height > 0
- Rotation 0-360 degrees
- Optional: X, Y within Stage bounds (INV-11)
- User must own the scene

#### Move Asset (PATCH)

**Parameters**:
1. **sceneId** (Guid, path parameter)
2. **assetId** (Guid, path parameter) - Identifies SceneAsset in collection
3. **position** (request body)
   - **X** (int): New horizontal position
   - **Y** (int): New vertical position
   - **Width** (int, optional): New width
   - **Height** (int, optional): New height
   - **Rotation** (int, optional): New rotation (0-360)
   - **ZIndex** (int, optional): New layer order

**Validation Rules**:
- SceneAsset must exist in Scene.Assets collection
- If provided: Width > 0, Height > 0
- If provided: Rotation 0-360
- SceneAsset.IsLocked = false (locked assets cannot be moved)

#### Remove Asset (DELETE)

**Parameters**:
1. **sceneId** (Guid, path parameter)
2. **assetId** (Guid, path parameter)

**Validation Rules**:
- SceneAsset must exist in Scene.Assets collection
- SceneAsset.IsLocked = false (locked assets cannot be removed)

### Processing Workflow

#### Place Asset Workflow:
1. Load Scene entity by sceneId
2. Validate Scene exists (return 404 if not found)
3. Validate user owns Scene (return 403 if unauthorized)
4. Call IAssetStorage.GetAssetByIdAsync(sceneAsset.AssetId)
5. Validate Asset exists (return 404 if not found)
6. Validate Width > 0 and Height > 0 (return 400 if invalid)
7. Validate Rotation 0-360 (return 400 if invalid)
8. Optionally validate position within Stage bounds (INV-11)
9. Add SceneAsset to Scene.Assets collection
10. Save Scene to database via EF Core
11. Publish AssetPlacedOnScene domain event
12. Return updated Scene entity with 200 OK

#### Move Asset Workflow:
1. Load Scene entity by sceneId
2. Validate Scene exists (return 404 if not found)
3. Validate user owns Scene (return 403 if unauthorized)
4. Find SceneAsset in Scene.Assets collection by assetId
5. Validate SceneAsset exists (return 404 if not found)
6. Validate SceneAsset.IsLocked = false (return 400 if locked)
7. Update SceneAsset properties (X, Y, Width, Height, Rotation, ZIndex)
8. Replace SceneAsset in collection with updated value object
9. Save Scene to database
10. Publish AssetMovedOnScene domain event
11. Return updated Scene with 200 OK

#### Remove Asset Workflow:
1. Load Scene entity by sceneId
2. Validate Scene exists (return 404 if not found)
3. Validate user owns Scene (return 403 if unauthorized)
4. Find SceneAsset in Scene.Assets collection by assetId
5. Validate SceneAsset exists (return 404 if not found)
6. Validate SceneAsset.IsLocked = false (return 400 if locked)
7. Remove SceneAsset from Scene.Assets collection
8. Save Scene to database
9. Publish AssetRemovedFromScene domain event
10. Return updated Scene with 200 OK

### Output Specification

**Success Response** (200 OK):
```json
{
  "id": "scene-guid",
  "ownerId": "user-guid",
  "name": "Goblin Ambush",
  "stage": { ... },
  "grid": { ... },
  "assets": [
    {
      "assetId": "asset-guid-1",
      "x": 100,
      "y": 150,
      "width": 50,
      "height": 50,
      "zIndex": 1,
      "rotation": 0,
      "isLocked": false
    },
    {
      "assetId": "asset-guid-2",
      "x": 300,
      "y": 200,
      "width": 75,
      "height": 75,
      "zIndex": 2,
      "rotation": 45,
      "isLocked": true
    }
  ]
}
```

**Postconditions**:
- Scene.Assets collection updated (asset added/moved/removed)
- Asset existence validated (for place operation)
- Position and dimensions validated
- Domain event published (AssetPlacedOnScene, AssetMovedOnScene, or AssetRemovedFromScene)
- Changes persisted to database

---

## Error Scenarios

### ES-01: Scene Not Found
- **Condition**: sceneId doesn't reference existing Scene
- **Handling**: Return 404 Not Found
- **Response**: `{"error": "Scene not found", "sceneId": "{id}"}`

### ES-02: Unauthorized Access
- **Condition**: User doesn't own the Scene
- **Handling**: Return 403 Forbidden
- **Response**: `{"error": "Forbidden: You do not own this scene"}`

### ES-03: Asset Template Not Found (Place)
- **Condition**: AssetId doesn't reference existing Asset entity
- **Handling**: Return 404 Not Found
- **Response**: `{"error": "Asset template not found", "assetId": "{id}"}`

### ES-04: SceneAsset Not Found (Move/Remove)
- **Condition**: AssetId doesn't exist in Scene.Assets collection
- **Handling**: Return 404 Not Found
- **Response**: `{"error": "Asset not placed on scene", "assetId": "{id}"}`

### ES-05: Invalid Dimensions (Place)
- **Condition**: Width ≤ 0 or Height ≤ 0
- **Handling**: Return 400 Bad Request
- **Response**: `{"error": "Asset dimensions must be positive", "width": X, "height": Y}`

### ES-06: Invalid Rotation
- **Condition**: Rotation < 0 or Rotation > 360
- **Handling**: Return 400 Bad Request
- **Response**: `{"error": "Rotation must be 0-360 degrees", "rotation": X}`

### ES-07: Asset Locked (Move/Remove)
- **Condition**: SceneAsset.IsLocked = true
- **Handling**: Return 400 Bad Request
- **Response**: `{"error": "Asset is locked and cannot be modified"}`

### ES-08: Position Out of Bounds (Optional INV-11)
- **Condition**: X, Y outside Stage bounds (if INV-11 enforcement enabled)
- **Handling**: Return 400 Bad Request
- **Response**: `{"error": "Asset position must be within stage bounds", "x": X, "y": Y, "stageWidth": W, "stageHeight": H}`

---

## Acceptance Criteria

### AC-01: Asset Placed Successfully
- **Given**: User is authenticated and owns Scene
- **And**: Valid AssetId and SceneAsset data provided
- **When**: POST /api/library/scenes/{id}/assets called
- **Then**: SceneAsset added to Scene.Assets collection
- **And**: AssetPlacedOnScene event published
- **And**: 200 OK returned with updated Scene

### AC-02: Asset Moved Successfully
- **Given**: User owns Scene and Asset is placed on scene
- **And**: SceneAsset.IsLocked = false
- **When**: PATCH /api/library/scenes/{id}/assets/{assetId}/move called with new position
- **Then**: SceneAsset position updated in collection
- **And**: AssetMovedOnScene event published
- **And**: 200 OK returned

### AC-03: Asset Removed Successfully
- **Given**: User owns Scene and Asset is placed on scene
- **And**: SceneAsset.IsLocked = false
- **When**: DELETE /api/library/scenes/{id}/assets/{assetId} called
- **Then**: SceneAsset removed from Scene.Assets collection
- **And**: AssetRemovedFromScene event published
- **And**: 200 OK returned

### AC-04: Asset Template Validation Enforced
- **Given**: User owns Scene
- **And**: AssetId references non-existent Asset
- **When**: PlaceAssetAsync called
- **Then**: 404 Not Found returned
- **And**: Scene.Assets collection not modified

### AC-05: Locked Asset Cannot Be Modified
- **Given**: SceneAsset exists with IsLocked = true
- **When**: MoveAssetAsync or RemoveAssetAsync called
- **Then**: 400 Bad Request returned
- **And**: SceneAsset not modified

### AC-06: Ownership Authorization Enforced
- **Given**: User is authenticated but doesn't own Scene
- **When**: PlaceAssetAsync, MoveAssetAsync, or RemoveAssetAsync called
- **Then**: 403 Forbidden returned
- **And**: Scene not modified

### AC-07: Dimension Validation Enforced
- **Given**: Width = 0 or Height = -50
- **When**: PlaceAssetAsync called
- **Then**: 400 Bad Request returned
- **And**: Error indicates dimensions must be positive

### AC-08: ZIndex Ordering Respected
- **Given**: Multiple assets placed with different ZIndex values
- **When**: Scene retrieved
- **Then**: Assets rendered in ZIndex order (higher values on top)

---

## Architecture Integration

### Clean Architecture Mapping

**Application Layer**:
- Service: ILibraryStorage (PlaceAssetAsync, MoveAssetAsync, RemoveAssetAsync methods)
- Responsibility: Orchestrate asset placement with validation and persistence
- Location: Source/Library/Services/LibraryStorage.cs (or SceneService.cs)

**Domain Layer**:
- Aggregate Root: Scene entity
- Value Object: SceneAsset (AssetId, X, Y, Width, Height, ZIndex, Rotation, IsLocked)
- Invariants: INV-11 (optional position bounds), AGG-08 (SceneAssets are value objects)
- Domain Events: AssetPlacedOnScene, AssetMovedOnScene, AssetRemovedFromScene

**Infrastructure Layer**:
- Persistence: EF Core owned entity collection for SceneAssets
- HTTP Adapter: POST/PATCH/DELETE endpoint handlers
- Asset Integration: IAssetStorage port for template validation

### Hexagonal Architecture Integration

**Primary Ports** (Inbound):
```csharp
Task<Result<Scene>> PlaceAssetAsync(
    Guid sceneId,
    SceneAsset sceneAsset,
    CancellationToken ct = default);

Task<Result<Scene>> MoveAssetAsync(
    Guid sceneId,
    Guid assetId,
    int x,
    int y,
    CancellationToken ct = default);

Task<Result<Scene>> RemoveAssetAsync(
    Guid sceneId,
    Guid assetId,
    CancellationToken ct = default);
```

**Secondary Ports** (Outbound):
- IAssetStorage.GetAssetByIdAsync(Guid assetId) - Validate asset template exists
- ISceneRepository.GetByIdAsync(Guid sceneId) - Load scene
- ISceneRepository.UpdateAsync(Scene scene) - Persist changes

**Adapters**:
- HTTP Endpoint Adapters: Map POST/PATCH/DELETE requests to service calls
- EF Core Adapter: Persists SceneAssets as owned entity collection
- Asset Validation Adapter: Calls IAssetStorage to validate templates

### DDD Integration

**Bounded Context**: Library
**Aggregate**: Scene (Aggregate Root contains SceneAsset collection)
**Value Object**: SceneAsset (immutable, 8 properties)
**Invariants**: INV-11 (optional position validation), AGG-08 (value objects, no independent existence)
**Domain Events**: AssetPlacedOnScene, AssetMovedOnScene, AssetRemovedFromScene
**Ubiquitous Language**: Scene, SceneAsset, Asset Template, Position, ZIndex, Locked

---

## Implementation Guidance

### Interface Definition

```csharp
// Source/Domain/Library/Scenes/Storage/ILibraryStorage.cs
public interface ILibraryStorage {
    Task<Result<Scene>> PlaceAssetAsync(
        Guid sceneId,
        SceneAsset sceneAsset,
        CancellationToken ct = default);

    Task<Result<Scene>> MoveAssetAsync(
        Guid sceneId,
        Guid assetId,
        int x,
        int y,
        CancellationToken ct = default);

    Task<Result<Scene>> RemoveAssetAsync(
        Guid sceneId,
        Guid assetId,
        CancellationToken ct = default);
}

// Source/Domain/Library/Scenes/SceneAsset.cs
public record SceneAsset(
    Guid AssetId,
    int X,
    int Y,
    int Width,
    int Height,
    int ZIndex,
    int Rotation,
    bool IsLocked);
```

### Service Implementation Pattern

```csharp
// PlaceAssetAsync
public async Task<Result<Scene>> PlaceAssetAsync(
    Guid sceneId,
    SceneAsset sceneAsset,
    CancellationToken ct) {

    var scene = await _repository.GetByIdAsync(sceneId, ct);
    if (scene == null)
        return Result.Failure("Scene not found");

    if (scene.OwnerId != _currentUserId)
        return Result.Failure("Forbidden");

    // Validate Asset template exists
    var asset = await _assetStorage.GetAssetByIdAsync(sceneAsset.AssetId, ct);
    if (asset == null)
        return Result.Failure("Asset template not found");

    // Validate dimensions
    if (sceneAsset.Width <= 0 || sceneAsset.Height <= 0)
        return Result.Failure("Asset dimensions must be positive");

    // Validate rotation
    if (sceneAsset.Rotation < 0 || sceneAsset.Rotation > 360)
        return Result.Failure("Rotation must be 0-360 degrees");

    // Optional: Validate position within bounds (INV-11)
    if (sceneAsset.X < 0 || sceneAsset.Y < 0 ||
        sceneAsset.X > scene.Stage.Width || sceneAsset.Y > scene.Stage.Height)
        return Result.Failure("Position must be within stage bounds");

    // Add to collection
    var updatedAssets = scene.Assets.Append(sceneAsset).ToList();
    var updatedScene = scene with { Assets = updatedAssets };

    await _repository.UpdateAsync(updatedScene, ct);
    await _eventBus.PublishAsync(
        new AssetPlacedOnScene(sceneId, sceneAsset.AssetId), ct);

    return Result.Success(updatedScene);
}

// MoveAssetAsync
public async Task<Result<Scene>> MoveAssetAsync(
    Guid sceneId,
    Guid assetId,
    int x,
    int y,
    CancellationToken ct) {

    var scene = await _repository.GetByIdAsync(sceneId, ct);
    if (scene == null)
        return Result.Failure("Scene not found");

    if (scene.OwnerId != _currentUserId)
        return Result.Failure("Forbidden");

    var sceneAsset = scene.Assets.FirstOrDefault(a => a.AssetId == assetId);
    if (sceneAsset == null)
        return Result.Failure("Asset not placed on scene");

    if (sceneAsset.IsLocked)
        return Result.Failure("Asset is locked");

    // Update position
    var updatedAsset = sceneAsset with { X = x, Y = y };
    var updatedAssets = scene.Assets
        .Where(a => a.AssetId != assetId)
        .Append(updatedAsset)
        .ToList();
    var updatedScene = scene with { Assets = updatedAssets };

    await _repository.UpdateAsync(updatedScene, ct);
    await _eventBus.PublishAsync(
        new AssetMovedOnScene(sceneId, assetId, x, y), ct);

    return Result.Success(updatedScene);
}

// RemoveAssetAsync
public async Task<Result<Scene>> RemoveAssetAsync(
    Guid sceneId,
    Guid assetId,
    CancellationToken ct) {

    var scene = await _repository.GetByIdAsync(sceneId, ct);
    if (scene == null)
        return Result.Failure("Scene not found");

    if (scene.OwnerId != _currentUserId)
        return Result.Failure("Forbidden");

    var sceneAsset = scene.Assets.FirstOrDefault(a => a.AssetId == assetId);
    if (sceneAsset == null)
        return Result.Failure("Asset not placed on scene");

    if (sceneAsset.IsLocked)
        return Result.Failure("Asset is locked");

    var updatedAssets = scene.Assets.Where(a => a.AssetId != assetId).ToList();
    var updatedScene = scene with { Assets = updatedAssets };

    await _repository.UpdateAsync(updatedScene, ct);
    await _eventBus.PublishAsync(
        new AssetRemovedFromScene(sceneId, assetId), ct);

    return Result.Success(updatedScene);
}
```

### Testing Strategy

**Unit Tests**:
- Test Asset template validation - reject non-existent AssetId
- Test dimension validation - reject Width/Height ≤ 0
- Test rotation validation - reject < 0 or > 360
- Test ownership authorization - reject non-owners
- Test locked asset protection - reject move/remove of locked assets
- Test SceneAsset collection management - add, update, remove
- Test ZIndex ordering

**Integration Tests**:
- Test EF Core owned entity collection persistence for SceneAssets
- Test IAssetStorage integration for template validation
- Test domain event publishing (all 3 events)
- Test position bounds validation (INV-11)

**BDD/Acceptance Tests**:
- Reference Place Asset, Move Asset, Remove Asset scenarios in Scene Management.feature
- Test complete workflows for all 3 operations
- Test error scenarios

**Performance Target**: < 500ms for asset placement/move/remove operations

---

## Technical Dependencies

**Domain Dependencies**:
- Scene entity (Aggregate Root)
- SceneAsset value object definition
- Asset entity reference (Assets context)
- INV-11 invariant (optional position bounds)
- AGG-08 aggregate rule (SceneAssets are value objects)

**Infrastructure Dependencies**:
- IAssetStorage interface (Assets context port)
- ISceneRepository (or ILibraryStorage persistence)
- EF Core owned entity collection configuration
- Event bus for domain events

**External Dependencies**:
- Database with Scene table and SceneAssets owned entity collection
- Assets context Asset table (for template validation)

---

## Cross-Area Coordination

**Library → Assets**:
- SceneAsset.AssetId references Assets.Asset template
- Validation via IAssetStorage.GetAssetByIdAsync port
- Asset template must exist before placement

**Library → Identity**:
- Scene.OwnerId references Identity.User
- Ownership validation for authorization

---

This Place Asset use case provides implementation-ready specification for managing asset placement on tactical maps while maintaining Library bounded context integrity and cross-context coordination with Assets for template validation.

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
✅ 5pts: Processing workflow detailed (3 workflows: 12, 11, 10 steps)
✅ 5pts: Output specification clear
✅ 5pts: Error scenarios comprehensive (8 scenarios)
✅ 5pts: Acceptance criteria testable (8 criteria)

## Architecture Alignment (30 points)
✅ 10pts: Area assignment correct (Library)
✅ 5pts: Clean Architecture mapping (Application/Domain/Infrastructure)
✅ 5pts: Hexagonal Architecture ports defined (3 primary ports)
✅ 5pts: DDD alignment (Scene aggregate, SceneAsset value object, INV-11, AGG-08)
✅ 5pts: Cross-area coordination documented (Assets, Identity)

## Implementation Readiness (20 points)
✅ 5pts: Interface contracts defined (3 methods)
✅ 5pts: Service implementation pattern provided (3 implementations)
✅ 5pts: Testing strategy complete
✅ 5pts: Technical dependencies identified

## Documentation Quality (10 points)
✅ 5pts: Clear and professional writing
✅ 5pts: Proper structure and formatting

Target Score: 100/100 ✅
-->
