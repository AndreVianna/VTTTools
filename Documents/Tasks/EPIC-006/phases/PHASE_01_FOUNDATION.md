# Phase 1: Foundation

**Status**: 📋 Planned
**Estimated**: 24-30h | **Actual**: TBD
**Completed**: TBD
**Grade**: TBD

---

## Objective

Create domain entities, base abstractions, and supporting enums for the new 2-category, 9-element-type encounter model

---

## Prerequisites

- EPIC-001 complete (React 19 + Konva encounter editor functional)
- Current domain model documented and reviewed
- Understanding of DDD patterns (aggregate roots, entities, value objects)

---

## Deliverables

- **Entity**: EncounterElement (base record)
  - Description: Base abstraction for all encounter elements (Id, EncounterId, Name, timestamps)
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
  - Description: Characters + Creatures with frames, StatBlocks, HP tracking
  - Complexity: High
  - Agent: backend-developer
  - Dependencies: GameElement

- **Entity**: EncounterProp (record)
  - Description: Interactive objects with state machine (no frames)
  - Complexity: Medium
  - Agent: backend-developer
  - Dependencies: GameElement

- **Entity**: EncounterTrap (record)
  - Description: Triggered hazards with damage, saves, trigger conditions
  - Complexity: Medium
  - Agent: backend-developer
  - Dependencies: GameElement

- **Entity**: EncounterEffect (record)
  - Description: Spell zones with duration, AOE, conditions
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

- **Enum**: TrapState
  - Description: Trap states (Armed, Triggered, Disabled, Reset)
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

- **Value Object**: TriggerCondition
  - Description: Trap trigger conditions (proximity, interaction, timed)
  - Complexity: Low
  - Agent: backend-developer
  - Dependencies: None

- **Value Object**: EffectDuration
  - Description: Effect duration tracking (rounds, minutes, hours, permanent)
  - Complexity: Low
  - Agent: backend-developer
  - Dependencies: None

---

## Implementation Sequence

1. **Base Abstractions** (Backend) - 4h
   - Create `EncounterElement` base record with common properties
     - `Guid Id { get; init; }`
     - `Guid EncounterId { get; init; }`
     - `string Name { get; init; }`
     - `DateTime CreatedAt { get; init; }`
     - `DateTime UpdatedAt { get; init; }`
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
     - StatBlock reference (optional)
     - HP tracking (CurrentHP, MaxHP, TempHP)
     - Visibility settings (IsVisible, VisibleToPlayers)
     - Notes field
   - Create `EncounterProp` record (extends GameElement)
     - Asset reference (AssetId)
     - Position, Rotation, Size (NO frames)
     - PropState (Closed, Open, Locked, Broken)
     - Interactive properties (CanOpen, CanLock, RequiresKey)
     - Notes field
   - Create `EncounterTrap` record (extends GameElement)
     - Position, trigger area (shape: circle/polygon)
     - TrapState (Armed, Triggered, Disabled, Reset)
     - Trigger condition (TriggerCondition value object)
     - Damage (dice formula: "2d6", damage type: "fire")
     - Save DC (DC value, ability: "Dexterity")
     - Visibility (IsVisible to GM, VisibleToPlayers)
     - Notes field
   - Create `EncounterEffect` record (extends GameElement)
     - Position, AOE (shape: circle/cone/sphere, radius)
     - EffectDuration (value object)
     - Conditions (list of condition names: "Poisoned", "Slowed")
     - Visual settings (color, opacity)
     - Notes field
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
     - Notes field
   - Create `EncounterAudio` record (extends StructuralElement)
     - ResourceId (Guid - references audio file)
     - AudioType (Global, Positional)
     - Position (nullable, for positional audio)
     - Radius (nullable, for positional audio)
     - Volume (float 0.0-1.0)
     - Loop (bool)
     - IsPlaying (bool)
     - Notes field
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
   - Create `TrapState` enum
     ```csharp
     public enum TrapState {
         Armed,      // Ready to trigger
         Triggered,  // Has been triggered
         Disabled,   // Disarmed by player
         Reset       // Reset to armed state
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
   - Create `TriggerCondition` record
     ```csharp
     public record TriggerCondition {
         public TriggerType Type { get; init; }      // Proximity, Interaction, Timed
         public float? Radius { get; init; }         // For proximity triggers
         public int? DelaySeconds { get; init; }     // For timed triggers
         public bool ResetAfterTrigger { get; init; } = false;
     }

     public enum TriggerType {
         Proximity,      // Trigger when creature enters area
         Interaction,    // Trigger on explicit interaction
         Timed          // Trigger after delay
     }
     ```
   - Create `EffectDuration` record
     ```csharp
     public record EffectDuration {
         public DurationType Type { get; init; }
         public int? Value { get; init; }            // Null for Permanent
         public DateTime? ExpiresAt { get; init; }   // Calculated expiration time
     }

     public enum DurationType {
         Rounds,     // Combat rounds
         Minutes,
         Hours,
         Permanent   // Never expires
     }
     ```
   - Add validation logic (e.g., FrameCount > 0, Radius >= 0)
   - Add XML documentation
   - Agent: backend-developer
   - Dependencies: 1.4 complete

6. **Unit Tests** (Backend) - 6h
   - Write tests for EncounterElement hierarchy (inheritance, properties)
   - Write tests for EncounterActor (HP tracking, validation)
   - Write tests for EncounterProp (state transitions)
   - Write tests for EncounterTrap (trigger conditions, damage calculations)
   - Write tests for EncounterEffect (duration tracking)
   - Write tests for EncounterDecoration (ResourceType handling)
   - Write tests for EncounterAudio (positional vs global)
   - Write tests for value object validation (10+ tests)
   - Target: ≥80% code coverage
   - Agent: backend-developer
   - Dependencies: 1.1, 1.2, 1.3, 1.4, 1.5 complete

---

## Success Criteria

- ✅ All 9 element types compile without errors
- ✅ Base abstractions (EncounterElement, GameElement, StructuralElement) properly inherited
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

**Version**: 1.0
**Created**: 2025-12-28
**Last Updated**: 2025-12-28
