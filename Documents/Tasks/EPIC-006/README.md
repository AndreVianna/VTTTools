# EPIC-006: Encounter Domain Model Refactoring

**Quick Reference Guide**

**Status**: 📋 PLANNED
**Start Date**: TBD
**Estimated Effort**: ~180-220 hours (18-20 weeks)

---

## Summary

EPIC-006 will refactor the VTTTools encounter domain model from a 2-tier classification (Assets/Sounds) to a semantic 2-category, 9-element-type system based on behavioral characteristics (Game Elements vs Structural Elements). This refactoring resolves conceptual overlap, improves maintainability, and enables future AI content generation features.

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
- Split EncounterAsset → EncounterActor, EncounterProp
- Unified EncounterDecoration (images/sprites/videos)
- New EncounterTrap, EncounterEffect (game mechanics)
- Update AssetKind enum (remove Effect/Object, add Prop/Decoration)

**Categories:**
- **Game Elements** (4 types): Actor, Prop, Trap, Effect
- **Structural Elements** (5 types): Wall, Region, Light, Decoration, Audio

**Database:**
- 6 new tables (Actors, Props, Traps, Effects, Decorations, Audios)
- Migration from EncounterAssets/EncounterSounds
- Data integrity validation

**API:**
- ~30-35 new V2 endpoints
- 6-month V1 deprecation timeline
- API versioning strategy

**Frontend:**
- 9 element type panels (down from 13)
- Unified decoration browser (Images/Sprites tabs)
- Conditional frame rendering (Actors only)
- Updated Konva layer management

### Out of Scope

- Performance optimization (maintain current levels)
- New encounter mechanics
- Mobile/tablet support
- Real-time collaboration
- AI content generation (enabled by this refactoring, implemented later)

---

## Key Achievements (Planned)

### Simplified Architecture
- ✅ 9 element types (down from 12 in v1.0)
- ✅ 2 semantic categories (down from 4)
- ✅ 9 UI panels (down from 13)
- ✅ 6 database tables (down from 8)
- ✅ ~30-35 API endpoints (down from ~45)

### Semantic Clarity
- ✅ Behavior-based categories (game rules vs environment)
- ✅ Perception-based design (visual unified, audio separate)
- ✅ File format as implementation detail

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
- SQL Server
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
- **ADR-004**: 6-month V1 API deprecation period
- **ADR-005**: 2 semantic categories (Game vs Structural)
- **ADR-006**: Unified visual media (Image/Sprite) in Decoration
- **ADR-007**: Audio separate from visual (ears vs eyes)
- **ADR-008**: Traps and Effects are Game Elements

---

## Related EPICs

| EPIC | Name | Status | Relationship |
|------|------|--------|--------------|
| EPIC-001 | UI Migration | ✅ Complete | Foundation for encounter editor |
| EPIC-006 | Domain Refactoring | 📋 Planned | This EPIC |
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

**Version**: 1.0
**Created**: 2025-12-28
**Last Updated**: 2025-12-28
