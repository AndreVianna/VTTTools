# VTT Tools Project Roadmap

This roadmap outlines the development phases for the Virtual Table Top (VTT) tools project, designed to facilitate online tabletop role-playing games. Each phase culminates in a Minimum Viable Product (MVP) that provides incremental value to users.

## Phase 1: Core Infrastructure and Session Management

**MVP Goal**: Allow users to create and join game sessions with basic user management.

### Tasks:
- [x] Set up user authentication and authorization (register, sign-in, profile management)
- [x] Implement game session creation and management
- [ ] Create basic dashboard for viewing active and past sessions
- [x] Design and implement basic user roles (Game Master, Player)
- [ ] Set up session invitation system

## Phase 2: Interactive Maps and Tokens

**MVP Goal**: Enable Game Masters to create maps and place tokens for basic visual representation.

### Tasks:
- [ ] Implement map storage and retrieval system
- [ ] Create map editor with grid support
- [ ] Add token placement and movement functionality
- [ ] Implement fog of war/visibility systems
- [ ] Add measuring tools for distances

## Phase 3: Dice Rolling and Game Mechanics

**MVP Goal**: Support dice rolling and basic rule implementations for gameplay.

### Tasks:
- [ ] Create dice rolling engine with support for common TTRPG dice notation
- [ ] Add dice roll history and saving favorite/common rolls
- [ ] Implement initiative tracker
- [ ] Add character sheet basic integration
- [ ] Create simple combat tracker

## Phase 4: Enhanced Communication

**MVP Goal**: Provide rich communication tools for game sessions.

### Tasks:
- [ ] Implement real-time chat with support for dice roll integration
- [ ] Add private messaging between GM and players
- [ ] Create handout/note sharing system
- [ ] Implement audio chat integration or compatibility
- [ ] Add emote and reaction system

## Phase 5: Advanced Features and Optimizations

**MVP Goal**: Enhance the platform with advanced features for a complete VTT experience.

### Tasks:
- [ ] Add support for dynamic lighting and shadows
- [ ] Implement macro system for common actions
- [ ] Create marketplace for community-created assets
- [ ] Add automation tools for common GM tasks
- [ ] Implement API for extensibility and integration with other tools
- [ ] Performance optimization for large maps and complex sessions

## Technical Considerations

- **Backend**: .NET 9 with the latest C# features
- **Frontend**: Blazor for interactive UI components
- **Real-time Communication**: SignalR for chat and synchronization
- **Storage**: Mix of database storage and blob storage for media assets
- **Authentication**: ASP.NET Core Identity (already implemented)

## Ongoing Evaluation

At the completion of each phase, we will:
1. Conduct user testing with real TTRPG groups
2. Gather feedback on implemented features
3. Refine existing functionality based on feedback
4. Adjust upcoming phases as needed
5. Ensure the application remains performant and reliable

Note: This roadmap is a living document and will be updated as development progresses and requirements evolve.