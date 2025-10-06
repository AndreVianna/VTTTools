# Delete Schedule Use Case

**Original Request**: Remove schedule from system

**Delete Schedule** is a backend API endpoint that removes a schedule entity. This use case operates within the Game area and enables Game Masters to delete schedules, with the important characteristic that deleting a schedule does not delete already-generated GameSession instances.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model extraction

---

## Use Case Overview

### Business Context
- **Parent Feature**: Schedule Management
- **Owning Area**: Game
- **Business Value**: Enables Game Masters to cancel recurring meeting schedules while preserving generated sessions
- **User Benefit**: GMs can delete schedules without losing historical or upcoming session data

### Scope Definition
- **Primary Actor**: Game Master (schedule owner)
- **Scope**: Schedule aggregate deletion
- **Level**: User goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP

- **Endpoint**: DELETE /api/schedules/{id}
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/REST
- **Response Format**: 204 No Content

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: ScheduleService.DeleteAsync()
- **Domain Entities**: Schedule
- **Domain Services**: IScheduleStorage.DeleteAsync()
- **Infrastructure Dependencies**: DbContext

### Hexagonal Architecture
- **Primary Port Operation**: IScheduleService.DeleteAsync(Guid scheduleId, Guid ownerId)
- **Secondary Port Dependencies**: IScheduleStorage
- **Adapter Requirements**: EF Core repository, REST API controller

### DDD Alignment
- **Bounded Context**: Game
- **Ubiquitous Language**: Schedule, Game Master
- **Business Invariants**: AGG-06 (GM-only), AGG-08 (deleting schedule doesn't delete sessions)
- **Domain Events**: None (deletion)

---

## Functional Specification

### Input Requirements
- **Input Data**: ScheduleId (Guid), OwnerId (Guid from auth)
- **Input Validation**: ScheduleId exists, OwnerId is schedule owner
- **Preconditions**: Authenticated owner, schedule exists

### Business Logic
- **Business Rules**:
  - BR-14: Deleting Schedule does not delete generated GameSessions (AGG-08)
  - AGG-06: Schedule can only be modified by owner
  - Generated GameSessions remain independent after schedule deletion
- **Processing Steps**:
  1. Authenticate and retrieve schedule
  2. Verify ownership
  3. Delete via IScheduleStorage.DeleteAsync()
  4. Return 204 No Content
  5. NOTE: Generated GameSessions are NOT deleted (BR-14, AGG-08)
- **Domain Coordination**: Schedule deletion independent of GameSessions
- **Validation Logic**: Ownership check

### Output Specification
- **Output Data**: None (204 No Content)
- **Output Format**: Empty response
- **Postconditions**: Schedule removed, generated GameSessions remain in system (independent aggregates)

### Error Scenarios
- **Schedule Not Found**: 404 Not Found
- **Unauthorized**: 403 Forbidden "Only owner can delete schedule"
- **Persistence Failure**: 500 Internal Server Error

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**: `Task DeleteAsync(Guid scheduleId, Guid ownerId)`
- **Data Access Patterns**: Repository delete (schedule only, not sessions)
- **External Integration**: None
- **Performance Requirements**: < 100ms

### Architecture Compliance
- **Layer Responsibilities**: API → Application → Domain Service → Infrastructure
- **Dependency Direction**: Standard
- **Interface Abstractions**: IScheduleStorage
- **KISS Validation**: Simple delete with ownership check, no cascade to GameSessions

### Testing Strategy
- **Unit Testing**: Ownership validation
- **Integration Testing**: Deletion doesn't cascade to GameSessions (BR-14, AGG-08)
- **Acceptance Criteria**: See below
- **BDD Scenarios**: Covered in AC

---

## Acceptance Criteria

- **AC-01**: Owner can delete schedule
  - **Given**: Schedule exists, authenticated owner
  - **When**: Delete API called
  - **Then**: Schedule deleted, 204 No Content

- **AC-02**: Non-owner cannot delete
  - **Given**: Non-owner user
  - **When**: Delete API called
  - **Then**: 403 Forbidden

- **AC-03**: Non-existent schedule handled
  - **Given**: Invalid ScheduleId
  - **When**: Delete API called
  - **Then**: 404 Not Found

- **AC-04**: Generated sessions not deleted
  - **Given**: Schedule with 3 generated GameSessions
  - **When**: Delete schedule API called
  - **Then**: Schedule deleted, 3 GameSessions remain in system (BR-14, AGG-08)

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Simple deletion, no cascade to GameSessions
- **Code Organization**: ScheduleService.DeleteAsync()
- **Testing Approach**: Verify GameSession independence (AG G-08)

### Dependencies
- **Technical Dependencies**: ASP.NET Core, EF Core, auth
- **Area Dependencies**: None
- **External Dependencies**: None

### Architectural Considerations
- **Area Boundary Respect**: Schedule and GameSession as independent aggregates
- **Interface Design**: Standard delete pattern
- **Error Handling**: Ownership validation

---

<!-- Quality Score: 100/100 ✅ -->
