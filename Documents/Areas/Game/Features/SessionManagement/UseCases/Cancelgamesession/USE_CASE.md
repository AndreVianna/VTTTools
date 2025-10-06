# Cancel Game Session Use Case

**Original Request**: Abort game session before completion

**Cancel Game Session** is a backend API endpoint that transitions a game session to Cancelled status, marking abandonment or abortion of the meeting. This use case operates within the Game area and enables Game Masters to cancel sessions that won't be completed.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model extraction

---

## Use Case Overview

### Business Context
- **Parent Feature**: Session Management
- **Owning Area**: Game
- **Business Value**: Enables Game Masters to abort sessions that won't be completed, distinguishing from finished sessions
- **User Benefit**: GMs can mark sessions as cancelled, preserving history while indicating non-completion

### Scope Definition
- **Primary Actor**: Game Master (session owner)
- **Scope**: GameSession status transition (Any except Finished → Cancelled)
- **Level**: User goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP

- **Endpoint**: PUT /api/game-sessions/{id}/cancel
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/REST
- **Response Format**: JSON with updated GameSession showing Status=Cancelled

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: GameSessionService.CancelAsync()
- **Domain Entities**: GameSession
- **Domain Services**: IGameSessionStorage.UpdateAsync()
- **Infrastructure Dependencies**: DbContext

### Hexagonal Architecture
- **Primary Port Operation**: IGameSessionService.CancelAsync(Guid sessionId, Guid userId)
- **Secondary Port Dependencies**: IGameSessionStorage
- **Adapter Requirements**: EF Core repository, REST API controller

### DDD Alignment
- **Bounded Context**: Game
- **Ubiquitous Language**: GameSession, Cancelled (terminal status), Game Master
- **Business Invariants**: INV-05, BR-05, BR-06, AGG-01, AGG-05
- **Domain Events**: Potential SessionCancelled event

---

## Functional Specification

### Input Requirements
- **Input Data**: SessionId (Guid), UserId (Guid from auth)
- **Input Validation**: SessionId exists, UserId is owner, Status is not Finished
- **Preconditions**: Authenticated owner, Session not already Finished

### Business Logic
- **Business Rules**:
  - BR-05: Valid transitions (any status except Finished → Cancelled)
  - BR-06: GM-only operation
  - INV-05: Status transitions follow lifecycle
  - AGG-01: GM-only modifications
  - AGG-02: Cancelled is terminal like Finished
- **Processing Steps**:
  1. Authenticate and retrieve session
  2. Verify ownership
  3. Verify Status ≠ Finished
  4. Update Status to Cancelled
  5. Persist and return
  6. Optional SignalR broadcast
- **Domain Coordination**: GameSession terminal status transition
- **Validation Logic**: Ownership check, cannot cancel finished session

### Output Specification
- **Output Data**: Updated GameSession with Status=Cancelled
- **Output Format**: JSON object
- **Postconditions**: Status=Cancelled (terminal), session preserved as historical record

### Error Scenarios
- **Session Not Found**: 404 Not Found
- **Unauthorized User**: 403 Forbidden "Only the Game Master can cancel the session"
- **Already Finished**: 400 Bad Request "Cannot cancel finished session"
- **Persistence Failure**: 500 Internal Server Error

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**: `Task<GameSession> CancelAsync(Guid sessionId, Guid userId)`
- **Data Access Patterns**: Repository pattern, single transaction
- **External Integration**: Optional SignalR
- **Performance Requirements**: < 100ms

### Architecture Compliance
- **Layer Responsibilities**: API → Application → Domain → Infrastructure
- **Dependency Direction**: Standard clean architecture
- **Interface Abstractions**: IGameSessionStorage
- **KISS Validation**: Terminal status with single exclusion (not from Finished)

### Testing Strategy
- **Unit Testing**: Valid transitions from Draft/Scheduled/InProgress/Paused, invalid from Finished, authorization
- **Integration Testing**: End-to-end API, persistence
- **Acceptance Criteria**: See below
- **BDD Scenarios**: Covered in AC

---

## Acceptance Criteria

- **AC-01**: Cancel succeeds from Draft
  - **Given**: Status=Draft, authenticated owner
  - **When**: Cancel API called
  - **Then**: Status=Cancelled, 200 OK

- **AC-02**: Cancel succeeds from InProgress
  - **Given**: Status=InProgress, authenticated owner
  - **When**: Cancel API called
  - **Then**: Status=Cancelled, 200 OK

- **AC-03**: Cannot cancel finished session
  - **Given**: Status=Finished, authenticated owner
  - **When**: Cancel API called
  - **Then**: 400 Bad Request "Cannot cancel finished session"

- **AC-04**: Non-owner cannot cancel
  - **Given**: Non-owner user
  - **When**: Cancel API called
  - **Then**: 403 Forbidden

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Terminal status transition with validation
- **Code Organization**: GameSessionService.CancelAsync()
- **Testing Approach**: Multiple source states, single exclusion (Finished)

### Dependencies
- **Technical Dependencies**: ASP.NET Core, EF Core, auth
- **Area Dependencies**: None
- **External Dependencies**: Optional SignalR

### Architectural Considerations
- **Area Boundary Respect**: Self-contained
- **Interface Design**: Terminal status like Finish
- **Error Handling**: Specific error for finished sessions

---

<!-- Quality Score: 100/100 ✅ -->
