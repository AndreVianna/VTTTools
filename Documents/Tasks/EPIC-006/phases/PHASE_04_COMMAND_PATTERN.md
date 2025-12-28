# Phase 4: Command Pattern

**Status**: 📋 Planned
**Estimated**: 24-30h | **Actual**: TBD
**Completed**: TBD
**Grade**: TBD

---

## Objective

Create 40+ command classes with undo/redo support for all element types

---

## Prerequisites

- Phase 3 complete (service layer functional)
- Existing command infrastructure reviewed (ICommand, CommandManager)

---

## Implementation Sequence

1. **Command Infrastructure Review** (Backend) - 2h
   - Review ICommand interface (Execute, Undo, Serialize methods)
   - Review CommandManager implementation
   - Document command serialization pattern
   - Agent: backend-developer

2. **Actor Commands** (Backend) - 6h
   - Create AddActorCommand, UpdateActorCommand, RemoveActorCommand, MoveActorCommand
   - Implement Execute(), Undo(), Serialize() for each
   - Store previous state for undo
   - Agent: backend-developer

3. **Prop Commands** (Backend) - 5h
   - Create AddPropCommand, UpdatePropCommand, RemovePropCommand, MovePropCommand, ChangePropStateCommand
   - Agent: backend-developer

4. **Trap Commands** (Backend) - 5h
   - Create AddTrapCommand, UpdateTrapCommand, RemoveTrapCommand, MoveTrapCommand, TriggerTrapCommand
   - Agent: backend-developer

5. **Effect Commands** (Backend) - 5h
   - Create AddEffectCommand, UpdateEffectCommand, RemoveEffectCommand, MoveEffectCommand, ExpireEffectCommand
   - Agent: backend-developer

6. **Decoration/Audio Commands** (Backend) - 6h
   - Create commands for Decorations (Add, Update, Remove, Move)
   - Create commands for Audio (Add, Update, Remove)
   - Agent: backend-developer

7. **Command Manager Integration** (Backend) - 3h
   - Register all 40+ commands with CommandManager
   - Test undo/redo for each command type
   - Test serialization
   - Agent: backend-developer

8. **Unit Tests** (Backend) - 8h
   - Write tests for all commands (80+ tests)
   - Test Execute() performs action
   - Test Undo() reverses action
   - Test Serialize() returns correct JSON
   - Agent: backend-developer

---

## Success Criteria

- ✅ All 40+ commands implement ICommand
- ✅ Execute() performs action and returns success
- ✅ Undo() reverses action completely
- ✅ Serialize() returns JSON representation
- ✅ Unit tests pass (80+ tests)
- ✅ Code review approved (Grade A- or better)

---

## Dependencies

- **Prerequisites**: Phase 3 complete
- **Blocks**: Phase 8 (Encounter Editor integration)

---

**Version**: 1.0
**Created**: 2025-12-28
