# Product Requirements Document (PRD)
# VTTTools Encounter Domain Model Refactoring

**Document Version:** 1.0
**Date:** 2025-12-27
**Status:** Draft - Ready for Review
**Author:** AI Analysis & User Collaboration
**Stakeholders:** Engineering Team, Product Management, UX Design

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

Refactor encounter elements into **9 distinct types** organized by behavioral characteristics:

| Category | Entity Types | Purpose |
|----------|-------------|---------|
| **GameElements** | EncounterActor, EncounterProp, EncounterDecoration | Gameplay vs Interactive vs Passive |
| **MediaElements** | EncounterAudio, EncounterVideo, EncounterSprite | Audio/Visual presentation |
| **InteractiveElements** | EncounterTrap, EncounterEffect | Triggered mechanics vs Active zones |
| **StructuralElements** | Wall, Region, Light | Environment geometry (keep existing) |

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

The new domain model organizes encounter elements by **three key dimensions**:

| Dimension | Meaning | Examples |
|-----------|---------|----------|
| **Source** | Where does it come from? | Library (reusable) vs Ad-hoc (one-time) |
| **Behavior** | What does it do? | Gameplay mechanics vs Presentation vs Interaction |
| **Representation** | How is it shown? | Token image vs Geometry vs Media file |

This leads to **four categories** of elements:

| Category | Source | Behavior | Representation |
|----------|--------|----------|----------------|
| **GameElements** | Library (Asset) | Gameplay mechanics, player-controlled | Token/Portrait images |
| **MediaElements** | Library (Resource) | Playback, passive presentation | Audio/Video files |
| **StructuralElements** | Ad-hoc (drawn) | Environmental effects (vision, movement) | Geometric primitives |
| **InteractiveElements** | Library OR Ad-hoc | Player interaction, triggers, state | Image + Interaction area |

### 3.2 Entity Type Definitions

#### 3.2.1 Base Abstraction: `EncounterElement`

All placed elements inherit from this base:

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

##### EncounterDecoration (Environmental Objects)

**Purpose:** Passive visual elements with no interaction.

```csharp
public record EncounterDecoration : EncounterElement {
    // REQUIRED reference to Asset library
    public Guid AssetId { get; init; } // Asset.Kind = Decoration

    // Visual override
    public ResourceMetadata? ImageOverride { get; init; }
    public NamedSize SizeOverride { get; init; }

    // NO FRAME (seamless integration with map)

    // Spatial
    public float Rotation { get; init; }
    public float Elevation { get; init; }

    // NO state, NO interaction - pure decoration
}
```

**Key Properties:**
- `AssetId` - REQUIRED reference (need visual from library)
- NO `ControlledBy`, NO `State`, NO `OpenState`
- NO `Frame` (❌ NO FRAMES - blend with map)
- Absolute minimum properties

**Use Cases:**
- Trees, rocks, bushes
- Statues, pillars, columns
- Debris, bones, skulls
- Carpets, rugs, banners
- Background scenery

#### 3.2.3 MediaElements

##### EncounterAudio (Spatial Audio)

**Purpose:** Positioned audio with 3D spatial properties.

```csharp
public record EncounterAudio : EncounterElement {
    // Reference to Resource library
    public Guid ResourceId { get; init; } // Audio file

    // Audio type
    public AudioType Type { get; init; } // Ambient, Effect, Music

    // Spatial properties (3D audio)
    public float? Range { get; init; } // Audio radius/distance
    public float? Direction { get; init; } // Directional audio
    public float? Arc { get; init; } // Arc angle for directional

    // Playback controls
    public bool IsPlaying { get; init; }
    public bool Loop { get; init; }
    public float Volume { get; init; } = 1.0f; // 0.0 - 1.0
}

public enum AudioType {
    Ambient,         // Background environmental sounds
    SoundEffect,     // One-shot effects
    BackgroundMusic  // Music tracks
}
```

**Key Properties:**
- `ResourceId` - REQUIRED reference to audio file
- `Range` - Spatial audio falloff
- `Direction` + `Arc` - Directional audio (e.g., speaker pointing)

**Use Cases:**
- Tavern ambient sounds
- Waterfall sounds
- Fire crackling
- Background music
- Monster roars

##### EncounterVideo (Video Overlays)

**Purpose:** Video files displayed as overlays on the map.

```csharp
public record EncounterVideo : EncounterElement {
    // Reference to Resource library
    public Guid ResourceId { get; init; } // Video file

    // Visual properties (2D overlay)
    public Size DisplaySize { get; init; }
    public float Opacity { get; init; } = 1.0f;

    // Playback controls
    public bool IsPlaying { get; init; }
    public bool Loop { get; init; }
    public float Volume { get; init; } = 1.0f; // Audio track volume
}
```

**Key Properties:**
- `ResourceId` - REQUIRED video file
- `DisplaySize` - 2D dimensions for overlay
- NO spatial range (not 3D audio)

**Use Cases:**
- Animated portals
- Lava flows
- Magic effects
- Waterfalls (visual)
- Fire animations

##### EncounterSprite (Animated Sprites)

**Purpose:** Sprite sheets or animated images.

```csharp
public record EncounterSprite : EncounterElement {
    // Reference to Resource library
    public Guid ResourceId { get; init; } // Sprite sheet or animated image

    // Visual properties
    public Size DisplaySize { get; init; }
    public float Opacity { get; init; } = 1.0f;

    // Animation controls
    public bool IsPlaying { get; init; }
    public bool Loop { get; init; }
    public float AnimationSpeed { get; init; } = 1.0f;
    public int? CurrentFrame { get; init; }
}
```

**Key Properties:**
- `ResourceId` - REQUIRED sprite file
- `AnimationSpeed` - Playback rate multiplier
- `CurrentFrame` - For frame-accurate control

**Use Cases:**
- Animated tokens (idle, walking)
- Torch flames
- Water ripples
- Status indicators (burning, frozen)
- Magical auras

#### 3.2.4 InteractiveElements

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

    // 1. GameElements (3 types)
    public List<EncounterActor> Actors { get; init; } = [];          // Characters + Creatures (with frames)
    public List<EncounterProp> Props { get; init; } = [];            // Interactive objects (no frames)
    public List<EncounterDecoration> Decorations { get; init; } = []; // Environmental objects (no frames)

    // 2. MediaElements (3 types)
    public List<EncounterAudio> Audio { get; init; } = [];           // Spatial audio
    public List<EncounterVideo> Videos { get; init; } = [];          // Video overlays
    public List<EncounterSprite> Sprites { get; init; } = [];        // Animated sprites

    // 3. InteractiveElements (2 types)
    public List<EncounterTrap> Traps { get; init; } = [];            // Triggered hazards
    public List<EncounterEffect> Effects { get; init; } = [];        // Active zones/conditions

    // 4. StructuralElements (existing - no change)
    public List<EncounterWall> Walls { get; init; } = [];
    public List<EncounterRegion> Regions { get; init; } = [];
    public List<EncounterLight> LightSources { get; init; } = [];
}
```

**Total Collections:** 12 (9 new/changed + 3 existing)

### 3.5 Element Type Comparison Matrix

| Element | Source | Has Frame? | Control | State | Use Case |
|---------|--------|-----------|---------|-------|----------|
| **EncounterActor** | Asset (Char/Creature) | ✅ YES | Player/DM | Full StatBlocks | Characters, Creatures |
| **EncounterProp** | Asset (Prop) | ❌ NO | DM only | Simple (Intact/Damaged) | Chests, Furniture |
| **EncounterDecoration** | Asset (Decoration) | ❌ NO | DM only | None | Trees, Rocks, Scenery |
| **EncounterAudio** | Resource | N/A | DM only | Playback | Ambient sounds |
| **EncounterVideo** | Resource | N/A | DM only | Playback | Animated overlays |
| **EncounterSprite** | Resource | N/A | DM only | Animation | Sprite animations |
| **EncounterTrap** | Template/Ad-hoc | ❌ NO | DM only | Armed/Triggered | Pressure plates |
| **EncounterEffect** | Ad-hoc | N/A | DM only | Duration | Spell AOEs |
| **Wall/Region/Light** | Ad-hoc | N/A | DM only | Various | Geometry |

### 3.6 Benefits of This Design

1. **Clear Conceptual Boundaries**
   - Each type has single responsibility
   - No property ambiguity
   - Self-documenting code

2. **Type Safety**
   - Compile-time guarantees (Actors have AssetId, Decorations don't have State)
   - Discriminated unions in TypeScript
   - Runtime validation

3. **Extensibility**
   - Add new types without refactoring existing ones
   - Common base class for polymorphic operations
   - AI generation knows what to create

4. **UI/UX Clarity**
   - 9 distinct "toolboxes" in editor
   - Clear mental model for users
   - Better asset organization

5. **Performance**
   - No change from current system
   - Same rendering architecture
   - Same data loading patterns

---

## 4. BACKEND IMPACT ANALYSIS

### 4.1 Overview

**Total Files Affected:** ~216 files
**Database Tables:** 6 new tables, 2 tables dropped
**API Endpoints:** ~30 new endpoints
**Estimated Effort:** 200-250 hours

### 4.2 Domain Layer Changes

#### 4.2.1 New Domain Entities Required

| Entity | File Location | Description |
|--------|--------------|-------------|
| `EncounterElement` | `/Source/Domain/Library/Encounters/Model/EncounterElement.cs` | Base abstraction (NEW) |
| `EncounterActor` | `/Source/Domain/Library/Encounters/Model/EncounterActor.cs` | Replaces EncounterAsset for Characters/Creatures |
| `EncounterProp` | `/Source/Domain/Library/Encounters/Model/EncounterProp.cs` | Interactive objects (NEW) |
| `EncounterDecoration` | `/Source/Domain/Library/Encounters/Model/EncounterDecoration.cs` | Environmental objects (NEW) |
| `EncounterAudio` | `/Source/Domain/Library/Encounters/Model/EncounterAudio.cs` | Spatial audio (replaces EncounterSound) |
| `EncounterVideo` | `/Source/Domain/Library/Encounters/Model/EncounterVideo.cs` | Video overlays (NEW) |
| `EncounterSprite` | `/Source/Domain/Library/Encounters/Model/EncounterSprite.cs` | Animated sprites (NEW) |
| `EncounterTrap` | `/Source/Domain/Library/Encounters/Model/EncounterTrap.cs` | Triggered hazards (NEW) |
| `EncounterEffect` | `/Source/Domain/Library/Encounters/Model/EncounterEffect.cs` | Active zones (NEW) |

#### 4.2.2 API Contracts - Breaking Changes

**Current Structure:**
```
EncounterAssetAddRequest
EncounterAssetUpdateRequest
EncounterAssetBulkAddRequest
EncounterSoundAddRequest
EncounterSoundUpdateRequest
```

**New Structure (split by type):**
```
EncounterActorAddRequest / UpdateRequest
EncounterPropAddRequest / UpdateRequest
EncounterDecorationAddRequest / UpdateRequest
EncounterAudioAddRequest / UpdateRequest
EncounterVideoAddRequest / UpdateRequest
EncounterSpriteAddRequest / UpdateRequest
EncounterTrapAddRequest / UpdateRequest
EncounterEffectAddRequest / UpdateRequest
```

**Total New Contracts:** ~24 request/response classes

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
-- GameElements
CREATE TABLE EncounterActors (...)
CREATE TABLE EncounterProps (...)
CREATE TABLE EncounterDecorations (...)

-- MediaElements
CREATE TABLE EncounterAudios (...)
CREATE TABLE EncounterVideos (...)
CREATE TABLE EncounterSprites (...)

-- InteractiveElements
CREATE TABLE EncounterTraps (...)
CREATE TABLE EncounterEffects (...)
```

#### 4.3.2 EF Core Configuration

**File:** `/Source/Data/Builders/EncounterSchemaBuilder.cs`

**Changes Required:**
- Remove EncounterAsset entity configuration
- Add 6 new entity configurations (Actor, Prop, Decoration, Audio, Video, Sprite)
- Add 2 new entity configurations (Trap, Effect)
- Update foreign key relationships
- Configure inheritance if using TPH (Table Per Hierarchy)

#### 4.3.3 Data Mappers

**File:** `/Source/Data/Library/Mapper.cs`

**Breaking Changes:**
- Remove `AsEncounterAsset` expression
- Add 3 new asset mapper expressions (Actor, Prop, Decoration)
- Remove `AsEncounterSoundSource` expression
- Add 3 new sound mapper expressions (Audio, Video, Sprite)
- Update `AsEncounter` mapper to use new collection names
- Add mappers for Trap and Effect

**Estimated Lines Changed:** 200-300 lines

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
