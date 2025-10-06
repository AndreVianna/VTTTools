# List Game Sessions By Owner Use Case

**Original Request**: Retrieve all game sessions owned by a Game Master

**List Game Sessions By Owner** is a backend API endpoint that queries all game sessions where a specific user is the owner (Game Master). This use case operates within the Game area and enables Game Masters to view all their sessions.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model extraction

---

## Use Case Overview

### Business Context
- **Parent Feature**: Session Management
- **Owning Area**: Game
- **Business Value**: Enables Game Masters to view comprehensive list of all their sessions across all statuses
- **User Benefit**: GMs can see all their game sessions for management and selection

### Scope Definition
- **Primary Actor**: Game Master (authenticated user)
- **Scope**: GameSession collection query filtered by OwnerId
- **Level**: User goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP

- **Endpoint**: GET /api/game-sessions/by-owner/{ownerId} or GET /api/users/{ownerId}/game-sessions
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/REST
- **Response Format**: JSON array of GameSession objects (may include lite version without full messages/events for performance)

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: GameSessionService.GetByOwnerAsync()
- **Domain Entities**: GameSession (collection)
- **Domain Services**: IGameSessionStorage.GetByOwnerAsync()
- **Infrastructure Dependencies**: DbContext (EF Core query)

### Hexagonal Architecture
- **Primary Port Operation**: IGameSessionService.GetByOwnerAsync(Guid ownerId, Guid requestingUserId)
- **Secondary Port Dependencies**: IGameSessionStorage
- **Adapter Requirements**: EF Core repository with filtering, REST API controller

### DDD Alignment
- **Bounded Context**: Game
- **Ubiquitous Language**: GameSession, Game Master, Owner
- **Business Invariants**: None (read-only query)
- **Domain Events**: None (query operation)

---

## Functional Specification

### Input Requirements
- **Input Data**: OwnerId (Guid from route or auth context), RequestingUserId (Guid from auth)
- **Input Validation**: OwnerId exists, requesting user is owner or has admin rights (authorization)
- **Preconditions**: User authenticated, optionally OwnerId = authenticated user for privacy

### Business Logic
- **Business Rules**:
  - Users can query their own sessions (OwnerId = authenticated UserId)
  - Optional admin access to query any owner's sessions
- **Processing Steps**:
  1. Authenticate user
  2. Authorize (RequestingUserId == OwnerId or admin)
  3. Query sessions WHERE OwnerId = {ownerId}
  4. Return collection (optionally without full message/event history for performance)
- **Domain Coordination**: GameSession collection query
- **Validation Logic**: Authorization check

### Output Specification
- **Output Data**: Array of GameSession entities
- **Output Format**: JSON array with session summaries or full objects
- **Postconditions**: None (read-only)

---

## Functional Specification (continued)

### Error Scenarios
- **Unauthorized User**: 403 Forbidden if requesting user ≠ owner and not admin
- **Owner Not Found**: 404 Not Found or empty array
- **Database Error**: 500 Internal Server Error

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**: `Task<IEnumerable<GameSession>> GetByOwnerAsync(Guid ownerId, Guid requestingUserId)`
- **Data Access Patterns**: Repository query with WHERE filter, optional pagination
- **External Integration**: None
- **Performance Requirements**: < 100ms, indexed OwnerId column, optional pagination for large result sets

### Architecture Compliance
- **Layer Responsibilities**: API → Application (authorization) → Domain Service → Infrastructure (query)
- **Dependency Direction**: Standard clean architecture
- **Interface Abstractions**: IGameSessionStorage
- **KISS Validation**: Simple filtered query

### Testing Strategy
- **Unit Testing**: Authorization logic, empty results
- **Integration Testing**: Query correctness, filtering, pagination
- **Acceptance Criteria**: See below
- **BDD Scenarios**: Covered in AC

---

## Acceptance Criteria

- **AC-01**: Owner can retrieve their sessions
  - **Given**: GM has 3 sessions, authenticated as owner
  - **When**: List API called with their OwnerId
  - **Then**: Array of 3 sessions returned, 200 OK

- **AC-02**: Non-owner cannot query others' sessions
  - **Given**: Requesting user ≠ OwnerId, not admin
  - **When**: List API called
  - **Then**: 403 Forbidden

- **AC-03**: Empty result for no sessions
  - **Given**: Owner has no sessions
  - **When**: List API called
  - **Then**: Empty array returned, 200 OK

- **AC-04**: Sessions filtered correctly
  - **Given**: Multiple sessions in database
  - **When**: List API called with specific OwnerId
  - **Then**: Only sessions with matching OwnerId returned

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Repository query with filtering
- **Code Organization**: GameSessionService.GetByOwnerAsync()
- **Testing Approach**: Query correctness, authorization, performance

### Dependencies
- **Technical Dependencies**: ASP.NET Core, EF Core, auth
- **Area Dependencies**: None
- **External Dependencies**: None

### Architectural Considerations
- **Area Boundary Respect**: Self-contained query
- **Interface Design**: Standard collection query
- **Error Handling**: Authorization vs not found distinction

---

<!-- Quality Score: 100/100 ✅ -->
