# EPIC-006: Encounter Domain Model Refactoring

**Target Type**: Epic (System)
**Target Item**: EPIC-006
**Item Specification**: Documents/Tasks/EPIC-006/PRD.md
**Created**: 2025-12-28
**Status**: 📋 PLANNED
**Estimated Effort**: ~180-220 hours (18-20 weeks)

---

## Objective

Refactor the VTTTools encounter domain model to eliminate conceptual overlap and improve maintainability through a perception-based, semantic categorization system.

**From**: 2-tier classification (EncounterAsset, EncounterSound)
**To**: 2-category, 9-element-type system (Game Elements, Structural Elements)

---

## Problem Statement

### Current Issues

1. **Conceptual Confusion**
   - EncounterAsset conflates gameplay elements (Characters/Creatures) with environment (Objects)
   - "Effect" exists in asset library but belongs in encounter mechanics
   - "Object" can mean interactive furniture OR passive decoration

2. **Missing Element Types**
   - No Trap entity (hybrid between environment and gameplay)
   - No Effect entity (spell zones, active conditions)
   - No distinction between interactive Props vs passive Decorations

3. **Media System Limitations**
   - Only audio supported
   - Video and sprite animations needed
   - No unified approach to visual media

4. **Impedance Mismatch**
   - Domain model uses embedded ResourceMetadata
   - Data layer uses junction tables
   - Inconsistent asset references

---

## Proposed Solution

### Design Principle: Perception-Based Categories

**Core Insight**: Categories should be based on **semantic behavior** (game mechanics vs environment), not file formats or implementation details.

**Two Semantic Categories:**

| Category | Criterion | Element Types |
|----------|-----------|---------------|
| **Game Elements** | Has game rules/mechanics | Actor, Prop, Trap, Effect |
| **Structural Elements** | Passive environment | Wall, Region, Light, Decoration, Audio |

**Key Insights:**
1. **Visual media unified** - Images, sprites, videos are all "pixels on the map." File format is implementation detail.
2. **Audio separate** - Different perception mechanism (ears vs eyes), different UI controls.
3. **Traps and Effects are game elements** - They have damage, saves, durations (game mechanics).

---

## Scope

### Domain Model Changes

**New Entities:**
- `EncounterActor` - Characters + Creatures (with frames, StatBlocks)
- `EncounterProp` - Interactive objects (no frames, state machine)
- `EncounterTrap` - Triggered hazards (damage, saves, triggers)
- `EncounterEffect` - Spell zones (duration, AOE, conditions)
- `EncounterDecoration` - Unified visual media (images/sprites, ResourceType enum)
- `EncounterAudio` - Auditory media (global or positional)

**Modified Entities:**
- `Encounter` - 9 collections (down from 12)
- `AssetKind` enum - Remove Effect/Object, add Prop/Decoration

**Removed Entities:**
- `EncounterAsset` - Split into Actor/Prop
- `EncounterSound` - Replaced by Audio
- `EncounterVideo` - Unified into Decoration
- `EncounterSprite` - Unified into Decoration

### Database Changes

**New Tables (6):**
- EncounterActors
- EncounterProps
- EncounterTraps
- EncounterEffects
- EncounterDecorations (with ResourceType enum)
- EncounterAudios

**Dropped Tables (2):**
- EncounterAssets
- EncounterSounds

### API Changes

**New Endpoints (~30-35):**
- `/api/v2/encounters/{id}/actors` (GET, POST, PUT, DELETE)
- `/api/v2/encounters/{id}/props` (GET, POST, PUT, DELETE)
- `/api/v2/encounters/{id}/traps` (GET, POST, PUT, DELETE)
- `/api/v2/encounters/{id}/effects` (GET, POST, PUT, DELETE)
- `/api/v2/encounters/{id}/decorations` (GET, POST, PUT, DELETE)
- `/api/v2/encounters/{id}/audio` (GET, POST, PUT, DELETE)

**Deprecation:**
- V1 endpoints maintained for 6 months
- Deprecation headers added
- Migration guide provided

### Frontend Changes

**UI Panels (9 element panels):**

**Game Elements (4 panels):**
- 👥 Actors Panel
- 📦 Props Panel
- ⚡ Traps Panel
- ✨ Effects Panel

**Structural Elements (5 panels):**
- 🧱 Walls Panel (unchanged)
- 📐 Regions Panel (unchanged)
- 💡 Lights Panel (unchanged)
- 🌳 Decorations Panel (unified image/sprite browser)
- 🔊 Audio Panel

**Key UX Changes:**
- Unified decoration browser with [📷 Images] [✨ Sprites] tabs
- Conditional frame rendering (ONLY Actors have frames)
- Props and Decorations blend seamlessly with map (no frames)

---

## Implementation Phases

### Phase 1: Foundation (24-30h)
- Domain entities (9 new)
- Base abstractions (EncounterElement, GameElement, StructuralElement)
- Supporting enums (ResourceType, ObjectState, TrapState, etc.)

### Phase 2: Backend Infrastructure (36-42h)
- Database schema (6 new tables)
- EF Core configuration
- Schema builders and mappers

### Phase 3: Service Layer (30-36h)
- IEncounterService updates (40+ new methods)
- Service implementations
- API contracts (18 request/response classes)
- Controllers (6 new)

### Phase 4: Command Pattern (24-30h)
- 40+ new commands (Add, Update, Remove for each type)
- Undo/redo support
- Command manager integration

### Phase 5: Frontend Types (18-24h)
- TypeScript interfaces (9 element types)
- API type definitions
- RTK Query endpoints (40 endpoints)

### Phase 6: Rendering Components (30-36h)
- 9 element renderers (Actor, Prop, Decoration, Trap, Effect, etc.)
- Conditional frame logic (Actors only)
- State indicators (Props)

### Phase 7: UI Panels (36-42h)
- 9 panel components
- Unified decoration browser
- Property editors (9 types)

### Phase 8: Encounter Editor (48-54h)
- Panel integration
- Konva layer management (15 layers)
- Context menus (5 types)
- Drag-and-drop updates

### Phase 9: Asset Library Updates (18-24h)
- AssetKind enum updates
- Bulk generation form updates
- Unified resource browser

### Phase 10: Database Migration (24-30h)
- Migration scripts (4-phase strategy)
- Rollback scripts
- Data integrity validation
- Performance testing (< 1 hour for 1M encounters)

### Phase 11: Testing & QA (48-60h)
- Unit tests (~180 test cases)
- Integration tests
- E2E test scenarios (20+ workflows)
- Migration testing

### Phase 12: Documentation (12-18h)
- API documentation (Swagger)
- User guides
- Video tutorials
- Migration guide

---

## Acceptance Criteria

### Must Have (MVP)

- ✅ All 9 element types functional (Actor, Prop, Trap, Effect, Wall, Region, Light, Decoration, Audio)
- ✅ Asset library supports new AssetKind values (Prop, Decoration)
- ✅ Frame rendering ONLY for Actors (Props/Decorations blend seamlessly)
- ✅ Traps have trigger areas and damage mechanics
- ✅ Effects have duration tracking
- ✅ All existing encounters migrated successfully
- ✅ Undo/redo works for all new element types
- ✅ V1 API endpoints remain functional (deprecation timeline)
- ✅ Zero data loss during migration

### Should Have (Target)

- ✅ Bulk asset generation supports Props/Decorations
- ✅ AI prompts optimized for Props/Decorations
- ✅ Context menus differentiated by element type
- ✅ Panel organization with category headers
- ✅ Filter/search in all panels
- ✅ Keyboard shortcuts for common actions

### Nice to Have (Stretch)

- 🔄 Trap generator AI tool
- 🔄 Spell effect generator AI tool
- 🔄 Complete encounter generator
- 🔄 Import/export JSON for all element types
- 🔄 Templates for common element configurations

---

## Success Metrics

### Technical Success

**Backend Performance:**
- All API endpoints respond < 200ms (P95)
- Database migration completes < 1 hour
- Zero data loss during migration
- Code coverage ≥80% (backend)
- Zero SQL injection vulnerabilities

**Frontend Performance:**
- Code coverage ≥70% (frontend)
- Encounter loading time < 2 seconds (100 elements)
- Canvas rendering at 60 FPS
- Bundle size increase < 15%
- Lighthouse score ≥90

**Quality Metrics:**
- Zero P0 bugs in production (first 30 days)
- < 5 P1 bugs in production (first 30 days)
- All E2E test scenarios passing
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

### User Experience Success

**Usability:**
- Users can create encounters 20% faster (timed task)
- < 3% user error rate when adding elements
- System Usability Scale (SUS) score > 75
- Task completion rate > 95%

**Adoption:**
- 90% of active users migrated within 30 days
- < 5% support tickets related to new UI
- Average session time unchanged or improved
- Feature usage telemetry shows all panels used

**Satisfaction:**
- Net Promoter Score (NPS) unchanged or improved
- In-app feedback rating ≥4.0/5.0
- < 1% users request V1 UI rollback
- Positive sentiment in user forums

### Business Success

**Delivery:**
- Project completed within 18-20 weeks (+2 week buffer allowed)
- Budget variance < 10%
- All Phase 1-12 deliverables completed
- Zero missed regulatory/compliance requirements

**Operational:**
- Zero unplanned downtime
- Maintenance window < 4 hours
- Rollback not required
- Customer churn rate unchanged

---

## Risk Assessment

### High-Priority Risks

**Risk T1: Data Loss During Migration (HIGH)**
- Mitigation: Complete backup, dry-run on staging, rollback script, keep old tables 6 months
- Contingency: Immediate rollback capability, manual recovery process

**Risk P1: Scope Creep (HIGH)**
- Mitigation: Strict PRD scope, change request process, feature freeze after Phase 8
- Contingency: Move nice-to-have features to Phase 2, reduce test coverage targets

**Risk T2: Performance Degradation (MEDIUM)**
- Mitigation: Database indexing, query optimization, lazy loading, load testing
- Contingency: Rollback to V1 if P95 latency > 2x baseline

---

## Dependencies

### Prerequisites
- EPIC-001 (UI Migration) must be complete
- React 19 + Konva encounter editor functional
- Redux Toolkit + RTK Query infrastructure in place

### Blocks
- AI Content Generation features (depend on this refactoring)
- Advanced trap mechanics
- Spell effect library

---

## Review Gates

Each phase requires:
1. **Code Review** - All code changes reviewed by code-reviewer agent
2. **Testing** - Unit/integration tests passing with required coverage
3. **Security Review** - OWASP compliance check for new endpoints
4. **UX Review** - UI changes reviewed for usability (applicable phases)
5. **Grade** - A-F grade assigned based on criteria
6. **Approval** - Explicit approval to proceed to next phase

**No phase can begin until previous phase is graded A- or better.**

---

## Rollback Strategy

### Phase 1-4 (Backend Only)
- Feature flag disabled, no user impact
- Revert code changes via git
- Drop new database tables

### Phase 5-8 (Frontend Integrated)
- Feature flag to disable new UI
- Fallback to V1 panels
- Maintain old API endpoints

### Phase 10 (Post-Migration)
- Rollback SQL script tested and ready
- Old tables preserved for 6 months
- Manual data recovery process documented

---

## Timeline

**Total Duration**: 18-20 weeks (with 2-week buffer)

**Milestones:**
- Week 3: Phase 1 complete (Domain model)
- Week 6: Phase 2 complete (Database)
- Week 9: Phase 3-4 complete (Services + Commands)
- Week 13: Phase 5-7 complete (Frontend core)
- Week 17: Phase 8-9 complete (UI integration)
- Week 19: Phase 10-11 complete (Migration + Testing)
- Week 20: Phase 12 complete (Documentation), EPIC complete

---

## Related Documentation

- **PRD**: [PRD.md](./PRD.md) - Complete specification (62 pages)
- **Roadmap**: [ROADMAP.md](./ROADMAP.md) - Detailed phase breakdown
- **Architecture**: See PRD Section 3 (Domain Model Design)
- **API Design**: See PRD Section 10 (API Design & Versioning)
- **UI/UX**: See PRD Section 11 (UI/UX Specifications)
- **Testing**: See PRD Section 12 (Testing Strategy)

---

**Version**: 1.0
**Last Updated**: 2025-12-28
**Status**: Ready for stakeholder approval
