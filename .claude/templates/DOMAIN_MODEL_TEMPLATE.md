# {area_name} Domain Model

**Bounded Context**: {area_name}

**Purpose**: {context_purpose}

**Boundaries**: {what_is_included_and_excluded}

**Architecture Pattern**: DDD Contracts + Service Implementation
- Domain entities are **data contracts** (anemic - no behavior)
- Business logic resides in **application services**
- Entities, value objects, and service interfaces define **contracts**
- Services enforce invariants and implement business rules

---

## Change Log
<foreach {change} IN {change_log}>
- *{change.date}* — **{change.version}** — {change.description}
</foreach>
<examples>
- *2025-10-01* — **1.0.0** — Initial domain model created
- *2025-10-15* — **1.1.0* — Added Asset aggregate with validation rules
</examples>

---

## Ubiquitous Language

<foreach {term} IN {domain_terms}>
- **{term.concept}**: {term.definition}
</foreach>
<examples>
- **Asset**: Reusable template for game elements (characters, props, terrain, effects)
- **Asset Type**: Category classification (Character, Prop, Terrain, Effect)
- **Published**: Asset approved and visible for use in game sessions
- **Public**: Asset visible to all users (vs private/owner-only)
- **Display Resource**: Media file (image) used to visually represent the asset
- **Ownership**: User who created and controls the asset
</examples>

---

## Entities

<foreach {entity} IN {entities}>
### {entity.name}

**Entity Classification**: {Entity | Aggregate Root | Child Entity}

<if ({entity.classification} equals "Aggregate Root")>
**Aggregate Root**: This entity is the entry point for all operations on its aggregate
</if>

#### Identity
- **Primary Key**: {id_field} ({id_type})
- **Natural Key**: {natural_key_if_any}
<examples>
- **Primary Key**: Id (Guid)
- **Natural Key**: None (system-generated identity)
</examples>

#### Attributes
<foreach {attr} IN {entity.attributes}>
- **{attr.name}**: {attr.type}
  - **Constraints**: {attr.constraints}
  - **Default Value**: {attr.default}
  - **Nullable**: {attr.nullable}
  - **Purpose**: {attr.purpose}
</foreach>
<examples>
- **Name**: string
  - Constraints: Required, max length 200 characters, no leading/trailing whitespace
  - Default Value: None (must be provided)
  - Nullable: No
  - Purpose: Human-readable asset identifier

- **Type**: AssetType (value object)
  - Constraints: Must be valid AssetType enum value
  - Default Value: Prop
  - Nullable: No
  - Purpose: Categorizes asset for filtering and organization

- **IsPublic**: bool
  - Constraints: If IsPublished is true, IsPublic must be true
  - Default Value: false
  - Nullable: No
  - Purpose: Controls visibility to other users
</examples>

#### Invariants
<foreach {invariant} IN {entity.invariants}>
- **{invariant.id}**: {invariant.rule}
  - **Rationale**: {invariant.why}
  - **Enforced By**: {invariant.enforcement_method}
</foreach>
<examples>
- **INV-01**: Name must not be empty or whitespace
  - Rationale: Asset must be identifiable by users
  - Enforced By: Constructor validation, Rename method validation

- **INV-02**: Published assets must be Public
  - Rationale: Cannot publish private-only assets
  - Enforced By: Publish() method checks IsPublic first

- **INV-03**: OwnerId must reference existing User
  - Rationale: Orphaned assets not allowed
  - Enforced By: Database foreign key constraint
</examples>

#### Operations (Implemented in Application Services)

**NOTE**: This architecture uses **anemic entities** (data contracts only). Business logic and behavior are implemented in **application services**, not in entity methods.

<foreach {operation} IN {entity.operations}>
- **{operation.name}**: {operation.purpose}
  - **Implemented By**: {operation.service_name} (Application layer)
  - **Pre-conditions**: {operation.preconditions}
  - **Invariants Enforced**: {operation.invariants_checked}
  - **Post-conditions**: {operation.postconditions}
  - **Returns**: {operation.return_type}
</foreach>
<examples>
- **Create Asset**: Creates new asset with validation
  - Implemented By: AssetService.CreateAssetAsync()
  - Pre-conditions: Name not empty, Type valid, User owns ResourceId resource or it's public
  - Invariants Enforced: INV-01 (name length), INV-02 (description length), INV-05 (valid display)
  - Post-conditions: Asset persisted, AssetCreated event raised
  - Returns: Result<Asset>

- **Publish Asset**: Marks asset as published
  - Implemented By: AssetService.UpdateAssetAsync() with IsPublished=true
  - Pre-conditions: User is owner, IsPublic must be true
  - Invariants Enforced: INV-03 (published implies public)
  - Post-conditions: IsPublished=true, available for use in sessions
  - Returns: Result<Asset>

- **Rename Asset**: Changes asset name
  - Implemented By: AssetService.UpdateAssetAsync() with new Name
  - Pre-conditions: User is owner, newName not empty, max 128 chars
  - Invariants Enforced: INV-01 (name constraints)
  - Post-conditions: Name updated
  - Returns: Result<Asset>
</examples>

**Entity Behavior**: Entities are **immutable records** (C# init-only properties). Modifications use:
- **with expressions**: `asset with { Name = newName }` (creates new instance)
- **Service orchestration**: Services handle validation, apply changes, persist
- **No entity methods**: All logic in services

#### Domain Events
<foreach {event} IN {entity.domain_events}>
- **{event.name}**: {event.description}
  - **Trigger**: {event.when_raised}
  - **Payload**: {event.data}
  - **Consumers**: {event.who_listens}
</foreach>
<examples>
- **AssetCreated**: Raised when new asset is created
  - Trigger: After successful creation in repository
  - Payload: AssetId, OwnerId, Name, Type, CreatedAt
  - Consumers: Notification service, audit log

- **AssetRenamed**: Raised when asset name changes
  - Trigger: Rename() method called successfully
  - Payload: AssetId, OldName, NewName, RenamedAt
  - Consumers: Search index update, audit log
</examples>

#### Relationships
<foreach {rel} IN {entity.relationships}>
- **{rel.type}** {rel.target}: {rel.description}
  - **Cardinality**: {rel.cardinality}
  - **Navigation**: {rel.navigation_property}
</foreach>
<examples>
- **Owns** User: Asset is owned by one user
  - Cardinality: Many-to-One (many assets per user)
  - Navigation: Owner property (navigates to User entity)

- **References** Resource: Asset may reference a display resource
  - Cardinality: Many-to-One optional (many assets may share one resource)
  - Navigation: Display property (nullable)
</examples>

</foreach>

---

## Value Objects

<foreach {vo} IN {value_objects}>
### {vo.name}

**Purpose**: {vo.purpose}

#### Properties
<foreach {prop} IN {vo.properties}>
- **{prop.name}**: {prop.type}
  - **Constraints**: {prop.constraints}
</foreach>
<examples>
- **Value**: AssetTypeEnum (enum: Character, Prop, Terrain, Effect)
  - Constraints: Must be valid enum value
</examples>

#### Creation & Validation
- **Factory Method**: {vo.factory_signature}
- **Validation Rules**:
  <foreach {rule} IN {vo.validation_rules}>
  - {rule}
  </foreach>
- **Immutability**: Yes (all value objects are immutable)
<examples>
- **Factory Method**: AssetType.From(string value) or AssetType.Character
- **Validation Rules**:
  - Value must be one of: Character, Prop, Terrain, Effect
  - Case-insensitive matching allowed
  - Throws ArgumentException if invalid
</examples>

#### Equality & Comparison
- **Equality**: Value-based (all properties must match)
- **Hash Code**: Based on all properties
- **Comparison**: {comparable_if_applicable}

#### Methods
<foreach {method} IN {vo.methods}>
- **{method.signature}**: {method.purpose}
</foreach>
<examples>
- **ToString()**: Returns string representation for display
- **Equals(AssetType other)**: Value equality comparison
- **GetHashCode()**: Hash based on Value property
</examples>

</foreach>

---

## Aggregates

<foreach {aggregate} IN {aggregates}>
### {aggregate.name} Aggregate

**Aggregate Root**: {aggregate.root_entity}

**Entities in Aggregate**:
<foreach {entity} IN {aggregate.entities}>
- {entity}: {entity.role_in_aggregate}
</foreach>

**Value Objects in Aggregate**:
<foreach {vo} IN {aggregate.value_objects}>
- {vo}: {vo.usage}
</foreach>

#### Boundary Definition
**What's Inside**:
- {what_entities_included}

**What's Outside** (Referenced, not contained):
- {what_entities_referenced}

**Boundary Rule**: {why_these_entities_group_together}

<examples>
**What's Inside**:
- Asset (root), AssetType (value object), AssetMetadata (child entity if any)

**What's Outside**:
- User (referenced via OwnerId)
- Resource (referenced via ResourceId)
- Scene (references Asset, not part of aggregate)

**Boundary Rule**: All data needed to create, update, or delete an asset template is within this aggregate. External references (User, Resource) are by ID only.
</examples>

#### Aggregate Invariants
<foreach {invariant} IN {aggregate.invariants}>
- **{invariant.id}**: {invariant.rule_across_entities}
</foreach>
<examples>
- **AGG-01**: Asset aggregate can only be modified by owner
- **AGG-02**: Deleting asset removes all child metadata
- **AGG-03**: Asset state changes are atomic (all or nothing)
</examples>

#### Lifecycle Management
- **Creation**: {creation_rules}
- **Modification**: {modification_rules}
- **Deletion**: {deletion_rules}
<examples>
- **Creation**: Via AssetFactory.Create(userId, name, type) - validates inputs, generates ID
- **Modification**: Only through aggregate root methods (Rename, Publish, etc.)
- **Deletion**: Soft delete with DeletedAt timestamp, check not in use first
</examples>

</foreach>

---

## Domain Services

<foreach {service} IN {domain_services}>
### {service.name}

**Purpose**: {service.purpose}

**When to Use**: {service.usage_guidance}

**Responsibilities**: {service.what_it_does}

#### Operations
<foreach {op} IN {service.operations}>
- **{op.signature}**: {op.description}
  - **Inputs**: {op.inputs}
  - **Outputs**: {op.outputs}
  - **Side Effects**: {op.side_effects}
</foreach>
<examples>
- **ValidateAssetOwnership(Asset asset, Guid userId)**: Checks if user owns or can access asset
  - Inputs: Asset entity, requesting user ID
  - Outputs: bool (true if owner or asset is public)
  - Side Effects: None (pure validation)

- **CalculateAssetUsageCount(Guid assetId)**: Counts how many scenes use this asset
  - Inputs: Asset ID
  - Outputs: int (usage count)
  - Side Effects: Queries scene repository (read-only)
</examples>

#### Dependencies
- **Required**: {service.dependencies}
- **Why Needed**: {service.dependency_rationale}
<examples>
- **Required**: ISceneRepository (to query asset usage)
- **Why Needed**: Asset usage spans Scene aggregate, needs repository access
</examples>

</foreach>

---

## Domain Rules Summary

<foreach {rule} IN {business_rules}>
- **{rule.id}** - {rule.category}: {rule.statement}
  - **Scope**: {rule.applies_to}
  - **Enforcement**: {rule.where_enforced}
  - **Validation**: {rule.validation_approach}
</foreach>
<examples>
- **BR-01** - Validation: Asset name must be unique per owner
  - Scope: Asset entity creation and rename
  - Enforcement: CreateAssetService checks for duplicates
  - Validation: Query repository before allowing name

- **BR-02** - Business Logic: Published assets cannot be made private
  - Scope: Asset visibility changes
  - Enforcement: MakePrivate() method throws if IsPublished true
  - Validation: Pre-condition check in method

- **BR-03** - Authorization: Only owner can delete unpublished assets
  - Scope: Asset deletion
  - Enforcement: DeleteAssetService checks ownership
  - Validation: Authorization check before delete operation
</examples>

---

## Architecture Integration

### Domain Layer Purity
This domain model is **dependency-free**:
- ✅ No infrastructure dependencies (no database, no external APIs)
- ✅ No framework dependencies (no ASP.NET, no React)
- ✅ Pure business logic only
- ✅ Testable in isolation

### Used By (Application Layer)
<foreach {usecase} IN {use_cases_using_this_domain}>
- **{usecase}**: Uses {entities_used}
</foreach>
<examples>
- **Create Asset**: Uses Asset entity, AssetType value object
- **Update Asset**: Uses Asset entity for modification
- **Clone Asset**: Uses Asset entity, creates new instance
- **Delete Asset**: Uses Asset entity, AssetBusinessRules service
</examples>

---

<!--
═══════════════════════════════════════════════════════════════
DOMAIN MODEL QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════

## Entities (30 points)
□ 10pts: All entities have complete attribute lists with types and constraints
□ 10pts: All entities have invariants clearly defined (enforced by services)
□ 5pts: All entity operations documented (even if implemented in services)
□ 5pts: Aggregate roots clearly identified

## Value Objects (20 points)
□ 10pts: All value objects have properties and validation rules
□ 5pts: Immutability and value equality documented
□ 5pts: Factory methods for creation defined

## Aggregates (25 points)
□ 10pts: Aggregate boundaries clearly defined
□ 10pts: Aggregate invariants across entities specified
□ 5pts: Lifecycle management rules documented

## Application Services (15 points)
□ 10pts: Service interfaces defined as contracts (in domain project)
□ 5pts: Operations documented with pre/post-conditions and invariants enforced
□ 5pts: Service dependencies and usage guidance clear

**NOTE**: Services contain business logic, entities are data contracts

## Ubiquitous Language (10 points)
□ 10pts: Complete domain terminology with definitions (10+ terms minimum)

## Target Score: 80/100 minimum

### Common Issues to Avoid:
❌ Entities with only names, no attributes
❌ Missing invariants (business rules not documented - even if enforced in services)
❌ Missing value objects (primitive obsession - using strings instead of typed concepts)
❌ Unclear aggregate boundaries
❌ Operations not documented (even if implemented in services, document what they do)
❌ External dependencies in domain contracts (database, HTTP types in interfaces)
❌ Missing service interface contracts (IEntityService must be in domain project)

✅ ACCEPTABLE in this architecture:
✅ Anemic entities (data contracts) - logic goes in services
✅ Immutable records with init-only properties
✅ Operations documented but implemented in application services
✅ Domain events optional (can be raised by services instead of entities)
-->
