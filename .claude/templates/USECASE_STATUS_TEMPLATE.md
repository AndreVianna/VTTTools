# {use_case_name} Implementation Status

**Last Updated**: {last_updated}
**Status**: NOT_STARTED | IN_PROGRESS | IMPLEMENTED | TESTED | COMPLETE
**Overall Grade**: {overall_grade}

---

## Section 1: Scores & Grades

### Implementation Completeness

| Layer | Status | Files | Grade |
|-------|--------|-------|-------|
| Domain Contracts | ✅/❌ | {entity}, {interface} | A-F |
| Application Service | ✅/❌ | {Service}.cs | A-F |
| Infrastructure API | ✅/❌ | {Handler}.cs, Endpoint | A-F |
| UI Components | ✅/❌/N/A | {Component}.tsx | A-F |

**Layers Complete**: {count}/{total}
**Overall Implementation**: {percent}%
**Implementation Grade**: {A|B|C|D|F}

### Testing Completeness

| Test Type | Status | Pass | Coverage | Grade |
|-----------|--------|------|----------|-------|
| Service Unit Tests | ✅/❌ | XX/XX | XX% | A-F |
| Handler/API Unit Tests | ✅/❌ | XX/XX | XX% | A-F |
| UI Component Tests | ✅/❌/N/A | XX/XX | XX% | A-F |
| Integration Tests | 🔜 | 0/0 | - | Phase3 |
| BDD Step Definitions | 🔜 | 0/XX | - | Phase3 |

**Test Coverage**: {percent}% (target: 80%+)
**Tests Passing**: {count}/{total}
**Test Grade**: {A|B|C|D|F}

### Quality & Compliance
- **Code Quality**: {score}/100 (standards, complexity, security)
- **Spec Compliance**: {score}/100 (ACs, error scenarios, invariants)
- **Acceptance Criteria**: {count}/{total} implemented
- **Error Scenarios**: {count}/{total} handled
- **Invariants Enforced**: {count}/{total}
- **Business Rules**: {count}/{total} implemented
- **Compliance Grade**: {A|B|C|D|F}

**Overall Grade**: {A|B|C|D|F} (average of implementation + tests + quality)

---

## Section 2: Implementation Roadmap

### ☐ Phase 2B: Application Layer

**Service Implementation**:
- [ ] Class: {ServiceName}.cs (implements I{Service})
  - [ ] Inject dependencies (repository, other services, logger)
  - [ ] Method: {primary_port_method}
    - [ ] Validate inputs (from use case spec)
    - [ ] Enforce invariants: {invariant_list}
    - [ ] Implement business rules: {business_rule_list}
    - [ ] Handle error scenarios: {error_scenario_list}
    - [ ] Orchestrate: Load → Validate → Modify (with expression) → Persist
    - [ ] Return Result<Entity>

**Service Unit Tests**:
- [ ] File: {ServiceName}Tests.cs
  - [ ] Test AC-01: {acceptance_criterion}
  - [ ] Test AC-02: {acceptance_criterion}
  - [ ] Test AC-03: {acceptance_criterion}
  - [ ] Test ES-01: {error_scenario}
  - [ ] Test ES-02: {error_scenario}
  - [ ] Test ES-03: {error_scenario}
  - [ ] Test ES-04: {error_scenario}
  - [ ] Mock dependencies (repository, external services)
  - [ ] Coverage target: 80%+

**Status**: {COMPLETE|IN_PROGRESS|NOT_STARTED|NEEDS_TESTS}

### ☐ Phase 2C: Infrastructure Layer

**Repository** (if needed):
- [ ] Class: {Entity}Repository.cs
- [ ] Implement I{Entity}Storage interface
- [ ] EF Core integration
- [ ] Unit tests with mocked DbContext

**API Endpoint**:
- [ ] Handler: {HandlerName}.cs
- [ ] Endpoint mapping: {http_method} {endpoint_path}
- [ ] DTO mapping (Request → ServiceData → Entity → Response)
- [ ] Authorization checks
- [ ] Unit tests: {HandlerName}Tests.cs

**Status**: {COMPLETE|IN_PROGRESS|NOT_STARTED|NEEDS_TESTS}

### ☐ Phase 2D: UI Layer (if UI type not NO_UI or API_ENDPOINT)

<case {ui_type}>
<is FULL_PAGE>
**Page Component**:
- [ ] File: {PageName}.tsx
- [ ] Route: {route_path}
- [ ] State management (Redux slice/RTK Query)
- [ ] Component tests: {PageName}.test.tsx

<is FORM>
**Form Component**:
- [ ] File: {FormName}.tsx
- [ ] React Hook Form integration
- [ ] Validation schema
- [ ] API integration
- [ ] Component tests

<is WIDGET or BUTTON>
**Component**:
- [ ] File: {ComponentName}.tsx
- [ ] Props interface
- [ ] Component logic
- [ ] Tests
</case>

**Status**: {COMPLETE|IN_PROGRESS|NOT_STARTED|N/A}

### ☐ Phase 2E: Code Review & Refinement
- [ ] /review-code "{use_case_name}"
- [ ] Critical issues: {count} - {issue_list}
- [ ] High issues: {count} - {issue_list}
- [ ] Fix issues before commit

**Review Status**: {APPROVED|CHANGES_REQUESTED|PENDING}

### ☐ Phase 2F: Commit
- [ ] All layers implemented
- [ ] All tests passing
- [ ] Code review approved
- [ ] /commit-changes "feat({area}): implement {use_case_name} use case"
- [ ] Commit SHA: {sha}

---

## Implementation Files

**Existing Code**:
<foreach {file} in {existing_files}>
- ✅ {file_path}
</foreach>

**Generated Code** (will be created):
<foreach {file} in {generated_files}>
- ⏳ {file_path}
</foreach>

**Test Files**:
<foreach {file} in {test_files}>
- {status} {file_path}
</foreach>

---

## Specification References

- **Use Case Spec**: Documents/Areas/{area}/Features/{feature}/UseCases/{use_case_name}.md
  - UI Type: {ui_type}
  - Acceptance Criteria: {ac_count}
  - Error Scenarios: {es_count}
  - Business Rules: {br_count}

- **Domain Model**: Documents/Areas/{area}/DOMAIN_MODEL.md

- **BDD Scenarios**: {use_case_name}.feature ({scenario_count} scenarios)

---

## Assessment Data

**Discovery Date**: {assessment_date}
**Implementation Found**: {FULLY|PARTIALLY|NOT} implemented
**Test Coverage Found**: {percent}%
**Recommendation**: {KEEP_AS_IS|ENHANCE|REFACTOR|COMPLETE|IMPLEMENT}

<if (recommendation is ENHANCE)>
**Missing Items**:
- Acceptance Criteria: {missing_acs}
- Error Scenarios: {missing_error_scenarios}
- Invariants: {missing_invariants}
</if>

<if (recommendation is REFACTOR)>
**Quality Issues**:
- {issue_list}
</if>

---

## Next Action

<case {status}>
<is NOT_STARTED>
**Action**: /implement-use-case "{use_case_name}"

<is IN_PROGRESS>
**Action**: Complete {missing_layer} layer
**Blocked By**: {blocker}

<is IMPLEMENTED>
**Action**: Generate unit tests
**Command**: /implement-use-case "{use_case_name}" --tests-only

<is TESTED>
**Action**: Code review
**Command**: /review-code "{use_case_name}"

<is COMPLETE>
**Action**: ✅ Done - ready for Phase 3 (integration/BDD)
</case>

---

**Last Modified By**: {command_that_updated_this}
**Commits**: {commit_sha_list}
