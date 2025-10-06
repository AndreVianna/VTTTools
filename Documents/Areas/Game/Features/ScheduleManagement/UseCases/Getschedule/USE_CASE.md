# Get Schedule Use Case

**Original Request**: Retrieve schedule details by ID

**Get Schedule** is a backend API endpoint that retrieves complete schedule details including participants and recurrence pattern. This use case operates within the Game area and enables users to view schedule information.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model extraction

---

## Use Case Overview

### Business Context
- **Parent Feature**: Schedule Management
- **Owning Area**: Game
- **Business Value**: Enables users to retrieve schedule details for viewing and management
- **User Benefit**: Users can view schedule information including participants, timing, and recurrence pattern

### Scope Definition
- **Primary Actor**: Schedule owner or participant
- **Scope**: Schedule aggregate retrieval
- **Level**: User goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP

- **Endpoint**: GET /api/schedules/{id}
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/REST
- **Response Format**: JSON with complete Schedule object

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: ScheduleService.GetByIdAsync()
- **Domain Entities**: Schedule (aggregate root with Participant and Recurrence value objects)
- **Domain Services**: IScheduleStorage.GetByIdAsync()
- **Infrastructure Dependencies**: DbContext

### Hexagonal Architecture
- **Primary Port Operation**: IScheduleService.GetByIdAsync(Guid scheduleId, Guid requestingUserId)
- **Secondary Port Dependencies**: IScheduleStorage
- **Adapter Requirements**: EF Core repository, REST API controller

### DDD Alignment
- **Bounded Context**: Game
- **Ubiquitous Language**: Schedule, Recurrence, Participant
- **Business Invariants**: None (read-only)
- **Domain Events**: None (query)

---

## Functional Specification

### Input Requirements
- **Input Data**: ScheduleId (Guid), RequestingUserId (Guid from auth)
- **Input Validation**: ScheduleId exists, requesting user is owner or participant (authorization)
- **Preconditions**: Authenticated user, schedule exists, user authorized

### Business Logic
- **Business Rules**: Users can view schedules they own or participate in
- **Processing Steps**:
  1. Authenticate user
  2. Retrieve Schedule by Id (eager load Participants, Recurrence)
  3. Authorize (RequestingUserId == OwnerId or in Participants)
  4. Return schedule
- **Domain Coordination**: Schedule aggregate with value objects
- **Validation Logic**: Schedule existence, authorization

### Output Specification
- **Output Data**: Complete Schedule with Participants, Recurrence
- **Output Format**: JSON object
- **Postconditions**: None (read-only)

### Error Scenarios
- **Schedule Not Found**: 404 Not Found
- **Unauthorized User**: 403 Forbidden "Not authorized to view this schedule"
- **Database Error**: 500 Internal Server Error

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**: `Task<Schedule> GetByIdAsync(Guid scheduleId, Guid requestingUserId)`
- **Data Access Patterns**: Repository query with eager loading
- **External Integration**: None
- **Performance Requirements**: < 50ms

### Architecture Compliance
- **Layer Responsibilities**: API → Application (authorization) → Domain Service → Infrastructure
- **Dependency Direction**: Standard clean architecture
- **Interface Abstractions**: IScheduleStorage
- **KISS Validation**: Simple retrieval with authorization

### Testing Strategy
- **Unit Testing**: Authorization logic (owner vs participant vs other)
- **Integration Testing**: End-to-end retrieval, eager loading
- **Acceptance Criteria**: See below
- **BDD Scenarios**: Covered in AC

---

## Acceptance Criteria

- **AC-01**: Owner can retrieve schedule
  - **Given**: Schedule exists, authenticated owner
  - **When**: Get API called
  - **Then**: Complete schedule returned, 200 OK

- **AC-02**: Participant can retrieve schedule
  - **Given**: User is participant (not owner)
  - **When**: Get API called
  - **Then**: Schedule returned

- **AC-03**: Non-participant cannot view
  - **Given**: User not owner or participant
  - **When**: Get API called
  - **Then**: 403 Forbidden

- **AC-04**: Non-existent schedule handled
  - **Given**: Invalid ScheduleId
  - **When**: Get API called
  - **Then**: 404 Not Found

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Repository query with authorization
- **Code Organization**: ScheduleService.GetByIdAsync()
- **Testing Approach**: Authorization scenarios, eager loading verification

### Dependencies
- **Technical Dependencies**: ASP.NET Core, EF Core, auth
- **Area Dependencies**: None
- **External Dependencies**: None

### Architectural Considerations
- **Area Boundary Respect**: Self-contained query
- **Interface Design**: Standard retrieval pattern
- **Error Handling**: Authorization vs not found distinction

---

<!-- Quality Score: 100/100 ✅ -->
