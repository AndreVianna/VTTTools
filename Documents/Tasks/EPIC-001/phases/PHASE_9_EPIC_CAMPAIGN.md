# Phase 9: Epic/Campaign Hierarchy

**Status**: ⚠️ BLOCKED
**Estimated**: 18h
**Dependencies**: Backend Epic/Campaign services (NOT READY)

---

## Objective

Implement Epic→Campaign hierarchy for advanced content organization

---

## CRITICAL BLOCKER

- **Backend Status**: ⚠️ Epic/Campaign services NOT IMPLEMENTED in VttTools.Library microservice
- **Backend development required**: ~3 weeks
- **Recommendation**: Defer until backend ready
- **Impact**: Optional feature - does not block other phases

---

## Deliverables

- **Page**: ContentHierarchyPage
  - Description: Tree view for Epic→Campaign→Adventure
  - Complexity: High
  - Dependencies: RTK Query epicApi, campaignApi

- **Component**: EpicCRUDDialog, CampaignCRUDDialog
  - Description: Create/Edit forms
  - Complexity: Medium each
  - Dependencies: Backend APIs

- **API**: epicApi, campaignApi RTK Query slices
  - Description: Integration with `/api/library`
  - Complexity: High
  - Dependencies: Backend services (missing)

---

## Success Criteria

- ⬜ Create/Edit/Delete Epics and Campaigns
- ⬜ Hierarchy relationships maintained
- ⬜ Adventures can link to campaigns
- ⬜ Campaigns can link to epics

---

## Dependencies

- **Prerequisites**: Backend Epic/Campaign services (NOT READY)
- **Blocks**: None (optional feature)

---

## Notes

This is an **optional advanced feature** for organizing large content libraries. Core VTTTools functionality (Phases 1-8, 10-14) does not require Epic/Campaign hierarchy.

**Alternative**: Users can organize content using Adventures directly until backend services are available.

---

## Related Documentation

- [Main Roadmap](../ROADMAP.md) - Overall progress
- [EPIC-002 Roadmap](../../EPIC-002/ROADMAP.md) - Admin Application (separate track)
