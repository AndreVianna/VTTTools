# Phase 9: Asset Library Updates

**Status**: 📋 Planned
**Estimated**: 18-24h | **Actual**: TBD
**Completed**: TBD
**Grade**: TBD

---

## Objective

Update AssetKind enum, bulk generation, and unified resource browser

---

## Prerequisites

- Phase 3 complete (backend updated)
- Phase 5 complete (frontend types updated)

---

## Implementation Sequence

1. **AssetKind Enum Migration** (Backend) - 6h
   - Update AssetKind enum (remove Effect, Object; add Prop, Decoration)
   - Create database migration for AssetKind column
   - Migrate existing assets (Object → Prop/Decoration based on rules)
   - Test migration
   - Agent: backend-developer

2. **Bulk Asset Generation Updates** (Frontend) - 6h
   - Update BulkGenerationForm to support Prop and Decoration types
   - Update AI prompt templates
   - Agent: frontend-developer

3. **Unified Resource Browser** (Frontend + UX) - 8h
   - Update AssetLibraryPage to support ResourceType filtering
   - Implement unified decoration browser (images + sprites together)
   - UX review
   - Agent: frontend-developer + ux-designer

4. **Asset Quick Summon Updates** (Frontend) - 4h
   - Update Quick Summon feature for all 9 element types
   - Test quick summon
   - Agent: frontend-developer

---

## Success Criteria

- ✅ AssetKind enum migrated successfully
- ✅ Existing assets categorized correctly
- ✅ Bulk generation works for Props and Decorations
- ✅ Unified decoration browser approved by UX
- ✅ Quick Summon works with all element types
- ✅ Unit tests pass (10+ tests)
- ✅ Code review approved (Grade A- or better)

---

## Dependencies

- **Prerequisites**: Phases 3, 5 complete
- **Blocks**: None (can run in parallel with Phase 8)

---

**Version**: 1.0
**Created**: 2025-12-28
