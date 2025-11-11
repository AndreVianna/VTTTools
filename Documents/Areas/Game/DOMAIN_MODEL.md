# Game Domain Model

**Bounded Context**: Game

**Purpose**: Manage active game sessions (meetings) and scheduling for tabletop RPG gameplay with real-time chat, events, and participant management.

**Boundaries**:
- **Inside**: GameSession entity (active meetings), Schedule entity (meeting scheduling), participant management, chat messages, game events, recurrence patterns
- **Outside**: User management (Identity context), Encounter usage (Library context), Asset templates (Assets context)

**Architecture Pattern**: DDD Contracts + Service Implementation
- Domain entities are **data contracts** (anemic - no behavior)
- Business logic resides in **application services** (Source/Game/)
- Entities, value objects, and service interfaces define **contracts**
- Services enforce invariants and implement business rules

---

## Change Log
- *2025-10-02* — **1.0.0** — Initial domain model extracted from existing codebase

---

## Ubiquitous Language

- **Meeting**: Active game session with participants, chat, and events (formerly called "Session", renamed to avoid confusion with web sessions)
- **Game Master (GM)**: Meeting owner who runs the game (PlayerType.Master)
- **Player**: Meeting participant who plays characters (PlayerType.Player)
- **Assistant**: Helper role for complex games (PlayerType.Assistant)
- **Guest**: Observer role with limited permissions (PlayerType.Guest)
- **Participant**: User participating in a meeting with specific role
- **Status**: Meeting lifecycle state (Draft → Scheduled → InProgress → Paused → Finished/Cancelled)
- **Schedule**: Meeting recurrence pattern for ongoing games
- **Recurrence**: Pattern defining repeating meetings (Once, Daily, Weekly, Monthly, Yearly)
- **Chat Message**: Text communication during meeting
- **Game Event**: Recorded game action (dice roll, asset moved, status changed)
- **Encounter**: Active tactical map being used in meeting (references Library context)

---

## Entities

### GameSession

**Entity Classification**: Aggregate Root

**Aggregate Root**: This entity is the entry point for active game meeting operations

#### Identity
- **Primary Key**: Id (Guid)
- **Natural Key**: None (system-generated)

#### Attributes
- **Id**: Guid
  - **Constraints**: Primary key, required, system-generated
  - **Default Value**: New Guid on creation
  - **Nullable**: No
  - **Purpose**: Unique identifier for game session

- **OwnerId**: Guid
  - **Constraints**: Foreign key to User.Id, required
  - **Default Value**: Current user (Game Master) at creation
  - **Nullable**: No
  - **Purpose**: Links session to Game Master

- **Title**: string
  - **Constraints**: Required, max length 128 characters
  - **Default Value**: None (must be provided)
  - **Nullable**: No
  - **Purpose**: Human-readable session name

- **Status**: GameSessionStatus (enum)
  - **Constraints**: Must be valid status value (Draft, Scheduled, Cancelled, InProgress, Paused, Finished)
  - **Default Value**: GameSessionStatus.Draft
  - **Nullable**: No
  - **Purpose**: Tracks meeting lifecycle state

- **Players**: List<Participant> (value objects)
  - **Constraints**: At least owner as Master, max participants (configurable)
  - **Default Value**: List with owner as Master
  - **Nullable**: No (empty list not allowed, must have GM)
  - **Purpose**: Meeting participants with roles

- **EncounterId**: Guid?
  - **Constraints**: Must reference existing Encounter if provided, nullable
  - **Default Value**: null
  - **Nullable**: Yes
  - **Purpose**: Active encounter being used in session (optional)

- **Messages**: List<GameSessionMessage> (value objects)
  - **Constraints**: Ordered by timestamp
  - **Default Value**: Empty list
  - **Nullable**: No (empty list if no messages)
  - **Purpose**: Chat history

- **Events**: List<GameSessionEvent> (value objects)
  - **Constraints**: Ordered by timestamp
  - **Default Value**: Empty list
  - **Nullable**: No (empty list if no events)
  - **Purpose**: Game action history

#### Invariants
- **INV-01**: Title must not be empty or whitespace
  - **Rationale**: Session must be identifiable
  - **Enforced By**: Service validation

- **INV-02**: Title length must not exceed 128 characters
  - **Rationale**: Database and UI limits
  - **Enforced By**: EF Core MaxLength, service validation

- **INV-03**: Players must contain at least owner as Master
  - **Rationale**: Session must have Game Master
  - **Enforced By**: Service validation on creation, update

- **INV-04**: Only one player can have PlayerType.Master
  - **Rationale**: Single Game Master per session
  - **Enforced By**: Service validation

- **INV-05**: Status transitions must follow valid lifecycle
  - **Rationale**: Prevent invalid state changes (e.g., Draft → Finished without InProgress)
  - **Enforced By**: Service enforces state machine

- **INV-06**: EncounterId must reference existing Encounter if provided
  - **Rationale**: Active encounter must be valid
  - **Enforced By**: Database foreign key (nullable), service validation

#### Operations (Implemented in Application Services)

**NOTE**: Anemic entities, logic in services (Source/Game/)

- **Create Game Session**: Initialize new meeting
  - **Implemented By**: IGameSessionStorage.CreateAsync()
  - **Pre-conditions**: Title valid, OwnerId exists
  - **Invariants Enforced**: INV-01, INV-02, INV-03
  - **Post-conditions**: Session created with Status=Draft, owner added as Master
  - **Returns**: Task<GameSession>

- **Start Game Session**: Transition to InProgress
  - **Implemented By**: IGameSessionStorage.UpdateAsync() with Status=InProgress
  - **Pre-conditions**: Status=Scheduled or Status=Draft, user is GM
  - **Invariants Enforced**: INV-05 (valid transition)
  - **Post-conditions**: Status=InProgress, start time recorded
  - **Returns**: Task<GameSession>

- **Pause Game Session**: Temporarily halt gameplay
  - **Implemented By**: IGameSessionStorage.UpdateAsync() with Status=Paused
  - **Pre-conditions**: Status=InProgress, user is GM
  - **Invariants Enforced**: INV-05
  - **Post-conditions**: Status=Paused
  - **Returns**: Task<GameSession>

- **Resume Game Session**: Continue from pause
  - **Implemented By**: IGameSessionStorage.UpdateAsync() with Status=InProgress
  - **Pre-conditions**: Status=Paused, user is GM
  - **Invariants Enforced**: INV-05
  - **Post-conditions**: Status=InProgress
  - **Returns**: Task<GameSession>

- **Finish Game Session**: Complete meeting
  - **Implemented By**: IGameSessionStorage.UpdateAsync() with Status=Finished
  - **Pre-conditions**: Status=InProgress or Paused, user is GM
  - **Invariants Enforced**: INV-05
  - **Post-conditions**: Status=Finished, end time recorded
  - **Returns**: Task<GameSession>

- **Cancel Game Session**: Abort meeting
  - **Implemented By**: IGameSessionStorage.UpdateAsync() with Status=Cancelled
  - **Pre-conditions**: Status != Finished, user is GM
  - **Invariants Enforced**: INV-05
  - **Post-conditions**: Status=Cancelled
  - **Returns**: Task<GameSession>

- **Add Participant**: Invite user to session
  - **Implemented By**: IGameSessionStorage.AddParticipantAsync()
  - **Pre-conditions**: User exists, not already participant, session not finished
  - **Invariants Enforced**: INV-03, INV-04 (if adding Master)
  - **Post-conditions**: Participant added to Players
  - **Returns**: Task<GameSession>

- **Remove Participant**: Remove user from session
  - **Implemented By**: IGameSessionStorage.RemoveParticipantAsync()
  - **Pre-conditions**: User is participant, not the GM (can't remove Master)
  - **Invariants Enforced**: INV-03
  - **Post-conditions**: Participant removed
  - **Returns**: Task<GameSession>

- **Send Chat Message**: Add message to chat
  - **Implemented By**: IGameSessionStorage.AddMessageAsync()
  - **Pre-conditions**: User is participant, session InProgress or Paused
  - **Invariants Enforced**: None (message append)
  - **Post-conditions**: Message added to Messages with timestamp
  - **Returns**: Task<GameSession>

- **Record Game Event**: Log game action
  - **Implemented By**: IGameSessionStorage.AddEventAsync()
  - **Pre-conditions**: Session InProgress or Paused
  - **Invariants Enforced**: None (event append)
  - **Post-conditions**: Event added to Events with timestamp
  - **Returns**: Task<GameSession>

- **Set Active Encounter**: Change encounter being used
  - **Implemented By**: IGameSessionStorage.UpdateAsync() with new EncounterId
  - **Pre-conditions**: Encounter exists, user is GM
  - **Invariants Enforced**: INV-06
  - **Post-conditions**: EncounterId updated
  - **Returns**: Task<GameSession>

**Entity Behavior**: Immutable record with init-only properties, modified via service orchestration

#### Domain Events
[NOT CURRENTLY IMPLEMENTED - Events could be added via SignalR in future]

Potential real-time events:
- **SessionStarted**: When status changes to InProgress
- **SessionPaused**: When status changes to Paused
- **SessionFinished**: When status changes to Finished
- **ParticipantJoined**: When participant added
- **ParticipantLeft**: When participant removed
- **MessageSent**: When chat message added (broadcast via SignalR)
- **GameEventOccurred**: When game event recorded

#### Relationships
- **Belongs To** → User: GameSession owned by Game Master
  - **Cardinality**: Many-to-One
  - **Navigation**: OwnerId foreign key

- **References** → Encounter: GameSession may reference active encounter
  - **Cardinality**: Many-to-One optional
  - **Navigation**: EncounterId foreign key (nullable)

- **References** → User: Participants reference Users
  - **Cardinality**: Many-to-Many (via Participant value object)
  - **Navigation**: Participant.UserId in Players collection

---

### Schedule

**Entity Classification**: Aggregate Root

**Aggregate Root**: Independent scheduling entity for recurring meetings

#### Identity
- **Primary Key**: Id (Guid)
- **Natural Key**: None

#### Attributes
- **Id**: Guid
- **OwnerId**: Guid (Game Master)
- **Participants**: List<Participant> (invited users)
- **EventId**: Guid (external calendar event ID, if integrated)
- **Start**: DateTimeOffset (first occurrence date/time)
- **Duration**: TimeSpan (meeting duration)
- **Recurrence**: Recurrence? (optional recurrence pattern)

#### Invariants
- **INV-07**: Start must be in the future when creating
  - **Rationale**: Cannot schedule past meetings
  - **Enforced By**: Service validation

- **INV-08**: Duration must be positive
  - **Rationale**: Meeting must have valid timespan
  - **Enforced By**: Service validation

- **INV-09**: Recurrence.Until must be after Start if provided
  - **Rationale**: Recurrence end date must be valid
  - **Enforced By**: Service validation, Recurrence value object

- **INV-10**: Participants must contain at least owner
  - **Rationale**: Schedule must have GM
  - **Enforced By**: Service validation

#### Operations (Implemented in Application Services)
- **Create Schedule**: Define recurring meeting pattern
- **Update Schedule**: Modify schedule details
- **Delete Schedule**: Cancel scheduled meetings
- **Generate Sessions**: Create GameSession instances from schedule (for upcoming occurrences)

#### Relationships
- **Belongs To** → User: Schedule owned by Game Master
- **References** → User: Participants reference Users

---

## Value Objects

### Participant

**Purpose**: Represents user participating in game session or schedule with specific role

#### Properties
- **UserId**: Guid (references User.Id)
- **PlayerType**: PlayerType (enum: Guest, Player, Assistant, Master)
- **JoinedAt**: DateTimeOffset? (timestamp when joined, nullable for schedules)

#### Creation & Validation
- **Factory Method**: `new Participant { UserId = userId, PlayerType = PlayerType.Player, JoinedAt = DateTimeOffset.UtcNow }`
- **Validation Rules**:
  - UserId must reference existing User
  - PlayerType must be valid enum
- **Immutability**: Yes (record type)

#### Equality & Comparison
- **Equality**: Value-based (UserId and PlayerType must match)
- **Hash Code**: Based on UserId
- **Comparison**: Not comparable

---

### GameSessionMessage

**Purpose**: Chat message sent during game session

#### Properties
- **Type**: MessageType (enum: Text, Command)
- **SenderId**: Guid (User who sent message)
- **Content**: string (message text or command)
- **Timestamp**: DateTimeOffset (when sent)

#### Creation & Validation
- **Factory Method**: `new GameSessionMessage { Type = MessageType.Text, SenderId = userId, Content = text, Timestamp = DateTimeOffset.UtcNow }`
- **Validation Rules**:
  - Content must not be empty
  - SenderId must be participant in session
- **Immutability**: Yes (record type)

---

### GameSessionEvent

**Purpose**: Recorded game action or state change

#### Properties
- **Type**: string (event type: "DiceRoll", "AssetMoved", "StatusChanged", "EncounterChanged")
- **Timestamp**: DateTimeOffset
- **Data**: string (JSON payload with event details)

#### Creation & Validation
- **Factory Method**: `new GameSessionEvent { Type = "DiceRoll", Timestamp = DateTimeOffset.UtcNow, Data = jsonData }`
- **Validation Rules**:
  - Type must not be empty
  - Data should be valid JSON
- **Immutability**: Yes (record type)

---

### Recurrence

**Purpose**: Defines repeating meeting pattern

#### Properties
- **Frequency**: Frequency (enum: Once, Daily, Weekly, Monthly, Yearly)
- **Interval**: int (repeat every N units, e.g., every 2 weeks)
- **Until**: DateTimeOffset? (recurrence end date, nullable for infinite)

#### Creation & Validation
- **Factory Method**: `new Recurrence { Frequency = Frequency.Weekly, Interval = 1, Until = endDate }`
- **Validation Rules**:
  - Frequency must be valid enum
  - Interval must be positive
  - Until must be future date if provided
- **Immutability**: Yes (record type)

---

## Aggregates

### GameSession Aggregate

**Aggregate Root**: GameSession

**Value Objects in Aggregate**: Participant (collection), GameSessionMessage (collection), GameSessionEvent (collection)

**Boundary**: GameSession entity with all its participants, messages, and events. Encounter is referenced by ID, not part of aggregate.

**Aggregate Invariants**:
- **AGG-01**: GameSession can only be modified by Game Master (owner)
- **AGG-02**: Status transitions must follow valid state machine (Draft → Scheduled → InProgress ↔ Paused → Finished/Cancelled)
- **AGG-03**: Messages and Events are append-only (no deletion)
- **AGG-04**: Participants can only be added/removed when session not Finished
- **AGG-05**: Only GM (Master) can change status, add/remove participants, set active encounter

#### Lifecycle Management
- **Creation**: Via IGameSessionStorage.CreateAsync() - creates with Status=Draft, owner as Master
- **Modification**: Status changes follow state machine, participant management, message/event appending
- **Deletion**: Soft delete (Status=Cancelled), or hard delete only if Draft and no participants joined

---

### Schedule Aggregate

**Aggregate Root**: Schedule

**Value Objects in Aggregate**: Participant (collection), Recurrence (optional)

**Boundary**: Schedule entity with participants and recurrence pattern. GameSessions are generated from Schedule but are independent aggregates.

**Aggregate Invariants**:
- **AGG-06**: Schedule can only be modified by owner (Game Master)
- **AGG-07**: Recurring Schedule generates GameSession instances (scheduled job or on-demand)
- **AGG-08**: Deleting Schedule does not delete generated GameSessions

---

## Domain Services

### IGameSessionStorage

**Purpose**: Persistence and state management for GameSession entities

**Responsibilities**:
- CRUD operations for GameSession
- Enforce status transition rules
- Manage participants, messages, events
- Provide query operations

#### Operations
- **CreateAsync(GameSession session)**: Create new session
- **GetByIdAsync(Guid sessionId)**: Retrieve session
- **UpdateAsync(GameSession session)**: Update session (status, encounter, participants)
- **DeleteAsync(Guid sessionId)**: Remove session
- **GetByOwnerAsync(Guid ownerId)**: Get sessions owned by GM
- **GetActiveSessionsAsync()**: Get sessions with Status=InProgress
- **AddParticipantAsync(Guid sessionId, Participant participant)**: Invite participant
- **RemoveParticipantAsync(Guid sessionId, Guid userId)**: Remove participant
- **AddMessageAsync(Guid sessionId, GameSessionMessage message)**: Append chat message
- **AddEventAsync(Guid sessionId, GameSessionEvent event)**: Record game event

#### Dependencies
- **Required**: DbContext (EF Core), IEncounterStorage (for EncounterId validation)

---

### IScheduleStorage

**Purpose**: Persistence and management for Schedule entities

#### Operations
- **CreateAsync(Schedule schedule)**: Create schedule
- **GetByIdAsync(Guid scheduleId)**: Retrieve schedule
- **UpdateAsync(Schedule schedule)**: Update schedule
- **DeleteAsync(Guid scheduleId)**: Remove schedule
- **GetByOwnerAsync(Guid ownerId)**: Get schedules by GM
- **GetUpcomingSchedulesAsync(DateTimeOffset from, DateTimeOffset to)**: Get schedules in date range
- **GenerateSessionsAsync(Guid scheduleId)**: Create GameSession instances from schedule

#### Dependencies
- **Required**: DbContext, IGameSessionStorage (for generating sessions)

---

## Domain Rules Summary

- **BR-01** - Validation: Title must not be empty
- **BR-02** - Validation: Title max length 128 characters
- **BR-03** - Business Logic: Session must have at least one participant (GM as Master)
- **BR-04** - Business Logic: Only one participant can be Master (Game Master)
- **BR-05** - State Machine: Valid status transitions (Draft → Scheduled → InProgress ↔ Paused → Finished/Cancelled)
- **BR-06** - Authorization: Only GM can change status, manage participants, set encounter
- **BR-07** - Referential Integrity: EncounterId must reference existing Encounter if provided
- **BR-08** - Referential Integrity: Participant.UserId must reference existing User
- **BR-09** - Business Logic: Messages and Events are append-only, ordered by timestamp
- **BR-10** - Business Logic: Participants cannot be added/removed when Status=Finished
- **BR-11** - Validation: Schedule Start must be future date
- **BR-12** - Validation: Schedule Duration must be positive
- **BR-13** - Validation: Recurrence.Until must be after Start if provided
- **BR-14** - Business Logic: Deleting Schedule does not delete generated GameSessions

---

## Architecture Integration

### Domain Layer Purity
✅ No infrastructure dependencies
✅ No framework dependencies (SignalR is application layer concern)
✅ Pure business contracts only
✅ Testable in isolation

### Used By (Application Layer)
- **Create Meeting Use Case**: Uses GameSession, Participant, status lifecycle
- **Run Game Use Case**: Manages status transitions, messages, events
- **Schedule Meetings Use Case**: Uses Schedule, Recurrence, generates GameSessions
- **Real-time Communication**: SignalR hubs broadcast messages and events (application layer)

---

<!--
═══════════════════════════════════════════════════════════════
DOMAIN MODEL QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════

## Entities (30 points)
✅ 10pts: All entities complete (GameSession, Schedule)
✅ 10pts: Invariants defined (INV-01 through INV-10)
✅ 5pts: Operations documented (status transitions, participant management)
✅ 5pts: Aggregate roots identified (GameSession, Schedule)

## Value Objects (20 points)
✅ 10pts: Value objects defined (Participant, GameSessionMessage, GameSessionEvent, Recurrence)
✅ 5pts: Immutability documented
✅ 5pts: Factory methods defined

## Aggregates (25 points)
✅ 10pts: Boundaries defined (GameSession with messages/events, Schedule with recurrence)
✅ 10pts: Invariants specified (AGG-01 through AGG-08)
✅ 5pts: Lifecycle management (status state machine, append-only collections)

## Application Services (15 points)
✅ 10pts: Service interfaces (IGameSessionStorage, IScheduleStorage) defined
✅ 5pts: Operations documented
✅ 5pts: Dependencies clear

## Ubiquitous Language (10 points)
✅ 10pts: Complete terminology (12 terms defined)

## Target Score: 100/100 ✅

### Extraction Notes:
✅ Status lifecycle state machine documented
✅ Real-time communication patterns noted (SignalR in application layer)
✅ Append-only collections (Messages, Events) enforced
✅ Scheduling with recurrence patterns
✅ Participant role management (Guest, Player, Assistant, Master)
-->
