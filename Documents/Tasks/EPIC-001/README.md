# EPIC-001: UI Migration (Blazor to React)

**Quick Start Guide for New Sessions**

**Current Phase**: Phase 7 (Scene Management)
**Status**: Documentation complete, ready for implementation
**Last Updated**: 2025-10-23

---

## 🚀 New Session? Start Here

**Read in this order** (15 minutes total):

1. **This file** (you are here) - 2 minutes
2. **ROADMAP.md** - Phase 7 section - 5 minutes
3. **phases/PHASE-7-DESIGN.md** - Implementation details - 8 minutes
4. **../Architecture/CONTENT-LIBRARY.md** - Architecture context - Optional

---

## Current Status Summary

**Completed**: Phases 1-6 (68.9% of epic)
- ✅ Phase 1-2: Foundation, Auth, Landing
- ✅ Phase 3-4: Scene Editor (Pan/Zoom, Grid/Layers)
- ✅ Phase 5: Asset Library
- ✅ Phase 6: Scene Editor enhancements (Tokens, Undo/Redo, Multi-select, Collision)

**Current**: Phase 7 (Scene Management)
- 📝 Documentation: COMPLETE
- 🔧 Implementation: READY TO START
- ⏱️ Estimated: 21 hours (17h code + 4h docs done)

**Next**: Phase 8 (Adventures), Phase 10 (Game Sessions)

---

## What is Phase 7?

**Objective**: Enable users to create, browse, edit, and manage scenes with backend persistence

**Revolutionary Approach**: "Editor-as-CRUD"
- Scene Editor IS the scene form (no separate dialogs)
- Properties in menus (Scene menu, Stage menu)
- Editable title in header
- Auto-save (3s debounce)
- Like Figma/Google Docs/Notion

**Key Deliverables**:
1. Content Library page with tabs (Scenes active)
2. Scene list with cards (browse, search, filter)
3. Enhanced Scene Editor:
   - Scene menu (adventure, description, published)
   - Editable scene name in header
   - Grid config in Stage menu
   - Auto-save to backend
4. Infrastructure for Adventures (Phase 8) - 60-70% reusable

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

**Scene-Specific**:
- Scene list with cards
- Scene menu in editor (adventure, description, published)
- Editable scene name in header
- Grid config moved to Stage menu
- Scenes API (RTK Query)

### Implementation Steps

**Phase 7A**: Foundation (4h) - Types, routing, shared components
**Phase 7B**: Scene List (3h) - List view, cards, search
**Phase 7C**: Scenes API (3h) - RTK Query, mappers
**Phase 7D**: Scene Menu (3h) - Metadata in menu bar
**Phase 7E**: Header (2h) - Editable title, back button
**Phase 7F**: Stage Menu (2h) - Grid config migration

**Total**: 17 hours implementation

### Key Architecture Decisions

1. **No SceneCRUDDialog** - Editor is the form
2. **Menu Organization**:
   - Scene menu = metadata (adventure, description, published)
   - Stage menu = canvas config (background, grid, stage size)
3. **Auto-save**: 3s debounce, optimistic updates
4. **Routing**: `/content-library/scenes` list, `/scene-editor/:sceneId` editor
5. **Reusability**: Build shared components that work for all hierarchy levels

---

## Backend API Status

**Scenes API**: ✅ Fully implemented
- `GET /api/library/scenes` - List scenes
- `GET /api/library/scenes/:id` - Get scene
- `POST /api/library/scenes` - Create scene
- `PUT /api/library/scenes/:id` - Update scene
- `DELETE /api/library/scenes/:id` - Delete scene

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
