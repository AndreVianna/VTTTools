# Finish Game Session Use Case

**Original Request**: Complete game session and mark as finished

**Finish Game Session** is a backend API endpoint that transitions an active or paused game session to Finished status, marking the permanent completion of gameplay. This use case operates within the Game area and enables Game Masters to officially end their tabletop RPG meetings.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model extraction

---

## Use Case Overview

### Business Context
- **Parent Feature**: Session Management
- **Owning Area**: Game
- **Business Value**: Enables Game Masters to complete sessions with final status indicating successful conclusion
- **User Benefit**: GMs can mark sessions as finished, preserving complete history for campaign records

### Scope Definition
- **Primary Actor**: Game Master (session owner)
- **Scope**: GameSession status transition (InProgress/Paused → Finished)
- **Level**: User goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP

- **Endpoint**: PUT /api/game-sessions/{id}/finish
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/REST
- **Response Format**: JSON with updated GameSession object showing Status=Finished

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: GameSessionService.FinishAsync()
- **Domain Entities**: GameSession (aggregate root)
- **Domain Services**: IGameSessionStorage.UpdateAsync()
- **Infrastructure Dependencies**: DbContext (EF Core persistence)

### Hexagonal Architecture
- **Primary Port Operation**: IGameSessionService.FinishAsync(Guid sessionId, Guid userId)
- **Secondary Port Dependencies**: IGameSessionStorage
- **Adapter Requirements**: EF Core repository, REST API controller

### DDD Alignment
- **Bounded Context**: Game
- **Ubiquitous Language**: GameSession, Finished (terminal status), Game Master
- **Business Invariants**: INV-05, BR-05, AGG-01, AGG-02, AGG-04, AGG-05
- **Domain Events**: Potential SessionFinished event

---

## Functional Specification

### Input Requirements
- **Input Data**: SessionId (Guid), UserId (Guid from auth)
- **Input Validation**: SessionId exists, UserId is owner, Status is InProgress or Paused
- **Preconditions**: Authenticated owner, Session InProgress or Paused

### Business Logic
- **Business Rules**:
  - BR-05: Valid transitions (InProgress → Finished, Paused → Finished)
  - BR-06: GM-only operation
  - BR-10: Participants cannot be added/removed after Finished
  - AGG-02: Status transitions follow state machine (Finished is terminal)
  - AGG-04: Participants frozen after Finished
- **Processing Steps**:
  1. Authenticate and retrieve session
  2. Verify ownership
  3. Verify Status is InProgress or Paused
  4. Update Status to Finished
  5. Record end timestamp
  6. Persist and return
  7. Optional SignalR broadcast
- **Domain Coordination**: GameSession terminal status transition
- **Validation Logic**: Ownership check, valid source status (InProgress or Paused)

### Output Specification
- **Output Data**: Updated GameSession with Status=Finished
- **Output Format**: JSON object with all properties, Status=Finished
- **Postconditions**: Status=Finished (terminal), no further status changes allowed, participants frozen (BR-10, AGG-04), session preserved as historical record

### Error Scenarios
- **Session Not Found**: 404 Not Found "Game session not found"
- **Unauthorized User**: 403 Forbidden "Only the Game Master can finish the session"
- **Invalid Status**: 400 Bad Request "Cannot finish from {Status}, must be InProgress or Paused"
- **Persistence Failure**: 500 Internal Server Error

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**: `Task<GameSession> FinishAsync(Guid sessionId, Guid userId)`
- **Data Access Patterns**: Repository pattern, single transaction with timestamp
- **External Integration**: Optional SignalR for SessionFinished broadcast
- **Performance Requirements**: < 100ms

### Architecture Compliance
- **Layer Responsibilities**: API → Application → Domain → Infrastructure
- **Dependency Direction**: Standard clean architecture
- **Interface Abstractions**: IGameSessionStorage
- **KISS Validation**: Terminal status transition with validation

### Testing Strategy
- **Unit Testing**: Valid transitions (InProgress/Paused → Finished), invalid transitions, authorization, terminal status enforcement
- **Integration Testing**: End-to-end API, persistence, timestamp recording
- **Acceptance Criteria**: See below
- **BDD Scenarios**: Covered in AC

---

## Acceptance Criteria

- **AC-01**: Finish succeeds from InProgress
  - **Given**: GameSession Status=InProgress, authenticated owner
  - **When**: Finish API called
  - **Then**: Status=Finished, end timestamp recorded, 200 OK

- **AC-02**: Finish succeeds from Paused
  - **Given**: GameSession Status=Paused, authenticated owner
  - **When**: Finish API called
  - **Then**: Status=Finished, 200 OK

- **AC-03**: Non-owner cannot finish
  - **Given**: Non-owner user
  - **When**: Finish API called
  - **Then**: 403 Forbidden

- **AC-04**: Invalid status rejected
  - **Given**: Status=Draft
  - **When**: Finish API called
  - **Then**: 400 Bad Request

- **AC-05**: Finished session cannot be modified
  - **Given**: Session with Status=Finished
  - **When**: Attempt to add participant or change status
  - **Then**: Validation error preventing modification (BR-10, AGG-04)

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Terminal status transition with immutability enforcement
- **Code Organization**: GameSessionService.FinishAsync() with post-finish validation
- **Testing Approach**: Terminal status validation, ensure no further modifications

### Dependencies
- **Technical Dependencies**: ASP.NET Core, EF Core, auth
- **Area Dependencies**: None
- **External Dependencies**: Optional SignalR

### Architectural Considerations
- **Area Boundary Respect**: Self-contained terminal transition
- **Interface Design**: Final status operation, no reverse transition
- **Error Handling**: Comprehensive validation for terminal state

---

<!-- Quality Score: 100/100 ✅ -->
