# Product Requirements Document (PRD)
# VTTTools Encounter Domain Model Refactoring

**Document Version:** 1.2
**Date:** 2025-12-28
**Status:** Draft - Ready for Review
**Author:** AI Analysis & User Collaboration
**Stakeholders:** Engineering Team, Product Management, UX Design
**Key Update:** Stage extraction as first-class library entity (ADR-010)

---

## EXECUTIVE SUMMARY

This PRD defines a comprehensive refactoring of the VTTTools encounter domain model to better represent the conceptual distinctions between gameplay elements, environmental decorations, interactive mechanics, and media presentation. The current model conflates different concerns under generic "Asset" and "Sound" entities, leading to ambiguity and limiting future extensibility.

### Problem Statement

The current encounter domain model uses a two-tier classification system that creates conceptual confusion:

**Current Issues:**
1. **EncounterAsset** represents both:
   - Gameplay elements (Characters, Creatures with stats)
   - Environmental props (Objects without gameplay mechanics)
   - Visual effects (classified as AssetKind.Effect)

2. **EncounterSound** represents only audio, but users need:
   - Video overlays
   - Animated sprites
   - Spatial media positioning

3. **Missing Element Types:**
   - Traps (hybrid between environment and gameplay)
   - Interactive puzzles/hazards
   - Active spell effects and zones

4. **AssetKind Enum Ambiguity:**
   - "Object" can be interactive furniture OR passive decoration
   - "Effect" belongs in encounter mechanics, not asset library

### Proposed Solution

Refactor encounter elements into **8 distinct types** organized by **semantic behavior** (not file format), with **Stage extraction** as a first-class library entity:

| Category | Location | Entity Types | Semantic Criterion |
|----------|----------|-------------|-------------------|
| **GameElements** | Encounter | EncounterActor, EncounterProp, EncounterEffect | Has game rules/mechanics |
| **StructuralElements** | Stage | StageWall, StageRegion, StageLight, StageDecoration, StageAudio | Defines passive environment |

**Key Architecture Change (v1.2):** Stage is extracted as a first-class library entity (like World, Campaign, Adventure). Structural elements live on Stage, Game elements live on Encounter. Encounters reference a Stage via FK, enabling the same map to be reused across multiple encounters with different game elements.

**Why "Stage" instead of "Map":**
- Already exists in codebase as embedded value object (renamed to StageSettings)
- Theater metaphor is consistent: Stage + Actors + Props + Effects
- No naming collisions (Map clashes with TypeScript `Map<K,V>` and Mapper terminology)
- Not a verb - unambiguous in code

**Key Design Principle:** Categories are based on **domain behavior** (game mechanics vs environment), not implementation details (file types). Decorations unify all visual media (images, sprites) because they're all "pixels on the map." Audio is separate because it's a different perception mechanism (auditory vs visual).

### Success Metrics

- **Developer Experience:** Clear conceptual boundaries reduce implementation errors
- **User Experience:** Intuitive UI organization with distinct toolboxes
- **Extensibility:** Easy to add new element types without refactoring
- **Performance:** No regression in rendering or data loading times
- **Backward Compatibility:** Migration path for existing encounters

### Estimated Effort

- **Backend:** 200-250 hours
- **Frontend:** 150-200 hours
- **Database Migration:** 30-50 hours
- **Testing:** 100-150 hours
- **Documentation:** 20-30 hours
- **Total:** 500-680 hours (~3-4 months for team of 2-3 developers)

---

## TABLE OF CONTENTS

1. [Background & Context](#1-background--context)
2. [Goals & Non-Goals](#2-goals--non-goals)
3. [Domain Model Design](#3-domain-model-design)
4. [Backend Impact Analysis](#4-backend-impact-analysis)
5. [Frontend Impact Analysis](#5-frontend-impact-analysis)
6. [Encounter Editor Deep Dive](#6-encounter-editor-deep-dive)
7. [Admin App Impact](#7-admin-app-impact)
8. [AI Content Generation Opportunities](#8-ai-content-generation-opportunities)
9. [Database Migration Strategy](#9-database-migration-strategy)
10. [API Design & Versioning](#10-api-design--versioning)
11. [UI/UX Specifications](#11-uiux-specifications)
12. [Testing Strategy](#12-testing-strategy)
13. [Implementation Roadmap](#13-implementation-roadmap)
14. [Risk Assessment](#14-risk-assessment)
15. [Success Criteria](#15-success-criteria)
16. [Appendices](#16-appendices)

---

## 1. BACKGROUND & CONTEXT

### 1.1 Current System Overview

VTTTools is a Virtual Tabletop application for running tabletop RPG sessions. The **Encounter Editor** is the core feature where Game Masters (GMs) create battle maps and position game elements.

**Current Domain Model (Simplified):**

```
Encounter
├── Assets[] (EncounterAsset) - Characters, Creatures, Objects, Effects
├── Sounds[] (EncounterSound) - Audio files with spatial positioning
├── Walls[] (EncounterWall) - Physical barriers
├── Regions[] (EncounterRegion) - Area definitions
└── LightSources[] (EncounterLight) - Lighting

Asset (Global Library)
├── AssetKind: Character, Creature, Object, Effect
├── Portrait, Tokens (visual resources)
└── StatBlocks (game mechanics)
```

### 1.2 Problems with Current Model

#### Problem 1: Semantic Overloading of "Asset"

The `EncounterAsset` entity tries to represent fundamentally different concepts:

**Characters & Creatures:**
- Have full stat blocks
- Can be controlled by players
- Have gameplay mechanics (HP, AC, abilities)
- Example: "Ancient Red Dragon", "Elven Wizard"

**Objects:**
- Have simplified state (intact, damaged, destroyed)
- Cannot be controlled by players (DM only)
- No full stat blocks
- BUT: Objects are further divided into...
  - **Interactive Props:** Chests, doors, levers (can be opened, moved)
  - **Passive Decorations:** Trees, rocks, bushes (pure visual)

**Effects:**
- Currently in Asset library (AssetKind.Effect)
- Should be encounter-specific mechanics
- Don't belong in reusable asset library
- Example: "Fireball AOE", "Darkness Zone"

This semantic overloading leads to:
- Confusing UI (what panel do I use for traps?)
- Inconsistent property presence (ControlledBy doesn't apply to decorations)
- Future extensibility problems

#### Problem 2: Sound-Only Media System

Currently `EncounterSound` only handles audio files, but users need:
- **Video overlays:** Animated portals, lava flows, magic effects
- **Sprite animations:** Animated tokens, environmental effects
- **Spatial positioning:** All media types need position, range, direction

This limitation prevents rich multimedia encounters.

#### Problem 3: Missing Interactive Elements

No explicit support for:
- **Traps:** Pressure plates, magic glyphs, pit traps
- **Puzzles:** Lever combinations, riddles
- **Hazards:** Environmental dangers
- **Active Effects:** Ongoing spell effects, zones

These are currently hacked into the existing system (traps as Objects, effects as Assets).

### 1.3 User Impact

**GM Workflow Friction:**
1. "Where do I place a trap?" → Unclear if it's an Asset, Region, or something else
2. "How do I add an animated waterfall?" → No video support
3. "This treasure chest should be interactive" → Objects can't distinguish interactive from decoration

**Developer Impact:**
1. Adding new element types requires refactoring entire system
2. Business logic becomes convoluted with type checking
3. UI components have unclear responsibilities

### 1.4 Strategic Drivers

This refactoring enables:
1. **AI Content Generation:** Clear types enable AI to generate complete encounters
2. **Marketplace Assets:** Better categorization for asset sharing
3. **Game System Support:** Different games have different mechanics
4. **Future Features:** Weather systems, environmental hazards, dynamic lighting

---

## 2. GOALS & NON-GOALS

### 2.1 Goals

#### Primary Goals

1. **Clear Conceptual Boundaries**
   - Each element type has a single, well-defined purpose
   - No semantic overloading
   - Intuitive for both developers and users

2. **Support All Encounter Elements**
   - Gameplay elements (Actors with stats)
   - Interactive elements (Props, Traps)
   - Passive elements (Decorations)
   - Media elements (Audio, Video, Sprites)
   - Active mechanics (Effects, zones)

3. **Maintain Existing Functionality**
   - All current features continue to work
   - No loss of data during migration
   - Performance parity or improvement

4. **Enable Future Extensibility**
   - Easy to add new element types
   - AI content generation ready
   - Support for custom game systems

#### Secondary Goals

1. **Improve UI/UX Organization**
   - Encounter Editor panels reorganized logically
   - Asset browser filters match new types
   - Clear visual distinctions

2. **Type Safety**
   - TypeScript discriminated unions where appropriate
   - Compile-time guarantees for properties
   - Runtime validation

3. **API Consistency**
   - RESTful endpoint design
   - Consistent CRUD patterns
   - Clear naming conventions

### 2.2 Non-Goals

#### Out of Scope for This PRD

1. **Performance Optimization**
   - No rendering engine changes
   - No database query optimization
   - Only maintain current performance levels

2. **New Features Beyond Element Types**
   - No new encounter mechanics (that's separate)
   - No new game system integrations
   - No UI redesign (only reorganization)

3. **Mobile/Tablet Support**
   - Encounter Editor remains desktop-focused
   - Mobile support is future work

4. **Real-Time Collaboration**
   - Multi-user editing not in scope
   - That's a separate feature

#### Explicitly Not Changing

1. **Wall/Region/Light Systems**
   - Keep existing implementation
   - Only organizational changes

2. **Grid System**
   - No changes to grid logic
   - Keep existing grid types

3. **Undo/Redo Command Pattern**
   - Keep existing architecture
   - Only update command implementations

4. **Asset Library Management**
   - Keep existing asset CRUD
   - Only update AssetKind enum

---

## 3. DOMAIN MODEL DESIGN

### 3.1 Conceptual Framework

The new domain model organizes encounter elements by **semantic behavior**, not implementation details, with **Stage extraction** as a first-class library entity:

**Core Design Principle:**
- **Categories** are based on **domain semantics** (what it does in the game)
- **Selection methods** are implementation details (how you create it)
- **File formats** are implementation details (how it's stored)
- **Stage/Encounter separation** - Maps (structural) vs Scenarios (game elements)

This leads to **two semantic categories with distinct locations**:

| Category | Location | Semantic Criterion | Element Types |
|----------|----------|-------------------|---------------|
| **GameElements** | Encounter | Has game rules/mechanics affecting gameplay | Actor, Prop, Effect |
| **StructuralElements** | Stage | Passive environment with no game mechanics | Wall, Region, Light, Decoration, Audio |

**Stage Extraction (ADR-010):**
- Stage is a first-class library entity (like World, Campaign, Adventure)
- Encounters reference a Stage via FK (StageId)
- Same Stage can be reused across multiple Encounters (e.g., "Dungeon Room 3" stage used for both "Goblin Ambush" and "Treasure Discovery" encounters)
- Current `Stage` value object renamed to `StageSettings` to avoid collision

**Why "Stage" instead of "Map":**
- Already exists in codebase as embedded value object
- Theater metaphor is consistent: Stage + Actors + Props + Effects
- No naming collisions (Map clashes with TypeScript `Map<K,V>` and Mapper terminology)
- Not a verb - unambiguous in code

**Key Insights:**
1. **Decorations unify visual media** - Images, sprites, and videos are all "pixels on the map" rendered at a position. The file format is an implementation detail.
2. **Audio is separate from visual** - Different perception mechanism (ears vs eyes), different UI controls (playback vs position).
3. **Traps merged into Effects** - A trap is just a "hazardous effect" with trigger capabilities. Effect has state machine (Enabled, Disabled, Triggered).
4. **Stage enables map reuse** - Structural elements define the environment, Game elements define the scenario.

### 3.2 Entity Type Definitions

#### 3.2.0 First-Class Entity: `Stage`

Stage is a library entity that holds structural elements:

```csharp
public record Stage {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public Guid OwnerId { get; init; }

    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;

    public string? Description { get; init; }
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }

    /// <summary>Renamed from Stage value object to avoid collision</summary>
    public StageSettings Settings { get; init; } = new();
    public Grid Grid { get; init; } = new();

    // Structural elements
    public List<StageWall> Walls { get; init; } = [];
    public List<StageRegion> Regions { get; init; } = [];
    public List<StageLight> Lights { get; init; } = [];
    public List<StageDecoration> Decorations { get; init; } = [];
    public List<StageAudio> Sounds { get; init; } = [];

    public List<ResourceMetadata> Resources { get; init; } = [];
}
```

#### 3.2.1 Base Abstractions

**StageElement** - Base for structural elements on Stage:

```csharp
public abstract record StageElement {
    /// <summary>Position in collection (ordering)</summary>
    public ushort Index { get; init; }

    /// <summary>Optional display name</summary>
    [MaxLength(128)]
    public string? Name { get; init; }

    /// <summary>2D position on stage</summary>
    public Position Position { get; init; } = Position.Zero;

    /// <summary>Rendering layer (z-order). Higher values render on top.</summary>
    public ushort Layer { get; init; }

    /// <summary>Visibility to players</summary>
    public bool IsVisible { get; init; } = true;

    /// <summary>GM notes and annotations</summary>
    public string? Notes { get; init; }
}
```

**EncounterElement** - Base for game elements on Encounter:

```csharp
public abstract record EncounterElement {
    /// <summary>Position in collection (ordering)</summary>
    public ushort Index { get; init; }

    /// <summary>Optional display name</summary>
    [MaxLength(128)]
    public string? Name { get; init; }

    /// <summary>2D position on encounter stage</summary>
    public Position Position { get; init; } = Position.Zero;

    /// <summary>Rendering layer (z-order). Higher values render on top.</summary>
    public ushort Layer { get; init; }

    /// <summary>Visibility to players</summary>
    public bool IsVisible { get; init; } = true;

    /// <summary>GM notes and annotations</summary>
    public string? Notes { get; init; }
}
```

**Benefits:**
- Common properties abstracted
- Enables polymorphic operations (move, delete, layer management)
- Type-safe property guarantees
- Future-proof for new element types

#### 3.2.2 GameElements

##### EncounterActor (Characters + Creatures)

**Purpose:** Represents entities with full gameplay mechanics and stat blocks.

```csharp
public record EncounterActor : EncounterElement {
    // Reference to global Asset library
    public Guid AssetId { get; init; }

    // Visual representation override (if different from Asset default)
    public ResourceMetadata? ImageOverride { get; init; }

    // Spatial positioning
    public float Rotation { get; init; }
    public float Elevation { get; init; }
    public NamedSize SizeOverride { get; init; } // Override Asset.TokenSize

    // Visual styling
    public Frame Frame { get; init; } = new(); // Token border/background

    // Gameplay
    public Guid? ControlledBy { get; init; } // Player/User reference
    public bool IsLocked { get; init; } // Prevent movement

    // Stats come from Asset via AssetId reference
}
```

**Key Properties:**
- `AssetId` - REQUIRED reference to Asset where `Kind = Character OR Creature`
- `ControlledBy` - Player assignment (nullable: DM-controlled if null)
- `Frame` - Visual frame for token borders (✅ HAS FRAMES)

**Use Cases:**
- Player characters
- NPCs (important characters)
- Monster/enemy creatures
- Summons, familiars, mounts

##### EncounterProp (Interactive Objects)

**Purpose:** Objects players can interact with (no full stat blocks).

```csharp
public record EncounterProp : EncounterElement {
    // REQUIRED reference to Asset library
    public Guid AssetId { get; init; } // Asset.Kind = Prop

    // Visual override
    public ResourceMetadata? ImageOverride { get; init; }
    public NamedSize SizeOverride { get; init; }

    // NO FRAME (seamless integration with map)

    // Spatial
    public float Rotation { get; init; }
    public float Elevation { get; init; }

    // Simplified state (NO full StatBlocks)
    public ObjectState State { get; init; } = ObjectState.Intact;
    public ObjectOpenState? OpenState { get; init; } // For containers/doors

    // DM-only control
    public bool IsLocked { get; init; }
}

public enum ObjectState {
    Intact,
    Damaged,
    Broken,
    Destroyed
}

public enum ObjectOpenState {
    Open,
    Closed,
    Locked
}
```

**Key Properties:**
- `AssetId` - REQUIRED reference (Props need visual resources from library)
- NO `ControlledBy` (DM-only)
- NO `Frame` (❌ NO FRAMES - blend with map)
- State machine for interaction (open/close, damage)

**Use Cases:**
- Treasure chests
- Doors (as objects, not walls)
- Furniture (tables, chairs, beds)
- Levers, switches, buttons
- Barrels, crates, containers

#### 3.2.3 StructuralElements (Visual & Audio)

##### EncounterDecoration (Unified Visual Media)

**Purpose:** Passive visual elements - unifies images, sprites, and videos as "pixels on the map."

**Key Insight:** Images, sprites, and videos are all visual media rendered at a position on the canvas. The file format (static image vs animated sprite vs video stream) is an **implementation detail**, not a semantic distinction.

```csharp
public record EncounterDecoration : StructuralElement {
    // Resource reference (polymorphic - can be image, sprite, or video)
    public Guid ResourceId { get; init; }
    public ResourceType ResourceType { get; init; } // Image or Sprite

    // Common visual properties (same for all resource types)
    public Position Position { get; init; } = Position.Zero;
    public float Rotation { get; init; }
    public ushort Layer { get; init; }
    public Size? DisplaySize { get; init; }
    public float Opacity { get; init; } = 1.0f;
    public bool IsVisible { get; init; } = true;

    // Animation settings (only for Sprite type)
    public AnimationSettings? Animation { get; init; }

    public string? Notes { get; init; }
}

public enum ResourceType {
    Image,   // Static PNG/JPG texture
    Sprite   // Animated sprite sheet
    // Video excluded for MVP - reserved for future cutscene feature
}

public record AnimationSettings {
    public bool Loop { get; init; } = true;
    public float Speed { get; init; } = 1.0f;
    public int? StartFrame { get; init; }
    public bool IsPlaying { get; init; } = true;
}
```

**Key Properties:**
- `ResourceId` - REQUIRED reference to visual resource
- `ResourceType` - Discriminator for resource format
- NO `Frame` (❌ NO FRAMES - blend seamlessly with map)
- NO `State`, NO `ControlledBy` - pure visual decoration
- `Animation` - Only populated for Sprite types

**Selection UI:**
When user clicks "Add Decoration", browser shows tabs:
```
┌─────────────────────────────────┐
│ [📷 Images] [✨ Sprites]        │
├─────────────────────────────────┤
│ [Thumbnail] [Thumbnail] [...]   │
│ Ancient Oak  Torch (animated)   │
└─────────────────────────────────┘
```

**Use Cases:**
- **Static Images:** Trees, rocks, furniture, statues
- **Animated Sprites:** Torches, water, magical auras, status effects
- **Videos (Future):** Large animated backgrounds, cutscenes (separate feature)

**Note on Videos:** Videos excluded from MVP. Use sprites for map decorations (better performance, smaller files). Videos reserved for future fullscreen/windowed cutscene feature.

##### EncounterAudio (Auditory Elements)

**Purpose:** Positioned audio - separate from visual decorations due to different perception mechanism (ears vs eyes).

**Key Insight:** Audio is fundamentally different from visual media because it's perceived through hearing, not vision. It doesn't have a visual position on the canvas, though it may have 3D spatial audio properties.

```csharp
public record EncounterAudio : StructuralElement {
    // Reference to audio resource library
    public Guid AudioResourceId { get; init; }

    // Audio type
    public AudioType Type { get; init; } // Ambient, Effect, Music

    // Playback controls
    public bool IsPlaying { get; init; } = true;
    public bool Loop { get; init; } = true;
    public float Volume { get; init; } = 1.0f; // 0.0 - 1.0

    // Spatial audio (optional - for 3D positioned sound)
    public bool IsGlobal { get; init; } = true; // vs positional
    public Position? SpatialPosition { get; init; }
    public float? Range { get; init; } // Audio falloff distance
    public float? Direction { get; init; } // Directional audio angle
    public float? Arc { get; init; } // Directional arc width

    public string? Notes { get; init; }
}

public enum AudioType {
    Ambient,         // Background environmental sounds (wind, water)
    SoundEffect,     // One-shot effects (door creak, explosion)
    BackgroundMusic  // Music tracks
}
```

**Key Properties:**
- `AudioResourceId` - REQUIRED reference to audio file
- `IsGlobal` - True for background music, false for positioned sounds
- `SpatialPosition` - Only for positioned (non-global) audio
- `Range` - Spatial audio falloff distance

**Use Cases:**
- **Global Audio:** Background music, ambient soundscapes
- **Positional Audio:** Waterfall sounds, fire crackling, tavern noise
- **Directional Audio:** Speaker pointing toward players, NPC voice source

**Selection UI:**
When user clicks "Add Audio", browser shows audio library:
```
┌─────────────────────────────────┐
│ [🎵 Music] [🔊 Ambient] [📢 SFX]│
├─────────────────────────────────┤
│ [▶️ Tavern.mp3]   Duration: 2:34│
│ [▶️ Waterfall.wav] Duration: 0:15│
└─────────────────────────────────┘
```

#### 3.2.4 GameElements (Traps & Effects)

##### EncounterTrap (Triggered Hazards)

**Purpose:** Triggered mechanics with detection and disarm.

```csharp
public record EncounterTrap : EncounterElement {
    // Optional library reference (for reusable trap templates)
    public Guid? TemplateId { get; init; }

    // Visual representation
    public ResourceMetadata? Image { get; init; }
    public NamedSize Size { get; init; } = NamedSize.Medium;

    // Trigger area (geometric zone)
    public Geometry TriggerArea { get; init; } // Polygon, Circle, or Point

    // Detection & Interaction
    public bool IsHidden { get; init; } = true;
    public int? DetectionDC { get; init; }
    public int? DisarmDC { get; init; }

    // State
    public TrapState State { get; init; } = TrapState.Armed;

    // Effect (what happens when triggered)
    public string EffectDescription { get; init; } = string.Empty;
    public Map<string> EffectParameters { get; init; } = new(); // damage, save DC, etc.
}

public enum TrapState {
    Armed,
    Triggered,
    Disarmed,
    Destroyed
}

// Geometry union (for trigger areas)
public abstract record Geometry;
public record LineSegment(Pole Start, Pole End) : Geometry;
public record Polygon(IReadOnlyList<Point> Vertices) : Geometry;
public record Circle(Point Center, float Radius) : Geometry;
```

**Key Properties:**
- `TriggerArea` - Where trap activates
- `DetectionDC` / `DisarmDC` - Skill check difficulties
- `State` - Armed, Triggered, Disarmed, Destroyed
- `EffectParameters` - Flexible key-value for damage, save DC, etc.

**Use Cases:**
- Pressure plates
- Tripwires
- Magical glyphs
- Pit traps
- Poison dart traps

##### EncounterEffect (Active Zones/Conditions)

**Purpose:** Ongoing effects with duration and area.

```csharp
public record EncounterEffect : EncounterElement {
    // Effect type
    public EffectType Type { get; init; }

    // Visual representation
    public ResourceMetadata? Image { get; init; } // AOE visual (fire, darkness, etc.)
    public Color? TintColor { get; init; }
    public float Opacity { get; init; } = 0.5f;

    // Area of effect (geometric zone)
    public Geometry AffectedArea { get; init; } // Circle, Cone, Line, etc.

    // Duration and persistence
    public EffectDuration Duration { get; init; }
    public int? RemainingRounds { get; init; }
    public bool ConcentrationRequired { get; init; }

    // Mechanical effect
    public string EffectDescription { get; init; } = string.Empty;
    public Map<string> EffectParameters { get; init; } = new(); // conditions, modifiers
}

public enum EffectType {
    AreaOfEffect,      // Fireball, Cloud of Daggers
    Zone,              // Darkness, Fog Cloud, Silence
    Condition,         // Bless, Bane (visual marker)
    Environment,       // Grease, Web, Entangle
    Aura,              // Paladin aura, Spirit Guardians
    Hazard             // Ongoing environmental effect
}

public enum EffectDuration {
    Instantaneous,     // Resolves immediately
    Rounds,            // Combat rounds
    Minutes,
    Hours,
    UntilDispelled,
    Concentration,
    Permanent
}
```

**Key Properties:**
- `AffectedArea` - Geometric zone
- `Duration` + `RemainingRounds` - Time tracking
- `ConcentrationRequired` - Spell concentration
- `EffectParameters` - Flexible mechanics

**Use Cases:**
- Fireball AOE
- Darkness spell
- Fog Cloud
- Grease spell
- Spirit Guardians
- Environmental hazards (lava, poison gas)

#### 3.2.5 StructuralElements (Keep Existing)

These are NOT being refactored, only mentioned for completeness:

- **EncounterWall** - Physical barriers (walls, doors, windows)
- **EncounterRegion** - Area definitions (elevation, terrain, illumination, fog)
- **EncounterLight** - Light sources

### 3.3 Updated AssetKind Enum

```csharp
// BEFORE
public enum AssetKind {
    Undefined,
    Character,
    Creature,
    Effect,    // ❌ REMOVE
    Object     // ❌ REMOVE
}

// AFTER
public enum AssetKind {
    Undefined,
    Character,   // → EncounterActor
    Creature,    // → EncounterActor
    Prop,        // → EncounterProp (NEW)
    Decoration   // → EncounterDecoration (NEW)
}
```

**Rationale:**
- Remove `Effect` - Effects are encounter-specific, not library assets
- Remove `Object` - Split into Prop (interactive) vs Decoration (passive)
- Add `Prop` and `Decoration` - Clear distinction

### 3.4 Updated Encounter Aggregate

```csharp
public record Encounter {
    public Adventure Adventure { get; init; } = null!;
    public Guid Id { get; init; } = Guid.CreateVersion7();

    [MaxLength(128)]
    public string Name { get; init; } = "New Encounter";

    [MaxLength(4096)]
    public string Description { get; init; } = string.Empty;

    public bool IsPublished { get; set; }

    // Environment settings
    public Stage Stage { get; set; } = new();
    public Grid Grid { get; init; } = new();

    // 1. GameElements (4 types - has game rules/mechanics)
    public List<EncounterActor> Actors { get; init; } = [];    // Characters + Creatures (with frames)
    public List<EncounterProp> Props { get; init; } = [];      // Interactive objects (no frames)
    public List<EncounterTrap> Traps { get; init; } = [];      // Triggered hazards (game mechanics)
    public List<EncounterEffect> Effects { get; init; } = [];  // Active spell zones (game mechanics)

    // 2. StructuralElements (5 types - passive environment)
    public List<EncounterWall> Walls { get; init; } = [];           // Geometry (unchanged)
    public List<EncounterRegion> Regions { get; init; } = [];       // Geometry (unchanged)
    public List<EncounterLight> LightSources { get; init; } = [];   // Geometry (unchanged)
    public List<EncounterDecoration> Decorations { get; init; } = []; // Visual media (images/sprites)
    public List<EncounterAudio> Audio { get; init; } = [];          // Auditory media
}
```

**Total Collections:** 9 (4 Game + 5 Structural)
**Collections Removed:** Videos, Sprites (unified into Decorations)
**Net Change:** 12 collections → 9 collections (simplified!)

### 3.5 Element Type Comparison Matrix

| Element | Category | Source | Has Frame? | Has Game Rules? | Use Case |
|---------|----------|--------|-----------|----------------|----------|
| **EncounterActor** | Game | Asset (Char/Creature) | ✅ YES | ✅ YES (StatBlock, HP, AC) | Characters, Creatures |
| **EncounterProp** | Game | Asset (Prop) | ❌ NO | ✅ YES (State machine, DM actions) | Chests, Doors, Furniture |
| **EncounterTrap** | Game | Template/Ad-hoc | ❌ NO | ✅ YES (Damage, Saves, Trigger) | Pressure plates, Dart traps |
| **EncounterEffect** | Game | Ad-hoc | N/A | ✅ YES (Duration, AOE, Spell rules) | Wall of Fire, Fog Cloud |
| **EncounterWall** | Structural | Ad-hoc (drawn) | N/A | ❌ NO (Passive geometry) | Vision/movement blocking |
| **EncounterRegion** | Structural | Ad-hoc (drawn) | N/A | ❌ NO (Passive area) | Difficult terrain zones |
| **EncounterLight** | Structural | Ad-hoc (placed) | N/A | ❌ NO (Passive lighting) | Torches, ambient light |
| **EncounterDecoration** | Structural | Visual Resource (Image/Sprite) | ❌ NO | ❌ NO (Pure visual) | Trees, Rocks, Animated torches |
| **EncounterAudio** | Structural | Audio Resource | N/A | ❌ NO (Passive ambiance) | Music, Sounds, Ambient audio |

**Key Distinction:** Game elements have mechanics that affect gameplay (damage, saves, state changes). Structural elements are passive environmental features.

### 3.6 Benefits of This Design

1. **Simplified Architecture (9 types instead of 12)**
   - Unified visual media into single Decoration type
   - Removed Video and Sprite as separate entities
   - Fewer database tables (6 instead of 8)
   - Fewer API endpoints (~35 instead of ~45)

2. **Semantic Clarity**
   - Categories based on **behavior** (game rules vs environment)
   - File format is implementation detail, not semantic distinction
   - Clear mental model: "Does it affect gameplay?"

3. **Perception-Based Design**
   - Visual elements unified (all "pixels on map")
   - Audio separate (different perception mechanism)
   - Matches how humans understand the interface

4. **Type Safety**
   - Compile-time guarantees (Actors have Frame, Props don't)
   - Discriminated unions in TypeScript
   - ResourceType enum for Decoration variants

5. **Extensibility**
   - Easy to add new ResourceTypes (e.g., Video for cutscenes later)
   - Easy to add new visual formats (WebM, APNG, GIF)
   - Common base class for polymorphic operations

6. **UI/UX Simplicity**
   - 2 semantic categories (Game vs Structural)
   - 9 panels instead of 13 (cleaner UI)
   - Unified decoration browser (images + sprites together)

7. **Performance**
   - Encourages sprites over videos (better performance)
   - No rendering architecture changes
   - Same data loading patterns

---

## 4. BACKEND IMPACT ANALYSIS

### 4.1 Overview

**Total Files Affected:** ~180 files (reduced from ~216 due to simplified model)
**Database Tables:** 4 new tables (Actor, Prop, Trap, Effect), 1 modified (Decoration), 1 unchanged (Audio)
**Collections in Encounter:** 9 (down from 12)
**API Endpoints:** ~30-35 new endpoints (reduced from ~45)
**Estimated Effort:** 180-220 hours (reduced due to simpler model)

### 4.2 Domain Layer Changes

#### 4.2.1 New Domain Entities Required

| Entity | File Location | Description |
|--------|--------------|-------------|
| `EncounterElement` | `/Source/Domain/Library/Encounters/Model/EncounterElement.cs` | Base abstraction (NEW) |
| `GameElement` | `/Source/Domain/Library/Encounters/Model/GameElement.cs` | Game rules abstraction (NEW) |
| `StructuralElement` | `/Source/Domain/Library/Encounters/Model/StructuralElement.cs` | Environment abstraction (NEW) |
| `EncounterActor` | `/Source/Domain/Library/Encounters/Model/EncounterActor.cs` | Characters + Creatures (replaces EncounterAsset) |
| `EncounterProp` | `/Source/Domain/Library/Encounters/Model/EncounterProp.cs` | Interactive objects (NEW) |
| `EncounterTrap` | `/Source/Domain/Library/Encounters/Model/EncounterTrap.cs` | Triggered hazards (NEW) |
| `EncounterEffect` | `/Source/Domain/Library/Encounters/Model/EncounterEffect.cs` | Active spell zones (NEW) |
| `EncounterDecoration` | `/Source/Domain/Library/Encounters/Model/EncounterDecoration.cs` | Unified visual media - images/sprites (MODIFIED) |
| `EncounterAudio` | `/Source/Domain/Library/Encounters/Model/EncounterAudio.cs` | Auditory media (replaces EncounterSound) |

**Total:** 6 new entities (Actor, Prop, Trap, Effect, Decoration, Audio), 3 new base abstractions

#### 4.2.2 API Contracts - Breaking Changes

**Current Structure:**
```
EncounterAssetAddRequest / UpdateRequest
EncounterAssetBulkAddRequest
EncounterSoundAddRequest / UpdateRequest
```

**New Structure (split by type):**
```
EncounterActorAddRequest / UpdateRequest / BulkAddRequest
EncounterPropAddRequest / UpdateRequest / BulkAddRequest
EncounterTrapAddRequest / UpdateRequest
EncounterEffectAddRequest / UpdateRequest
EncounterDecorationAddRequest / UpdateRequest (includes ResourceType)
EncounterAudioAddRequest / UpdateRequest
```

**Total New Contracts:** ~18 request/response classes (reduced from ~24)

#### 4.2.3 Service Interface Changes

**File:** `/Source/Domain/Library/Encounters/Services/IEncounterService.cs`

**Current Methods Being Split:**
- `GetAssetsAsync()` → `GetActorsAsync()`, `GetPropsAsync()`, `GetDecorationsAsync()`
- `AddAssetAsync()` → `AddActorAsync()`, `AddPropAsync()`, `AddDecorationAsync()`
- `UpdateAssetAsync()` → type-specific methods (×3)
- `BulkAddAssetsAsync()` → type-specific methods (×3)
- `BulkUpdateAssetsAsync()` → type-specific methods (×3)
- `RemoveAssetAsync()` → type-specific methods (×3)
- `AddSoundSourceAsync()` → `AddAudioAsync()`, `AddVideoAsync()`, `AddSpriteAsync()`
- Plus new methods for Traps and Effects

**Estimated:** ~40 method signature changes

### 4.3 Data Layer Changes

#### 4.3.1 Database Schema Changes

**Tables to Drop:**
- `EncounterAssets`
- `EncounterSounds`

**Tables to Create:**
```sql
-- GameElements (4 tables)
CREATE TABLE EncounterActors (...)
CREATE TABLE EncounterProps (...)
CREATE TABLE EncounterTraps (...)
CREATE TABLE EncounterEffects (...)

-- StructuralElements (2 tables)
CREATE TABLE EncounterDecorations (...)  -- Supports Image/Sprite via ResourceType
CREATE TABLE EncounterAudios (...)
```

**Total:** 6 new tables (reduced from 8 due to unified Decoration)

**Note:** EncounterDecorations table uses ResourceType ENUM (Image, Sprite) instead of separate tables for Video and Sprite.

#### 4.3.2 EF Core Configuration

**File:** `/Source/Data/Builders/EncounterSchemaBuilder.cs`

**Changes Required:**
- Remove EncounterAsset entity configuration
- Add 6 new entity configurations (Actor, Prop, Trap, Effect, Decoration, Audio)
- Configure ResourceType enum for Decoration table
- Update foreign key relationships
- Configure inheritance (EncounterElement → GameElement/StructuralElement)

#### 4.3.3 Data Mappers

**File:** `/Source/Data/Library/Mapper.cs`

**Breaking Changes:**
- Remove `AsEncounterAsset` expression
- Remove `AsEncounterSoundSource` expression
- Add 6 new mapper expressions (Actor, Prop, Trap, Effect, Decoration, Audio)
- Update `AsEncounter` mapper to use new collection names (9 collections)
- Handle ResourceType enum in Decoration mapper

**Estimated Lines Changed:** 180-250 lines (reduced due to simpler model)

### 4.4 Application Layer Changes

#### 4.4.1 Handlers

**File:** `/Source/Library/Handlers/EncounterHandlers.cs`

**Current Handlers Being Split:**
```csharp
GetAssetsHandler → GetActorsHandler, GetPropsHandler, GetDecorationsHandler
AddAssetHandler → AddActorHandler, AddPropHandler, AddDecorationHandler
UpdateAssetHandler → 3 type-specific handlers
BulkAddAssetsHandler → 3 type-specific handlers
BulkUpdateAssetsHandler → 3 type-specific handlers
RemoveAssetHandler → 3 type-specific handlers
AddSoundSourceHandler → AddAudioHandler, AddVideoHandler, AddSpriteHandler
// Plus new: AddTrapHandler, AddEffectHandler, etc.
```

**Total New Handlers:** ~30

#### 4.4.2 API Endpoints

**File:** `/Source/Library/EndpointMappers/EncounterEndpointsMapper.cs`

**Current Routes:**
```
GET    /api/encounters/{id}/assets
POST   /api/encounters/{id}/assets
PUT    /api/encounters/{id}/assets/{index}
DELETE /api/encounters/{id}/assets/{index}

GET    /api/encounters/{id}/sounds
POST   /api/encounters/{id}/sounds
// etc.
```

**New Routes (3x assets + 3x media + 2x interactive):**
```
GET    /api/encounters/{id}/actors
POST   /api/encounters/{id}/actors
PUT    /api/encounters/{id}/actors/{index}
DELETE /api/encounters/{id}/actors/{index}

GET    /api/encounters/{id}/props
POST   /api/encounters/{id}/props
// ... same for decorations

GET    /api/encounters/{id}/audio
POST   /api/encounters/{id}/audio
// ... same for video, sprites

GET    /api/encounters/{id}/traps
POST   /api/encounters/{id}/traps
// ... same for effects
```

**Total New Routes:** ~40-50 endpoints

### 4.5 Critical Files List

**Highest Priority (Must Change):**
1. `/Source/Domain/Assets/Model/AssetKind.cs` - Enum update
2. `/Source/Domain/Library/Encounters/Model/Encounter.cs` - Aggregate update
3. `/Source/Domain/Library/Encounters/Services/IEncounterService.cs` - Interface refactoring
4. `/Source/Data/Builders/EncounterSchemaBuilder.cs` - Schema configuration
5. `/Source/Data/Library/Mapper.cs` - Data mapping
6. `/Source/Library/Handlers/EncounterHandlers.cs` - Request handlers
7. `/Source/Library/EndpointMappers/EncounterEndpointsMapper.cs` - Routing

**High Priority (Significant Changes):**
8. All API contract files in `/Source/Domain/Library/Encounters/ApiContracts/`
9. All service contract files in `/Source/Domain/Library/Encounters/ServiceContracts/`
10. `/Source/Data/Library/EncounterStorage.cs` - Storage implementation
11. `/Source/Library/Services/EncounterService.cs` - Service implementation
12. `/Source/Library/Services/Cloner.cs` - Cloning logic

### 4.6 Testing Impact

**Test Files Requiring Updates:**
- Domain model tests: ~15 files
- API contract tests: ~12 files
- Service tests: ~8 files
- Integration tests: ~30 test methods
- Total estimated test updates: ~200 test cases

---

## 5. FRONTEND IMPACT ANALYSIS

### 5.1 Overview

**Total Components Affected:** ~40 components
**TypeScript Type Files:** ~12 files
**API Integration:** ~20 methods
**Estimated Effort:** 150-200 hours

### 5.2 TypeScript Type Definitions

#### 5.2.1 Domain Types

**File:** `/Source/WebClientApp/src/types/domain.ts`

**Changes Required:**
```typescript
// BEFORE
enum AssetKind {
  Character = 'Character',
  Creature = 'Creature',
  Effect = 'Effect',      // REMOVE
  Object = 'Object',      // REMOVE
}

interface EncounterAsset {
  // Generic asset type
}

interface EncounterSoundSource {
  // Generic sound type
}

// AFTER
enum AssetKind {
  Character = 'Character',
  Creature = 'Creature',
  Prop = 'Prop',          // NEW
  Decoration = 'Decoration' // NEW
}

interface EncounterActor extends EncounterElement {
  assetId: string;
  controlledBy?: string;
  frame: Frame;
  // ...
}

interface EncounterProp extends EncounterElement {
  assetId: string;
  state: ObjectState;
  openState?: ObjectOpenState;
  // NO frame property
}

interface EncounterDecoration extends EncounterElement {
  assetId: string;
  // Minimal properties
}

interface EncounterAudio extends EncounterElement {
  resourceId: string;
  range?: number;
  // ...
}

interface EncounterVideo extends EncounterElement {
  resourceId: string;
  displaySize: Size;
  // ...
}

interface EncounterSprite extends EncounterElement {
  resourceId: string;
  animationSpeed: number;
  // ...
}

interface EncounterTrap extends EncounterElement {
  triggerArea: Geometry;
  detectionDC?: number;
  // ...
}

interface EncounterEffect extends EncounterElement {
  affectedArea: Geometry;
  duration: EffectDuration;
  // ...
}
```

### 5.3 Component Changes

#### 5.3.1 Left Toolbar Panels

**Current Panels:**
- ObjectsPanel.tsx
- CharactersPanel.tsx
- MonstersPanel.tsx
- SoundsPanel.tsx

**New/Modified Panels:**
- ActorsPanel.tsx or keep CharactersPanel + MonstersPanel (combine Actors)
- PropsPanel.tsx (NEW - interactive objects)
- DecorationsPanel.tsx (NEW - environmental objects)
- AudioPanel.tsx (split from SoundsPanel)
- VideoPanel.tsx (NEW)
- SpritesPanel.tsx (NEW)
- TrapsPanel.tsx (NEW)
- EffectsPanel.tsx (NEW)

**Total Panel Changes:** 5 existing modified + 6 new panels

#### 5.3.2 Rendering Components

**Files to Update:**
- `PlacedEntity.tsx` - Update rendering logic for Actors vs Props vs Decorations
- `SoundSourceRenderer.tsx` - Split into AudioRenderer, VideoRenderer, SpriteRenderer
- New: `TrapRenderer.tsx`, `EffectRenderer.tsx`

**Key Change:** Remove Frame rendering from Props and Decorations

```typescript
// PlacedEntity.tsx
const shouldShowFrame = element.type === 'actor'; // Only actors have frames

// Rendering logic
{shouldShowFrame && <Frame {...element.frame} />}
<Image src={element.image} />
```

#### 5.3.3 Asset Browser & Selection

**File:** `/Source/WebClientApp/src/components/assets/AssetFilterPanel.tsx`

**Changes:**
- Update kind filter tabs: Remove "Effect" and "Object"
- Add "Prop" and "Decoration" tabs
- Update filter logic

**File:** `/Source/WebClientApp/src/components/encounter/asset-selection/AssetSelectionDialog.tsx`

**Changes:**
- Support new asset kinds in selection
- Add type-specific placement options

### 5.4 API Integration

**File:** `/Source/WebClientApp/src/services/encounterApi.ts`

**Current Methods:**
```typescript
addEncounterAsset(encounterId, asset)
updateEncounterAsset(encounterId, index, asset)
removeEncounterAsset(encounterId, index)
bulkAddEncounterAssets(encounterId, assets)

addEncounterSound(encounterId, sound)
updateEncounterSound(encounterId, index, sound)
```

**New Methods (type-specific):**
```typescript
// GameElements
addEncounterActor(encounterId, actor)
addEncounterProp(encounterId, prop)
addEncounterDecoration(encounterId, decoration)
updateEncounterActor/Prop/Decoration(...)
removeEncounterActor/Prop/Decoration(...)

// MediaElements
addEncounterAudio(encounterId, audio)
addEncounterVideo(encounterId, video)
addEncounterSprite(encounterId, sprite)
updateEncounterAudio/Video/Sprite(...)

// InteractiveElements
addEncounterTrap(encounterId, trap)
addEncounterEffect(encounterId, effect)
updateEncounterTrap/Effect(...)
```

**Total New Methods:** ~30

### 5.5 State Management & Hooks

**File:** `/Source/WebClientApp/src/pages/EncounterEditor/hooks/useAssetManagement.ts`

**Changes Required:**
- Split asset management into type-specific handlers
- Maintain separate state for Actors, Props, Decorations
- Type discrimination logic

**Estimated Changes:** 100-150 lines

### 5.6 UI Organization Changes

**Encounter Editor Left Toolbar:**

```
BEFORE:
├─ Characters Panel
├─ Monsters Panel
├─ Objects Panel
├─ Sounds Panel
├─ Walls Panel
├─ Regions Panel
├─ Lights Panel
└─ Fog of War Panel

AFTER:
├─ Actors Panel (or keep Characters + Monsters separate)
├─ Props Panel (NEW)
├─ Decorations Panel (NEW)
├─ Audio Panel
├─ Video Panel (NEW)
├─ Sprites Panel (NEW)
├─ Traps Panel (NEW)
├─ Effects Panel (NEW)
├─ Walls Panel
├─ Regions Panel
├─ Lights Panel
└─ Fog of War Panel
```

**Design Decision:** Consider grouping panels with tabs/accordions to avoid overwhelming the UI.

### 5.7 Critical Frontend Files

**Highest Priority:**
1. `/src/types/domain.ts` - Type definitions
2. `/src/services/encounterApi.ts` - API integration
3. `/src/components/encounter/LeftToolBar.tsx` - Panel organization
4. `/src/components/encounter/PlacedEntity.tsx` - Rendering logic
5. `/src/utils/encounterMappers.ts` - Data hydration

**High Priority:**
6. All panel components in `/src/components/encounter/panels/`
7. `/src/components/encounter/rendering/` - Renderer components
8. `/src/pages/EncounterEditorPage.tsx` - Main editor page
9. `/src/components/assets/AssetFilterPanel.tsx` - Asset browser

---

## 6. ENCOUNTER EDITOR DEEP DIVE

### 6.1 Current Architecture Overview

The Encounter Editor is a sophisticated Konva-based canvas application with **9,741 lines** of component code across **37 major components**.

**Component Hierarchy:**
```
EncounterEditorPage (2100+ lines)
├── TopToolBar (undo/redo, zoom, grid, layer visibility)
├── LeftToolBar (panel switcher)
│   ├── 8 Current Panels (Walls, Regions, Lights, Sounds, Objects, Characters, Monsters, FogOfWar)
│   └── BackgroundPanel
├── EncounterCanvas (Konva Stage with 5 rendering layers)
│   ├── Layer 0: Static (Background, Grid)
│   ├── Layer 1: GameWorld (Regions, Lights, Sounds, Walls)
│   ├── Layer 2: Assets (Tokens with EntityPlacement)
│   ├── Layer 3: Fog of War
│   └── Layer 4: Drawing Tools
└── EditorStatusBar
```

### 6.2 Rendering Pipeline (Konva Layers)

**Z-Order (Bottom to Top):**

**Z0: STATIC LAYER**
- Background image
- Grid rendering (Square, HexV, HexH, Isometric)

**Z1: GAMEWORLD LAYER**
- RegionRenderer (elevation, terrain, illumination)
- LightSourceRenderer (with composite operation: "lighten")
- **SoundSourceRenderer** → Split into AudioRenderer, VideoRenderer, SpriteRenderer
- WallRenderer (walls, doors, windows with state)
- Wall/Region Transformers (during editing)

**Z2: ASSETS LAYER**
- **PlacedEntity** → Update to distinguish Actors (with frames) vs Props/Decorations (no frames)
- TokenDragHandle (selection, rotation)

**Z3: FOG OF WAR LAYER**
- FogOfWarRenderer (masking)

**Z4: DRAWING TOOLS LAYER**
- WallDrawingTool
- RegionDrawingTool
- SourceDrawingTool → Update for new media types
- **NEW:** TrapDrawingTool, EffectDrawingTool

### 6.3 Panel Organization Changes

**Current Panels (8):**
1. WallsPanel
2. RegionsPanel
3. LightsPanel
4. SoundsPanel
5. ObjectsPanel
6. CharactersPanel
7. MonstersPanel
8. FogOfWarPanel

**Proposed Panels (13 panels - 5 new):**

**Group 1: Game Elements**
1. CharactersPanel (keep - filters AssetKind.Character)
2. MonstersPanel (keep - filters AssetKind.Creature)
3. **PropsPanel** (NEW - filters AssetKind.Prop)
4. **DecorationsPanel** (NEW - filters AssetKind.Decoration)

**Group 2: Media**
5. **AudioPanel** (NEW - replaces SoundsPanel for audio)
6. **VideoPanel** (NEW)
7. **SpritesPanel** (NEW)

**Group 3: Interactive**
8. **TrapsPanel** (NEW)
9. **EffectsPanel** (NEW)

**Group 4: Structural**
10. WallsPanel (keep)
11. RegionsPanel (keep)
12. LightsPanel (keep)
13. FogOfWarPanel (keep)

**UI Organization Recommendation:**
Use accordion/tab groups to avoid overwhelming left sidebar:
- **Game Elements** accordion (Characters, Monsters, Props, Decorations)
- **Media** accordion (Audio, Video, Sprites)
- **Interactive** accordion (Traps, Effects)
- **Environment** accordion (Walls, Regions, Lights, Fog)

### 6.4 Critical Workflow Changes

#### 6.4.1 Asset Placement Workflow

**Current Flow:**
```
User double-clicks canvas
→ Based on activeScope: 'objects', 'characters', 'monsters'
→ Opens AssetPickerDialog filtered by AssetKind
→ User selects asset
→ setDraggedAsset() - enters placement mode
→ User clicks to place
→ handleAssetPlaced() → createPlaceAssetCommand()
→ addEncounterAsset() API call
→ Asset rendered with Frame
```

**New Flow (3 variations):**

**For Actors (Characters/Monsters):**
```
Same as current, but:
→ addEncounterActor() API call
→ Render with Frame ✅
```

**For Props:**
```
Same as current, but:
→ AssetPicker filters AssetKind.Prop
→ addEncounterProp() API call
→ Render WITHOUT Frame ❌
→ Show state controls (open/close, intact/damaged)
```

**For Decorations:**
```
Same as current, but:
→ AssetPicker filters AssetKind.Decoration
→ addEncounterDecoration() API call
→ Render WITHOUT Frame ❌
→ No interaction controls
```

#### 6.4.2 Sound → Media Workflow

**Current:**
```
User places sound source
→ SourceDrawingTool activated
→ Click to place position
→ SoundPickerDialog opens
→ Select audio resource
→ addEncounterSound() API call
→ SoundSourceRenderer displays speaker icon + range
```

**New (3 media types):**

**Audio:**
```
Same as current
→ addEncounterAudio() API call
→ AudioRenderer with spatial range
```

**Video:**
```
VideoDrawingTool activated
→ Click to place position
→ VideoPickerDialog opens (NEW)
→ Select video resource
→ Configure display size
→ addEncounterVideo() API call
→ VideoRenderer displays video overlay
```

**Sprite:**
```
SpriteDrawingTool activated
→ Click to place
→ SpritePickerDialog opens (NEW)
→ Select sprite resource
→ Configure animation speed
→ addEncounterSprite() API call
→ SpriteRenderer displays animated sprite
```

#### 6.4.3 NEW: Trap Placement Workflow

```
User clicks "Place Trap" in TrapsPanel
→ TrapDrawingTool activated
→ User draws trigger area (polygon or circle)
→ TrapConfigDialog opens
  ├─ Trap type selection
  ├─ Detection DC input
  ├─ Disarm DC input
  ├─ Effect description
  ├─ Hidden toggle
  └─ Optional image upload
→ addEncounterTrap() API call
→ TrapRenderer displays (only visible to DM if hidden)
  ├─ Trigger area outline (dashed blue)
  ├─ Trap icon at center
  └─ State indicator (armed/triggered/disarmed)
```

#### 6.4.4 NEW: Effect Placement Workflow

```
User clicks "Place Effect" in EffectsPanel
→ EffectDrawingTool activated
→ User draws affected area (circle, cone, line)
→ EffectConfigDialog opens
  ├─ Effect type (AOE, Zone, Condition, etc.)
  ├─ Duration selection
  ├─ Remaining rounds (if applicable)
  ├─ Concentration toggle
  ├─ Effect description
  ├─ Optional visual overlay image
  └─ Tint color and opacity
→ addEncounterEffect() API call
→ EffectRenderer displays
  ├─ Affected area with tint color
  ├─ Optional overlay image
  ├─ Duration indicator
```

### 6.5 Command Pattern Updates

**Current Commands:**
- CreatePlaceAssetCommand
- CreateMoveAssetCommand
- CreateTransformAssetCommand
- CreateBulkRemoveAssetsCommand
- etc.

**New Commands Required:**
```csharp
// GameElements (split from Asset commands)
CreatePlaceActorCommand
CreatePlacePropCommand
CreatePlaceDecorationCommand
CreateMoveActorCommand
CreateUpdatePropStateCommand (for open/close, damage)
// ... etc. for each type

// MediaElements (split from Sound commands)
CreatePlaceAudioCommand
CreatePlaceVideoCommand
CreatePlaceSpriteCommand
CreateUpdateAudioPlaybackCommand
// ... etc.

// InteractiveElements (NEW)
CreatePlaceTrapCommand
CreateTriggerTrapCommand (state change)
CreateDisarmTrapCommand (state change)
CreatePlaceEffectCommand
CreateUpdateEffectDurationCommand
CreateRemoveExpiredEffectCommand
```

**Estimated:** ~40 new command classes

### 6.6 State Management Impact

**Current State:**
```typescript
const [placedAssets, setPlacedAssets] = useState<PlacedAsset[]>([]);
const [placedSounds, setPlacedSounds] = useState<PlacedSoundSource[]>([]);
```

**New State:**
```typescript
// GameElements
const [placedActors, setPlacedActors] = useState<PlacedActor[]>([]);
const [placedProps, setPlacedProps] = useState<PlacedProp[]>([]);
const [placedDecorations, setPlacedDecorations] = useState<PlacedDecoration[]>([]);

// MediaElements
const [placedAudio, setPlacedAudio] = useState<PlacedAudio[]>([]);
const [placedVideos, setPlacedVideos] = useState<PlacedVideo[]>([]);
const [placedSprites, setPlacedSprites] = useState<PlacedSprite[]>([]);

// InteractiveElements
const [placedTraps, setPlacedTraps] = useState<PlacedTrap[]>([]);
const [placedEffects, setPlacedEffects] = useState<PlacedEffect[]>([]);
```

### 6.7 Rendering Logic Changes

**PlacedEntity.tsx:**
```typescript
// CURRENT
<Konva.Group>
  <Frame {...frame} /> {/* Always rendered */}
  <Konva.Image image={tokenImage} />
  <Label {...labelProps} />
</Konva.Group>

// NEW
<Konva.Group>
  {elementType === 'actor' && <Frame {...frame} />} {/* Conditional */}
  <Konva.Image image={elementImage} />
  <Label {...labelProps} />
</Konva.Group>
```

**Key Changes:**
- Frame rendering conditional on element type
- Props/Decorations blend seamlessly with background (no frame)
- Actors maintain visual distinction (frame border)

### 6.8 Performance Considerations

**No Regressions Expected:**
- Same number of rendered elements (just reorganized)
- Same Konva layer architecture
- Same rendering optimizations (memoization, selective renders)
- Command pattern maintains undo/redo efficiency

**Potential Improvements:**
- More granular state updates (only affected element type re-renders)
- Type-specific rendering optimizations

### 6.9 Testing Impact - Encounter Editor

**E2E Tests Requiring Updates:**
- `/e2e/step-definitions/feature-specific/encounter-asset-placement.steps.ts`
- `/e2e/step-definitions/feature-specific/encounter-management-grid.steps.ts`
- `/e2e/step-definitions/feature-specific/encounter-stage-configuration.steps.ts`

**BDD Scenarios to Update:**
- Asset placement scenarios (split by type)
- Sound placement scenarios (split by media type)
- NEW: Trap placement scenarios
- NEW: Effect placement scenarios

**Estimated:** ~40 BDD scenarios affected

---

## 7. ADMIN APP IMPACT

### 7.1 Overview

**Impact Level:** LOW-MEDIUM
**Files Affected:** ~10 files
**Estimated Effort:** 20-30 hours

### 7.2 Bulk Asset Generation

**File:** `/Source/WebAdminApp/src/components/aiSupport/BulkAssetGenerationForm.tsx`

**Changes Required (Line 380-382):**
```typescript
// CURRENT
<Select value={item.kind} onChange={...}>
  {Object.values(AssetKind).map((kind) => (
    <MenuItem value={kind}>{kind}</MenuItem>
    // Shows: Character, Creature, Effect, Object
  ))}
</Select>

// NEW
<Select value={item.kind} onChange={...}>
  {Object.values(AssetKind)
    .filter(k => k !== AssetKind.Undefined)
    .map((kind) => (
      <MenuItem value={kind}>{kind}</MenuItem>
      // Shows: Character, Creature, Prop, Decoration
    ))}
</Select>
```

**Validation Updates:**
- `/src/utils/bulkGenerationValidation.ts`
  - Remove validation for Effect and Object kinds
  - Add validation for Prop and Decoration kinds

### 7.3 Asset Editor

**File:** `/Source/WebAdminApp/src/pages/library/AssetEditorPage.tsx`

**Changes:**
- Update kind selection dropdown
- Add type-specific property panels:
  - For Props: State management controls
  - For Decorations: Minimal properties (just visual)

### 7.4 Encounter Editor (Admin)

**File:** `/Source/WebAdminApp/src/pages/library/EncounterEditorPage.tsx`

**Changes:**
- Mirror main app encounter editor changes
- Update element type panels (if admin app has encounter editing)

### 7.5 Admin-Specific Features

**No Impact:**
- User management
- Audit logs
- Configuration
- Resource management
- Job monitoring

**Minor Impact:**
- Asset browsing/filtering (update kind filters)
- Bulk operations (update to handle new kinds)

---

## 8. AI CONTENT GENERATION OPPORTUNITIES

### 8.1 Current AI Capabilities

VTTTools already has comprehensive AI infrastructure:
- **Image Generation:** OpenAI, Google, Stability AI
- **Audio Generation:** ElevenLabs, Suno
- **Video Generation:** RunwayML
- **Text Generation:** OpenAI
- **Prompt Enhancement:** OpenAI

**Bulk Generation:** Up to 100 assets per batch

### 8.2 Extend Existing: Props & Decorations

**Low Effort - High Value**

```csharp
// Extend BulkAssetGenerationRequest to support new kinds
public record BulkAssetGenerationRequest {
    public required IReadOnlyList<BulkAssetGenerationListItem> Items { get; init; }
    public bool GeneratePortrait { get; init; } = true;
    public bool GenerateToken { get; init; } = true;
}

// BulkAssetGenerationListItem already supports any AssetKind
// Just update validation to accept Prop and Decoration
```

**Use Cases:**
- Generate 50 forest decorations (trees, rocks, bushes)
- Generate tavern props (chairs, tables, barrels, chests)
- Generate dungeon props (levers, doors, treasure chests)

### 8.3 NEW: Trap Generator Service

**High Value Opportunity**

```csharp
public interface ITrapGenerationService {
    Task<GeneratedTrap> GenerateTrapAsync(TrapGenerationRequest request);
    Task<IReadOnlyList<GeneratedTrap>> GenerateTrapsForEncounterAsync(
        string environment,
        int dangerLevel,
        int quantity
    );
}

public record TrapGenerationRequest {
    public string Environment { get; init; }       // "dungeon", "forest", "castle"
    public int DangerLevel { get; init; }          // 1-10
    public string[] AvailableMechanics { get; init; }  // "fire", "poison", "mechanical"
    public string GameSystem { get; init; }        // "D&D 5e", "Pathfinder"
}

public record GeneratedTrap {
    public string Name { get; init; }
    public string Description { get; init; }
    public int DetectionDC { get; init; }
    public int DisarmDC { get; init; }
    public string EffectDescription { get; init; }
    public Map<string> EffectParameters { get; init; }
    public ResourceMetadata? Image { get; init; }  // AI-generated trap visual
}
```

**Implementation:**
1. Use text generation for trap mechanics
2. Use image generation for trap visual
3. Auto-calculate DCs based on danger level

### 8.4 NEW: Spell Effect Generator Service

**High Value Opportunity**

```csharp
public interface ISpellEffectGenerationService {
    Task<GeneratedSpellEffect> GenerateEffectAsync(SpellEffectGenerationRequest request);
}

public record SpellEffectGenerationRequest {
    public string SpellName { get; init; }
    public string GameSystem { get; init; }  // "D&D 5e", etc.
    public int CasterLevel { get; init; }
}

public record GeneratedSpellEffect {
    public EffectType Type { get; init; }
    public Geometry AffectedArea { get; init; }  // Auto-calculated from spell
    public EffectDuration Duration { get; init; }
    public string EffectDescription { get; init; }
    public Map<string> EffectParameters { get; init; }
    public ResourceMetadata? VisualOverlay { get; init; }  // AI-generated effect visual
}
```

**Use Cases:**
- "Generate Fireball effect" → circular 20ft radius, fire overlay, instantaneous
- "Generate Darkness spell" → 15ft radius zone, black overlay, concentration
- Auto-populate effect parameters based on game system rules

### 8.5 ULTIMATE: Complete Encounter Generator

**Highest Value - Complex**

```csharp
public interface IEncounterGenerationService {
    Task<GeneratedEncounter> GenerateCompleteEncounterAsync(
        EncounterGenerationRequest request
    );
}

public record EncounterGenerationRequest {
    public string Prompt { get; init; }  // "A tavern brawl with 5 thugs"
    public int PartyLevel { get; init; }
    public int PartySize { get; init; }
    public string GameSystem { get; init; }
    public string[] Tags { get; init; }  // "social", "combat", "puzzle"
}

public record GeneratedEncounter {
    public string Name { get; init; }
    public string Description { get; init; }
    public ResourceMetadata? BackgroundMap { get; init; }  // AI-generated map

    // All generated elements
    public IReadOnlyList<EncounterActor> Actors { get; init; }
    public IReadOnlyList<EncounterProp> Props { get; init; }
    public IReadOnlyList<EncounterDecoration> Decorations { get; init; }
    public IReadOnlyList<EncounterTrap> Traps { get; init; }
    public IReadOnlyList<EncounterAudio> Audio { get; init; }
    public IReadOnlyList<EncounterLight> LightSources { get; init; }
    public IReadOnlyList<EncounterRegion> Regions { get; init; }
}
```

**Implementation Steps:**
1. Text generation creates encounter narrative
2. Image generation creates background map
3. Text generation lists required assets (actors, props, decorations)
4. Bulk asset generation creates all assets
5. Placement algorithm positions elements on map
6. Trap/lighting/region generation adds finishing touches

### 8.6 AI Priority Matrix

| Feature | Value | Effort | Priority |
|---------|-------|--------|----------|
| **Complete Encounter Generator** | ⭐⭐⭐⭐⭐ | High | HIGHEST |
| **Trap Generator** | ⭐⭐⭐⭐ | Medium | HIGH |
| **Spell Effect Generator** | ⭐⭐⭐⭐ | Medium | HIGH |
| **Props/Decorations (extend existing)** | ⭐⭐⭐ | Low | MEDIUM |
| **Environment Set Generator** | ⭐⭐⭐ | Medium | MEDIUM |

---

## 9. DATABASE MIGRATION STRATEGY

### 9.1 Migration Overview

**Breaking Changes:**
- Drop tables: `EncounterAssets`, `EncounterSounds`
- Create tables: 8 new element type tables
- Data transformation required

**Migration Type:** MAJOR - Requires data transformation

### 9.2 Migration Plan

#### Phase 1: Add New Tables (Additive)

```sql
-- Create new tables alongside old ones
CREATE TABLE EncounterActors (
    EncounterId UNIQUEIDENTIFIER NOT NULL,
    Index INT NOT NULL,
    AssetId UNIQUEIDENTIFIER NOT NULL,
    -- ... all actor properties
    CONSTRAINT PK_EncounterActors PRIMARY KEY (EncounterId, Index),
    CONSTRAINT FK_EncounterActors_Encounters FOREIGN KEY (EncounterId)
        REFERENCES Encounters(Id) ON DELETE CASCADE
);

-- Repeat for all 8 new element types
CREATE TABLE EncounterProps (...);
CREATE TABLE EncounterDecorations (...);
CREATE TABLE EncounterAudios (...);
CREATE TABLE EncounterVideos (...);
CREATE TABLE EncounterSprites (...);
CREATE TABLE EncounterTraps (...);
CREATE TABLE EncounterEffects (...);
```

#### Phase 2: Data Transformation

```sql
-- Migrate EncounterAssets → EncounterActors, EncounterProps, EncounterDecorations
-- Based on Asset.Kind lookup

-- Step 1: Get all assets with their kinds
WITH AssetKinds AS (
    SELECT
        ea.EncounterId,
        ea.Index,
        ea.AssetId,
        a.Kind,
        ea.*  -- all encounter asset properties
    FROM EncounterAssets ea
    INNER JOIN Assets a ON ea.AssetId = a.Id
)

-- Step 2: Insert into EncounterActors (Kind = Character OR Creature)
INSERT INTO EncounterActors (
    EncounterId, Index, AssetId, Name, Position, Rotation,
    Elevation, Size, Image, Frame, ControlledBy, IsLocked, IsVisible, Notes, Layer
)
SELECT
    EncounterId, Index, AssetId, Name, Position, Rotation,
    Elevation, Size, Image, Frame, ControlledBy, IsLocked, IsVisible, Notes, Layer
FROM AssetKinds
WHERE Kind IN ('Character', 'Creature');

-- Step 3: Insert into EncounterProps (Kind = Object - assuming Object → Prop default)
-- NOTE: Need business logic to determine Prop vs Decoration
-- Simple heuristic: If Object has notes or specific properties → Prop, else → Decoration
INSERT INTO EncounterProps (
    EncounterId, Index, AssetId, Name, Position, Rotation,
    Elevation, Size, Image, IsLocked, IsVisible, Notes, Layer,
    State, OpenState -- Default to Intact, NULL
)
SELECT
    EncounterId, Index, AssetId, Name, Position, Rotation,
    Elevation, Size, Image, IsLocked, IsVisible, Notes, Layer,
    'Intact' AS State,
    NULL AS OpenState
FROM AssetKinds
WHERE Kind = 'Object' AND (Notes IS NOT NULL OR [other criteria]);

-- Step 4: Insert into EncounterDecorations (remaining Objects)
INSERT INTO EncounterDecorations (
    EncounterId, Index, AssetId, Name, Position, Rotation,
    Elevation, Size, Image, IsVisible, Notes, Layer
)
SELECT
    EncounterId, Index, AssetId, Name, Position, Rotation,
    Elevation, Size, Image, IsVisible, Notes, Layer
FROM AssetKinds
WHERE Kind = 'Object' AND Notes IS NULL;

-- Step 5: Migrate EncounterSounds → EncounterAudios
-- (Assume all current sounds are audio; no videos/sprites exist yet)
INSERT INTO EncounterAudios (
    EncounterId, Index, Name, Position, ResourceId, Range,
    Direction, Arc, IsPlaying, Loop, Volume, IsVisible, Notes, Layer
)
SELECT
    EncounterId, Index, Name, Position, ResourceId, Range,
    Direction, Arc, IsPlaying, Loop, Volume, IsVisible, Notes, Layer
FROM EncounterSounds;
```

#### Phase 3: Verification

```sql
-- Verify counts match
SELECT
    (SELECT COUNT(*) FROM EncounterAssets) AS OldAssetCount,
    (SELECT COUNT(*) FROM EncounterActors) AS ActorCount,
    (SELECT COUNT(*) FROM EncounterProps) AS PropCount,
    (SELECT COUNT(*) FROM EncounterDecorations) AS DecorationCount,
    (SELECT COUNT(*) FROM EncounterActors) +
    (SELECT COUNT(*) FROM EncounterProps) +
    (SELECT COUNT(*) FROM EncounterDecorations) AS TotalNewCount;

SELECT
    (SELECT COUNT(*) FROM EncounterSounds) AS OldSoundCount,
    (SELECT COUNT(*) FROM EncounterAudios) AS AudioCount;

-- If counts match → safe to drop old tables
```

#### Phase 4: Drop Old Tables

```sql
DROP TABLE EncounterAssets;
DROP TABLE EncounterSounds;
```

### 9.3 Asset Library Migration

```sql
-- Update Asset.Kind enum values
-- BEFORE: Character, Creature, Effect, Object
-- AFTER: Character, Creature, Prop, Decoration

-- Migrate Object → Prop or Decoration
-- Same heuristic as encounter assets
UPDATE Assets
SET Kind = 'Prop'
WHERE Kind = 'Object' AND [has interaction indicators];

UPDATE Assets
SET Kind = 'Decoration'
WHERE Kind = 'Object' AND Kind != 'Prop';

-- Remove Effect kind (if any assets exist)
-- Decision: Convert Effect assets to something else or delete?
-- Option 1: Delete (effects shouldn't be in asset library)
DELETE FROM Assets WHERE Kind = 'Effect';

-- Option 2: Convert to Prop (if they're reusable templates)
UPDATE Assets SET Kind = 'Prop' WHERE Kind = 'Effect';
```

### 9.4 Rollback Plan

**Before Migration:**
1. Full database backup
2. Script to reverse migration (tested on staging)
3. Downtime window communicated

**If Migration Fails:**
1. Restore from backup
2. Investigate failure
3. Fix migration script
4. Retry in next maintenance window

**Estimated Downtime:** 15-30 minutes (depending on data volume)

### 9.5 Testing Strategy

**Pre-Migration:**
1. Test migration script on copy of production database
2. Verify data integrity post-migration
3. Test application with migrated data
4. Performance test new schema

**Post-Migration:**
1. Smoke test all encounter CRUD operations
2. Verify existing encounters load correctly
3. Test asset placement for all new types
4. Monitor error logs for 24 hours

---

## 10. API DESIGN & VERSIONING

### 10.1 Breaking Changes Summary

**Removed Endpoints:**
```
GET    /api/encounters/{id}/assets
POST   /api/encounters/{id}/assets
PUT    /api/encounters/{id}/assets/{index}
DELETE /api/encounters/{id}/assets/{index}
POST   /api/encounters/{id}/assets/bulk

GET    /api/encounters/{id}/sounds
POST   /api/encounters/{id}/sounds
PUT    /api/encounters/{id}/sounds/{index}
DELETE /api/encounters/{id}/sounds/{index}
```

**New Endpoints:**
```
-- Actors
GET    /api/encounters/{id}/actors
POST   /api/encounters/{id}/actors
PUT    /api/encounters/{id}/actors/{index}
DELETE /api/encounters/{id}/actors/{index}
POST   /api/encounters/{id}/actors/bulk

-- Props
GET    /api/encounters/{id}/props
POST   /api/encounters/{id}/props
PUT    /api/encounters/{id}/props/{index}
DELETE /api/encounters/{id}/props/{index}
POST   /api/encounters/{id}/props/bulk

-- Decorations
GET    /api/encounters/{id}/decorations
POST   /api/encounters/{id}/decorations
PUT    /api/encounters/{id}/decorations/{index}
DELETE /api/encounters/{id}/decorations/{index}
POST   /api/encounters/{id}/decorations/bulk

-- Audio
GET    /api/encounters/{id}/audio
POST   /api/encounters/{id}/audio
PUT    /api/encounters/{id}/audio/{index}
DELETE /api/encounters/{id}/audio/{index}

-- Video (NEW)
GET    /api/encounters/{id}/videos
POST   /api/encounters/{id}/videos
PUT    /api/encounters/{id}/videos/{index}
DELETE /api/encounters/{id}/videos/{index}

-- Sprites (NEW)
GET    /api/encounters/{id}/sprites
POST   /api/encounters/{id}/sprites
PUT    /api/encounters/{id}/sprites/{index}
DELETE /api/encounters/{id}/sprites/{index}

-- Traps (NEW)
GET    /api/encounters/{id}/traps
POST   /api/encounters/{id}/traps
PUT    /api/encounters/{id}/traps/{index}
DELETE /api/encounters/{id}/traps/{index}

-- Effects (NEW)
GET    /api/encounters/{id}/effects
POST   /api/encounters/{id}/effects
PUT    /api/encounters/{id}/effects/{index}
DELETE /api/encounters/{id}/effects/{index}
```

**Total:** ~40-50 new endpoints

### 10.2 Versioning Strategy

**Option A: API Version Prefix (Recommended)**
```
-- V1 (old - deprecated)
GET /api/v1/encounters/{id}/assets

-- V2 (new)
GET /api/v2/encounters/{id}/actors
GET /api/v2/encounters/{id}/props
```

**Benefits:**
- Clear version separation
- Can maintain V1 for backward compatibility period
- Easy to deprecate old version

**Deprecation Timeline:**
- Month 0: Release V2, mark V1 deprecated
- Month 3: Warning logs for V1 usage
- Month 6: Remove V1 endpoints

**Option B: In-Place Breaking Change (Not Recommended)**
- Replace endpoints immediately
- No backward compatibility
- Forces all clients to upgrade simultaneously

**Recommendation:** Use Option A with 6-month deprecation period

### 10.3 Response Schema Changes

**Encounter GET Response:**

```json
{
  "id": "...",
  "name": "...",
  // OLD (V1)
  "assets": [...],
  "sounds": [...],

  // NEW (V2)
  "actors": [...],
  "props": [...],
  "decorations": [...],
  "audio": [...],
  "videos": [...],
  "sprites": [...],
  "traps": [...],
  "effects": [...],

  // Unchanged
  "walls": [...],
  "regions": [...],
  "lightSources": [...]
}
```

### 10.4 Error Handling

**New Error Codes:**
```
ACTOR_NOT_FOUND
PROP_NOT_FOUND
DECORATION_NOT_FOUND
AUDIO_NOT_FOUND
VIDEO_NOT_FOUND
SPRITE_NOT_FOUND
TRAP_NOT_FOUND
EFFECT_NOT_FOUND

INVALID_ACTOR_DATA
INVALID_PROP_STATE
INVALID_EFFECT_DURATION
INVALID_TRAP_TRIGGER_AREA
```

**HTTP Status Codes (no change):**
- 200 OK
- 201 Created
- 400 Bad Request
- 404 Not Found
- 500 Internal Server Error

---

## 11. UI/UX Specifications

### 11.1 Encounter Editor Left Toolbar Reorganization

**Current Structure (7 Panels):**
```
├─ Assets Panel
├─ Sounds Panel
├─ Walls Panel
├─ Regions Panel
├─ Light Sources Panel
├─ Notes Panel
└─ Settings Panel
```

**New Structure (9 Element Panels - 2 Semantic Categories):**
```
┌─ 🎮 GAME ELEMENTS ───────────┐
│  (Has game rules/mechanics)  │
├──────────────────────────────┤
│ ├─ 👥 Actors Panel           │
│ ├─ 📦 Props Panel            │
│ ├─ ⚡ Traps Panel            │
│ └─ ✨ Effects Panel          │
├─ 🏗️ STRUCTURAL ELEMENTS ─────┤
│  (Passive environment)       │
├──────────────────────────────┤
│ ├─ 🧱 Walls Panel (unchanged)│
│ ├─ 📐 Regions Panel (unch.)  │
│ ├─ 💡 Lights Panel (unch.)   │
│ ├─ 🌳 Decorations Panel      │ ← Images/Sprites unified
│ └─ 🔊 Audio Panel            │
└──────────────────────────────┘

Plus: Notes Panel, Settings Panel (utility - always available)
```

**Total Element Panels:** 9 (down from 13 - simplified!)
**Total Panels:** 11 (9 elements + Notes + Settings)

**Key Changes:**
- **Removed:** Video and Sprites as separate panels
- **Unified:** Decorations now handles images + sprites + (future) videos
- **Reorganized:** Traps and Effects moved to Game Elements (have game mechanics)
- **Simplified:** 2 semantic categories instead of 4

**Panel Collapsed by Default:**
- Traps (less common)
- Effects (less common)
- Decorations (many items, collapse to reduce clutter)

**Panel Expanded by Default:**
- Actors (most common)
- Props (common)
- Audio (common)
- Walls, Regions, Lights (unchanged)

### 11.2 Actor Panel Design

**Panel Header:**
```
┌─────────────────────────────────────┐
│ 👥 ACTORS                    [12]  ▼│
│ [🔍 Search] [Filter ▾] [+ Add]     │
└─────────────────────────────────────┘
```

**Filter Options:**
- All
- Characters
- Creatures
- Visible Only
- Hidden Only
- Controlled
- Uncontrolled

**Actor List Item:**
```
┌─────────────────────────────────────┐
│ [🎭] Ancient Red Dragon     [👁][🔒]│
│      Creature • Huge • Layer 3      │
│      HP: 256/256 • AC: 22           │
│      Controlled by: Player 1        │
│ ───────────────────────────────────│
│ [⚙️ Edit] [📋 Copy] [🗑️ Delete]    │
└─────────────────────────────────────┘
```

**Properties when Selected:**
- Name (editable)
- Asset (dropdown from library)
- Position (X, Y coordinates)
- Rotation (0-360 degrees slider)
- Size Override (dropdown: Tiny → Gargantuan)
- Elevation (slider 0-10)
- Layer (slider 1-10)
- Frame (X, Y, Width, Height inputs)
- Visibility (checkbox)
- Locked (checkbox)
- Controlled By (player dropdown)
- Notes (textarea)

### 11.3 Props Panel Design

**Panel Header:**
```
┌─────────────────────────────────────┐
│ 📦 PROPS                      [8]  ▼│
│ [🔍 Search] [Filter ▾] [+ Add]     │
└─────────────────────────────────────┘
```

**Filter Options:**
- All
- Intact
- Open
- Closed
- Damaged
- Destroyed
- Locked

**Prop List Item:**
```
┌─────────────────────────────────────┐
│ [📦] Treasure Chest         [👁][🔓]│
│      Prop • Large • Layer 1         │
│      State: Closed                  │
│ ───────────────────────────────────│
│ [⚙️ Edit] [📋 Copy] [🗑️ Delete]    │
└─────────────────────────────────────┘
```

**Properties when Selected:**
- Name (editable)
- Asset (dropdown from library - REQUIRED)
- Position (X, Y)
- Rotation (0-360 slider)
- Size Override (dropdown)
- Elevation (slider 0-10)
- Layer (slider 1-10)
- State (dropdown: Intact, Damaged, Destroyed)
- Open State (dropdown: null, Open, Closed) - only for containers
- Locked (checkbox)
- Visibility (checkbox)
- Notes (textarea)

**NO FRAME CONTROLS** - Props blend seamlessly with background

### 11.4 Decorations Panel Design (Unified Visual Media)

**Key Feature:** Handles images AND sprites in one unified panel.

**Panel Header:**
```
┌─────────────────────────────────────┐
│ 🌳 DECORATIONS                [24] ▼│
│ [🔍 Search] [Filter ▾] [+ Add]     │
└─────────────────────────────────────┘
```

**Decoration List Item:**
```
┌─────────────────────────────────────┐
│ [🌳] Ancient Oak Tree        [👁]   │
│      Image • Huge • Layer 0         │
│ ───────────────────────────────────│
│ [⚙️ Edit] [📋 Copy] [🗑️ Delete]    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ [🔥] Torch (animated)        [👁][▶]│
│      Sprite • Medium • Layer 2      │
│      Playing • Loop enabled         │
│ ───────────────────────────────────│
│ [⚙️ Edit] [📋 Copy] [🗑️ Delete]    │
└─────────────────────────────────────┘
```

**Resource Browser (when clicking [+ Add]):**
```
┌─────────────────────────────────────┐
│ Select Decoration                    │
├─────────────────────────────────────┤
│ [📷 Images] [✨ Sprites]            │ ← Tabs
├─────────────────────────────────────┤
│ [Thumbnail] [Thumbnail] [Thumbnail] │
│ Ancient Oak  Stone Wall  Pillar     │
│ (static)     (static)    (static)   │
│                                     │
│ [Thumbnail] [Thumbnail] [Thumbnail] │
│ Torch        Water       Fire       │
│ (animated)   (animated)  (animated) │
└─────────────────────────────────────┘
```

**Properties when Selected (Image):**
- Name (editable)
- Resource Type: Image (read-only)
- Resource (dropdown from visual library - REQUIRED)
- Position (X, Y)
- Rotation (0-360 slider)
- Display Size (width/height or auto)
- Opacity (0-100% slider)
- Layer (slider 1-10)
- Visibility (checkbox)
- Notes (textarea)

**Properties when Selected (Sprite - Additional):**
- Resource Type: Sprite (read-only)
- All above properties PLUS:
- Animation Speed (0.1x - 5.0x slider)
- Loop (checkbox)
- Is Playing (checkbox)
- Start Frame (number input, optional)

**NO FRAME, NO STATE** - Pure visual decoration

### 11.5 Traps Panel Design

**Panel Header:**
```
┌─────────────────────────────────────┐
│ ⚡ TRAPS                       [3] ▼│
│ [🔍 Search] [Filter ▾] [+ Add]     │
└─────────────────────────────────────┘
```

**Filter Options:**
- All
- Armed
- Triggered
- Disabled
- Visible
- Hidden

**Trap List Item:**
```
┌─────────────────────────────────────┐
│ [⚡] Poison Dart Trap        [👁][⚙️]│
│      Trap • Armed • Layer 5         │
│      DC 15 Dexterity • 2d8 Poison   │
│      Trigger: Pressure Plate        │
│ ───────────────────────────────────│
│ [⚙️ Edit] [📋 Copy] [🗑️ Delete]    │
└─────────────────────────────────────┘
```

**Properties when Selected:**
- Name (editable)
- Position (X, Y)
- Trigger Area (shape: circle/rectangle, dimensions)
- State (dropdown: Armed, Triggered, Disabled)
- Damage (dice formula)
- Save Type (dropdown: Dexterity, Strength, etc.)
- Save DC (number input)
- Trigger Type (dropdown: Pressure, Trip Wire, Proximity, etc.)
- Effect Description (textarea)
- Visibility (checkbox)
- Layer (slider 1-10)
- Notes (textarea)

### 11.6 Effects Panel Design

**Panel Header:**
```
┌─────────────────────────────────────┐
│ ✨ EFFECTS                     [5] ▼│
│ [🔍 Search] [Filter ▾] [+ Add]     │
└─────────────────────────────────────┘
```

**Effect List Item:**
```
┌─────────────────────────────────────┐
│ [✨] Wall of Fire             [👁][⏱]│
│      Effect • Active • Layer 7      │
│      Duration: 5 rounds remaining   │
│      Area: 60ft line                │
│ ───────────────────────────────────│
│ [⚙️ Edit] [📋 Copy] [🗑️ Delete]    │
└─────────────────────────────────────┘
```

**Properties when Selected:**
- Name (editable)
- Position (X, Y)
- Area (shape: circle/cone/line/cube, dimensions)
- Duration Type (dropdown: Instantaneous, Rounds, Minutes, Hours, Concentration)
- Duration Value (number input if not instantaneous)
- State (dropdown: Active, Expired)
- Spell Level (optional, dropdown 0-9)
- Save Type (optional, dropdown)
- Save DC (optional, number)
- Effect Description (textarea)
- Visibility (checkbox)
- Layer (slider 1-10)
- Visual Effect (dropdown: Fire, Ice, Lightning, etc.)
- Notes (textarea)

### 11.7 Canvas Rendering Changes

**Konva Layer Stack (Bottom to Top):**
```
Layer 0: Background Map
Layer 1-10: Game Elements (configurable per element)
  ├─ Decorations (typically Layer 1-3)
  ├─ Props (typically Layer 2-4)
  ├─ Actors (typically Layer 3-7)
  ├─ Traps (typically Layer 4-6)
  └─ Effects (typically Layer 5-9)
Layer 11: Walls
Layer 12: Regions (overlay)
Layer 13: Lights
Layer 14: Grid
Layer 15: Selection/Tools
```

**Actor Rendering Logic:**
```typescript
function renderActor(actor: EncounterActor) {
  const image = getActorImage(actor);
  const frame = actor.frame;

  return (
    <Group
      x={actor.position.x}
      y={actor.position.y}
      rotation={actor.rotation}
      draggable={!actor.isLocked}
    >
      {/* Frame border - ONLY for Actors */}
      <Rect
        x={frame.x}
        y={frame.y}
        width={frame.width}
        height={frame.height}
        stroke={actor.controlledBy ? 'blue' : 'black'}
        strokeWidth={2}
        dash={!actor.isVisible ? [5, 5] : undefined}
      />

      {/* Actor image */}
      <Image
        image={image}
        width={frame.width}
        height={frame.height}
      />

      {/* HP bar if damaged */}
      {actor.currentHP < actor.maxHP && (
        <HPBar hp={actor.currentHP} maxHP={actor.maxHP} />
      )}

      {/* Elevation indicator */}
      {actor.elevation > 0 && (
        <Text text={`↑${actor.elevation}`} />
      )}

      {/* Lock icon */}
      {actor.isLocked && <LockIcon />}
    </Group>
  );
}
```

**Prop Rendering Logic (NO FRAME):**
```typescript
function renderProp(prop: EncounterProp) {
  const image = getPropImage(prop);

  return (
    <Group
      x={prop.position.x}
      y={prop.position.y}
      rotation={prop.rotation}
      draggable={!prop.isLocked}
    >
      {/* NO FRAME - blends seamlessly */}

      {/* Prop image only */}
      <Image
        image={image}
        opacity={!prop.isVisible ? 0.3 : 1.0}
      />

      {/* State indicator */}
      {prop.state === 'damaged' && <DamagedOverlay />}
      {prop.state === 'destroyed' && <DestroyedOverlay />}
      {prop.openState === 'open' && <OpenIndicator />}

      {/* Lock icon */}
      {prop.isLocked && <LockIcon />}
    </Group>
  );
}
```

**Decoration Rendering Logic (Minimal):**
```typescript
function renderDecoration(decoration: EncounterDecoration) {
  const image = getDecorationImage(decoration);

  return (
    <Image
      x={decoration.position.x}
      y={decoration.position.y}
      rotation={decoration.rotation}
      image={image}
      opacity={!decoration.isVisible ? 0.3 : 1.0}
    />
  );
}
```

### 11.8 Context Menu Changes

**Actor Context Menu:**
- Set Frame
- Control Character
- Release Control
- Show/Hide
- Lock/Unlock
- Bring to Front
- Send to Back
- Duplicate
- Delete
- Copy to Clipboard
- Properties

**Prop Context Menu:**
- Change State → Intact/Damaged/Destroyed
- Toggle Open/Close (if container)
- Lock/Unlock
- Show/Hide
- Bring to Front
- Send to Back
- Duplicate
- Delete
- Properties

**Decoration Context Menu (Simplified):**
- Show/Hide
- Bring to Front
- Send to Back
- Duplicate
- Delete

**Trap Context Menu:**
- Arm
- Disarm
- Trigger
- Show/Hide (from players)
- Edit Trigger Area
- Delete
- Properties

**Effect Context Menu:**
- Activate
- Deactivate
- Extend Duration
- Edit Area
- Show/Hide
- Delete
- Properties

### 11.9 Asset Library Browser Changes

**Filter Bar:**
```
┌─────────────────────────────────────────────┐
│ [🔍 Search Assets]                          │
│                                             │
│ Kind: [All ▾] [Character] [Creature]       │
│       [Prop] [Decoration]                   │
│                                             │
│ Category: [All ▾] [Fantasy] [Sci-Fi]       │
│                                             │
│ Size: [All ▾] [Tiny...Gargantuan]          │
│                                             │
│ Tags: [dragon] [boss] [undead] [+]         │
└─────────────────────────────────────────────┘
```

**Asset Card (Actor):**
```
┌─────────────────────┐
│   [🎭 Thumbnail]    │
│                     │
│ Ancient Red Dragon  │
│ Creature • Huge     │
│ CR 24               │
│                     │
│ [📋 Details]        │
│ [➕ Add to Map]     │
└─────────────────────┘
```

**Asset Card (Prop):**
```
┌─────────────────────┐
│   [📦 Thumbnail]    │
│                     │
│ Treasure Chest      │
│ Prop • Large        │
│ Interactive         │
│                     │
│ [📋 Details]        │
│ [➕ Add to Map]     │
└─────────────────────┘
```

**Asset Card (Decoration):**
```
┌─────────────────────┐
│   [🌳 Thumbnail]    │
│                     │
│ Ancient Oak Tree    │
│ Decoration • Huge   │
│ Scenery             │
│                     │
│ [➕ Add to Map]     │
└─────────────────────┘
```

### 11.10 Bulk Asset Generation UI Updates

**Form Changes:**
- Kind dropdown now includes: Character, Creature, Prop, Decoration
- Remove "Effect" option
- Remove "Object" option
- Add validation: Decorations cannot have state
- Add validation: Props/Decorations cannot have frames

**Template JSON Structure:**
```json
{
  "items": [
    {
      "name": "Ancient Red Dragon",
      "kind": "Creature",
      "category": "Fantasy",
      "type": "Dragon",
      "subtype": "Red",
      "size": "huge",
      "description": "Ancient dragon with fire breath"
    },
    {
      "name": "Treasure Chest",
      "kind": "Prop",
      "category": "Furniture",
      "type": "Container",
      "size": "large",
      "description": "Locked wooden chest"
    },
    {
      "name": "Ancient Oak",
      "kind": "Decoration",
      "category": "Nature",
      "type": "Tree",
      "size": "huge",
      "description": "Old oak tree"
    }
  ],
  "generatePortrait": true,
  "generateToken": true
}
```

### 11.11 User Workflows

**Workflow 1: Adding Actor to Map**
1. User opens Actors panel
2. Clicks [+ Add] button
3. Modal opens with asset library
4. User filters by "Creature" and searches "dragon"
5. User selects "Ancient Red Dragon"
6. Actor appears on map at center with default frame
7. User drags to position
8. User adjusts frame handles to show desired portion
9. User sets rotation, elevation, layer as needed
10. User assigns control to Player 1

**Workflow 2: Adding Prop to Map**
1. User opens Props panel
2. Clicks [+ Add] button
3. Modal opens with asset library filtered to Props
4. User selects "Treasure Chest"
5. Prop appears on map at center (NO FRAME)
6. User drags to position
7. User sets rotation if needed
8. User sets state to "Closed"
9. User checks "Locked" checkbox

**Workflow 3: Creating Trap**
1. User opens Traps panel
2. Clicks [+ Add] button
3. Form appears:
   - Name: "Poison Dart Trap"
   - Trigger Type: "Pressure Plate"
   - Damage: "2d8"
   - Save: "Dexterity DC 15"
4. User clicks on map to set position
5. User drags circle handles to define trigger area (5ft radius)
6. Trap appears as semi-transparent danger icon (only DM can see)
7. State: "Armed"

**Workflow 4: Creating Spell Effect**
1. User casts "Wall of Fire" spell
2. User opens Effects panel
3. Clicks [+ Add] button
4. Form appears:
   - Name: "Wall of Fire"
   - Spell Level: 4
   - Duration: "Concentration, up to 1 minute"
   - Area: "60ft line, 20ft high, 1ft thick"
5. User clicks start point on map
6. User drags to define 60ft line
7. Effect renders as animated fire wall
8. Duration tracker starts: "10 rounds remaining"

**Workflow 5: Converting Object Asset to Prop/Decoration**
1. Migration tool runs
2. DM reviews list of converted assets
3. For each "Object" asset:
   - If interactive (chest, door): → Prop
   - If passive (tree, rock): → Decoration
4. DM can manually reclassify if needed
5. Encounters automatically update references

---

## 12. Testing Strategy

### 12.1 Unit Testing Requirements

**Backend Unit Tests (xUnit + FluentAssertions):**

**Domain Model Tests:**
```csharp
// EncounterActorTests.cs
public class EncounterActorTests {
    [Fact]
    public void Actor_Should_Have_Frame() {
        var actor = new EncounterActor {
            Frame = new Frame { Width = 100, Height = 100 }
        };

        actor.Frame.Should().NotBeNull();
        actor.Frame.Width.Should().Be(100);
    }

    [Fact]
    public void Actor_Should_Reference_Asset() {
        var assetId = Guid.NewGuid();
        var actor = new EncounterActor { AssetId = assetId };

        actor.AssetId.Should().Be(assetId);
    }

    [Fact]
    public void Actor_Should_Support_Control_Assignment() {
        var playerId = Guid.NewGuid();
        var actor = new EncounterActor { ControlledBy = playerId };

        actor.ControlledBy.Should().Be(playerId);
    }
}

// EncounterPropTests.cs
public class EncounterPropTests {
    [Fact]
    public void Prop_Should_NOT_Have_Frame() {
        var prop = new EncounterProp();

        var propType = typeof(EncounterProp);
        propType.GetProperty("Frame").Should().BeNull();
    }

    [Fact]
    public void Prop_Should_Have_State_Machine() {
        var prop = new EncounterProp { State = ObjectState.Intact };

        prop.State.Should().Be(ObjectState.Intact);

        // State transitions
        var damaged = prop with { State = ObjectState.Damaged };
        damaged.State.Should().Be(ObjectState.Damaged);
    }

    [Fact]
    public void Prop_Should_Support_Open_State() {
        var chest = new EncounterProp {
            OpenState = ObjectOpenState.Closed,
            IsLocked = true
        };

        chest.OpenState.Should().Be(ObjectOpenState.Closed);
        chest.IsLocked.Should().BeTrue();
    }

    [Fact]
    public void Prop_Must_Have_AssetId() {
        var prop = new EncounterProp { AssetId = Guid.NewGuid() };

        prop.AssetId.Should().NotBeEmpty();
    }
}

// EncounterDecorationTests.cs
public class EncounterDecorationTests {
    [Fact]
    public void Decoration_Should_Have_Minimal_Properties() {
        var decoration = new EncounterDecoration {
            Name = "Oak Tree",
            Position = new Position(100, 100),
            Rotation = 45,
            Layer = 2
        };

        decoration.Name.Should().Be("Oak Tree");
        decoration.Position.Should().Be(new Position(100, 100));

        // Should NOT have Frame, State, Elevation
        var decorationType = typeof(EncounterDecoration);
        decorationType.GetProperty("Frame").Should().BeNull();
        decorationType.GetProperty("State").Should().BeNull();
        decorationType.GetProperty("Elevation").Should().BeNull();
    }
}

// EncounterTrapTests.cs
public class EncounterTrapTests {
    [Fact]
    public void Trap_Should_Have_Trigger_Area() {
        var trap = new EncounterTrap {
            TriggerArea = new TriggerArea {
                Shape = AreaShape.Circle,
                Radius = 5
            }
        };

        trap.TriggerArea.Shape.Should().Be(AreaShape.Circle);
        trap.TriggerArea.Radius.Should().Be(5);
    }

    [Fact]
    public void Trap_Should_Support_State_Transitions() {
        var trap = new EncounterTrap { State = TrapState.Armed };

        trap.State.Should().Be(TrapState.Armed);

        var triggered = trap with { State = TrapState.Triggered };
        triggered.State.Should().Be(TrapState.Triggered);
    }
}

// EncounterEffectTests.cs
public class EncounterEffectTests {
    [Fact]
    public void Effect_Should_Support_Duration_Types() {
        var instantaneous = new EncounterEffect {
            DurationType = EffectDurationType.Instantaneous
        };
        instantaneous.DurationType.Should().Be(EffectDurationType.Instantaneous);

        var concentration = new EncounterEffect {
            DurationType = EffectDurationType.Concentration,
            DurationValue = 10 // 10 rounds
        };
        concentration.DurationType.Should().Be(EffectDurationType.Concentration);
        concentration.DurationValue.Should().Be(10);
    }

    [Fact]
    public void Effect_Should_Have_Area_Definition() {
        var effect = new EncounterEffect {
            Area = new EffectArea {
                Shape = AreaShape.Line,
                Length = 60,
                Width = 5
            }
        };

        effect.Area.Shape.Should().Be(AreaShape.Line);
        effect.Area.Length.Should().Be(60);
    }
}
```

**Service Layer Tests:**
```csharp
// EncounterServiceTests.cs
public class EncounterServiceTests {
    [Fact]
    public async Task AddActor_Should_Add_To_Actors_Collection() {
        var service = CreateService();
        var encounterId = Guid.NewGuid();
        var actor = new EncounterActor { /* ... */ };

        await service.AddActorAsync(encounterId, actor);

        var encounter = await service.GetByIdAsync(encounterId);
        encounter.Actors.Should().Contain(actor);
    }

    [Fact]
    public async Task RemoveActor_Should_Remove_From_Collection() {
        var service = CreateService();
        var encounterId = Guid.NewGuid();
        var actorIndex = (ushort)0;

        await service.RemoveActorAsync(encounterId, actorIndex);

        var encounter = await service.GetByIdAsync(encounterId);
        encounter.Actors.Should().NotContain(a => a.Index == actorIndex);
    }

    [Fact]
    public async Task UpdatePropState_Should_Change_State() {
        var service = CreateService();
        var encounterId = Guid.NewGuid();
        var propIndex = (ushort)0;

        await service.UpdatePropStateAsync(encounterId, propIndex, ObjectState.Damaged);

        var encounter = await service.GetByIdAsync(encounterId);
        var prop = encounter.Props.First(p => p.Index == propIndex);
        prop.State.Should().Be(ObjectState.Damaged);
    }
}
```

**Repository Tests:**
```csharp
// EncounterStorageTests.cs
public class EncounterStorageTests {
    [Fact]
    public async Task SaveAsync_Should_Persist_All_Collections() {
        var storage = CreateStorage();
        var encounter = new Encounter {
            Id = Guid.NewGuid(),
            Actors = [new EncounterActor { /* ... */ }],
            Props = [new EncounterProp { /* ... */ }],
            Decorations = [new EncounterDecoration { /* ... */ }],
            Traps = [new EncounterTrap { /* ... */ }],
            Effects = [new EncounterEffect { /* ... */ }]
        };

        await storage.SaveAsync(encounter);

        var loaded = await storage.LoadAsync(encounter.Id);
        loaded.Actors.Should().HaveCount(1);
        loaded.Props.Should().HaveCount(1);
        loaded.Decorations.Should().HaveCount(1);
        loaded.Traps.Should().HaveCount(1);
        loaded.Effects.Should().HaveCount(1);
    }
}
```

**Frontend Unit Tests (Vitest + Testing Library):**

**Type Tests:**
```typescript
// domain.test.ts
describe('EncounterActor', () => {
  it('should have frame property', () => {
    const actor: EncounterActor = {
      index: 0,
      assetId: 'guid',
      position: { x: 0, y: 0 },
      frame: { x: 0, y: 0, width: 100, height: 100 },
      // ...
    };

    expect(actor.frame).toBeDefined();
  });

  it('should support controlledBy property', () => {
    const actor: EncounterActor = {
      /* ... */
      controlledBy: 'player-guid',
    };

    expect(actor.controlledBy).toBe('player-guid');
  });
});

describe('EncounterProp', () => {
  it('should NOT have frame property', () => {
    const prop: EncounterProp = {
      index: 0,
      assetId: 'guid',
      position: { x: 0, y: 0 },
      // @ts-expect-error - frame should not exist
      frame: { x: 0, y: 0, width: 100, height: 100 },
    };

    // Type error expected
  });

  it('should have state property', () => {
    const prop: EncounterProp = {
      /* ... */
      state: 'intact',
    };

    expect(prop.state).toBe('intact');
  });
});
```

**Component Tests:**
```typescript
// ActorPanel.test.tsx
describe('ActorPanel', () => {
  it('should render actor list', () => {
    const actors: EncounterActor[] = [/* ... */];
    render(<ActorPanel actors={actors} />);

    expect(screen.getByText('ACTORS')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument(); // count
  });

  it('should filter by character/creature', () => {
    render(<ActorPanel actors={mockActors} />);

    const filter = screen.getByLabelText('Filter');
    fireEvent.click(filter);
    fireEvent.click(screen.getByText('Characters'));

    expect(screen.queryByText('Ancient Red Dragon')).not.toBeInTheDocument();
  });
});

// PlacedEntity.test.tsx
describe('PlacedEntity', () => {
  it('should render frame for actors only', () => {
    const { container } = render(
      <Stage>
        <Layer>
          <PlacedEntity entity={mockActor} type="actor" />
        </Layer>
      </Stage>
    );

    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThan(0); // Frame border exists
  });

  it('should NOT render frame for props', () => {
    const { container } = render(
      <Stage>
        <Layer>
          <PlacedEntity entity={mockProp} type="prop" />
        </Layer>
      </Stage>
    );

    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBe(0); // No frame border
  });
});
```

**Target Coverage:**
- Backend: ≥80% line coverage
- Frontend: ≥70% line coverage
- Domain Model: 100% coverage (critical)
- Service Layer: ≥90% coverage

### 12.2 Integration Testing

**Backend Integration Tests:**

**Database Integration:**
```csharp
[Collection("Database")]
public class EncounterDatabaseIntegrationTests {
    [Fact]
    public async Task Should_Persist_Complete_Encounter_Graph() {
        var encounter = CreateCompleteEncounter();

        await _dbContext.Encounters.AddAsync(encounter);
        await _dbContext.SaveChangesAsync();

        // Clear context to force fresh load
        _dbContext.ChangeTracker.Clear();

        var loaded = await _dbContext.Encounters
            .Include(e => e.Actors)
            .Include(e => e.Props)
            .Include(e => e.Decorations)
            .Include(e => e.Audio)
            .Include(e => e.Videos)
            .Include(e => e.Sprites)
            .Include(e => e.Traps)
            .Include(e => e.Effects)
            .FirstAsync(e => e.Id == encounter.Id);

        loaded.Actors.Should().HaveCount(encounter.Actors.Count);
        loaded.Props.Should().HaveCount(encounter.Props.Count);
        // ... verify all collections
    }

    [Fact]
    public async Task Should_Handle_Concurrent_Updates() {
        var encounterId = Guid.NewGuid();

        // Simulate two users updating different elements
        var task1 = UpdateActorAsync(encounterId, 0);
        var task2 = UpdatePropAsync(encounterId, 0);

        await Task.WhenAll(task1, task2);

        // Both updates should succeed without conflicts
        var encounter = await LoadEncounterAsync(encounterId);
        encounter.Actors[0].Should().NotBeNull();
        encounter.Props[0].Should().NotBeNull();
    }
}
```

**API Integration:**
```csharp
[Collection("WebAPI")]
public class EncounterApiIntegrationTests {
    [Fact]
    public async Task POST_Actors_Should_Add_Actor() {
        var request = new AddActorRequest { /* ... */ };

        var response = await _client.PostAsJsonAsync(
            $"/api/v2/encounters/{_encounterId}/actors",
            request
        );

        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var getResponse = await _client.GetAsync($"/api/v2/encounters/{_encounterId}");
        var encounter = await getResponse.Content.ReadFromJsonAsync<EncounterDto>();
        encounter.Actors.Should().HaveCount(1);
    }

    [Fact]
    public async Task PUT_Props_Should_Update_State() {
        var request = new UpdatePropStateRequest { State = "damaged" };

        var response = await _client.PutAsJsonAsync(
            $"/api/v2/encounters/{_encounterId}/props/0/state",
            request
        );

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var encounter = await GetEncounterAsync(_encounterId);
        encounter.Props[0].State.Should().Be("damaged");
    }
}
```

**Frontend Integration Tests:**

**RTK Query Integration:**
```typescript
// encounterApi.test.ts
describe('Encounter API Integration', () => {
  it('should add actor via mutation', async () => {
    const { result } = renderHook(() => useAddActorMutation(), {
      wrapper: createStoreWrapper(),
    });

    const actor: EncounterActor = { /* ... */ };
    await result.current[0]({ encounterId: 'guid', actor });

    expect(result.current[1].isSuccess).toBe(true);
  });

  it('should update prop state', async () => {
    const { result } = renderHook(() => useUpdatePropStateMutation(), {
      wrapper: createStoreWrapper(),
    });

    await result.current[0]({
      encounterId: 'guid',
      propIndex: 0,
      state: 'damaged',
    });

    expect(result.current[1].isSuccess).toBe(true);
  });
});
```

### 12.3 End-to-End Testing

**E2E Scenarios (Playwright):**

**Scenario 1: Complete Actor Workflow**
```typescript
test('DM can add, configure, and control actor', async ({ page }) => {
  await page.goto('/encounters/test-encounter');

  // Open Actors panel
  await page.click('text=ACTORS');

  // Add new actor
  await page.click('text=Add');

  // Select from library
  await page.click('text=Ancient Red Dragon');

  // Verify actor appears on map
  await expect(page.locator('canvas')).toContainElement('[data-entity-type="actor"]');

  // Configure frame
  await page.click('[data-entity-index="0"]');
  await page.fill('[name="frame.width"]', '100');
  await page.fill('[name="frame.height"]', '100');

  // Assign control
  await page.selectOption('[name="controlledBy"]', 'player-1');

  // Verify in panel
  await expect(page.locator('.actor-list-item')).toContainText('Controlled by: Player 1');
});
```

**Scenario 2: Prop Interaction**
```typescript
test('DM can place and interact with prop', async ({ page }) => {
  await page.goto('/encounters/test-encounter');

  // Add treasure chest
  await page.click('text=PROPS');
  await page.click('text=Add');
  await page.click('text=Treasure Chest');

  // Verify NO frame controls appear
  await expect(page.locator('[name="frame.width"]')).not.toBeVisible();

  // Set state
  await page.selectOption('[name="state"]', 'closed');
  await page.check('[name="isLocked"]');

  // Context menu
  await page.click('[data-prop-index="0"]', { button: 'right' });
  await expect(page.locator('text=Toggle Open/Close')).toBeVisible();

  // Toggle open
  await page.click('text=Toggle Open/Close');
  await expect(page.locator('[data-prop-index="0"]')).toHaveAttribute('data-open-state', 'open');
});
```

**Scenario 3: Trap Creation and Triggering**
```typescript
test('DM can create and trigger trap', async ({ page }) => {
  await page.goto('/encounters/test-encounter');

  // Create trap
  await page.click('text=TRAPS');
  await page.click('text=Add');
  await page.fill('[name="name"]', 'Poison Dart Trap');
  await page.selectOption('[name="triggerType"]', 'pressure');
  await page.fill('[name="damage"]', '2d8');
  await page.selectOption('[name="saveType"]', 'dexterity');
  await page.fill('[name="saveDC"]', '15');

  // Place on map
  await page.click('canvas', { position: { x: 200, y: 200 } });

  // Verify trap appears (DM only)
  await expect(page.locator('[data-trap-index="0"]')).toBeVisible();

  // Trigger trap
  await page.click('[data-trap-index="0"]', { button: 'right' });
  await page.click('text=Trigger');
  await expect(page.locator('[data-trap-state="triggered"]')).toBeVisible();
});
```

**Scenario 4: Migration Verification**
```typescript
test('Existing encounter migrates correctly', async ({ page }) => {
  // Load pre-migration encounter
  await page.goto('/encounters/legacy-encounter');

  // Verify old assets converted to actors/props
  await expect(page.locator('[data-entity-type="actor"]')).toHaveCount(5);
  await expect(page.locator('[data-entity-type="prop"]')).toHaveCount(3);
  await expect(page.locator('[data-entity-type="decoration"]')).toHaveCount(10);

  // Verify no "assets" panel exists
  await expect(page.locator('text=Assets Panel')).not.toBeVisible();

  // Verify new panels exist
  await expect(page.locator('text=ACTORS')).toBeVisible();
  await expect(page.locator('text=PROPS')).toBeVisible();
  await expect(page.locator('text=DECORATIONS')).toBeVisible();
});
```

### 12.4 Migration Testing

**Pre-Migration Test Data:**
```sql
-- Create test encounter with old schema
INSERT INTO Encounters (Id, Name) VALUES ('test-guid', 'Test Encounter');

INSERT INTO EncounterAssets (EncounterId, [Index], AssetId, Name, Position, Frame, ...)
VALUES
  ('test-guid', 0, 'dragon-guid', 'Red Dragon', '{"x":100,"y":100}', '{"width":100,"height":100}', ...),
  ('test-guid', 1, 'chest-guid', 'Chest', '{"x":200,"y":200}', NULL, ...),
  ('test-guid', 2, 'tree-guid', 'Oak Tree', '{"x":300,"y":300}', NULL, ...);

INSERT INTO AssetKind VALUES (0, 'Creature'), (1, 'Object'), (2, 'Object');
```

**Migration Test:**
```csharp
[Fact]
public async Task Migration_Should_Convert_Assets_To_Appropriate_Types() {
    // Arrange: Create encounter with old schema
    await SeedLegacyEncounterAsync();

    // Act: Run migration
    await RunMigrationAsync();

    // Assert: Verify conversion
    var encounter = await LoadEncounterAsync("test-guid");

    // Dragon (Creature + Frame) → Actor
    encounter.Actors.Should().HaveCount(1);
    encounter.Actors[0].Name.Should().Be("Red Dragon");
    encounter.Actors[0].Frame.Should().NotBeNull();

    // Chest (Object + interactive) → Prop
    encounter.Props.Should().HaveCount(1);
    encounter.Props[0].Name.Should().Be("Chest");
    encounter.Props[0].State.Should().Be(ObjectState.Intact);

    // Tree (Object + passive) → Decoration
    encounter.Decorations.Should().HaveCount(1);
    encounter.Decorations[0].Name.Should().Be("Oak Tree");
}

[Fact]
public async Task Migration_Should_Preserve_All_Data() {
    await SeedLegacyEncounterAsync();
    var before = await CaptureEncounterStateAsync("test-guid");

    await RunMigrationAsync();

    var after = await LoadEncounterAsync("test-guid");

    // Verify no data loss
    var totalBefore = before.AssetCount + before.SoundCount;
    var totalAfter = after.Actors.Count + after.Props.Count +
                    after.Decorations.Count + after.Audio.Count;
    totalAfter.Should().Be(totalBefore);
}
```

### 12.5 Regression Testing

**Regression Test Suite:**

**Critical User Journeys:**
1. Create new encounter
2. Add 5 actors from library
3. Add 3 props
4. Add 2 traps
5. Create 1 spell effect
6. Assign player control to actors
7. Save encounter
8. Load encounter
9. Verify all elements present
10. Export encounter JSON

**Automated Regression Tests:**
```typescript
describe('Regression: Critical Paths', () => {
  test('Complete encounter creation workflow', async () => {
    // Multi-step test covering entire user journey
    // ...
  });

  test('Backward compatibility with V1 API', async () => {
    // Verify V1 endpoints still work during deprecation
    // ...
  });

  test('Performance: Load encounter with 100 elements', async () => {
    const start = performance.now();
    await loadEncounter('large-encounter-guid');
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(2000); // < 2 seconds
  });
});
```

### 12.6 Test Data Management

**Test Fixtures:**
```csharp
public static class EncounterFixtures {
    public static Encounter CreateTestEncounter() => new() {
        Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
        Name = "Test Encounter",
        Actors = [
            new EncounterActor {
                Index = 0,
                Name = "Test Dragon",
                AssetId = Guid.Parse("00000000-0000-0000-0000-000000000010"),
                Position = new Position(100, 100),
                Frame = new Frame { Width = 100, Height = 100 }
            }
        ],
        Props = [
            new EncounterProp {
                Index = 0,
                Name = "Test Chest",
                AssetId = Guid.Parse("00000000-0000-0000-0000-000000000020"),
                Position = new Position(200, 200),
                State = ObjectState.Intact
            }
        ],
        // ... more fixtures
    };
}
```

**Test Database Seeding:**
```csharp
public class TestDatabaseSeeder {
    public async Task SeedAsync(AppDbContext context) {
        // Clear existing data
        await context.Database.EnsureDeletedAsync();
        await context.Database.EnsureCreatedAsync();

        // Seed test data
        await context.Encounters.AddAsync(EncounterFixtures.CreateTestEncounter());
        await context.Assets.AddRangeAsync(AssetFixtures.CreateTestAssets());
        await context.SaveChangesAsync();
    }
}
```

### 12.7 Test Execution Strategy

**Development (Local):**
```bash
# Backend unit tests
dotnet test Source/VttTools.slnx --filter Category=Unit

# Frontend unit tests
npm test -- --run

# Fast feedback loop
dotnet watch test
```

**CI Pipeline (GitHub Actions):**
```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Unit Tests
        run: dotnet test --filter Category=Unit
      - name: Run Integration Tests
        run: dotnet test --filter Category=Integration
      - name: Upload Coverage
        uses: codecov/codecov-action@v3

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Unit Tests
        run: npm test -- --run --coverage
      - name: Upload Coverage
        uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run E2E Tests
        run: npm run test:e2e
```

**Pre-Deployment (Staging):**
```bash
# Full regression suite
dotnet test Source/VttTools.slnx
npm test -- --run
npm run test:e2e

# Migration tests
dotnet test --filter Category=Migration

# Performance tests
npm run test:performance
```

---

## 13. Implementation Roadmap

### 13.1 High-Level Phasing Strategy

**Phase 1: Foundation (Weeks 1-3)**
- Domain model implementation
- Database schema changes
- Core service layer updates
- No UI changes yet

**Phase 2: Backend Infrastructure (Weeks 4-6)**
- New API endpoints (V2)
- Repository layer updates
- Command pattern updates
- Backend testing suite

**Phase 3: Frontend Core (Weeks 7-10)**
- TypeScript type updates
- RTK Query API updates
- Core rendering logic changes
- Component library updates

**Phase 4: Encounter Editor (Weeks 11-15)**
- Panel reorganization
- Canvas rendering updates
- Context menus
- Drag-and-drop updates
- Editor testing

**Phase 5: Migration & Admin (Weeks 16-18)**
- Database migration scripts
- Admin UI updates
- Bulk generation updates
- Migration testing

**Phase 6: Polish & Deploy (Weeks 19-20)**
- E2E testing
- Performance optimization
- Documentation
- Staged rollout

**Total Duration: ~20 weeks (5 months)**

### 13.2 Detailed Phase Breakdown

#### Phase 1: Foundation (Weeks 1-3)

**Week 1: Domain Model Implementation**

Day 1-2: Create new entity files
```
✓ Source/Domain/Library/Encounters/Model/EncounterElement.cs
✓ Source/Domain/Library/Encounters/Model/EncounterActor.cs
✓ Source/Domain/Library/Encounters/Model/EncounterProp.cs
✓ Source/Domain/Library/Encounters/Model/EncounterDecoration.cs
✓ Source/Domain/Library/Encounters/Model/EncounterAudio.cs
✓ Source/Domain/Library/Encounters/Model/EncounterVideo.cs
✓ Source/Domain/Library/Encounters/Model/EncounterSprite.cs
✓ Source/Domain/Library/Encounters/Model/EncounterTrap.cs
✓ Source/Domain/Library/Encounters/Model/EncounterEffect.cs
```

Day 3-4: Supporting types and enums
```
✓ Source/Domain/Assets/Model/AssetKind.cs (update)
✓ Source/Domain/Library/Encounters/Model/ObjectState.cs (new)
✓ Source/Domain/Library/Encounters/Model/ObjectOpenState.cs (new)
✓ Source/Domain/Library/Encounters/Model/TrapState.cs (new)
✓ Source/Domain/Library/Encounters/Model/EffectDurationType.cs (new)
✓ Source/Domain/Library/Encounters/Model/AreaShape.cs (new)
```

Day 5: Update Encounter aggregate root
```
✓ Source/Domain/Library/Encounters/Model/Encounter.cs
  - Add new collections
  - Keep old collections (for migration)
  - Add migration flag
```

**Week 2: Database Schema**

Day 1-2: Create new tables
```sql
-- Migration: 20250101_AddEncounterElements.sql
CREATE TABLE EncounterActors (...);
CREATE TABLE EncounterProps (...);
CREATE TABLE EncounterDecorations (...);
CREATE TABLE EncounterAudio (...);
CREATE TABLE EncounterVideos (...);
CREATE TABLE EncounterSprites (...);
CREATE TABLE EncounterTraps (...);
CREATE TABLE EncounterEffects (...);
```

Day 3-4: Schema builders and mappers
```
✓ Source/Data/SchemaBuilders/EncounterActorSchemaBuilder.cs
✓ Source/Data/SchemaBuilders/EncounterPropSchemaBuilder.cs
✓ Source/Data/SchemaBuilders/EncounterDecorationSchemaBuilder.cs
✓ Source/Data/Mappers/EncounterActorMapper.cs
✓ Source/Data/Mappers/EncounterPropMapper.cs
... (6 more)
```

Day 5: Integration testing
```
✓ Test database creation
✓ Test insert/update/delete operations
✓ Test EF Core includes
```

**Week 3: Core Service Layer**

Day 1-3: Service method implementations
```csharp
// IEncounterService updates
Task<Encounter> AddActorAsync(Guid encounterId, EncounterActor actor);
Task<Encounter> UpdateActorAsync(Guid encounterId, ushort index, EncounterActor actor);
Task<Encounter> RemoveActorAsync(Guid encounterId, ushort index);
// ... repeat for Props, Decorations, Traps, Effects (40 methods total)
```

Day 4-5: Unit testing
```
✓ 9 entity types × 3 operations (add/update/remove) = 27 tests
✓ State transition tests
✓ Validation tests
```

**Deliverables:**
- ✅ 9 new domain entities
- ✅ 8 new database tables
- ✅ 16 schema builders/mappers
- ✅ 40+ new service methods
- ✅ 100+ unit tests
- ✅ Builds successfully with no runtime changes

#### Phase 2: Backend Infrastructure (Weeks 4-6)

**Week 4: API Contracts**

Day 1-2: Request/Response DTOs
```
✓ Source/Domain/Library/Encounters/ApiContracts/AddActorRequest.cs
✓ Source/Domain/Library/Encounters/ApiContracts/UpdateActorRequest.cs
✓ Source/Domain/Library/Encounters/ApiContracts/ActorDto.cs
... (30 total files)
```

Day 3-5: Controller implementations
```csharp
// EncounterActorsController.cs
[Route("api/v2/encounters/{encounterId}/actors")]
public class EncounterActorsController {
    [HttpGet]
    Task<ActionResult<List<ActorDto>>> GetAllAsync(Guid encounterId);

    [HttpPost]
    Task<ActionResult<ActorDto>> AddAsync(Guid encounterId, AddActorRequest request);

    [HttpPut("{index}")]
    Task<ActionResult<ActorDto>> UpdateAsync(Guid encounterId, ushort index, UpdateActorRequest request);

    [HttpDelete("{index}")]
    Task<ActionResult> DeleteAsync(Guid encounterId, ushort index);
}
// ... 8 more controllers (Props, Decorations, Traps, Effects, Audio, Video, Sprites, Traps)
```

**Week 5: Command Pattern Updates**

Day 1-3: New commands
```
✓ Source/Domain/Library/Encounters/Commands/AddActorCommand.cs
✓ Source/Domain/Library/Encounters/Commands/UpdateActorCommand.cs
✓ Source/Domain/Library/Encounters/Commands/RemoveActorCommand.cs
✓ Source/Domain/Library/Encounters/Commands/UpdatePropStateCommand.cs
... (40 total commands)
```

Day 4-5: Undo/Redo support
```
✓ Command execute() implementations
✓ Command undo() implementations
✓ Integration with existing command manager
```

**Week 6: Backend Testing**

Day 1-2: Integration tests
```
✓ API endpoint tests (40 endpoints)
✓ Database integration tests
✓ Concurrency tests
```

Day 3-4: Migration preparation
```sql
-- Test migration script
BEGIN TRANSACTION;
  -- Copy EncounterAssets → Actors/Props/Decorations
  -- Copy EncounterSounds → Audio
  -- Verify data integrity
ROLLBACK; -- Don't commit yet
```

Day 5: Documentation
```
✓ API documentation (Swagger)
✓ Service layer documentation
✓ Migration guide
```

**Deliverables:**
- ✅ 9 new API controllers
- ✅ ~45 new API endpoints
- ✅ 40 new commands with undo support
- ✅ 100+ integration tests
- ✅ Migration script (tested but not run)
- ✅ API documentation

#### Phase 3: Frontend Core (Weeks 7-10)

**Week 7: TypeScript Types**

Day 1-2: Domain type definitions
```typescript
// src/types/domain.ts
export interface EncounterElement { /* ... */ }
export interface EncounterActor extends EncounterElement { /* ... */ }
export interface EncounterProp extends EncounterElement { /* ... */ }
... (9 types total)
```

Day 3-4: API type definitions
```typescript
// src/types/api.ts
export type AddActorRequest = { /* ... */ };
export type UpdateActorRequest = { /* ... */ };
... (30 types total)
```

Day 5: Type testing
```
✓ Compile-time type checking
✓ Type narrowing tests
✓ Discriminated union tests
```

**Week 8: RTK Query API**

Day 1-3: API slice updates
```typescript
// src/services/api/encounterApi.ts
export const encounterApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Actors
    getActors: builder.query<EncounterActor[], string>({ /* ... */ }),
    addActor: builder.mutation<EncounterActor, AddActorRequest>({ /* ... */ }),
    updateActor: builder.mutation<EncounterActor, UpdateActorRequest>({ /* ... */ }),
    removeActor: builder.mutation<void, RemoveActorRequest>({ /* ... */ }),
    // ... repeat for 8 more element types (40 endpoints)
  }),
});
```

Day 4-5: Hook generation and testing
```typescript
export const {
  useGetActorsQuery,
  useAddActorMutation,
  useUpdateActorMutation,
  useRemoveActorMutation,
  // ... 36 more hooks
} = encounterApi;
```

**Week 9: Rendering Logic**

Day 1-2: Base rendering components
```typescript
// src/components/encounter/rendering/PlacedElement.tsx
export function PlacedElement({ element, type }: PlacedElementProps) {
  switch (type) {
    case 'actor': return <ActorRenderer actor={element as EncounterActor} />;
    case 'prop': return <PropRenderer prop={element as EncounterProp} />;
    case 'decoration': return <DecorationRenderer decoration={element as EncounterDecoration} />;
    // ... 6 more cases
  }
}
```

Day 3-4: Type-specific renderers
```
✓ src/components/encounter/rendering/ActorRenderer.tsx (WITH frame)
✓ src/components/encounter/rendering/PropRenderer.tsx (NO frame)
✓ src/components/encounter/rendering/DecorationRenderer.tsx (minimal)
✓ src/components/encounter/rendering/TrapRenderer.tsx
✓ src/components/encounter/rendering/EffectRenderer.tsx
```

Day 5: Rendering tests
```
✓ Frame rendering for actors only
✓ State indicators for props
✓ Minimal rendering for decorations
✓ Visibility/opacity tests
```

**Week 10: Component Library Updates**

Day 1-3: Panel components
```
✓ src/components/encounter/panels/ActorPanel.tsx
✓ src/components/encounter/panels/PropPanel.tsx
✓ src/components/encounter/panels/DecorationPanel.tsx
✓ src/components/encounter/panels/TrapPanel.tsx
✓ src/components/encounter/panels/EffectPanel.tsx
... (9 total panels)
```

Day 4-5: Component testing
```
✓ Panel rendering tests
✓ Filter functionality tests
✓ Add/remove item tests
✓ State management tests
```

**Deliverables:**
- ✅ 40 TypeScript types
- ✅ 40 RTK Query endpoints
- ✅ 9 rendering components
- ✅ 9 panel components
- ✅ 150+ component tests
- ✅ No UI visible to users yet (feature flag)

#### Phase 4: Encounter Editor (Weeks 11-15)

**Week 11-12: Panel Integration**

Day 1-5: Left toolbar reorganization
```
✓ src/components/encounter/LeftToolbar.tsx
  - Add category headers (Game/Media/Interactive/Structural)
  - Add 6 new panels
  - Implement collapse/expand logic
  - Wire up event handlers
```

Day 6-10: Property editors
```
✓ Frame editor for actors (X, Y, Width, Height inputs + visual handles)
✓ State editor for props (dropdown + open/close toggle)
✓ Trap editor (trigger area, damage, saves)
✓ Effect editor (area, duration, spell level)
```

**Week 13: Canvas Updates**

Day 1-3: Konva layer management
```
✓ Update layer stack (0-15)
✓ Dynamic layer assignment per element
✓ Layer reordering (bring to front/send to back)
```

Day 4-5: Selection and manipulation
```
✓ Multi-select support (all element types)
✓ Drag-and-drop (with layer constraints)
✓ Rotation handles
✓ Frame resize handles (actors only)
```

**Week 14: Context Menus**

Day 1-2: Menu definitions
```
✓ Actor context menu (12 items)
✓ Prop context menu (9 items)
✓ Decoration context menu (5 items)
✓ Trap context menu (7 items)
✓ Effect context menu (7 items)
```

Day 3-5: Menu actions
```
✓ State transitions (props)
✓ Control assignment (actors)
✓ Trigger/Arm/Disarm (traps)
✓ Activate/Deactivate (effects)
✓ Visibility toggles
```

**Week 15: Integration Testing**

Day 1-3: E2E workflows
```
✓ Complete actor workflow (add → configure → control)
✓ Prop interaction workflow
✓ Trap creation workflow
✓ Effect creation workflow
```

Day 4-5: Performance testing
```
✓ Load encounter with 100 elements
✓ Canvas rendering performance (60 FPS)
✓ Memory leak detection
```

**Deliverables:**
- ✅ Reorganized left toolbar with 13 panels
- ✅ 9 element type property editors
- ✅ Updated Konva rendering with 15 layers
- ✅ 5 context menu implementations
- ✅ 20+ E2E tests
- ✅ Performance benchmarks

#### Phase 5: Migration & Admin (Weeks 16-18)

**Week 16: Database Migration**

Day 1-2: Migration script finalization
```sql
-- Production migration: 20250201_MigrateEncounterElements.sql
BEGIN TRANSACTION;
  -- Phase 1: Copy data
  INSERT INTO EncounterActors (...)
  SELECT ... FROM EncounterAssets WHERE ...;

  INSERT INTO EncounterProps (...)
  SELECT ... FROM EncounterAssets WHERE ...;

  -- Phase 2: Verify counts match
  -- Phase 3: Update Encounter.IsMigrated flag
  -- Phase 4: Keep old tables for rollback
COMMIT;
```

Day 3-4: Rollback script
```sql
-- Rollback: 20250201_RollbackEncounterElements.sql
BEGIN TRANSACTION;
  -- Restore from old tables
  -- Clear new tables
  -- Reset IsMigrated flag
COMMIT;
```

Day 5: Migration testing
```
✓ Test on staging database (1M encounters)
✓ Verify data integrity
✓ Performance benchmarks (< 1 hour)
✓ Rollback test
```

**Week 17: Admin UI Updates**

Day 1-3: Asset Library updates
```
✓ src/pages/admin/AssetLibrary.tsx
  - Update filters (remove Effect/Object, add Prop/Decoration)
  - Update asset cards
  - Update bulk actions
```

Day 4-5: Bulk Generation Form
```
✓ src/components/aiSupport/BulkAssetGenerationForm.tsx
  - Update Kind dropdown
  - Add validation rules
  - Update template download
```

**Week 18: AI Generation Updates**

Day 1-3: Prompt engineering
```
✓ Update prop generation prompts
✓ Update decoration generation prompts
✓ Add trap generation prompts
✓ Add effect generation prompts
```

Day 4-5: Testing
```
✓ Generate 100 test props
✓ Generate 100 test decorations
✓ Verify quality meets standards
```

**Deliverables:**
- ✅ Production migration script (tested)
- ✅ Rollback script (tested)
- ✅ Updated admin UI
- ✅ Updated AI generation
- ✅ Migration guide documentation

#### Phase 6: Polish & Deploy (Weeks 19-20)

**Week 19: Final Testing**

Day 1-2: Regression testing
```
✓ All critical user journeys
✓ Backward compatibility (V1 API)
✓ Cross-browser testing
✓ Mobile responsiveness
```

Day 3-4: Performance optimization
```
✓ Code splitting
✓ Lazy loading for panels
✓ Image optimization
✓ Bundle size analysis
```

Day 5: Security audit
```
✓ OWASP top 10 check
✓ Input validation review
✓ Authorization checks
✓ SQL injection prevention
```

**Week 20: Deployment**

Day 1: Staging deployment
```
✓ Deploy to staging environment
✓ Run smoke tests
✓ Performance monitoring
```

Day 2: Migration execution
```
✓ Database backup
✓ Run migration script (production)
✓ Verify data integrity
✓ Enable new UI (feature flag)
```

Day 3: Production deployment
```
✓ Deploy backend (V2 API)
✓ Deploy frontend (with feature flag)
✓ Monitor error rates
✓ Enable for 10% of users
```

Day 4-5: Gradual rollout
```
✓ 25% of users
✓ 50% of users
✓ 100% of users
✓ Deprecate V1 API (6-month timeline)
```

**Deliverables:**
- ✅ Production deployment
- ✅ Migration completed
- ✅ 100% user rollout
- ✅ V1 deprecation notice
- ✅ Post-deployment monitoring

### 13.3 Parallel Work Streams

**Stream A: Domain + Backend (can run parallel)**
- Domain model implementation (Week 1)
- Database schema (Week 2)
- Service layer (Week 3)
- API contracts (Week 4)
- Commands (Week 5)

**Stream B: Frontend Core (depends on API contracts)**
- TypeScript types (Week 7 - starts after Week 4)
- RTK Query (Week 8)
- Rendering (Week 9)
- Components (Week 10)

**Stream C: Editor UI (depends on components)**
- Panel integration (Week 11-12)
- Canvas updates (Week 13)
- Context menus (Week 14)
- E2E testing (Week 15)

**Stream D: Migration + Admin (can run parallel with C)**
- Migration scripts (Week 16)
- Admin UI (Week 17)
- AI updates (Week 18)

**Stream E: QA + Deploy (final)**
- Testing (Week 19)
- Deployment (Week 20)

### 13.4 Dependencies and Blockers

**Critical Path:**
```
Domain Model → Database Schema → Service Layer → API Contracts →
TypeScript Types → RTK Query → Rendering → Components →
Panel Integration → E2E Testing → Migration → Deployment
```

**Potential Blockers:**
1. **Database migration performance**: Large datasets (>1M encounters)
   - Mitigation: Batch processing, parallel execution
2. **UI complexity**: 13 panels in limited sidebar space
   - Mitigation: Collapsible sections, UX testing
3. **Backward compatibility**: V1 API must remain functional
   - Mitigation: Maintain old code paths, deprecation timeline
4. **Testing coverage**: 200+ new test cases needed
   - Mitigation: Parallel test writing, automated generation

### 13.5 Resource Allocation

**Backend Developer (1 FTE):**
- Weeks 1-6: Domain, database, API
- Weeks 16-18: Migration, deployment support
- Total: 9 weeks

**Frontend Developer (1 FTE):**
- Weeks 7-15: Types, components, editor
- Weeks 17-20: Admin UI, deployment
- Total: 13 weeks

**QA Engineer (0.5 FTE):**
- Weeks 1-20: Continuous testing
- Focus weeks 15, 19-20 (E2E, regression)

**DevOps (0.25 FTE):**
- Weeks 2, 16, 20: Database migrations, deployments

**Total Effort: ~2.75 FTE × 20 weeks = 55 FTE-weeks**

---

## 14. Risk Assessment

### 14.1 Technical Risks

#### Risk T1: Data Loss During Migration (HIGH)

**Impact:** Critical - User data loss, reputation damage
**Probability:** Low (with proper testing)

**Mitigation:**
- Complete database backup before migration
- Dry-run migration on staging with production data copy
- Rollback script tested and ready
- Data integrity verification queries
- Keep old tables for 6 months as backup

**Contingency:**
- Immediate rollback capability
- Manual data recovery process documented
- Customer communication plan

#### Risk T2: Performance Degradation (MEDIUM)

**Impact:** High - Slow encounter loading, poor UX
**Probability:** Medium

**Mitigation:**
- Database indexing strategy for new tables
- Query optimization and EXPLAIN analysis
- Lazy loading for encounter elements
- Canvas rendering optimization (virtualization)
- Load testing with 1000+ element encounters

**Contingency:**
- Query performance monitoring
- Rollback to V1 if P95 latency > 2x baseline
- Caching layer implementation if needed

#### Risk T3: Backward Compatibility Breaks (MEDIUM)

**Impact:** High - External integrations fail
**Probability:** Low

**Mitigation:**
- Maintain V1 API endpoints for 6 months
- Comprehensive integration tests
- API versioning (v1 → v2)
- Deprecation notices in API responses

**Contingency:**
- Extended V1 support if needed
- Partner notification process
- Migration assistance for external consumers

#### Risk T4: Frontend Rendering Bugs (MEDIUM)

**Impact:** Medium - Visual glitches, incorrect display
**Probability:** Medium

**Mitigation:**
- Comprehensive unit tests for rendering logic
- Visual regression testing (Percy/Chromatic)
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Feature flag for gradual rollout

**Contingency:**
- Quick disable via feature flag
- Hotfix deployment process
- User feedback monitoring

#### Risk T5: Database Migration Takes Too Long (LOW)

**Impact:** High - Extended downtime
**Probability:** Low

**Mitigation:**
- Batch processing (1000 encounters per batch)
- Parallel execution where possible
- Estimated time: < 1 hour for 1M encounters
- Maintenance window communication

**Contingency:**
- Extended maintenance window approval
- Progress monitoring and checkpointing
- Ability to resume from checkpoint

### 14.2 User Experience Risks

#### Risk UX1: Learning Curve for New UI (MEDIUM)

**Impact:** Medium - User frustration, support tickets
**Probability:** High

**Mitigation:**
- In-app tooltips and onboarding
- Migration guide documentation
- Video tutorials
- Gradual rollout (10% → 25% → 50% → 100%)
- Feedback collection mechanism

**Contingency:**
- Enhanced documentation
- Live training sessions
- Temporary V1 UI fallback option

#### Risk UX2: Missing Edge Cases (MEDIUM)

**Impact:** Medium - Broken workflows
**Probability:** Medium

**Mitigation:**
- User testing with real DMs
- Beta program with power users
- Comprehensive E2E test scenarios
- Telemetry for feature usage patterns

**Contingency:**
- Hotfix deployment process
- Feature flag per panel type
- User feedback prioritization

### 14.3 Project Risks

#### Risk P1: Scope Creep (HIGH)

**Impact:** High - Timeline extension, cost overrun
**Probability:** High

**Mitigation:**
- Strict scope definition in this PRD
- Change request process
- Weekly progress reviews
- Feature freeze after Week 15

**Contingency:**
- Move nice-to-have features to Phase 2
- Reduce test coverage targets
- Extend timeline if business-critical

#### Risk P2: Resource Availability (MEDIUM)

**Impact:** High - Delayed delivery
**Probability:** Medium

**Mitigation:**
- Cross-training team members
- Documentation of all work
- Parallel work streams
- Buffer in timeline (2 weeks)

**Contingency:**
- Contract resources if needed
- Reduce scope to MVP
- Extend timeline

#### Risk P3: Testing Gaps (MEDIUM)

**Impact:** High - Production bugs
**Probability:** Medium

**Mitigation:**
- Test-driven development
- Code coverage targets (≥80% backend, ≥70% frontend)
- Automated test execution in CI
- QA involvement from Day 1

**Contingency:**
- Extended beta period
- Gradual rollout pause if issues found
- Dedicated bug fix sprint

### 14.4 Business Risks

#### Risk B1: User Churn (LOW)

**Impact:** Critical - Revenue loss
**Probability:** Low

**Mitigation:**
- Maintain feature parity
- Improve performance and usability
- Clear communication of benefits
- No removed functionality

**Contingency:**
- Extended V1 support
- Priority bug fixes
- Customer retention offers

#### Risk B2: Competitive Disadvantage (LOW)

**Impact:** Medium - Falling behind competitors
**Probability:** Low

**Mitigation:**
- Faster implementation enables more features
- Better maintainability for future work
- AI content generation enhancements

**Contingency:**
- Accelerate delivery if competitive pressure
- Highlight new capabilities in marketing

### 14.5 Risk Matrix

```
                    PROBABILITY
                Low     Medium    High
              ┌────────┬─────────┬─────────┐
    Critical  │ B1     │         │         │
              ├────────┼─────────┼─────────┤
IMPACT  High  │ T3, T5 │ T2, P2, │ P1      │
              │        │ P3      │         │
              ├────────┼─────────┼─────────┤
    Medium    │ T4     │ UX1,UX2 │         │
              ├────────┼─────────┼─────────┤
    Low       │        │         │         │
              └────────┴─────────┴─────────┘

Priority order: T1 → P1 → T2 → T3 → P2 → UX1 → P3 → T4 → UX2 → B1
```

### 14.6 Risk Monitoring

**Weekly Risk Review:**
- Update risk probability/impact
- Review mitigation effectiveness
- Identify new risks
- Adjust contingency plans

**Key Risk Indicators (KRIs):**
- Test coverage percentage
- Bug count (P0/P1/P2)
- Migration script execution time
- User feedback sentiment
- Timeline variance

**Escalation Triggers:**
- Any P0 bug in production
- >20% timeline slip
- Test coverage < 70%
- Migration time > 2 hours (projected)

---

## 15. Success Criteria

### 15.1 Technical Success Metrics

**Backend Performance:**
- ✅ All API endpoints respond < 200ms (P95)
- ✅ Database migration completes < 1 hour
- ✅ Zero data loss during migration
- ✅ Code coverage ≥80% (backend)
- ✅ Zero SQL injection vulnerabilities
- ✅ All 40+ new endpoints documented

**Frontend Performance:**
- ✅ Code coverage ≥70% (frontend)
- ✅ Encounter loading time < 2 seconds (100 elements)
- ✅ Canvas rendering at 60 FPS
- ✅ Bundle size increase < 15%
- ✅ Lighthouse score ≥90
- ✅ Zero accessibility violations (WCAG AA)

**Quality Metrics:**
- ✅ Zero P0 bugs in production (first 30 days)
- ✅ < 5 P1 bugs in production (first 30 days)
- ✅ All E2E test scenarios passing
- ✅ Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

### 15.2 User Experience Success Metrics

**Usability:**
- ✅ Users can create encounters 20% faster (timed task)
- ✅ < 3% user error rate when adding elements
- ✅ System Usability Scale (SUS) score > 75
- ✅ Task completion rate > 95%

**Adoption:**
- ✅ 90% of active users migrated within 30 days
- ✅ < 5% support tickets related to new UI
- ✅ Average session time unchanged or improved
- ✅ Feature usage telemetry shows all panels used

**Satisfaction:**
- ✅ Net Promoter Score (NPS) unchanged or improved
- ✅ In-app feedback rating ≥4.0/5.0
- ✅ < 1% users request V1 UI rollback
- ✅ Positive sentiment in user forums

### 15.3 Business Success Metrics

**Delivery:**
- ✅ Project completed within 20 weeks (+2 week buffer allowed)
- ✅ Budget variance < 10%
- ✅ All Phase 1-6 deliverables completed
- ✅ Zero missed regulatory/compliance requirements

**Operational:**
- ✅ Zero unplanned downtime
- ✅ Maintenance window < 4 hours
- ✅ Rollback not required
- ✅ Customer churn rate unchanged

**Strategic:**
- ✅ Enables AI content generation features (Phase 2)
- ✅ Reduces technical debt
- ✅ Improves developer productivity (maintainability)
- ✅ Positions for future VTT features

### 15.4 Acceptance Criteria

**Must Have (MVP):**
- ✅ All 9 element types functional (Actor, Prop, Decoration, Audio, Video, Sprite, Trap, Effect, + 3 existing)
- ✅ Asset library browser supports new kinds (Prop, Decoration)
- ✅ Frame rendering ONLY for Actors
- ✅ Props/Decorations blend seamlessly with map (no frames)
- ✅ Traps have trigger areas and damage mechanics
- ✅ Effects have duration tracking
- ✅ All existing encounters migrated successfully
- ✅ Undo/redo works for all new element types
- ✅ V1 API endpoints remain functional (deprecation timeline)
- ✅ Zero data loss

**Should Have (Target):**
- ✅ Bulk asset generation supports Props/Decorations
- ✅ AI prompts optimized for Props/Decorations
- ✅ Context menus differentiated by element type
- ✅ Panel organization with category headers
- ✅ Filter/search in all panels
- ✅ Keyboard shortcuts for common actions

**Nice to Have (Stretch):**
- 🔄 Trap generator AI tool
- 🔄 Spell effect generator AI tool
- 🔄 Complete encounter generator
- 🔄 Import/export JSON for all element types
- 🔄 Templates for common element configurations

### 15.5 Go/No-Go Criteria

**Go-Live Checklist (Must all be YES):**

1. **Data Migration:**
   - [ ] Migration script tested on production data copy
   - [ ] Rollback script tested and verified
   - [ ] Data integrity validation queries passing
   - [ ] Database backup completed

2. **Testing:**
   - [ ] All unit tests passing (≥80% coverage backend, ≥70% frontend)
   - [ ] All integration tests passing
   - [ ] All E2E tests passing
   - [ ] Performance benchmarks met
   - [ ] Security audit completed

3. **Documentation:**
   - [ ] API documentation updated (Swagger)
   - [ ] User guide published
   - [ ] Migration guide published
   - [ ] Video tutorials recorded

4. **Operational Readiness:**
   - [ ] Feature flags configured
   - [ ] Monitoring/alerting set up
   - [ ] Rollback plan documented
   - [ ] Support team trained
   - [ ] Maintenance window approved

5. **Stakeholder Approval:**
   - [ ] Product owner sign-off
   - [ ] Engineering lead sign-off
   - [ ] QA sign-off
   - [ ] DevOps sign-off

**No-Go Triggers (any one causes delay):**
- Any P0 bug discovered
- Data migration fails integrity checks
- Performance regression > 20%
- Test coverage < 70%
- Rollback script fails

---

## 16. Appendices

### 16.1 File Inventory

**Backend Files (New/Modified):**

**Domain Model (9 new + 2 modified):**
```
Source/Domain/Library/Encounters/Model/
├── EncounterElement.cs (NEW - base abstraction)
├── EncounterActor.cs (NEW - Characters + Creatures)
├── EncounterProp.cs (NEW - Interactive objects)
├── EncounterDecoration.cs (NEW - Passive scenery)
├── EncounterAudio.cs (NEW - Background music/SFX)
├── EncounterVideo.cs (NEW - Video backgrounds)
├── EncounterSprite.cs (NEW - Animated sprites)
├── EncounterTrap.cs (NEW - Mechanical/magical traps)
├── EncounterEffect.cs (NEW - Spell effects/AoE)
├── Encounter.cs (MODIFIED - add 9 collections)
└── Frame.cs (EXISTING - used by Actors only)

Source/Domain/Assets/Model/
└── AssetKind.cs (MODIFIED - remove Effect/Object, add Prop/Decoration)
```

**Supporting Types (6 new):**
```
Source/Domain/Library/Encounters/Model/
├── ObjectState.cs (NEW - Intact/Damaged/Destroyed)
├── ObjectOpenState.cs (NEW - Open/Closed for containers)
├── TrapState.cs (NEW - Armed/Triggered/Disabled)
├── EffectDurationType.cs (NEW - Instantaneous/Rounds/Minutes/Hours/Concentration)
├── AreaShape.cs (NEW - Circle/Cone/Line/Cube for AoE)
├── TriggerArea.cs (NEW - Shape + dimensions for traps)
└── EffectArea.cs (NEW - Shape + dimensions for effects)
```

**Data Layer (16 new):**
```
Source/Data/SchemaBuilders/
├── EncounterActorSchemaBuilder.cs (NEW)
├── EncounterPropSchemaBuilder.cs (NEW)
├── EncounterDecorationSchemaBuilder.cs (NEW)
├── EncounterAudioSchemaBuilder.cs (NEW)
├── EncounterVideoSchemaBuilder.cs (NEW)
├── EncounterSpriteSchemaBuilder.cs (NEW)
├── EncounterTrapSchemaBuilder.cs (NEW)
└── EncounterEffectSchemaBuilder.cs (NEW)

Source/Data/Mappers/
├── EncounterActorMapper.cs (NEW)
├── EncounterPropMapper.cs (NEW)
├── EncounterDecorationMapper.cs (NEW)
├── EncounterAudioMapper.cs (NEW)
├── EncounterVideoMapper.cs (NEW)
├── EncounterSpriteMapper.cs (NEW)
├── EncounterTrapMapper.cs (NEW)
└── EncounterEffectMapper.cs (NEW)
```

**Service Layer (3 modified):**
```
Source/Services/Encounters/
├── IEncounterService.cs (MODIFIED - add 40+ methods)
├── EncounterService.cs (MODIFIED - implement methods)
└── EncounterStorage.cs (MODIFIED - persistence logic)
```

**API Layer (30+ new):**
```
Source/Domain/Library/Encounters/ApiContracts/
├── AddActorRequest.cs (NEW)
├── UpdateActorRequest.cs (NEW)
├── ActorDto.cs (NEW)
├── AddPropRequest.cs (NEW)
├── UpdatePropRequest.cs (NEW)
├── UpdatePropStateRequest.cs (NEW)
├── PropDto.cs (NEW)
... (24 more DTOs for Decorations, Audio, Video, Sprites, Traps, Effects)

Source/WebApi/Controllers/
├── EncounterActorsController.cs (NEW)
├── EncounterPropsController.cs (NEW)
├── EncounterDecorationsController.cs (NEW)
├── EncounterAudioController.cs (NEW)
├── EncounterVideosController.cs (NEW)
├── EncounterSpritesController.cs (NEW)
├── EncounterTrapsController.cs (NEW)
└── EncounterEffectsController.cs (NEW)
```

**Commands (40+ new):**
```
Source/Domain/Library/Encounters/Commands/
├── AddActorCommand.cs (NEW)
├── UpdateActorCommand.cs (NEW)
├── RemoveActorCommand.cs (NEW)
├── UpdateActorFrameCommand.cs (NEW)
├── AssignActorControlCommand.cs (NEW)
... (35+ more commands for all element types)
```

**Frontend Files (New/Modified):**

**TypeScript Types (40+ new):**
```
src/types/
├── domain.ts (MODIFIED - add 9 interfaces)
├── api.ts (MODIFIED - add 30+ request/response types)
└── enums.ts (MODIFIED - update AssetKind enum)
```

**API Layer (1 modified):**
```
src/services/api/
└── encounterApi.ts (MODIFIED - add 40 endpoints)
```

**Rendering Components (9 new):**
```
src/components/encounter/rendering/
├── PlacedElement.tsx (NEW - dispatcher)
├── ActorRenderer.tsx (NEW - with frame)
├── PropRenderer.tsx (NEW - no frame)
├── DecorationRenderer.tsx (NEW - minimal)
├── AudioRenderer.tsx (NEW - icon only)
├── VideoRenderer.tsx (NEW - preview)
├── SpriteRenderer.tsx (NEW - animated)
├── TrapRenderer.tsx (NEW - danger icon)
└── EffectRenderer.tsx (NEW - AoE visualization)
```

**Panel Components (9 new):**
```
src/components/encounter/panels/
├── ActorPanel.tsx (NEW)
├── PropPanel.tsx (NEW)
├── DecorationPanel.tsx (NEW)
├── AudioPanel.tsx (NEW)
├── VideoPanel.tsx (NEW)
├── SpritePanel.tsx (NEW)
├── TrapPanel.tsx (NEW)
├── EffectPanel.tsx (NEW)
└── LeftToolbar.tsx (MODIFIED - add category headers)
```

**Property Editors (9 new):**
```
src/components/encounter/properties/
├── ActorProperties.tsx (NEW - includes frame editor)
├── PropProperties.tsx (NEW - includes state editor)
├── DecorationProperties.tsx (NEW - minimal)
├── AudioProperties.tsx (NEW)
├── VideoProperties.tsx (NEW)
├── SpriteProperties.tsx (NEW)
├── TrapProperties.tsx (NEW - trigger area + damage)
├── EffectProperties.tsx (NEW - area + duration)
└── FrameEditor.tsx (NEW - visual frame handles)
```

**Admin UI (2 modified):**
```
src/pages/admin/
└── AssetLibrary.tsx (MODIFIED - update filters)

src/components/aiSupport/
└── BulkAssetGenerationForm.tsx (MODIFIED - update Kind dropdown)
```

**Database Migration Files:**
```
Source/Data/Migrations/
├── 20250101_AddEncounterElements.sql (NEW - create 8 tables)
├── 20250201_MigrateEncounterElements.sql (NEW - data migration)
└── 20250201_RollbackEncounterElements.sql (NEW - rollback script)
```

**Total File Count:**
- Backend: ~80 new files, ~10 modified
- Frontend: ~40 new files, ~5 modified
- Database: 3 migration scripts
- Tests: ~200 test files

### 16.2 Glossary

**Actor:** Encounter element representing Characters and Creatures with frames, StatBlocks, and player control

**Prop:** Interactive object in encounter (chest, door, furniture) with simplified state machine

**Decoration:** Unified visual media element - supports static images, animated sprites (excludes video for MVP). Passive scenery with no game mechanics

**Frame:** Visual bounding box for Actors showing which portion of portrait to display (X, Y, Width, Height). ONLY Actors have frames

**AssetKind:** Enum defining asset categories (Character, Creature, Prop, Decoration) in library

**ResourceType:** Enum for Decoration variants (Image, Sprite) - file format is implementation detail

**EncounterElement:** Base abstraction for all 9 element types with common properties

**GameElement:** Elements with game rules/mechanics (Actor, Prop, Trap, Effect)

**StructuralElement:** Passive environmental elements (Wall, Region, Light, Decoration, Audio)

**Trap:** Interactive game element with trigger area, damage, and save mechanics

**Effect:** Active spell zone/condition with duration tracking and AOE definition

**Perception-Based Design:** Principle that visual elements (image/sprite) are unified because they're "pixels on map," while audio is separate (different perception mechanism)

**V1 API:** Original API endpoints using EncounterAssets collection

**V2 API:** New API endpoints using granular collections (Actors, Props, etc.)

**DDD:** Domain-Driven Design - architectural pattern separating domain logic from infrastructure

**RTK Query:** Redux Toolkit Query - data fetching and caching library

**Konva:** React canvas library for encounter map rendering

**EF Core:** Entity Framework Core - ORM for database access

**xUnit:** Testing framework for C# backend

**Vitest:** Testing framework for TypeScript/React frontend

**Playwright:** E2E testing framework for browser automation

**FluentAssertions:** C# assertion library for readable test expectations

### 16.3 References

**Internal Documentation:**
- VTTTools Architecture Guide
- Domain Model Design Patterns
- API Versioning Strategy
- Database Migration Best Practices
- Testing Standards and Guidelines

**External Resources:**
- Domain-Driven Design (Eric Evans)
- Entity Framework Core Documentation
- React + TypeScript Best Practices
- Konva Canvas Library Documentation
- Redux Toolkit Query Guide

**Design Decisions:**
- ADR-001: Split EncounterAsset into Actor/Prop (2 types, not 3 - Decorations are structural)
- ADR-002: Remove Effect from AssetKind enum (encounter-specific, not library)
- ADR-003: Props and Decorations have no frames (blend seamlessly with map)
- ADR-004: Maintain V1 API for 6-month deprecation period
- ADR-005: Use 2 semantic categories (Game vs Structural) based on behavior, not file types
- ADR-006: Unify visual media (Image/Sprite/Video) into single Decoration entity with ResourceType
- ADR-007: Separate Audio from visual Decorations (different perception mechanism - ears vs eyes)
- ADR-008: Traps and Effects are Game Elements (have game mechanics: damage, saves, durations)

### 16.4 Change History

**Version 1.1 (2025-12-28) - Major Simplification:**
- **Simplified Categories:** 2 semantic categories (Game vs Structural) instead of 4 implementation-based
- **Unified Decorations:** Combined Image/Sprite/Video into single Decoration type with ResourceType enum
- **Removed Entities:** EncounterVideo, EncounterSprite (merged into unified Decoration)
- **Reorganized:** Moved Traps/Effects to Game category (have mechanics), Decorations to Structural (passive)
- **Reduced Complexity:**
  - Element types: 9 (down from 12)
  - UI panels: 9 (down from 13)
  - Database tables: 6 (down from 8)
  - API endpoints: ~30-35 (down from ~45)
- **Design Principle:** Perception-based design - visual elements unified, audio separate
- **Development Effort:** ~180 hours (down from ~220 hours)

**Version 1.0 (2025-01-15):**
- Initial PRD creation with 4 categories, 12 element types
- Sections 1-16 complete

---

**END OF DOCUMENT**

---

**Document Statistics (v1.1 - Simplified Model):**
- **Total Sections:** 16
- **Total Lines:** ~4,900 (updated with simplified model)
- **Total Pages:** ~62 (estimated)
- **Element Types:** 9 (down from 12)
- **Semantic Categories:** 2 (Game vs Structural)
- **Database Tables:** 6 new (down from 8)
- **API Endpoints:** ~30-35 new (down from ~45)
- **UI Panels:** 9 element panels (down from 13)
- **File References:** ~180 files (down from ~216)
- **Test Cases:** ~180 scenarios (reduced due to simpler model)
- **Diagrams:** 15 code samples, 8 ASCII diagrams, 1 risk matrix
- **Development Effort:** ~180-220 hours (down from ~220-250 hours)

**Key Improvements in v1.1:**
- ✅ **Simpler Architecture:** 9 types instead of 12
- ✅ **Clearer Semantics:** Behavior-based categories (game rules vs environment)
- ✅ **Better UX:** Unified decoration browser (images + sprites together)
- ✅ **Perception-Based:** Visual unified, audio separate (ears vs eyes)
- ✅ **Less Code:** Fewer entities, tables, endpoints, panels
- ✅ **Faster Implementation:** Reduced development effort

**Review Status:**
- Domain Expert Review: ✅ Complete (v1.1 simplified model approved)
- Technical Architecture Review: ✅ Complete (2-category model approved)
- UX Review: ✅ Complete (unified panels approved)
- Security Review: ✅ Complete (no changes from v1.0)
- Product Owner Approval: ⏳ Pending final review

**Next Steps:**
1. Product owner final approval of v1.1 simplified model
2. Stakeholder sign-off
3. Implementation kickoff (Week 1, Phase 1)
4. Sprint planning with updated estimates
