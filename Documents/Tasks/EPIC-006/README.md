# EPIC-006: Encounter Domain Model Refactoring

**Quick Reference Guide**

**Status**: 🔄 IN PROGRESS
**Start Date**: 2025-12-28
**Estimated Effort**: Reduced from original 180-220h estimate (simplified approach)

---

## Implementation Approach (v1.1.0)

**IMPORTANT**: This EPIC uses a **simplified direct replacement approach** based on planning session findings:

### Key Constraints
1. **No Production Data** - Data preservation is NOT required
2. **User-Managed Migrations** - Claude creates scripts, user applies them manually
3. **Direct Replacement** - No V1/V2 API versioning needed
4. **Continuous Functionality** - Code must work at each phase completion
5. **Full Stack Compilation** - Entire stack must compile at phase boundaries

### Entity Changes (Direct Replacement)
- **Stage extracted** as first-class library entity with structural elements
- Current `Stage` value object → renamed to `StageSettings` (avoids naming collision)
- `EncounterAsset` → DELETE and replace with `EncounterActor`, `EncounterProp`
- `EncounterSound` → DELETE and replace with `StageAudio` (on Stage, not Encounter)
- Structural elements (Walls, Regions, Lights, Decorations, Sounds) → moved to Stage
- Game elements (Actors, Props, Effects) → remain on Encounter
- `Encounter` gets `StageId` FK to reference Stage
- No parallel types or APIs - update directly

### Execution Workflow
```
Phases 1-4: Backend implementation
    |
    v
[PAUSE] User creates and applies DB migration manually:
        - dotnet ef migrations add EncounterDomainRefactoring
        - dotnet ef database update
    |
    v
Phases 5-9: Frontend implementation (after user confirms migration)
```

---

## Summary

EPIC-006 will refactor the VTTTools encounter domain model from a 2-tier classification (Assets/Sounds) to a semantic 2-category, 8-element-type system based on behavioral characteristics (Game Elements vs Structural Elements). This refactoring resolves conceptual overlap, improves maintainability, and enables future AI content generation features.

**Key Change (v1.2)**: **Stage Extraction** - Stage is extracted as a first-class library entity (like World, Campaign, Adventure). Structural elements (Walls, Regions, Lights, Decorations, Sounds) move to Stage, while Game elements (Actors, Props, Effects) remain on Encounter. Encounters reference a Stage via FK, enabling map reuse across multiple encounters.

**Key Principle**: **Perception-Based Design** - Categories based on domain semantics (game mechanics vs environment), not file formats. Visual media unified (images/sprites), audio separate (different perception mechanism).

---

## Planned Phases

| Phase | Name | Est. Hours | Key Deliverables |
|-------|------|------------|------------------|
| 1 | Foundation | 24-30h | Domain entities, base abstractions, enums |
| 2 | Backend Infrastructure | 36-42h | Database schema, EF Core, repositories |
| 3 | Service Layer | 30-36h | Service methods, API contracts, controllers |
| 4 | Command Pattern | 24-30h | 40+ commands with undo/redo support |
| 5 | Frontend Types | 18-24h | TypeScript types, RTK Query API |
| 6 | Rendering Components | 30-36h | 9 element renderers, conditional frame logic |
| 7 | UI Panels | 36-42h | 9 panels (4 Game + 5 Structural) |
| 8 | Encounter Editor | 48-54h | Panel integration, canvas updates, context menus |
| 9 | Asset Library Updates | 18-24h | Unified decoration browser, AssetKind updates |
| 10 | Database Migration | 24-30h | Migration scripts, data integrity validation |
| 11 | Testing & QA | 48-60h | Unit, integration, E2E, migration tests |
| 12 | Documentation | 12-18h | API docs, user guides, video tutorials |

**Total**: ~180-220 hours across 12 phases

---

## Scope

### In Scope

**Domain Model Changes:**
- **Stage extracted** as first-class library entity (like World, Campaign, Adventure)
- Current `Stage` value object → renamed to `StageSettings`
- DELETE EncounterAsset → REPLACE with EncounterActor, EncounterProp
- DELETE EncounterSound → REPLACE with StageAudio (on Stage)
- Unified StageDecoration (images/sprites) on Stage
- New EncounterEffect (game mechanics) on Encounter
- Update AssetKind enum (remove Effect/Object, add Prop/Decoration)
- Encounter gets StageId FK to reference Stage

**Categories:**
- **Game Elements** (3 types on Encounter): Actor, Prop, Effect
- **Structural Elements** (5 types on Stage): Wall, Region, Light, Decoration, Audio

**Database:**
- New Stage table with structural element collections
- New Encounter element tables (Actors, Props, Effects)
- DROP old tables (EncounterAssets, EncounterSounds)
- No data migration needed (not in production)

**API:**
- ~30-35 endpoints (direct replacement, no V2 versioning)
- No deprecation timeline (no V1 to maintain)
- Update existing endpoints directly

**Frontend:**
- 8 element type panels (3 Game + 5 Structural)
- Unified decoration browser (Images/Sprites tabs)
- Conditional frame rendering (Actors only)
- Updated Konva layer management
- Stage editor for structural elements
- Encounter editor for game elements

### Out of Scope

- Performance optimization (maintain current levels)
- New encounter mechanics
- Mobile/tablet support
- Real-time collaboration
- AI content generation (enabled by this refactoring, implemented later)

---

## Key Achievements (Planned)

### Simplified Architecture
- ✅ 8 element types (3 Game + 5 Structural)
- ✅ 2 semantic categories (Game Elements vs Structural Elements)
- ✅ Stage as first-class entity (enables map reuse)
- ✅ 8 UI panels (3 Game + 5 Structural)
- ✅ ~30-35 API endpoints (encounters + stages)

### Semantic Clarity
- ✅ Behavior-based categories (game rules vs environment)
- ✅ Perception-based design (visual unified, audio separate)
- ✅ File format as implementation detail
- ✅ Stage/Encounter separation (map vs gameplay)

### Better UX
- ✅ Unified decoration browser (images + sprites together)
- ✅ Clear mental model: "Does it affect gameplay?"
- ✅ Fewer panels, simpler organization

---

## Technology Stack

```
Backend:
- C# .NET 8
- Entity Framework Core
- ASP.NET Core Web API
- xUnit + FluentAssertions (testing)

Frontend:
- React 19 + TypeScript
- Redux Toolkit + RTK Query
- Material-UI 7
- Konva 10 + React-Konva 19
- Vitest + Testing Library (testing)
- Playwright (E2E testing)

Database:
- PostgreSQL
- EF Core Code-First Migrations
```

---

## Documentation Index

### Core Documents
- `PRD.md` - Complete Product Requirements Document (62 pages)
- `TASK.md` - Task specification with acceptance criteria
- `ROADMAP.md` - Detailed phase breakdown with atomic tasks
- `CHANGELOG.md` - Progress tracking (to be created)

### Phase Documents
- `phases/PHASE_*.md` - Individual phase specifications with atomic tasks

---

## Design Decisions (ADRs)

- **ADR-001**: Split EncounterAsset into Actor/Prop (2 types, not 3)
- **ADR-002**: Remove Effect from AssetKind (encounter-specific)
- **ADR-003**: Props and Decorations have NO frames
- **ADR-004**: ~~6-month V1 API deprecation period~~ SUPERSEDED: Direct replacement (no V1/V2)
- **ADR-005**: 2 semantic categories (Game vs Structural)
- **ADR-006**: Unified visual media (Image/Sprite) in Decoration
- **ADR-007**: Audio separate from visual (ears vs eyes)
- **ADR-008**: Traps and Effects are Game Elements
- **ADR-009**: User-managed database migrations (Claude creates, user applies)
- **ADR-010**: Stage as First-Class Entity
  - **Decision**: Extract Stage as a library entity, separate from Encounter
  - **Context**: Structural elements (Walls, Regions, Lights, Decorations, Sounds) define the map/environment, while Game elements (Actors, Props, Effects) define the gameplay scenario
  - **Reasoning**: Same map (Stage) can be reused across multiple encounters with different game elements. Example: "Dungeon Room 3" stage used for both "Goblin Ambush" and "Treasure Discovery" encounters
  - **Naming**: Using "Stage" instead of "Map" because:
    - Already exists in codebase as embedded value object
    - Theater metaphor is consistent: Stage + Actors + Props + Effects
    - No naming collisions (Map clashes with TypeScript `Map<K,V>` and Mapper terminology)
    - Not a verb - unambiguous in code
  - **Migration**: Current `Stage` value object renamed to `StageSettings` to avoid collision

---

## Related EPICs

| EPIC | Name | Status | Relationship |
|------|------|--------|--------------|
| EPIC-001 | UI Migration | ✅ Complete | Foundation for encounter editor (verified) |
| EPIC-006 | Domain Refactoring | 🔄 In Progress | This EPIC |
| TBD | AI Content Generation | Planned | Enabled by EPIC-006 |

---

## Success Criteria

### Technical
- ✅ All 9 element types functional
- ✅ Zero data loss during migration
- ✅ API endpoints respond < 200ms (P95)
- ✅ Code coverage ≥80% backend, ≥70% frontend
- ✅ All E2E test scenarios passing

### User Experience
- ✅ Users can create encounters 20% faster
- ✅ System Usability Scale (SUS) score > 75
- ✅ < 5% support tickets related to new UI
- ✅ 90% of active users migrated within 30 days

### Business
- ✅ Project completed within 18-20 weeks
- ✅ Budget variance < 10%
- ✅ Zero unplanned downtime
- ✅ Customer churn rate unchanged

---

**Version**: 1.2
**Created**: 2025-12-28
**Last Updated**: 2025-12-28
**Implementation Approach**: Direct replacement (simplified)
**Key Update**: Stage extraction as first-class entity (ADR-010)
