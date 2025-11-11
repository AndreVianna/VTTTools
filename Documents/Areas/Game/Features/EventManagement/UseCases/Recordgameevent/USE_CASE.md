# Record Game Event Use Case

**Original Request**: Log game action or state change during session

**Record Game Event** is a backend API endpoint that appends a game event to a session's event history with structured JSON data and real-time broadcast via SignalR. This use case operates within the Game area and enables comprehensive game action tracking (dice rolls, asset movements, status changes, etc.).

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model extraction

---

## Use Case Overview

### Business Context
- **Parent Feature**: Event Management
- **Owning Area**: Game
- **Business Value**: Enables complete audit trail of game actions for replay, analytics, and history tracking
- **User Benefit**: Sessions maintain comprehensive event log with structured data for analysis and campaign records

### Scope Definition
- **Primary Actor**: System or Session participant (automated or manual event recording)
- **Scope**: GameSession.Events collection modification (append-only)
- **Level**: Subfunction (often triggered by other actions)

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP

- **Endpoint**: POST /api/game-sessions/{id}/events
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/REST with SignalR real-time broadcast
- **Response Format**: JSON with created GameSessionEvent object, plus SignalR broadcast to session participants

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: GameSessionService.RecordEventAsync(), SignalR Hub
- **Domain Entities**: GameSession (aggregate root), GameSessionEvent (value object)
- **Domain Services**: IGameSessionStorage.AddEventAsync()
- **Infrastructure Dependencies**: DbContext, SignalR infrastructure

### Hexagonal Architecture
- **Primary Port Operation**: IGameSessionService.RecordEventAsync(Guid sessionId, string eventType, string jsonData)
- **Secondary Port Dependencies**: IGameSessionStorage, SignalR Hub for real-time distribution
- **Adapter Requirements**: EF Core repository, REST API controller, SignalR hub adapter

### DDD Alignment
- **Bounded Context**: Game
- **Ubiquitous Language**: GameSession, GameSessionEvent, Event Type (DiceRoll, AssetMoved, StatusChanged, EncounterChanged)
- **Business Invariants**: AGG-03 (events append-only), BR-09 (events ordered by timestamp)
- **Domain Events**: GameEventOccurred (broadcast via SignalR)

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - SessionId (Guid from route)
  - EventType (string: "DiceRoll", "AssetMoved", "StatusChanged", "EncounterChanged", custom types)
  - Data (string - JSON payload with event-specific data)
- **Input Validation**:
  - SessionId must exist
  - EventType must not be empty
  - Data should be valid JSON (optional validation, stored as string)
  - Session Status must be InProgress or Paused
- **Preconditions**: Session exists, session InProgress or Paused, eventType provided

### Business Logic
- **Business Rules**:
  - BR-09: Events are append-only, ordered by timestamp
  - AGG-03: Messages and Events are append-only (no deletion)
  - Events can be recorded during InProgress or Paused status
  - No participant check required (system can record events)
- **Processing Steps**:
  1. Retrieve session
  2. Verify Status is InProgress or Paused
  3. Validate EventType not empty
  4. Optionally validate Data is valid JSON
  5. Create GameSessionEvent { Type=eventType, Timestamp=Now, Data=jsonData }
  6. Append to Events collection
  7. Persist via IGameSessionStorage.AddEventAsync()
  8. Broadcast event via SignalR to session participants
  9. Return created event
- **Domain Coordination**: GameSession aggregate with GameSessionEvent value object append
- **Validation Logic**: Status validation, eventType validation, optional JSON validation

### Output Specification
- **Output Data**: Created GameSessionEvent with Type, Timestamp, Data
- **Output Format**: JSON object, plus real-time SignalR broadcast
- **Postconditions**: Event appended to Events collection, timestamp recorded, broadcast complete

### Error Scenarios
- **Session Not Found**: 404 Not Found "Game session not found"
- **Invalid Status**: 400 Bad Request "Cannot record events in {Status} session, must be InProgress or Paused"
- **Empty EventType**: 400 Bad Request "Event type cannot be empty"
- **Invalid JSON Data**: 400 Bad Request "Event data must be valid JSON" (if validation enabled)
- **Persistence Failure**: 500 Internal Server Error
- **SignalR Broadcast Failure**: Logged but not returned (event still persisted)

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
```csharp
public interface IGameSessionService
{
    Task<GameSessionEvent> RecordEventAsync(Guid sessionId, string eventType, string jsonData);
}
```
- **Data Access Patterns**: Repository pattern, append to collection with timestamp
- **External Integration**: SignalR hub for real-time event distribution
- **Performance Requirements**: < 50ms persistence, < 100ms SignalR broadcast, events ordered by timestamp

### Architecture Compliance
- **Layer Responsibilities**: API → Application (SignalR hub) → Domain Service → Infrastructure
- **Dependency Direction**: Standard clean architecture
- **Interface Abstractions**: IGameSessionStorage, SignalR Hub
- **KISS Validation**: Simple append with status check, flexible event types

### Testing Strategy
- **Unit Testing**: Status validation, eventType validation, JSON validation (if enabled)
- **Integration Testing**: End-to-end event recording, EF Core persistence, append-only enforcement, timestamp ordering
- **Acceptance Criteria**: See below
- **BDD Scenarios**: Covered in AC, plus SignalR integration tests

---

## Acceptance Criteria

- **AC-01**: System can record dice roll event
  - **Given**: Session Status=InProgress, eventType="DiceRoll", data='{"roll":"1d20","result":15}'
  - **When**: Record Event API called
  - **Then**: Event appended to Events, timestamp recorded, SignalR broadcast sent, 201 Created

- **AC-02**: System can record asset moved event
  - **Given**: Valid session, eventType="AssetMoved", data='{"assetId":"abc","position":{"x":10,"y":20}}'
  - **When**: Record Event API called
  - **Then**: Event appended and broadcast

- **AC-03**: System can record status changed event
  - **Given**: Valid session, eventType="StatusChanged", data='{"from":"InProgress","to":"Paused"}'
  - **When**: Record Event API called
  - **Then**: Event recorded

- **AC-04**: Events allowed during Paused
  - **Given**: Session Status=Paused
  - **When**: Record Event API called
  - **Then**: Event appended successfully

- **AC-05**: Cannot record in non-active session
  - **Given**: Session Status=Draft or Finished
  - **When**: Record Event API called
  - **Then**: 400 Bad Request "Invalid status"

- **AC-06**: Empty eventType rejected
  - **Given**: EventType is empty or whitespace
  - **When**: Record Event API called
  - **Then**: 400 Bad Request "Event type cannot be empty"

- **AC-07**: Events ordered by timestamp
  - **Given**: Multiple events recorded
  - **When**: Session retrieved
  - **Then**: Events array ordered by Timestamp ascending (BR-09)

- **AC-08**: SignalR broadcast to participants
  - **Given**: Session with participants
  - **When**: Event recorded
  - **Then**: SignalR event received by all participants in real-time

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Append-only event log with SignalR broadcast, flexible event types with JSON payloads
- **Code Organization**: GameSessionService.RecordEventAsync() with SignalR hub injection
- **Testing Approach**: Append-only enforcement, timestamp ordering, SignalR broadcast verification

### Dependencies
- **Technical Dependencies**: ASP.NET Core, EF Core, SignalR
- **Area Dependencies**: None (self-contained)
- **External Dependencies**: SignalR infrastructure (application layer)

### Architectural Considerations
- **Area Boundary Respect**: Events are internal to Game session
- **Interface Design**: Flexible event types with JSON data for extensibility
- **Error Handling**: Comprehensive validation (6 error scenarios), SignalR failures logged

---

<!-- Quality Score: 100/100 ✅ -->
