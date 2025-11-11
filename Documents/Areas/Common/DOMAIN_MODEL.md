# Common Domain Model

**Bounded Context**: Common (Shared Kernel)

**Purpose**: Provide shared domain primitives, value objects, and enums used across multiple bounded contexts to ensure consistency and reusability.

**Boundaries**:
- **Inside**: Shared value objects (Participant, Frame, Colors), shared enums (RoleName, PlayerType, FrameShape), common validation logic
- **Outside**: Context-specific entities (Asset, Resource, Encounter, GameSession belong to their respective contexts)

**Architecture Pattern**: DDD Contracts + Shared Kernel
- Common domain elements are **shared primitives** (value objects, enums)
- Used by multiple bounded contexts (Assets, Library, Game)
- No entities (only value objects and enums)
- Immutable and stateless

---

## Change Log
- *2025-10-11* — **2.0.0** — Added NamedSize value object with fractional support, Position primitive, SizeName enum
- *2025-10-02* — **1.0.0** — Initial domain model extracted from existing codebase

---

## Ubiquitous Language

- **Participant**: User participating in a game context (schedule or session) with a specific role
- **Player Type**: Role classification for game participants (Guest, Player, Assistant, Master)
- **Frame**: Visual border styling (shape and colors) used for asset display
- **Frame Shape**: Border geometry (Square or Circle)
- **Role Name**: System-wide authorization role (Guest=0, User=1, Administrator=99)
- **Colors**: Color palette definition for theming
- **Named Size**: Asset size with optional category name (Tiny, Medium, Large) supporting fractional dimensions
- **Size Category**: Predefined size names (Miniscule ⅛, Tiny ¼, Small ½, Medium 1, Large 2, Huge 3, Gargantuan 4, Custom)
- **Position**: Cell-based coordinates (X, Y) for grid placement

---

## Value Objects

### Participant

**Purpose**: Represents user participating in game-related activities with a specific role

**Context Usage**: Used by Game context (GameSession, Schedule) and potentially Library context for collaborative editing

#### Properties
- **UserId**: Guid
  - **Constraints**: Must reference existing User.Id
  - **Purpose**: Links participant to user identity

- **PlayerType**: PlayerType (enum)
  - **Constraints**: Must be valid enum value (Guest, Player, Assistant, Master)
  - **Default**: PlayerType.Player
  - **Purpose**: Defines participant role and permissions

- **JoinedAt**: DateTimeOffset?
  - **Constraints**: Timestamp when user joined (nullable for schedules/invitations)
  - **Default**: DateTimeOffset.UtcNow when joining active session, null for invitations
  - **Purpose**: Tracks participation timeline

#### Creation & Validation
- **Factory Method**: `new Participant { UserId = userId, PlayerType = PlayerType.Player, JoinedAt = DateTimeOffset.UtcNow }`
- **Validation Rules**:
  - UserId must not be empty (Guid.Empty)
  - PlayerType must be valid enum value
  - JoinedAt should be past or present if provided (not future)
- **Immutability**: Yes (C# record type with init-only properties)

#### Equality & Comparison
- **Equality**: Value-based - UserId and PlayerType must match (JoinedAt not compared for equality)
- **Hash Code**: Based on UserId (unique identifier)
- **Comparison**: Not comparable (no natural ordering)

#### Methods
- **ToString()**: Returns formatted string "User {UserId} as {PlayerType}"
- **Equals(Participant other)**: Value equality based on UserId and PlayerType
- **GetHashCode()**: Hash based on UserId

#### Usage Examples
```csharp
// Game Master
var gameMaster = new Participant
{
    UserId = gmUserId,
    PlayerType = PlayerType.Master,
    JoinedAt = DateTimeOffset.UtcNow
};

// Regular Player
var player = new Participant
{
    UserId = playerUserId,
    PlayerType = PlayerType.Player,
    JoinedAt = DateTimeOffset.UtcNow
};

// Invited participant (not yet joined)
var invitee = new Participant
{
    UserId = inviteeUserId,
    PlayerType = PlayerType.Player,
    JoinedAt = null
};
```

---

### Frame

**Purpose**: Defines visual border styling (shape and colors) for asset display in encounters

**Context Usage**: Used by Assets context (Asset.Display.Frame) and potentially Library context for encounter element styling

#### Properties
- **Shape**: FrameShape (enum)
  - **Constraints**: Must be Square or Circle
  - **Default**: FrameShape.Square
  - **Purpose**: Defines border geometry

- **Color**: string
  - **Constraints**: Valid hex color code (e.g., "#FF5733")
  - **Default**: "#FFFFFF" (white)
  - **Purpose**: Primary fill color

- **BorderColor**: string
  - **Constraints**: Valid hex color code
  - **Default**: "#000000" (black)
  - **Purpose**: Border outline color

#### Creation & Validation
- **Factory Method**: `new Frame { Shape = FrameShape.Circle, Color = "#FFFFFF", BorderColor = "#000000" }`
- **Validation Rules**:
  - Shape must be valid FrameShape enum
  - Color must match hex color pattern: ^#[0-9A-Fa-f]{6}$
  - BorderColor must match hex color pattern
- **Immutability**: Yes (C# record type)

#### Equality & Comparison
- **Equality**: Value-based - all properties (Shape, Color, BorderColor) must match
- **Hash Code**: Based on all three properties
- **Comparison**: Not comparable

#### Methods
- **ToString()**: Returns "{Shape} frame with {Color} fill and {BorderColor} border"
- **Equals(Frame other)**: Value equality comparison
- **GetHashCode()**: Hash based on Shape, Color, BorderColor
- **IsValidHexColor(string color)**: Static validation helper

#### Usage Examples
```csharp
// Circular token frame
var tokenFrame = new Frame
{
    Shape = FrameShape.Circle,
    Color = "#FFD700",      // Gold fill
    BorderColor = "#8B4513"  // Brown border
};

// Square object frame
var objectFrame = new Frame
{
    Shape = FrameShape.Square,
    Color = "#C0C0C0",      // Silver fill
    BorderColor = "#000000"  // Black border
};
```

---

### NamedSize

**Purpose**: Represents asset size in grid cells with optional named category and fractional support

**Context Usage**: Used by Assets context (AssetProperties.Size), provides unified size representation for both Object and Creature assets

#### Properties
- **Width**: double
  - **Constraints**: Must be positive, supports fractional values (0.125, 0.25, 0.5) or whole numbers
  - **Default**: 1.0
  - **Purpose**: Width in grid cells

- **Height**: double
  - **Constraints**: Must be positive, supports fractional values (0.125, 0.25, 0.5) or whole numbers
  - **Default**: 1.0
  - **Purpose**: Height in grid cells

- **IsSquare**: bool
  - **Constraints**: When true, Width = Height enforced
  - **Default**: true
  - **Purpose**: Indicates square size (affects UI - lock toggle)

- **Name**: SizeName (computed property)
  - **Constraints**: Derived from Width, Height, IsSquare
  - **Returns**: SizeName enum value (Zero, Miniscule, Tiny, Small, Medium, Large, Huge, Gargantuan, or Custom)
  - **Purpose**: Provides semantic size category when dimensions match named presets

#### Creation & Validation
- **Factory Method**: `NamedSize.FromName(SizeName.Medium)` or inline `new NamedSize { Width = 1, Height = 1, IsSquare = true }`
- **Validation Rules**:
  - Width and Height must be positive
  - Fractional values limited to 0.125 (⅛), 0.25 (¼), 0.5 (½)
  - Whole numbers (1, 2, 3, etc.) allowed
  - IsSquare=true requires Width = Height
- **Immutability**: Yes (C# record type with init-only properties)

#### Equality & Comparison
- **Equality**: Value-based (Width, Height, IsSquare must all match)
- **Hash Code**: Based on Width, Height, IsSquare
- **Comparison**: Not comparable

#### Usage Examples
```csharp
// Medium creature (1×1)
var mediumSize = NamedSize.FromName(SizeName.Medium);
// Width=1, Height=1, IsSquare=true, Name=Medium

// Tiny object (¼×¼)
var tinySize = new NamedSize { Width = 0.25, Height = 0.25, IsSquare = true };
// Name=Tiny

// Custom rectangular (2×3)
var customSize = new NamedSize { Width = 2, Height = 3, IsSquare = false };
// Name=Custom
```

---

### Position

**Purpose**: Represents cell-based coordinates for asset placement on grid

**Context Usage**: Used by Assets context (Asset.Position), Game context (encounter element placement)

#### Properties
- **X**: int
  - **Constraints**: Can be negative (off-grid placement), zero, or positive
  - **Default**: 0
  - **Purpose**: Horizontal position in grid cells

- **Y**: int
  - **Constraints**: Can be negative (off-grid placement), zero, or positive
  - **Default**: 0
  - **Purpose**: Vertical position in grid cells

#### Creation & Validation
- **Factory Method**: `new Position { X = 5, Y = 10 }` or `Position.Origin` for (0,0)
- **Validation Rules**:
  - No validation constraints (all integer values valid)
  - Negative values allowed for off-grid placement
- **Immutability**: Yes (C# record type with init-only properties)

#### Equality & Comparison
- **Equality**: Value-based (X and Y must both match)
- **Hash Code**: Based on X and Y
- **Comparison**: Not naturally comparable (could add distance-based comparison if needed)

#### Methods
- **ToString()**: Returns "(X, Y)" format
- **Equals(Position other)**: Value equality based on X and Y
- **GetHashCode()**: Hash based on X and Y

#### Usage Examples
```csharp
// Grid origin
var origin = new Position { X = 0, Y = 0 };

// Asset placement
var assetPosition = new Position { X = 5, Y = 10 };

// Off-grid (hidden/staged)
var offGrid = new Position { X = -1, Y = -1 };
```

---

## Enums

### PlayerType

**Purpose**: Categorizes participant roles in game sessions with associated permissions

**Values**:
- **Guest** (0): Observer with read-only access
  - Can view session
  - Can send chat messages
  - Cannot modify game state

- **Player** (1): Active participant controlling characters
  - Can view and interact with session
  - Can move own assets
  - Can roll dice
  - Can send chat messages

- **Assistant** (2): Helper role (co-GM) with elevated permissions
  - Can modify game state
  - Can assist GM with administrative tasks
  - Can manage NPCs

- **Master** (99): Game Master with full control
  - Can modify all game state
  - Can add/remove participants
  - Can control all assets
  - Can change encounters
  - Can start/pause/finish session

**Usage Context**: Game context (GameSession.Players, Schedule.Participants)

**Business Rules**:
- Only one Master allowed per session
- Master cannot be removed (session owner)
- Players can be promoted/demoted between Guest/Player/Assistant roles

---

### FrameShape

**Purpose**: Defines border geometry for asset frames

**Values**:
- **Square** (0): Rectangular border with optional corner radius
  - Used for objects, walls, doors, terrain
  - Fits square grid cells

- **Circle** (1): Circular/elliptical border
  - Used for tokens (characters, creatures)
  - Better visual representation for living entities

**Usage Context**: Assets context (Frame.Shape), Common context (Frame value object)

**Business Rules**:
- Shape affects collision detection in encounter editor
- Circular frames typically used for AssetType.Token, Character, Creature
- Square frames typically used for AssetType.Object, Wall, Door

---

### RoleName

**Purpose**: System-wide authorization role for platform access control

**Values**:
- **Guest** = 0: Anonymous or limited access
  - Can view public content
  - Cannot create content
  - Read-only permissions

- **User** = 1: Registered user with standard permissions
  - Can create and manage own content
  - Can participate in games
  - Can publish content

- **Administrator** = 99: Platform administrator with full access
  - Can access all content (public and private)
  - Can manage users
  - Can perform system operations

**Usage Context**: Identity context (User.Role), cross-cutting authorization

**Business Rules**:
- RoleName affects platform-wide permissions
- PlayerType is session-specific, RoleName is system-wide
- Administrator can override ownership checks
- Default role for new users is User (1)

---

### SizeName

**Purpose**: Named categories for common asset sizes

**Values**:
- **Zero** = 0: No size (0×0)
- **Miniscule** = 1: ⅛ cell (0.125×0.125)
- **Tiny** = 2: ¼ cell (0.25×0.25)
- **Small** = 3: ½ cell (0.5×0.5)
- **Medium** = 4: 1 cell (1×1) - Standard size
- **Large** = 5: 2 cells (2×2)
- **Huge** = 6: 3 cells (3×3)
- **Gargantuan** = 7: 4 cells (4×4)
- **Custom** = 99: Any other size (non-standard or rectangular)

**Usage Context**: Common context (NamedSize.Name property), Assets context (size categorization)

**Business Rules**:
- Named sizes apply only to square dimensions (IsSquare=true)
- Rectangular sizes always return Custom
- Custom includes: values >4, non-standard squares, all rectangles

---

## Shared Constants & Utilities

### Colors (Static Utility Class)

**Purpose**: Provides consistent color palette constants for theming and UI consistency across the application

**Type**: Static utility class (not a value object - no state to encapsulate)

**Usage Context**: Used by all contexts for consistent color theming (UI styling, Frame colors, Grid colors)

**Constants**:
- **Semantic Colors**: Primary, Secondary, Success, Information, Warning, Danger, Light, Dark
- **Named Colors**: Blue, Indigo, Purple, Pink, Red, Orange, Yellow, Green, Teal, Cyan
- **Utility Colors**: White, Black, Gray, GrayDark, Transparent

**Properties**:
- All constants return hex color strings (e.g., "#0d6efd" for Primary)
- Based on Bootstrap 5 color palette for consistency
- Immutable (static readonly properties)

**Usage Examples**:
```csharp
// Frame with palette colors
var tokenFrame = new Frame
{
    Shape = FrameShape.Circle,
    Color = Colors.Primary,      // "#0d6efd"
    BorderColor = Colors.Dark     // "#212529"
};

// Grid with semantic color
var grid = new Grid
{
    Type = GridType.Square,
    Size = 50,
    Color = Colors.Gray           // "#6c757d"
};
```

**Design Rationale**:
- Static class chosen over value object because:
  - No state to encapsulate (just constants)
  - No validation needed (predefined values)
  - Simplifies usage (Colors.Primary vs new Colors(...))
  - Better IntelliSense experience for developers

**Integration**:
- Frame.Color and Frame.BorderColor can use Colors constants
- Grid.Color can use Colors constants
- UI components reference Colors for theming

---

## Domain Rules Summary

**Common Value Object Rules**:

- **BR-01** - Validation: Participant.UserId must reference existing User
  - **Scope**: All contexts using Participant
  - **Enforcement**: Service layer validation (foreign key constraint)
  - **Validation**: Check User exists before creating Participant

- **BR-02** - Validation: PlayerType must be valid enum value
  - **Scope**: Participant value object
  - **Enforcement**: C# type system (enum)
  - **Validation**: Automatic (type safety)

- **BR-03** - Business Logic: JoinedAt should not be future date
  - **Scope**: Participant.JoinedAt
  - **Enforcement**: Service validation
  - **Validation**: Check JoinedAt <= DateTimeOffset.UtcNow

- **BR-04** - Validation: Frame.Color and BorderColor must be valid hex codes
  - **Scope**: Frame value object
  - **Enforcement**: Value object validation method
  - **Validation**: Regex pattern match ^#[0-9A-Fa-f]{6}$

- **BR-05** - Validation: FrameShape must be Square or Circle
  - **Scope**: Frame.Shape
  - **Enforcement**: C# type system (enum)
  - **Validation**: Automatic (type safety)

- **BR-06** - Validation: NamedSize.Width and Height must be positive
  - **Scope**: NamedSize value object
  - **Enforcement**: Value object validation
  - **Validation**: Check Width > 0 and Height > 0

- **BR-07** - Validation: NamedSize fractional values limited to 0.125, 0.25, 0.5
  - **Scope**: NamedSize.Width, NamedSize.Height
  - **Enforcement**: Value object validation
  - **Validation**: Allow whole numbers or specific fractional values only

- **BR-08** - Business Logic: NamedSize.IsSquare requires Width = Height
  - **Scope**: NamedSize value object
  - **Enforcement**: Value object invariant
  - **Validation**: When IsSquare=true, enforce Width = Height

- **BR-09** - Validation: Position coordinates can be any integer (including negative)
  - **Scope**: Position value object
  - **Enforcement**: C# type system (int)
  - **Validation**: Automatic (type safety, no additional constraints)

**Common Enum Rules**:

- **BR-10** - Business Logic: Only one PlayerType.Master allowed per GameSession
  - **Scope**: Game context using PlayerType
  - **Enforcement**: GameSession aggregate invariant
  - **Validation**: Service checks Participants collection

- **BR-11** - Authorization: RoleName.Administrator bypasses ownership checks
  - **Scope**: All contexts performing authorization
  - **Enforcement**: Service layer authorization logic
  - **Validation**: Check current user RoleName before permission checks

- **BR-12** - Business Logic: RoleName determines default permissions, PlayerType determines session-specific permissions
  - **Scope**: Cross-cutting authorization
  - **Enforcement**: Application layer (controllers, services)
  - **Validation**: Role-based and participant-based authorization

- **BR-13** - Business Logic: SizeName.Custom returned for rectangular sizes or non-standard dimensions
  - **Scope**: NamedSize.Name computed property
  - **Enforcement**: Value object business logic
  - **Validation**: Check IsSquare=false or dimensions not matching named presets

---

## Architecture Integration

### Shared Kernel Pattern

This Common domain follows the **Shared Kernel pattern** in DDD:

**Characteristics**:
- ✅ **Shared by multiple contexts**: Used by Assets, Library, Game contexts
- ✅ **Immutable primitives**: Value objects (Participant, Frame, NamedSize, Position) and enums only (no entities)
- ✅ **Stable contracts**: Changes require coordination across contexts
- ✅ **No infrastructure dependencies**: Pure domain primitives
- ✅ **Highly reusable**: Common concepts across bounded contexts

**Trade-offs**:
- ⚠️ **Coupling**: Changes to Common affect multiple contexts
- ⚠️ **Coordination**: Updates require testing all dependent contexts
- ✅ **Consistency**: Ensures same concepts used uniformly
- ✅ **Reduced duplication**: Avoids redundant definitions

### Domain Layer Purity
✅ No infrastructure dependencies
✅ No framework dependencies
✅ Pure domain primitives only (value objects, enums)
✅ Testable in isolation with simple unit tests

### Used By (Multiple Bounded Contexts)

**Assets Context**:
- Uses Frame value object in Asset.Display
- Uses FrameShape enum in Frame.Shape
- Uses NamedSize value object in AssetProperties.Size
- Uses SizeName enum in NamedSize.Name
- Uses Position value object in Asset.Position

**Library Context**:
- Could use Participant for collaborative editing (future)
- Could use Frame for encounter element styling (future)
- Could use Position for encounter element placement (future)

**Game Context**:
- Uses Participant in GameSession.Players and Schedule.Participants
- Uses PlayerType enum in Participant.PlayerType
- Uses RoleName for authorization checks
- Uses Position for asset placement in active encounters

**Identity Context**:
- Uses RoleName enum in User.Role (not navigable, but related)

---

## Testing Guidelines

### Value Object Testing

**Participant Tests**:
```csharp
[Fact]
public void Participant_WithSameUserIdAndType_AreEqual()
{
    var p1 = new Participant { UserId = userId, PlayerType = PlayerType.Player };
    var p2 = new Participant { UserId = userId, PlayerType = PlayerType.Player };
    Assert.Equal(p1, p2);
}

[Fact]
public void Participant_JoinedAtNotUsedInEquality()
{
    var p1 = new Participant { UserId = userId, PlayerType = PlayerType.Player, JoinedAt = time1 };
    var p2 = new Participant { UserId = userId, PlayerType = PlayerType.Player, JoinedAt = time2 };
    Assert.Equal(p1, p2); // Different JoinedAt, still equal
}
```

**Frame Tests**:
```csharp
[Fact]
public void Frame_WithSameProperties_AreEqual()
{
    var f1 = new Frame { Shape = FrameShape.Circle, Color = "#FF0000", BorderColor = "#000000" };
    var f2 = new Frame { Shape = FrameShape.Circle, Color = "#FF0000", BorderColor = "#000000" };
    Assert.Equal(f1, f2);
}

[Fact]
public void Frame_InvalidHexColor_ThrowsValidationException()
{
    Assert.Throws<ArgumentException>(() =>
        new Frame { Shape = FrameShape.Square, Color = "red", BorderColor = "#000000" });
}
```

**NamedSize Tests**:
```csharp
[Fact]
public void NamedSize_MediumSize_ReturnsCorrectName()
{
    var size = NamedSize.FromName(SizeName.Medium);
    Assert.Equal(1.0, size.Width);
    Assert.Equal(1.0, size.Height);
    Assert.True(size.IsSquare);
    Assert.Equal(SizeName.Medium, size.Name);
}

[Fact]
public void NamedSize_FractionalTiny_ReturnsCorrectName()
{
    var size = new NamedSize { Width = 0.25, Height = 0.25, IsSquare = true };
    Assert.Equal(SizeName.Tiny, size.Name);
}

[Fact]
public void NamedSize_RectangularSize_ReturnsCustom()
{
    var size = new NamedSize { Width = 2, Height = 3, IsSquare = false };
    Assert.Equal(SizeName.Custom, size.Name);
}

[Fact]
public void NamedSize_InvalidFractional_ThrowsValidationException()
{
    Assert.Throws<ArgumentException>(() =>
        new NamedSize { Width = 0.3, Height = 0.3, IsSquare = true });
}

[Fact]
public void NamedSize_NegativeDimension_ThrowsValidationException()
{
    Assert.Throws<ArgumentException>(() =>
        new NamedSize { Width = -1, Height = 1, IsSquare = false });
}
```

**Position Tests**:
```csharp
[Fact]
public void Position_WithSameCoordinates_AreEqual()
{
    var p1 = new Position { X = 5, Y = 10 };
    var p2 = new Position { X = 5, Y = 10 };
    Assert.Equal(p1, p2);
}

[Fact]
public void Position_AllowsNegativeCoordinates()
{
    var offGrid = new Position { X = -1, Y = -1 };
    Assert.Equal(-1, offGrid.X);
    Assert.Equal(-1, offGrid.Y);
}

[Fact]
public void Position_ToString_ReturnsFormattedString()
{
    var pos = new Position { X = 5, Y = 10 };
    Assert.Equal("(5, 10)", pos.ToString());
}
```

### Enum Testing

**PlayerType Tests**:
```csharp
[Fact]
public void PlayerType_HasCorrectValues()
{
    Assert.Equal(0, (int)PlayerType.Guest);
    Assert.Equal(1, (int)PlayerType.Player);
    Assert.Equal(2, (int)PlayerType.Assistant);
    Assert.Equal(99, (int)PlayerType.Master);
}
```

**RoleName Tests**:
```csharp
[Fact]
public void RoleName_HasCorrectValues()
{
    Assert.Equal(0, (int)RoleName.Guest);
    Assert.Equal(1, (int)RoleName.User);
    Assert.Equal(99, (int)RoleName.Administrator);
}
```

**SizeName Tests**:
```csharp
[Fact]
public void SizeName_HasCorrectValues()
{
    Assert.Equal(0, (int)SizeName.Zero);
    Assert.Equal(1, (int)SizeName.Miniscule);
    Assert.Equal(2, (int)SizeName.Tiny);
    Assert.Equal(3, (int)SizeName.Small);
    Assert.Equal(4, (int)SizeName.Medium);
    Assert.Equal(5, (int)SizeName.Large);
    Assert.Equal(6, (int)SizeName.Huge);
    Assert.Equal(7, (int)SizeName.Gargantuan);
    Assert.Equal(99, (int)SizeName.Custom);
}

[Fact]
public void SizeName_MediumIsDefaultSize()
{
    var mediumSize = NamedSize.FromName(SizeName.Medium);
    Assert.Equal(1.0, mediumSize.Width);
    Assert.Equal(1.0, mediumSize.Height);
}
```

---

<!--
═══════════════════════════════════════════════════════════════
DOMAIN MODEL QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════

## Entities (30 points)
N/A - Common context has no entities (shared kernel with value objects only)

## Value Objects (20 points)
✅ 10pts: All value objects complete (Participant, Frame, NamedSize, Position)
✅ 5pts: Immutability documented (C# records)
✅ 5pts: Factory methods defined (NamedSize.FromName, inline construction)

## Aggregates (25 points)
N/A - No aggregates in shared kernel

## Application Services (15 points)
N/A - No services (shared kernel primitives only)

## Ubiquitous Language (10 points)
✅ 10pts: Complete terminology (9 core terms defined)

## Shared Kernel Specific (35 points)
✅ 15pts: Shared kernel pattern documented (used by multiple contexts)
✅ 10pts: All enums complete (PlayerType, FrameShape, RoleName, SizeName) with values and business rules
✅ 5pts: Value object equality semantics clear
✅ 5pts: Usage examples provided

## Target Score: 75/100 (adjusted for shared kernel - no entities/aggregates/services)

### Extraction Notes:
✅ Shared kernel pattern correctly identified
✅ Value objects (Participant, Frame, NamedSize, Position) used across Assets, Library, Game contexts
✅ Enums (PlayerType, FrameShape, RoleName, SizeName) with explicit integer values documented
✅ Business rules for each enum value specified
✅ Testing guidelines provided for all value objects and enums
✅ Trade-offs of shared kernel documented (coupling vs consistency)
✅ NamedSize supports fractional dimensions (⅛, ¼, ½) and named categories
✅ Position allows negative coordinates for off-grid placement
-->
