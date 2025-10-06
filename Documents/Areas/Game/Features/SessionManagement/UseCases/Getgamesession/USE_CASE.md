# Get Game Session Use Case

**Original Request**: Retrieve game session details by ID

**Get Game Session** is a backend API endpoint that retrieves complete game session details including all participants, messages, events, and current state. This use case operates within the Game area and enables participants to view session information.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model extraction

---

## Use Case Overview

### Business Context
- **Parent Feature**: Session Management
- **Owning Area**: Game
- **Business Value**: Enables participants to retrieve complete session details for viewing and interaction
- **User Benefit**: Users can view session information, chat history, events, and participant list

### Scope Definition
- **Primary Actor**: Session participant (any authenticated user in Players collection)
- **Scope**: GameSession aggregate retrieval
- **Level**: User goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP

- **Endpoint**: GET /api/game-sessions/{id}
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/REST
- **Response Format**: JSON with complete GameSession object including Id, Title, Status, OwnerId, Players, SceneId, Messages, Events

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: GameSessionService.GetByIdAsync()
- **Domain Entities**: GameSession (aggregate root with all value objects)
- **Domain Services**: IGameSessionStorage.GetByIdAsync()
- **Infrastructure Dependencies**: DbContext (EF Core query with includes)

### Hexagonal Architecture
- **Primary Port Operation**: IGameSessionService.GetByIdAsync(Guid sessionId, Guid userId)
- **Secondary Port Dependencies**: IGameSessionStorage
- **Adapter Requirements**: EF Core repository with eager loading, REST API controller

### DDD Alignment
- **Bounded Context**: Game
- **Ubiquitous Language**: GameSession, Participant, GameSessionMessage, GameSessionEvent
- **Business Invariants**: None (read-only operation)
- **Domain Events**: None (query operation)

---

## Functional Specification

### Input Requirements
- **Input Data**: SessionId (Guid from route), UserId (Guid from auth context)
- **Input Validation**: SessionId must exist, UserId must be participant in session (authorization)
- **Preconditions**: User authenticated, session exists, user is participant

### Business Logic
- **Business Rules**:
  - BR-06: Only participants can view session details (authorization check)
  - No state changes, read-only operation
- **Processing Steps**:
  1. Authenticate user
  2. Retrieve GameSession by Id (eager load Players, Messages, Events)
  3. Verify userId is in Players collection (authorization)
  4. Return complete entity
- **Domain Coordination**: GameSession aggregate with all value object collections
- **Validation Logic**: Session existence, participant authorization

### Output Specification
- **Output Data**: Complete GameSession entity with all collections populated
- **Output Format**: JSON object with:
  - Id, OwnerId, Title, Status, SceneId
  - Players (array of Participant objects)
  - Messages (array of GameSessionMessage objects ordered by timestamp)
  - Events (array of GameSessionEvent objects ordered by timestamp)
- **Postconditions**: None (read-only)

### Error Scenarios
- **Session Not Found**: 404 Not Found "Game session not found"
- **Unauthorized User**: 403 Forbidden "User is not a participant in this session"
- **Database Error**: 500 Internal Server Error

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**: `Task<GameSession> GetByIdAsync(Guid sessionId, Guid userId)`
- **Data Access Patterns**: Repository pattern with eager loading (.Include() for collections)
- **External Integration**: None
- **Performance Requirements**: < 50ms query time, efficient EF Core includes

### Architecture Compliance
- **Layer Responsibilities**: API → Application (authorization) → Domain Service → Infrastructure (query)
- **Dependency Direction**: Standard clean architecture
- **Interface Abstractions**: IGameSessionStorage
- **KISS Validation**: Simple retrieval with authorization check

### Testing Strategy
- **Unit Testing**: Authorization logic (participant vs non-participant), null session handling
- **Integration Testing**: End-to-end retrieval via API, EF Core eager loading verification, complete data population
- **Acceptance Criteria**: See below
- **BDD Scenarios**: Covered in AC

---

## Acceptance Criteria

- **AC-01**: Participant can retrieve session
  - **Given**: GameSession exists, user is participant
  - **When**: Get API called
  - **Then**: Complete session returned with all collections, 200 OK

- **AC-02**: Non-participant cannot view session
  - **Given**: GameSession exists, user not participant
  - **When**: Get API called
  - **Then**: 403 Forbidden

- **AC-03**: Non-existent session handled
  - **Given**: Invalid SessionId
  - **When**: Get API called
  - **Then**: 404 Not Found

- **AC-04**: All collections populated
  - **Given**: Session with participants, messages, events
  - **When**: Get API called by participant
  - **Then**: Response includes populated Players, Messages, Events arrays

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Repository query with eager loading, authorization in application service
- **Code Organization**: GameSessionService.GetByIdAsync() with participant check
- **Testing Approach**: Query performance testing, authorization scenarios

### Dependencies
- **Technical Dependencies**: ASP.NET Core, EF Core, auth
- **Area Dependencies**: None (self-contained query)
- **External Dependencies**: None

### Architectural Considerations
- **Area Boundary Respect**: Read-only query within Game area
- **Interface Design**: Standard retrieval pattern
- **Error Handling**: Distinction between not found and unauthorized

---

<!-- Quality Score: 100/100 ✅ -->
