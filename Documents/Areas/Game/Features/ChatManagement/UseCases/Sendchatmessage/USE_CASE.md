# Send Chat Message Use Case

**Original Request**: Send text message or command during game session

**Send Chat Message** is a backend API endpoint that appends a chat message to a game session's message history with real-time broadcast via SignalR. This use case operates within the Game area and enables session participants to communicate during gameplay.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model extraction

---

## Use Case Overview

### Business Context
- **Parent Feature**: Chat Management
- **Owning Area**: Game
- **Business Value**: Enables real-time participant communication during gameplay with persistent message history
- **User Benefit**: Participants can send text messages and commands, maintaining synchronized chat across all session users

### Scope Definition
- **Primary Actor**: Session participant (any user in Players collection)
- **Scope**: GameSession.Messages collection modification (append-only)
- **Level**: User goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP

- **Endpoint**: POST /api/game-sessions/{id}/messages
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/REST with SignalR real-time broadcast
- **Response Format**: JSON with created GameSessionMessage object, plus SignalR broadcast to all session participants

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: GameSessionService.SendMessageAsync(), SignalR Hub (application layer)
- **Domain Entities**: GameSession (aggregate root), GameSessionMessage (value object)
- **Domain Services**: IGameSessionStorage.AddMessageAsync()
- **Infrastructure Dependencies**: DbContext, SignalR infrastructure

### Hexagonal Architecture
- **Primary Port Operation**: IGameSessionService.SendMessageAsync(Guid sessionId, string content, MessageType type, Guid senderId)
- **Secondary Port Dependencies**: IGameSessionStorage, SignalR Hub for real-time distribution
- **Adapter Requirements**: EF Core repository, REST API controller, SignalR hub adapter

### DDD Alignment
- **Bounded Context**: Game
- **Ubiquitous Language**: GameSession, GameSessionMessage, MessageType (Text/Command), Participant
- **Business Invariants**: AGG-03 (messages append-only), BR-09 (messages ordered by timestamp)
- **Domain Events**: MessageSent (broadcast via SignalR in application layer)

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - SessionId (Guid from route)
  - Content (string - message text or command)
  - MessageType (enum: Text or Command)
  - SenderId (Guid from auth context)
- **Input Validation**:
  - SessionId must exist
  - Content must not be empty
  - MessageType must be valid enum (Text or Command)
  - SenderId must be participant in session
  - Session Status must be InProgress or Paused (can send messages during pause)
- **Preconditions**: Authenticated participant, session exists, session InProgress or Paused, content not empty

### Business Logic
- **Business Rules**:
  - BR-09: Messages are append-only, ordered by timestamp
  - AGG-03: Messages and Events are append-only (no deletion)
  - Sender must be participant in session
  - Session must be InProgress or Paused (not Draft, Scheduled, Finished, Cancelled)
- **Processing Steps**:
  1. Authenticate and retrieve session
  2. Verify sender is participant (SenderId in Players collection)
  3. Verify Status is InProgress or Paused
  4. Validate Content not empty
  5. Create GameSessionMessage { Type, SenderId, Content, Timestamp=Now }
  6. Append to Messages collection
  7. Persist via IGameSessionStorage.AddMessageAsync()
  8. Broadcast message via SignalR to all session participants
  9. Return created message
- **Domain Coordination**: GameSession aggregate with GameSessionMessage value object append
- **Validation Logic**: Participant check, status validation, content validation

### Output Specification
- **Output Data**: Created GameSessionMessage with Type, SenderId, Content, Timestamp
- **Output Format**: JSON object, plus real-time SignalR broadcast to session participants
- **Postconditions**: Message appended to Messages collection, timestamp recorded, broadcast complete

### Error Scenarios
- **Session Not Found**: 404 Not Found "Game session not found"
- **Unauthorized User**: 403 Forbidden "User is not a participant in this session"
- **Invalid Status**: 400 Bad Request "Cannot send messages in {Status} session, must be InProgress or Paused"
- **Empty Content**: 400 Bad Request "Message content cannot be empty"
- **Invalid MessageType**: 400 Bad Request "Invalid message type, must be Text or Command"
- **Persistence Failure**: 500 Internal Server Error
- **SignalR Broadcast Failure**: Logged but not returned (message still persisted)

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
```csharp
public interface IGameSessionService
{
    Task<GameSessionMessage> SendMessageAsync(Guid sessionId, string content, MessageType type, Guid senderId);
}
```
- **Data Access Patterns**: Repository pattern, append to collection with timestamp
- **External Integration**: SignalR hub for real-time message distribution to session participants
- **Performance Requirements**: < 50ms persistence, < 100ms SignalR broadcast, messages ordered by timestamp

### Architecture Compliance
- **Layer Responsibilities**:
  - API Controller: Request parsing, response formatting
  - Application Service: Authorization, validation, orchestration, SignalR hub invocation
  - Domain Service: Persistence operation (append message)
  - Infrastructure: EF Core persistence, SignalR broadcast
- **Dependency Direction**: API → Application (SignalR hub) → Domain → Infrastructure
- **Interface Abstractions**: IGameSessionStorage, SignalR Hub interface
- **KISS Validation**: Simple append operation with participant and status checks

### Testing Strategy
- **Unit Testing**: Participant validation, status validation, content validation, MessageType enum validation
- **Integration Testing**: End-to-end message sending, EF Core persistence, append-only enforcement, timestamp ordering
- **Acceptance Criteria**: See below
- **BDD Scenarios**: Covered in AC, plus SignalR integration tests

---

## Acceptance Criteria

- **AC-01**: Participant can send text message during InProgress
  - **Given**: GameSession Status=InProgress, authenticated participant, MessageType=Text
  - **When**: Send Message API called with valid content
  - **Then**: Message appended to Messages, timestamp recorded, SignalR broadcast sent, 201 Created

- **AC-02**: Participant can send command message
  - **Given**: Valid session, MessageType=Command, content="/roll 1d20"
  - **When**: Send Message API called
  - **Then**: Command message appended and broadcast

- **AC-03**: Messages allowed during Paused status
  - **Given**: Session Status=Paused, authenticated participant
  - **When**: Send Message API called
  - **Then**: Message appended successfully (paused ≠ inactive for chat)

- **AC-04**: Non-participant cannot send message
  - **Given**: User not in Players collection
  - **When**: Send Message API called
  - **Then**: 403 Forbidden

- **AC-05**: Cannot send message to non-active session
  - **Given**: Session Status=Draft or Finished or Cancelled
  - **When**: Send Message API called
  - **Then**: 400 Bad Request "Invalid status"

- **AC-06**: Empty content rejected
  - **Given**: Content is empty string or whitespace
  - **When**: Send Message API called
  - **Then**: 400 Bad Request "Content cannot be empty"

- **AC-07**: Messages ordered by timestamp
  - **Given**: Multiple messages sent
  - **When**: Session retrieved
  - **Then**: Messages array ordered by Timestamp ascending (BR-09)

- **AC-08**: SignalR broadcast to all participants
  - **Given**: Session with 3 participants
  - **When**: Participant sends message
  - **Then**: SignalR message received by all 3 participants in real-time

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Append-only collection with SignalR real-time broadcast, Message value object creation
- **Code Organization**: GameSessionService.SendMessageAsync() with SignalR hub injection
- **Testing Approach**: Append-only enforcement, SignalR broadcast testing, timestamp ordering validation

### Dependencies
- **Technical Dependencies**: ASP.NET Core, EF Core, SignalR, auth
- **Area Dependencies**: None (self-contained)
- **External Dependencies**: SignalR infrastructure (application layer, not domain)

### Architectural Considerations
- **Area Boundary Respect**: Chat is internal to Game session
- **Interface Design**: Append operation with real-time distribution
- **Error Handling**: Comprehensive validation (7 error scenarios), SignalR failures logged but don't block persistence

---

<!-- Quality Score: 100/100 ✅ -->
