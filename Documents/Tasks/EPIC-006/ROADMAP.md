# EPIC-006: Encounter Domain Model Refactoring - Implementation Roadmap

**Target Type**: Epic (System)
**Target Item**: EPIC-006
**Item Specification**: Documents/Tasks/EPIC-006/TASK.md
**Created**: 2025-12-28
**Last Updated**: 2025-12-28
**Version**: 1.1.0

---

## Implementation Approach (v1.1.0 - Simplified)

**CRITICAL**: This roadmap has been updated to reflect the **simplified direct replacement approach** agreed upon during the planning session.

### Key Changes from Original Plan

| Aspect | Original (v1.0.0) | Simplified (v1.1.0) |
|--------|-------------------|---------------------|
| API Strategy | V1/V2 parallel, 6-month deprecation | Direct replacement, no versioning |
| Data Migration | Complex 4-phase with rollback | Simple DROP/CREATE (no production data) |
| Entity Approach | Additive (keep old, add new) | Direct replacement (DELETE old, CREATE new) |
| DB Migrations | Claude executes | User executes manually |

### Execution Workflow

```
[Phases 1-4] Backend Implementation
    |
    +-- Phase 1: Domain entities (direct replacement)
    +-- Phase 2: Database schema (EF Core config, NO migration execution)
    +-- Phase 3: Service layer (update existing, not V2)
    +-- Phase 4: Command pattern
    |
    v
[PAUSE - USER ACTION REQUIRED]
    |
    +-- User runs: dotnet ef migrations add EncounterDomainRefactoring
    +-- User runs: dotnet ef database update
    +-- User confirms: Migration successful
    |
    v
[Phases 5-9] Frontend Implementation
    |
    +-- Phase 5: TypeScript types
    +-- Phase 6: Rendering components
    +-- Phase 7: UI panels
    +-- Phase 8: Encounter editor
    +-- Phase 9: Asset library updates
```

### Critical Constraints

1. **Claude does NOT execute database migrations** - User is responsible
2. **Each phase must leave codebase compilable** - No broken intermediate states
3. **Tests must pass at phase boundaries** - Continuous functionality
4. **Direct replacement strategy** - Delete old entities, create new ones

---

## Quick Navigation

- **Phase Details**: [phases/](./phases/) - Detailed documentation for all phases
- **Task Specification**: [TASK.md](./TASK.md) - Full EPIC specification
- **PRD**: [PRD.md](./PRD.md) - Complete Product Requirements Document (62 pages)

---

## Roadmap Overview

**Objective**: Refactor VTTTools encounter domain model from 2-tier classification (EncounterAsset, EncounterSound) to perception-based 2-category, 8-element-type system (Game Elements, Structural Elements), with Stage extraction as a first-class library entity.

**Key Architecture Change (v1.2)**: Stage is extracted as a library entity. Structural elements (Walls, Regions, Lights, Decorations, Sounds) move to Stage. Game elements (Actors, Props, Effects) remain on Encounter. Encounters reference Stage via FK.

**Scope**: Complete domain refactoring with Stage extraction, database schema update, and frontend UI updates (no API versioning, no data migration)

**Total Phases**: 9 active phases (Phases 10-12 simplified or removed)

**Estimated Effort**: Significantly reduced from original 180-220h estimate

**Progress**: 🔄 IN PROGRESS

---

## Phase Overview

| # | Phase | Status | Est. Hours | Agent Focus | Details |
|---|-------|--------|------------|-------------|---------|
| 1 | Foundation | 🔄 In Progress | 24-30h | Backend | [PHASE_01_FOUNDATION.md](./phases/PHASE_01_FOUNDATION.md) |
| 2 | Backend Infrastructure | 📋 Planned | 36-42h | Backend | [PHASE_02_BACKEND_INFRASTRUCTURE.md](./phases/PHASE_02_BACKEND_INFRASTRUCTURE.md) |
| 3 | Service Layer | 📋 Planned | 30-36h | Backend | [PHASE_03_SERVICE_LAYER.md](./phases/PHASE_03_SERVICE_LAYER.md) |
| 4 | Command Pattern | 📋 Planned | 24-30h | Backend | [PHASE_04_COMMAND_PATTERN.md](./phases/PHASE_04_COMMAND_PATTERN.md) |
| -- | **USER PAUSE** | -- | -- | User | Apply DB migration manually |
| 5 | Frontend Types | 📋 Planned | 18-24h | Frontend | [PHASE_05_FRONTEND_TYPES.md](./phases/PHASE_05_FRONTEND_TYPES.md) |
| 6 | Rendering Components | 📋 Planned | 30-36h | Frontend | [PHASE_06_RENDERING_COMPONENTS.md](./phases/PHASE_06_RENDERING_COMPONENTS.md) |
| 7 | UI Panels | 📋 Planned | 36-42h | Frontend + UX | [PHASE_07_UI_PANELS.md](./phases/PHASE_07_UI_PANELS.md) |
| 8 | Encounter Editor | 📋 Planned | 48-54h | Frontend | [PHASE_08_ENCOUNTER_EDITOR.md](./phases/PHASE_08_ENCOUNTER_EDITOR.md) |
| 9 | Asset Library Updates | 📋 Planned | 18-24h | Frontend | [PHASE_09_ASSET_LIBRARY.md](./phases/PHASE_09_ASSET_LIBRARY.md) |
| 10 | ~~Database Migration~~ | ⏭️ Simplified | -- | -- | User handles migration after Phase 4 |
| 11 | Testing & QA | 📋 Planned | Reduced | Test Automation | Integrated into phases |
| 12 | Documentation | 📋 Planned | Reduced | Solution Engineer | No V1/V2 migration guide needed |

**Legend**: 📋 Planned | 🔄 In Progress | ✅ Complete | ⏭️ Simplified/Removed

**Total Hours**: Reduced (no V1/V2 parallel maintenance, no data migration complexity)

---

## Design Principles

### Perception-Based Architecture

**Core Insight**: Categories based on **semantic behavior** (game mechanics vs environment), NOT file formats or implementation details.

**Two Semantic Categories:**

| Category | Location | Element Types |
|----------|----------|---------------|
| **Game Elements** | Encounter | Actor, Prop, Effect |
| **Structural Elements** | Stage | Wall, Region, Light, Decoration, Audio |

**Note**: Trap has been merged into Effect - a trap is just a "hazardous effect". Effect now has a state machine (Enabled, Disabled, Triggered) and 4 visual resources for different states.

**Stage Extraction (ADR-010):**
- Stage is a first-class library entity (like World, Campaign, Adventure)
- Structural elements define the map/environment and live on Stage
- Game elements define the gameplay scenario and live on Encounter
- Encounters reference a Stage via FK (StageId)
- Same Stage can be reused across multiple Encounters
- Current `Stage` value object renamed to `StageSettings`

**Why "Stage" instead of "Map":**
- Already exists in codebase as embedded value object
- Theater metaphor is consistent: Stage + Actors + Props + Effects
- No naming collisions (Map clashes with TypeScript `Map<K,V>` and Mapper terminology)
- Not a verb - unambiguous in code

**Key Architectural Decisions:**
1. **Visual media unified** - Images, sprites, videos are all "pixels on the map." File format is implementation detail.
2. **Audio separate** - Different perception mechanism (ears vs eyes), different UI controls.
3. **Trap merged into Effect** - A trap is just a "hazardous effect". Effect handles visual states and optional trigger areas.
4. **Game-system agnostic** - No game-specific properties (damage, saves, etc.) in encounter elements. Game mechanics live in Asset.StatBlockEntries.
5. **Props and Decorations have NO frames** - Blend seamlessly with map (ONLY Actors have frames).
6. **Stage/Encounter separation** - Structural elements on Stage, Game elements on Encounter.

---

## Key Deliverables

### Domain Model Changes (Direct Replacement)

**New First-Class Entity:**
- `Stage` - Library entity with structural elements (Walls, Regions, Lights, Decorations, Audios)
  - OwnerId, Name, Description, IsPublished, IsPublic
  - Settings (StageSettings - renamed from Stage value object)
  - Grid, Resources[]

**New Game Element Entities (3) - On Encounter:**
- `EncounterActor` - Characters + Creatures (with frames, asset reference) - REPLACES part of EncounterAsset
- `EncounterProp` - Interactive objects (no frames, state machine) - REPLACES part of EncounterAsset
- `EncounterEffect` - Unified effect/trap (4 visual resources, state machine, optional trigger) - NEW

**New Structural Element Entities (2) - On Stage:**
- `StageDecoration` - Unified visual media (images/sprites, ResourceType enum) - NEW
- `StageAudio` - Auditory media (global or positional) - REPLACES EncounterSound

**Note**: Trap is merged into Effect - a trap is just a "hazardous effect" with trigger capabilities.

**Modified Entities:**
- `Encounter` - Gets StageId FK, 3 game element collections (Actors, Props, Effects), Resources[]
- `AssetKind` enum - Remove Effect/Object, add Prop/Decoration
- `Stage` value object - Renamed to `StageSettings` to avoid collision

**Deleted Entities (2) - Direct removal, no data preservation:**
- `EncounterAsset` - DELETE (replaced by Actor/Prop)
- `EncounterSound` - DELETE (replaced by StageAudio)

### Database Changes (User-Managed Migration)

**New Tables:**
- Stages (first-class library entity)
- StageWalls, StageRegions, StageLights (structural elements on Stage)
- StageDecorations, StageAudios (structural elements on Stage)
- EncounterActors, EncounterProps, EncounterEffects (game elements on Encounter)

**Schema Changes:**
- Encounter gets StageId FK column
- Stage value object columns → StageSettings (renamed)

**Dropped Tables (2):**
- EncounterAssets (no data to preserve)
- EncounterSounds (no data to preserve)

**Migration Execution (USER RESPONSIBILITY):**
```bash
# After Phase 4 completion, user runs:
dotnet ef migrations add EncounterDomainRefactoring --project Source/Data
dotnet ef database update --project Source/Data
```

### API Changes (Direct Replacement - No V2 Versioning)

**New Stage Endpoints:**
- `/api/stages` (GET, POST) - Stage library management
- `/api/stages/{id}` (GET, PUT, DELETE)
- `/api/stages/{id}/walls` (GET, POST, PUT, DELETE)
- `/api/stages/{id}/regions` (GET, POST, PUT, DELETE)
- `/api/stages/{id}/lights` (GET, POST, PUT, DELETE)
- `/api/stages/{id}/decorations` (GET, POST, PUT, DELETE)
- `/api/stages/{id}/audio` (GET, POST, PUT, DELETE)

**Updated Encounter Endpoints:**
- `/api/encounters/{id}/actors` (GET, POST, PUT, DELETE)
- `/api/encounters/{id}/props` (GET, POST, PUT, DELETE)
- `/api/encounters/{id}/effects` (GET, POST, PUT, DELETE) - unified effects/traps

**No Deprecation Needed:**
- No V1 endpoints to maintain
- No deprecation headers
- No migration guide for API consumers (not in production)

### Frontend Changes

**Editors:**
- Stage Editor - For structural elements (Walls, Regions, Lights, Decorations, Audio)
- Encounter Editor - For game elements (Actors, Props, Effects) with Stage selection

**UI Panels (8 element panels):**

**Game Elements (3 panels - Encounter Editor):**
- Actors Panel
- Props Panel
- Effects Panel (unified - covers both effects and traps)

**Structural Elements (5 panels - Stage Editor):**
- Walls Panel (unchanged)
- Regions Panel (unchanged)
- Lights Panel (unchanged)
- Decorations Panel (unified image/sprite browser)
- Audio Panel

**Key UX Changes:**
- Stage selector in Encounter Editor (pick which Stage to use)
- Unified decoration browser with [Images] [Sprites] tabs
- Conditional frame rendering (ONLY Actors have frames)
- Props and Decorations blend seamlessly with map (no frames)
- Same Stage reusable across multiple Encounters

---

## Phase 1: Foundation (24-30h)

**Objective**: Create domain entities, base abstractions, and supporting enums (including Stage extraction)

**Agent**: backend-developer

**Prerequisites**:
- EPIC-001 complete (React 19 + Konva encounter editor functional)
- Current domain model documented

**Deliverables**:

### 1.1 Stage Entity (Backend) - 6h
- Create `Stage` record (first-class library entity)
  - Id, OwnerId, Name, Description, IsPublished, IsPublic
  - Settings (StageSettings - renamed from Stage value object)
  - Grid, Resources[]
- Rename existing `Stage` value object to `StageSettings`
- Dependencies: None

### 1.2 Base Abstractions (Backend) - 4h
- Create `EncounterElement` base record (EncounterId, Index, Name - NO timestamps)
- Create `StageElement` base record (StageId, Index, Name - for structural elements)
- Create `GameElement` abstract record (extends EncounterElement)
- Create `StructuralElement` abstract record (extends StageElement)
- Note: Uses dependent entity pattern (ParentId, Index) composite key, not Guid Id
- Note: No CreatedAt/UpdatedAt - use AuditLogs for that
- Dependencies: 1.1 complete

### 1.3 Game Element Entities (Backend) - 8h
- Create `EncounterActor` record (GameElement with frames, asset reference)
- Create `EncounterProp` record (GameElement with state machine)
- Create `EncounterEffect` record (GameElement with 4 resources, state machine, optional trigger)
- Note: Trap merged into Effect - no separate EncounterTrap entity
- Note: Game-system agnostic - no HitPoints, SaveDC, etc. (game mechanics in Asset.StatBlockEntries)
- Dependencies: 1.2 complete

### 1.4 Structural Element Entities (Backend) - 6h
- Create `StageDecoration` record (StructuralElement with ResourceType enum)
- Create `StageAudio` record (StructuralElement with audio properties)
- Move existing Wall, Region, Light to Stage (StageWall, StageRegion, StageLight)
- Dependencies: 1.2 complete

### 1.5 Supporting Enums (Backend) - 3h
- Create `ResourceType` enum (Image, Sprite)
- Create `PropState` enum (Closed, Open, Locked, Broken)
- Create `EffectState` enum (Enabled, Disabled, Triggered)
- Update `AssetKind` enum (remove Effect/Object, add Prop/Decoration)
- Note: No TrapState - Trap merged into Effect, using EffectState
- Dependencies: None

### 1.6 Value Objects (Backend) - 3h
- Create `AnimationSettings` record (for sprite animations)
- Note: No TriggerCondition - Effect uses Shape? TriggerShape directly
- Note: No EffectDuration - game duration mechanics in Asset.StatBlockEntries
- Dependencies: 1.5 complete

**Success Criteria**:
- ✅ Stage entity compiles and has all required properties
- ✅ All 8 element types compile without errors (3 Game + 5 Structural)
- ✅ Base abstractions properly inherited (StageElement, EncounterElement)
- ✅ All enums have XML documentation
- ✅ Unit tests for value object validation (10+ tests)

**Validation**:
- Code review by code-reviewer agent
- Grade: Must achieve A- or better to proceed

**Blocks**: Phase 2 (Backend Infrastructure)

**Phase File**: [phases/PHASE_01_FOUNDATION.md](./phases/PHASE_01_FOUNDATION.md)

---

## Phase 2: Backend Infrastructure (36-42h)

**Objective**: Create database schema, EF Core configuration, repositories (including Stage)

**Agent**: backend-developer + devops-specialist

**Prerequisites**:
- Phase 1 complete (all domain entities exist)

**Deliverables**:

### 2.1 Stage Database Schema (Backend) - 6h
- Create Stages table schema (library entity)
- Create StageWalls, StageRegions, StageLights table schemas
- Create StageDecorations table schema (with ResourceType column)
- Create StageAudios table schema
- Add StageId FK to Encounters table
- Rename Stage value object columns to StageSettings
- Dependencies: Phase 1 complete

### 2.2 Encounter Element Database Schema (Backend) - 6h
- Create EncounterActors table schema
- Create EncounterProps table schema
- Create EncounterEffects table schema (unified - 4 resources, state, trigger)
- Note: No EncounterTraps table - Trap merged into EncounterEffects
- Dependencies: Phase 1 complete

### 2.3 EF Core Entity Configuration (Backend) - 10h
- Configure Stage entity (table mapping, indexes, relationships)
- Configure Stage structural elements (Walls, Regions, Lights, Decorations, Audios)
- Configure EncounterActor, EncounterProp, EncounterEffect entities
- Configure Encounter → Stage FK relationship
- Dependencies: 2.1, 2.2 complete

### 2.4 EF Core Migrations (DevOps) - 6h
- Create migration: AddStagesTable
- Create migration: AddStageStructuralElements
- Create migration: AddEncounterGameElements
- Create migration: AddEncounterStageIdFK
- Test migrations on local database
- Dependencies: 2.3 complete

### 2.5 Repository Interfaces (Backend) - 6h
- Create IStageStorage interface (Stage CRUD + structural elements)
- Update IEncounterStorage interface (game elements only)
- Dependencies: Phase 1 complete

### 2.6 Repository Implementations (Backend) - 10h
- Implement StageStorage (Stage + all structural elements)
- Implement EncounterStorage updates (Actors, Props, Effects)
- Dependencies: 2.3, 2.5 complete

### 2.7 Schema Builders (Backend) - 6h
- Create StageSchemaBuilder
- Create structural element schema builders (Wall, Region, Light, Decoration, Audio)
- Create game element schema builders (Actor, Prop, Effect)
- Dependencies: 2.3 complete

**Success Criteria**:
- ✅ Stage table and all structural element tables created successfully
- ✅ Encounter game element tables created successfully
- ✅ Encounter → Stage FK relationship working
- ✅ Migrations apply without errors
- ✅ All repository methods compile
- ✅ Database indexes optimized (query plan analysis)
- ✅ Unit tests for repository CRUD operations (30+ tests)

**Validation**:
- Code review by code-reviewer agent
- Database schema review by devops-specialist
- Grade: Must achieve A- or better to proceed

**Blocks**: Phase 3 (Service Layer)

**Phase File**: [phases/PHASE_02_BACKEND_INFRASTRUCTURE.md](./phases/PHASE_02_BACKEND_INFRASTRUCTURE.md)

---

## Phase 3: Service Layer (30-36h)

**Objective**: Implement service methods, API contracts, controllers

**Agent**: backend-developer

**Prerequisites**:
- Phase 2 complete (database and repositories ready)

**Deliverables**:

### 3.1 Service Interface Updates (Backend) - 4h
- Update IEncounterService interface (40+ new methods)
- Add async methods for Actors (Get, List, Add, Update, Remove)
- Add async methods for Props, Traps, Effects, Decorations, Audio
- Dependencies: Phase 2 complete

### 3.2 Service Implementations - Actors (Backend) - 6h
- Implement GetActorAsync(encounterId, actorId)
- Implement ListActorsAsync(encounterId, filter)
- Implement AddActorAsync(encounterId, request)
- Implement UpdateActorAsync(encounterId, actorId, request)
- Implement RemoveActorAsync(encounterId, actorId)
- Dependencies: 3.1 complete

### 3.3 Service Implementations - Props/Traps/Effects (Backend) - 12h
- Implement 5 methods for Props (Get, List, Add, Update, Remove)
- Implement 5 methods for Traps
- Implement 5 methods for Effects
- Dependencies: 3.1 complete

### 3.4 Service Implementations - Decorations/Audio (Backend) - 8h
- Implement 5 methods for Decorations (with ResourceType handling)
- Implement 5 methods for Audio
- Dependencies: 3.1 complete

### 3.5 API Contracts (Backend) - 6h
- Create request DTOs (AddActorRequest, UpdateActorRequest, etc.) - 18 classes
- Create response DTOs (ActorResponse, PropResponse, etc.) - 6 classes
- Add validation attributes (Required, Range, MaxLength)
- Dependencies: Phase 1 complete

### 3.6 API Controllers (Backend) - 8h
- Create ActorsController (6 endpoints: GET list, GET single, POST, PUT, DELETE, PATCH)
- Create PropsController, TrapsController, EffectsController (18 endpoints)
- Create DecorationsController, AudioController (12 endpoints)
- Dependencies: 3.2, 3.3, 3.4, 3.5 complete

**Success Criteria**:
- ✅ All 40+ service methods implemented
- ✅ All 36 API endpoints functional
- ✅ Request/response DTOs validated
- ✅ Swagger documentation generated
- ✅ Unit tests for service layer (60+ tests)
- ✅ Integration tests for API endpoints (36+ tests)

**Validation**:
- Code review by code-reviewer agent
- Security review (OWASP compliance check)
- Grade: Must achieve A- or better to proceed

**Blocks**: Phase 4 (Command Pattern)

**Phase File**: [phases/PHASE_03_SERVICE_LAYER.md](./phases/PHASE_03_SERVICE_LAYER.md)

---

## Phase 4: Command Pattern (24-30h)

**Objective**: Create command classes with undo/redo support

**Agent**: backend-developer

**Prerequisites**:
- Phase 3 complete (service layer functional)
- Existing command infrastructure reviewed

**Deliverables**:

### 4.1 Command Infrastructure Review (Backend) - 2h
- Review existing ICommand interface
- Review CommandManager implementation
- Document command serialization pattern
- Dependencies: None

### 4.2 Actor Commands (Backend) - 6h
- Create AddActorCommand (execute, undo, serialize)
- Create UpdateActorCommand
- Create RemoveActorCommand
- Create MoveActorCommand
- Dependencies: Phase 3 complete

### 4.3 Prop Commands (Backend) - 5h
- Create AddPropCommand, UpdatePropCommand, RemovePropCommand
- Create MovePropCommand
- Create ChangePropStateCommand (for state machine)
- Dependencies: Phase 3 complete

### 4.4 Trap Commands (Backend) - 5h
- Create AddTrapCommand, UpdateTrapCommand, RemoveTrapCommand
- Create MoveTrapCommand
- Create TriggerTrapCommand (changes state to Triggered)
- Dependencies: Phase 3 complete

### 4.5 Effect Commands (Backend) - 5h
- Create AddEffectCommand, UpdateEffectCommand, RemoveEffectCommand
- Create MoveEffectCommand
- Create ExpireEffectCommand (when duration expires)
- Dependencies: Phase 3 complete

### 4.6 Decoration/Audio Commands (Backend) - 6h
- Create AddDecorationCommand, UpdateDecorationCommand, RemoveDecorationCommand
- Create MoveDecorationCommand
- Create AddAudioCommand, UpdateAudioCommand, RemoveAudioCommand
- Dependencies: Phase 3 complete

### 4.7 Command Manager Integration (Backend) - 3h
- Register all 40+ new commands with CommandManager
- Test undo/redo for each command type
- Test command serialization for persistence
- Dependencies: 4.2-4.6 complete

**Success Criteria**:
- ✅ All 40+ commands implement ICommand interface
- ✅ Execute() performs action and returns success
- ✅ Undo() reverses action completely
- ✅ Serialize() returns JSON representation
- ✅ Undo/redo works for all element types
- ✅ Unit tests for all commands (80+ tests)

**Validation**:
- Code review by code-reviewer agent
- Undo/redo testing by test-automation-developer
- Grade: Must achieve A- or better to proceed

**Blocks**: Phase 8 (Encounter Editor integration)

**Phase File**: [phases/PHASE_04_COMMAND_PATTERN.md](./phases/PHASE_04_COMMAND_PATTERN.md)

---

## Phase 5: Frontend Types (18-24h)

**Objective**: Create TypeScript interfaces and RTK Query API definitions

**Agent**: frontend-developer

**Prerequisites**:
- Phase 3 complete (API contracts finalized)
- Phase 1 complete (domain model defined)

**Deliverables**:

### 5.1 Domain Type Definitions (Frontend) - 6h
- Create `EncounterActor` TypeScript interface
- Create `EncounterProp` interface
- Create `EncounterTrap` interface
- Create `EncounterEffect` interface
- Create `EncounterDecoration` interface (with ResourceType enum)
- Create `EncounterAudio` interface
- Dependencies: Phase 1 complete (match backend entities)

### 5.2 Enum Definitions (Frontend) - 2h
- Create `ResourceType` enum (Image, Sprite)
- Create `PropState` enum
- Create `TrapState` enum
- Update `AssetKind` enum (remove Effect/Object, add Prop/Decoration)
- Dependencies: None

### 5.3 Request/Response Types (Frontend) - 4h
- Create request types (AddActorRequest, UpdateActorRequest, etc.) - 18 types
- Create response types (ActorResponse, PropResponse, etc.) - 6 types
- Ensure exact match with backend API contracts
- Dependencies: Phase 3 complete

### 5.4 RTK Query API Slice - Actors (Frontend) - 3h
- Create `actorsApi` slice with endpoints:
  - `getActors` (GET /api/v2/encounters/{id}/actors)
  - `getActor` (GET /api/v2/encounters/{id}/actors/{actorId})
  - `addActor` (POST)
  - `updateActor` (PUT)
  - `removeActor` (DELETE)
- Dependencies: 5.1, 5.3 complete

### 5.5 RTK Query API Slices - Other Elements (Frontend) - 9h
- Create `propsApi` slice (5 endpoints)
- Create `trapsApi` slice (5 endpoints)
- Create `effectsApi` slice (5 endpoints)
- Create `decorationsApi` slice (5 endpoints)
- Create `audioApi` slice (5 endpoints)
- Dependencies: 5.1, 5.3 complete

### 5.6 Type Guards and Utilities (Frontend) - 2h
- Create type guard functions (isActor, isProp, isTrap, etc.)
- Create utility functions (getElementType, hasFrames, isGameElement)
- Dependencies: 5.1 complete

**Success Criteria**:
- ✅ All TypeScript types match backend entities exactly
- ✅ All 30 RTK Query endpoints defined
- ✅ Type guards compile without errors
- ✅ No TypeScript errors in strict mode
- ✅ Unit tests for type guards (15+ tests)

**Validation**:
- Code review by code-reviewer agent
- Type safety verification by frontend-developer
- Grade: Must achieve A- or better to proceed

**Blocks**: Phase 6 (Rendering Components)

**Phase File**: [phases/PHASE_05_FRONTEND_TYPES.md](./phases/PHASE_05_FRONTEND_TYPES.md)

---

## Phase 6: Rendering Components (30-36h)

**Objective**: Create Konva rendering components for 9 element types

**Agent**: frontend-developer + ux-designer

**Prerequisites**:
- Phase 5 complete (TypeScript types defined)
- Existing Konva rendering reviewed

**Deliverables**:

### 6.1 Rendering Infrastructure Review (Frontend) - 2h
- Review existing Konva layer system (9 layers)
- Review rendering patterns from EPIC-001
- Document conditional frame logic requirements
- Dependencies: None

### 6.2 Actor Renderer (Frontend) - 6h
- Create `ActorRenderer` component (extends Group)
- Implement frame rendering (border, background, shadow)
- Implement token image rendering
- Implement HP bar rendering
- Implement selection highlight
- Dependencies: Phase 5 complete

### 6.3 Prop Renderer (Frontend) - 5h
- Create `PropRenderer` component (NO frames, blends with map)
- Implement state indicator (visual badge for Closed/Open/Locked/Broken)
- Implement selection highlight (dotted border)
- Dependencies: Phase 5 complete

### 6.4 Trap Renderer (Frontend) - 5h
- Create `TrapRenderer` component
- Implement trigger area visualization (dashed circle/polygon)
- Implement state indicator (Armed/Triggered/Disabled badge)
- Implement visibility toggle (GM-only vs player-visible)
- Dependencies: Phase 5 complete

### 6.5 Effect Renderer (Frontend) - 5h
- Create `EffectRenderer` component
- Implement AOE visualization (circle/cone/sphere with opacity)
- Implement duration indicator (countdown timer)
- Implement condition icons
- Dependencies: Phase 5 complete

### 6.6 Decoration Renderer (Frontend) - 4h
- Create `DecorationRenderer` component (NO frames, blends seamlessly)
- Implement ResourceType handling (Image vs Sprite)
- Implement animation playback (for Sprite type)
- Implement layer/z-index rendering
- Dependencies: Phase 5 complete

### 6.7 Audio Renderer (Frontend) - 3h
- Create `AudioRenderer` component (visual icon on map)
- Implement positional audio indicator (speaker icon + radius)
- Implement global audio indicator (different icon, no radius)
- Dependencies: Phase 5 complete

### 6.8 Renderer Integration (Frontend + UX) - 6h
- Integrate all 9 renderers into EncounterCanvas
- Implement conditional rendering based on element type
- Implement z-index management (layers)
- UX review for visual consistency
- Dependencies: 6.2-6.7 complete

**Success Criteria**:
- ✅ All 9 element types render correctly
- ✅ ONLY Actors have frames (Props/Decorations blend seamlessly)
- ✅ Selection highlights work for all types
- ✅ State indicators visible and clear
- ✅ Rendering performance: 60 FPS with 100+ elements
- ✅ Visual consistency across all renderers (UX approval)

**Validation**:
- Code review by code-reviewer agent
- UX review by ux-designer agent
- Performance testing by test-automation-developer
- Grade: Must achieve A- or better to proceed

**Blocks**: Phase 7 (UI Panels), Phase 8 (Encounter Editor)

**Phase File**: [phases/PHASE_06_RENDERING_COMPONENTS.md](./phases/PHASE_06_RENDERING_COMPONENTS.md)

---

## Phase 7: UI Panels (36-42h)

**Objective**: Create 9 UI panels for element management

**Agent**: frontend-developer + ux-designer

**Prerequisites**:
- Phase 5 complete (RTK Query API ready)
- Phase 6 complete (renderers ready for preview)

**Deliverables**:

### 7.1 Panel Infrastructure (Frontend) - 4h
- Review existing panel system from EPIC-001
- Create base `ElementPanel` component (reusable accordion panel)
- Create base `PropertyEditor` component
- Dependencies: None

### 7.2 Actors Panel (Frontend + UX) - 6h
- Create `ActorsPanel` component (list view with drag-to-add)
- Create `ActorPropertyEditor` (HP, AC, StatBlock, frames)
- Implement filtering/search
- UX review for usability
- Dependencies: Phase 5, 7.1 complete

### 7.3 Props Panel (Frontend + UX) - 5h
- Create `PropsPanel` component
- Create `PropPropertyEditor` (state machine, interactive properties)
- Implement filtering by PropState
- UX review
- Dependencies: Phase 5, 7.1 complete

### 7.4 Traps Panel (Frontend + UX) - 5h
- Create `TrapsPanel` component
- Create `TrapPropertyEditor` (trigger, damage, save DC, state)
- Implement filtering by TrapState
- UX review
- Dependencies: Phase 5, 7.1 complete

### 7.5 Effects Panel (Frontend + UX) - 5h
- Create `EffectsPanel` component
- Create `EffectPropertyEditor` (duration, AOE, conditions)
- Implement filtering by active/expired
- UX review
- Dependencies: Phase 5, 7.1 complete

### 7.6 Decorations Panel (Frontend + UX) - 6h
- Create `DecorationsPanel` component with unified browser
- Implement [📷 Images] [✨ Sprites] tab switcher
- Create `DecorationPropertyEditor` (ResourceType, layer, opacity, animation)
- UX review for unified experience
- Dependencies: Phase 5, 7.1 complete

### 7.7 Audio Panel (Frontend + UX) - 5h
- Create `AudioPanel` component
- Create `AudioPropertyEditor` (positional vs global, volume, loop)
- Implement audio preview playback
- UX review
- Dependencies: Phase 5, 7.1 complete

### 7.8 Panel Organization (UX) - 4h
- Organize panels with category headers (Game Elements, Structural Elements)
- Implement collapsible sections
- Add panel icons (👥 📦 ⚡ ✨ 🧱 📐 💡 🌳 🔊)
- UX final review
- Dependencies: 7.2-7.7 complete

**Success Criteria**:
- ✅ All 9 panels functional
- ✅ Property editors validate input
- ✅ Filtering/search works in all panels
- ✅ Drag-to-add from panels to canvas works
- ✅ Unified decoration browser approved by UX
- ✅ Category organization clear and intuitive
- ✅ Unit tests for panel components (45+ tests)

**Validation**:
- Code review by code-reviewer agent
- UX review by ux-designer agent
- Usability testing by test-automation-developer
- Grade: Must achieve A- or better to proceed

**Blocks**: Phase 8 (Encounter Editor integration)

**Phase File**: [phases/PHASE_07_UI_PANELS.md](./phases/PHASE_07_UI_PANELS.md)

---

## Phase 8: Encounter Editor (48-54h)

**Objective**: Integrate panels, update Konva layers, context menus

**Agent**: frontend-developer

**Prerequisites**:
- Phase 4 complete (commands ready)
- Phase 6 complete (renderers ready)
- Phase 7 complete (panels ready)

**Deliverables**:

### 8.1 Panel Integration (Frontend) - 8h
- Integrate 9 panels into EncounterEditorPage
- Update panel layout (collapsible sidebar)
- Implement panel switching/visibility toggles
- Dependencies: Phase 7 complete

### 8.2 Konva Layer Management (Frontend) - 12h
- Update layer system for 9 element types (15 total layers including grid/background)
- Implement z-index management (Decorations have layer property)
- Implement layer visibility toggles
- Test rendering order (background → decorations → walls → actors → fog)
- Dependencies: Phase 6 complete

### 8.3 Drag-and-Drop - Actors/Props (Frontend) - 8h
- Implement drag from ActorsPanel to canvas
- Implement drag from PropsPanel to canvas
- Implement smart positioning (snap to grid)
- Implement AddActorCommand/AddPropCommand integration
- Dependencies: Phase 4, 7.2, 7.3 complete

### 8.4 Drag-and-Drop - Other Elements (Frontend) - 10h
- Implement drag for Traps, Effects (8h)
- Implement drag for Decorations, Audio (2h)
- Test all drag-and-drop interactions
- Dependencies: Phase 4, 7.4-7.7 complete

### 8.5 Context Menus (Frontend) - 10h
- Create ActorContextMenu (Edit, Delete, Duplicate, Change HP)
- Create PropContextMenu (Edit, Delete, Change State)
- Create TrapContextMenu (Edit, Delete, Trigger, Disable)
- Create EffectContextMenu (Edit, Delete, Expire)
- Create DecorationContextMenu (Edit, Delete, Change Layer)
- Dependencies: Phase 4 complete

### 8.6 Selection and Transformation (Frontend) - 8h
- Update multi-selection for all element types
- Update transform handles (move, rotate for Actors/Props/Decorations)
- Update UpdateCommand integration for all types
- Test Ctrl+click, marquee selection
- Dependencies: Phase 4 complete

### 8.7 Keyboard Shortcuts (Frontend) - 4h
- Update Delete key handler (all element types)
- Update Ctrl+Z/Y (undo/redo with new commands)
- Update Ctrl+C/V (copy/paste for all types)
- Test all shortcuts
- Dependencies: Phase 4 complete

**Success Criteria**:
- ✅ All 9 panels integrated and functional
- ✅ Drag-and-drop works for all element types
- ✅ Context menus appropriate for each type
- ✅ Multi-selection works with mixed element types
- ✅ Undo/redo works for all operations
- ✅ Keyboard shortcuts work consistently
- ✅ No performance degradation (60 FPS with 100+ elements)
- ✅ Integration tests for all workflows (20+ tests)

**Validation**:
- Code review by code-reviewer agent
- Integration testing by test-automation-developer
- E2E testing for critical workflows
- Grade: Must achieve A- or better to proceed

**Blocks**: Phase 10 (Database Migration - need functional UI for testing)

**Phase File**: [phases/PHASE_08_ENCOUNTER_EDITOR.md](./phases/PHASE_08_ENCOUNTER_EDITOR.md)

---

## Phase 9: Asset Library Updates (18-24h)

**Objective**: Update AssetKind enum, bulk generation, unified resource browser

**Agent**: frontend-developer + backend-developer

**Prerequisites**:
- Phase 3 complete (backend updated)
- Phase 5 complete (frontend types updated)

**Deliverables**:

### 9.1 AssetKind Enum Migration (Backend) - 6h
- Update AssetKind enum (remove Effect, Object; add Prop, Decoration)
- Create database migration for AssetKind column
- Migrate existing assets (Object → Prop/Decoration based on rules)
- Test migration on sample data
- Dependencies: Phase 1 complete

### 9.2 Bulk Asset Generation Updates (Frontend) - 6h
- Update BulkGenerationForm to support Prop and Decoration types
- Update AI prompt templates for Props
- Update AI prompt templates for Decorations
- Test bulk generation for new types
- Dependencies: 9.1 complete

### 9.3 Unified Resource Browser (Frontend) - 8h
- Update AssetLibraryPage to support ResourceType filtering
- Implement unified decoration browser (images + sprites together)
- Update asset preview dialog for Decorations
- Implement ResourceType indicator in asset cards
- Dependencies: Phase 5 complete

### 9.4 Asset Quick Summon Updates (Frontend) - 4h
- Update Quick Summon feature to support all 9 element types
- Update quick summon UI to show element type
- Test quick summon with Props, Decorations
- Dependencies: Phase 8 complete

**Success Criteria**:
- ✅ AssetKind enum migrated successfully
- ✅ Existing assets categorized correctly (Object → Prop/Decoration)
- ✅ Bulk generation works for Props and Decorations
- ✅ Unified decoration browser approved by UX
- ✅ Quick Summon works with all element types
- ✅ Unit tests for migration logic (10+ tests)

**Validation**:
- Code review by code-reviewer agent
- Data migration validation by devops-specialist
- UX review by ux-designer
- Grade: Must achieve A- or better to proceed

**Blocks**: None (can run in parallel with Phase 8)

**Phase File**: [phases/PHASE_09_ASSET_LIBRARY.md](./phases/PHASE_09_ASSET_LIBRARY.md)

---

## Phase 10: Database Migration (24-30h)

**Objective**: Execute 4-phase migration strategy with rollback capability

**Agent**: devops-specialist + backend-developer

**Prerequisites**:
- Phase 2 complete (new schema ready)
- Phase 8 complete (UI functional for testing)
- Phase 9 complete (AssetKind migrated)

**Deliverables**:

### 10.1 Migration Script Development (DevOps) - 8h
- Create Phase 1 script: Create new tables (Actors, Props, Traps, Effects, Decorations, Audio)
- Create Phase 2 script: Migrate EncounterAssets → Actors/Props
- Create Phase 3 script: Migrate EncounterSounds → Audio
- Create Phase 4 script: Drop old tables (EncounterAssets, EncounterSounds)
- Dependencies: Phase 2 complete

### 10.2 Rollback Script Development (DevOps) - 6h
- Create rollback script for each phase (4 scripts)
- Test rollback on sample data
- Document rollback procedure
- Dependencies: 10.1 complete

### 10.3 Data Integrity Validation (Backend) - 6h
- Create validation queries (row counts, foreign key integrity)
- Create data comparison scripts (old vs new tables)
- Create validation report generator
- Dependencies: 10.1 complete

### 10.4 Staging Environment Testing (DevOps) - 8h
- Execute migration on staging database (dry run)
- Run validation scripts
- Test UI with migrated data
- Test rollback procedure
- Document results
- Dependencies: 10.1, 10.2, 10.3, Phase 8 complete

### 10.5 Performance Testing (DevOps) - 6h
- Test migration performance (target: < 1 hour for 1M encounters)
- Test query performance (P95 < 200ms)
- Optimize indexes if needed
- Dependencies: 10.4 complete

**Success Criteria**:
- ✅ Migration scripts execute without errors
- ✅ Zero data loss (all encounters preserved)
- ✅ Data integrity validation passes 100%
- ✅ Migration completes < 1 hour for 1M encounters
- ✅ Rollback procedure tested and documented
- ✅ All API endpoints respond < 200ms (P95)
- ✅ Old tables preserved for 6 months (not dropped immediately)

**Validation**:
- Code review by code-reviewer agent
- Security review (SQL injection check)
- Performance review by devops-specialist
- Grade: Must achieve A- or better to proceed

**Blocks**: Phase 11 (Testing requires migrated data)

**Phase File**: [phases/PHASE_10_DATABASE_MIGRATION.md](./phases/PHASE_10_DATABASE_MIGRATION.md)

---

## Phase 11: Testing & QA (48-60h)

**Objective**: Comprehensive testing (unit, integration, E2E, migration)

**Agent**: test-automation-developer + backend-developer + frontend-developer

**Prerequisites**:
- Phase 10 complete (migration executed)
- All phases 1-9 complete (all code ready)

**Deliverables**:

### 11.1 Backend Unit Tests (Backend) - 12h
- Write unit tests for all domain entities (validation, business logic) - 30 tests
- Write unit tests for all service methods (60+ tests)
- Write unit tests for all commands (80+ tests)
- Target: ≥80% code coverage
- Dependencies: Phases 1, 3, 4 complete

### 11.2 Backend Integration Tests (Backend) - 10h
- Write integration tests for all API endpoints (36+ tests)
- Write integration tests for database operations (CRUD)
- Write integration tests for command execution
- Dependencies: Phases 2, 3, 4 complete

### 11.3 Frontend Unit Tests (Frontend) - 12h
- Write unit tests for all renderers (9 components, 45+ tests)
- Write unit tests for all panels (9 components, 45+ tests)
- Write unit tests for type guards and utilities (15+ tests)
- Target: ≥70% code coverage
- Dependencies: Phases 5, 6, 7 complete

### 11.4 Frontend Integration Tests (Frontend) - 10h
- Write integration tests for RTK Query API slices (30+ tests)
- Write integration tests for drag-and-drop workflows
- Write integration tests for undo/redo
- Dependencies: Phases 5, 8 complete

### 11.5 E2E Test Scenarios (Test Automation) - 14h
- Write E2E test: Create encounter with all 9 element types
- Write E2E test: Edit and update each element type
- Write E2E test: Undo/redo operations
- Write E2E test: Multi-selection and bulk operations
- Write E2E test: Drag-and-drop from all panels
- Write E2E test: Context menus and shortcuts
- Write E2E test: Unified decoration browser
- Write E2E test: Asset library filtering by new AssetKind values
- Dependencies: Phase 8 complete

### 11.6 Migration Testing (DevOps + Test Automation) - 8h
- Test migration with various data scenarios (empty, small, large encounters)
- Test rollback procedure
- Test data integrity validation
- Test performance with production-like data volume
- Dependencies: Phase 10 complete

### 11.7 Cross-Browser Testing (Test Automation) - 6h
- Test on Chrome (latest)
- Test on Firefox (latest)
- Test on Safari (latest)
- Test on Edge (latest)
- Dependencies: Phase 8 complete

**Success Criteria**:
- ✅ Code coverage ≥80% backend, ≥70% frontend
- ✅ All unit tests passing (180+ backend, 105+ frontend)
- ✅ All integration tests passing (46+ backend, 30+ frontend)
- ✅ All E2E test scenarios passing (20+ workflows)
- ✅ Migration tests passing (zero data loss)
- ✅ Cross-browser compatibility verified (4 browsers)
- ✅ Zero P0 bugs, < 5 P1 bugs
- ✅ Performance targets met (60 FPS, < 200ms API)

**Validation**:
- Test report review by code-reviewer agent
- Coverage report review
- Performance report review
- Grade: Must achieve A- or better to proceed

**Blocks**: Phase 12 (Documentation)

**Phase File**: [phases/PHASE_11_TESTING_QA.md](./phases/PHASE_11_TESTING_QA.md)

---

## Phase 12: Documentation (12-18h)

**Objective**: Create API docs, user guides, video tutorials, migration guide

**Agent**: solution-engineer + frontend-developer

**Prerequisites**:
- Phase 11 complete (all features tested and working)

**Deliverables**:

### 12.1 API Documentation (Backend + Solution Engineer) - 4h
- Generate Swagger/OpenAPI documentation for all V2 endpoints
- Add endpoint descriptions and examples
- Document request/response schemas
- Document error codes and responses
- Dependencies: Phase 3 complete

### 12.2 Migration Guide (Solution Engineer + DevOps) - 4h
- Write migration guide for V1 → V2 API transition
- Document breaking changes
- Provide code examples for common patterns
- Document deprecation timeline
- Dependencies: Phase 10 complete

### 12.3 User Guides (Solution Engineer + Frontend) - 6h
- Write user guide: Working with Actors (frames, HP, StatBlocks)
- Write user guide: Working with Props (state machine, interactive objects)
- Write user guide: Working with Traps (triggers, damage, saves)
- Write user guide: Working with Effects (duration, AOE, conditions)
- Write user guide: Unified Decoration Browser (images + sprites)
- Write user guide: Audio Elements (positional vs global)
- Dependencies: Phase 8 complete

### 12.4 Video Tutorials (Solution Engineer) - 6h
- Record tutorial: Overview of new element types (5 min)
- Record tutorial: Creating an encounter with all 9 types (10 min)
- Record tutorial: Using the unified decoration browser (5 min)
- Record tutorial: Advanced features (traps, effects, state management) (10 min)
- Dependencies: Phase 8 complete

### 12.5 Architecture Documentation (Solution Engineer) - 3h
- Update architecture diagrams (domain model, database schema)
- Document design decisions (ADRs)
- Update ROADMAP.md with actual hours and lessons learned
- Dependencies: All phases complete

**Success Criteria**:
- ✅ Swagger documentation complete and accessible
- ✅ Migration guide covers all breaking changes
- ✅ User guides cover all 9 element types
- ✅ Video tutorials clear and professional
- ✅ Architecture docs updated
- ✅ No documentation gaps or inconsistencies

**Validation**:
- Documentation review by solution-engineer
- Technical accuracy review by backend-developer and frontend-developer
- Usability review by ux-designer
- Grade: Must achieve A- or better for EPIC completion

**Blocks**: None (EPIC complete after this phase)

**Phase File**: [phases/PHASE_12_DOCUMENTATION.md](./phases/PHASE_12_DOCUMENTATION.md)

---

## Review Gates

Each phase requires:
1. **Code Review** - All code changes reviewed by code-reviewer agent
2. **Testing** - Unit/integration tests passing with required coverage
3. **Security Review** - OWASP compliance check for new endpoints (Phases 3, 10)
4. **UX Review** - UI changes reviewed for usability (Phases 6, 7, 8)
5. **Grade** - A-F grade assigned based on criteria
6. **Approval** - Explicit approval to proceed to next phase

**No phase can begin until previous phase is graded A- or better.**

---

## Rollback Strategy (Simplified)

**NOTE**: With the direct replacement approach and no production data, rollback is significantly simpler.

### Any Phase (Git-Based Rollback)
- Revert code changes via git
- User drops new tables and recreates old schema if needed
- No data to preserve or migrate back

### No Complex Rollback Needed
- No V1/V2 parallel to maintain
- No data migration rollback scripts
- No 6-month deprecation timeline
- Simple git revert + schema reset if needed

---

## Dependency Graph

```text
Phase 1 (Foundation) [24-30h]
    ↓
    ├─→ Phase 2 (Backend Infrastructure) [36-42h]
    │       ↓
    │       └─→ Phase 3 (Service Layer) [30-36h]
    │               ↓
    │               ├─→ Phase 4 (Command Pattern) [24-30h]
    │               │       ↓
    │               │       └─→ Phase 8 (Encounter Editor) [48-54h]
    │               │               ↓
    │               │               └─→ Phase 10 (Database Migration) [24-30h]
    │               │                       ↓
    │               │                       └─→ Phase 11 (Testing & QA) [48-60h]
    │               │                               ↓
    │               │                               └─→ Phase 12 (Documentation) [12-18h]
    │               │
    │               └─→ Phase 5 (Frontend Types) [18-24h]
    │                       ↓
    │                       ├─→ Phase 6 (Rendering Components) [30-36h]
    │                       │       ↓
    │                       │       └─→ Phase 7 (UI Panels) [36-42h]
    │                       │               ↓
    │                       │               └─→ Phase 8 (Encounter Editor) [CONVERGES]
    │                       │
    │                       └─→ Phase 9 (Asset Library Updates) [18-24h] [PARALLEL]
    │
    └─→ Phase 9 (Asset Library Updates) [18-24h] [PARALLEL with Phases 5-8]
```

**Critical Path** (Sequential - ~180-220h total):
- Phase 1 → Phase 2 → Phase 3 → Phase 4 + Phase 5 → Phase 6 → Phase 7 → Phase 8 → Phase 10 → Phase 11 → Phase 12

**Parallel Opportunities**:
- Phase 9 can start after Phase 1 and run in parallel with Phases 5-8
- Phase 5 can start immediately after Phase 3 (in parallel with Phase 4)

---

## Risk Mitigation (Updated for Simplified Approach)

### High-Priority Risks

**Risk T1: ~~Data Loss During Migration~~ ELIMINATED**
- **Status**: No longer applicable - system not in production, no data to preserve
- **Original Mitigation**: Was complex backup/rollback strategy
- **New Approach**: Simple DROP/CREATE with no data migration

**Risk P1: Scope Creep (HIGH)**
- **Mitigation**: Strict PRD scope, change request process, feature freeze after Phase 8
- **Contingency**: Move nice-to-have features to future EPIC
- **Owner**: solution-engineer

**Risk T2: Performance Degradation (MEDIUM)**
- **Mitigation**: Database indexing, query optimization, lazy loading
- **Contingency**: Optimize queries, add indexes
- **Owner**: backend-developer

**Risk T3: ~~Breaking Changes in API~~ ELIMINATED**
- **Status**: No longer applicable - no V1 API to break, no external consumers
- **Original Mitigation**: Was V2 versioning + deprecation timeline
- **New Approach**: Direct replacement with no backward compatibility concerns

**Risk T4: User Forgets Migration Step (NEW - MEDIUM)**
- **Mitigation**: Clear PAUSE instructions, checklist in documentation
- **Contingency**: Runtime error messages will indicate missing tables
- **Owner**: User (with Claude guidance)

---

## Success Metrics

### Technical Success

**Backend Performance:**
- All API endpoints respond < 200ms (P95)
- Database migration completes < 1 hour
- Zero data loss during migration
- Code coverage ≥80% (backend)
- Zero SQL injection vulnerabilities

**Frontend Performance:**
- Code coverage ≥70% (frontend)
- Encounter loading time < 2 seconds (100 elements)
- Canvas rendering at 60 FPS
- Bundle size increase < 15%
- Lighthouse score ≥90

**Quality Metrics:**
- Zero P0 bugs in production (first 30 days)
- < 5 P1 bugs in production (first 30 days)
- All E2E test scenarios passing
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

### User Experience Success

**Usability:**
- Users can create encounters 20% faster (timed task)
- < 3% user error rate when adding elements
- System Usability Scale (SUS) score > 75
- Task completion rate > 95%

**Adoption:**
- 90% of active users migrated within 30 days
- < 5% support tickets related to new UI
- Average session time unchanged or improved
- Feature usage telemetry shows all panels used

**Satisfaction:**
- Net Promoter Score (NPS) unchanged or improved
- In-app feedback rating ≥4.0/5.0
- < 1% users request V1 UI rollback
- Positive sentiment in user forums

### Business Success

**Delivery:**
- Project completed within 18-20 weeks (+2 week buffer allowed)
- Budget variance < 10%
- All Phase 1-12 deliverables completed
- Zero missed regulatory/compliance requirements

**Operational:**
- Zero unplanned downtime
- Maintenance window < 4 hours
- Rollback not required
- Customer churn rate unchanged

---

## Timeline

**Total Duration**: 18-20 weeks (with 2-week buffer)

**Milestones:**
- Week 3: Phase 1 complete (Domain model)
- Week 6: Phase 2 complete (Database)
- Week 9: Phase 3-4 complete (Services + Commands)
- Week 13: Phase 5-7 complete (Frontend core)
- Week 17: Phase 8-9 complete (UI integration)
- Week 19: Phase 10-11 complete (Migration + Testing)
- Week 20: Phase 12 complete (Documentation), EPIC complete

---

## Agent Assignments

| Agent | Phases | Total Hours | Primary Responsibilities |
|-------|--------|-------------|--------------------------|
| backend-developer | 1, 2, 3, 4, 9, 11 | ~120-150h | Domain model, database, services, commands, testing |
| devops-specialist | 2, 10, 11 | ~40-50h | Database schema, migrations, performance testing |
| frontend-developer | 5, 6, 7, 8, 9, 11, 12 | ~100-130h | Types, renderers, panels, integration, testing |
| ux-designer | 6, 7, 9 | ~20-30h | Visual design, usability review, unified browser |
| test-automation-developer | 11 | ~30-40h | E2E tests, cross-browser testing, migration testing |
| solution-engineer | 12 | ~12-18h | Documentation, architecture, migration guide |
| code-reviewer | ALL | ~20-30h | Code review, security review, quality gates |

**Total**: ~342-448h (includes reviews, coordination overhead)

---

## Related Documentation

- **PRD**: [PRD.md](./PRD.md) - Complete specification (62 pages)
- **Task Specification**: [TASK.md](./TASK.md) - Detailed task with acceptance criteria
- **README**: [README.md](./README.md) - Quick reference guide
- **Phase Files**: [phases/](./phases/) - Individual phase specifications

---

**Version**: 1.3.0
**Created**: 2025-12-28
**Last Updated**: 2025-12-28
**Status**: In Progress
**Key Changes**:
- Stage extraction as first-class library entity (ADR-010)
- Structural elements moved to Stage, Game elements remain on Encounter
- Trap + Effect unified model
**Implementation Approach**: Direct replacement - no V1/V2 versioning, user-managed migrations
