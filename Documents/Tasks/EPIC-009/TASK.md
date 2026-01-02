# EPIC-009: Frontend Behavior Test Expansion

**Target Type**: Epic (Test Quality)
**Target Item**: EPIC-009
**Created**: 2026-01-02
**Status**: 🔴 Not Started
**Estimated Effort**: 80-120 hours
**Priority**: High (Production Risk Mitigation)

---

## Objective

Improve frontend test coverage to guarantee behavior correctness for both WebClientApp (~40% → 80%) and WebAdminApp (~9% → 70%). Focus on user-facing behavior testing that validates what users see and interact with.

---

## Problem Statement

### Current Coverage Analysis

#### WebAdminApp (Grade: D-)
**Location**: `Source/WebAdminApp/src/`

| Module | Test Files | Source Files | Coverage | Grade |
|--------|-----------|-------------|----------|-------|
| api/ | 1 | 1 | 100% | A |
| services/ | 2 | 11 | 18% | F |
| pages/ | 1 | 10 | 10% | F |
| components/ | 0 | 21 | 0% | F |
| store/ | 1 | 4 | 25% | D |
| hooks/ | 0 | 2 | 0% | F |

**Critical Gaps**:
- LoginPage (0%) - Admin auth completely untested
- AuthService (0%) - Login/logout logic untested
- JobsSlice (0%) - 400 lines of Redux state untested
- All 21 components (0%) - UI completely untested

#### WebClientApp (Grade: C+)
**Location**: `Source/WebClientApp/src/`

| Module | Test Files | Source Files | Coverage | Grade |
|--------|-----------|-------------|----------|-------|
| utils/ | 38 | 48 | 79% | A |
| hooks/ | 22 | 27 | 81% | A |
| services/ | 8 | 14 | 57% | C+ |
| components/ | 28 | 87 | 32% | D+ |
| pages/ | 2 | 9 | 22% | D |
| features/ | 0 | 23 | 0% | F |
| api/ | 0 | 4 | 0% | F |

**Critical Gaps**:
- Content Library (0%) - 23 files, data loss risk
- Auth APIs (0%) - 4 files, security regression risk
- Core pages (0%) - Navigation, layout untested

---

## Scope

### In Scope

1. **WebAdminApp Critical Tests**
   - LoginPage, AuthService, JobsSlice
   - UserListPage, AdminLayout, DashboardPage
   - UserDetailModal, ConfigurationPage

2. **WebAdminApp High Priority Tests**
   - BulkAssetGenerationPage, AuditLogPage
   - HealthStatusCard, RoleManagement
   - useAdminAuth hook, remaining components

3. **WebClientApp Critical Tests**
   - Content Library hooks (useContentLibrary, useAutoSave, useInfiniteScroll)
   - Content Library components (AdventureList, CampaignList, WorldList, EncounterList)
   - ContentLibraryPage, securityApi, profileApi

4. **WebClientApp High Priority Tests**
   - AssetLibraryPage, MediaLibraryPage, AssetStudioPage
   - LoginPage, SimpleLoginForm, PasswordResetConfirmForm
   - twoFactorApi, recoveryCodesApi

5. **WebClientApp Medium Priority Tests**
   - Encounter Editor UI components
   - encounterSlice Redux state

### Out of Scope

- Accessibility tests (WCAG, ARIA) - separate effort
- Performance tests - separate effort
- Visual regression tests - separate effort
- E2E/BDD tests - already covered separately
- Backend tests - different EPIC

---

## Acceptance Criteria

### Must Have

- [ ] WebAdminApp coverage reaches ≥50%
- [ ] WebClientApp coverage reaches ≥70%
- [ ] All critical user flows have behavior tests
- [ ] All tests use AAA pattern (Arrange-Act-Assert)
- [ ] All tests use semantic queries (not data-testid)
- [ ] All tests pass independently and in suite
- [ ] No hardcoded colors (theme compliance)

### Should Have

- [ ] WebAdminApp coverage reaches ≥70%
- [ ] WebClientApp coverage reaches ≥80%
- [ ] Test helper utilities for common patterns
- [ ] Mock factory patterns for complex data

### Nice to Have

- [ ] Coverage reporting in CI pipeline
- [ ] Test documentation in contributing guide

---

## Risk Assessment

### Medium Risks

| Risk | Mitigation |
|------|------------|
| Complex component mocking | Use existing patterns from hooks tests |
| Redux state complexity | Follow authSlice.test.ts patterns |
| Async behavior timing | Use waitFor/act properly |

### Low Risks

| Risk | Mitigation |
|------|------------|
| Theme compliance | Follow themeColors.ts patterns |
| Mock data consistency | Create shared mock factories |

---

## Dependencies

### Prerequisites
- EPIC-008 (Domain Layer Isolation) - Completed
- Existing test infrastructure (Vitest, Testing Library)

### Blocks
- None - independent testing effort

---

## Workflow

### For Each Task:
1. **Spawn** `test-automation-developer` agent with task details
2. **Review** with `code-reviewer` agent after completion
3. **Verify** tests pass: `npm test -- {TestFile}.test.ts --run`
4. **Update** ROADMAP.md status (🔴→🟡→🟢)

### Agent Assignment:
- **test-automation-developer**: Creates test files
- **code-reviewer**: Validates quality, patterns, coverage

---

## Quality Gates (per task)

- [ ] AAA pattern (Arrange, Act, Assert)
- [ ] Semantic queries (getByRole, getByLabelText, NOT data-testid)
- [ ] Proper async handling (waitFor, act)
- [ ] Mock cleanup (vi.clearAllMocks in beforeEach)
- [ ] Theme compliance (palette colors, not hardcoded)

---

## Success Metrics

| Metric | Target |
|--------|--------|
| WebAdminApp test files | 6 → 20+ |
| WebAdminApp test count | 82 → 200+ |
| WebAdminApp coverage | 9% → 70% |
| WebClientApp test files | 111 → 140+ |
| WebClientApp test count | 1,200 → 1,500+ |
| WebClientApp coverage | 40% → 80% |
| All tests passing | 100% |

---

## Related Documentation

- **Analysis**: Frontend Test Quality Analysis (2026-01-02)
- **Testing Guide**: `.claude/rules/TESTING_GUIDE.md`
- **TypeScript Style**: `.claude/rules/TYPESCRIPT_STYLE_GUIDE.md`

---

**Version**: 1.0
**Last Updated**: 2026-01-02
