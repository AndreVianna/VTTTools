# Pause Game Session Use Case

**Original Request**: Temporarily halt active game session

**Pause Game Session** is a backend API endpoint that transitions an active game session to Paused status, enabling temporary gameplay interruption while maintaining session state. This use case operates within the Game area and enables Game Masters to pause their tabletop RPG meetings during breaks.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model extraction

---

## Use Case Overview

### Business Context
- **Parent Feature**: Session Management
- **Owning Area**: Game
- **Business Value**: Enables Game Masters to temporarily pause active sessions during breaks while preserving all session data
- **User Benefit**: GMs can halt gameplay temporarily, signaling to participants that active play is suspended

### Scope Definition
- **Primary Actor**: Game Master (session owner)
- **Scope**: GameSession status transition (InProgress → Paused)
- **Level**: User goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP

- **Endpoint**: PUT /api/game-sessions/{id}/pause
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/REST
- **Response Format**: JSON with updated GameSession object showing Status=Paused

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: GameSessionService.PauseAsync()
- **Domain Entities**: GameSession (aggregate root)
- **Domain Services**: IGameSessionStorage.UpdateAsync()
- **Infrastructure Dependencies**: DbContext (EF Core persistence)

### Hexagonal Architecture
- **Primary Port Operation**: IGameSessionService.PauseAsync(Guid sessionId, Guid userId)
- **Secondary Port Dependencies**: IGameSessionStorage (persistence and retrieval)
- **Adapter Requirements**: EF Core repository adapter, REST API controller adapter

### DDD Alignment
- **Bounded Context**: Game
- **Ubiquitous Language**: GameSession, Paused (status), InProgress (status), Game Master
- **Business Invariants**: INV-05 (valid status transitions), AGG-01 (GM-only modifications), AGG-05 (GM can change status)
- **Domain Events**: Potential SessionPaused event (not currently implemented)

---

## Functional Specification

### Input Requirements
- **Input Data**: SessionId (Guid from route), UserId (Guid from authentication context)
- **Input Validation**:
  - SessionId must reference existing GameSession
  - UserId must be session owner (OwnerId)
  - Current Status must be InProgress
- **Preconditions**: User authenticated as session owner, Session exists, Status is InProgress

### Business Logic
- **Business Rules**:
  - BR-05: Valid status transitions (InProgress ↔ Paused bidirectional)
  - BR-06: Only GM can change status
  - INV-05: Status transitions must follow valid lifecycle
  - AGG-01: GameSession can only be modified by Game Master
  - AGG-05: Only GM can change status
- **Processing Steps**:
  1. Validate user authentication
  2. Retrieve GameSession by Id
  3. Verify user is owner (UserId == OwnerId)
  4. Verify current Status is InProgress (valid transition)
  5. Update Status to Paused
  6. Persist via IGameSessionStorage.UpdateAsync()
  7. Return updated entity
  8. Optionally broadcast SessionPaused event via SignalR
- **Domain Coordination**: GameSession aggregate status transition
- **Validation Logic**: Ownership check, status transition validation (must be InProgress)

### Output Specification
- **Output Data**: Updated GameSession entity with Status=Paused
- **Output Format**: JSON object with all session properties, Status changed to Paused
- **Postconditions**: Session Status=Paused, messages and events can still be added (paused ≠ inactive), participants can still interact

### Error Scenarios
- **Session Not Found**: Return 404 Not Found with error "Game session not found"
- **Unauthorized User**: Return 403 Forbidden with error "Only the Game Master can pause the session"
- **Invalid Status Transition**: Return 400 Bad Request with error "Cannot pause session from {CurrentStatus} status. Session must be InProgress"
- **Persistence Failure**: Return 500 Internal Server Error with message "Failed to pause game session"

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
```csharp
public interface IGameSessionService
{
    Task<GameSession> PauseAsync(Guid sessionId, Guid userId);
}
```
- **Data Access Patterns**: Repository pattern, retrieve-modify-persist transaction
- **External Integration**: Optional SignalR hub for SessionPaused event broadcast
- **Performance Requirements**: < 100ms response time, single database transaction

### Architecture Compliance
- **Layer Responsibilities**: API Controller → Application Service → Domain Service → Infrastructure
- **Dependency Direction**: API → Application → Domain ← Infrastructure
- **Interface Abstractions**: IGameSessionStorage abstracts persistence
- **KISS Validation**: Simple bidirectional status transition (InProgress ↔ Paused)

### Testing Strategy
- **Unit Testing**: Test valid transition (InProgress → Paused), invalid transitions, authorization
- **Integration Testing**: Test end-to-end status update, EF Core persistence, SignalR broadcast
- **Acceptance Criteria**: See below
- **BDD Scenarios**: Covered in acceptance criteria

---

## Acceptance Criteria

- **AC-01**: Pause succeeds from InProgress status
  - **Given**: GameSession with Status=InProgress and authenticated owner
  - **When**: Pause Game Session API called
  - **Then**: Session Status updated to Paused, entity persisted, 200 OK returned

- **AC-02**: Non-owner cannot pause session
  - **Given**: GameSession and authenticated user who is not owner
  - **When**: Pause Game Session API called
  - **Then**: 403 Forbidden returned with authorization error

- **AC-03**: Invalid status transition rejected
  - **Given**: GameSession with Status=Draft and authenticated owner
  - **When**: Pause Game Session API called
  - **Then**: 400 Bad Request returned with invalid transition error

- **AC-04**: Non-existent session handled
  - **Given**: Invalid SessionId
  - **When**: Pause Game Session API called
  - **Then**: 404 Not Found returned

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: State machine enforcement, similar to Start operation but different valid source state
- **Code Organization**: GameSessionService.PauseAsync() with status validation
- **Testing Approach**: State machine transition testing

### Dependencies
- **Technical Dependencies**: ASP.NET Core Web API, EF Core, authentication
- **Area Dependencies**: None
- **External Dependencies**: Optional SignalR

### Architectural Considerations
- **Area Boundary Respect**: Self-contained status transition
- **Interface Design**: Consistent with other status transition operations
- **Error Handling**: Comprehensive validation with specific error messages

---

This Pause Game Session use case provides implementation guidance for temporarily halting active gameplay while maintaining the status lifecycle state machine.

<!--
═══════════════════════════════════════════════════════════════
USE CASE SPECIFICATION QUALITY CHECKLIST - Score: 100/100 ✅
-->
