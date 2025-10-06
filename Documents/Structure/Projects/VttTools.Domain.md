# VttTools.Domain

**Type**: ClassLibrary
**Path**: Source/Domain/VttTools.Domain.csproj
**Framework**: .NET 9.0
**Layer**: Domain (Core Business Logic)

---

## Purpose

Core domain layer containing all business entities, value objects, enums, and business rules. Implements pure domain-driven design with no external dependencies except base application services.

---

## Features Implemented

- **Authentication & User Management**: User/Role entities, authentication domain rules
- **Media Resource Management**: Resource entity with ResourceMetadata and ResourceFile value objects
- **Game Content Hierarchy**: Epic, Campaign, Adventure, Scene entities with hierarchy business logic
- **Asset Management**: Asset entity with Display and Frame value objects
- **Interactive Scene Editor**: Scene entity with Stage, Grid, SceneAsset value objects
- **Game Session Management**: GameSession and Schedule entities with Participant, Message, Event value objects

---

## Key Components

### Entities (15 total)
- **User**: ASP.NET Core Identity user entity with custom properties (Name, DisplayName)
- **Role**: ASP.NET Core Identity role entity with RoleName enum (Guest=0, User=1, Administrator=99)
- **UserRole, UserClaim, RoleClaim, UserLogin, UserToken**: Identity framework entities
- **Resource**: Media resource entity (images, animations, videos) with blob storage integration
- **Asset**: Reusable game asset entity (15 AssetType variations)
- **Epic**: Multi-campaign story arc aggregate root
- **Campaign**: Multi-adventure storyline (owned entity within Epic)
- **Adventure**: Reusable game module aggregate root
- **Scene**: Interactive tactical map aggregate root
- **GameSession**: Active game meeting entity
- **Schedule**: Meeting schedule entity with recurrence patterns

### Value Objects (11 total)
- **Display**: Asset display configuration (references Resource)
- **Frame**: Asset border styling (Square/Circle shapes with colors)
- **Stage**: Scene canvas configuration (background, viewport, dimensions)
- **Grid**: Scene tactical overlay (type, offset, size, color)
- **SceneAsset**: Token placement on scene (position, dimensions, z-index)
- **Participant**: Game session participant (userId, playerType role)
- **GameSessionMessage**: Chat message (type, sender, content)
- **GameSessionEvent**: Game event (type, timestamp, data)
- **Recurrence**: Schedule recurrence pattern (frequency, until date)
- **ResourceMetadata**: Media file metadata (dimensions, file size, content type)
- **ResourceFile**: Media file paths (file name, storage paths)

### Enums (10 total)
- **AssetType**: 15 variations (Placeholder, Creature, Character, NPC, Object, Wall, Door, Window, Overlay, Elevation, Effect, Sound, Music, Vehicle, Token)
- **PlayerType**: 4 roles (Guest=0, Player=1, Assistant=2, Master=3)
- **GridType**: 5 variations (None, Square, HexVertical, HexHorizontal, Isometric)
- **GameSessionStatus**: 6 lifecycle states (Draft, Scheduled, InProgress, Paused, Finished, Cancelled)
- **Frequency**: 5 patterns (Once, Daily, Weekly, Monthly, Yearly)
- **RoleName**: 3 roles (Guest=0, User=1, Administrator=99)
- **ResourceType**: 4 types (Undefined, Image, Animation, Video)
- **AdventureType**: 7 categories
- **FrameShape**: 2 shapes (Square, Circle)
- **GridShape**: 5 shapes (matching GridType)

### Storage Interfaces
- **IAssetStorage**: Asset persistence operations
- **IMediaStorage**: Media resource storage operations
- **ISceneStorage**: Scene persistence operations
- **IAdventureStorage**: Adventure and campaign persistence operations
- **IGameSessionStorage**: Game session persistence operations

---

## Dependencies

**Internal**:
- VttTools.Core (application base services)

**External**:
- DotNetToolbox.Core 9.0.1 (utility library)
- Microsoft.AspNetCore.Identity.EntityFrameworkCore 9.0.8 (Identity entities)

**Used By**:
- VttTools.Common
- VttTools.Data
- VttTools.Media
- VttTools.Assets
- VttTools.Library
- VttTools.Game
- VttTools.WebApp.Common
- VttTools.WebApp.WebAssembly
- VttTools.WebApp
- VttTools.Auth

---

## Business Rules

### Identity Domain
- Role-based authorization (Guest=0, User=1, Administrator=99)
- Password requirements enforced by Identity framework
- Two-factor authentication support

### Assets Domain
- Asset type validation (15 types)
- Publishing rules: IsPublished requires IsPublic
- Ownership and visibility controls

### Media Domain
- Resource type validation (Image, Animation, Video)
- File path management with blob storage conventions
- Tag-based organization for discovery

### Library Domain
- Hierarchical relationships: Epic > Campaign > Adventure > Scene
- Ownership and visibility rules
- Adventure type categorization (7 types)
- Grid configuration validation

### Game Domain
- Session status lifecycle: Draft → Scheduled → InProgress → Paused → Finished/Cancelled
- Player type roles: Guest < Player < Assistant < Master
- Recurrence patterns: Once, Daily, Weekly, Monthly, Yearly

---

## Architecture Notes

- **Pure Domain Layer**: No dependencies on infrastructure concerns (EF Core, Azure Storage, etc.)
- **DDD Aggregate Roots**: Epic, Adventure, Scene, GameSession, Schedule
- **Owned Entities**: Campaign (within Epic)
- **Value Object Pattern**: Immutable objects for domain concepts (Display, Frame, Stage, Grid, etc.)
- **Storage Interface Contracts**: Define persistence operations without implementation details
- **Shared Kernel**: Common domain primitives used across all bounded contexts
