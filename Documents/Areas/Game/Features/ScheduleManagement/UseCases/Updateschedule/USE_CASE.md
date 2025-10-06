# Update Schedule Use Case

**Original Request**: Modify schedule properties

**Update Schedule** is a backend API endpoint that modifies schedule properties including start time, duration, participants, and recurrence pattern. This use case operates within the Game area and enables Game Masters to adjust scheduled meetings.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model extraction

---

## Use Case Overview

### Business Context
- **Parent Feature**: Schedule Management
- **Owning Area**: Game
- **Business Value**: Enables Game Masters to adjust meeting schedules as campaign needs change
- **User Benefit**: GMs can modify timing, duration, participants, and recurrence patterns

### Scope Definition
- **Primary Actor**: Game Master (schedule owner)
- **Scope**: Schedule aggregate modification
- **Level**: User goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP

- **Endpoint**: PUT /api/schedules/{id}
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/REST
- **Response Format**: JSON with updated Schedule object

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: ScheduleService.UpdateAsync()
- **Domain Entities**: Schedule (aggregate root), Participant, Recurrence
- **Domain Services**: IScheduleStorage.UpdateAsync()
- **Infrastructure Dependencies**: DbContext, User service (if participants changed)

### Hexagonal Architecture
- **Primary Port Operation**: IScheduleService.UpdateAsync(Guid scheduleId, UpdateScheduleDto dto, Guid ownerId)
- **Secondary Port Dependencies**: IScheduleStorage, IUserService (optional for participant validation)
- **Adapter Requirements**: EF Core repository, REST API controller

### DDD Alignment
- **Bounded Context**: Game
- **Ubiquitous Language**: Schedule, Game Master, Recurrence
- **Business Invariants**: INV-07, INV-08, INV-09, INV-10, AGG-06 (GM-only modifications)
- **Domain Events**: None (or potential ScheduleUpdated event)

---

## Functional Specification

### Input Requirements
- **Input Data**: ScheduleId, Start?, Duration?, ParticipantUserIds?, Recurrence?, OwnerId (from auth)
- **Input Validation**: Same as Create (INV-07 through INV-10), owner authorization
- **Preconditions**: Authenticated owner, schedule exists

### Business Logic
- **Business Rules**: BR-11, BR-12, BR-13, INV-07 through INV-10, AGG-06
- **Processing Steps**:
  1. Authenticate and retrieve schedule
  2. Verify ownership
  3. Validate new values (same rules as Create)
  4. Update properties
  5. Persist
- **Domain Coordination**: Schedule aggregate update
- **Validation Logic**: Ownership, invariant validation

### Output Specification
- **Output Data**: Updated Schedule
- **Output Format**: JSON object
- **Postconditions**: Schedule updated, invariants maintained

### Error Scenarios
- **Schedule Not Found**: 404 Not Found
- **Unauthorized**: 403 Forbidden "Only owner can update"
- **Invalid Values**: 400 Bad Request (same as Create - INV-07 through INV-10)
- **Persistence Failure**: 500 Internal Server Error

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**: `Task<Schedule> UpdateAsync(Guid id, UpdateScheduleDto dto, Guid ownerId)`
- **Data Access Patterns**: Retrieve-modify-persist
- **External Integration**: IUserService (if participants changed)
- **Performance Requirements**: < 100ms

### Architecture Compliance
- **Layer Responsibilities**: API → Application → Domain Service → Infrastructure
- **Dependency Direction**: Standard
- **Interface Abstractions**: IScheduleStorage, IUserService
- **KISS Validation**: Reuse Create validation logic

### Testing Strategy
- **Unit Testing**: Ownership check, invariant validation
- **Integration Testing**: End-to-end update, persistence
- **Acceptance Criteria**: See below
- **BDD Scenarios**: Covered in AC

---

## Acceptance Criteria

- **AC-01**: Owner can update start time
  - **Given**: Valid future start, authenticated owner
  - **When**: Update API called
  - **Then**: Schedule.Start updated, 200 OK

- **AC-02**: Owner can update recurrence
  - **Given**: New valid recurrence pattern
  - **When**: Update API called
  - **Then**: Recurrence updated

- **AC-03**: Non-owner cannot update
  - **Given**: Non-owner user
  - **When**: Update API called
  - **Then**: 403 Forbidden (AGG-06)

- **AC-04**: Invalid values rejected
  - **Given**: Past start date or negative duration
  - **When**: Update API called
  - **Then**: 400 Bad Request (INV-07, INV-08)

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Standard update with validation
- **Code Organization**: ScheduleService.UpdateAsync()
- **Testing Approach**: Reuse Create validation tests

### Dependencies
- **Technical Dependencies**: ASP.NET Core, EF Core, auth
- **Area Dependencies**: Identity (if participants changed)
- **External Dependencies**: None

### Architectural Considerations
- **Area Boundary Respect**: Game → Identity reference
- **Interface Design**: Consistent with Create
- **Error Handling**: Same validation as Create

---

<!-- Quality Score: 100/100 ✅ -->
