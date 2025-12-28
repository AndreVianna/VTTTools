# Phase 6: Rendering Components

**Status**: 📋 Planned
**Estimated**: 30-36h | **Actual**: TBD
**Completed**: TBD
**Grade**: TBD

---

## Objective

Create Konva rendering components for 9 element types with conditional frame logic

---

## Prerequisites

- Phase 5 complete (TypeScript types defined)
- Existing Konva rendering reviewed

---

## Implementation Sequence

1. **Rendering Infrastructure Review** (Frontend) - 2h
   - Review existing Konva layer system
   - Document conditional frame logic requirements
   - Agent: frontend-developer

2. **Actor Renderer** (Frontend + UX) - 6h
   - Create ActorRenderer component with frames, token image, HP bar, selection highlight
   - Agent: frontend-developer + ux-designer

3. **Prop Renderer** (Frontend + UX) - 5h
   - Create PropRenderer (NO frames, blends with map, state indicator)
   - Agent: frontend-developer + ux-designer

4. **Trap Renderer** (Frontend + UX) - 5h
   - Create TrapRenderer (trigger area, state indicator, visibility toggle)
   - Agent: frontend-developer + ux-designer

5. **Effect Renderer** (Frontend + UX) - 5h
   - Create EffectRenderer (AOE visualization, duration indicator, condition icons)
   - Agent: frontend-developer + ux-designer

6. **Decoration Renderer** (Frontend + UX) - 4h
   - Create DecorationRenderer (NO frames, ResourceType handling, animation playback)
   - Agent: frontend-developer + ux-designer

7. **Audio Renderer** (Frontend + UX) - 3h
   - Create AudioRenderer (visual icon, positional/global indicator)
   - Agent: frontend-developer + ux-designer

8. **Renderer Integration** (Frontend + UX) - 6h
   - Integrate all 9 renderers into EncounterCanvas
   - Implement z-index management
   - UX review
   - Agent: frontend-developer + ux-designer

---

## Success Criteria

- ✅ All 9 element types render correctly
- ✅ ONLY Actors have frames
- ✅ Selection highlights work for all types
- ✅ Rendering performance: 60 FPS with 100+ elements
- ✅ Visual consistency approved by UX
- ✅ Code review approved (Grade A- or better)

---

## Dependencies

- **Prerequisites**: Phase 5 complete
- **Blocks**: Phase 7 (UI Panels), Phase 8 (Encounter Editor)

---

**Version**: 1.0
**Created**: 2025-12-28
