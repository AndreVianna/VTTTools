# Create Schedule Use Case

**Original Request**: Define new recurring meeting schedule

**Create Schedule** is a backend API endpoint that initializes a new schedule entity with start time, duration, participants, and optional recurrence pattern. This use case operates within the Game area and enables Game Masters to plan recurring campaign meetings.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model extraction

---

## Use Case Overview

### Business Context
- **Parent Feature**: Schedule Management
- **Owning Area**: Game
- **Business Value**: Enables Game Masters to define recurring meeting patterns for ongoing campaigns
- **User Benefit**: GMs can schedule regular sessions with flexible recurrence patterns

### Scope Definition
- **Primary Actor**: Game Master (authenticated user)
- **Scope**: Schedule aggregate initialization
- **Level**: User goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP

- **Endpoint**: POST /api/schedules
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/REST
- **Response Format**: JSON with created Schedule object including Id, OwnerId, Participants, Start, Duration, Recurrence

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: ScheduleService.CreateAsync()
- **Domain Entities**: Schedule (aggregate root), Participant (value object), Recurrence (value object)
- **Domain Services**: IScheduleStorage.CreateAsync()
- **Infrastructure Dependencies**: DbContext, User service (participant validation)

### Hexagonal Architecture
- **Primary Port Operation**: IScheduleService.CreateAsync(DateTimeOffset start, TimeSpan duration, List<Guid> participantUserIds, Recurrence? recurrence, Guid ownerId)
- **Secondary Port Dependencies**: IScheduleStorage, IUserService (user validation)
- **Adapter Requirements**: EF Core repository, REST API controller, user validation adapter

### DDD Alignment
- **Bounded Context**: Game
- **Ubiquitous Language**: Schedule, Recurrence, Frequency (Once/Daily/Weekly/Monthly/Yearly), Participant, Game Master
- **Business Invariants**: INV-07 (start in future), INV-08 (positive duration), INV-09 (valid recurrence), INV-10 (at least owner as participant), AGG-06 (GM-only modifications)
- **Domain Events**: None (schedule creation)

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - Start (DateTimeOffset - first occurrence date/time)
  - Duration (TimeSpan - meeting duration)
  - ParticipantUserIds (List<Guid> - invited users including owner)
  - Recurrence (Recurrence? - optional: Frequency, Interval, Until)
  - OwnerId (Guid from auth context)
- **Input Validation**:
  - Start must be in future (INV-07)
  - Duration must be positive (INV-08)
  - Participants must include OwnerId (INV-10)
  - All participant UserIds must reference existing Users (BR-08)
  - If Recurrence provided: Frequency valid, Interval > 0, Until > Start if provided (INV-09)
- **Preconditions**: Authenticated user, start in future, positive duration, participants include owner

### Business Logic
- **Business Rules**:
  - BR-08: Participant.UserId must reference existing User
  - BR-11: Schedule Start must be future date (INV-07)
  - BR-12: Schedule Duration must be positive (INV-08)
  - BR-13: Recurrence.Until must be after Start if provided (INV-09)
  - INV-10: Participants must contain at least owner
  - AGG-06: Schedule can only be modified by owner
- **Processing Steps**:
  1. Authenticate user (OwnerId)
  2. Validate Start is in future (INV-07)
  3. Validate Duration > TimeSpan.Zero (INV-08)
  4. Validate ParticipantUserIds includes OwnerId (INV-10)
  5. Validate all UserIds exist via IUserService (BR-08)
  6. If Recurrence provided, validate Frequency, Interval > 0, Until > Start (INV-09, BR-13)
  7. Create Schedule entity with generated Id
  8. Create Participant objects for each UserId (PlayerType assigned based on role)
  9. Persist via IScheduleStorage.CreateAsync()
  10. Return created schedule
- **Domain Coordination**: Schedule aggregate with Participant and Recurrence value objects
- **Validation Logic**: Future start, positive duration, participant inclusion, user existence, recurrence validation

### Output Specification
- **Output Data**: Complete Schedule entity
- **Output Format**: JSON object with Id, OwnerId, Participants, EventId (null), Start, Duration, Recurrence
- **Postconditions**: Schedule persisted, ready for session generation

### Error Scenarios
- **Start Not Future**: 400 Bad Request "Start date must be in the future" (INV-07, BR-11)
- **Non-Positive Duration**: 400 Bad Request "Duration must be positive" (INV-08, BR-12)
- **Owner Not In Participants**: 400 Bad Request "Owner must be included in participants" (INV-10)
- **Participant Not Found**: 404 Not Found "One or more participants not found" (BR-08)
- **Invalid Recurrence**: 400 Bad Request "Invalid recurrence: {reason}" (INV-09, BR-13)
- **Persistence Failure**: 500 Internal Server Error

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**: `Task<Schedule> CreateAsync(CreateScheduleDto dto)`
- **Data Access Patterns**: Repository pattern, single create transaction
- **External Integration**: IUserService for participant validation
- **Performance Requirements**: < 100ms

### Architecture Compliance
- **Layer Responsibilities**: API → Application → Domain Service → Infrastructure
- **Dependency Direction**: Game → Identity (User validation)
- **Interface Abstractions**: IScheduleStorage, IUserService
- **KISS Validation**: Straightforward creation with comprehensive validation

### Testing Strategy
- **Unit Testing**: All invariant validations (INV-07 through INV-10), recurrence pattern validation, participant inclusion
- **Integration Testing**: End-to-end creation, EF Core persistence, participant validation
- **Acceptance Criteria**: See below
- **BDD Scenarios**: Covered in AC

---

## Acceptance Criteria

- **AC-01**: GM can create one-time schedule
  - **Given**: Valid future start, positive duration, participants include owner, no recurrence
  - **When**: Create Schedule API called
  - **Then**: Schedule created with Id, OwnerId, Participants, Start, Duration, Recurrence=null, 201 Created

- **AC-02**: GM can create weekly recurring schedule
  - **Given**: Valid inputs, Recurrence { Frequency=Weekly, Interval=1, Until=futureDate }
  - **When**: Create Schedule API called
  - **Then**: Schedule created with weekly recurrence

- **AC-03**: Past start date rejected
  - **Given**: Start date in past
  - **When**: Create Schedule API called
  - **Then**: 400 Bad Request "Start must be in future" (INV-07)

- **AC-04**: Non-positive duration rejected
  - **Given**: Duration = TimeSpan.Zero or negative
  - **When**: Create Schedule API called
  - **Then**: 400 Bad Request (INV-08)

- **AC-05**: Owner must be participant
  - **Given**: ParticipantUserIds does not include OwnerId
  - **When**: Create Schedule API called
  - **Then**: 400 Bad Request (INV-10)

- **AC-06**: Invalid recurrence rejected
  - **Given**: Recurrence.Until before Start
  - **When**: Create Schedule API called
  - **Then**: 400 Bad Request (INV-09, BR-13)

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Aggregate creation with value objects, comprehensive validation
- **Code Organization**: ScheduleService.CreateAsync() with validation orchestration
- **Testing Approach**: Invariant validation testing, recurrence pattern testing

### Dependencies
- **Technical Dependencies**: ASP.NET Core, EF Core, auth
- **Area Dependencies**: Identity context (User validation)
- **External Dependencies**: None

### Architectural Considerations
- **Area Boundary Respect**: Game → Identity reference for participants
- **Interface Design**: Flexible recurrence patterns
- **Error Handling**: Specific errors for each invariant violation (6 scenarios)

---

<!-- Quality Score: 100/100 ✅ -->
