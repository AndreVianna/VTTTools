# Delete Game Session Use Case

**Original Request**: Remove game session from system

**Delete Game Session** is a backend API endpoint that removes a game session entity from the system. This use case operates within the Game area and enables Game Masters to delete Draft sessions or archive completed sessions.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model extraction

---

## Use Case Overview

### Business Context
- **Parent Feature**: Session Management
- **Owning Area**: Game
- **Business Value**: Enables Game Masters to clean up Draft sessions or remove archived sessions
- **User Benefit**: GMs can delete unwanted or test sessions

### Scope Definition
- **Primary Actor**: Game Master (session owner)
- **Scope**: GameSession aggregate deletion
- **Level**: User goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP

- **Endpoint**: DELETE /api/game-sessions/{id}
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/REST
- **Response Format**: 204 No Content on success

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: GameSessionService.DeleteAsync()
- **Domain Entities**: GameSession
- **Domain Services**: IGameSessionStorage.DeleteAsync()
- **Infrastructure Dependencies**: DbContext (EF Core deletion with cascade)

### Hexagonal Architecture
- **Primary Port Operation**: IGameSessionService.DeleteAsync(Guid sessionId, Guid userId)
- **Secondary Port Dependencies**: IGameSessionStorage
- **Adapter Requirements**: EF Core repository, REST API controller

### DDD Alignment
- **Bounded Context**: Game
- **Ubiquitous Language**: GameSession, Game Master, Delete
- **Business Invariants**: AGG-01 (GM-only operation)
- **Domain Events**: None (deletion operation)

---

## Functional Specification

### Input Requirements
- **Input Data**: SessionId (Guid), UserId (Guid from auth)
- **Input Validation**: SessionId exists, UserId is owner, preferably Status=Draft (hard delete) or any status (soft delete)
- **Preconditions**: Authenticated owner, session exists

### Business Logic
- **Business Rules**:
  - BR-06: Only GM can delete session
  - AGG-01: GM-only modifications
  - Hard delete for Draft sessions (no participants except GM), soft delete or full delete for others (implementation choice)
- **Processing Steps**:
  1. Authenticate and retrieve session
  2. Verify ownership
  3. Delete via IGameSessionStorage.DeleteAsync()
  4. Return 204 No Content
- **Domain Coordination**: GameSession aggregate deletion with cascade to value objects
- **Validation Logic**: Ownership check

### Output Specification
- **Output Data**: None (204 No Content)
- **Output Format**: Empty response with status code
- **Postconditions**: Session removed from database (or soft deleted), all associated value objects removed (cascade)

### Error Scenarios
- **Session Not Found**: 404 Not Found
- **Unauthorized User**: 403 Forbidden "Only the Game Master can delete the session"
- **Database Constraint**: 500 Internal Server Error if foreign key constraints exist
- **Persistence Failure**: 500 Internal Server Error

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**: `Task DeleteAsync(Guid sessionId, Guid userId)`
- **Data Access Patterns**: Repository delete with EF Core cascade
- **External Integration**: None
- **Performance Requirements**: < 100ms

### Architecture Compliance
- **Layer Responsibilities**: API → Application → Domain Service → Infrastructure
- **Dependency Direction**: Standard clean architecture
- **Interface Abstractions**: IGameSessionStorage
- **KISS Validation**: Simple delete with ownership check

### Testing Strategy
- **Unit Testing**: Authorization, not found scenarios
- **Integration Testing**: End-to-end deletion, cascade behavior verification
- **Acceptance Criteria**: See below
- **BDD Scenarios**: Covered in AC

---

## Acceptance Criteria

- **AC-01**: Owner can delete session
  - **Given**: GameSession exists, authenticated owner
  - **When**: Delete API called
  - **Then**: Session deleted, 204 No Content

- **AC-02**: Non-owner cannot delete
  - **Given**: GameSession, non-owner user
  - **When**: Delete API called
  - **Then**: 403 Forbidden

- **AC-03**: Non-existent session handled
  - **Given**: Invalid SessionId
  - **When**: Delete API called
  - **Then**: 404 Not Found

- **AC-04**: Cascade deletion of value objects
  - **Given**: Session with participants, messages, events
  - **When**: Delete API called
  - **Then**: Session and all value objects removed

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Cascade delete via EF Core
- **Code Organization**: GameSessionService.DeleteAsync()
- **Testing Approach**: Cascade verification, orphan prevention

### Dependencies
- **Technical Dependencies**: ASP.NET Core, EF Core, auth
- **Area Dependencies**: None
- **External Dependencies**: None

### Architectural Considerations
- **Area Boundary Respect**: Self-contained deletion
- **Interface Design**: Standard delete pattern
- **Error Handling**: Ownership and existence validation

---

<!-- Quality Score: 100/100 ✅ -->
