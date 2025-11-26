# Assets Domain Model

**Bounded Context**: Assets

**Purpose**: Manage reusable game asset templates (characters, creatures, and objects) that can be placed on encounters during gameplay.

**Boundaries**:
- **Inside**: Asset entity definitions, asset classification, asset ownership and publishing, token management
- **Outside**: User management (Identity context), Media resources (Media context), Encounter usage (Library context)

**Architecture Pattern**: DDD Contracts + Service Implementation
- Domain entities are **data contracts** (anemic - no behavior)
- Business logic resides in **application services** (Source/Assets/)
- Entities, value objects, and service interfaces define **contracts**
- Services enforce invariants and implement business rules

---

## Change Log
- *2025-11-26* — **4.0.0** — Major refactoring: Unified Asset model (removed inheritance), AssetClassification value object, flexible Token collection, StatBlocks dictionary
- *2025-10-11* — **3.0.0** — Multi-resource system (Token/Display roles), NamedSize with fractional support
- *2025-10-06* — **2.0.0** — Asset hierarchy (ObjectAsset, CreatureAsset), framework-independent primitives
- *2025-10-02* — **1.0.0** — Initial domain model extracted from existing codebase

---

## Ubiquitous Language

- **Asset**: Reusable game element template (characters, creatures, or objects) that can be placed on encounters
- **Asset Kind**: Fundamental categorization: Character, Creature, or Object
- **Asset Classification**: Hierarchical taxonomy (Kind → Category → Type → Subtype)
- **Character**: Player characters and named NPCs with stat blocks
- **Creature**: Monsters, beasts, and other living entities
- **Object**: Environmental items (furniture, traps, containers) placed in grid cells
- **Token**: Visual representation of an asset for encounter placement (can have multiple variants)
- **Portrait**: Display image for UI dialogs and asset library views
- **Published**: Asset approved and available for use in game sessions
- **Public**: Asset visible to all users (vs private/owner-only)
- **Private**: Asset visible only to the owner (antonym of Public, default state)
- **Ownership**: User who created and controls the asset
- **Token Size**: Grid dimensions for token placement (supports fractional sizes)
- **Stat Block**: Level-based character/creature statistics

---

## Entities

### Asset

**Entity Classification**: Aggregate Root

**Architecture**: Single unified record (no inheritance hierarchy)

**Updated**: 2025-11-26 - Refactored from inheritance hierarchy to unified model with AssetClassification

#### Identity
- **Primary Key**: Id (Guid)
- **Natural Key**: None (system-generated identity)

#### Attributes

- **Id**: Guid
  - **Constraints**: Primary key, required, system-generated (Version 7 UUID)
  - **Default Value**: `Guid.CreateVersion7()` on creation
  - **Nullable**: No
  - **Purpose**: Unique identifier for asset

- **Classification**: AssetClassification (value object)
  - **Constraints**: Required, Kind must be valid enum
  - **Default Value**: None (must be provided)
  - **Nullable**: No
  - **Purpose**: Hierarchical categorization (Kind, Category, Type, Subtype)

- **Name**: string
  - **Constraints**: Required, max length 128 characters, no leading/trailing whitespace
  - **Default Value**: Empty string
  - **Nullable**: No
  - **Purpose**: Human-readable asset identifier

- **Description**: string
  - **Constraints**: Max length 4096 characters
  - **Default Value**: Empty string
  - **Nullable**: No
  - **Purpose**: Detailed description of asset purpose and usage

- **Portrait**: Resource?
  - **Constraints**: Optional, must reference existing Resource
  - **Default Value**: null
  - **Nullable**: Yes
  - **Purpose**: Display image for UI dialogs and library views

- **TokenSize**: NamedSize
  - **Constraints**: Required, Width and Height > 0
  - **Default Value**: `NamedSize.Default` (1.0 × 1.0)
  - **Nullable**: No
  - **Purpose**: Grid cell dimensions for token placement

- **Tokens**: List<Resource>
  - **Constraints**: Optional, each must reference existing Resource
  - **Default Value**: Empty list
  - **Nullable**: No (but can be empty)
  - **Purpose**: Token images for encounter placement (supports multiple variants)

- **StatBlocks**: Dictionary<int, Map<StatBlockValue>>
  - **Constraints**: Optional, key is level (int), value is stat map
  - **Default Value**: Empty dictionary
  - **Nullable**: No (but can be empty)
  - **Purpose**: Level-based character/creature statistics

- **OwnerId**: Guid
  - **Constraints**: Foreign key to User.Id, required
  - **Default Value**: Current user ID at creation
  - **Nullable**: No
  - **Purpose**: Links asset to owning user

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

- **INV-06**: Classification.Kind must be valid AssetKind enum value
  - **Rationale**: Classification integrity
  - **Enforced By**: C# enum type system, EF Core enum conversion

- **INV-07**: TokenSize Width and Height must be greater than 0
  - **Rationale**: Assets must have positive dimensions
  - **Enforced By**: Service validation

#### Relationships

- **Owns** → User: Asset is owned by one user
  - **Cardinality**: Many-to-One (many assets per user)
  - **Navigation**: OwnerId property (foreign key)

- **Has** → Resource (Portrait): Asset may have one portrait image
  - **Cardinality**: Many-to-One (many assets can share a resource)
  - **Navigation**: Portrait property (navigation property)

- **Has** → Resources (Tokens): Asset may have multiple token images
  - **Cardinality**: One-to-Many via junction table (AssetTokens)
  - **Navigation**: Tokens property (List<Resource>)
  - **Ordering**: Maintained by Index column in junction table

- **Referenced By** ← EncounterAsset: Asset may be placed on multiple encounters
  - **Cardinality**: One-to-Many (one asset template used in many encounter placements)
  - **Navigation**: Not navigable from Asset

---

## Value Objects

### AssetClassification

**Purpose**: Hierarchical categorization for assets

#### Properties

- **Kind**: AssetKind (enum: Character, Creature, Object)
  - **Required**: Yes
  - **Purpose**: Primary categorization

- **Category**: string
  - **Required**: Yes
  - **Purpose**: Secondary grouping (e.g., "Humanoid", "Beast", "Furniture")

- **Type**: string
  - **Required**: Yes
  - **Purpose**: Type within category (e.g., "Goblinoid", "Canine", "Container")

- **Subtype**: string?
  - **Required**: No
  - **Purpose**: Optional refinement (e.g., "Hobgoblin", "Wolf", null)

#### Immutability
Yes (sealed record with init-only properties)

#### Example Classifications

| Kind | Category | Type | Subtype |
|------|----------|------|---------|
| Creature | Humanoid | Goblinoid | Goblin |
| Creature | Humanoid | Goblinoid | Hobgoblin |
| Creature | Beast | Canine | Wolf |
| Creature | Dragon | Chromatic | Red |
| Character | Humanoid | Elf | High Elf |
| Object | Furniture | Seating | Chair |
| Object | Trap | Mechanical | Pit |

---

### NamedSize

**Purpose**: Asset dimensions in grid cells with optional named category

#### Properties

- **Width**: double (grid cells, supports fractions: 0.125, 0.25, 0.5, 1.0, 2.0, etc.)
- **Height**: double (grid cells)
- **Name**: SizeName? (optional enum: Tiny, Small, Medium, Large, Huge, Gargantuan)

#### Predefined Sizes

| Name | Width × Height |
|------|----------------|
| Tiny | 0.5 × 0.5 |
| Small | 0.75 × 0.75 |
| Medium | 1.0 × 1.0 |
| Large | 2.0 × 2.0 |
| Huge | 3.0 × 3.0 |
| Gargantuan | 4.0 × 4.0 |

#### Immutability
Yes (record type with init-only properties)

---

### StatBlockValue

**Purpose**: Single statistic entry in a stat block

#### Properties

- **Key**: string (stat name, e.g., "STR", "HP", "AC")
- **Value**: string? (stat value, e.g., "18", "45", "15")
- **Type**: StatValueType (enum: Number, Text, Modifier, etc.)

#### Immutability
Yes (record type with init-only properties)

---

## Enumerations

### AssetKind

**Purpose**: Primary asset categorization

```csharp
public enum AssetKind {
    Character,  // Player characters and named NPCs
    Creature,   // Monsters, beasts, and other living entities
    Object      // Environmental items (furniture, traps, containers)
}
```

---

## Aggregates

### Asset Aggregate

**Aggregate Root**: Asset

**Entities in Aggregate**:
- Asset (root): Asset definition with classification and tokens

**Value Objects in Aggregate**:
- AssetClassification: Hierarchical taxonomy
- NamedSize: Grid dimensions (referenced from Common domain)
- StatBlockValue: Individual stat entries

#### Boundary Definition

**What's Inside**:
- Asset entity with all properties
- Classification value object
- Token references (Resource IDs)
- StatBlocks collection

**What's Outside** (Referenced, not contained):
- User (referenced via OwnerId)
- Resources (referenced via Portrait and Tokens - managed in Media context)
- Encounter (references Asset via EncounterAsset, managed in Library context)

**Boundary Rule**: All data needed to create, update, or delete an asset template is within this aggregate. External references (User, Resources) are by ID or navigation property. Resource entities are managed in the Media bounded context.

#### Aggregate Invariants

- **AGG-01**: Asset can only be modified by owner (or admin)
  - **Enforcement**: Service layer authorization check

- **AGG-02**: Published asset must be public
  - **Enforcement**: Service validation before updates

- **AGG-03**: Asset cannot be deleted if in use in any encounter
  - **Enforcement**: Service check before deletion (query EncounterAsset usage)

- **AGG-04**: Token resources must be visible to asset owner
  - **Enforcement**: Service validation when adding tokens

---

## Domain Services

### IAssetStorage

**Purpose**: Persistence and retrieval operations for Asset entities

#### Operations

- **CreateAsync(Asset asset)**: Persist new asset
- **UpdateAsync(Asset asset)**: Update existing asset
- **DeleteAsync(Guid assetId)**: Remove asset
- **GetByIdAsync(Guid assetId)**: Retrieve asset by ID
- **GetAllAsync()**: Retrieve all assets (admin operation)
- **GetByOwnerAsync(Guid ownerId)**: Retrieve assets owned by user
- **GetPublicAssetsAsync()**: Retrieve public assets
- **GetByKindAsync(AssetKind kind)**: Retrieve assets of specific kind
- **GetByCategoryAsync(string category)**: Retrieve assets by category
- **GetByTypeAsync(string type)**: Retrieve assets by type

---

## Domain Rules Summary

- **BR-01**: Asset name must not be empty
- **BR-02**: Asset name length must not exceed 128 characters
- **BR-03**: Asset description length must not exceed 4096 characters
- **BR-04**: Published assets must be public
- **BR-05**: Only owner can modify asset (except admins)
- **BR-06**: Asset cannot be deleted if in use in encounters
- **BR-07**: Classification.Kind must be valid enum value
- **BR-08**: OwnerId must reference existing User
- **BR-09**: Token resources must be accessible to asset owner
- **BR-10**: TokenSize dimensions must be positive

---

## Architecture Integration

### Domain Layer Purity

This domain model is **dependency-free** in the Domain project:
- ✅ No infrastructure dependencies
- ✅ No framework dependencies
- ✅ Pure business contracts only
- ✅ Testable in isolation

### Used By (Application Layer)

- **Create Asset Use Case**: Uses Asset entity, AssetClassification, IAssetStorage
- **Update Asset Use Case**: Uses Asset entity with immutable record pattern
- **Publish Asset Use Case**: Sets IsPublished and ensures IsPublic
- **Delete Asset Use Case**: Checks usage before deletion
- **Browse Assets Use Case**: Filters by owner, kind, category, etc.
- **Place Asset on Encounter Use Case**: References Asset.Id from Library context

---

**Document Version**: 4.0.0
**Last Updated**: 2025-11-26
