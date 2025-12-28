# Phase 5: Frontend Types

**Status**: 📋 Planned
**Estimated**: 18-24h | **Actual**: TBD
**Completed**: TBD
**Grade**: TBD

---

## Objective

Create TypeScript interfaces and RTK Query API definitions for all element types

---

## Prerequisites

- Phase 3 complete (API contracts finalized)
- Phase 1 complete (domain model defined)

---

## Implementation Sequence

1. **Domain Type Definitions** (Frontend) - 6h
   - Create EncounterActor, EncounterProp, EncounterTrap, EncounterEffect, EncounterDecoration, EncounterAudio interfaces
   - Match backend entities exactly
   - Agent: frontend-developer

2. **Enum Definitions** (Frontend) - 2h
   - Create ResourceType, PropState, TrapState enums
   - Update AssetKind enum
   - Agent: frontend-developer

3. **Request/Response Types** (Frontend) - 4h
   - Create request types (18 types)
   - Create response types (6 types)
   - Ensure exact match with backend
   - Agent: frontend-developer

4. **RTK Query API Slice - Actors** (Frontend) - 3h
   - Create actorsApi slice with 5 endpoints
   - Agent: frontend-developer

5. **RTK Query API Slices - Other Elements** (Frontend) - 9h
   - Create propsApi, trapsApi, effectsApi, decorationsApi, audioApi slices (5 endpoints each)
   - Agent: frontend-developer

6. **Type Guards and Utilities** (Frontend) - 2h
   - Create type guard functions (isActor, isProp, etc.)
   - Create utility functions (getElementType, hasFrames, isGameElement)
   - Agent: frontend-developer

7. **Unit Tests** (Frontend) - 4h
   - Write tests for type guards (15+ tests)
   - Target: ≥70% coverage
   - Agent: frontend-developer

---

## Success Criteria

- ✅ All TypeScript types match backend entities exactly
- ✅ All 30 RTK Query endpoints defined
- ✅ Type guards compile without errors
- ✅ No TypeScript errors in strict mode
- ✅ Unit tests pass (15+ tests)
- ✅ Code review approved (Grade A- or better)

---

## Dependencies

- **Prerequisites**: Phase 3 complete
- **Blocks**: Phase 6 (Rendering Components)

---

**Version**: 1.0
**Created**: 2025-12-28
