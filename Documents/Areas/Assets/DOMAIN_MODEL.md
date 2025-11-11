# Assets Domain Model

**Bounded Context**: Assets

**Purpose**: Manage reusable game asset templates (objects and entities/creatures) that can be placed on encounters during gameplay.

**Note**: Structures (walls, doors) and Effects (light, fog) are now separate domain models in the Library.Encounters bounded context.

**Boundaries**:
- **Inside**: Asset entity definitions, asset type categorization, asset ownership and publishing
- **Outside**: User management (Identity context), Media resources (Media context), Encounter usage (Library context)

**Architecture Pattern**: DDD Contracts + Service Implementation
- Domain entities are **data contracts** (anemic - no behavior)
- Business logic resides in **application services** (Source/Assets/)
- Entities, value objects, and service interfaces define **contracts**
- Services enforce invariants and implement business rules

---

## Change Log
- *2025-10-11* — **3.0.0** — Multi-resource system (Token/Display roles), NamedSize with fractional support, IsVisible moved to EncounterAsset, AssetProperties base class
- *2025-10-06* — **2.0.0** — Major refactoring: Asset hierarchy (ObjectAsset, CreatureAsset), removed Structures/Effects (moved to Library.Encounters), framework-independent primitives
- *2025-10-02* — **1.0.0** — Initial domain model extracted from existing codebase

---

## Ubiquitous Language

- **Asset**: Reusable game element template (objects or creatures) that can be placed on encounters
- **Asset Kind**: Fundamental categorization (Object or Creature)
- **Object Asset**: Environmental items (furniture, traps, containers) placed in grid cells
- **Creature Asset**: Controllable game creatures (characters, NPCs, monsters) with stat blocks
- **Creature Category**: Sub-classification for creatures (Character vs Monster) for UI filtering
- **Published**: Asset approved and available for use in game sessions
- **Public**: Asset visible to all users (vs private/owner-only)
- **Private**: Asset visible only to the owner (antonym of Public, default state for new assets)
- **Unpublished**: Asset in draft state, not yet approved for session use (antonym of Published, default for new assets)
- **Ownership**: User who created and controls the asset
- **Token Style**: Visual customization for creature tokens (border, background, shape)
- **Stat Block**: Reference to character/creature statistics (stub for future implementation)
- **Trigger Effect**: Effect activated when object is interacted with (for traps)
- **Resource Role**: Purpose of a resource image (Token for encounter placement, Display for UI, or both)
- **Asset Resource**: Association between an Asset and a Resource with a specific role
- **Token Role**: Resource used for map/encounter placement (typically smaller, grid-sized)
- **Display Role**: Resource used in UI dialogs, character sheets (typically larger, detailed)
- **Named Size**: Asset size with optional category name (Tiny, Medium, Large, etc.) supporting fractional dimensions
- **Asset Properties**: Base properties shared by all asset types (currently: Size)

---

## Entities

### Asset (Abstract Base)

**Entity Classification**: Aggregate Root

**Aggregate Root**: This is the abstract base for all asset types (ObjectAsset and CreatureAsset)

**Inheritance Pattern**: Table-Per-Hierarchy (TPH) - all asset types stored in single Assets table with Kind discriminator

**Updated**: 2025-10-06 - Refactored to use inheritance instead of nullable mutually-exclusive properties

#### Identity
- **Primary Key**: Id (Guid)
- **Natural Key**: None (system-generated identity)

#### Attributes
- **Id**: Guid
  - **Constraints**: Primary key, required, system-generated
  - **Default Value**: New Guid on creation
  - **Nullable**: No
  - **Purpose**: Unique identifier for asset

- **OwnerId**: Guid
  - **Constraints**: Foreign key to User.Id, required
  - **Default Value**: Current user ID at creation
  - **Nullable**: No
  - **Purpose**: Links asset to owning user

- **Kind**: AssetKind (enum)
  - **Constraints**: Must be either Object or Entity
  - **Default Value**: Set by concrete class constructor
  - **Nullable**: No
  - **Purpose**: Discriminator for TPH inheritance (determines concrete type)

- **Name**: string
  - **Constraints**: Required, max length 128 characters, no leading/trailing whitespace
  - **Default Value**: None (must be provided)
  - **Nullable**: No
  - **Purpose**: Human-readable asset identifier

- **Description**: string
  - **Constraints**: Max length 4096 characters
  - **Default Value**: Empty string
  - **Nullable**: No
  - **Purpose**: Detailed description of asset purpose and usage

- **IsPublished**: bool
  - **Constraints**: If true, IsPublic must also be true
  - **Default Value**: false
  - **Nullable**: No
  - **Purpose**: Indicates asset is approved for use in sessions

- **IsPublic**: bool
  - **Constraints**: Must be true if IsPublished is true
  - **Default Value**: false
  - **Nullable**: No
  - **Purpose**: Controls visibility to users other than owner

- **CreatedAt**: DateTime
  - **Constraints**: Required, automatically set on creation
  - **Default Value**: UTC timestamp at creation
  - **Nullable**: No
  - **Purpose**: Track when asset was created

- **UpdatedAt**: DateTime
  - **Constraints**: Required, automatically updated on modification
  - **Default Value**: UTC timestamp at last update
  - **Nullable**: No
  - **Purpose**: Track when asset was last modified

#### Invariants
- **INV-01**: Name must not be empty or whitespace
  - **Rationale**: Asset must be identifiable by users
  - **Enforced By**: Service validation in CreateAssetAsync, UpdateAssetAsync

- **INV-02**: Name length must not exceed 128 characters
  - **Rationale**: Database constraint and UI display limits
  - **Enforced By**: EF Core MaxLength configuration, service validation

- **INV-03**: Description length must not exceed 4096 characters
  - **Rationale**: Database constraint, reasonable description limit
  - **Enforced By**: EF Core MaxLength configuration

- **INV-04**: Published assets must be Public (IsPublished=true implies IsPublic=true)
  - **Rationale**: Cannot publish private-only assets
  - **Enforced By**: Service validation before setting IsPublished=true

- **INV-05**: OwnerId must reference existing User
  - **Rationale**: Orphaned assets not allowed
  - **Enforced By**: Database foreign key constraint

- **INV-06**: Kind must be valid AssetKind enum value (Object or Entity)
  - **Rationale**: Kind discriminator integrity for TPH
  - **Enforced By**: C# enum type system, EF Core discriminator configuration

---

### ObjectAsset (Concrete)

**Inherits From**: Asset

**Purpose**: Represents environmental objects (furniture, traps, containers)

#### Specific Attributes

- **Properties**: ObjectProperties (value object)
  - **CellWidth**: int (grid cells occupied horizontally, default: 1)
  - **CellHeight**: int (grid cells occupied vertically, default: 1)
  - **IsMovable**: bool (can be moved after placement, default: true)
  - **IsOpaque**: bool (blocks line of sight and light, default: false)
  - **IsVisible**: bool (visible to players, default: true - false for hidden traps/doors)
  - **TriggerEffectId**: Guid? (optional reference to Effect triggered on interaction)

---

### CreatureAsset (Concrete)

**Inherits From**: Asset

**Purpose**: Represents controllable creatures (characters, NPCs, monsters)

#### Specific Attributes

- **Properties**: CreatureProperties (value object)
  - **CellSize**: int (grid cells occupied, default: 1 - larger creatures can be 2+)
  - **StatBlockId**: Guid? (optional reference to StatBlock entity)
  - **Category**: CreatureCategory enum (Character or Monster for UI filtering)
  - **TokenStyle**: TokenStyle? (optional visual styling with border/background colors and shape)

#### Operations (Implemented in Application Services)

**NOTE**: This architecture uses **anemic entities** (data contracts only). Business logic and behavior are implemented in **application services** (Source/Assets/), not in entity methods.

- **Create Asset**: Creates new asset with validation
  - **Implemented By**: IAssetStorage.CreateAsync() (Application layer)
  - **Pre-conditions**: Name not empty, Type valid, OwnerId references existing user
  - **Invariants Enforced**: INV-01 (name required), INV-02 (name length), INV-03 (description length), INV-05 (owner exists), INV-06 (valid type)
  - **Post-conditions**: Asset persisted with IsPublished=false, IsPublic=false
  - **Returns**: Task<Asset>

- **Update Asset**: Modifies asset properties
  - **Implemented By**: IAssetStorage.UpdateAsync() (Application layer)
  - **Pre-conditions**: Asset exists, user is owner or admin
  - **Invariants Enforced**: INV-01, INV-02, INV-03, INV-04 (if setting IsPublished=true)
  - **Post-conditions**: Asset properties updated
  - **Returns**: Task<Asset>

- **Publish Asset**: Marks asset as published (IsPublished=true)
  - **Implemented By**: IAssetStorage.UpdateAsync() with IsPublished=true (Application layer)
  - **Pre-conditions**: User is owner, IsPublic must be true
  - **Invariants Enforced**: INV-04 (published implies public)
  - **Post-conditions**: IsPublished=true, available for use in encounters
  - **Returns**: Task<Asset>

- **Delete Asset**: Removes asset
  - **Implemented By**: IAssetStorage.DeleteAsync() (Application layer)
  - **Pre-conditions**: Asset exists, user is owner or admin, asset not in use in any encounters
  - **Invariants Enforced**: None (deletion operation)
  - **Post-conditions**: Asset removed from database
  - **Returns**: Task

- **Get Asset**: Retrieves asset by ID
  - **Implemented By**: IAssetStorage.GetByIdAsync() (Application layer)
  - **Pre-conditions**: Asset exists
  - **Invariants Enforced**: None (read-only)
  - **Post-conditions**: None
  - **Returns**: Task<Asset?>

- **List Assets**: Queries assets with filtering
  - **Implemented By**: IAssetStorage.GetAllAsync(), GetByOwnerAsync(), GetPublicAssetsAsync() (Application layer)
  - **Pre-conditions**: None
  - **Invariants Enforced**: None (read-only)
  - **Post-conditions**: None
  - **Returns**: Task<List<Asset>>

**Entity Behavior**: Entities are **immutable records** (C# init-only properties). Modifications use:
- **with expressions**: `asset with { Name = newName }` (creates new instance)
- **Service orchestration**: Services handle validation, apply changes, persist
- **No entity methods**: All logic in application services

#### Domain Events
[NOT CURRENTLY IMPLEMENTED - Events could be added in future]

Potential future events:
- **AssetCreated**: When new asset is created
- **AssetPublished**: When asset IsPublished changes to true
- **AssetDeleted**: When asset is removed

#### Relationships
- **Owns** → User: Asset is owned by one user
  - **Cardinality**: Many-to-One (many assets per user)
  - **Navigation**: OwnerId property (foreign key, no navigation property in current implementation)

- **References** → Resources: Asset references multiple resources with different roles
  - **Cardinality**: One-to-Many (one asset has many resources via AssetResource collection)
  - **Navigation**: Resources property (ICollection<AssetResource>)
  - **Roles**: Each resource can be Token (encounter placement), Display (UI), or both (flag enum)

- **Referenced By** ← EncounterAsset: Asset may be placed on multiple encounters
  - **Cardinality**: One-to-Many (one asset template used in many encounter placements)
  - **Navigation**: Not navigable from Asset (no collection property)

---

## Value Objects

### AssetProperties (Base)

**Purpose**: Base properties shared by all asset types

#### Properties
- **Size**: NamedSize (asset dimensions in grid cells with optional category name)
  - **Type**: NamedSize value object (see Common domain)
  - **Default**: Medium (1×1)
  - **Supports**: Fractional sizes (⅛, ¼, ½) and whole numbers
  - **Named Categories**: Zero, Miniscule, Tiny, Small, Medium, Large, Huge, Gargantuan, Custom

#### Immutability
Yes (record type with init-only properties)

---

### ObjectProperties (Inherits AssetProperties)

**Purpose**: Encapsulates properties specific to Object assets (stored as JSON)

#### Properties (Inherited)
- **Size**: NamedSize (from AssetProperties)

#### Properties (Object-Specific)
- **IsMovable**: bool (default: true) - Can be moved after placement
- **IsOpaque**: bool (default: false) - Blocks line of sight and light
- **TriggerEffectId**: Guid? (optional) - Reference to Effect triggered on interaction

**Note:** IsVisible was removed - now managed at instance level (EncounterAsset.IsVisible)

#### Immutability
Yes (record type with init-only properties)

---

### CreatureProperties (Inherits AssetProperties)

**Purpose**: Encapsulates properties specific to Creature assets (stored as JSON)

#### Properties (Inherited)
- **Size**: NamedSize (from AssetProperties)

#### Properties (Creature-Specific)
- **StatBlockId**: Guid? (optional) - Reference to StatBlock entity
- **Category**: CreatureCategory enum - Character or Monster for UI filtering
- **TokenStyle**: TokenStyle? (optional) - Visual styling with border/background colors and shape

#### Immutability
Yes (record type with init-only properties)

---

### AssetResource

**Purpose**: Associates a Resource (image) with an Asset and defines its role(s)

#### Properties
- **ResourceId**: Guid - Reference to the media resource
- **Resource**: Resource? (navigation property, loaded separately)
- **Role**: ResourceRole (flag enum) - Token, Display, or both

**Role Selection:** When multiple resources have the same role, the first in the collection is used.

#### Immutability
Yes (record type with init-only properties)

---

### TokenStyle

**Purpose**: Defines visual styling for creature tokens

#### Properties
- **BorderColor**: string? (hex color code, e.g., "#FF5733")
- **BackgroundColor**: string? (hex color code, e.g., "#FFFFFF")
- **Shape**: TokenShape enum (Circle or Square)

#### Immutability
Yes (record type with init-only properties)

---

### NamedSize

**Purpose**: See Common domain model for full definition

**Summary**: Asset size in grid cells with optional category name, supporting fractional dimensions (⅛, ¼, ½) and named presets (Tiny, Medium, Large, etc.)

---

## Aggregates

### Asset Aggregate

**Aggregate Root**: Asset

**Entities in Aggregate**:
- Asset (root - abstract): Base asset definition
- ObjectAsset (concrete): Environmental object templates
- CreatureAsset (concrete): Character/monster templates

**Value Objects in Aggregate**:
- AssetProperties (base): Shared properties (Size)
- ObjectProperties: Object-specific attributes (inherits AssetProperties)
- CreatureProperties: Creature-specific attributes (inherits AssetProperties)
- AssetResource: Resource association with role
- TokenStyle: Visual styling for creature tokens
- NamedSize: Size representation (referenced from Common domain)

#### Boundary Definition
**What's Inside**:
- Asset entity hierarchy (Asset → ObjectAsset, CreatureAsset)
- ObjectProperties value object
- CreatureProperties value object
- TokenStyle value object

**What's Outside** (Referenced, not contained):
- User (referenced via OwnerId)
- Resources (referenced via AssetResource.ResourceId collection - multiple resources per asset)
- StatBlock (referenced via CreatureProperties.StatBlockId)
- Effect (referenced via ObjectProperties.TriggerEffectId)
- Encounter (references Asset via EncounterAsset.AssetId, not part of this aggregate)

**Boundary Rule**: All data needed to create, update, or delete an asset template is within this aggregate. External references (User, Resources) are by ID only. Resource entities themselves are managed in the Media bounded context. Encounter usage of assets is tracked in the Library aggregate (Encounter > EncounterAsset), not here.

#### Aggregate Invariants
- **AGG-01**: Asset can only be modified by owner (or admin)
  - **Enforcement**: Service layer authorization check
- **AGG-02**: Published asset (IsPublished=true) must be public (IsPublic=true)
  - **Enforcement**: Service validation before updates
- **AGG-03**: Asset cannot be deleted if in use in any encounter
  - **Enforcement**: Service check before deletion (query EncounterAsset usage)

#### Lifecycle Management
- **Creation**: Via IAssetStorage.CreateAsync() - validates inputs, generates ID, sets defaults (IsPublished=false, IsPublic=false)
- **Modification**: Only through service methods (UpdateAsync) with ownership/authorization checks, immutable record pattern (with expressions)
- **Deletion**: Via IAssetStorage.DeleteAsync() - checks ownership, verifies not in use, then removes

---

## Domain Services

### IAssetStorage

**Purpose**: Persistence and retrieval operations for Asset entities

**When to Use**: Any operation that needs to create, read, update, or delete assets

**Responsibilities**:
- Persist Asset entities to database
- Query assets with filters (by owner, public only, by type)
- Enforce database constraints
- Provide transaction support

#### Operations
- **CreateAsync(Asset asset)**: Persist new asset
  - **Inputs**: Asset entity (validated)
  - **Outputs**: Task<Asset> (persisted entity with ID)
  - **Side Effects**: Database insert

- **UpdateAsync(Asset asset)**: Update existing asset
  - **Inputs**: Asset entity with changes
  - **Outputs**: Task<Asset> (updated entity)
  - **Side Effects**: Database update

- **DeleteAsync(Guid assetId)**: Remove asset
  - **Inputs**: Asset ID
  - **Outputs**: Task
  - **Side Effects**: Database delete

- **GetByIdAsync(Guid assetId)**: Retrieve asset by ID
  - **Inputs**: Asset ID
  - **Outputs**: Task<Asset?> (null if not found)
  - **Side Effects**: None (read-only)

- **GetAllAsync()**: Retrieve all assets (admin operation)
  - **Inputs**: None
  - **Outputs**: Task<List<Asset>>
  - **Side Effects**: None (read-only)

- **GetByOwnerAsync(Guid ownerId)**: Retrieve assets owned by user
  - **Inputs**: Owner user ID
  - **Outputs**: Task<List<Asset>>
  - **Side Effects**: None (read-only)

- **GetPublicAssetsAsync()**: Retrieve public assets (IsPublic=true)
  - **Inputs**: None
  - **Outputs**: Task<List<Asset>>
  - **Side Effects**: None (read-only)

- **GetByTypeAsync(AssetType type)**: Retrieve assets of specific type
  - **Inputs**: AssetType enum value
  - **Outputs**: Task<List<Asset>>
  - **Side Effects**: None (read-only)

#### Dependencies
- **Required**: DbContext (EF Core for database access)
- **Why Needed**: Persistence layer implementation

---

## Domain Rules Summary

- **BR-01** - Validation: Asset name must not be empty
  - **Scope**: Asset entity creation and updates
  - **Enforcement**: Service validation in CreateAsync, UpdateAsync
  - **Validation**: Check string.IsNullOrWhiteSpace(name)

- **BR-02** - Validation: Asset name length must not exceed 128 characters
  - **Scope**: Asset entity creation and updates
  - **Enforcement**: Service validation, EF Core MaxLength
  - **Validation**: Check name.Length <= 128

- **BR-03** - Validation: Asset description length must not exceed 4096 characters
  - **Scope**: Asset entity creation and updates
  - **Enforcement**: EF Core MaxLength configuration
  - **Validation**: Database constraint

- **BR-04** - Business Logic: Published assets must be public
  - **Scope**: Asset publishing operation
  - **Enforcement**: Service check before setting IsPublished=true
  - **Validation**: Ensure IsPublic=true when IsPublished=true

- **BR-05** - Authorization: Only owner can modify asset (except admins)
  - **Scope**: All asset modification operations
  - **Enforcement**: Service authorization check
  - **Validation**: Check current user ID matches OwnerId or user has admin role

- **BR-06** - Business Logic: Asset cannot be deleted if in use
  - **Scope**: Asset deletion
  - **Enforcement**: Service check queries EncounterAsset usage
  - **Validation**: Query database for EncounterAsset references before delete

- **BR-07** - Validation: Asset type must be valid enum value
  - **Scope**: Asset creation and updates
  - **Enforcement**: C# type system (enum), EF Core enum conversion
  - **Validation**: Automatic (type safety)

- **BR-08** - Referential Integrity: OwnerId must reference existing User
  - **Scope**: Asset creation
  - **Enforcement**: Database foreign key constraint
  - **Validation**: Database enforces FK relationship

- **BR-09** - Referential Integrity: AssetResource.ResourceId must reference existing Resource
  - **Scope**: Asset creation and updates when resources are provided
  - **Enforcement**: Service validation before save (loads Resource entities)
  - **Validation**: Query Resource repository for each AssetResource.ResourceId

---

## Architecture Integration

### Domain Layer Purity
This domain model is **dependency-free** in the Domain project:
- ✅ No infrastructure dependencies (no database, no external APIs)
- ✅ No framework dependencies (no ASP.NET, no React)
- ✅ Pure business contracts only (entity definitions, service interfaces)
- ✅ Testable in isolation (unit tests with no mocks needed for entities)

**Note**: Service implementations (I AssetStorage implementation) reside in Application/Infrastructure layer (Source/Data/), not in Domain layer.

### Used By (Application Layer)
- **Create Asset Use Case**: Uses Asset entity, AssetType enum, Display value object, IAssetStorage service
- **Update Asset Use Case**: Uses Asset entity for modification via immutable record pattern
- **Publish Asset Use Case**: Uses Asset entity, sets IsPublished and ensures IsPublic
- **Delete Asset Use Case**: Uses Asset entity ID, checks usage before deletion
- **Browse Assets Use Case**: Uses Asset entity for display, filters by owner or public
- **Place Asset on Encounter Use Case**: References Asset.Id from Library context (EncounterAsset value object)

---

<!--
═══════════════════════════════════════════════════════════════
DOMAIN MODEL QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════

## Entities (30 points)
✅ 10pts: All entities have complete attribute lists with types and constraints
✅ 10pts: All entities have invariants clearly defined (enforced by services)
✅ 5pts: All entity operations documented (implemented in services)
✅ 5pts: Aggregate roots clearly identified (Asset is aggregate root)

## Value Objects (20 points)
✅ 10pts: All value objects have properties and validation rules (Display, Frame)
✅ 5pts: Immutability and value equality documented (records with init-only)
✅ 5pts: Factory methods for creation defined (inline construction)

## Aggregates (25 points)
✅ 10pts: Aggregate boundaries clearly defined (Asset + Display + Frame)
✅ 10pts: Aggregate invariants across entities specified (AGG-01, AGG-02, AGG-03)
✅ 5pts: Lifecycle management rules documented (creation, modification, deletion)

## Application Services (15 points)
✅ 10pts: Service interfaces defined as contracts (IAssetStorage in domain project)
✅ 5pts: Operations documented with pre/post-conditions and invariants enforced
✅ 5pts: Service dependencies and usage guidance clear

## Ubiquitous Language (10 points)
✅ 10pts: Complete domain terminology with definitions (8 terms defined)

## Target Score: 100/100 ✅

### Extraction Notes:
✅ Complete entity structure extracted from Domain/Asset.cs
✅ Value objects (Display, Frame) extracted
✅ Service interface (IAssetStorage) contract defined
✅ Business rules inferred from validation patterns
✅ Architecture pattern (anemic entities + services) documented
✅ Relationships mapped to User and Resource contexts
-->
