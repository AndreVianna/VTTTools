# Resume Game Session Use Case

**Original Request**: Continue paused game session

**Resume Game Session** is a backend API endpoint that transitions a paused game session back to InProgress status, resuming active gameplay. This use case operates within the Game area and enables Game Masters to continue their tabletop RPG meetings after breaks.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model extraction

---

## Use Case Overview

### Business Context
- **Parent Feature**: Session Management
- **Owning Area**: Game
- **Business Value**: Enables Game Masters to resume paused sessions and return to active gameplay state
- **User Benefit**: GMs can signal resumption of gameplay after breaks

### Scope Definition
- **Primary Actor**: Game Master (session owner)
- **Scope**: GameSession status transition (Paused → InProgress)
- **Level**: User goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP

- **Endpoint**: PUT /api/game-sessions/{id}/resume
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/REST
- **Response Format**: JSON with updated GameSession object showing Status=InProgress

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: GameSessionService.ResumeAsync()
- **Domain Entities**: GameSession (aggregate root)
- **Domain Services**: IGameSessionStorage.UpdateAsync()
- **Infrastructure Dependencies**: DbContext (EF Core persistence)

### Hexagonal Architecture
- **Primary Port Operation**: IGameSessionService.ResumeAsync(Guid sessionId, Guid userId)
- **Secondary Port Dependencies**: IGameSessionStorage
- **Adapter Requirements**: EF Core repository adapter, REST API controller adapter

### DDD Alignment
- **Bounded Context**: Game
- **Ubiquitous Language**: GameSession, Paused (status), InProgress (status), Resume
- **Business Invariants**: INV-05, BR-05, AGG-01, AGG-05
- **Domain Events**: Potential SessionResumed event

---

## Functional Specification

### Input Requirements
- **Input Data**: SessionId (Guid), UserId (Guid from auth)
- **Input Validation**: SessionId exists, UserId is owner, Status is Paused
- **Preconditions**: Authenticated owner, Session exists with Status=Paused

### Business Logic
- **Business Rules**: BR-05 (Paused → InProgress), BR-06 (GM-only), INV-05, AGG-01, AGG-05
- **Processing Steps**:
  1. Authenticate and retrieve session
  2. Verify ownership
  3. Verify Status=Paused
  4. Update Status to InProgress
  5. Persist and return
  6. Optional SignalR broadcast
- **Domain Coordination**: GameSession status transition
- **Validation Logic**: Ownership check, Paused status requirement

### Output Specification
- **Output Data**: Updated GameSession with Status=InProgress
- **Output Format**: JSON object
- **Postconditions**: Status=InProgress, active gameplay resumed

### Error Scenarios
- **Session Not Found**: 404 Not Found
- **Unauthorized User**: 403 Forbidden "Only the Game Master can resume the session"
- **Invalid Status**: 400 Bad Request "Cannot resume from {Status}, must be Paused"
- **Persistence Failure**: 500 Internal Server Error

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**: `Task<GameSession> ResumeAsync(Guid sessionId, Guid userId)`
- **Data Access Patterns**: Repository pattern, single transaction
- **External Integration**: Optional SignalR
- **Performance Requirements**: < 100ms

### Architecture Compliance
- **Layer Responsibilities**: API → Application → Domain → Infrastructure
- **Dependency Direction**: Standard clean architecture flow
- **Interface Abstractions**: IGameSessionStorage
- **KISS Validation**: Simple reverse of pause operation

### Testing Strategy
- **Unit Testing**: Valid transition, authorization, invalid states
- **Integration Testing**: End-to-end API, persistence, SignalR
- **Acceptance Criteria**: See below
- **BDD Scenarios**: Covered in AC

---

## Acceptance Criteria

- **AC-01**: Resume succeeds from Paused
  - **Given**: GameSession Status=Paused, authenticated owner
  - **When**: Resume API called
  - **Then**: Status=InProgress, 200 OK

- **AC-02**: Non-owner cannot resume
  - **Given**: Non-owner user
  - **When**: Resume API called
  - **Then**: 403 Forbidden

- **AC-03**: Invalid status rejected
  - **Given**: Status=Draft
  - **When**: Resume API called
  - **Then**: 400 Bad Request

- **AC-04**: Non-existent session handled
  - **Given**: Invalid SessionId
  - **When**: Resume API called
  - **Then**: 404 Not Found

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: State machine transition (inverse of Pause)
- **Code Organization**: GameSessionService.ResumeAsync()
- **Testing Approach**: Bidirectional transition testing with Pause

### Dependencies
- **Technical Dependencies**: ASP.NET Core, EF Core, auth
- **Area Dependencies**: None
- **External Dependencies**: Optional SignalR

### Architectural Considerations
- **Area Boundary Respect**: Self-contained
- **Interface Design**: Consistent with other status operations
- **Error Handling**: Specific validation messages

---

<!-- Quality Score: 100/100 ✅ -->
