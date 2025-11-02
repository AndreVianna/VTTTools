---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, Glob, Bash
description: Final validation that task implementation meets acceptance criteria
argument-hint: {task_id:string}
---

# Approve Task

Final validation gate for task: verify all acceptance criteria met, tests passing, ready to mark complete.

## 1. Load Task Context
- Validate task_id non-empty
- Read task spec: Documents/Tasks/{task_id}/TASK.md
- Extract: title, type, priority, acceptance criteria, affected features/use cases/components
- Check for task status (must be in-progress or completed)

## 2. Collect Approval Evidence
Check each requirement:

**Specification Quality**:
- Verify: Task validated (score ≥80/100 if validation was run)
- Verify: Acceptance criteria defined (minimum 3)
- Verify: Cross-references complete (features, components, use cases)

**Implementation Quality**:
- Check: All affected use cases implemented
- Check: All affected components modified
- Verify: Implementation strategy followed

**Testing**:
- Check: Unit tests ran and passing
- Verify: Coverage ≥95% for modified code
- Check: Integration tests if applicable

**Code Review**:
- Check: Code review completed
- Verify: No critical or high severity issues

## 3. Validate Acceptance Criteria
For each acceptance criterion in task spec:
- Check if criterion is verifiable (testable)
- Determine if met (manual verification or automated test)
- Mark: ✅ MET | ❌ NOT MET | ⏳ PARTIALLY MET

## 4. Make Approval Decision
Delegate to code-reviewer:
```
ROLE: Task Approval Validator

TASK: Approve task "{task_id}" for completion

TASK SPEC: {task_specification}
ACCEPTANCE CRITERIA STATUS: {criteria_checklist}
EVIDENCE: {test_results, code_review_results, implementation_status}

VALIDATION:
- All acceptance criteria met?
- Tests passing?
- Code quality acceptable?
- No remaining blockers?

DECISION: [APPROVED | CHANGES_REQUIRED | BLOCKED]
REASON: {explanation}
REMAINING_WORK: [list if not approved]
```

## 5. Display Approval Report
```
═══════════════════════════════════════════
TASK APPROVAL: {task_id}
═══════════════════════════════════════════

Title: {task_title}
Type: {task_type} | Priority: {task_priority}

Acceptance Criteria ({met_count}/{total_count}):
{foreach criterion: ✅/❌ {criterion.given_when_then}}

Quality Metrics:
- Code Review: {status} ({issue_count} issues)
- Unit Tests: {passing}/{total} ({coverage}%)
- Integration Tests: {status}

═══════════════════════════════════════════
DECISION: {APPROVED ✅ | CHANGES_REQUIRED ⚠️ | BLOCKED ❌}
═══════════════════════════════════════════

{decision_reason}

<if (APPROVED)>
✅ TASK APPROVED

Task ready to mark complete.

Next Steps:
- Update task status: Edit Documents/Tasks/{task_id}/TASK.md (status=completed)
- Update backlog: Mark task complete
- Commit changes: /git:commit "Complete {task_id}: {task_title}"
</if>

<if (CHANGES_REQUIRED or BLOCKED)>
⚠️  APPROVAL BLOCKED

Remaining Work:
{foreach item: - {item.description}}

After fixing:
- Re-run: /task:approve {task_id}
</if>
```

## 6. Update Memory and Status
- Update task entity: approval_status, approval_date
- If approved: Update task spec status to "completed"
- Update backlog with completion

**Note**: Final quality gate for task. Validates all acceptance criteria met before marking complete.
