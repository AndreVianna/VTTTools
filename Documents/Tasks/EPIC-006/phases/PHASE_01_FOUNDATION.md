# Phase 1: Foundation

**Status**: 📋 Planned
**Estimated**: 24-30h | **Actual**: TBD
**Completed**: TBD
**Grade**: TBD

---

## Objective

Create domain entities, base abstractions, and supporting enums for the new 2-category, 8-element-type encounter model

**Note**: Trap has been merged into Effect - a trap is just a "hazardous effect" with trigger capabilities.

---

## Prerequisites

- EPIC-001 complete (React 19 + Konva encounter editor functional)
- Current domain model documented and reviewed
- Understanding of DDD patterns (aggregate roots, entities, value objects)

---

## Deliverables

- **Entity**: EncounterElement (base record)
  - Description: Base abstraction for all encounter elements (EncounterId, Index, Name - NO timestamps)
  - Note: Uses dependent entity pattern (EncounterId, Index) composite key, not Guid Id
  - Note: No CreatedAt/UpdatedAt - use AuditLogs for tracking
  - Complexity: Low
  - Agent: backend-developer
  - Dependencies: None

- **Entity**: GameElement (abstract record)
  - Description: Base for elements with game mechanics (extends EncounterElement)
  - Complexity: Low
  - Agent: backend-developer
  - Dependencies: EncounterElement

- **Entity**: StructuralElement (abstract record)
  - Description: Base for passive environment elements (extends EncounterElement)
  - Complexity: Low
  - Agent: backend-developer
  - Dependencies: EncounterElement

- **Entity**: EncounterActor (record)
  - Description: Characters + Creatures with frames, asset reference
  - Note: Game-system agnostic - no HitPoints, StatBlocks (game mechanics in Asset.StatBlockEntries)
  - Complexity: Medium
  - Agent: backend-developer
  - Dependencies: GameElement

- **Entity**: EncounterProp (record)
  - Description: Interactive objects with state machine (no frames)
  - Note: Game-system agnostic - no LockDC, BreakDC (game mechanics in Asset.StatBlockEntries)
  - Complexity: Medium
  - Agent: backend-developer
  - Dependencies: GameElement

- **Entity**: EncounterEffect (record)
  - Description: Unified effect/trap with 4 visual resources, state machine, optional trigger
  - Note: Trap merged into Effect - no separate EncounterTrap entity
  - Note: Game-system agnostic - no damage, saves, duration (game mechanics in Asset.StatBlockEntries)
  - Complexity: Medium
  - Agent: backend-developer
  - Dependencies: GameElement

- **Entity**: EncounterDecoration (record)
  - Description: Unified visual media (images/sprites) with ResourceType enum
  - Complexity: Medium
  - Agent: backend-developer
  - Dependencies: StructuralElement

- **Entity**: EncounterAudio (record)
  - Description: Auditory media (global or positional)
  - Complexity: Low
  - Agent: backend-developer
  - Dependencies: StructuralElement

- **Enum**: ResourceType
  - Description: Decoration resource types (Image, Sprite)
  - Complexity: Low
  - Agent: backend-developer
  - Dependencies: None

- **Enum**: PropState
  - Description: Interactive object states (Closed, Open, Locked, Broken)
  - Complexity: Low
  - Agent: backend-developer
  - Dependencies: None

- **Enum**: EffectState
  - Description: Effect/trap states (Enabled, Disabled, Triggered)
  - Note: Replaces TrapState - Trap merged into Effect
  - Complexity: Low
  - Agent: backend-developer
  - Dependencies: None

- **Enum**: AssetKind (updated)
  - Description: Asset types (remove Effect/Object, add Prop/Decoration)
  - Complexity: Low
  - Agent: backend-developer
  - Dependencies: None

- **Value Object**: AnimationSettings
  - Description: Sprite animation configuration (frames, duration, loop)
  - Complexity: Low
  - Agent: backend-developer
  - Dependencies: None

**DELETED Value Objects (moved to game mechanics in Asset.StatBlockEntries):**
- ~~TriggerCondition~~ - Effect uses Shape? TriggerShape directly
- ~~EffectDuration~~ - Game duration mechanics belong in Asset.StatBlockEntries
- ~~VisualSettings~~ - Not needed, Effect has 4 resource references directly

---

## Implementation Sequence

1. **Base Abstractions** (Backend) - 4h
   - Create `EncounterElement` base record with common properties
     - `Guid EncounterId { get; init; }` (part of composite key)
     - `ushort Index { get; init; }` (part of composite key, dependent entity pattern)
     - `string Name { get; init; }`
     - **NO** `Guid Id` - uses composite key (EncounterId, Index)
     - **NO** `DateTime CreatedAt/UpdatedAt` - use AuditLogs for tracking
   - Create `GameElement` abstract record (extends EncounterElement)
   - Create `StructuralElement` abstract record (extends EncounterElement)
   - Add XML documentation for all properties
   - Agent: backend-developer
   - Dependencies: None

2. **Game Element Entities** (Backend) - 8h
   - Create `EncounterActor` record (extends GameElement)
     - Asset reference (AssetId)
     - Position, Rotation, Size
     - Frame properties (borderColor, backgroundColor, shadow)
     - Visibility settings (IsVisible)
     - **NO** HitPoints, StatBlock - game mechanics in Asset.StatBlockEntries
   - Create `EncounterProp` record (extends GameElement)
     - Asset reference (AssetId)
     - Position, Rotation, Size (NO frames)
     - PropState (Closed, Open, Locked, Broken)
     - **NO** LockDC, BreakDC, HitPoints - game mechanics in Asset.StatBlockEntries
   - Create `EncounterEffect` record (extends GameElement) - **UNIFIED EFFECT/TRAP**
     - Position, Rotation
     - Asset reference (AssetId)
     - EffectState (Enabled, Disabled, Triggered)
     - IsVisible (to players - always visible to DM)
     - AllowAutomaticTrigger (bool)
     - TriggerShape (Shape?, optional trigger region)
     - **4 Visual Resources:**
       - EnabledResourceId (Guid, Required)
       - DisabledResourceId (Guid?, Optional)
       - OnTriggerResourceId (Guid?, Optional - plays during trigger)
       - TriggeredResourceId (Guid?, Optional - persistent post-trigger visual)
     - **NO** Damage, SaveDC, Duration, Conditions - game mechanics in Asset.StatBlockEntries
   - **NO** EncounterTrap - merged into EncounterEffect
   - Add XML documentation for all properties
   - Agent: backend-developer
   - Dependencies: 1.1 complete

3. **Structural Element Entities** (Backend) - 6h
   - Create `EncounterDecoration` record (extends StructuralElement)
     - ResourceId (Guid - references image or sprite)
     - ResourceType enum (Image, Sprite)
     - Position, Rotation
     - DisplaySize (optional, null uses resource default)
     - Layer (ushort for z-index)
     - Opacity (float 0.0-1.0)
     - IsVisible (bool)
     - Animation settings (AnimationSettings value object, only for Sprite type)
   - Create `EncounterAudio` record (extends StructuralElement)
     - ResourceId (Guid - references audio file)
     - AudioType (Global, Positional)
     - Position (nullable, for positional audio)
     - Radius (nullable, for positional audio)
     - Volume (float 0.0-1.0)
     - Loop (bool)
     - IsPlaying (bool)
   - Update `EncounterWall`, `EncounterRegion`, `EncounterLight` to extend StructuralElement
   - Add XML documentation for all properties
   - Agent: backend-developer
   - Dependencies: 1.1 complete

4. **Supporting Enums** (Backend) - 3h
   - Create `ResourceType` enum
     ```csharp
     public enum ResourceType {
         Image,   // Static PNG/JPG texture
         Sprite   // Animated sprite sheet
         // Video excluded for MVP - reserved for future cutscene feature
     }
     ```
   - Create `PropState` enum
     ```csharp
     public enum PropState {
         Closed,  // Default state (door, chest)
         Open,    // Opened by player
         Locked,  // Requires key or DC to open
         Broken   // Destroyed/unusable
     }
     ```
   - Create `EffectState` enum (replaces TrapState - Trap merged into Effect)
     ```csharp
     public enum EffectState {
         Enabled,    // Ready to trigger (default state)
         Disabled,   // Manually disabled by DM
         Triggered   // Has been triggered (Reset returns to Enabled)
     }
     ```
   - Update `AssetKind` enum
     ```csharp
     public enum AssetKind {
         Character,   // PC/NPC with StatBlock
         Creature,    // Monster with StatBlock
         Prop,        // Interactive object (NEW - replaces Object)
         Decoration,  // Passive visual (NEW - replaces parts of Object)
         // Effect removed - encounter-specific, not asset library
         // Object removed - split into Prop/Decoration
         Wall,        // Barrier structure
         Region,      // Terrain/illumination area
         Light        // Light/vision source
     }
     ```
   - **DELETED**: `TrapState` enum - merged into EffectState
   - Add XML documentation for all enum values
   - Agent: backend-developer
   - Dependencies: None

5. **Value Objects** (Backend) - 3h
   - Create `AnimationSettings` record
     ```csharp
     public record AnimationSettings {
         public int FrameCount { get; init; }        // Total frames in sprite sheet
         public int FramesPerRow { get; init; }      // Grid layout
         public int FrameDuration { get; init; }     // Milliseconds per frame
         public bool Loop { get; init; } = true;
         public int StartFrame { get; init; } = 0;
         public int? EndFrame { get; init; }         // Null = use all frames
     }
     ```
   - **DELETED Value Objects** (game mechanics belong in Asset.StatBlockEntries):
     - ~~TriggerCondition~~ - Effect uses `Shape? TriggerShape` directly
     - ~~EffectDuration~~ - Game duration mechanics in Asset.StatBlockEntries
     - ~~VisualSettings~~ - Effect has 4 resource references directly
     - ~~TriggerType enum~~ - Not needed without TriggerCondition
     - ~~DurationType enum~~ - Not needed without EffectDuration
   - Add validation logic (e.g., FrameCount > 0)
   - Add XML documentation
   - Agent: backend-developer
   - Dependencies: 1.4 complete

6. **Unit Tests** (Backend) - 6h
   - Write tests for EncounterElement hierarchy (inheritance, properties)
   - Write tests for EncounterActor (validation, frame properties)
   - Write tests for EncounterProp (state transitions)
   - Write tests for EncounterEffect (state transitions, trigger shape, 4 resources)
   - Write tests for EncounterDecoration (ResourceType handling)
   - Write tests for EncounterAudio (positional vs global)
   - Write tests for value object validation (AnimationSettings)
   - Target: ≥80% code coverage
   - Agent: backend-developer
   - Dependencies: 1.1, 1.2, 1.3, 1.4, 1.5 complete

---

## Success Criteria

- ✅ All 8 element types compile without errors (Actor, Prop, Effect, Decoration, Audio, Wall, Region, Light)
- ✅ Base abstractions (EncounterElement, GameElement, StructuralElement) properly inherited
- ✅ Dependent entity pattern used (EncounterId, Index) composite key - no Guid Id
- ✅ No timestamps (CreatedAt/UpdatedAt) - use AuditLogs
- ✅ Game-system agnostic - no game-specific properties in entities
- ✅ All enums have XML documentation with clear descriptions
- ✅ Value objects validate input correctly (e.g., FrameCount > 0)
- ✅ Unit tests pass with ≥80% code coverage (10+ tests)
- ✅ Code review approved by code-reviewer agent (Grade A- or better)
- ✅ No breaking changes to existing Wall/Region/Light entities

---

## Dependencies

- **Prerequisites**: EPIC-001 complete (React 19 + Konva editor)
- **Blocks**: Phase 2 (Backend Infrastructure - needs entities to create tables)

---

## Validation

- **Validate after phase**:
  - Build solution successfully (0 errors, 0 warnings)
  - All unit tests passing (10+ tests)
  - Code review by code-reviewer agent
  - Verify XML documentation generated correctly

- **Quality gate**:
  - Grade A- or better required to proceed to Phase 2
  - All 9 element types must be fully defined with proper inheritance
  - No circular dependencies or design smells

---

## Review Checklist

- [ ] All domain entities use `record` types (immutable by default)
- [ ] All properties use `{ get; init; }` (immutable after construction)
- [ ] Dependent entity pattern used (EncounterId, Index) composite key, not Guid Id
- [ ] No timestamps (CreatedAt/UpdatedAt) in entities
- [ ] No game-specific properties (HitPoints, SaveDC, Duration, etc.)
- [ ] EncounterEffect has 4 resource references and state machine
- [ ] No separate EncounterTrap entity (merged into Effect)
- [ ] XML documentation includes `<summary>`, `<remarks>` where appropriate
- [ ] Enums have XML documentation for each value
- [ ] Value objects validate input (throw exceptions for invalid data)
- [ ] No code duplication between entities (common logic in base classes)
- [ ] Naming follows C# conventions (PascalCase for types, properties)
- [ ] No magic numbers or strings (use constants/enums)

---

## Related Documentation

- [CHANGELOG.md](../CHANGELOG.md) - Version history
- [Main Roadmap](../ROADMAP.md) - Overall progress
- [PRD Section 3](../PRD.md#3-domain-model-design) - Domain model specification

---

**Version**: 1.2
**Created**: 2025-12-28
**Last Updated**: 2025-12-28
