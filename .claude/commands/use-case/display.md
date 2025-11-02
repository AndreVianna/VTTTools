---
allowed-tools: mcp__memory__*, Task, Read, Glob
description: Display use case status with implementation phase, tests, and quality metrics
argument-hint: {use_case_name:string}
---

# Display Use Case

Show comprehensive use case status: current lifecycle phase, implementation progress, test results, quality scores.

## 1. Load Use Case Context
- Validate use_case_name non-empty
- Find use case spec: Documents/Areas/*/Features/*/UseCases/{use_case_name}/USE_CASE.md
- Read specification
- Extract: owning area, parent feature, business value, acceptance criteria count
- Check for USE_CASE_STATUS.md

## 2. Determine Current Phase
Check which lifecycle phases completed:
- Phase 1: Specification exists ✅
- Phase 2: Validated (check last validate run or memory)
- Phase 3: Coding todo exists (check use-case/coding/prepare ran)
- Phase 4: Implementation complete (check for Service/DAO/UI files in codebase)
- Phase 5: Code reviewed (check last review results)
- Phase 6: Unit tests (check last test results)
- Phase 7: BDD generated (check .feature file exists)
- Phase 8: BDD validated
- Phase 9: BDD implemented (check step definition files)
- Phase 10: Approved (check approval status)

## 3. Display Status Report
```
═══════════════════════════════════════════
USE CASE STATUS: {use_case_name}
═══════════════════════════════════════════

Feature: {parent_feature}
Area: {owning_area}

Business Value:
{business_value_summary}

───────────────────────────────────────────
LIFECYCLE PROGRESS
───────────────────────────────────────────

Current Phase: {current_phase_number}/10 - {phase_name}

 1. Generate Spec       {✅|⏳}
 2. Validate Spec       {✅|⏳|❌} ({score}/100)
 3. Prepare Impl        {✅|⏳}
 4. Implement           {✅|⏳} ({layer_status})
 5. Review Code         {✅|⏳|❌} ({issue_count} issues)
 6. Unit Tests          {✅|⏳|❌} ({passing}/{total}, {coverage}%)
 7. Generate BDD        {✅|⏳}
 8. Validate BDD        {✅|⏳|❌} ({score}/100)
 9. Implement BDD       {✅|⏳}
10. Approve             {✅|⏳|❌}

───────────────────────────────────────────
QUALITY METRICS
───────────────────────────────────────────

Specification: {spec_score}/100 (Target: 80)
Code Quality: {code_score}/100 (Target: 80)
Test Coverage: {coverage}% (Target: 95)
BDD Scenarios: {scenario_count} ({passing_count} passing)

───────────────────────────────────────────
NEXT ACTION
───────────────────────────────────────────

{next_action_description}

Run: {next_command}
```

**Note**: Quick status check for use case lifecycle. Shows which phases complete and what to do next.
