# Add Participant Use Case

**Original Request**: Invite user to game session with specific role

**Add Participant** is a backend API endpoint that adds a user to a game session's participant roster with a specified role (Guest, Player, Assistant, or Master). This use case operates within the Game area and enables Game Masters to invite users to their sessions.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model extraction

---

## Use Case Overview

### Business Context
- **Parent Feature**: Participant Management
- **Owning Area**: Game
- **Business Value**: Enables Game Masters to build session rosters by inviting users with appropriate roles
- **User Benefit**: GMs can invite players, assistants, and guests to their sessions

### Scope Definition
- **Primary Actor**: Game Master (session owner)
- **Scope**: GameSession.Players collection modification
- **Level**: User goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP

- **Endpoint**: POST /api/game-sessions/{id}/participants
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/REST
- **Response Format**: JSON with updated GameSession including new participant in Players collection

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: GameSessionService.AddParticipantAsync()
- **Domain Entities**: GameSession (aggregate root), Participant (value object)
- **Domain Services**: IGameSessionStorage.AddParticipantAsync()
- **Infrastructure Dependencies**: DbContext, User validation service

### Hexagonal Architecture
- **Primary Port Operation**: IGameSessionService.AddParticipantAsync(Guid sessionId, Guid userId, PlayerType role, Guid requestingUserId)
- **Secondary Port Dependencies**: IGameSessionStorage, IUserService (user existence validation)
- **Adapter Requirements**: EF Core repository, REST API controller, user validation adapter

### DDD Alignment
- **Bounded Context**: Game
- **Ubiquitous Language**: GameSession, Participant, PlayerType (Guest/Player/Assistant/Master), Game Master
- **Business Invariants**: INV-03 (at least GM as Master), INV-04 (only one Master), AGG-01 (GM-only), AGG-04 (not when Finished), AGG-05 (GM manages participants)
- **Domain Events**: Potential ParticipantJoined event for real-time notifications

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - SessionId (Guid from route)
  - UserId (Guid - user to add)
  - PlayerType (enum: Guest, Player, Assistant, Master)
  - RequestingUserId (Guid from auth context)
- **Input Validation**:
  - SessionId must exist
  - UserId must reference existing User
  - UserId must not already be participant
  - PlayerType must be valid enum value
  - RequestingUserId must be session owner
  - Session Status must not be Finished
  - If PlayerType=Master, no other Master exists (INV-04)
- **Preconditions**: Authenticated GM, session exists, session not Finished, user exists, user not already participant

### Business Logic
- **Business Rules**:
  - BR-03: Session must have at least one participant (GM as Master) - always satisfied
  - BR-04: Only one participant can be Master (INV-04)
  - BR-06: Only GM can manage participants
  - BR-08: Participant.UserId must reference existing User
  - BR-10: Participants cannot be added when Status=Finished
  - INV-03: At least GM as Master maintained
  - INV-04: Single Master enforcement
  - AGG-01: GM-only modifications
  - AGG-04: No participant changes when Finished
  - AGG-05: GM manages participants
- **Processing Steps**:
  1. Authenticate and retrieve session
  2. Verify ownership (RequestingUserId == OwnerId)
  3. Verify Status ≠ Finished (AGG-04, BR-10)
  4. Validate User exists via IUserService
  5. Verify UserId not already in Players collection
  6. If PlayerType=Master, verify no other Master exists (INV-04, BR-04)
  7. Create Participant { UserId, PlayerType, JoinedAt=Now }
  8. Add to Players collection
  9. Persist via IGameSessionStorage.AddParticipantAsync()
  10. Return updated session
  11. Optional SignalR broadcast ParticipantJoined
- **Domain Coordination**: GameSession aggregate with Participant value object
- **Validation Logic**: Ownership, status check, user existence, duplicate check, Master uniqueness

### Output Specification
- **Output Data**: Updated GameSession with new participant in Players array
- **Output Format**: JSON object with Players collection including new Participant
- **Postconditions**: Participant added to Players, JoinedAt timestamp recorded, roster updated

### Error Scenarios
- **Session Not Found**: 404 Not Found "Game session not found"
- **Unauthorized User**: 403 Forbidden "Only the Game Master can add participants"
- **Session Finished**: 400 Bad Request "Cannot add participants to finished session" (BR-10, AGG-04)
- **User Not Found**: 404 Not Found "User not found" (BR-08)
- **User Already Participant**: 409 Conflict "User is already a participant in this session"
- **Duplicate Master**: 400 Bad Request "Session already has a Game Master, only one Master allowed" (INV-04, BR-04)
- **Invalid PlayerType**: 400 Bad Request "Invalid player type, must be Guest, Player, Assistant, or Master"
- **Persistence Failure**: 500 Internal Server Error

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
```csharp
public interface IGameSessionService
{
    Task<GameSession> AddParticipantAsync(Guid sessionId, Guid userId, PlayerType role, Guid requestingUserId);
}
```
- **Data Access Patterns**: Repository pattern, retrieve-modify-persist with collection append
- **External Integration**: IUserService for user validation
- **Performance Requirements**: < 100ms

### Architecture Compliance
- **Layer Responsibilities**: API → Application (validation, orchestration) → Domain Service → Infrastructure
- **Dependency Direction**: Game → Identity (User validation)
- **Interface Abstractions**: IGameSessionStorage, IUserService
- **KISS Validation**: Collection append with comprehensive validation

### Testing Strategy
- **Unit Testing**: All validation scenarios (authorization, status, user existence, duplicates, Master uniqueness), PlayerType enum validation
- **Integration Testing**: End-to-end participant addition, EF Core collection persistence, SignalR broadcast
- **Acceptance Criteria**: See below
- **BDD Scenarios**: Covered in AC

---

## Acceptance Criteria

- **AC-01**: GM can add player participant
  - **Given**: GameSession exists, valid User, authenticated owner, PlayerType=Player
  - **When**: Add Participant API called
  - **Then**: Participant added to Players, JoinedAt recorded, 200 OK

- **AC-02**: GM can add assistant participant
  - **Given**: Valid inputs, PlayerType=Assistant
  - **When**: Add Participant API called
  - **Then**: Participant added with Assistant role

- **AC-03**: GM can add guest participant
  - **Given**: Valid inputs, PlayerType=Guest
  - **When**: Add Participant API called
  - **Then**: Participant added with Guest role

- **AC-04**: Cannot add second Master
  - **Given**: Session already has Master, PlayerType=Master
  - **When**: Add Participant API called
  - **Then**: 400 Bad Request "Only one Master allowed" (INV-04)

- **AC-05**: Cannot add to finished session
  - **Given**: Session Status=Finished
  - **When**: Add Participant API called
  - **Then**: 400 Bad Request (BR-10, AGG-04)

- **AC-06**: Non-owner cannot add participants
  - **Given**: Non-owner user
  - **When**: Add Participant API called
  - **Then**: 403 Forbidden

- **AC-07**: Cannot add non-existent user
  - **Given**: UserId doesn't exist
  - **When**: Add Participant API called
  - **Then**: 404 Not Found "User not found"

- **AC-08**: Cannot add duplicate participant
  - **Given**: User already in Players collection
  - **When**: Add Participant API called
  - **Then**: 409 Conflict "Already a participant"

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Aggregate modification with value object append
- **Code Organization**: GameSessionService.AddParticipantAsync() with comprehensive validation
- **Testing Approach**: Extensive validation testing, Master uniqueness enforcement

### Dependencies
- **Technical Dependencies**: ASP.NET Core, EF Core, auth
- **Area Dependencies**: Identity context (User validation)
- **External Dependencies**: Optional SignalR for ParticipantJoined event

### Architectural Considerations
- **Area Boundary Respect**: Game → Identity reference for user validation
- **Interface Design**: Cross-context validation via IUserService
- **Error Handling**: Specific errors for each validation failure (8 error scenarios)

---

<!-- Quality Score: 100/100 ✅ -->
