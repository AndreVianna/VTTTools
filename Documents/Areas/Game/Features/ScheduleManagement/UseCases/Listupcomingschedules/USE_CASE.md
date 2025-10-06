# List Upcoming Schedules Use Case

**Original Request**: Query schedules with occurrences in specified date range

**List Upcoming Schedules** is a backend API endpoint that queries schedules with occurrences within a specified date range, enabling discovery of upcoming meetings. This use case operates within the Game area and enables users to find upcoming scheduled sessions.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model extraction

---

## Use Case Overview

### Business Context
- **Parent Feature**: Schedule Management
- **Owning Area**: Game
- **Business Value**: Enables discovery of upcoming scheduled meetings within a date range
- **User Benefit**: Users can find upcoming sessions for planning and participation

### Scope Definition
- **Primary Actor**: Any authenticated user or admin
- **Scope**: Schedule collection query with date range filter
- **Level**: User goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP

- **Endpoint**: GET /api/schedules/upcoming?from={fromDate}&to={toDate}
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/REST
- **Response Format**: JSON array of Schedule objects with occurrences in date range

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: ScheduleService.GetUpcomingSchedulesAsync()
- **Domain Entities**: Schedule (collection)
- **Domain Services**: IScheduleStorage.GetUpcomingSchedulesAsync()
- **Infrastructure Dependencies**: DbContext, recurrence calculation logic

### Hexagonal Architecture
- **Primary Port Operation**: IScheduleService.GetUpcomingSchedulesAsync(DateTimeOffset from, DateTimeOffset to)
- **Secondary Port Dependencies**: IScheduleStorage
- **Adapter Requirements**: EF Core repository with date filtering, REST API controller

### DDD Alignment
- **Bounded Context**: Game
- **Ubiquitous Language**: Schedule, Upcoming, Recurrence, Occurrence
- **Business Invariants**: None (read-only)
- **Domain Events**: None (query)

---

## Functional Specification

### Input Requirements
- **Input Data**: From (DateTimeOffset), To (DateTimeOffset)
- **Input Validation**: From ≤ To, both provided
- **Preconditions**: Valid date range

### Business Logic
- **Business Rules**: Query schedules where Start is within [From, To] OR recurrence pattern generates occurrences within range
- **Processing Steps**:
  1. Validate From ≤ To
  2. Query schedules WHERE (Start >= From AND Start <= To) OR (Recurrence generates occurrences in range)
  3. Return collection
  4. Optionally calculate actual occurrence dates for recurring schedules
- **Domain Coordination**: Schedule query with recurrence pattern evaluation
- **Validation Logic**: Date range validation

### Output Specification
- **Output Data**: Array of Schedule entities with occurrences in date range
- **Output Format**: JSON array (may include calculated occurrence dates)
- **Postconditions**: None (read-only)

### Error Scenarios
- **Invalid Date Range**: 400 Bad Request "From date must be before or equal to To date"
- **Missing Parameters**: 400 Bad Request "From and To dates required"
- **Database Error**: 500 Internal Server Error

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**: `Task<IEnumerable<Schedule>> GetUpcomingSchedulesAsync(DateTimeOffset from, DateTimeOffset to)`
- **Data Access Patterns**: Repository query with date range filter, recurrence pattern evaluation
- **External Integration**: None
- **Performance Requirements**: < 200ms (complex recurrence calculations), pagination recommended

### Architecture Compliance
- **Layer Responsibilities**: API → Application → Domain Service (recurrence logic) → Infrastructure
- **Dependency Direction**: Standard
- **Interface Abstractions**: IScheduleStorage
- **KISS Validation**: Date range query with recurrence support

### Testing Strategy
- **Unit Testing**: Date range validation, recurrence pattern evaluation (daily, weekly, monthly, yearly)
- **Integration Testing**: Query correctness, recurrence calculations
- **Acceptance Criteria**: See below
- **BDD Scenarios**: Covered in AC

---

## Acceptance Criteria

- **AC-01**: One-time schedules in range returned
  - **Given**: Schedule with Start in [From, To], no recurrence
  - **When**: List Upcoming API called
  - **Then**: Schedule included in results

- **AC-02**: Recurring schedules with occurrences in range
  - **Given**: Weekly schedule starting before From, recurring into [From, To] range
  - **When**: List Upcoming API called
  - **Then**: Schedule included (has occurrences in range)

- **AC-03**: Schedules outside range excluded
  - **Given**: Schedule with Start before From, no recurrence extending into range
  - **When**: List Upcoming API called
  - **Then**: Schedule not included

- **AC-04**: Invalid date range rejected
  - **Given**: From > To
  - **When**: List Upcoming API called
  - **Then**: 400 Bad Request

- **AC-05**: Empty result for no upcoming schedules
  - **Given**: No schedules in date range
  - **When**: List Upcoming API called
  - **Then**: Empty array, 200 OK

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Date range query with recurrence pattern evaluation
- **Code Organization**: ScheduleService.GetUpcomingSchedulesAsync() with recurrence helper
- **Testing Approach**: Recurrence pattern testing (all frequencies), date range boundary testing

### Dependencies
- **Technical Dependencies**: ASP.NET Core, EF Core
- **Area Dependencies**: None
- **External Dependencies**: None

### Architectural Considerations
- **Area Boundary Respect**: Self-contained query
- **Interface Design**: Date range filtering with recurrence support
- **Error Handling**: Date range validation

---

<!-- Quality Score: 100/100 ✅ -->
