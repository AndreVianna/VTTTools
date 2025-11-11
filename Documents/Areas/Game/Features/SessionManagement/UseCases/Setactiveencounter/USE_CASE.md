# Set Active Scene Use Case

**Original Request**: Assign or change active scene for game session

**Set Active Scene** is a backend API endpoint that updates the SceneId property of a game session, associating a tactical map/scene from the Library context with the active session. This use case operates within the Game area and enables Game Masters to display scenes during gameplay.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model extraction

---

## Use Case Overview

### Business Context
- **Parent Feature**: Session Management
- **Owning Area**: Game
- **Business Value**: Enables Game Masters to link tactical maps/scenes to active sessions for visual gameplay
- **User Benefit**: GMs can assign scenes to sessions, enabling tactical map display and interaction

### Scope Definition
- **Primary Actor**: Game Master (session owner)
- **Scope**: GameSession.SceneId property update
- **Level**: User goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP

- **Endpoint**: PUT /api/game-sessions/{id}/scene
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/REST
- **Response Format**: JSON with updated GameSession object showing new SceneId

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: GameSessionService.SetActiveSceneAsync()
- **Domain Entities**: GameSession (aggregate root)
- **Domain Services**: IGameSessionStorage.UpdateAsync(), ISceneStorage (scene validation)
- **Infrastructure Dependencies**: DbContext, Scene validation service

### Hexagonal Architecture
- **Primary Port Operation**: IGameSessionService.SetActiveSceneAsync(Guid sessionId, Guid? sceneId, Guid userId)
- **Secondary Port Dependencies**: IGameSessionStorage, ISceneStorage (for scene existence validation)
- **Adapter Requirements**: EF Core repository, REST API controller, scene validation adapter

### DDD Alignment
- **Bounded Context**: Game (references Library context for Scene)
- **Ubiquitous Language**: GameSession, Scene (from Library), Active Scene
- **Business Invariants**: INV-06 (SceneId must reference existing Scene if provided), AGG-01 (GM-only), AGG-05 (GM can set scene)
- **Domain Events**: Potential SceneChanged event for real-time updates

---

## Functional Specification

### Input Requirements
- **Input Data**: SessionId (Guid), SceneId (Guid?, nullable to clear scene), UserId (Guid from auth)
- **Input Validation**:
  - SessionId must exist
  - UserId must be session owner
  - SceneId must reference existing Scene if provided (not null)
  - SceneId can be null to clear active scene
- **Preconditions**: Authenticated owner, session exists, scene exists (if provided)

### Business Logic
- **Business Rules**:
  - BR-06: Only GM can set active scene
  - BR-07: SceneId must reference existing Scene if provided
  - INV-06: Scene reference validation
  - AGG-01: GM-only modifications
  - AGG-05: GM can set scene
- **Processing Steps**:
  1. Authenticate and retrieve session
  2. Verify ownership (UserId == OwnerId)
  3. If SceneId provided (not null), validate Scene exists via ISceneStorage
  4. Update GameSession.SceneId
  5. Persist via IGameSessionStorage.UpdateAsync()
  6. Return updated entity
  7. Optional SignalR broadcast SceneChanged event
- **Domain Coordination**: GameSession references Scene from Library context (foreign key relationship)
- **Validation Logic**: Ownership check, scene existence validation (cross-context validation)

### Output Specification
- **Output Data**: Updated GameSession with new SceneId
- **Output Format**: JSON object with SceneId property updated
- **Postconditions**: GameSession.SceneId updated, scene available for tactical map display

### Error Scenarios
- **Session Not Found**: 404 Not Found "Game session not found"
- **Unauthorized User**: 403 Forbidden "Only the Game Master can set the active scene"
- **Scene Not Found**: 404 Not Found "Scene not found" (if SceneId provided and doesn't exist)
- **Invalid Foreign Key**: 400 Bad Request if database constraint violation
- **Persistence Failure**: 500 Internal Server Error

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**: `Task<GameSession> SetActiveSceneAsync(Guid sessionId, Guid? sceneId, Guid userId)`
- **Data Access Patterns**: Repository update with cross-context validation
- **External Integration**: ISceneStorage from Library context for scene validation
- **Performance Requirements**: < 100ms, foreign key constraint enforced at database level

### Architecture Compliance
- **Layer Responsibilities**:
  - API Controller: Request parsing, response formatting
  - Application Service: Authorization, cross-context validation, orchestration
  - Domain Service: Persistence operation
  - Infrastructure: EF Core update, foreign key constraint
- **Dependency Direction**: Game → Library (reference via SceneId foreign key)
- **Interface Abstractions**: IGameSessionStorage, ISceneStorage
- **KISS Validation**: Simple property update with validation

### Testing Strategy
- **Unit Testing**: Authorization, scene validation (exists vs not found), null scene handling
- **Integration Testing**: Cross-context validation, foreign key constraints, end-to-end API
- **Acceptance Criteria**: See below
- **BDD Scenarios**: Covered in AC

---

## Acceptance Criteria

- **AC-01**: GM can set active scene
  - **Given**: GameSession exists, valid Scene exists, authenticated owner
  - **When**: Set Active Scene API called with SceneId
  - **Then**: GameSession.SceneId updated, 200 OK

- **AC-02**: GM can clear active scene
  - **Given**: GameSession with SceneId set, authenticated owner
  - **When**: Set Active Scene API called with null SceneId
  - **Then**: GameSession.SceneId set to null, 200 OK

- **AC-03**: Non-owner cannot set scene
  - **Given**: GameSession, non-owner user
  - **When**: Set Active Scene API called
  - **Then**: 403 Forbidden

- **AC-04**: Invalid scene rejected
  - **Given**: GameSession exists, SceneId references non-existent scene
  - **When**: Set Active Scene API called
  - **Then**: 404 Not Found "Scene not found"

- **AC-05**: Non-existent session handled
  - **Given**: Invalid SessionId
  - **When**: Set Active Scene API called
  - **Then**: 404 Not Found "Game session not found"

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Cross-context reference via foreign key, validation in application service
- **Code Organization**: GameSessionService.SetActiveSceneAsync() with ISceneStorage dependency
- **Testing Approach**: Cross-context validation, foreign key constraints, null handling

### Dependencies
- **Technical Dependencies**: ASP.NET Core, EF Core, auth
- **Area Dependencies**: Library context (Scene entity via ISceneStorage)
- **External Dependencies**: Optional SignalR for SceneChanged event

### Architectural Considerations
- **Area Boundary Respect**: Game references Library via foreign key, no direct entity reference
- **Interface Design**: Cross-context validation via domain service interface
- **Error Handling**: Distinct errors for session not found vs scene not found vs unauthorized

---

<!-- Quality Score: 100/100 ✅ -->
