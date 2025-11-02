---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, Glob, Bash
description: Final validation that use case implementation meets all quality gates
argument-hint: {use_case_name:string}
---

# Approve Use Case

Final validation gate for use case: verify implementation complete, tests passing, quality standards met, ready for feature approval.

## 1. Load Use Case Context
- Validate use_case_name non-empty
- Find use case spec: Documents/Areas/*/Features/*/UseCases/{use_case_name}/USE_CASE.md
- Read use case specification
- Extract: acceptance criteria, error scenarios, business rules, owning area, parent feature
- Look for USE_CASE_STATUS.md (implementation status)

## 2. Collect Approval Evidence
Check each phase completion:

**Specification Quality (Phase 2)**:
- Read specification validation score (from memory or last /use-case:validate run)
- Verify: Score ≥80/100
- Verify: 3+ acceptance criteria, 4+ error scenarios

**Implementation Quality (Phases 3-4)**:
- Check coding/todo exists (preparation done)
- Check implementation complete (all layers: Application, Infrastructure, UI if applicable)
- Verify files exist: Service classes, DAOs, UI components

**Code Review (Phase 5)**:
- Check last /use-case:coding:review results
- Verify: No critical or high severity issues
- Verify: Code follows standards (JAVA_STYLE_GUIDE.md, TYPESCRIPT_STYLE_GUIDE.md)

**Unit Testing (Phase 6)**:
- Check last /use-case:testing:improve results
- Verify: All tests passing
- Verify: Coverage ≥95%

**BDD Testing (Phases 7-9)**:
- Check BDD feature file exists
- Check BDD validation passed (≥80/100 score)
- Check step definitions implemented
- Verify: All scenarios passing (if implemented)

## 3. Make Approval Decision
Delegate to code-reviewer:
```
ROLE: Use Case Approval Validator

TASK: Final approval decision for use case "{use_case_name}"

USE CASE: {use_case_specification}
APPROVAL EVIDENCE: {checklist_results}

VALIDATION CHECKLIST:
✅ Specification: {score}/100 (≥80 required)
✅ Implementation: {status} (complete required)
✅ Code Review: {status} (no critical/high issues)
✅ Unit Tests: {passing}/{total} ({coverage}% coverage, ≥95% required)
✅ BDD: {scenario_passing}/{scenario_total} scenarios passing

DECISION CRITERIA:
- ALL checklist items must pass
- No blockers or critical issues
- Meets acceptance criteria from specification
- Follows architectural patterns (Clean, Hexagonal, DDD)

OUTPUT:
DECISION: [APPROVED | CHANGES_REQUIRED | BLOCKED]
REASON: {detailed_explanation}
BLOCKERS: [list if not approved]
RECOMMENDATIONS: [optional improvements]
```

## 4. Display Approval Report
```
═══════════════════════════════════════════
USE CASE APPROVAL: {use_case_name}
═══════════════════════════════════════════

Feature: {parent_feature}
Area: {owning_area}

Approval Checklist:
{foreach criterion: ✅/❌ {criterion_name}: {status}}

Metrics:
- Specification Quality: {spec_score}/100
- Code Quality: {code_score}/100
- Test Coverage: {coverage}%
- BDD Scenarios: {passing}/{total}

═══════════════════════════════════════════
DECISION: {APPROVED ✅ | CHANGES_REQUIRED ⚠️ | BLOCKED ❌}
═══════════════════════════════════════════

{decision_reason}

<if (APPROVED)>
✅ USE CASE APPROVED

Ready for:
- Feature approval (when all use cases approved): /feature:approve {parent_feature}
- Production deployment
</if>

<if (CHANGES_REQUIRED or BLOCKED)>
⚠️  APPROVAL BLOCKED

Required Fixes:
{foreach blocker: - {blocker.description} (fix with: {blocker.command})}

After fixing:
- Re-run: /use-case:approve {use_case_name}
</if>
```

## 5. Update Memory and Status
- Update use case entity: approval_status, approval_date, approval_decision
- Update USE_CASE_STATUS.md with approval results
- Update parent feature tracking (increment approved_use_case_count)

**Note**: Final quality gate for use case. Validates complete lifecycle (spec → code → tests → BDD). Required before feature approval.
