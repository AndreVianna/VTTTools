# Generate Sessions From Schedule Use Case

**Original Request**: Create GameSession instances from schedule based on recurrence pattern

**Generate Sessions From Schedule** is a backend API endpoint (or scheduled job) that creates GameSession entities from a schedule's recurrence pattern, enabling automated session creation for recurring campaigns. This use case operates within the Game area and enables automated meeting instantiation from schedule definitions.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model extraction

---

## Use Case Overview

### Business Context
- **Parent Feature**: Schedule Management
- **Owning Area**: Game
- **Business Value**: Enables automated GameSession creation from schedules, reducing manual session creation for recurring campaigns
- **User Benefit**: GMs don't need to manually create each recurring session, system generates them automatically

### Scope Definition
- **Primary Actor**: System (scheduled job) or Game Master (on-demand trigger)
- **Scope**: GameSession generation from Schedule aggregate
- **Level**: System function

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP or background job

- **Endpoint**: POST /api/schedules/{id}/generate-sessions
- **UI Components**: None (API only or background process)
- **Access**: Programmatic via HTTP/REST or scheduled job execution
- **Response Format**: JSON array of created GameSession objects

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: ScheduleService.GenerateSessionsAsync()
- **Domain Entities**: Schedule (aggregate root), GameSession (generated aggregates), Participant (copied from Schedule to Sessions)
- **Domain Services**: IScheduleStorage.GenerateSessionsAsync(), IGameSessionStorage.CreateAsync()
- **Infrastructure Dependencies**: DbContext, recurrence calculation logic

### Hexagonal Architecture
- **Primary Port Operation**: IScheduleService.GenerateSessionsAsync(Guid scheduleId, DateTimeOffset from, DateTimeOffset to)
- **Secondary Port Dependencies**: IScheduleStorage, IGameSessionStorage (for creating sessions)
- **Adapter Requirements**: EF Core repository, REST API controller, background job scheduler adapter

### DDD Alignment
- **Bounded Context**: Game
- **Ubiquitous Language**: Schedule, GameSession, Recurrence, Generate, Occurrence
- **Business Invariants**: AGG-07 (recurring schedule generates GameSession instances), AGG-08 (generated sessions are independent), BR-14 (deleting schedule doesn't delete sessions)
- **Domain Events**: Potential SessionsGenerated event

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - ScheduleId (Guid)
  - From (DateTimeOffset - start of generation range, default: Now)
  - To (DateTimeOffset - end of generation range, default: Now + configurable period)
- **Input Validation**:
  - ScheduleId must exist
  - From ≤ To
  - Recurrence pattern valid
- **Preconditions**: Schedule exists with valid recurrence pattern (or one-time schedule)

### Business Logic
- **Business Rules**:
  - BR-14: Deleting Schedule does not delete generated GameSessions (AGG-08)
  - AGG-07: Recurring Schedule generates GameSession instances
  - AGG-08: Generated sessions are independent aggregates
  - Generated sessions start with Status=Scheduled (or Draft if immediate)
  - Participants copied from Schedule to generated sessions
  - Each occurrence creates one GameSession
  - Duplicate prevention (don't regenerate already-created sessions for same occurrence)
- **Processing Steps**:
  1. Retrieve Schedule by Id
  2. Calculate occurrence dates in [From, To] range based on Recurrence pattern:
     - If Once: Single occurrence at Start
     - If Daily/Weekly/Monthly/Yearly: Calculate all occurrences within range respecting Interval and Until
  3. For each occurrence date:
     a. Check if GameSession already exists for this schedule occurrence (duplicate prevention)
     b. If not exists, create GameSession:
        - Title from Schedule (with date appended)
        - OwnerId from Schedule.OwnerId
        - Status = Scheduled (or Draft)
        - Players copied from Schedule.Participants
        - EncounterId = null
        - Messages/Events = empty
        - Link to Schedule via EventId or custom tracking
     c. Persist via IGameSessionStorage.CreateAsync()
  4. Return collection of created GameSessions
  5. Optionally track generation history to prevent duplicates
- **Domain Coordination**: Schedule reads recurrence, generates independent GameSession aggregates
- **Validation Logic**: Recurrence pattern calculation, duplicate prevention

### Output Specification
- **Output Data**: Array of created GameSession entities
- **Output Format**: JSON array with generated sessions
- **Postconditions**: GameSession entities created with Status=Scheduled, participants populated, sessions independent of schedule (BR-14, AGG-08)

### Error Scenarios
- **Schedule Not Found**: 404 Not Found "Schedule not found"
- **Invalid Date Range**: 400 Bad Request "From must be before or equal to To"
- **No Occurrences**: 200 OK with empty array (no occurrences in range)
- **Duplicate Sessions**: Handled silently (skip already-generated occurrences)
- **Persistence Failure**: 500 Internal Server Error with partial rollback

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
```csharp
public interface IScheduleService
{
    Task<IEnumerable<GameSession>> GenerateSessionsAsync(Guid scheduleId, DateTimeOffset from, DateTimeOffset to);
}
```
- **Data Access Patterns**: Repository pattern, read schedule, create multiple sessions in transaction
- **External Integration**: IGameSessionStorage for session creation, optional background job scheduler
- **Performance Requirements**: < 500ms for typical generation (10-20 sessions), batching for large ranges

### Architecture Compliance
- **Layer Responsibilities**:
  - API Controller / Background Job: Trigger generation with date range
  - Application Service: Orchestration, recurrence calculation, duplicate prevention
  - Domain Services: Schedule retrieval, GameSession creation
  - Infrastructure: Batch persistence
- **Dependency Direction**: Schedule Service → GameSession Service (same area)
- **Interface Abstractions**: IScheduleStorage, IGameSessionStorage
- **KISS Validation**: Recurrence calculation with duplicate prevention

### Testing Strategy
- **Unit Testing**: Recurrence calculations for all frequencies (Once, Daily, Weekly, Monthly, Yearly), Interval variations, Until boundary testing, duplicate prevention
- **Integration Testing**: End-to-end generation, batch session creation, duplicate prevention verification
- **Acceptance Criteria**: See below
- **BDD Scenarios**: Covered in AC

---

## Acceptance Criteria

- **AC-01**: Generate one-time schedule session
  - **Given**: Schedule with no recurrence, Start in range
  - **When**: Generate Sessions API called
  - **Then**: Single GameSession created with Status=Scheduled, participants copied, 201 Created

- **AC-02**: Generate weekly recurring sessions
  - **Given**: Weekly schedule (Frequency=Weekly, Interval=1), From=Now, To=Now+30days
  - **When**: Generate Sessions API called
  - **Then**: 4-5 GameSessions created (one per week), each with Status=Scheduled, participants populated

- **AC-03**: Respect Until date in recurrence
  - **Given**: Daily schedule with Until=Now+10days, From=Now, To=Now+30days
  - **When**: Generate Sessions API called
  - **Then**: Only 10 sessions created (stops at Until date)

- **AC-04**: Prevent duplicate generation
  - **Given**: Schedule already generated sessions for dates in range
  - **When**: Generate Sessions API called again
  - **Then**: No duplicate sessions created, existing sessions unchanged

- **AC-05**: Generated sessions are independent
  - **Given**: Schedule with generated sessions
  - **When**: Schedule deleted
  - **Then**: Generated GameSessions remain in system (BR-14, AGG-08)

- **AC-06**: Empty result for no occurrences
  - **Given**: Schedule Start after To date
  - **When**: Generate Sessions API called
  - **Then**: Empty array, 200 OK

- **AC-07**: Participants copied from schedule
  - **Given**: Schedule with 3 participants
  - **When**: Generate Sessions API called
  - **Then**: Each generated GameSession has same 3 participants

- **AC-08**: Sessions created with Scheduled status
  - **Given**: Valid schedule
  - **When**: Generate Sessions API called
  - **Then**: All created sessions have Status=Scheduled (ready to be started by GM)

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Cross-aggregate generation (Schedule → GameSession), recurrence pattern evaluation, duplicate prevention via tracking table or occurrence date comparison
- **Code Organization**: ScheduleService.GenerateSessionsAsync() with recurrence helper, IGameSessionStorage dependency
- **Testing Approach**: Comprehensive recurrence testing (all frequencies), duplicate prevention, independence verification

### Dependencies
- **Technical Dependencies**: ASP.NET Core, EF Core, optional background job scheduler (Hangfire/Quartz)
- **Area Dependencies**: IGameSessionStorage (same Game area)
- **External Dependencies**: Background job infrastructure (optional for automated generation)

### Architectural Considerations
- **Area Boundary Respect**: Self-contained within Game area, Schedule and GameSession are independent aggregates
- **Interface Design**: Flexible date range for on-demand or scheduled generation
- **Error Handling**: Duplicate prevention, partial failure handling, transactional batch creation

---

<!-- Quality Score: 100/100 ✅ -->
