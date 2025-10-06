# {feature_name} Implementation Status

**Last Updated**: {last_updated}
**Feature Grade**: {feature_grade}
**Progress**: {progress_percent}% complete
**Use Cases**: {completed_count}/{total_count}

---

## Section 1: Scores & Grades

### Use Case Implementation Matrix

| Use Case | Impl | Tests | Quality | Compliance | Grade |
|----------|------|-------|---------|------------|-------|
<foreach {uc} in {use_cases}>
| {uc.name} | ✅/🔨/❌ | ✅/❌ | XX/100 | XX/100 | A-F |
</foreach>

### Feature-Level Metrics
- **Implementation Complete**: {count}/{total} use cases ({percent}%)
- **Tests Passing**: {count}/{total} use cases ({percent}%)
- **Average Code Quality**: {score}/100
- **Average Spec Compliance**: {score}/100
- **Test Coverage**: {percent}%

### Overall Grades
- **Implementation Grade**: {A|B|C|D|F}
- **Test Grade**: {A|B|C|D|F}
- **Quality Grade**: {A|B|C|D|F}
- **Feature Grade**: {A|B|C|D|F} (average of all grades)

---

## Section 2: Feature Roadmap

### ☐ Domain Layer
- [x] Domain model documented (DOMAIN_MODEL.md)
- [x] Domain model validated ({score}/100)
- [ ] Domain contracts implemented
  - Status: {COMPLETE|IN_PROGRESS|NOT_STARTED}
  - See: ../DOMAIN_STATUS.md

### ☐ Use Case Implementations

<foreach {uc} in {use_cases}>
**{uc.name}** ({uc.ui_type}):
- [ ] Implementation: {uc.impl_status}
- [ ] Tests: {uc.test_status}
- [ ] Grade: {uc.grade}
- [ ] See: UseCases/{uc.name}_STATUS.md
</foreach>

<examples>
**Create Asset** (🔌 API_ENDPOINT):
- [x] Implementation: COMPLETE (AssetService.cs, AssetHandlers.cs)
- [ ] Tests: MISSING (need AssetServiceTests.cs)
- [ ] Grade: C (impl ✅, tests ❌)
- [ ] See: UseCases/Create Asset_STATUS.md

**Clone Asset** (🔌 API_ENDPOINT):
- [ ] Implementation: PARTIAL (frontend ready, backend missing)
- [ ] Tests: MISSING
- [ ] Grade: D (partial impl, no tests)
- [ ] See: UseCases/Clone Asset_STATUS.md
</examples>

### ☐ Feature-Level Testing
- [ ] All use case unit tests passing
  - Target: {total} use cases with 80%+ coverage
  - Current: {count} use cases tested

- [ ] Feature integration tests (Phase 3)
  - Status: 🔜 NOT_STARTED

- [ ] Feature BDD scenarios (Phase 3)
  - File: {feature_name}.feature
  - Status: ✅ Scenarios defined, 🔜 Step definitions pending

### ☐ Code Review & Quality
- [ ] Run /review-code "{feature_name}"
- [ ] Critical issues: {count}
- [ ] High issues: {count}
- [ ] Status: {REVIEWED|PENDING}

### ☐ Pull Request
- [ ] All use cases implemented
- [ ] All use cases tested
- [ ] Code review passed
- [ ] /create-pr "{feature_name}"
- [ ] PR #: {pr_number}
- [ ] PR Status: {OPEN|MERGED|CLOSED}

---

## Implementation Priority

**Immediate Actions** (blocking progress):
<foreach {action} in {blocking_actions}>
- {priority_icon} {action_description}
</foreach>

**Next Actions** (after blockers resolved):
<foreach {action} in {next_actions}>
- {action_description}
</foreach>

---

## Specification References

- **Feature Spec**: Documents/Areas/{area}/Features/{feature_name}.md
- **Domain Model**: Documents/Areas/{area}/DOMAIN_MODEL.md
- **Use Case Specs**: UseCases/*.md ({count} files)
- **BDD Feature File**: {feature_name}.feature ({scenario_count} scenarios)

---

## Recent Activity

**Last Updated**: {last_update_description}
**Recent Commits**: {commit_list}

---

**Assessment Date**: {assessment_date}
**Next Review**: {next_review_date}
