# Remove Participant Use Case

**Original Request**: Remove user from game session participant roster

**Remove Participant** is a backend API endpoint that removes a user from a game session's participant roster. This use case operates within the Game area and enables Game Masters to remove participants from their sessions, with the constraint that the Game Master (Master role) cannot be removed.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model extraction

---

## Use Case Overview

### Business Context
- **Parent Feature**: Participant Management
- **Owning Area**: Game
- **Business Value**: Enables Game Masters to manage session rosters by removing participants who can no longer attend
- **User Benefit**: GMs can remove participants from sessions while preserving Game Master presence

### Scope Definition
- **Primary Actor**: Game Master (session owner)
- **Scope**: GameSession.Players collection modification (removal)
- **Level**: User goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP

- **Endpoint**: DELETE /api/game-sessions/{id}/participants/{userId}
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/REST
- **Response Format**: JSON with updated GameSession excluding removed participant from Players collection

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: GameSessionService.RemoveParticipantAsync()
- **Domain Entities**: GameSession (aggregate root), Participant (value object)
- **Domain Services**: IGameSessionStorage.RemoveParticipantAsync()
- **Infrastructure Dependencies**: DbContext

### Hexagonal Architecture
- **Primary Port Operation**: IGameSessionService.RemoveParticipantAsync(Guid sessionId, Guid userId, Guid requestingUserId)
- **Secondary Port Dependencies**: IGameSessionStorage
- **Adapter Requirements**: EF Core repository, REST API controller

### DDD Alignment
- **Bounded Context**: Game
- **Ubiquitous Language**: GameSession, Participant, Game Master, Master (role)
- **Business Invariants**: INV-03 (at least GM as Master - cannot remove Master), AGG-01 (GM-only), AGG-04 (not when Finished), AGG-05 (GM manages participants)
- **Domain Events**: Potential ParticipantLeft event for real-time notifications

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - SessionId (Guid from route)
  - UserId (Guid - user to remove)
  - RequestingUserId (Guid from auth context)
- **Input Validation**:
  - SessionId must exist
  - UserId must be participant in session
  - UserId must not be the Game Master (Master role) - cannot remove Master
  - RequestingUserId must be session owner
  - Session Status must not be Finished
- **Preconditions**: Authenticated GM, session exists, session not Finished, user is participant, user is not Master

### Business Logic
- **Business Rules**:
  - BR-03: Session must have at least one participant (GM as Master) - enforced by preventing Master removal
  - BR-06: Only GM can manage participants
  - BR-10: Participants cannot be removed when Status=Finished
  - INV-03: At least GM as Master must remain (cannot remove Master)
  - AGG-01: GM-only modifications
  - AGG-04: No participant changes when Finished
  - AGG-05: GM manages participants
- **Processing Steps**:
  1. Authenticate and retrieve session
  2. Verify ownership (RequestingUserId == OwnerId)
  3. Verify Status ≠ Finished (AGG-04, BR-10)
  4. Find participant with UserId in Players collection
  5. Verify participant exists (is currently in session)
  6. Verify participant PlayerType ≠ Master (cannot remove GM - INV-03, BR-03)
  7. Remove participant from Players collection
  8. Persist via IGameSessionStorage.RemoveParticipantAsync()
  9. Return updated session
  10. Optional SignalR broadcast ParticipantLeft
- **Domain Coordination**: GameSession aggregate with Participant value object removal
- **Validation Logic**: Ownership, status check, participant existence, Master protection

### Output Specification
- **Output Data**: Updated GameSession with participant removed from Players array
- **Output Format**: JSON object with Players collection excluding removed participant
- **Postconditions**: Participant removed from roster, Master remains, session still valid

### Error Scenarios
- **Session Not Found**: 404 Not Found "Game session not found"
- **Unauthorized User**: 403 Forbidden "Only the Game Master can remove participants"
- **Session Finished**: 400 Bad Request "Cannot remove participants from finished session" (BR-10, AGG-04)
- **Participant Not Found**: 404 Not Found "User is not a participant in this session"
- **Cannot Remove Master**: 400 Bad Request "Cannot remove the Game Master from the session" (INV-03, BR-03)
- **Persistence Failure**: 500 Internal Server Error

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
```csharp
public interface IGameSessionService
{
    Task<GameSession> RemoveParticipantAsync(Guid sessionId, Guid userId, Guid requestingUserId);
}
```
- **Data Access Patterns**: Repository pattern, retrieve-modify-persist with collection removal
- **External Integration**: None
- **Performance Requirements**: < 100ms

### Architecture Compliance
- **Layer Responsibilities**: API → Application (validation, orchestration) → Domain Service → Infrastructure
- **Dependency Direction**: Standard clean architecture
- **Interface Abstractions**: IGameSessionStorage
- **KISS Validation**: Collection removal with Master protection

### Testing Strategy
- **Unit Testing**: All validation scenarios (authorization, status, participant existence, Master protection)
- **Integration Testing**: End-to-end participant removal, EF Core collection persistence, SignalR broadcast
- **Acceptance Criteria**: See below
- **BDD Scenarios**: Covered in AC

---

## Acceptance Criteria

- **AC-01**: GM can remove player participant
  - **Given**: GameSession exists, user is participant with Player role, authenticated owner
  - **When**: Remove Participant API called
  - **Then**: Participant removed from Players, 200 OK

- **AC-02**: GM can remove assistant participant
  - **Given**: Participant with Assistant role
  - **When**: Remove Participant API called
  - **Then**: Participant removed

- **AC-03**: GM can remove guest participant
  - **Given**: Participant with Guest role
  - **When**: Remove Participant API called
  - **Then**: Participant removed

- **AC-04**: Cannot remove Game Master
  - **Given**: Participant with Master role (the GM)
  - **When**: Remove Participant API called
  - **Then**: 400 Bad Request "Cannot remove the Game Master" (INV-03)

- **AC-05**: Cannot remove from finished session
  - **Given**: Session Status=Finished
  - **When**: Remove Participant API called
  - **Then**: 400 Bad Request (BR-10, AGG-04)

- **AC-06**: Non-owner cannot remove participants
  - **Given**: Non-owner user
  - **When**: Remove Participant API called
  - **Then**: 403 Forbidden

- **AC-07**: Cannot remove non-participant
  - **Given**: UserId not in Players collection
  - **When**: Remove Participant API called
  - **Then**: 404 Not Found "User is not a participant"

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Aggregate modification with value object removal and Master protection
- **Code Organization**: GameSessionService.RemoveParticipantAsync() with Master validation
- **Testing Approach**: Master protection testing, validation scenarios

### Dependencies
- **Technical Dependencies**: ASP.NET Core, EF Core, auth
- **Area Dependencies**: None
- **External Dependencies**: Optional SignalR for ParticipantLeft event

### Architectural Considerations
- **Area Boundary Respect**: Self-contained within Game area
- **Interface Design**: Simple removal operation with protection rules
- **Error Handling**: Specific errors for validation failures (6 error scenarios)

---

<!-- Quality Score: 100/100 ✅ -->
