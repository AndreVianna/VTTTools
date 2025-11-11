# EPIC-001: UI Migration (Blazor to React)

**Quick Start Guide for New Sessions**

**Current Phase**: Phase 8 (Encounter Management)
**Status**: Ready to start
**Last Updated**: 2025-10-25

---

## 🚀 New Session? Start Here

**Read in this order** (10 minutes total):

1. **This file** (you are here) - 2 minutes
2. **ROADMAP.md** - Phase 8 section - 5 minutes
3. **../Architecture/CONTENT-LIBRARY.md** - Architecture context - 3 minutes

---

## Current Status Summary

**Completed**: Phases 1-7 (75.8% of epic)
- ✅ Phase 1-2: Foundation, Auth, Landing
- ✅ Phase 3-4: Encounter Editor (Pan/Zoom, Grid/Layers)
- ✅ Phase 5: Asset Library
- ✅ Phase 6: Encounter Editor enhancements (Tokens, Undo/Redo, Multi-select, Collision)
- ✅ Phase 7: Adventure Management (Library page, Adventure CRUD, contentApi integration)

**Current**: Phase 8 (Encounter Management)
- 🔧 Implementation: READY TO START
- ⏱️ Estimated: 12 hours
- 📋 Deliverables: Encounter operations, Encounter Editor backend integration

**Next**: Phase 9 (Campaigns - blocked), Phase 10 (Game Sessions), Phase 11 (Account Settings)

---

## What Was Phase 7?

**Objective**: Implement Adventure Management as foundation for content hierarchy

**Architectural Discovery**: Backend uses DDD aggregate pattern
- Adventures are aggregate roots (containers)
- Encounters are child entities (content)
- Swapped Phase 7/8 to align with backend architecture

**Key Deliverables** (COMPLETED 2025-10-25):
1. Library page with unified content view (no tabs)
2. Adventure List with contentApi integration:
   - Infinite scroll pagination with cursor
   - 4 comprehensive filters (Type, Style, Status, Ownership)
   - Debounced search (500ms)
   - Create/Delete/Duplicate operations
3. Adventure Detail page:
   - Inline metadata editing (name, description, style)
   - Auto-save on blur/change
   - IsOneShot and IsPublished toggles
   - Background image upload
   - Encounter list display
   - Add encounter functionality
4. Infrastructure for Phase 8 (Encounters) - 70% reusable

**Grade**: B+ (88/100) → A- (92/100) after critical fixes

---

## What is Phase 8?

**Objective**: Implement Encounter Management within Adventure context

**Approach**: Encounters as child entities of Adventures
- Encounters created/edited within adventure
- No standalone encounter CRUD
- Encounter Editor integrated with backend persistence
- Auto-save for encounter changes

**Key Deliverables** (12 hours estimated):
1. Encounter operations from Adventure Detail:
   - Duplicate encounter
   - Delete encounter with confirmation
2. Encounter Editor backend integration:
   - Load encounter by ID from `/api/encounters/{id}`
   - Auto-save changes via PATCH `/api/encounters/{id}`
   - Encounter Menu showing parent adventure
   - Editable encounter name in header
   - Grid configuration persistence
3. Navigation improvements:
   - Back button: Encounter Editor → Adventure Detail
   - Save status indicators
   - Unsaved changes warning

**Implementation Phases**:
- Phase 8A: Encounter operations in Adventure Detail (3h)
- Phase 8B: Encounter Editor backend integration (4h)
- Phase 8C: Encounter Menu component (3h)
- Phase 8D: Header and navigation (2h)

---

## What Was Phase 6?

**Just Completed** (2025-10-23):
- Token placement with snap-to-grid
- Multi-asset selection (click, Ctrl+click, marquee)
- Advanced snap modes (Alt/Ctrl/Ctrl+Alt)
- Collision detection with visual markers
- Multi-asset group dragging
- Undo/Redo system (100 levels, batch commands, Memento pattern)
- Layout architecture (EditorLayout vs AppLayout)

**See**: `phases/PHASE-6-COMPLETION-SUMMARY.md` for full details

---

## Document Index

### Essential Documents (Active)

**Start Here**:
- `README.md` - This file (orientation)
- `ROADMAP.md` - Master plan, all phases, current status (58KB)
- `TASK.md` - Epic definition, success criteria (22KB)

**Phase 7 Specifications**:
- `phases/PHASE-7-DESIGN.md` - User flows, UI specs, implementation steps (28KB)
- `../Architecture/CONTENT-LIBRARY.md` - Hierarchy model, patterns (13KB)
- `../Architecture/CONTENT-LIBRARY-COMPONENTS.md` - Component specifications (19KB)

**Phase 6 Reference**:
- `phases/PHASE-6-COMPLETION-SUMMARY.md` - What was just completed (7KB)

### Historical Documents (Archive)

**Location**: `archive/` folder

**Contents**: Implementation summaries and validation results from completed phases
- BDD implementation summaries (Phases 2, 5-6, 10)
- Validation results (Phase 4)
- Asset categorization (Phase 5)
- Implementation notes

**When to reference**: Understanding past decisions, debugging issues from previous phases

### Project-Wide Guides (Reference)

**Location**: `Documents/Guides/`

**Key Guides**:
- VTTTOOLS_STACK.md - Complete technology stack
- CODE_EXAMPLES.md - Pattern examples (backend, frontend, testing)
- COMMON_COMMANDS.md - Build, test, deployment commands
- TYPESCRIPT_STYLE_GUIDE.md - VTTTools TypeScript conventions
- CODING_STANDARDS.md - General coding standards

---

## Phase 7 Quick Reference

### What to Build

**Infrastructure** (60-70% reusable in Phase 8):
- Content Library page with tabs
- Shared components: EditableTitle, ContentCard, ContentListLayout
- Auto-save framework

**Encounter-Specific**:
- Encounter list with cards
- Encounter menu in editor (adventure, description, published)
- Editable encounter name in header
- Grid config moved to Stage menu
- Encounters API (RTK Query)

### Implementation Steps

**Phase 7A**: Foundation (4h) - Types, routing, shared components
**Phase 7B**: Encounter List (3h) - List view, cards, search
**Phase 7C**: Encounters API (3h) - RTK Query, mappers
**Phase 7D**: Encounter Menu (3h) - Metadata in menu bar
**Phase 7E**: Header (2h) - Editable title, back button
**Phase 7F**: Stage Menu (2h) - Grid config migration

**Total**: 17 hours implementation

### Key Architecture Decisions

1. **No EncounterCRUDDialog** - Editor is the form
2. **Menu Organization**:
   - Encounter menu = metadata (adventure, description, published)
   - Stage menu = canvas config (background, grid, stage size)
3. **Auto-save**: 3s debounce, optimistic updates
4. **Routing**: `/content-library/encounters` list, `/encounter-editor/:encounterId` editor
5. **Reusability**: Build shared components that work for all hierarchy levels

---

## Backend API Status

**Encounters API**: ✅ Fully implemented
- `GET /api/library/encounters` - List encounters
- `GET /api/library/encounters/:id` - Get encounter
- `POST /api/library/encounters` - Create encounter
- `PUT /api/library/encounters/:id` - Update encounter
- `DELETE /api/library/encounters/:id` - Delete encounter

**Ready to integrate** - no backend blockers

---

## Naming Convention

**Phase Documents**: `PHASE-{N}-{TYPE}.md`
- Types: DESIGN, SUMMARY, VALIDATION, BDD-SUMMARY
- Example: PHASE-7-DESIGN.md

**Architecture**: `{FEATURE}.md` or `{FEATURE}-{ASPECT}.md`
- Example: CONTENT-LIBRARY.md, CONTENT-LIBRARY-COMPONENTS.md

**General**: ALL-CAPS-WITH-HYPHENS.md
- README.md, TASK.md, ROADMAP.md

---

## Quick Commands

**Start Phase 7 Implementation**:
```bash
# Navigate to project
cd Source/WebClientApp

# Create feature folder
mkdir -p src/features/content-library

# Run tests
npm test

# Start dev server
npm run dev
```

**Review Documentation**:
```bash
# Phase 7 design
cat Documents/Tasks/EPIC-001/phases/PHASE-7-DESIGN.md

# Architecture
cat Documents/Architecture/CONTENT-LIBRARY.md
```

---

## What to Do Next

**Immediate Next Steps** (for new session):

1. ✅ Read this README (you're here)
2. ✅ Read ROADMAP.md Phase 7 section (5 min)
3. ✅ Read phases/PHASE-7-DESIGN.md (10 min)
4. ✅ Review architecture docs (optional, 10 min)
5. 🚀 **Begin Phase 7A: Foundation** (4 hours)
   - Create `src/features/content-library/` structure
   - Define TypeScript interfaces
   - Build ContentLibraryPage with tabs
   - Set up routing

**Full Implementation Sequence**: See ROADMAP.md Phase 7 section

---

## Contact / Questions

- Epic Owner: VTTTools Development Team
- Architecture: See CONTENT-LIBRARY.md
- Questions: Check ROADMAP.md or PHASE-7-DESIGN.md first

---

**Version**: 1.0
**Created**: 2025-10-23
**For**: EPIC-001 Phase 7 and beyond
