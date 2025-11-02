---
allowed-tools: mcp__memory__*, Task, Read, Glob
description: Display feature status with use cases, implementation progress, and metrics
argument-hint: {feature_name:string}
---

# Display Feature

Show comprehensive feature status: use cases, implementation progress, test results, and quality metrics.

## 1. Load Feature Context
- Validate feature_name non-empty
- Find feature spec: Documents/Areas/*/Features/{feature_name}/FEATURE.md
- Read feature specification
- Extract: owning area, use cases, description, type
- Check for FEATURE_STATUS.md

## 2. Gather Implementation Status
- Use Glob to find all use case specs: Documents/Areas/*/Features/{feature_name}/UseCases/*.md
- For each use case:
  - Read USE_CASE.md
  - Check USE_CASE_STATUS.md (if exists)
  - Extract: implementation phase, test status, approval status
- Query memory for implementation entities
- Aggregate metrics: total use cases, implemented count, approved count, tests passing

## 3. Format Status Display
Delegate to solution-engineer:
```
ROLE: Feature Status Reporter

TASK: Format feature status report for "{feature_name}"

FEATURE: {feature_specification}
USE CASES: {use_case_list_with_status}
METRICS: {aggregated_metrics}

OUTPUT FORMAT:
- Feature overview (1-2 sentences)
- Use case progress table (name | phase | tests | approval)
- Overall metrics (implementation %, test coverage, quality score)
- Next recommended actions
```

## 4. Display Report
```
═══════════════════════════════════════════
FEATURE STATUS: {feature_name}
═══════════════════════════════════════════

Area: {owning_area}
Type: {feature_type}

Description:
{feature_description}

───────────────────────────────────────────
USE CASES ({completed}/{total})
───────────────────────────────────────────

{foreach use_case:
{use_case.name}
  Phase: {current_phase} (Phase X/10)
  Tests: {tests_passing}/{tests_total} ({coverage}%)
  Approval: {approved ✅ | pending ⏳ | blocked ❌}
}

───────────────────────────────────────────
OVERALL METRICS
───────────────────────────────────────────

Implementation: {impl_percent}% complete
- Specified: {specified_count}/{total_count}
- Implemented: {implemented_count}/{total_count}
- Tested: {tested_count}/{total_count}
- Approved: {approved_count}/{total_count}

Quality:
- Avg Specification Score: {avg_spec_score}/100
- Avg Code Quality: {avg_code_score}/100
- Test Coverage: {avg_coverage}%
- BDD Scenarios: {total_scenarios} ({passing_scenarios} passing)

───────────────────────────────────────────
NEXT ACTIONS
───────────────────────────────────────────

{foreach action: - {action.description} (run: {action.command})}

<if (all use cases approved)>
✅ Feature ready for approval: /feature:approve {feature_name}
</if>

<if (has blockers)>
⚠️  Blockers: {blocker_count}
- Address blockers before proceeding
</if>
```

**Note**: Comprehensive status view for tracking feature progress. Shows use case breakdown, quality metrics, and next actions.
