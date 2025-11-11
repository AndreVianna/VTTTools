# Create Game Session Use Case

**Original Request**: Create new game session with GM as owner

**Create Game Session** is a backend API endpoint that initializes a new game session entity with the Game Master as owner and Master participant. This use case operates within the Game area and enables Game Masters to start organizing a new tabletop RPG meeting.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model extraction

---

## Use Case Overview

### Business Context
- **Parent Feature**: Session Management
- **Owning Area**: Game
- **Business Value**: Enables Game Masters to initiate new game sessions for organizing tabletop RPG meetings
- **User Benefit**: GMs can create sessions with a title and automatically be assigned as the Game Master participant

### Scope Definition
- **Primary Actor**: Game Master (authenticated user)
- **Scope**: GameSession aggregate initialization
- **Level**: User goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP

- **Endpoint**: POST /api/game-sessions
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/REST
- **Response Format**: JSON with created GameSession object including Id, Title, Status, OwnerId, Players collection

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: GameSessionService.CreateAsync()
- **Domain Entities**: GameSession (aggregate root), Participant (value object)
- **Domain Services**: IGameSessionStorage.CreateAsync()
- **Infrastructure Dependencies**: DbContext (EF Core persistence), User service (owner validation)

### Hexagonal Architecture
- **Primary Port Operation**: IGameSessionService.CreateAsync(string title, Guid ownerId)
- **Secondary Port Dependencies**: IGameSessionStorage (persistence), IUserService (owner existence validation)
- **Adapter Requirements**: EF Core repository adapter, REST API controller adapter

### DDD Alignment
- **Bounded Context**: Game
- **Ubiquitous Language**: GameSession, Game Master, Master (role), Draft (initial status), Participant
- **Business Invariants**: INV-01 (title not empty), INV-02 (title ≤ 128 chars), INV-03 (at least GM as Master), INV-04 (only one Master)
- **Domain Events**: None (session created in Draft state, not yet started)

---

## Functional Specification

### Input Requirements
- **Input Data**: Title (string), OwnerId (Guid - from authentication context)
- **Input Validation**:
  - Title must not be empty or whitespace (INV-01)
  - Title must not exceed 128 characters (INV-02)
  - OwnerId must reference existing User
- **Preconditions**: User must be authenticated, User must exist in system

### Business Logic
- **Business Rules**:
  - BR-01: Title must not be empty
  - BR-02: Title max length 128 characters
  - BR-03: Session must have at least one participant (GM as Master)
  - BR-04: Only one participant can be Master
  - BR-08: OwnerId must reference existing User
- **Processing Steps**:
  1. Validate user authentication and existence
  2. Validate title (not empty, length ≤ 128)
  3. Create GameSession entity with Status=Draft
  4. Generate new GuidV7 for Id
  5. Create Participant with UserId=OwnerId, PlayerType=Master, JoinedAt=Now
  6. Add participant to Players collection
  7. Persist via IGameSessionStorage.CreateAsync()
  8. Return created entity
- **Domain Coordination**: GameSession aggregate with Participant value object
- **Validation Logic**: Title validation (required, length), Owner existence check, Master role assignment

### Output Specification
- **Output Data**: GameSession entity with all properties
- **Output Format**: JSON object with Id, OwnerId, Title, Status (Draft), Players (GM as Master), EncounterId (null), Messages (empty), Events (empty)
- **Postconditions**: GameSession persisted with Status=Draft, Owner added to Players as Master, entity retrievable by Id

### Error Scenarios
- **Invalid Title (Empty)**: Return 400 Bad Request with validation error "Title must not be empty" (INV-01)
- **Invalid Title (Too Long)**: Return 400 Bad Request with validation error "Title must not exceed 128 characters" (INV-02)
- **Owner Not Found**: Return 404 Not Found with error "User not found" or 401 Unauthorized if authentication fails (BR-08)
- **Persistence Failure**: Return 500 Internal Server Error with message "Failed to create game session"
- **Duplicate Master**: Not applicable for creation (only GM added initially)

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
```csharp
public interface IGameSessionService
{
    Task<GameSession> CreateAsync(string title, Guid ownerId);
}
```
- **Data Access Patterns**: Repository pattern via IGameSessionStorage, single create transaction
- **External Integration**: User service for owner validation
- **Performance Requirements**: < 100ms response time, single database transaction

### Architecture Compliance
- **Layer Responsibilities**:
  - API Controller: Request parsing, authentication context extraction, response formatting
  - Application Service: Orchestration, validation, business rule enforcement
  - Domain Service: Persistence operation
  - Infrastructure: EF Core entity persistence
- **Dependency Direction**: API → Application → Domain ← Infrastructure
- **Interface Abstractions**: IGameSessionStorage abstracts persistence, IUserService abstracts user operations
- **KISS Validation**: Simple creation flow, no complex orchestration, single aggregate operation

### Testing Strategy
- **Unit Testing**:
  - Test title validation (empty, too long, valid)
  - Test Master participant auto-assignment
  - Test Status=Draft initialization
  - Test owner existence validation
- **Integration Testing**:
  - Test end-to-end creation via API endpoint
  - Test EF Core persistence
  - Test database constraints (foreign keys)
- **Acceptance Criteria**:
  - AC-01: Valid creation succeeds
  - AC-02: Invalid titles rejected
  - AC-03: GM automatically assigned as Master
- **BDD Scenarios**: Covered in acceptance criteria

---

## Acceptance Criteria

- **AC-01**: Session creation succeeds with valid inputs
  - **Given**: Valid title "Weekly D&D Campaign" and authenticated GM user
  - **When**: Create Game Session API called
  - **Then**: GameSession created with Status=Draft, OwnerId set, GM added as Master participant, Id generated, entity persisted

- **AC-02**: Empty title rejected
  - **Given**: Empty string title and authenticated user
  - **When**: Create Game Session API called
  - **Then**: 400 Bad Request returned with validation error "Title must not be empty"

- **AC-03**: Title too long rejected
  - **Given**: Title with 129 characters and authenticated user
  - **When**: Create Game Session API called
  - **Then**: 400 Bad Request returned with validation error "Title must not exceed 128 characters"

- **AC-04**: Non-existent owner rejected
  - **Given**: Invalid or deleted OwnerId in request
  - **When**: Create Game Session API called
  - **Then**: 404 Not Found or 401 Unauthorized returned with error "User not found"

- **AC-05**: GM automatically assigned as Master
  - **Given**: Valid title and authenticated GM
  - **When**: Create Game Session API called
  - **Then**: Created session has Players collection with single Participant (OwnerId, PlayerType=Master, JoinedAt=Now)

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: DDD Contracts + Service Implementation, anemic GameSession entity with initialization logic in application service
- **Code Organization**:
  - API: Controllers/GameSessionController.cs
  - Application: Services/GameSessionService.cs
  - Domain: Entities/GameSession.cs, ValueObjects/Participant.cs, Services/IGameSessionStorage.cs
  - Infrastructure: Persistence/GameSessionRepository.cs
- **Testing Approach**: TDD with unit tests first, integration tests for persistence, API tests for end-to-end validation

### Dependencies
- **Technical Dependencies**: ASP.NET Core Web API, EF Core, authentication middleware
- **Area Dependencies**: Identity context (User entity for OwnerId validation)
- **External Dependencies**: None

### Architectural Considerations
- **Area Boundary Respect**: GameSession remains within Game bounded context, User reference via foreign key only
- **Interface Design**: Clean separation via IGameSessionStorage and IGameSessionService
- **Error Handling**: Comprehensive validation with specific error messages for each failure scenario

---

This Create Game Session use case provides comprehensive implementation guidance for session initialization within the Game area while maintaining architectural integrity and aggregate consistency.

<!--
═══════════════════════════════════════════════════════════════
USE CASE SPECIFICATION QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════

## Business Context (20 points)
✅ 5pts: Parent feature clearly identified (Session Management)
✅ 5pts: Owning area correctly assigned (Game)
✅ 5pts: Business value explicitly stated
✅ 5pts: Primary actor and scope defined

## Architecture Integration (30 points)
✅ 10pts: Clean Architecture mapping complete
✅ 10pts: Hexagonal Architecture elements defined
✅ 5pts: DDD alignment documented
✅ 5pts: Infrastructure dependencies identified
✅ UI type specified: API_ENDPOINT
✅ Endpoint documented: POST /api/game-sessions

## Functional Specification (30 points)
✅ 5pts: Input requirements fully specified
✅ 5pts: Business rules clearly documented (BR-01, BR-02, BR-03, BR-04, BR-08)
✅ 5pts: Processing steps detailed (8 steps)
✅ 5pts: Output specification complete
✅ 5pts: Error scenarios comprehensive (5 scenarios)
✅ 5pts: Preconditions and postconditions explicit

## Implementation Guidance (20 points)
✅ 5pts: Interface contract defined
✅ 5pts: Testing strategy includes unit, integration, acceptance
✅ 5pts: Acceptance criteria in Given/When/Then format (5 criteria)
✅ 5pts: Architecture compliance validated

## Target Score: 100/100 ✅
-->
