# Phase 3: Service Layer

**Status**: 📋 Planned
**Estimated**: 30-36h | **Actual**: TBD
**Completed**: TBD
**Grade**: TBD

---

## Objective

Implement service methods, API contracts (DTOs), and controllers for all 6 new element types

---

## Prerequisites

- Phase 2 complete (database and repositories ready)
- Existing IEncounterService interface reviewed
- ASP.NET Core Web API patterns understood

---

## Implementation Sequence

1. **Service Interface Updates** (Backend) - 4h
   - Update `IEncounterService` interface with 40+ new async methods
   - Add Actors methods: GetActorAsync, ListActorsAsync, AddActorAsync, UpdateActorAsync, RemoveActorAsync
   - Add Props methods (5 methods)
   - Add Traps methods (5 methods)
   - Add Effects methods (5 methods)
   - Add Decorations methods (5 methods)
   - Add Audio methods (5 methods)
   - Agent: backend-developer
   - Dependencies: Phase 2 complete

2. **API Contracts - Request DTOs** (Backend) - 3h
   - Create `AddActorRequest` record (AssetId, Position, Rotation, Size, HP, StatBlockId, FrameSettings, Visibility)
   - Create `UpdateActorRequest` record (same fields, all optional except Id)
   - Create `AddPropRequest`, `UpdatePropRequest`
   - Create `AddTrapRequest`, `UpdateTrapRequest`
   - Create `AddEffectRequest`, `UpdateEffectRequest`
   - Create `AddDecorationRequest`, `UpdateDecorationRequest`
   - Create `AddAudioRequest`, `UpdateAudioRequest`
   - Add validation attributes ([Required], [Range], [MaxLength])
   - Agent: backend-developer
   - Dependencies: Phase 1 entities

3. **API Contracts - Response DTOs** (Backend) - 3h
   - Create `ActorResponse` record (all properties from EncounterActor)
   - Create `PropResponse`, `TrapResponse`, `EffectResponse`, `DecorationResponse`, `AudioResponse`
   - Add mapping methods (ToDomain, FromDomain)
   - Agent: backend-developer
   - Dependencies: Phase 1 entities

4. **Service Implementation - Actors** (Backend) - 6h
   - Implement `GetActorAsync(encounterId, actorId)` → ActorResponse
   - Implement `ListActorsAsync(encounterId, filter)` → IEnumerable<ActorResponse>
   - Implement `AddActorAsync(encounterId, request)` → ActorResponse
   - Implement `UpdateActorAsync(encounterId, actorId, request)` → ActorResponse
   - Implement `RemoveActorAsync(encounterId, actorId)` → void
   - Add validation, error handling, authorization checks
   - Agent: backend-developer
   - Dependencies: 3.1, 3.2, 3.3 complete

5. **Service Implementation - Props/Traps/Effects** (Backend) - 12h
   - Implement 5 methods for Props - 4h
   - Implement 5 methods for Traps - 4h
   - Implement 5 methods for Effects - 4h
   - Add validation, error handling
   - Agent: backend-developer
   - Dependencies: 3.1, 3.2, 3.3 complete

6. **Service Implementation - Decorations/Audio** (Backend) - 8h
   - Implement 5 methods for Decorations - 4h
     - Special handling for ResourceType validation
   - Implement 5 methods for Audio - 4h
     - Special handling for AudioType (Global vs Positional)
   - Agent: backend-developer
   - Dependencies: 3.1, 3.2, 3.3 complete

7. **API Controllers** (Backend) - 8h
   - Create `ActorsController` - 2h
     - GET /api/v2/encounters/{id}/actors (list)
     - GET /api/v2/encounters/{id}/actors/{actorId} (single)
     - POST /api/v2/encounters/{id}/actors (create)
     - PUT /api/v2/encounters/{id}/actors/{actorId} (update)
     - DELETE /api/v2/encounters/{id}/actors/{actorId} (delete)
   - Create `PropsController` (6 endpoints) - 1h
   - Create `TrapsController` (6 endpoints) - 1h
   - Create `EffectsController` (6 endpoints) - 1h
   - Create `DecorationsController` (6 endpoints) - 1h
   - Create `AudioController` (6 endpoints) - 1h
   - Add Swagger documentation attributes
   - Add authorization attributes ([Authorize])
   - Agent: backend-developer
   - Dependencies: 3.4, 3.5, 3.6 complete

8. **Unit Tests** (Backend) - 8h
   - Write service layer unit tests (60+ tests)
   - Write controller unit tests (36+ tests)
   - Use mocked repositories
   - Target: ≥80% code coverage
   - Agent: backend-developer
   - Dependencies: 3.4-3.7 complete

9. **Integration Tests** (Backend) - 6h
   - Write API integration tests (36+ tests)
   - Test all endpoints with real database (in-memory)
   - Test validation errors, authorization
   - Agent: backend-developer
   - Dependencies: 3.7 complete

---

## Success Criteria

- ✅ All 40+ service methods implemented
- ✅ All 36 API endpoints functional (6 types × 6 endpoints)
- ✅ Request/response DTOs validated correctly
- ✅ Swagger documentation generated for all endpoints
- ✅ Unit tests pass ≥80% coverage (60+ service, 36+ controller tests)
- ✅ Integration tests pass (36+ tests)
- ✅ Security review passed (OWASP compliance)
- ✅ Code review approved (Grade A- or better)

---

## Dependencies

- **Prerequisites**: Phase 2 complete
- **Blocks**: Phase 4 (Command Pattern)

---

## Related Documentation

- [PRD Section 10](../PRD.md#10-api-design--versioning) - API design specification

---

**Version**: 1.0
**Created**: 2025-12-28
