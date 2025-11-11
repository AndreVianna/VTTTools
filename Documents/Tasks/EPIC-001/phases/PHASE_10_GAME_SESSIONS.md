# Phase 10: Game Sessions - Real-Time Collaboration

**Status**: 🔜 Ready (Backend ✅ Complete | Frontend ❌ Not Started)
**Estimated**: 22h (frontend only)
**Backend**: ✅ COMPLETE (12 endpoints, 5 tests)
**Frontend**: ❌ NOT STARTED (0%)

---

## Objective

Implement real-time game session UI with SignalR for chat, events, and participant management

---

## Backend Status ✅ COMPLETE

**Location**: `/home/user/VTTTools/Source/Game/`

**Delivered**:
- GameSessionService with 10 handlers (Create, List, Get, Update, Delete, Join, Leave, Start, Stop, ActivateEncounter)
- 12 API endpoints (10 session + 2 config)
- Domain models: GameSession with Messages/Events/Participants collections
- 5 unit tests
- Files: `GameSessionHandlers.cs` (145 lines), `GameSessionEndpointsMapper.cs` (18 lines)

**SignalR**: 9.0.6 installed

---

## Frontend Status ❌ NOT STARTED

- No HubConnection usage found
- gameSessionsApi RTK Query slice exists but no UI components
- Zero frontend code written

---

## Deliverables

- **Service**: SignalRProvider
  - Description: SignalR connection lifecycle management (connect, disconnect, reconnect)
  - Complexity: Very High
  - Dependencies: Backend SignalR hubs (ChatHub, GameSessionHub)

- **Component**: ChatPanel
  - Description: Real-time chat UI with message history and input
  - Complexity: High
  - Dependencies: SignalRProvider

- **Component**: ParticipantList
  - Description: Live participant roster with roles and status indicators
  - Complexity: Medium
  - Dependencies: SignalRProvider

- **Component**: GameEventLog
  - Description: Event stream (dice rolls, asset movements, status changes)
  - Complexity: Medium
  - Dependencies: SignalRProvider

- **Service**: ConnectionResilienceManager
  - Description: Auto-reconnect, message queuing, replay on reconnect
  - Complexity: Very High
  - Dependencies: SignalRProvider

- **API**: gameSessionApi RTK Query slice
  - Description: API integration for /api/game-sessions endpoints
  - Complexity: Medium
  - Dependencies: None

---

## Implementation Sequence

1. **Game Session API Slice** (UI) - 3h
   - Create RTK Query endpoints for /api/game-sessions
   - Dependencies: Phase 1 complete

2. **SignalRProvider Setup** (UI) - 6h
   - SignalR Client connection with hub lifecycle
   - Dependencies: Backend hubs ready

3. **ChatPanel Component** (UI) - 5h
   - Real-time chat with SignalR message handling
   - Dependencies: SignalRProvider

4. **ParticipantList Component** (UI) - 3h
   - Live participant updates via SignalR
   - Dependencies: SignalRProvider

5. **GameEventLog Component** (UI) - 3h
   - Event stream rendering with types (dice, movement, status)
   - Dependencies: SignalRProvider

6. **ConnectionResilienceManager** (UI) - 2h
   - Auto-reconnect, message queue, replay logic
   - Dependencies: SignalRProvider

---

## Success Criteria

- ⬜ SignalR connection stable with auto-reconnect
- ⬜ Chat messages appear within 100ms
- ⬜ Participant list updates in real-time
- ⬜ Events broadcast to all participants
- ⬜ Connection resilience handles drops gracefully

---

## Dependencies

- **Prerequisites**: Phase 7 (encounters - sessions reference encounters)
- **Optional**: Phase 8 (adventures - sessions MAY reference adventures)
- **Backend Dependency**: SignalR hubs (ChatHub, GameSessionHub) - assumed implemented
- **Blocks**: None

**Note**: Phase 10 can proceed after Phase 7, even if Phase 9 is blocked. Sessions reference encounters directly.

---

## Validation

- Validate after phase: Multi-user testing, SignalR stress test, connection drop simulation
- Quality gate: <100ms message latency, auto-reconnect working, no message loss

---

## Related Documentation

- [Main Roadmap](../ROADMAP.md) - Overall progress
- [Backend Game Session API](../../Source/Game/) - Implementation details
