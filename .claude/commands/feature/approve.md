---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, Glob, Bash
description: Validate all feature use cases approved and ready for production
argument-hint: {feature_name:string}
---

# Approve Feature

Final validation gate: verify all use cases implemented, tested, and approved for production release.

## 1. Load Feature Context
- Validate feature_name non-empty
- Find feature spec: Documents/Areas/*/Features/{feature_name}/FEATURE.md
- Read feature specification
- Extract: owning area, use cases list, use case count
- Initialize approval entity in memory

## 2. Discover Use Case Status
- Use Glob to find all use case specs for this feature: Documents/Areas/*/Features/{feature_name}/UseCases/*.md
- For each use case:
  - Read specification
  - Check if USE_CASE_STATUS.md exists
  - Extract: implementation status, test results, quality scores, approval status
  - Store in checklist

## 3. Aggregate Approval Checklist
For each use case, verify:
- [ ] Specification validated (score ≥80/100)
- [ ] Implementation complete (all layers generated)
- [ ] Unit tests passing (coverage ≥95%)
- [ ] Code review approved (no critical/high issues)
- [ ] BDD scenarios exist and passing
- [ ] Use case individually approved (/use-case:approve ran successfully)

## 4. Make Approval Decision
Delegate to code-reviewer:
```
ROLE: Feature Approval Reviewer

TASK: Make go/no-go decision for feature "{feature_name}" production release

FEATURE: {feature_specification}
USE CASE CHECKLIST: {aggregated_checklist_results}

CRITERIA:
- All use cases must be individually approved
- Overall test coverage ≥95%
- No critical or high severity issues
- All BDD scenarios passing
- Documentation complete

DECISION: [APPROVED | CHANGES_REQUIRED | BLOCKED]
REASON: {detailed_explanation}
BLOCKERS: [list if blocked]
RECOMMENDATIONS: [improvement suggestions]
```

## 5. Display Approval Report
```
═══════════════════════════════════════════
FEATURE APPROVAL: {feature_name}
═══════════════════════════════════════════

Use Cases: {total_count}

Approval Checklist:
✅ Specifications: {validated_count}/{total_count} (≥80/100)
✅ Implementation: {implemented_count}/{total_count} complete
✅ Unit Tests: {tests_passing_count}/{total_count} passing
✅ Code Review: {reviewed_count}/{total_count} approved
✅ BDD Scenarios: {bdd_count}/{total_count} passing
✅ Individual Approval: {approved_count}/{total_count} approved

Overall Metrics:
- Test Coverage: {aggregate_coverage}% (Target: 95%)
- Quality Score: {aggregate_quality}/100 (Target: 80)
- Critical Issues: {critical_count}
- High Issues: {high_count}

═══════════════════════════════════════════
DECISION: {APPROVED ✅ | CHANGES_REQUIRED ⚠️ | BLOCKED ❌}
═══════════════════════════════════════════

{decision_reason}

<if (APPROVED)>
✅ FEATURE APPROVED FOR PRODUCTION

Next Steps:
- Create PR: /git:pr
- Deploy to production (follow deployment process)
- Monitor post-deployment metrics
</if>

<if (CHANGES_REQUIRED or BLOCKED)>
⚠️  APPROVAL BLOCKED

Required Actions:
{foreach blocker: - {blocker.description}}

Once fixed:
- Re-validate affected use cases
- Re-run: /feature:approve {feature_name}
</if>
```

## 6. Update Memory
- Store approval decision and timestamp
- Update feature entity status: approved | changes_required | blocked
- Create feature→approval relationship

**Note**: Final quality gate before production. Aggregates all use case validations. Provides clear go/no-go decision with actionable blockers.
