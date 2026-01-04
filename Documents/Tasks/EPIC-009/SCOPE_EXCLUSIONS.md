# EPIC-009 Scope Exclusions

The following are explicitly **out of scope** for EPIC-009:

| Category | Reason |
|----------|--------|
| **Accessibility Testing** | Not a priority for current phase; will be addressed in dedicated accessibility EPIC |
| **Performance Testing** | Not a priority for current phase; will be addressed in dedicated performance EPIC |
| **MiniMap Component** | Component does not exist in codebase (was incorrectly listed in Phase 5) |

## Rationale

### Accessibility Testing
- WCAG compliance and ARIA attribute validation require specialized tooling (axe-core, pa11y)
- Current focus is on behavior testing for functional correctness
- Accessibility will be a separate initiative with proper audit scope

### Performance Testing
- Performance profiling requires different infrastructure (Lighthouse, performance marks)
- Current tests focus on correctness, not speed
- Performance optimization will be a separate initiative

### MiniMap Component
- Originally listed as Phase 5.11 task
- Investigation confirmed component does not exist in `Source/WebClientApp/src/`
- Removed from roadmap to avoid confusion

---

**Created**: 2026-01-03
