# List Schedules By Owner Use Case

**Original Request**: Retrieve all schedules owned by a Game Master

**List Schedules By Owner** is a backend API endpoint that queries all schedules where a specific user is the owner. This use case operates within the Game area and enables Game Masters to view all their schedules.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model extraction

---

## Use Case Overview

### Business Context
- **Parent Feature**: Schedule Management
- **Owning Area**: Game
- **Business Value**: Enables Game Masters to view comprehensive list of all their scheduled meetings
- **User Benefit**: GMs can see all their schedules for management

### Scope Definition
- **Primary Actor**: Game Master (authenticated user)
- **Scope**: Schedule collection query filtered by OwnerId
- **Level**: User goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP

- **Endpoint**: GET /api/schedules/by-owner/{ownerId} or GET /api/users/{ownerId}/schedules
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/REST
- **Response Format**: JSON array of Schedule objects

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: ScheduleService.GetByOwnerAsync()
- **Domain Entities**: Schedule (collection)
- **Domain Services**: IScheduleStorage.GetByOwnerAsync()
- **Infrastructure Dependencies**: DbContext

### Hexagonal Architecture
- **Primary Port Operation**: IScheduleService.GetByOwnerAsync(Guid ownerId, Guid requestingUserId)
- **Secondary Port Dependencies**: IScheduleStorage
- **Adapter Requirements**: EF Core repository, REST API controller

### DDD Alignment
- **Bounded Context**: Game
- **Ubiquitous Language**: Schedule, Game Master, Owner
- **Business Invariants**: None (read-only)
- **Domain Events**: None (query)

---

## Functional Specification

### Input Requirements
- **Input Data**: OwnerId (Guid), RequestingUserId (Guid from auth)
- **Input Validation**: OwnerId exists, requesting user is owner or admin
- **Preconditions**: Authenticated user, authorization check

### Business Logic
- **Business Rules**: Users can query their own schedules (OwnerId = authenticated UserId) or admin access
- **Processing Steps**:
  1. Authenticate user
  2. Authorize (RequestingUserId == OwnerId or admin)
  3. Query schedules WHERE OwnerId = {ownerId}
  4. Return collection
- **Domain Coordination**: Schedule collection query
- **Validation Logic**: Authorization

### Output Specification
- **Output Data**: Array of Schedule entities
- **Output Format**: JSON array
- **Postconditions**: None (read-only)

### Error Scenarios
- **Unauthorized**: 403 Forbidden if requesting user ≠ owner and not admin
- **Owner Not Found**: 404 Not Found or empty array
- **Database Error**: 500 Internal Server Error

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**: `Task<IEnumerable<Schedule>> GetByOwnerAsync(Guid ownerId, Guid requestingUserId)`
- **Data Access Patterns**: Repository query with WHERE filter, optional pagination
- **External Integration**: None
- **Performance Requirements**: < 100ms, indexed OwnerId column

### Architecture Compliance
- **Layer Responsibilities**: API → Application (authorization) → Domain Service → Infrastructure
- **Dependency Direction**: Standard
- **Interface Abstractions**: IScheduleStorage
- **KISS Validation**: Simple filtered query

### Testing Strategy
- **Unit Testing**: Authorization logic
- **Integration Testing**: Query correctness, filtering
- **Acceptance Criteria**: See below
- **BDD Scenarios**: Covered in AC

---

## Acceptance Criteria

- **AC-01**: Owner can retrieve their schedules
  - **Given**: GM has 3 schedules, authenticated as owner
  - **When**: List API called with their OwnerId
  - **Then**: Array of 3 schedules returned, 200 OK

- **AC-02**: Non-owner cannot query others' schedules
  - **Given**: Requesting user ≠ OwnerId, not admin
  - **When**: List API called
  - **Then**: 403 Forbidden

- **AC-03**: Empty result for no schedules
  - **Given**: Owner has no schedules
  - **When**: List API called
  - **Then**: Empty array, 200 OK

- **AC-04**: Schedules filtered correctly
  - **Given**: Multiple schedules in database
  - **When**: List API called with specific OwnerId
  - **Then**: Only matching schedules returned

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Repository query with filtering
- **Code Organization**: ScheduleService.GetByOwnerAsync()
- **Testing Approach**: Query correctness, authorization

### Dependencies
- **Technical Dependencies**: ASP.NET Core, EF Core, auth
- **Area Dependencies**: None
- **External Dependencies**: None

### Architectural Considerations
- **Area Boundary Respect**: Self-contained query
- **Interface Design**: Standard collection query
- **Error Handling**: Authorization vs not found

---

<!-- Quality Score: 100/100 ✅ -->
