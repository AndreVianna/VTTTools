# Set Active Encounter Use Case

**Original Request**: Assign or change active encounter for game session

**Set Active Encounter** is a backend API endpoint that updates the EncounterId property of a game session, associating a tactical map/encounter from the Library context with the active session. This use case operates within the Game area and enables Game Masters to display encounters during gameplay.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model extraction

---

## Use Case Overview

### Business Context
- **Parent Feature**: Session Management
- **Owning Area**: Game
- **Business Value**: Enables Game Masters to link tactical maps/encounters to active sessions for visual gameplay
- **User Benefit**: GMs can assign encounters to sessions, enabling tactical map display and interaction

### Scope Definition
- **Primary Actor**: Game Master (session owner)
- **Scope**: GameSession.EncounterId property update
- **Level**: User goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP

- **Endpoint**: PUT /api/game-sessions/{id}/encounter
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/REST
- **Response Format**: JSON with updated GameSession object showing new EncounterId

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: GameSessionService.SetActiveEncounterAsync()
- **Domain Entities**: GameSession (aggregate root)
- **Domain Services**: IGameSessionStorage.UpdateAsync(), IEncounterStorage (encounter validation)
- **Infrastructure Dependencies**: DbContext, Encounter validation service

### Hexagonal Architecture
- **Primary Port Operation**: IGameSessionService.SetActiveEncounterAsync(Guid sessionId, Guid? encounterId, Guid userId)
- **Secondary Port Dependencies**: IGameSessionStorage, IEncounterStorage (for encounter existence validation)
- **Adapter Requirements**: EF Core repository, REST API controller, encounter validation adapter

### DDD Alignment
- **Bounded Context**: Game (references Library context for Encounter)
- **Ubiquitous Language**: GameSession, Encounter (from Library), Active Encounter
- **Business Invariants**: INV-06 (EncounterId must reference existing Encounter if provided), AGG-01 (GM-only), AGG-05 (GM can set encounter)
- **Domain Events**: Potential EncounterChanged event for real-time updates

---

## Functional Specification

### Input Requirements
- **Input Data**: SessionId (Guid), EncounterId (Guid?, nullable to clear encounter), UserId (Guid from auth)
- **Input Validation**:
  - SessionId must exist
  - UserId must be session owner
  - EncounterId must reference existing Encounter if provided (not null)
  - EncounterId can be null to clear active encounter
- **Preconditions**: Authenticated owner, session exists, encounter exists (if provided)

### Business Logic
- **Business Rules**:
  - BR-06: Only GM can set active encounter
  - BR-07: EncounterId must reference existing Encounter if provided
  - INV-06: Encounter reference validation
  - AGG-01: GM-only modifications
  - AGG-05: GM can set encounter
- **Processing Steps**:
  1. Authenticate and retrieve session
  2. Verify ownership (UserId == OwnerId)
  3. If EncounterId provided (not null), validate Encounter exists via IEncounterStorage
  4. Update GameSession.EncounterId
  5. Persist via IGameSessionStorage.UpdateAsync()
  6. Return updated entity
  7. Optional SignalR broadcast EncounterChanged event
- **Domain Coordination**: GameSession references Encounter from Library context (foreign key relationship)
- **Validation Logic**: Ownership check, encounter existence validation (cross-context validation)

### Output Specification
- **Output Data**: Updated GameSession with new EncounterId
- **Output Format**: JSON object with EncounterId property updated
- **Postconditions**: GameSession.EncounterId updated, encounter available for tactical map display

### Error Scenarios
- **Session Not Found**: 404 Not Found "Game session not found"
- **Unauthorized User**: 403 Forbidden "Only the Game Master can set the active encounter"
- **Encounter Not Found**: 404 Not Found "Encounter not found" (if EncounterId provided and doesn't exist)
- **Invalid Foreign Key**: 400 Bad Request if database constraint violation
- **Persistence Failure**: 500 Internal Server Error

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**: `Task<GameSession> SetActiveEncounterAsync(Guid sessionId, Guid? encounterId, Guid userId)`
- **Data Access Patterns**: Repository update with cross-context validation
- **External Integration**: IEncounterStorage from Library context for encounter validation
- **Performance Requirements**: < 100ms, foreign key constraint enforced at database level

### Architecture Compliance
- **Layer Responsibilities**:
  - API Controller: Request parsing, response formatting
  - Application Service: Authorization, cross-context validation, orchestration
  - Domain Service: Persistence operation
  - Infrastructure: EF Core update, foreign key constraint
- **Dependency Direction**: Game → Library (reference via EncounterId foreign key)
- **Interface Abstractions**: IGameSessionStorage, IEncounterStorage
- **KISS Validation**: Simple property update with validation

### Testing Strategy
- **Unit Testing**: Authorization, encounter validation (exists vs not found), null encounter handling
- **Integration Testing**: Cross-context validation, foreign key constraints, end-to-end API
- **Acceptance Criteria**: See below
- **BDD Scenarios**: Covered in AC

---

## Acceptance Criteria

- **AC-01**: GM can set active encounter
  - **Given**: GameSession exists, valid Encounter exists, authenticated owner
  - **When**: Set Active Encounter API called with EncounterId
  - **Then**: GameSession.EncounterId updated, 200 OK

- **AC-02**: GM can clear active encounter
  - **Given**: GameSession with EncounterId set, authenticated owner
  - **When**: Set Active Encounter API called with null EncounterId
  - **Then**: GameSession.EncounterId set to null, 200 OK

- **AC-03**: Non-owner cannot set encounter
  - **Given**: GameSession, non-owner user
  - **When**: Set Active Encounter API called
  - **Then**: 403 Forbidden

- **AC-04**: Invalid encounter rejected
  - **Given**: GameSession exists, EncounterId references non-existent encounter
  - **When**: Set Active Encounter API called
  - **Then**: 404 Not Found "Encounter not found"

- **AC-05**: Non-existent session handled
  - **Given**: Invalid SessionId
  - **When**: Set Active Encounter API called
  - **Then**: 404 Not Found "Game session not found"

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Cross-context reference via foreign key, validation in application service
- **Code Organization**: GameSessionService.SetActiveEncounterAsync() with IEncounterStorage dependency
- **Testing Approach**: Cross-context validation, foreign key constraints, null handling

### Dependencies
- **Technical Dependencies**: ASP.NET Core, EF Core, auth
- **Area Dependencies**: Library context (Encounter entity via IEncounterStorage)
- **External Dependencies**: Optional SignalR for EncounterChanged event

### Architectural Considerations
- **Area Boundary Respect**: Game references Library via foreign key, no direct entity reference
- **Interface Design**: Cross-context validation via domain service interface
- **Error Handling**: Distinct errors for session not found vs encounter not found vs unauthorized

---

<!-- Quality Score: 100/100 ✅ -->
