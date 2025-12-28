# Phase 8: Encounter Editor Integration

**Status**: 📋 Planned
**Estimated**: 48-54h | **Actual**: TBD
**Completed**: TBD
**Grade**: TBD

---

## Objective

Integrate panels, update Konva layers, implement context menus, drag-and-drop, and keyboard shortcuts

---

## Prerequisites

- Phase 4 complete (commands ready)
- Phase 6 complete (renderers ready)
- Phase 7 complete (panels ready)

---

## Implementation Sequence

1. **Panel Integration** (Frontend) - 8h
   - Integrate 9 panels into EncounterEditorPage
   - Update panel layout (collapsible sidebar)
   - Agent: frontend-developer

2. **Konva Layer Management** (Frontend) - 12h
   - Update layer system for 9 element types (15 total layers)
   - Implement z-index management
   - Test rendering order
   - Agent: frontend-developer

3. **Drag-and-Drop - Actors/Props** (Frontend) - 8h
   - Implement drag from ActorsPanel/PropsPanel to canvas
   - Implement smart positioning (snap to grid)
   - Integrate AddActorCommand/AddPropCommand
   - Agent: frontend-developer

4. **Drag-and-Drop - Other Elements** (Frontend) - 10h
   - Implement drag for Traps, Effects, Decorations, Audio
   - Test all drag-and-drop interactions
   - Agent: frontend-developer

5. **Context Menus** (Frontend) - 10h
   - Create ActorContextMenu, PropContextMenu, TrapContextMenu, EffectContextMenu, DecorationContextMenu
   - Agent: frontend-developer

6. **Selection and Transformation** (Frontend) - 8h
   - Update multi-selection for all element types
   - Update transform handles (move, rotate)
   - Integrate UpdateCommand for all types
   - Agent: frontend-developer

7. **Keyboard Shortcuts** (Frontend) - 4h
   - Update Delete key handler, Ctrl+Z/Y (undo/redo), Ctrl+C/V (copy/paste)
   - Agent: frontend-developer

8. **Integration Tests** (Frontend) - 8h
   - Write integration tests for all workflows (20+ tests)
   - Agent: frontend-developer

---

## Success Criteria

- ✅ All 9 panels integrated
- ✅ Drag-and-drop works for all element types
- ✅ Context menus appropriate for each type
- ✅ Multi-selection works with mixed types
- ✅ Undo/redo works for all operations
- ✅ Keyboard shortcuts work consistently
- ✅ 60 FPS with 100+ elements
- ✅ Integration tests pass (20+ tests)
- ✅ Code review approved (Grade A- or better)

---

## Dependencies

- **Prerequisites**: Phases 4, 6, 7 complete
- **Blocks**: Phase 10 (Database Migration)

---

**Version**: 1.0
**Created**: 2025-12-28
