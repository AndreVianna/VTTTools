# Start Game Session Use Case

**Original Request**: Transition game session from Draft/Scheduled to InProgress status

**Start Game Session** is a backend API endpoint that transitions a game session to active InProgress status, marking the beginning of live gameplay. This use case operates within the Game area and enables Game Masters to begin their tabletop RPG meetings.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model extraction

---

## Use Case Overview

### Business Context
- **Parent Feature**: Session Management
- **Owning Area**: Game
- **Business Value**: Enables Game Masters to officially start game sessions and transition to active gameplay state
- **User Benefit**: GMs can signal the beginning of gameplay, triggering any start-time behaviors and real-time features

### Scope Definition
- **Primary Actor**: Game Master (session owner)
- **Scope**: GameSession status transition (Draft/Scheduled → InProgress)
- **Level**: User goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP

- **Endpoint**: PUT /api/game-sessions/{id}/start
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/REST
- **Response Format**: JSON with updated GameSession object showing Status=InProgress

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: GameSessionService.StartAsync()
- **Domain Entities**: GameSession (aggregate root)
- **Domain Services**: IGameSessionStorage.UpdateAsync()
- **Infrastructure Dependencies**: DbContext (EF Core persistence)

### Hexagonal Architecture
- **Primary Port Operation**: IGameSessionService.StartAsync(Guid sessionId, Guid userId)
- **Secondary Port Dependencies**: IGameSessionStorage (persistence and retrieval)
- **Adapter Requirements**: EF Core repository adapter, REST API controller adapter

### DDD Alignment
- **Bounded Context**: Game
- **Ubiquitous Language**: GameSession, InProgress (status), Start (lifecycle event), Game Master
- **Business Invariants**: INV-05 (valid status transitions), AGG-01 (GM-only modifications), AGG-05 (GM can change status)
- **Domain Events**: Potential SessionStarted event (not currently implemented, could be added via SignalR)

---

## Functional Specification

### Input Requirements
- **Input Data**: SessionId (Guid from route), UserId (Guid from authentication context)
- **Input Validation**:
  - SessionId must reference existing GameSession
  - UserId must be session owner (OwnerId)
  - Current Status must be Draft or Scheduled
- **Preconditions**: User authenticated as session owner, Session exists, Status is Draft or Scheduled

### Business Logic
- **Business Rules**:
  - BR-05: Valid status transitions (Draft/Scheduled → InProgress)
  - BR-06: Only GM can change status
  - INV-05: Status transitions must follow valid lifecycle
  - AGG-01: GameSession can only be modified by Game Master
  - AGG-05: Only GM can change status
- **Processing Steps**:
  1. Validate user authentication
  2. Retrieve GameSession by Id
  3. Verify user is owner (UserId == OwnerId)
  4. Verify current Status is Draft or Scheduled (valid transition)
  5. Update Status to InProgress
  6. Record start timestamp (optional tracking)
  7. Persist via IGameSessionStorage.UpdateAsync()
  8. Return updated entity
  9. Optionally broadcast SessionStarted event via SignalR
- **Domain Coordination**: GameSession aggregate status transition
- **Validation Logic**: Ownership check, status transition validation

### Output Specification
- **Output Data**: Updated GameSession entity with Status=InProgress
- **Output Format**: JSON object with all session properties, Status changed to InProgress
- **Postconditions**: Session Status=InProgress, session available for active gameplay operations (messages, events, participants can join)

### Error Scenarios
- **Session Not Found**: Return 404 Not Found with error "Game session not found"
- **Unauthorized User**: Return 403 Forbidden with error "Only the Game Master can start the session" (BR-06, AGG-01)
- **Invalid Status Transition**: Return 400 Bad Request with error "Cannot start session from {CurrentStatus} status. Session must be Draft or Scheduled" (BR-05, INV-05)
- **Persistence Failure**: Return 500 Internal Server Error with message "Failed to start game session"

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
```csharp
public interface IGameSessionService
{
    Task<GameSession> StartAsync(Guid sessionId, Guid userId);
}
```
- **Data Access Patterns**: Repository pattern, retrieve-modify-persist transaction
- **External Integration**: Optional SignalR hub for SessionStarted event broadcast
- **Performance Requirements**: < 100ms response time, single database transaction

### Architecture Compliance
- **Layer Responsibilities**:
  - API Controller: Route parameter extraction, authentication context, response formatting
  - Application Service: Authorization check, status transition validation, orchestration
  - Domain Service: Persistence operation
  - Infrastructure: EF Core entity update
- **Dependency Direction**: API → Application → Domain ← Infrastructure
- **Interface Abstractions**: IGameSessionStorage abstracts persistence
- **KISS Validation**: Simple status transition, single field update, straightforward authorization check

### Testing Strategy
- **Unit Testing**:
  - Test valid status transitions (Draft → InProgress, Scheduled → InProgress)
  - Test invalid transitions (InProgress → InProgress, Finished → InProgress)
  - Test authorization (owner vs non-owner)
  - Test session not found scenario
- **Integration Testing**:
  - Test end-to-end status update via API
  - Test EF Core optimistic concurrency
  - Test SignalR event broadcast (if implemented)
- **Acceptance Criteria**: See below
- **BDD Scenarios**: Covered in acceptance criteria

---

## Acceptance Criteria

- **AC-01**: Start succeeds from Draft status
  - **Given**: GameSession with Status=Draft and authenticated owner
  - **When**: Start Game Session API called
  - **Then**: Session Status updated to InProgress, entity persisted, 200 OK returned

- **AC-02**: Start succeeds from Scheduled status
  - **Given**: GameSession with Status=Scheduled and authenticated owner
  - **When**: Start Game Session API called
  - **Then**: Session Status updated to InProgress, entity persisted, 200 OK returned

- **AC-03**: Non-owner cannot start session
  - **Given**: GameSession and authenticated user who is not owner
  - **When**: Start Game Session API called
  - **Then**: 403 Forbidden returned with error "Only the Game Master can start the session"

- **AC-04**: Invalid status transition rejected
  - **Given**: GameSession with Status=Finished and authenticated owner
  - **When**: Start Game Session API called
  - **Then**: 400 Bad Request returned with error message indicating invalid transition

- **AC-05**: Non-existent session handled
  - **Given**: Invalid SessionId
  - **When**: Start Game Session API called
  - **Then**: 404 Not Found returned with error "Game session not found"

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Status state machine enforcement in application service
- **Code Organization**: GameSessionService.StartAsync() handles validation and orchestration
- **Testing Approach**: State machine testing with all valid/invalid transition combinations

### Dependencies
- **Technical Dependencies**: ASP.NET Core Web API, EF Core, authentication middleware
- **Area Dependencies**: None (self-contained within Game area)
- **External Dependencies**: Optional SignalR for real-time notifications

### Architectural Considerations
- **Area Boundary Respect**: No cross-area dependencies for status transitions
- **Interface Design**: Simple status transition operation
- **Error Handling**: Specific errors for authorization, validation, and state machine violations

---

This Start Game Session use case provides comprehensive implementation guidance for transitioning sessions to active gameplay state within the Game area while enforcing the status lifecycle state machine.

<!--
═══════════════════════════════════════════════════════════════
USE CASE SPECIFICATION QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════

## Business Context (20 points)
✅ 5pts: Parent feature clearly identified
✅ 5pts: Owning area correctly assigned
✅ 5pts: Business value explicitly stated
✅ 5pts: Primary actor and scope defined

## Architecture Integration (30 points)
✅ 10pts: Clean Architecture mapping complete
✅ 10pts: Hexagonal Architecture elements defined
✅ 5pts: DDD alignment documented
✅ 5pts: Infrastructure dependencies identified
✅ UI type specified: API_ENDPOINT
✅ Endpoint documented: PUT /api/game-sessions/{id}/start

## Functional Specification (30 points)
✅ 5pts: Input requirements fully specified
✅ 5pts: Business rules documented (BR-05, BR-06, INV-05, AGG-01, AGG-05)
✅ 5pts: Processing steps detailed (9 steps)
✅ 5pts: Output specification complete
✅ 5pts: Error scenarios comprehensive (4 scenarios)
✅ 5pts: Preconditions and postconditions explicit

## Implementation Guidance (20 points)
✅ 5pts: Interface contract defined
✅ 5pts: Testing strategy comprehensive
✅ 5pts: Acceptance criteria in Given/When/Then format (5 criteria)
✅ 5pts: Architecture compliance validated

## Target Score: 100/100 ✅
-->
