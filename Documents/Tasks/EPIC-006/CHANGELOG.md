# EPIC-006: Encounter Domain Model Refactoring - Change Log

**Status**: 🔄 IN PROGRESS
**Created**: 2025-12-28

---

## Version History

### v1.2.0 (2025-12-28) - Unified Effect Model (Trap + Effect Merged)

**Status**: Documentation updated with unified Effect model

**Key Design Changes**:

1. **Trap Merged into Effect** - A trap is just a "hazardous effect" with trigger capabilities
   - EncounterTrap entity DELETED
   - EncounterEffect entity unified to handle both effects and traps
   - TrapState enum replaced with EffectState enum

2. **8 Element Types (was 9)**:
   - **Game Elements**: Actor, Prop, Effect (no Trap)
   - **Structural Elements**: Wall, Region, Light, Decoration, Audio

3. **Unified Effect Entity Design**:
   ```csharp
   public record EncounterEffect : GameElement {
       public Position Position { get; init; } = Position.Zero;
       public float Rotation { get; init; }
       public Guid AssetId { get; init; }
       public EffectState State { get; init; } = EffectState.Enabled;
       public bool IsVisible { get; init; }  // visible to players (always visible to DM)
       public bool AllowAutomaticTrigger { get; init; }
       public Shape? TriggerShape { get; init; }  // Optional trigger region
       // 4 Visual Resources:
       public Guid EnabledResourceId { get; init; }      // Required
       public Guid? DisabledResourceId { get; init; }    // Optional
       public Guid? OnTriggerResourceId { get; init; }   // Optional
       public Guid? TriggeredResourceId { get; init; }   // Optional
   }

   public enum EffectState {
       Enabled,    // Ready to trigger (default)
       Disabled,   // Manually disabled by DM
       Triggered   // Has been triggered (Reset returns to Enabled)
   }
   ```

4. **Game-System Agnostic Design**:
   - NO game-specific properties in entities (HitPoints, SaveDC, LockDC, Duration, etc.)
   - Game mechanics belong in Asset.StatBlockEntries
   - NO CreatedAt/UpdatedAt timestamps - use AuditLogs

5. **Dependent Entity Pattern**:
   - Uses composite key (EncounterId, Index) not Guid Id
   - All encounter elements are dependent entities of Encounter

**Deleted Types**:
- `EncounterTrap` entity
- `TrapState` enum
- `TriggerCondition` value object
- `EffectDuration` value object
- `DurationType` enum
- `VisualSettings` value object

**New Types**:
- `EffectState` enum (Enabled, Disabled, Triggered)

**Documentation Updated**:
- TASK.md - 8 element types, unified Effect
- ROADMAP.md - Updated design principles, deliverables
- PHASE_01_FOUNDATION.md - Unified Effect model, removed Trap
- CHANGELOG.md - This entry

---

### v1.1.0 (2025-12-28) - Planning Session: Simplified Implementation Approach

**Status**: Implementation started with simplified direct replacement approach

**Planning Session Findings**:

During the planning session, key constraints were identified that significantly simplify the implementation:

1. **No Production Data**: System is not in production, so data preservation is NOT required
2. **User-Managed Migrations**: Database migrations will be created by Claude but applied by the user manually
3. **Direct Replacement**: No need for V1/V2 API versioning - update endpoints directly
4. **Continuous Functionality**: Code/features must continue to work at each phase completion
5. **Full Stack Compilation**: Entire stack must compile together at each phase boundary

**Implementation Strategy Changed**:

| Aspect | Original Plan (v1.0.0) | Simplified Plan (v1.1.0) |
|--------|------------------------|--------------------------|
| API Strategy | V1/V2 parallel APIs, 6-month deprecation | Direct replacement, no versioning |
| Data Migration | Complex 4-phase migration with rollback | Simple schema update (no data to migrate) |
| Entity Approach | Additive (keep old, add new) | Direct replacement (DELETE old, CREATE new) |
| Timeline | 18-20 weeks | Significantly reduced (no parallel maintenance) |

**Entity Changes (Direct Replacement)**:
- `EncounterAsset` → DELETE and replace with `EncounterActor`, `EncounterProp`
- `EncounterSound` → DELETE and replace with `EncounterAudio`
- No V2 types needed - update types directly
- No parallel API endpoints - update directly

**Execution Workflow**:
```
Phases 1-4: Backend implementation (Domain, Storage, Service, API)
    ↓
PAUSE: User creates and applies DB migration manually
    ↓
Phases 5-9: Frontend implementation (after user confirms migration success)
```

**Critical Constraints Documented**:
- Claude creates migration scripts but does NOT execute them
- User is responsible for: `dotnet ef migrations add` and `dotnet ef database update`
- Each phase must leave the codebase in a compilable state
- Tests must pass at phase boundaries

**What This Simplifies**:
- No API versioning overhead
- No parallel type maintenance
- No data migration complexity
- No rollback scripts needed
- No deprecation timeline management
- Faster implementation with less code

---

### v1.0.0 (2025-12-28) - EPIC Created

**Status**: Planning phase complete, ready for stakeholder approval

**Planning Documents Created**:
- PRD.md (Product Requirements Document, 62 pages, v1.1)
- README.md (Quick reference guide)
- TASK.md (Detailed task specification with acceptance criteria)
- ROADMAP.md (Implementation roadmap with 12 phases)
- CHANGELOG.md (This file)

**Phase Documents Created** (12 phases):
- PHASE_01_FOUNDATION.md (24-30h, Domain entities)
- PHASE_02_BACKEND_INFRASTRUCTURE.md (36-42h, Database schema)
- PHASE_03_SERVICE_LAYER.md (30-36h, API contracts)
- PHASE_04_COMMAND_PATTERN.md (24-30h, Undo/redo)
- PHASE_05_FRONTEND_TYPES.md (18-24h, TypeScript types)
- PHASE_06_RENDERING_COMPONENTS.md (30-36h, Konva renderers)
- PHASE_07_UI_PANELS.md (36-42h, UI panels)
- PHASE_08_ENCOUNTER_EDITOR.md (48-54h, Editor integration)
- PHASE_09_ASSET_LIBRARY.md (18-24h, Asset library updates)
- PHASE_10_DATABASE_MIGRATION.md (24-30h, Migration scripts)
- PHASE_11_TESTING_QA.md (48-60h, Comprehensive testing)
- PHASE_12_DOCUMENTATION.md (12-18h, Docs and guides)

**Key Design Decisions**:
- Perception-based architecture (semantic behavior vs file formats)
- 2 categories (Game Elements, Structural Elements)
- 9 element types (down from 12 in v1.0)
- Unified visual media (Image/Sprite in Decoration entity)
- Audio separate from visual (different perception mechanism)
- ONLY Actors have frames (Props/Decorations blend seamlessly)

**Architecture**:
- **From**: 2-tier classification (EncounterAsset, EncounterSound)
- **To**: 2-category, 9-element-type system
- **Game Elements**: Actor, Prop, Trap, Effect (has game rules/mechanics)
- **Structural Elements**: Wall, Region, Light, Decoration, Audio (passive environment)

**Scope Summary**:
- 6 new database tables (down from 8)
- ~30-35 new API endpoints (down from ~45)
- 9 UI panels (down from 13)
- 40+ new commands (undo/redo support)
- Estimated effort: 180-220 hours (18-20 weeks)

**What Changed from PRD v1.0 → v1.1**:
- Unified Media Elements into Structural Elements
- Combined visual media (Image/Sprite/Video) into single Decoration entity
- Separated Audio (different perception mechanism)
- Removed Video support for MVP (reserved for future cutscene feature)
- Reduced from 4 categories to 2 categories
- Moved Traps and Effects to Game Elements (they have game mechanics)

**Next Steps**:
1. Stakeholder approval of PRD v1.1
2. Begin Phase 1 (Foundation) when authorized
3. Follow strict review gates (no phase starts until previous phase grades A- or better)

---

## Planned Milestones

**Week 3**: Phase 1 complete (Domain model)
**Week 6**: Phase 2 complete (Database)
**Week 9**: Phase 3-4 complete (Services + Commands)
**Week 13**: Phase 5-7 complete (Frontend core)
**Week 17**: Phase 8-9 complete (UI integration)
**Week 19**: Phase 10-11 complete (Migration + Testing)
**Week 20**: Phase 12 complete (Documentation), EPIC complete

---

## Future Versions (Planned)

### v2.0.0 (Estimated: Week 20)
**Target**: EPIC-006 complete, production ready

**Expected Deliverables**:
- All 9 element types functional
- Zero data loss migration
- All E2E tests passing
- API documentation complete
- User guides and video tutorials published

---

## Related Documents

- [PRD.md](./PRD.md) - Complete Product Requirements Document
- [TASK.md](./TASK.md) - Detailed task specification
- [ROADMAP.md](./ROADMAP.md) - Implementation roadmap
- [README.md](./README.md) - Quick reference guide

---

**Version**: 1.2.0
**Last Updated**: 2025-12-28
**Status**: Documentation updated with unified Effect model (Trap + Effect merged)
