# EPIC-004: Game Sessions - Real-Time Collaboration

**Type**: World (Feature Implementation)
**Status**: 🔜 Planned
**Priority**: Medium
**Estimated Effort**: 22 hours (frontend only - backend complete)
**Created**: 2025-12-09
**Origin**: Moved from EPIC-001 Phase 10

---

## Description

Implement real-time game session functionality with SignalR for chat, events, and participant management. This EPIC covers the frontend implementation for collaborative gameplay features.

---

## Background

This work was originally planned as Phase 10 of EPIC-001 (UI Migration). During the EPIC-001 completion review (2025-12-09), it was determined that Game Sessions is a distinct feature that warrants its own EPIC.

**Backend Status**: ✅ COMPLETE
- 12 API endpoints implemented
- GameSession domain model with Messages, Events, Participants
- 5 unit tests
- SignalR 9.0.6 installed

**Frontend Status**: ❌ NOT STARTED
- No HubConnection usage
- gameSessionsApi RTK Query slice exists but no UI

---

## Deliverables

### SignalR Infrastructure

- **SignalRProvider**: Connection lifecycle management (connect, disconnect, reconnect)
- **useSignalR**: Custom hook for SignalR state and events

### UI Components

- **ChatPanel**: Real-time chat with message history and input
- **ParticipantList**: Live roster with roles and status indicators
- **GameEventLog**: Event stream (dice rolls, movements, status changes)
- **SessionManager**: Session creation, joining, leaving UI
- **EncounterSelector**: Encounter activation for GM

### Integration

- **GameSessionPage**: Main session page combining all components
- **Notifications**: Real-time notifications for session events

---

## Technical Approach

### SignalR Client
```typescript
// React SignalR integration pattern
const { connection, status, joinSession, sendMessage } = useSignalR();
```

### Hub Connections
- **ChatHub**: Message broadcasting
- **GameSessionHub**: Session events, participant updates

### State Management
- Redux Toolkit for session state
- RTK Query for session API
- SignalR for real-time updates

---

## Implementation Phases

| Phase | Description | Hours |
|-------|-------------|-------|
| 4.1 | SignalR Infrastructure | 6h |
| 4.2 | Chat Panel | 4h |
| 4.3 | Participant Management | 4h |
| 4.4 | Event Log | 3h |
| 4.5 | Session UI | 3h |
| 4.6 | Integration & Testing | 2h |
| **Total** | | **22h** |

---

## Dependencies

### Prerequisites
- ✅ EPIC-001 complete (React migration)
- ✅ Backend Game API complete
- ✅ SignalR hubs implemented

### Blocks
- None

---

## Success Criteria

- [ ] SignalR connection established and maintained
- [ ] Chat messages sent and received in real-time
- [ ] Participant list updates automatically
- [ ] Game events logged and displayed
- [ ] Session join/leave flows functional
- [ ] Encounter activation working for GM
- [ ] Reconnection handling robust

---

## Related Documentation

- **Original Phase**: `Documents/Tasks/EPIC-001/phases/PHASE_10_GAME_SESSIONS.md`
- **Backend Code**: `Source/Game/`
- **API Endpoints**: 12 total in `GameSessionEndpointsMapper.cs`

---

## Change Log

- **2025-12-09**: EPIC-004 created from EPIC-001 Phase 10
