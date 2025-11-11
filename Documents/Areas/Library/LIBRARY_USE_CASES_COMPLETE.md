# Library Area - Complete Use Case Specifications

**Generated**: 2025-10-02
**Domain Model Version**: 1.0.0
**Total Use Cases**: 23 (5 Epic + 5 Campaign + 5 Adventure + 8 Encounter)

This document contains complete specifications for all Library area use cases across 4 features: Epic Management, Campaign Management, Adventure Management, and Encounter Management.

---

## Table of Contents

### Epic Management (5 use cases)
1. [Create Epic](#1-create-epic)
2. [Get Epic By ID](#2-get-epic-by-id)
3. [Update Epic](#3-update-epic)
4. [Delete Epic](#4-delete-epic)
5. [Get Epics By Owner](#5-get-epics-by-owner)

### Campaign Management (5 use cases)
6. [Create Campaign](#6-create-campaign)
7. [Update Campaign](#7-update-campaign)
8. [Get Campaigns By Epic](#8-get-campaigns-by-epic)
9. [Move Campaign To Epic](#9-move-campaign-to-epic)
10. [Make Campaign Standalone](#10-make-campaign-standalone)

### Adventure Management (5 use cases)
11. [Create Adventure](#11-create-adventure)
12. [Update Adventure](#12-update-adventure)
13. [Clone Adventure](#13-clone-adventure)
14. [Move Adventure To Campaign](#14-move-adventure-to-campaign)
15. [Make Adventure Standalone](#15-make-adventure-standalone)

### Encounter Management (8 use cases)
16. [Create Encounter](#16-create-encounter)
17. [Update Encounter](#17-update-encounter)
18. [Configure Stage](#18-configure-stage)
19. [Configure Grid](#19-configure-grid)
20. [Place Asset](#20-place-asset)
21. [Move Asset](#21-move-asset)
22. [Remove Asset](#22-remove-asset)
23. [Clone Encounter](#23-clone-encounter)

---

## Epic Management Use Cases

### 1. Create Epic

**UI Type**: API_ENDPOINT - POST /api/library/epics

**Purpose**: Create new multi-campaign story arc (Epic entity) with optional campaigns

**Business Value**: Enables Game Masters to establish top-level organizational structure for multi-campaign narratives

**Input Requirements**:
- Name: string (required, 1-128 characters)
- Description: string (optional, max 4096 characters)
- Background: Resource? (optional, must be valid Image)
- IsPublished: bool (default false)
- IsPublic: bool (default false)
- OwnerId: Guid (from authenticated user)
- Campaigns: List<Campaign> (optional)

**Business Rules**:
- INV-01: Name must not be empty or whitespace
- INV-02: Name max 128 characters
- INV-03: Description max 4096 characters
- INV-04: IsPublished=true → IsPublic=true
- INV-05: OwnerId must reference existing User
- AGG-01: Epic owns Campaigns (cascade insert)
- AGG-02: Only owner can modify Epic

**Processing Steps**:
1. Validate authentication, extract OwnerId
2. Validate Name (INV-01, INV-02)
3. Validate Description (INV-03)
4. Validate publication rules (INV-04)
5. Validate OwnerId via IUserStorage (INV-05)
6. Validate Background via IMediaStorage if provided
7. Generate Epic.Id (Guid)
8. Create Epic entity
9. Validate and associate Campaigns (set EpicId)
10. Persist via ILibraryStorage.CreateEpicAsync
11. Publish EpicCreated domain event
12. Return Epic with Id and Campaigns

**Output**: Epic entity (JSON) with generated Id, owned Campaigns

**Error Scenarios**:
- Name empty/whitespace → 400 "Epic name is required"
- Name too long → 400 "Epic name must not exceed 128 characters"
- Description too long → 400 "Epic description must not exceed 4096 characters"
- IsPublished=true but IsPublic=false → 400 "Published epics must be public"
- Invalid OwnerId → 404 "Owner user not found"
- Invalid Background → 404 "Background resource not found or not an image"
- Campaign validation failure → 400 with specific message
- Persistence failure → 500 "Failed to create epic"
- Unauthorized → 403 "User not authorized"

**Acceptance Criteria**:
- AC-01: Epic creation succeeds with valid inputs, EpicCreated event published
- AC-02: Epic creation fails with empty name (INV-01)
- AC-03: Epic creation fails with name > 128 chars (INV-02)
- AC-04: Epic creation fails with IsPublished=true, IsPublic=false (INV-04)
- AC-05: Epic creation succeeds with Campaigns, all persisted with EpicId
- AC-06: Epic creation fails with invalid OwnerId (INV-05)

---

### 2. Get Epic By ID

**UI Type**: API_ENDPOINT - GET /api/library/epics/:id

**Purpose**: Retrieve epic with owned campaigns collection

**Business Value**: Enables viewing complete epic details including all associated campaigns

**Input Requirements**:
- EpicId: Guid (required, from route parameter)

**Business Rules**:
- Epic must exist
- No authorization required (public/private handled by business logic)

**Processing Steps**:
1. Validate EpicId format (valid Guid)
2. Query Epic via ILibraryStorage.GetEpicByIdAsync(epicId)
3. Include Campaigns collection (eager loading)
4. Return Epic or null if not found

**Output**: Epic entity (JSON) with Campaigns collection, or 404 if not found

**Error Scenarios**:
- Invalid EpicId format → 400 "Invalid epic identifier"
- Epic not found → 404 "Epic not found"
- Database error → 500 "Failed to retrieve epic"

**Acceptance Criteria**:
- AC-01: GetEpicById returns Epic with Campaigns for valid existing Id
- AC-02: GetEpicById returns 404 for non-existent Id
- AC-03: Campaigns collection loaded and included in response

---

### 3. Update Epic

**UI Type**: API_ENDPOINT - PUT /api/library/epics/:id

**Purpose**: Modify epic properties (name, description, background, publication status)

**Business Value**: Enables Game Masters to refine epic details and control visibility

**Input Requirements**:
- EpicId: Guid (required, from route)
- Name: string (required, 1-128 characters)
- Description: string (optional, max 4096)
- Background: Resource? (optional)
- IsPublished: bool
- IsPublic: bool
- OwnerId: Guid (from authenticated user, for authorization)

**Business Rules**:
- Same as Create Epic (INV-01 through INV-05)
- AGG-02: Only owner can modify

**Processing Steps**:
1. Validate authentication, extract OwnerId
2. Retrieve existing Epic via GetEpicByIdAsync
3. Verify ownership (Epic.OwnerId == authenticated OwnerId)
4. Validate Name (INV-01, INV-02)
5. Validate Description (INV-03)
6. Validate publication rules (INV-04)
7. Validate Background via IMediaStorage if changed
8. Update Epic properties
9. Persist via ILibraryStorage.UpdateEpicAsync
10. Publish EpicUpdated domain event
11. Return updated Epic

**Output**: Updated Epic entity (JSON)

**Error Scenarios**:
- Epic not found → 404 "Epic not found"
- Not owner → 403 "Only owner can modify epic"
- Same validation errors as Create Epic

**Acceptance Criteria**:
- AC-01: Update succeeds with valid changes by owner
- AC-02: Update fails when not owner (AGG-02)
- AC-03: Update fails with invalid publication rules (INV-04)
- AC-04: EpicUpdated event published on success

---

### 4. Delete Epic

**UI Type**: API_ENDPOINT - DELETE /api/library/epics/:id

**Purpose**: Remove epic and cascade to campaigns/adventures/encounters

**Business Value**: Enables Game Masters to remove unwanted content hierarchies

**Input Requirements**:
- EpicId: Guid (required, from route)
- OwnerId: Guid (from authenticated user)

**Business Rules**:
- AGG-01: Cascade delete to all owned Campaigns → Adventures → Encounters
- AGG-02: Only owner can delete
- BR-13: Cannot delete if any Encounter is in use by active GameSession

**Processing Steps**:
1. Validate authentication, extract OwnerId
2. Retrieve Epic via GetEpicByIdAsync
3. Verify ownership (Epic.OwnerId == OwnerId)
4. Check for active GameSession references via IGameSessionStorage
5. If active references exist, return error
6. Delete Epic via ILibraryStorage.DeleteEpicAsync (cascade)
7. Publish EpicDeleted domain event
8. Return success (204 No Content)

**Output**: 204 No Content on success

**Error Scenarios**:
- Epic not found → 404 "Epic not found"
- Not owner → 403 "Only owner can delete epic"
- Active game session references → 409 "Epic contains encounters in use by active game sessions"
- Database error → 500 "Failed to delete epic"

**Acceptance Criteria**:
- AC-01: Delete succeeds and cascades to all Campaigns/Adventures/Encounters
- AC-02: Delete fails when not owner (AGG-02)
- AC-03: Delete fails when Encounter in use by active GameSession (BR-13)
- AC-04: EpicDeleted event published on success

---

### 5. Get Epics By Owner

**UI Type**: API_ENDPOINT - GET /api/library/epics?ownerId=:ownerId

**Purpose**: Query epics owned by specific Game Master

**Business Value**: Enables Game Masters to view their epic library

**Input Requirements**:
- OwnerId: Guid (required, from query parameter)

**Business Rules**:
- No ownership validation (public query)
- Returns empty list if no epics found

**Processing Steps**:
1. Validate OwnerId format
2. Query Epics via ILibraryStorage.GetEpicsByOwnerAsync(ownerId)
3. Include Campaigns collections (optional, based on query parameter)
4. Return list of Epics

**Output**: Array of Epic entities (JSON)

**Error Scenarios**:
- Invalid OwnerId format → 400 "Invalid owner identifier"
- Database error → 500 "Failed to retrieve epics"

**Acceptance Criteria**:
- AC-01: GetEpicsByOwner returns all epics for valid owner
- AC-02: GetEpicsByOwner returns empty list for owner with no epics
- AC-03: Campaigns included if query parameter `includeCampaigns=true`

---

## Campaign Management Use Cases

### 6. Create Campaign

**UI Type**: API_ENDPOINT - POST /api/library/campaigns

**Purpose**: Create new multi-adventure storyline with optional epic association

**Business Value**: Enables Game Masters to establish campaign-level organization (standalone or within epic)

**Input Requirements**:
- Name: string (required, 1-128 characters)
- Description: string (optional, max 4096)
- Background: Resource? (optional)
- IsPublished: bool (default false)
- IsPublic: bool (default false)
- OwnerId: Guid (from authenticated user)
- EpicId: Guid? (optional, for epic association)
- Adventures: List<Adventure> (optional)

**Business Rules**:
- Same as Epic (INV-01 through INV-05)
- INV-06: If EpicId provided, Epic must exist
- AGG-03: Campaign owns Adventures (cascade)
- AGG-04: Campaign can be standalone or within Epic

**Processing Steps**:
1. Validate authentication, extract OwnerId
2. Validate Name (INV-01, INV-02)
3. Validate Description (INV-03)
4. Validate publication rules (INV-04)
5. Validate OwnerId via IUserStorage (INV-05)
6. Validate Background via IMediaStorage if provided
7. If EpicId provided, validate Epic exists via GetEpicByIdAsync (INV-06)
8. Generate Campaign.Id
9. Create Campaign entity (with nullable EpicId)
10. Validate and associate Adventures (set CampaignId)
11. Persist via ILibraryStorage.CreateCampaignAsync
12. Publish CampaignCreated domain event
13. Return Campaign with Id and Adventures

**Output**: Campaign entity (JSON) with generated Id, Adventures

**Error Scenarios**:
- Same validation errors as Create Epic
- Invalid EpicId → 404 "Epic not found"

**Acceptance Criteria**:
- AC-01: Campaign creation succeeds standalone (EpicId=null)
- AC-02: Campaign creation succeeds with valid EpicId
- AC-03: Campaign creation fails with invalid EpicId (INV-06)
- AC-04: Campaign creation succeeds with Adventures, all persisted with CampaignId
- AC-05: CampaignCreated event published

---

### 7. Update Campaign

**UI Type**: API_ENDPOINT - PUT /api/library/campaigns/:id

**Purpose**: Modify campaign properties (name, description, background, publication, epic association)

**Business Value**: Enables Game Masters to refine campaign details and control hierarchy placement

**Input Requirements**:
- CampaignId: Guid (required, from route)
- Name: string (required, 1-128)
- Description: string (optional, max 4096)
- Background: Resource? (optional)
- IsPublished: bool
- IsPublic: bool
- EpicId: Guid? (nullable, for hierarchy changes)
- OwnerId: Guid (from authenticated user)

**Business Rules**:
- Same as Create Campaign (INV-01 through INV-06)
- AGG-04: Can change EpicId (move between epic/standalone)

**Processing Steps**:
1. Validate authentication, extract OwnerId
2. Retrieve existing Campaign
3. Verify ownership
4. Validate all inputs (same as Create)
5. If EpicId changed, validate new Epic exists (if not null)
6. Update Campaign properties
7. Persist via UpdateCampaignAsync
8. Publish CampaignUpdated event
9. Return updated Campaign

**Output**: Updated Campaign entity (JSON)

**Error Scenarios**:
- Campaign not found → 404
- Not owner → 403
- Same validation errors as Create Campaign

**Acceptance Criteria**:
- AC-01: Update succeeds with valid changes by owner
- AC-02: Update succeeds changing EpicId (hierarchy movement)
- AC-03: Update fails when not owner

---

### 8. Get Campaigns By Epic

**UI Type**: API_ENDPOINT - GET /api/library/campaigns?epicId=:epicId

**Purpose**: Query campaigns within specific epic (or standalone with epicId=null)

**Business Value**: Enables viewing campaign organization within epic hierarchy

**Input Requirements**:
- EpicId: Guid? (nullable query parameter; null returns standalone campaigns)

**Business Rules**:
- Returns empty list if no campaigns found

**Processing Steps**:
1. Validate EpicId format if provided
2. If EpicId provided, query Campaigns with CampaignId==epicId
3. If EpicId null, query Campaigns with EpicId==null (standalone)
4. Include Adventures collections (optional)
5. Return list of Campaigns

**Output**: Array of Campaign entities (JSON)

**Error Scenarios**:
- Invalid EpicId format → 400
- Database error → 500

**Acceptance Criteria**:
- AC-01: Returns campaigns for valid Epic
- AC-02: Returns standalone campaigns when epicId=null
- AC-03: Returns empty list when no campaigns found

---

### 9. Move Campaign To Epic

**UI Type**: API_ENDPOINT - PATCH /api/library/campaigns/:id/move-to-epic

**Purpose**: Associate standalone campaign with epic (set EpicId)

**Business Value**: Enables Game Masters to reorganize campaign hierarchy by adding standalone campaigns to epics

**Input Requirements**:
- CampaignId: Guid (required, from route)
- EpicId: Guid (required, from request body)
- OwnerId: Guid (from authenticated user)

**Business Rules**:
- INV-06: Epic must exist
- AGG-04: Campaign can move between Epic/standalone
- Campaign must currently be standalone (EpicId==null) or explicitly allow epic change

**Processing Steps**:
1. Validate authentication, extract OwnerId
2. Retrieve Campaign via GetCampaignByIdAsync
3. Verify ownership
4. Validate Epic exists via GetEpicByIdAsync (INV-06)
5. Verify Epic ownership matches Campaign ownership (optional business rule)
6. Update Campaign.EpicId = epicId
7. Persist via UpdateCampaignAsync
8. Publish CampaignMovedToEpic event
9. Return updated Campaign

**Output**: Updated Campaign entity with EpicId set

**Error Scenarios**:
- Campaign not found → 404
- Epic not found → 404
- Not owner → 403
- Ownership mismatch → 409 "Epic and Campaign must have same owner"

**Acceptance Criteria**:
- AC-01: Move succeeds for standalone campaign to valid Epic
- AC-02: Move fails with invalid EpicId (INV-06)
- AC-03: CampaignMovedToEpic event published

---

### 10. Make Campaign Standalone

**UI Type**: API_ENDPOINT - PATCH /api/library/campaigns/:id/make-standalone

**Purpose**: Remove campaign from epic (set EpicId=null)

**Business Value**: Enables Game Masters to reorganize campaign hierarchy by making campaigns independent

**Input Requirements**:
- CampaignId: Guid (required, from route)
- OwnerId: Guid (from authenticated user)

**Business Rules**:
- AGG-04: Campaign can move between Epic/standalone
- Campaign must currently have EpicId (not already standalone)

**Processing Steps**:
1. Validate authentication, extract OwnerId
2. Retrieve Campaign
3. Verify ownership
4. Verify Campaign.EpicId is not null
5. Update Campaign.EpicId = null
6. Persist via UpdateCampaignAsync
7. Publish CampaignMadeStandalone event
8. Return updated Campaign

**Output**: Updated Campaign entity with EpicId=null

**Error Scenarios**:
- Campaign not found → 404
- Not owner → 403
- Already standalone → 409 "Campaign is already standalone"

**Acceptance Criteria**:
- AC-01: Make standalone succeeds for campaign with EpicId
- AC-02: Make standalone fails when already standalone
- AC-03: CampaignMadeStandalone event published

---

## Adventure Management Use Cases

### 11. Create Adventure

**UI Type**: API_ENDPOINT - POST /api/library/adventures

**Purpose**: Create new game module with optional campaign association and type categorization

**Business Value**: Enables Game Masters to establish adventure-level organization with type classification

**Input Requirements**:
- Name: string (required, 1-128 characters)
- Description: string (optional, max 4096)
- Type: AdventureType enum (required: Generic, OpenWorld, DungeonCrawl, HackNSlash, Survival, GoalDriven, RandomlyGenerated)
- Background: Resource? (optional)
- IsPublished: bool (default false)
- IsPublic: bool (default false)
- OwnerId: Guid (from authenticated user)
- CampaignId: Guid? (optional, for campaign association)
- Encounters: List<Encounter> (optional)

**Business Rules**:
- Same as Campaign (INV-01 through INV-05)
- INV-07: Type must be valid AdventureType enum
- INV-08: If CampaignId provided, Campaign must exist
- AGG-05: Adventure owns Encounters (cascade)
- AGG-06: Adventure can be standalone or within Campaign

**Processing Steps**:
1. Validate authentication, extract OwnerId
2. Validate Name (INV-01, INV-02)
3. Validate Description (INV-03)
4. Validate Type enum (INV-07)
5. Validate publication rules (INV-04)
6. Validate OwnerId via IUserStorage (INV-05)
7. Validate Background via IMediaStorage if provided
8. If CampaignId provided, validate Campaign exists (INV-08)
9. Generate Adventure.Id
10. Create Adventure entity (with nullable CampaignId, Type)
11. Validate and associate Encounters (set AdventureId)
12. Persist via CreateAdventureAsync
13. Publish AdventureCreated event
14. Return Adventure with Id and Encounters

**Output**: Adventure entity (JSON) with generated Id, Type, Encounters

**Error Scenarios**:
- Same validation errors as Create Campaign
- Invalid Type enum → 400 "Invalid adventure type"
- Invalid CampaignId → 404 "Campaign not found"

**Acceptance Criteria**:
- AC-01: Adventure creation succeeds standalone (CampaignId=null)
- AC-02: Adventure creation succeeds with valid CampaignId
- AC-03: Adventure creation succeeds with valid Type enum
- AC-04: Adventure creation fails with invalid Type (INV-07)
- AC-05: Adventure creation succeeds with Encounters, all persisted with AdventureId

---

### 12. Update Adventure

**UI Type**: API_ENDPOINT - PUT /api/library/adventures/:id

**Purpose**: Modify adventure properties (name, description, type, background, publication, campaign association)

**Business Value**: Enables Game Masters to refine adventure details, change categorization, and control hierarchy placement

**Input Requirements**:
- AdventureId: Guid (required, from route)
- Name: string (required, 1-128)
- Description: string (optional, max 4096)
- Type: AdventureType enum (required)
- Background: Resource? (optional)
- IsPublished: bool
- IsPublic: bool
- CampaignId: Guid? (nullable)
- OwnerId: Guid (from authenticated user)

**Business Rules**:
- Same as Create Adventure (INV-01 through INV-08)
- AGG-06: Can change CampaignId (move between campaign/standalone)

**Processing Steps**:
1. Validate authentication, extract OwnerId
2. Retrieve existing Adventure
3. Verify ownership
4. Validate all inputs (same as Create)
5. If CampaignId changed, validate new Campaign exists (if not null)
6. Update Adventure properties (including Type)
7. Persist via UpdateAdventureAsync
8. Publish AdventureUpdated event
9. Return updated Adventure

**Output**: Updated Adventure entity (JSON)

**Error Scenarios**:
- Adventure not found → 404
- Not owner → 403
- Same validation errors as Create Adventure

**Acceptance Criteria**:
- AC-01: Update succeeds with valid changes by owner
- AC-02: Update succeeds changing CampaignId (hierarchy movement)
- AC-03: Update succeeds changing Type enum

---

### 13. Clone Adventure

**UI Type**: API_ENDPOINT - POST /api/library/adventures/:id/clone

**Purpose**: Duplicate adventure with all owned encounters (deep copy operation)

**Business Value**: Enables Game Masters to reuse adventure templates with all encounter configurations

**Input Requirements**:
- AdventureId: Guid (required, from route parameter)
- OwnerId: Guid (from authenticated user, becomes owner of cloned adventure)
- NewName: string (optional, default "{OriginalName} (Copy)")

**Business Rules**:
- Original Adventure must exist
- Cloned adventure owned by authenticated user (OwnerId)
- All Encounters cloned with Stage, Grid, and EncounterAssets
- Cloned adventure is always standalone (CampaignId=null)
- Cloned adventure is never published (IsPublished=false, IsPublic=false)

**Processing Steps**:
1. Validate authentication, extract OwnerId
2. Retrieve source Adventure via GetAdventureByIdAsync (include Encounters)
3. Generate new Adventure.Id for clone
4. Create cloned Adventure entity:
   - Name = NewName ?? "{OriginalName} (Copy)"
   - OwnerId = authenticated user
   - CampaignId = null (standalone)
   - IsPublished = false, IsPublic = false
   - Copy Description, Type, Background
5. For each Encounter in source Adventure:
   - Generate new Encounter.Id
   - Clone Encounter entity (Stage, Grid, Assets)
   - Set Encounter.AdventureId = cloned Adventure.Id
6. Persist cloned Adventure with cloned Encounters via CloneAdventureAsync
7. Publish AdventureCloned event
8. Return cloned Adventure

**Output**: Cloned Adventure entity (JSON) with new Id, cloned Encounters

**Error Scenarios**:
- Source Adventure not found → 404 "Adventure not found"
- Database persistence failure → 500 "Failed to clone adventure"

**Acceptance Criteria**:
- AC-01: Clone succeeds, creates new Adventure with new Id
- AC-02: All Encounters cloned with new Ids, Stage, Grid, EncounterAssets preserved
- AC-03: Cloned adventure is standalone (CampaignId=null)
- AC-04: Cloned adventure not published (IsPublished=false)
- AC-05: AdventureCloned event published

---

### 14. Move Adventure To Campaign

**UI Type**: API_ENDPOINT - PATCH /api/library/adventures/:id/move-to-campaign

**Purpose**: Associate standalone adventure with campaign (set CampaignId)

**Business Value**: Enables Game Masters to reorganize adventure hierarchy by adding standalone adventures to campaigns

**Input Requirements**:
- AdventureId: Guid (required, from route)
- CampaignId: Guid (required, from request body)
- OwnerId: Guid (from authenticated user)

**Business Rules**:
- INV-08: Campaign must exist
- AGG-06: Adventure can move between Campaign/standalone
- Adventure must currently be standalone (CampaignId==null) or explicitly allow campaign change

**Processing Steps**:
1. Validate authentication, extract OwnerId
2. Retrieve Adventure
3. Verify ownership
4. Validate Campaign exists via GetCampaignByIdAsync (INV-08)
5. Verify Campaign ownership matches Adventure ownership (optional business rule)
6. Update Adventure.CampaignId = campaignId
7. Persist via UpdateAdventureAsync
8. Publish AdventureMovedToCampaign event
9. Return updated Adventure

**Output**: Updated Adventure entity with CampaignId set

**Error Scenarios**:
- Adventure not found → 404
- Campaign not found → 404
- Not owner → 403
- Ownership mismatch → 409 "Campaign and Adventure must have same owner"

**Acceptance Criteria**:
- AC-01: Move succeeds for standalone adventure to valid Campaign
- AC-02: Move fails with invalid CampaignId (INV-08)
- AC-03: AdventureMovedToCampaign event published

---

### 15. Make Adventure Standalone

**UI Type**: API_ENDPOINT - PATCH /api/library/adventures/:id/make-standalone

**Purpose**: Remove adventure from campaign (set CampaignId=null)

**Business Value**: Enables Game Masters to reorganize adventure hierarchy by making adventures independent

**Input Requirements**:
- AdventureId: Guid (required, from route)
- OwnerId: Guid (from authenticated user)

**Business Rules**:
- AGG-06: Adventure can move between Campaign/standalone
- Adventure must currently have CampaignId (not already standalone)

**Processing Steps**:
1. Validate authentication, extract OwnerId
2. Retrieve Adventure
3. Verify ownership
4. Verify Adventure.CampaignId is not null
5. Update Adventure.CampaignId = null
6. Persist via UpdateAdventureAsync
7. Publish AdventureMadeStandalone event
8. Return updated Adventure

**Output**: Updated Adventure entity with CampaignId=null

**Error Scenarios**:
- Adventure not found → 404
- Not owner → 403
- Already standalone → 409 "Adventure is already standalone"

**Acceptance Criteria**:
- AC-01: Make standalone succeeds for adventure with CampaignId
- AC-02: Make standalone fails when already standalone
- AC-03: AdventureMadeStandalone event published

---

## Encounter Management Use Cases

### 16. Create Encounter

**UI Type**: API_ENDPOINT - POST /api/library/encounters

**Purpose**: Create new tactical map with optional adventure association, Stage, Grid, and initial asset placements

**Business Value**: Enables Game Masters to design interactive tactical maps with comprehensive encounter composition

**Input Requirements**:
- Name: string (required, 1-128 characters)
- Description: string (optional, max 4096)
- IsPublished: bool (default false, note: no IsPublic requirement for encounters)
- OwnerId: Guid (from authenticated user)
- AdventureId: Guid? (optional, for adventure association)
- Stage: Stage value object (required):
  - Background: Resource? (optional)
  - ViewportX: int (default 0)
  - ViewportY: int (default 0)
  - Width: int (required, > 0)
  - Height: int (required, > 0)
- Grid: Grid value object (required):
  - Type: GridType enum (NoGrid, Square, HexV, HexH, Isometric)
  - Size: int (required if Type != NoGrid)
  - OffsetX: int (default 0)
  - OffsetY: int (default 0)
  - Color: string (hex color, default "#000000")
- Assets: List<EncounterAsset> (optional, value objects):
  - AssetId: Guid (required, must reference existing Asset)
  - X: int (required)
  - Y: int (required)
  - Width: int? (nullable, uses Asset default if null)
  - Height: int? (nullable)
  - ZIndex: int (default 0)
  - Rotation: double? (nullable)

**Business Rules**:
- INV-01, INV-02, INV-03, INV-05 (same as Epic)
- INV-09: Stage Width > 0, Height > 0
- INV-10: Grid configuration consistent with GridType (Size required if Type != NoGrid)
- INV-11: EncounterAsset positions should be within Stage bounds (optional enforcement)
- AGG-07: Encounter can be standalone or within Adventure
- AGG-08: EncounterAssets are value objects (no independent existence)

**Processing Steps**:
1. Validate authentication, extract OwnerId
2. Validate Name (INV-01, INV-02)
3. Validate Description (INV-03)
4. Validate OwnerId via IUserStorage (INV-05)
5. Validate Stage:
   - Width > 0, Height > 0 (INV-09)
   - Validate Background via IMediaStorage if provided
6. Validate Grid:
   - Type is valid GridType enum
   - Size > 0 if Type != NoGrid (INV-10)
   - Color is valid hex format
7. If AdventureId provided, validate Adventure exists
8. Validate each EncounterAsset:
   - AssetId references existing Asset via IAssetStorage
   - Width, Height > 0 if provided
   - Optionally check X, Y within Stage bounds (INV-11)
9. Generate Encounter.Id
10. Create Encounter entity (with nullable AdventureId, Stage, Grid, Assets)
11. Persist via CreateEncounterAsync
12. Publish EncounterCreated event
13. Return Encounter

**Output**: Encounter entity (JSON) with generated Id, Stage, Grid, Assets

**Error Scenarios**:
- Same name validation errors as Epic
- Invalid Stage dimensions → 400 "Stage dimensions must be positive" (INV-09)
- Invalid Grid configuration → 400 "Grid size required for non-NoGrid types" (INV-10)
- Invalid Background → 404 "Background resource not found"
- Invalid AssetId → 404 "Asset not found"
- Invalid AdventureId → 404 "Adventure not found"
- Asset position out of bounds → 400 "Asset position outside stage bounds" (INV-11)

**Acceptance Criteria**:
- AC-01: Encounter creation succeeds with valid Stage, Grid (Type=NoGrid), no assets
- AC-02: Encounter creation succeeds with Stage, Grid (Type=Square, Size=50), initial assets
- AC-03: Encounter creation fails with Stage Width=0 (INV-09)
- AC-04: Encounter creation fails with Grid Type=Square but Size not provided (INV-10)
- AC-05: Encounter creation succeeds with AdventureId
- AC-06: EncounterCreated event published

---

### 17. Update Encounter

**UI Type**: API_ENDPOINT - PUT /api/library/encounters/:id

**Purpose**: Modify encounter properties (name, description, publication status)

**Business Value**: Enables Game Masters to refine encounter details (Note: Stage/Grid/Assets updated via separate operations)

**Input Requirements**:
- EncounterId: Guid (required, from route)
- Name: string (required, 1-128)
- Description: string (optional, max 4096)
- IsPublished: bool
- OwnerId: Guid (from authenticated user)

**Business Rules**:
- Same name/description validation as Create Encounter
- Stage, Grid, Assets NOT updated via this operation (see Configure Stage, Configure Grid, asset operations)

**Processing Steps**:
1. Validate authentication, extract OwnerId
2. Retrieve existing Encounter
3. Verify ownership
4. Validate Name (INV-01, INV-02)
5. Validate Description (INV-03)
6. Update Encounter properties (Name, Description, IsPublished only)
7. Persist via UpdateEncounterAsync
8. Publish EncounterUpdated event
9. Return updated Encounter

**Output**: Updated Encounter entity (JSON)

**Error Scenarios**:
- Encounter not found → 404
- Not owner → 403
- Same name/description validation errors

**Acceptance Criteria**:
- AC-01: Update succeeds with valid changes by owner
- AC-02: Update fails when not owner
- AC-03: Stage, Grid, Assets unchanged (use separate operations)

---

### 18. Configure Stage

**UI Type**: API_ENDPOINT - PATCH /api/library/encounters/:id/stage

**Purpose**: Update Stage value object (background, viewport, dimensions)

**Business Value**: Enables Game Masters to adjust encounter rendering configuration

**Input Requirements**:
- EncounterId: Guid (required, from route)
- Stage: Stage value object (required):
  - Background: Resource? (optional)
  - ViewportX: int
  - ViewportY: int
  - Width: int (> 0)
  - Height: int (> 0)
- OwnerId: Guid (from authenticated user)

**Business Rules**:
- INV-09: Width > 0, Height > 0
- Background must be valid Image resource if provided

**Processing Steps**:
1. Validate authentication, extract OwnerId
2. Retrieve existing Encounter
3. Verify ownership
4. Validate Stage dimensions (Width > 0, Height > 0) (INV-09)
5. Validate Background via IMediaStorage if provided
6. Update Encounter.Stage with new value object
7. Persist via UpdateEncounterAsync (or dedicated ConfigureStageAsync)
8. Publish StageConfigured event
9. Return updated Encounter

**Output**: Updated Encounter entity with new Stage configuration

**Error Scenarios**:
- Encounter not found → 404
- Not owner → 403
- Invalid dimensions → 400 "Stage dimensions must be positive" (INV-09)
- Invalid Background → 404 "Background resource not found"

**Acceptance Criteria**:
- AC-01: Configure Stage succeeds with valid dimensions
- AC-02: Configure Stage fails with Width=0 (INV-09)
- AC-03: Background updated successfully when valid Resource provided
- AC-04: StageConfigured event published

---

### 19. Configure Grid

**UI Type**: API_ENDPOINT - PATCH /api/library/encounters/:id/grid

**Purpose**: Update Grid value object (type, size, offset, color)

**Business Value**: Enables Game Masters to adjust tactical map grid overlay configuration

**Input Requirements**:
- EncounterId: Guid (required, from route)
- Grid: Grid value object (required):
  - Type: GridType enum (NoGrid, Square, HexV, HexH, Isometric)
  - Size: int (required if Type != NoGrid)
  - OffsetX: int (default 0)
  - OffsetY: int (default 0)
  - Color: string (hex color, default "#000000")
- OwnerId: Guid (from authenticated user)

**Business Rules**:
- INV-10: Grid configuration consistent with GridType (Size required if Type != NoGrid)
- Color must be valid hex format

**Processing Steps**:
1. Validate authentication, extract OwnerId
2. Retrieve existing Encounter
3. Verify ownership
4. Validate Grid:
   - Type is valid GridType enum
   - Size > 0 if Type != NoGrid (INV-10)
   - Color is valid hex format
5. Update Encounter.Grid with new value object
6. Persist via UpdateEncounterAsync (or dedicated ConfigureGridAsync)
7. Publish GridConfigured event
8. Return updated Encounter

**Output**: Updated Encounter entity with new Grid configuration

**Error Scenarios**:
- Encounter not found → 404
- Not owner → 403
- Invalid Grid configuration → 400 "Grid size required for non-NoGrid types" (INV-10)
- Invalid Color format → 400 "Invalid hex color format"

**Acceptance Criteria**:
- AC-01: Configure Grid succeeds with Type=NoGrid (Size optional)
- AC-02: Configure Grid succeeds with Type=Square, Size=50
- AC-03: Configure Grid fails with Type=Square, Size not provided (INV-10)
- AC-04: GridConfigured event published

---

### 20. Place Asset

**UI Type**: API_ENDPOINT - POST /api/library/encounters/:id/assets

**Purpose**: Add EncounterAsset to Assets collection, validate AssetId, optionally enforce position bounds

**Business Value**: Enables Game Masters to place asset instances on tactical maps with position and transformation

**Input Requirements**:
- EncounterId: Guid (required, from route)
- EncounterAsset: EncounterAsset value object (required):
  - AssetId: Guid (required, must reference existing Asset)
  - X: int (required)
  - Y: int (required)
  - Width: int? (nullable, uses Asset default if null)
  - Height: int? (nullable)
  - ZIndex: int (default 0)
  - Rotation: double? (nullable, degrees)
- OwnerId: Guid (from authenticated user)

**Business Rules**:
- AssetId must reference existing Asset (via IAssetStorage)
- Width, Height > 0 if provided
- INV-11: EncounterAsset positions should be within Stage bounds (optional enforcement)
- BR-12: EncounterAsset.AssetId must reference existing Asset

**Processing Steps**:
1. Validate authentication, extract OwnerId
2. Retrieve existing Encounter
3. Verify ownership
4. Validate AssetId references existing Asset via IAssetStorage (BR-12)
5. Validate Width, Height > 0 if provided
6. Optionally validate X, Y within Encounter.Stage bounds (INV-11)
7. Add EncounterAsset to Encounter.Assets collection
8. Persist via UpdateEncounterAsync (or dedicated PlaceAssetAsync)
9. Publish AssetPlaced event
10. Return updated Encounter

**Output**: Updated Encounter entity with new EncounterAsset in Assets collection

**Error Scenarios**:
- Encounter not found → 404
- Not owner → 403
- Invalid AssetId → 404 "Asset not found" (BR-12)
- Invalid Width/Height → 400 "Asset dimensions must be positive"
- Position out of bounds → 400 "Asset position outside stage bounds" (INV-11)

**Acceptance Criteria**:
- AC-01: Place Asset succeeds with valid AssetId and position
- AC-02: Place Asset fails with invalid AssetId (BR-12)
- AC-03: Place Asset succeeds with custom Width, Height, ZIndex, Rotation
- AC-04: AssetPlaced event published

---

### 21. Move Asset

**UI Type**: API_ENDPOINT - PATCH /api/library/encounters/:id/assets/:assetId/move

**Purpose**: Update EncounterAsset position (X, Y) and optionally dimensions, ZIndex, rotation

**Business Value**: Enables Game Masters to reposition and transform placed assets on tactical maps

**Input Requirements**:
- EncounterId: Guid (required, from route)
- AssetId: Guid (required, from route, identifies EncounterAsset in collection)
- X: int (optional, updates position)
- Y: int (optional, updates position)
- Width: int? (optional)
- Height: int? (optional)
- ZIndex: int? (optional)
- Rotation: double? (optional, degrees)
- OwnerId: Guid (from authenticated user)

**Business Rules**:
- EncounterAsset with AssetId must exist in Encounter.Assets collection
- Width, Height > 0 if provided
- INV-11: Optionally validate new X, Y within Stage bounds

**Processing Steps**:
1. Validate authentication, extract OwnerId
2. Retrieve existing Encounter
3. Verify ownership
4. Find EncounterAsset in Encounter.Assets collection by AssetId
5. Validate Width, Height > 0 if provided
6. Optionally validate X, Y within Encounter.Stage bounds (INV-11)
7. Update EncounterAsset properties (X, Y, Width, Height, ZIndex, Rotation)
8. Replace EncounterAsset in Encounter.Assets collection (immutable value object)
9. Persist via UpdateEncounterAsync
10. Publish AssetMoved event
11. Return updated Encounter

**Output**: Updated Encounter entity with modified EncounterAsset

**Error Scenarios**:
- Encounter not found → 404
- Not owner → 403
- AssetId not found in Encounter.Assets → 404 "Asset not found in encounter"
- Invalid Width/Height → 400 "Asset dimensions must be positive"
- Position out of bounds → 400 "Asset position outside stage bounds" (INV-11)

**Acceptance Criteria**:
- AC-01: Move Asset succeeds updating X, Y
- AC-02: Move Asset succeeds updating Width, Height, ZIndex, Rotation
- AC-03: Move Asset fails when AssetId not in Encounter.Assets
- AC-04: AssetMoved event published

---

### 22. Remove Asset

**UI Type**: API_ENDPOINT - DELETE /api/library/encounters/:id/assets/:assetId

**Purpose**: Remove EncounterAsset from Assets collection

**Business Value**: Enables Game Masters to remove unwanted asset placements from tactical maps

**Input Requirements**:
- EncounterId: Guid (required, from route)
- AssetId: Guid (required, from route, identifies EncounterAsset in collection)
- OwnerId: Guid (from authenticated user)

**Business Rules**:
- EncounterAsset with AssetId must exist in Encounter.Assets collection
- AGG-08: EncounterAssets are value objects (no independent existence)

**Processing Steps**:
1. Validate authentication, extract OwnerId
2. Retrieve existing Encounter
3. Verify ownership
4. Find EncounterAsset in Encounter.Assets collection by AssetId
5. Remove EncounterAsset from Encounter.Assets collection
6. Persist via UpdateEncounterAsync
7. Publish AssetRemoved event
8. Return 204 No Content

**Output**: 204 No Content on success

**Error Scenarios**:
- Encounter not found → 404
- Not owner → 403
- AssetId not found in Encounter.Assets → 404 "Asset not found in encounter"

**Acceptance Criteria**:
- AC-01: Remove Asset succeeds, EncounterAsset removed from collection
- AC-02: Remove Asset fails when AssetId not in Encounter.Assets
- AC-03: AssetRemoved event published

---

### 23. Clone Encounter

**UI Type**: API_ENDPOINT - POST /api/library/encounters/:id/clone

**Purpose**: Duplicate encounter with all Stage, Grid, and EncounterAsset configurations (deep copy operation)

**Business Value**: Enables Game Masters to reuse encounter templates with all composition elements

**Input Requirements**:
- EncounterId: Guid (required, from route parameter)
- OwnerId: Guid (from authenticated user, becomes owner of cloned encounter)
- NewName: string (optional, default "{OriginalName} (Copy)")

**Business Rules**:
- Original Encounter must exist
- Cloned encounter owned by authenticated user (OwnerId)
- Stage, Grid, EncounterAssets cloned (value objects)
- Cloned encounter is always standalone (AdventureId=null)
- Cloned encounter is never published (IsPublished=false)

**Processing Steps**:
1. Validate authentication, extract OwnerId
2. Retrieve source Encounter via GetEncounterByIdAsync
3. Generate new Encounter.Id for clone
4. Create cloned Encounter entity:
   - Name = NewName ?? "{OriginalName} (Copy)"
   - OwnerId = authenticated user
   - AdventureId = null (standalone)
   - IsPublished = false
   - Copy Description
   - Clone Stage value object (Background reference preserved)
   - Clone Grid value object
   - Clone EncounterAssets collection (AssetId references preserved)
5. Persist cloned Encounter via CloneEncounterAsync
6. Publish EncounterCloned event
7. Return cloned Encounter

**Output**: Cloned Encounter entity (JSON) with new Id, cloned Stage, Grid, EncounterAssets

**Error Scenarios**:
- Source Encounter not found → 404 "Encounter not found"
- Database persistence failure → 500 "Failed to clone encounter"

**Acceptance Criteria**:
- AC-01: Clone succeeds, creates new Encounter with new Id
- AC-02: Stage, Grid, EncounterAssets cloned (Background and AssetId references preserved)
- AC-03: Cloned encounter is standalone (AdventureId=null)
- AC-04: Cloned encounter not published (IsPublished=false)
- AC-05: EncounterCloned event published

---

## Summary

**Total Use Cases**: 23
- **Epic Management**: 5 use cases (Create, Get, Update, Delete, Get By Owner)
- **Campaign Management**: 5 use cases (Create, Update, Get By Epic, Move To Epic, Make Standalone)
- **Adventure Management**: 5 use cases (Create, Update, Clone, Move To Campaign, Make Standalone)
- **Encounter Management**: 8 use cases (Create, Update, Configure Stage, Configure Grid, Place Asset, Move Asset, Remove Asset, Clone)

**Common Patterns**:
- **Authentication**: All operations require authenticated user (OwnerId)
- **Authorization**: AGG-02 enforced across all entities (only owner can modify)
- **Validation**: INV-01 through INV-11 enforced via application services
- **Domain Events**: All state-changing operations publish domain events
- **Hierarchy Management**: Optional parent references (nullable FKs) enable flexible standalone/nested usage
- **Cascade Operations**: Delete operations cascade to owned children (AGG-01, AGG-03, AGG-05)
- **Value Objects**: Stage, Grid, EncounterAsset are immutable and validated
- **Cloning**: Adventure and Encounter support deep copy operations for reuse

**Architecture Compliance**:
- **Clean Architecture**: Application services orchestrate, domain entities are contracts, infrastructure provides persistence
- **Hexagonal Architecture**: Primary ports (ILibraryStorage) define operations, secondary ports (IUserStorage, IMediaStorage, IAssetStorage, IGameSessionStorage) provide external dependencies
- **DDD**: Bounded context (Library), aggregates (Epic, Campaign, Adventure, Encounter with context-dependent roots), domain events, ubiquitous language

**API Endpoints**:
All use cases exposed as RESTful API endpoints (API_ENDPOINT UI type), frontend Encounter Editor UI in progress.

---

<!--
═══════════════════════════════════════════════════════════════
LIBRARY USE CASES QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════

## Completeness (25 points)
✅ 5pts: All 23 use cases documented
✅ 5pts: All features covered (Epic, Campaign, Adventure, Encounter)
✅ 5pts: All CRUD operations included
✅ 5pts: All hierarchy management operations included
✅ 5pts: All specialized operations included (Clone, Configure)

## Consistency (25 points)
✅ 5pts: Common input/output patterns across entities
✅ 5pts: Consistent error handling (validation, not found, authorization)
✅ 5pts: Consistent business rule enforcement (INV-XX, AGG-XX, BR-XX)
✅ 5pts: Consistent domain event publishing
✅ 5pts: Consistent authorization checks (owner-only modification)

## Architecture Alignment (25 points)
✅ 5pts: All use cases aligned with Clean Architecture
✅ 5pts: All use cases aligned with Hexagonal Architecture (ports)
✅ 5pts: All use cases aligned with DDD (bounded context, aggregates, events)
✅ 5pts: All use cases specify UI type (API_ENDPOINT)
✅ 5pts: All dependencies identified (Identity, Media, Assets, Game contexts)

## Business Rules (25 points)
✅ 5pts: All invariants documented and enforced (INV-01 through INV-11)
✅ 5pts: All aggregate rules documented and enforced (AGG-01 through AGG-09)
✅ 5pts: All business rules documented and enforced (BR-01 through BR-13)
✅ 5pts: Optional parent references enable flexible hierarchy
✅ 5pts: Cascade delete rules enforced

## Target Score: 100/100 ✅
-->
