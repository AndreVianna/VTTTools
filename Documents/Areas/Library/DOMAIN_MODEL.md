# Library Domain Model

**Bounded Context**: Library

**Purpose**: Manage hierarchical game content templates (World → Campaign → Adventure → Encounter) that Game Masters create for organizing and running tabletop RPG games.

**Boundaries**:
- **Inside**: World, Campaign, Adventure, Encounter entities; content hierarchy management; encounter composition (stage, grid, asset placement)
- **Outside**: User management (Identity context), Media resources for backgrounds (Media context), Asset templates (Assets context), Active game sessions (Game context)

**Architecture Pattern**: DDD Contracts + Service Implementation
- Domain entities are **data contracts** (anemic - no behavior)
- Business logic resides in **application services** (Source/Library/)
- Entities, value objects, and service interfaces define **contracts**
- Services enforce invariants and implement business rules

---

## Change Log
- *2025-12-01* — **1.2.0** — Updated EncounterWall to use Segments with SegmentType/SegmentState; updated EncounterRegion to use value-based labels; added context menu behavior documentation
- *2025-11-28* — **1.1.0** — Added EncounterWall, EncounterOpening, EncounterRegion, EncounterSource value objects; documented two-click opening placement and deletion behavior with pole cleanup
- *2025-10-02* — **1.0.0** — Initial domain model extracted from existing codebase

---

## Ubiquitous Language

- **World**: Multi-campaign story arc spanning multiple campaigns (highest level of hierarchy)
- **Campaign**: Multi-adventure storyline connecting related adventures within an world
- **Adventure**: Individual game module or scenario with multiple encounters (can be standalone or part of campaign)
- **Encounter**: Interactive tactical map with grid, background, and asset placements
- **Stage**: Encounter rendering area configuration (background, viewport, dimensions)
- **Grid**: Tactical map overlay (square, hexagonal, isometric) for movement and measurement
- **EncounterAsset**: Placed instance of an Asset template on a encounter (position, dimensions, z-index)
- **Background**: Visual image (Resource) used as encounter/adventure/world backdrop
- **Published**: Content approved and available for use
- **Public**: Content visible to all users (vs private/owner-only)
- **Ownership**: User (Game Master) who created and controls the content
- **Hierarchy**: Nested relationship structure (World > Campaign > Adventure > Encounter)
- **Wall**: Line segment(s) on encounter that block movement, line-of-sight, and/or lighting
- **Pole**: A point along a wall path with X, Y coordinates and height (H) in feet
- **Segment**: A section of wall between two poles with a specific type and state
- **SegmentType**: Classification of wall segment behavior (Wall, Fence, Door, Passage, Window, Opening)
- **SegmentState**: Current operational state of a segment (Open, Closed, Locked, Visible, Secret)
- **Region**: A named area zone on encounter for terrain effects, illumination, elevation, or fog of war
- **RegionType**: Classification of region purpose (Elevation, Terrain, Illumination, FogOfWar)
- **Source**: A light or sound emitter on encounter for dynamic lighting and audio

---

## Entities

### World

**Entity Classification**: Aggregate Root

**Aggregate Root**: This entity is the entry point for the World aggregate (World + owned Campaigns)

#### Identity
- **Primary Key**: Id (Guid)
- **Natural Key**: None (system-generated)

#### Attributes
- **Id**: Guid
  - **Constraints**: Primary key, required, system-generated
  - **Default Value**: New Guid on creation
  - **Nullable**: No
  - **Purpose**: Unique identifier for world

- **OwnerId**: Guid
  - **Constraints**: Foreign key to User.Id, required
  - **Default Value**: Current user ID at creation
  - **Nullable**: No
  - **Purpose**: Links world to owning Game Master

- **Name**: string
  - **Constraints**: Required, max length 128 characters
  - **Default Value**: None (must be provided)
  - **Nullable**: No
  - **Purpose**: Human-readable world name

- **Description**: string
  - **Constraints**: Max length 4096 characters
  - **Default Value**: Empty string
  - **Nullable**: No
  - **Purpose**: Detailed description of world story arc

- **Background**: Resource (references Media context)
  - **Constraints**: Must reference valid Resource with Type=Image if provided
  - **Default Value**: null
  - **Nullable**: Yes
  - **Purpose**: Visual backdrop for world

- **IsPublished**: bool
  - **Constraints**: If true, IsPublic must also be true
  - **Default Value**: false
  - **Nullable**: No
  - **Purpose**: Indicates world is approved for use

- **IsPublic**: bool
  - **Constraints**: Must be true if IsPublished is true
  - **Default Value**: false
  - **Nullable**: No
  - **Purpose**: Controls visibility to users other than owner

- **Campaigns**: List<Campaign> (owned entities)
  - **Constraints**: Owned collection, cascade delete
  - **Default Value**: Empty list
  - **Nullable**: No (empty list if no campaigns)
  - **Purpose**: Campaigns belonging to this world

#### Invariants
- **INV-01**: Name must not be empty or whitespace
  - **Rationale**: World must be identifiable
  - **Enforced By**: Service validation

- **INV-02**: Name length must not exceed 128 characters
  - **Rationale**: Database constraint and UI limits
  - **Enforced By**: EF Core MaxLength, service validation

- **INV-03**: Description length must not exceed 4096 characters
  - **Rationale**: Reasonable description limit
  - **Enforced By**: EF Core MaxLength

- **INV-04**: Published worlds must be public (IsPublished=true implies IsPublic=true)
  - **Rationale**: Cannot publish private-only content
  - **Enforced By**: Service validation

- **INV-05**: OwnerId must reference existing User
  - **Rationale**: Orphaned worlds not allowed
  - **Enforced By**: Database foreign key constraint

#### Operations (Implemented in Application Services)
- **Create World**: Creates new world with optional campaigns
  - **Implemented By**: ILibraryStorage.CreateWorldAsync()
  - **Pre-conditions**: Name valid, OwnerId exists
  - **Invariants Enforced**: INV-01, INV-02, INV-03, INV-05
  - **Post-conditions**: World persisted with owned Campaigns
  - **Returns**: Task<World>

- **Update World**: Modifies world properties
  - **Implemented By**: ILibraryStorage.UpdateWorldAsync()
  - **Pre-conditions**: World exists, user is owner
  - **Invariants Enforced**: INV-01, INV-02, INV-03, INV-04
  - **Post-conditions**: World updated
  - **Returns**: Task<World>

- **Delete World**: Removes world and all owned campaigns/adventures/encounters
  - **Implemented By**: ILibraryStorage.DeleteWorldAsync()
  - **Pre-conditions**: World exists, user is owner, not in use in active game sessions
  - **Invariants Enforced**: None (deletion)
  - **Post-conditions**: World and all children cascade deleted
  - **Returns**: Task

**Entity Behavior**: Immutable record with init-only properties, modified via service orchestration

#### Relationships
- **Owns** → Campaign: World owns multiple campaigns
  - **Cardinality**: One-to-Many (owned entity, cascade delete)
  - **Navigation**: Campaigns collection property

- **Belongs To** → User: World owned by one Game Master
  - **Cardinality**: Many-to-One
  - **Navigation**: OwnerId foreign key

- **References** → Resource: World may reference background
  - **Cardinality**: Many-to-One optional
  - **Navigation**: Background property (nullable)

---

### Campaign

**Entity Classification**: Child Entity (owned by World)

**Note**: Campaign can also exist as standalone (WorldId nullable)

#### Identity
- **Primary Key**: Id (Guid)
- **Natural Key**: None

#### Attributes
- **Id**: Guid
  - **Constraints**: Primary key, required, system-generated
  - **Default Value**: New Guid on creation
  - **Nullable**: No
  - **Purpose**: Unique identifier for campaign

- **WorldId**: Guid?
  - **Constraints**: Foreign key to World.Id (nullable - campaigns can be standalone)
  - **Default Value**: null (standalone campaign)
  - **Nullable**: Yes
  - **Purpose**: Optional parent world reference for campaign grouping

- **OwnerId**: Guid
  - **Constraints**: Foreign key to User.Id, required
  - **Default Value**: Current user ID at creation
  - **Nullable**: No
  - **Purpose**: Links campaign to owning Game Master

- **Name**: string
  - **Constraints**: Required, max length 128 characters
  - **Default Value**: None (must be provided)
  - **Nullable**: No
  - **Purpose**: Human-readable campaign name

- **Description**: string
  - **Constraints**: Max length 4096 characters
  - **Default Value**: Empty string
  - **Nullable**: No
  - **Purpose**: Detailed description of campaign storyline

- **Background**: Resource?
  - **Constraints**: Must reference valid Resource with Type=Image if provided
  - **Default Value**: null
  - **Nullable**: Yes
  - **Purpose**: Visual backdrop for campaign

- **IsPublished**: bool
  - **Constraints**: If true, IsPublic must also be true
  - **Default Value**: false
  - **Nullable**: No
  - **Purpose**: Indicates campaign is approved for use

- **IsPublic**: bool
  - **Constraints**: Must be true if IsPublished is true
  - **Default Value**: false
  - **Nullable**: No
  - **Purpose**: Controls visibility to users other than owner

- **Adventures**: List<Adventure>
  - **Constraints**: Owned collection, cascade delete
  - **Default Value**: Empty list
  - **Nullable**: No (empty list if no adventures)
  - **Purpose**: Adventures belonging to this campaign

#### Invariants
- Same as World (INV-01 through INV-05 apply)
- **INV-06**: If WorldId is provided, World must exist
  - **Rationale**: Valid parent reference
  - **Enforced By**: Database foreign key (nullable FK)

#### Operations (Implemented in Application Services)
- Similar to World: Create, Update, Delete
- **Add to World**: Associate standalone campaign with world
- **Remove from World**: Make campaign standalone (set WorldId = null)

#### Relationships
- **Owned By** ← World: Campaign optionally owned by World
  - **Cardinality**: Many-to-One optional
  - **Navigation**: WorldId foreign key (nullable)

- **Owns** → Adventure: Campaign owns multiple adventures
  - **Cardinality**: One-to-Many (owned, cascade delete)
  - **Navigation**: Adventures collection

---

### Adventure

**Entity Classification**: Aggregate Root (or Child Entity if part of Campaign)

**Aggregate Root**: Adventure can be standalone or nested within Campaign hierarchy

#### Identity
- **Primary Key**: Id (Guid)
- **Natural Key**: None

#### Attributes
- **Id**: Guid
  - **Constraints**: Primary key, required, system-generated
  - **Default Value**: New Guid on creation
  - **Nullable**: No
  - **Purpose**: Unique identifier for adventure

- **CampaignId**: Guid?
  - **Constraints**: Foreign key to Campaign.Id (nullable - adventures can be standalone)
  - **Default Value**: null (standalone adventure)
  - **Nullable**: Yes
  - **Purpose**: Optional parent campaign reference for adventure grouping

- **OwnerId**: Guid
  - **Constraints**: Foreign key to User.Id, required
  - **Default Value**: Current user ID at creation
  - **Nullable**: No
  - **Purpose**: Links adventure to owning Game Master

- **Name**: string
  - **Constraints**: Required, max length 128 characters
  - **Default Value**: None (must be provided)
  - **Nullable**: No
  - **Purpose**: Human-readable adventure name

- **Type**: AdventureType
  - **Constraints**: Must be valid enum value (Generic, OpenWorld, DungeonCrawl, HackNSlash, Survival, GoalDriven, RandomlyGenerated)
  - **Default Value**: AdventureType.Generic
  - **Nullable**: No
  - **Purpose**: Categorizes adventure for filtering and organization

- **Description**: string
  - **Constraints**: Max length 4096 characters
  - **Default Value**: Empty string
  - **Nullable**: No
  - **Purpose**: Detailed description of adventure module

- **Background**: Resource?
  - **Constraints**: Must reference valid Resource with Type=Image if provided
  - **Default Value**: null
  - **Nullable**: Yes
  - **Purpose**: Visual backdrop for adventure

- **IsPublished**: bool
  - **Constraints**: If true, IsPublic must also be true
  - **Default Value**: false
  - **Nullable**: No
  - **Purpose**: Indicates adventure is approved for use

- **IsPublic**: bool
  - **Constraints**: Must be true if IsPublished is true
  - **Default Value**: false
  - **Nullable**: No
  - **Purpose**: Controls visibility to users other than owner

- **Encounters**: List<Encounter>
  - **Constraints**: Owned collection, cascade delete
  - **Default Value**: Empty list
  - **Nullable**: No (empty list if no encounters)
  - **Purpose**: Encounters belonging to this adventure

#### Invariants
- Same as World (INV-01 through INV-05)
- **INV-07**: Type must be valid AdventureType enum value
  - **Rationale**: Category classification integrity
  - **Enforced By**: C# enum type system

- **INV-08**: If CampaignId is provided, Campaign must exist
  - **Rationale**: Valid parent reference
  - **Enforced By**: Database foreign key (nullable)

#### Operations (Implemented in Application Services)
- Similar to World: Create, Update, Delete
- **Add to Campaign**: Associate standalone adventure with campaign
- **Remove from Campaign**: Make adventure standalone
- **Clone Adventure**: Duplicate adventure with all encounters

#### Relationships
- **Owned By** ← Campaign: Adventure optionally owned by Campaign
  - **Cardinality**: Many-to-One optional
  - **Navigation**: CampaignId foreign key (nullable)

- **Owns** → Encounter: Adventure owns multiple encounters
  - **Cardinality**: One-to-Many (owned, cascade delete)
  - **Navigation**: Encounters collection

---

### Encounter

**Entity Classification**: Aggregate Root (or Child Entity if part of Adventure)

**Aggregate Root**: Encounter can be standalone or nested, is the most granular content unit

#### Identity
- **Primary Key**: Id (Guid)
- **Natural Key**: None

#### Attributes
- **Id**: Guid
  - **Constraints**: Primary key, required, system-generated
  - **Default Value**: New Guid on creation
  - **Nullable**: No
  - **Purpose**: Unique identifier for encounter

- **AdventureId**: Guid?
  - **Constraints**: Foreign key to Adventure.Id (nullable - encounters can be standalone)
  - **Default Value**: null (standalone encounter)
  - **Nullable**: Yes
  - **Purpose**: Optional parent adventure reference for encounter grouping

- **OwnerId**: Guid
  - **Constraints**: Foreign key to User.Id, required
  - **Default Value**: Current user ID at creation
  - **Nullable**: No
  - **Purpose**: Links encounter to owning Game Master

- **Name**: string
  - **Constraints**: Required, max length 128 characters
  - **Default Value**: None (must be provided)
  - **Nullable**: No
  - **Purpose**: Human-readable encounter name

- **Description**: string
  - **Constraints**: Max length 4096 characters
  - **Default Value**: Empty string
  - **Nullable**: No
  - **Purpose**: Detailed description of encounter setting and objectives

- **IsPublished**: bool
  - **Constraints**: None (encounters don't require IsPublic=true like other entities)
  - **Default Value**: false
  - **Nullable**: No
  - **Purpose**: Indicates encounter is approved for use in game sessions

- **Stage**: Stage
  - **Constraints**: Value object with valid dimensions (Width > 0, Height > 0)
  - **Default Value**: Stage with 1920x1080 dimensions
  - **Nullable**: No
  - **Purpose**: Encounter rendering area configuration (background, viewport, dimensions)

- **Grid**: Grid
  - **Constraints**: Value object with GridType and configuration
  - **Default Value**: Grid with Type=NoGrid
  - **Nullable**: No
  - **Purpose**: Tactical map overlay configuration (square, hex, isometric)

- **Assets**: List<EncounterAsset>
  - **Constraints**: Collection of value objects, each references valid Asset.Id
  - **Default Value**: Empty list
  - **Nullable**: No (empty list if no assets placed)
  - **Purpose**: Placed asset instances on this encounter with position and dimensions

- **Walls**: List<EncounterWall>
  - **Constraints**: Collection of value objects defining wall segments
  - **Default Value**: Empty list
  - **Nullable**: No (empty list if no walls defined)
  - **Purpose**: Wall segments for line-of-sight, movement blocking, and lighting boundaries

- **Openings**: List<EncounterOpening>
  - **Constraints**: Collection of value objects defining gaps in walls (doors, windows)
  - **Default Value**: Empty list
  - **Nullable**: No (empty list if no openings defined)
  - **Purpose**: Controllable gaps in walls that can be opened/closed/locked

- **Regions**: List<EncounterRegion>
  - **Constraints**: Collection of value objects defining area zones
  - **Default Value**: Empty list
  - **Nullable**: No (empty list if no regions defined)
  - **Purpose**: Named areas for triggers, terrain effects, and spatial organization

- **Sources**: List<EncounterSource>
  - **Constraints**: Collection of value objects defining light/sound sources
  - **Default Value**: Empty list
  - **Nullable**: No (empty list if no sources defined)
  - **Purpose**: Light and sound emitters for dynamic lighting and audio zones

#### Invariants
- Same as World (INV-01, INV-02, INV-03, INV-05)
- **INV-09**: Stage must have valid dimensions (Width > 0, Height > 0)
  - **Rationale**: Rendering requires valid viewport
  - **Enforced By**: Service validation, Stage value object construction

- **INV-10**: Grid configuration must be consistent with GridType
  - **Rationale**: Square grids need Size, hex grids need specific offsets
  - **Enforced By**: Service validation, Grid value object

- **INV-11**: EncounterAsset positions must be within Stage bounds
  - **Rationale**: Assets must be visible on encounter
  - **Enforced By**: Service validation when placing assets

- **INV-12**: EncounterWall must have at least 2 poles
  - **Rationale**: Wall requires start and end points
  - **Enforced By**: Service validation when creating/updating walls

- **INV-13**: EncounterOpening must reference valid wall and pole indices
  - **Rationale**: Opening must be positioned on an existing wall segment
  - **Enforced By**: Service validation when placing openings

- **INV-14**: EncounterOpening StartPoleIndex must be less than EndPoleIndex
  - **Rationale**: Consistent ordering for gap rendering
  - **Enforced By**: Service validation, automatic index ordering

#### Operations (Implemented in Application Services)
- Create Encounter, Update Encounter, Delete Encounter
- **Configure Stage**: Update Stage value object (background, viewport)
- **Configure Grid**: Update Grid value object (type, size, offset, color)
- **Place Asset**: Add EncounterAsset to Assets collection
- **Move Asset**: Update EncounterAsset position
- **Remove Asset**: Remove EncounterAsset from collection
- **Add Wall**: Create EncounterWall with poles defining wall path
- **Update Wall**: Modify wall poles, visibility, or properties
- **Remove Wall**: Delete wall and all associated openings
- **Place Opening**: Add EncounterOpening on a wall segment (two-click placement inserts poles)
- **Update Opening**: Modify opening state (open/closed/locked), visibility, or properties
- **Remove Opening**: Delete opening and optionally clean up unused wall poles
- **Clone Encounter**: Duplicate encounter with all assets, walls, openings, regions, sources

#### Relationships
- **Owned By** ← Adventure: Encounter optionally owned by Adventure
  - **Cardinality**: Many-to-One optional
  - **Navigation**: AdventureId foreign key (nullable)

- **References** → Resource: Encounter.Stage.Background may reference background image
  - **Cardinality**: Many-to-One optional
  - **Navigation**: Stage.Background property

- **References** → Asset: Encounter.Assets collection references Asset templates
  - **Cardinality**: Many-to-Many (via EncounterAsset value object)
  - **Navigation**: EncounterAsset.AssetId references Asset.Id

- **Referenced By** ← GameSession: Encounter may be used in active game session
  - **Cardinality**: One-to-Many
  - **Navigation**: Not navigable from Encounter

---

## Value Objects

### Stage

**Purpose**: Defines encounter rendering area configuration (background, viewport, dimensions)

#### Properties
- **Background**: Resource? (nullable reference to background image)
- **ViewportX**: int (X offset for viewport)
- **ViewportY**: int (Y offset for viewport)
- **Width**: int (stage width in pixels)
- **Height**: int (stage height in pixels)

#### Creation & Validation
- **Factory Method**: Inline construction: `new Stage { Background = resource, Width = 1920, Height = 1080, ViewportX = 0, ViewportY = 0 }`
- **Validation Rules**:
  - Width and Height must be positive
  - ViewportX and ViewportY can be any integer (negative for panning outside bounds)
- **Immutability**: Yes (record type)

#### Equality & Comparison
- **Equality**: Value-based (all properties match)
- **Hash Code**: Based on all properties
- **Comparison**: Not comparable

---

### Grid

**Purpose**: Defines tactical map overlay configuration (type, size, offset, color)

#### Properties
- **Type**: GridType (enum: NoGrid, Square, HexV, HexH, Isometric)
- **Size**: int (cell size in pixels)
- **OffsetX**: int (grid alignment offset)
- **OffsetY**: int (grid alignment offset)
- **Color**: string (hex color code for grid lines)

#### Creation & Validation
- **Factory Method**: Inline construction: `new Grid { Type = GridType.Square, Size = 50, OffsetX = 0, OffsetY = 0, Color = "#000000" }`
- **Validation Rules**:
  - Type must be valid GridType enum
  - Size must be positive if Type != NoGrid
  - Color must be valid hex format
- **Immutability**: Yes (record type)

---

### EncounterAsset

**Purpose**: Represents placed instance of Asset template on a encounter (position, size, layer)

#### Properties
- **AssetId**: Guid (references Asset.Id)
- **X**: int (horizontal position)
- **Y**: int (vertical position)
- **Width**: int? (nullable, uses Asset default if null)
- **Height**: int? (nullable, uses Asset default if null)
- **ZIndex**: int (layering order, higher is on top)
- **Rotation**: double? (rotation angle in degrees, nullable)

#### Creation & Validation
- **Factory Method**: `new EncounterAsset { AssetId = assetId, X = 100, Y = 100, ZIndex = 0 }`
- **Validation Rules**:
  - AssetId must reference existing Asset
  - Width and Height must be positive if provided
  - ZIndex can be any integer
- **Immutability**: Yes (record type)

---

### EncounterWall

**Purpose**: Represents a wall on an encounter composed of poles and segments, used for line-of-sight blocking, movement restriction, and lighting boundaries

#### Properties
- **Index**: uint (unique index within encounter)
- **Name**: string (human-readable wall name, max 128 characters)
- **Poles**: List<Pole> (ordered list of points defining wall path)
- **Segments**: List<WallSegment> (segments between poles with type and state)
- **IsClosed**: bool (whether wall forms a closed loop)

#### Pole Value Object
- **Index**: uint (unique index within wall)
- **X**: double (horizontal position in pixels)
- **Y**: double (vertical position in pixels)
- **H**: double (height in feet, used for 3D calculations)

#### WallSegment Value Object
- **Index**: uint (unique index within wall)
- **StartPole**: Pole (reference to start pole)
- **EndPole**: Pole (reference to end pole)
- **Type**: SegmentType (enum defining segment behavior)
- **State**: SegmentState (enum defining current operational state)

#### SegmentType Enum
- **Wall** (0): Solid barrier blocking movement and line-of-sight
- **Fence** (1): Partial barrier with visibility through
- **Door** (2): Openable barrier, default state: Closed
- **Passage** (3): Passageway, default state: Open
- **Window** (4): Viewing aperture, default state: Closed
- **Opening** (5): Open gap in wall, default state: Open

#### SegmentState Enum
- **Open** (0): Segment allows movement and line-of-sight
- **Closed** (1): Segment blocks movement but may allow limited visibility
- **Locked** (2): Segment blocks movement and requires key/action to open
- **Visible** (2): Alias for Locked, used for barrier types (Wall, Fence)
- **Secret** (3): Segment is hidden from players until discovered

#### Default State by Type
| Segment Type | Default State |
|--------------|---------------|
| Wall | Visible |
| Fence | Visible |
| Door | Closed |
| Passage | Open |
| Window | Closed |
| Opening | Open |

#### Valid States by Type
| Segment Type | Valid States |
|--------------|--------------|
| Wall, Fence | Visible, Secret |
| Door, Window | Open, Closed, Locked, Secret |
| Passage, Opening | Open, Secret |

#### Creation & Validation
- **Factory Method**: `new EncounterWall { Index = 1, Name = "North Wall", Poles = [...], Segments = [...], IsClosed = false }`
- **Validation Rules**:
  - Poles must contain at least 2 points
  - Name max length 128 characters
  - Pole coordinates must be valid numbers
  - Segment type must be valid SegmentType enum
  - Segment state must be valid for segment type
- **Immutability**: Yes (record type)

#### UI Interaction
- **Context Menu**: Right-click on segment opens context menu with type and state selectors
- **State Icons**: Segments display state icons (lock icon for Locked, eye-slash for Secret)
- **Click-through**: Right-click on another segment switches context menu to that segment
- **Close Behavior**: Click outside context menu closes it

---

### EncounterRegion

**Purpose**: Represents a named area zone on an encounter for terrain effects, illumination, elevation, and fog of war

#### Properties
- **Index**: uint (unique index within encounter)
- **Name**: string (human-readable region name, max 128 characters)
- **Type**: RegionType (enum defining region purpose)
- **Value**: int (type-specific value determining region effect)
- **Vertices**: List<Point> (ordered list of points defining region boundary)

#### RegionType Enum
- **Elevation**: Vertical height modifier (value in feet, positive or negative)
- **Terrain**: Movement difficulty (0=Normal, 1=Difficult, 2=Impassable)
- **Illumination**: Light level modifier (-2=Darkness, -1=Dim, 0=Normal, 1=Bright)
- **FogOfWar**: Visibility state for players (0=Visible, 1=Outdated, 2=Hidden)

#### Value-to-Label Mappings (Frontend-Only)

Labels are derived from the `Value` property on the frontend based on `Type`. No labels are stored in the database.

| Type | Value | Display Label |
|------|-------|---------------|
| Elevation | any | Displayed as-is with sign (+10, -5, 0) |
| Terrain | 0 | Normal |
| Terrain | 1 | Difficult |
| Terrain | 2 | Impassable |
| Illumination | -2 | Darkness |
| Illumination | -1 | Dim |
| Illumination | 0 | Normal |
| Illumination | 1 | Bright |
| FogOfWar | 0 | Visible |
| FogOfWar | 1 | Outdated |
| FogOfWar | 2 | Hidden |

#### Default Values by Type
| Type | Default Value |
|------|---------------|
| Elevation | 0 |
| Terrain | 0 (Normal) |
| Illumination | 0 (Normal) |
| FogOfWar | 2 (Hidden) |

#### Region Colors (Derived from Type and Value)
Region colors are determined by the combination of Type and Value:
- **Elevation**: Color varies by height (blues for negative, greens for zero, oranges for positive)
- **Terrain**: Normal=transparent, Difficult=yellow, Impassable=red
- **Illumination**: Darkness=dark gray, Dim=gray, Normal=transparent, Bright=yellow
- **FogOfWar**: Visible=transparent, Outdated=semi-transparent gray, Hidden=opaque black

#### Creation & Validation
- **Factory Method**: `new EncounterRegion { Index = 1, Name = "Rough Ground", Type = "Terrain", Value = 1, Vertices = [...] }`
- **Validation Rules**:
  - Vertices must contain at least 3 points (triangle minimum)
  - Name max length 128 characters
  - Type must be valid RegionType
  - Value must be valid for the specified Type (except Elevation which accepts any integer)
- **Immutability**: Yes (record type)

#### UI Interaction
- **Context Menu**: Right-click on region opens context menu with name editor and value selector
- **Name Editing**: Name is directly editable in the context menu (no click to start required)
- **Type Display**: Type is shown as read-only header (cannot be changed after creation)
- **Value Selection**: Elevation uses numeric input; other types use dropdown with label options
- **Click-through**: Right-click on another region switches context menu to that region
- **Close Behavior**: Click outside context menu closes it
- **No Canvas Labels**: Labels are not displayed on the canvas (removed due to centroid placement issues with concave polygons)

#### FogOfWar Special Handling
FogOfWar regions are managed through a dedicated panel rather than the region context menu:
- FogOfWarRenderer uses `listening={false}` (not interactive on canvas)
- Visibility is toggled through the Fog of War panel
- Does not respond to right-click context menu

---

### EncounterSource

**Purpose**: Represents a light or sound emitter on an encounter for dynamic lighting and audio zones

#### Properties
- **Index**: uint (unique index within encounter)
- **Name**: string (human-readable source name, max 128 characters)
- **Type**: SourceType (enum: Light, Sound)
- **Position**: Point (X, Y coordinates)
- **Radius**: double (emission radius in feet)
- **Intensity**: double (brightness/volume level)
- **Color**: string? (optional hex color for light sources)

#### Creation & Validation
- **Factory Method**: `new EncounterSource { Index = 1, Name = "Torch", Type = SourceType.Light, Position = ..., Radius = 30 }`
- **Validation Rules**:
  - Radius must be positive
  - Intensity must be between 0.0 and 1.0
  - Name max length 128 characters
- **Immutability**: Yes (record type)

---

## Aggregates

### World Aggregate

**Aggregate Root**: World

**Entities in Aggregate**: World (root), Campaign (owned)

**Value Objects**: Background (Resource reference)

**Boundary**: World owns Campaigns. Campaigns within an World are loaded/saved together. Adventures are in Campaign aggregate, not World.

**Aggregate Invariants**:
- **AGG-01**: Deleting World cascades to all owned Campaigns (and their Adventures/Encounters)
- **AGG-02**: World can only be modified by owner

---

### Campaign Aggregate

**Aggregate Root**: Campaign (when standalone) or World (when Campaign.WorldId is set)

**Entities in Aggregate**: Campaign (root), Adventure (owned)

**Boundary**: Campaign owns Adventures. Adventures can also be standalone.

**Aggregate Invariants**:
- **AGG-03**: Deleting Campaign cascades to all owned Adventures (and their Encounters)
- **AGG-04**: Campaign can move between World (set WorldId) or standalone (WorldId = null)

---

### Adventure Aggregate

**Aggregate Root**: Adventure (when standalone) or Campaign (when Adventure.CampaignId is set)

**Entities in Aggregate**: Adventure (root), Encounter (owned)

**Boundary**: Adventure owns Encounters. Encounters can also be standalone.

**Aggregate Invariants**:
- **AGG-05**: Deleting Adventure cascades to all owned Encounters
- **AGG-06**: Adventure can move between Campaign or standalone

---

### Encounter Aggregate

**Aggregate Root**: Encounter (when standalone) or Adventure (when Encounter.AdventureId is set)

**Value Objects in Aggregate**: Stage, Grid, EncounterAsset (collection), EncounterWall (collection), EncounterOpening (collection), EncounterRegion (collection), EncounterSource (collection)

**Boundary**: Encounter is atomic unit. All value objects (Stage, Grid, Assets, Walls, Openings, Regions, Sources) are part of Encounter aggregate.

**Aggregate Invariants**:
- **AGG-07**: Encounter can move between Adventure or standalone
- **AGG-08**: All encounter value objects (assets, walls, openings, regions, sources) have no independent existence, deleted with Encounter
- **AGG-09**: Encounter cannot be deleted if referenced by active GameSession
- **AGG-10**: Deleting a wall cascades to delete all openings on that wall
- **AGG-11**: Opening pole indices must remain valid after wall pole modifications

---

## Domain Services

### ILibraryStorage

**Purpose**: Persistence and retrieval for World, Campaign, Adventure, Encounter hierarchies

**Responsibilities**:
- CRUD operations for all Library entities
- Manage hierarchical relationships (World > Campaign > Adventure > Encounter)
- Enforce cascade delete rules
- Provide query operations with filtering

#### Operations

**World Operations**:
- **CreateWorldAsync(World world)**: Persist new world with owned campaigns
  - **Inputs**: World entity (validated)
  - **Outputs**: Task<World> (persisted entity with ID)
  - **Side Effects**: Database insert, cascade creates Campaigns if provided

- **GetWorldByIdAsync(Guid worldId)**: Retrieve world with owned campaigns
  - **Inputs**: World ID
  - **Outputs**: Task<World?> (null if not found, includes Campaigns collection)
  - **Side Effects**: None (read-only)

- **UpdateWorldAsync(World world)**: Update existing world
  - **Inputs**: World entity with changes
  - **Outputs**: Task<World> (updated entity)
  - **Side Effects**: Database update

- **DeleteWorldAsync(Guid worldId)**: Remove world and cascade to campaigns/adventures/encounters
  - **Inputs**: World ID
  - **Outputs**: Task
  - **Side Effects**: Database cascade delete (World → Campaigns → Adventures → Encounters)

- **GetWorldsByOwnerAsync(Guid ownerId)**: Retrieve worlds owned by user
  - **Inputs**: Owner user ID
  - **Outputs**: Task<List<World>>
  - **Side Effects**: None (read-only)

**Campaign Operations**:
- **CreateCampaignAsync(Campaign campaign)**: Persist new campaign
  - **Inputs**: Campaign entity (validated, WorldId nullable)
  - **Outputs**: Task<Campaign>
  - **Side Effects**: Database insert

- **UpdateCampaignAsync(Campaign campaign)**: Update campaign (can change WorldId for hierarchy movement)
  - **Inputs**: Campaign entity with changes
  - **Outputs**: Task<Campaign>
  - **Side Effects**: Database update, may change parent World

- **GetCampaignsByWorldAsync(Guid worldId)**: Retrieve campaigns within world
  - **Inputs**: World ID
  - **Outputs**: Task<List<Campaign>>
  - **Side Effects**: None (read-only)

**Adventure Operations**:
- **CreateAdventureAsync(Adventure adventure)**: Persist new adventure
  - **Inputs**: Adventure entity (validated, CampaignId nullable)
  - **Outputs**: Task<Adventure>
  - **Side Effects**: Database insert

- **CloneAdventureAsync(Guid adventureId)**: Duplicate adventure with all encounters
  - **Inputs**: Adventure ID to clone
  - **Outputs**: Task<Adventure> (new adventure with cloned encounters)
  - **Side Effects**: Database inserts (adventure + all encounters)

**Encounter Operations**:
- **CreateEncounterAsync(Encounter encounter)**: Persist new encounter
  - **Inputs**: Encounter entity (validated, AdventureId nullable, Stage and Grid required)
  - **Outputs**: Task<Encounter>
  - **Side Effects**: Database insert

- **UpdateEncounterAsync(Encounter encounter)**: Update encounter (Stage, Grid, Assets)
  - **Inputs**: Encounter entity with changes
  - **Outputs**: Task<Encounter>
  - **Side Effects**: Database update

- **CloneEncounterAsync(Guid encounterId)**: Duplicate encounter with all placed assets
  - **Inputs**: Encounter ID to clone
  - **Outputs**: Task<Encounter> (new encounter with cloned EncounterAssets)
  - **Side Effects**: Database insert

**Asset Placement Operations**:
- **AddAssetToEncounterAsync(Guid encounterId, EncounterAsset encounterAsset)**: Place asset on encounter
  - **Inputs**: Encounter ID, EncounterAsset value object (AssetId, position, dimensions)
  - **Outputs**: Task<Encounter> (updated encounter with new asset)
  - **Side Effects**: Database update (Encounter.Assets collection modified)

#### Dependencies
- **Required**: DbContext (EF Core), IMediaStorage (for background Resource validation), IAssetStorage (for EncounterAsset.AssetId validation)

---

## Domain Rules Summary

- **BR-01** - Validation: Names must not be empty (applies to World, Campaign, Adventure, Encounter)
- **BR-02** - Validation: Name max length 128 characters
- **BR-03** - Validation: Description max length 4096 characters
- **BR-04** - Business Logic: Published content must be public
- **BR-05** - Authorization: Only owner can modify content
- **BR-06** - Referential Integrity: OwnerId must reference existing User
- **BR-07** - Data Consistency: Deleting parent cascades to children (World → Campaign → Adventure → Encounter)
- **BR-08** - Business Logic: Content can be moved between hierarchies or standalone
- **BR-09** - Validation: Stage dimensions must be positive
- **BR-10** - Validation: Grid configuration must match GridType
- **BR-11** - Validation: EncounterAsset positions should be within Stage bounds
- **BR-12** - Referential Integrity: EncounterAsset.AssetId must reference existing Asset
- **BR-13** - Business Logic: Encounter cannot be deleted if in use by active GameSession
- **BR-14** - Validation: EncounterWall must have at least 2 poles
- **BR-15** - Referential Integrity: EncounterOpening.WallIndex must reference existing wall
- **BR-16** - Validation: EncounterOpening StartPoleIndex < EndPoleIndex (enforced by service)
- **BR-17** - Data Consistency: Deleting wall cascades to delete all openings on that wall
- **BR-18** - Data Consistency: Deleting opening removes unused poles and adjusts other openings' indices
- **BR-19** - Validation: Opening height must be > 0 and ≤ 30 feet

---

## Architecture Integration

### Domain Layer Purity
✅ No infrastructure dependencies
✅ No framework dependencies
✅ Pure business contracts only
✅ Testable in isolation

### Used By (Application Layer)
- **Create Content Hierarchy**: Uses World/Campaign/Adventure/Encounter entities
- **Design Encounter**: Uses Encounter, Stage, Grid, EncounterAsset, EncounterWall, EncounterOpening, EncounterRegion, EncounterSource
- **Wall Management**: Add/update/remove walls with pole-based geometry
- **Opening Placement**: Two-click placement of doors/windows on wall segments with automatic pole insertion
- **Clone Content**: Duplicates Adventure or Encounter with all children (including walls, openings, regions, sources)
- **Publish Content**: Sets IsPublished and enforces IsPublic=true
- **Game Session Creation**: Game context references Encounter.Id for active gameplay

---

<!--
═══════════════════════════════════════════════════════════════
DOMAIN MODEL QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════

## Entities (30 points)
✅ 10pts: All entities have complete attribute lists (World, Campaign, Adventure, Encounter)
✅ 10pts: All invariants defined (INV-01 through INV-11)
✅ 5pts: Operations documented (CRUD + hierarchy management)
✅ 5pts: Aggregate roots identified (World, Campaign, Adventure, Encounter - context-dependent)

## Value Objects (20 points)
✅ 10pts: Value objects defined (Stage, Grid, EncounterAsset)
✅ 5pts: Immutability documented
✅ 5pts: Factory methods defined

## Aggregates (25 points)
✅ 10pts: Aggregate boundaries defined (hierarchical with optional nesting)
✅ 10pts: Aggregate invariants specified (AGG-01 through AGG-09)
✅ 5pts: Lifecycle management (cascade delete, move between hierarchies)

## Application Services (15 points)
✅ 10pts: Service interface (ILibraryStorage) defined
✅ 5pts: Operations documented
✅ 5pts: Dependencies clear

## Ubiquitous Language (10 points)
✅ 10pts: Complete terminology (11 terms defined)

## Target Score: 100/100 ✅

### Extraction Notes:
✅ Complex hierarchical structure (World > Campaign > Adventure > Encounter) documented
✅ Optional parent relationships (nullable FKs) enable standalone or nested usage
✅ Cascade delete rules defined
✅ Value objects (Stage, Grid, EncounterAsset) for encounter composition
✅ Service orchestration for hierarchy management
-->
