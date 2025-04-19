# VTT Tools Project Roadmap

This roadmap outlines the development phases for the Virtual Table Top (VTT) tools project, designed to facilitate online tabletop role-playing games. Each phase culminates in a Minimum Viable Product (MVP) that provides incremental value to users.

## Phase 1: Core Infrastructure and Meeting Management

**MVP Goal**: Allow users to create and join game meetings with basic adventure management.

### Tasks:
- [x] Set up user authentication and authorization (register, sign-in, profile management)
- [x] Implement basic meeting creation and management
- [x] Refactor Session concept to Meeting concept according to PROJECT_DEFINITION.md
- [x] Create basic dashboard for viewing active and past meetings
- [x] Design and implement basic user roles (Game Master, Player)
- [x] Create basic Adventure and Episode templates management

## Phase 2: Basic Game Content Management

**MVP Goal**: Enable Game Masters to create and manage game content hierarchies.

### Tasks:
- [ ] Add Unit Tests to the existing code
  - [x] Add Unit Test to Domain project.
  - [x] Add Unit Test to Common project.
  - [ ] Add Unit Test to Data project.
  - [ ] Add Unit Test to GameService project.
  - [ ] Add Unit Test to WebApp project.
- [ ] Adventure Templates CRUD API & UI
  - [ ] List, create, rename, delete Adventures
  - [ ] Set and update Visibility (Hidden, Private, Public)
  - [ ] Inline rename/edit & clone in UI (deep clone of templates)
- [ ] Episode Templates CRUD API & UI (nested under Adventures)
  - [ ] List, create, rename, delete Episodes for a given Adventure
  - [ ] Basic in-place rename/edit; full Canvas editor in Phase 3
  - [ ] Set Visibility and transfer ownership
  - [x] Endpoint to clone an Episode template (POST /api/episodes/{id}/clone)
- [ ] Asset Templates CRUD API & UI
  - [ ] List, rename, delete Assets
  - [ ] Support file uploads (local FS in Dev, Azure Blob in Prod) via POST /api/assets/{id}/upload
  - [ ] Set Visibility (ownership transfer deferred)
- [ ] Template Cloning Endpoints
  - [ ] POST /api/adventures/{id}/clone to deep‑clone an Adventure template (including nested Episodes, Stage data, and EpisodeAssets)
  - [ ] POST /api/episodes/{id}/clone to duplicate an Episode template
- [ ] UI: "Content" menu
  - [ ] "Adventures" page (manages Adventures and nested Episodes)
  - [ ] "Assets" page (manages Assets uploads and metadata)

## Phase 3: Interactive Episodes and Tokens

**MVP Goal**: Enable Game Masters to create episodes and place tokens for basic visual representation.

### Tasks:
- [ ] Implement the basic episode editor with Canvas support
- [ ] Implement Episode stage management
- [ ] Create episode storage and retrieval system
- [ ] Implement episode as specialized media with grid support
- [ ] Create episode editor with asset placement
- [ ] Add asset placement and movement functionality
- [ ] Implement fog of war/visibility systems
- [ ] Add measuring tools for distances

## Phase 4: Chat and Dice Rolling System

**MVP Goal**: Implement a comprehensive chat system with specialized message types and dice rolling.

### Tasks:
- [ ] Create real-time chat infrastructure with SignalR
- [ ] Implement normal message support
- [ ] Add whisper functionality for private messages
- [ ] Create simple dice rolling engine and message type
- [ ] Implement action result message formatting
- [ ] Add language-specific messages with conditional display
- [ ] Support for image/GIF sharing in chat
- [ ] Implement sound effect triggers from chat
- [ ] Add slash command framework
- [ ] Create stat block/rule display message type

## Phase 5: Game Mechanics and Advanced Features

**MVP Goal**: Enhance the platform with gameplay mechanics and additional features.

### Tasks:
- [ ] Add character sheet basic integration
- [ ] Implement initiative tracker
- [ ] Create simple combat tracker
- [ ] Add support for dynamic lighting and shadows
- [ ] Implement Sound-Track management for Episodes
- [ ] Build dice roll history and favorite rolls system
- [ ] Create handout/note sharing improvements
- [ ] Implement macro system for common actions
- [ ] Add automation tools for common GM tasks

## Phase 6: Implement Meeting Support and more Advenced Features

**MVP Goal**: Expand meeting functionality and game hierarchy.

### Tasks:
- [ ] Implement basic player assignment to playable tokens
- [ ] Add persistent state for game instances across multiple meetings
- [ ] Create basic Notes system with visibility levels
- [ ] Set up meeting invitation system with RSVP functionality
- [ ] Implement calendar integration for scheduling recurring meetings
- [ ] Implement Epic creation and management
- [ ] Implement Campaign creation and management
- [ ] Update the dashboard to viewing and manage the Epic and Campaing templates

## Phase 7: Platform Growth and Optimization

**MVP Goal**: Scale the platform with community features and optimizations.

### Tasks:
- [ ] Create marketplace for community-created templates
- [ ] Add template sharing and importing
- [ ] Implement API for extensibility and integration with other tools
- [ ] Performance optimization for large episodes and complex meetings
- [ ] Add support for exporting/importing game data
- [ ] Implement advanced search and filtering for content
- [ ] Create analytics for game masters to review meeting activity

## Technical Considerations

- **Backend**: .NET 9 with the latest C# features
- **Frontend**: Blazor for interactive UI components
- **Real-time Communication**: SignalR for chat and synchronization
- **Storage**: Mix of database storage and blob storage for media assets
- **Authentication**: ASP.NET Core Identity (already implemented)
- **Game State**: Separate template and instance data models

## Ongoing Evaluation

At the completion of each phase, we will:
1. Conduct user testing with real TTRPG groups
2. Gather feedback on implemented features
3. Refine existing functionality based on feedback
4. Adjust upcoming phases as needed
5. Ensure the application remains performant and reliable

Note: This roadmap is a living document and will be updated as development progresses and requirements evolve.