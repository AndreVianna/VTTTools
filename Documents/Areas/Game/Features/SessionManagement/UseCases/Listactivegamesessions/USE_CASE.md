# List Active Game Sessions Use Case

**Original Request**: Retrieve all currently active game sessions

**List Active Game Sessions** is a backend API endpoint that queries all game sessions with Status=InProgress, enabling discovery of ongoing gameplay sessions. This use case operates within the Game area and enables users to find active sessions they may join or observe.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model extraction

---

## Use Case Overview

### Business Context
- **Parent Feature**: Session Management
- **Owning Area**: Game
- **Business Value**: Enables discovery of active game sessions for participant joining or system monitoring
- **User Benefit**: Users can find ongoing sessions, admins can monitor active gameplay

### Scope Definition
- **Primary Actor**: Any authenticated user or admin
- **Scope**: GameSession collection query filtered by Status=InProgress
- **Level**: User goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP

- **Endpoint**: GET /api/game-sessions/active
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/REST
- **Response Format**: JSON array of GameSession objects with Status=InProgress

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: GameSessionService.GetActiveSessionsAsync()
- **Domain Entities**: GameSession (collection)
- **Domain Services**: IGameSessionStorage.GetActiveSessionsAsync()
- **Infrastructure Dependencies**: DbContext (EF Core query with status filter)

### Hexagonal Architecture
- **Primary Port Operation**: IGameSessionService.GetActiveSessionsAsync()
- **Secondary Port Dependencies**: IGameSessionStorage
- **Adapter Requirements**: EF Core repository, REST API controller

### DDD Alignment
- **Bounded Context**: Game
- **Ubiquitous Language**: GameSession, InProgress (active status)
- **Business Invariants**: None (read-only)
- **Domain Events**: None (query)

---

## Functional Specification

### Input Requirements
- **Input Data**: None (or optional pagination parameters)
- **Input Validation**: None (public query or authenticated user)
- **Preconditions**: Optionally user authenticated (based on privacy requirements)

### Business Logic
- **Business Rules**: Query sessions WHERE Status = InProgress
- **Processing Steps**:
  1. Query sessions with Status=InProgress
  2. Return collection (optionally without full messages/events)
  3. Optional ordering by start time or last activity
- **Domain Coordination**: GameSession collection query
- **Validation Logic**: None (simple filter)

### Output Specification
- **Output Data**: Array of GameSession entities with Status=InProgress
- **Output Format**: JSON array
- **Postconditions**: None (read-only)

### Error Scenarios
- **No Active Sessions**: Empty array, 200 OK
- **Database Error**: 500 Internal Server Error

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**: `Task<IEnumerable<GameSession>> GetActiveSessionsAsync()`
- **Data Access Patterns**: Repository query with status filter, indexed Status column
- **External Integration**: None
- **Performance Requirements**: < 100ms, pagination recommended

### Architecture Compliance
- **Layer Responsibilities**: API → Application → Domain Service → Infrastructure (query)
- **Dependency Direction**: Standard clean architecture
- **Interface Abstractions**: IGameSessionStorage
- **KISS Validation**: Simple status filter query

### Testing Strategy
- **Unit Testing**: Query logic, empty results
- **Integration Testing**: Status filtering correctness, performance
- **Acceptance Criteria**: See below
- **BDD Scenarios**: Covered in AC

---

## Acceptance Criteria

- **AC-01**: Returns only InProgress sessions
  - **Given**: 5 sessions (2 InProgress, 2 Draft, 1 Finished)
  - **When**: List Active API called
  - **Then**: Array of 2 InProgress sessions returned

- **AC-02**: Empty result when no active sessions
  - **Given**: No sessions with Status=InProgress
  - **When**: List Active API called
  - **Then**: Empty array, 200 OK

- **AC-03**: Excludes paused sessions
  - **Given**: Sessions with Paused status
  - **When**: List Active API called
  - **Then**: Paused sessions not included (only InProgress)

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Repository query with status filter
- **Code Organization**: GameSessionService.GetActiveSessionsAsync()
- **Testing Approach**: Filter correctness, performance testing

### Dependencies
- **Technical Dependencies**: ASP.NET Core, EF Core
- **Area Dependencies**: None
- **External Dependencies**: None

### Architectural Considerations
- **Area Boundary Respect**: Self-contained query
- **Interface Design**: Simple public query
- **Error Handling**: Graceful empty results

---

<!-- Quality Score: 100/100 ✅ -->
