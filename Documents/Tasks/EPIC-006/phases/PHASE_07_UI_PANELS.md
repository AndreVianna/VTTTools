# Phase 7: UI Panels

**Status**: 📋 Planned
**Estimated**: 36-42h | **Actual**: TBD
**Completed**: TBD
**Grade**: TBD

---

## Objective

Create 9 UI panels for element management with unified decoration browser

---

## Prerequisites

- Phase 5 complete (RTK Query API ready)
- Phase 6 complete (renderers ready for preview)

---

## Implementation Sequence

1. **Panel Infrastructure** (Frontend) - 4h
   - Create base ElementPanel component (reusable accordion panel)
   - Create base PropertyEditor component
   - Agent: frontend-developer

2. **Actors Panel** (Frontend + UX) - 6h
   - Create ActorsPanel component (list view with drag-to-add)
   - Create ActorPropertyEditor (HP, AC, StatBlock, frames)
   - UX review
   - Agent: frontend-developer + ux-designer

3. **Props Panel** (Frontend + UX) - 5h
   - Create PropsPanel, PropPropertyEditor (state machine, interactive properties)
   - Agent: frontend-developer + ux-designer

4. **Traps Panel** (Frontend + UX) - 5h
   - Create TrapsPanel, TrapPropertyEditor (trigger, damage, save DC)
   - Agent: frontend-developer + ux-designer

5. **Effects Panel** (Frontend + UX) - 5h
   - Create EffectsPanel, EffectPropertyEditor (duration, AOE, conditions)
   - Agent: frontend-developer + ux-designer

6. **Decorations Panel** (Frontend + UX) - 6h
   - Create DecorationsPanel with unified browser ([📷 Images] [✨ Sprites] tabs)
   - Create DecorationPropertyEditor (ResourceType, layer, opacity, animation)
   - UX review
   - Agent: frontend-developer + ux-designer

7. **Audio Panel** (Frontend + UX) - 5h
   - Create AudioPanel, AudioPropertyEditor (positional vs global, volume, loop)
   - Agent: frontend-developer + ux-designer

8. **Panel Organization** (UX) - 4h
   - Organize panels with category headers (Game Elements, Structural Elements)
   - Add panel icons
   - UX final review
   - Agent: ux-designer

---

## Success Criteria

- ✅ All 9 panels functional
- ✅ Property editors validate input
- ✅ Filtering/search works in all panels
- ✅ Drag-to-add from panels to canvas works
- ✅ Unified decoration browser approved by UX
- ✅ Unit tests pass (45+ tests)
- ✅ Code review approved (Grade A- or better)

---

## Dependencies

- **Prerequisites**: Phases 5, 6 complete
- **Blocks**: Phase 8 (Encounter Editor integration)

---

**Version**: 1.0
**Created**: 2025-12-28
