# Phase 2: Backend Infrastructure

**Status**: 📋 Planned
**Estimated**: 36-42h | **Actual**: TBD
**Completed**: TBD
**Grade**: TBD

---

## Objective

Create database schema, EF Core configuration, migrations, and repository implementations for 6 new tables

---

## Prerequisites

- Phase 1 complete (all domain entities exist and compile)
- EF Core infrastructure reviewed
- PostgreSQL database accessible

---

## Deliverables

- **Database Schema**: EncounterActors table
  - Description: Table for characters and creatures with frames
  - Complexity: Medium
  - Agent: backend-developer
  - Dependencies: Phase 1 (EncounterActor entity)

- **Database Schema**: EncounterProps table
  - Description: Table for interactive objects
  - Complexity: Medium
  - Agent: backend-developer
  - Dependencies: Phase 1 (EncounterProp entity)

- **Database Schema**: EncounterTraps table
  - Description: Table for triggered hazards
  - Complexity: Medium
  - Agent: backend-developer
  - Dependencies: Phase 1 (EncounterTrap entity)

- **Database Schema**: EncounterEffects table
  - Description: Table for spell zones and effects
  - Complexity: Medium
  - Agent: backend-developer
  - Dependencies: Phase 1 (EncounterEffect entity)

- **Database Schema**: EncounterDecorations table
  - Description: Table for unified visual media (images/sprites)
  - Complexity: Medium
  - Agent: backend-developer
  - Dependencies: Phase 1 (EncounterDecoration entity)

- **Database Schema**: EncounterAudios table
  - Description: Table for auditory media
  - Complexity: Low
  - Agent: backend-developer
  - Dependencies: Phase 1 (EncounterAudio entity)

- **EF Core Configuration**: Entity configurations
  - Description: Configure all 6 new entities (table mapping, indexes, relationships)
  - Complexity: High
  - Agent: backend-developer
  - Dependencies: Database schemas

- **Migrations**: EF Core migrations
  - Description: 3 migrations for phased rollout
  - Complexity: Medium
  - Agent: devops-specialist
  - Dependencies: EF Core configurations

- **Repository**: IEncounterStorage interface updates
  - Description: Add 40+ new async methods for CRUD operations
  - Complexity: Medium
  - Agent: backend-developer
  - Dependencies: Phase 1 entities

- **Repository**: EncounterStorage implementations
  - Description: Implement all 40+ new repository methods
  - Complexity: High
  - Agent: backend-developer
  - Dependencies: EF Core configurations

- **Schema Builders**: 6 schema builders
  - Description: Domain → data mapping (ActorSchemaBuilder, PropSchemaBuilder, etc.)
  - Complexity: Medium
  - Agent: backend-developer
  - Dependencies: EF Core configurations

---

## Implementation Sequence

1. **Database Schema Design** (Backend) - 8h
   - Design EncounterActors table schema
     - Columns: Id (PK), EncounterId (FK), Name, AssetId (FK), Position (JSON), Rotation, Size (JSON), CurrentHP, MaxHP, TempHP, StatBlockId (FK nullable), FrameSettings (JSON), IsVisible, VisibleToPlayers, Notes, CreatedAt, UpdatedAt
     - Indexes: [EncounterId, Id], [AssetId], [StatBlockId]
   - Design EncounterProps table schema
     - Columns: Id (PK), EncounterId (FK), Name, AssetId (FK), Position (JSON), Rotation, Size (JSON), PropState (enum), CanOpen, CanLock, RequiresKey, Notes, CreatedAt, UpdatedAt
     - Indexes: [EncounterId, Id], [AssetId], [PropState]
   - Design EncounterTraps table schema
     - Columns: Id (PK), EncounterId (FK), Name, Position (JSON), TriggerArea (JSON), TrapState (enum), TriggerCondition (JSON), DamageFormula, DamageType, SaveDC, SaveAbility, IsVisible, VisibleToPlayers, Notes, CreatedAt, UpdatedAt
     - Indexes: [EncounterId, Id], [TrapState]
   - Design EncounterEffects table schema
     - Columns: Id (PK), EncounterId (FK), Name, Position (JSON), AOE (JSON), Duration (JSON), Conditions (JSON), Color, Opacity, Notes, CreatedAt, UpdatedAt
     - Indexes: [EncounterId, Id]
   - Design EncounterDecorations table schema
     - Columns: Id (PK), EncounterId (FK), Name, ResourceId (FK), ResourceType (enum), Position (JSON), Rotation, DisplaySize (JSON nullable), Layer, Opacity, IsVisible, AnimationSettings (JSON nullable), Notes, CreatedAt, UpdatedAt
     - Indexes: [EncounterId, Id], [ResourceId], [Layer]
   - Design EncounterAudios table schema
     - Columns: Id (PK), EncounterId (FK), Name, ResourceId (FK), AudioType (enum), Position (JSON nullable), Radius (float nullable), Volume, Loop, IsPlaying, Notes, CreatedAt, UpdatedAt
     - Indexes: [EncounterId, Id], [ResourceId]
   - Agent: backend-developer
   - Dependencies: Phase 1 complete

2. **EF Core Entity Configuration** (Backend) - 10h
   - Configure EncounterActor entity
     ```csharp
     builder.ToTable("EncounterActors");
     builder.HasKey(e => e.Id);
     builder.Property(e => e.Name).IsRequired().HasMaxLength(200);
     builder.Property(e => e.Position).HasConversion(...); // JSON
     builder.Property(e => e.Size).HasConversion(...); // JSON
     builder.Property(e => e.FrameSettings).HasConversion(...); // JSON
     builder.HasOne<Encounter>().WithMany(e => e.Actors).HasForeignKey(e => e.EncounterId);
     builder.HasIndex(e => new { e.EncounterId, e.Id });
     ```
   - Configure EncounterProp entity (similar structure)
   - Configure EncounterTrap entity (with JSON converters for TriggerArea, TriggerCondition)
   - Configure EncounterEffect entity (with JSON converters for AOE, Duration, Conditions)
   - Configure EncounterDecoration entity (with ResourceType enum conversion)
   - Configure EncounterAudio entity (with AudioType enum conversion)
   - Add JSON converters for complex types (Position, Size, AnimationSettings, etc.)
   - Agent: backend-developer
   - Dependencies: 2.1 complete

3. **EF Core Migrations** (DevOps) - 6h
   - Create migration: `20250128_AddActorsPropsTrapsEffects`
     ```bash
     dotnet ef migrations add AddActorsPropsTrapsEffects --project Source/Infrastructure
     ```
     - Creates EncounterActors, EncounterProps, EncounterTraps, EncounterEffects tables
   - Create migration: `20250128_AddDecorationsAudio`
     ```bash
     dotnet ef migrations add AddDecorationsAudio --project Source/Infrastructure
     ```
     - Creates EncounterDecorations, EncounterAudios tables
   - Create migration: `20250128_UpdateAssetKindEnum`
     ```bash
     dotnet ef migrations add UpdateAssetKindEnum --project Source/Infrastructure
     ```
     - Updates AssetKind enum values (adds Prop, Decoration; removes Effect, Object)
   - Test migrations on local database
     ```bash
     dotnet ef database update --project Source/Infrastructure
     ```
   - Verify all tables created with correct schema
   - Agent: devops-specialist
   - Dependencies: 2.2 complete

4. **Repository Interface Updates** (Backend) - 4h
   - Update `IEncounterStorage` interface
   - Add methods for Actors:
     ```csharp
     Task<IEnumerable<EncounterActor>> GetActorsAsync(Guid encounterId);
     Task<EncounterActor?> GetActorAsync(Guid encounterId, Guid actorId);
     Task<EncounterActor> AddActorAsync(EncounterActor actor);
     Task<EncounterActor> UpdateActorAsync(EncounterActor actor);
     Task RemoveActorAsync(Guid encounterId, Guid actorId);
     ```
   - Add equivalent methods for Props (5 methods)
   - Add equivalent methods for Traps (5 methods)
   - Add equivalent methods for Effects (5 methods)
   - Add equivalent methods for Decorations (5 methods)
   - Add equivalent methods for Audio (5 methods)
   - Total: 30 new methods
   - Agent: backend-developer
   - Dependencies: Phase 1 complete

5. **Repository Implementations - Actors** (Backend) - 3h
   - Implement `GetActorsAsync(Guid encounterId)`
     ```csharp
     return await _context.EncounterActors
         .Where(a => a.EncounterId == encounterId)
         .OrderBy(a => a.Name)
         .ToListAsync();
     ```
   - Implement `GetActorAsync(Guid encounterId, Guid actorId)`
   - Implement `AddActorAsync(EncounterActor actor)`
   - Implement `UpdateActorAsync(EncounterActor actor)`
   - Implement `RemoveActorAsync(Guid encounterId, Guid actorId)`
   - Add error handling (entity not found, concurrency conflicts)
   - Agent: backend-developer
   - Dependencies: 2.2, 2.4 complete

6. **Repository Implementations - Props/Traps/Effects** (Backend) - 9h
   - Implement 5 methods for Props (Get, List, Add, Update, Remove) - 3h
   - Implement 5 methods for Traps - 3h
   - Implement 5 methods for Effects - 3h
   - Add error handling and validation
   - Agent: backend-developer
   - Dependencies: 2.2, 2.4 complete

7. **Repository Implementations - Decorations/Audio** (Backend) - 6h
   - Implement 5 methods for Decorations - 3h
     - Special handling for ResourceType enum
     - Layer ordering support
   - Implement 5 methods for Audio - 3h
     - Special handling for AudioType enum (Global vs Positional)
   - Add error handling and validation
   - Agent: backend-developer
   - Dependencies: 2.2, 2.4 complete

8. **Schema Builders** (Backend) - 6h
   - Create `ActorSchemaBuilder` class
     ```csharp
     public static ActorSchema ToSchema(EncounterActor actor) {
         return new ActorSchema {
             Id = actor.Id,
             EncounterId = actor.EncounterId,
             Name = actor.Name,
             AssetId = actor.AssetId,
             Position = JsonSerializer.Serialize(actor.Position),
             // ... map all properties
         };
     }

     public static EncounterActor ToDomain(ActorSchema schema) {
         return new EncounterActor {
             Id = schema.Id,
             EncounterId = schema.EncounterId,
             Name = schema.Name,
             AssetId = schema.AssetId,
             Position = JsonSerializer.Deserialize<Position>(schema.Position),
             // ... map all properties
         };
     }
     ```
   - Create `PropSchemaBuilder` (similar structure) - 1h
   - Create `TrapSchemaBuilder` - 1h
   - Create `EffectSchemaBuilder` - 1h
   - Create `DecorationSchemaBuilder` - 1h
   - Create `AudioSchemaBuilder` - 1h
   - Agent: backend-developer
   - Dependencies: 2.2 complete

9. **Unit Tests** (Backend) - 6h
   - Write tests for repository CRUD operations (30+ tests)
     - Test GetActorsAsync returns all actors for encounter
     - Test GetActorAsync returns null when not found
     - Test AddActorAsync creates new record
     - Test UpdateActorAsync modifies existing record
     - Test RemoveActorAsync deletes record
     - Repeat for Props, Traps, Effects, Decorations, Audio
   - Write tests for schema builders (12+ tests)
     - Test ToSchema correctly maps all properties
     - Test ToDomain correctly deserializes JSON
     - Test round-trip conversion (domain → schema → domain)
   - Use in-memory database for testing
   - Target: ≥80% code coverage
   - Agent: backend-developer
   - Dependencies: 2.5, 2.6, 2.7, 2.8 complete

---

## Success Criteria

- ✅ All 6 new tables created successfully in database
- ✅ Migrations apply without errors (forward and rollback)
- ✅ All repository methods compile without errors
- ✅ Database indexes optimized (query plan analysis shows index usage)
- ✅ Unit tests pass with ≥80% code coverage (30+ tests)
- ✅ Code review approved by code-reviewer agent (Grade A- or better)
- ✅ Schema review approved by devops-specialist
- ✅ No breaking changes to existing Encounter table

---

## Dependencies

- **Prerequisites**: Phase 1 complete (all domain entities exist)
- **Blocks**: Phase 3 (Service Layer - needs repositories)

---

## Validation

- **Validate after phase**:
  - Run all migrations successfully on local database
  - Verify all tables exist with correct schema (use PostgreSQL Management Studio)
  - Run unit tests (30+ tests passing)
  - Code review by code-reviewer agent
  - Database schema review by devops-specialist

- **Quality gate**:
  - Grade A- or better required to proceed to Phase 3
  - All migrations must be reversible (down migrations work)
  - All indexes must be properly defined (query plan analysis)

---

## Review Checklist

- [ ] All table names follow naming convention (PascalCase, plural)
- [ ] All foreign keys have indexes
- [ ] All JSON columns use appropriate converters
- [ ] All enum columns use string conversion (not int)
- [ ] All migrations have descriptive names and comments
- [ ] All repository methods follow async/await pattern
- [ ] All repository methods handle errors gracefully
- [ ] Schema builders handle null values correctly
- [ ] No N+1 query problems (use eager loading where needed)

---

## Related Documentation

- [CHANGELOG.md](../CHANGELOG.md) - Version history
- [Main Roadmap](../ROADMAP.md) - Overall progress
- [PRD Section 4](../PRD.md#4-data-model-design) - Database schema specification

---

**Version**: 1.0
**Created**: 2025-12-28
**Last Updated**: 2025-12-28
