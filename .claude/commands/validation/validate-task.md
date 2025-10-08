---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Validate task specification for completeness and cross-reference integrity
argument-hint: {task_id:string:optional(all)}
---

# Validate Task Command

Validates task specifications against quality standards. Checks cross-references, acceptance criteria, dependencies, and traceability.

**SEE**: @Documents/Guides/ARCHITECTURE_PATTERN.md, @Documents/Guides/TESTING_GUIDE.md

## Section 1: Validation Execution

**STEP 1**: Determine scope:
<case {task_id}>
<is "all">Use Glob: "Documents/Tasks/*/TASK.md" → {tasks_to_validate}</is>
<is empty>Set {task_id}="all", use Glob: "Documents/Tasks/*/TASK.md" → {tasks_to_validate}</is>
<otherwise>Set {tasks_to_validate} = "Documents/Tasks/{task_id}/TASK.md" (abort if not found)</otherwise>
</case>

**STEP 2**: Validate each task using Task tool with code-reviewer agent:

<foreach {task_file} in {tasks_to_validate}>

```markdown
ROLE: Task Specification Validator

TASK FILE: {task_file}

VALIDATION RUBRIC (100 points, 80+ to pass):
- Task Identity (15): Type, title, priority, effort
- Cross-References (35): Features (10), Components (10), Domain (10), BDD (5)
- Success Criteria (15): Measurable criteria (10), Given/When/Then (5)
- Implementation (20): Approach (10), Steps (5), Dependencies (5)
- Quality (15): Testing (5), Risks (5), Code locations (5)

CHECK CROSS-REFERENCE INTEGRITY:
- Features: Glob "Documents/Areas/*/Features/{name}.md"
- Components: Verify in STRUCTURE.md + codebase
- Use Cases: Check spec exists, matches features
- BDD: Find "Documents/Areas/**/{file}.feature"
- Domain: Find "Documents/Areas/{area}/Domain/DOMAIN_MODEL.md"

CHECK DEPENDENCIES:
- Blocking tasks exist: "Documents/Tasks/{id}/TASK.md"
- No circular dependencies
- Reverse relationships valid

OUTPUT:
- Section scores with grade (A-F)
- Invalid cross-references list
- Circular dependencies
- Issues by priority (CRITICAL/HIGH/MEDIUM)
```

</foreach>

## Section 2: Report Generation

**STEP 3**: Calculate results:
- {total_score} = average if validating all, else single score
- {pass_fail} = "PASS" if score ≥ 80, else "FAIL"
- {invalid_refs} = count of broken cross-references
- {circular_deps} = count of dependency cycles

**STEP 4**: Display report:

```
## TASK VALIDATION RESULTS
───────────────────────────────────────────────────────────────

<if ({task_id} equals "all")>
Tasks Validated: {count}
Average Score: {avg_score}/100
Passing (80+): {passing_count}
Failing (<80): {failing_count}
</if>

<if ({task_id} not equals "all")>
Task: {task_id} - {title}
Score: {score}/100 [{grade}]
Status: {pass_fail}
</if>

───────────────────────────────────────────────────────────────
QUALITY BREAKDOWN
───────────────────────────────────────────────────────────────
Task Identity:       {score}/15  [{grade}]
Cross-References:    {score}/35  [{grade}]  ← CRITICAL
Success Criteria:    {score}/15  [{grade}]
Implementation:      {score}/20  [{grade}]
Quality & Testing:   {score}/15  [{grade}]

───────────────────────────────────────────────────────────────
INTEGRITY ISSUES
───────────────────────────────────────────────────────────────
Invalid Features:    {count}
Invalid Components:  {count}
Invalid Use Cases:   {count}
Invalid BDD Files:   {count}
Circular Deps:       {count}

<foreach {issue} in {integrity_issues}>
- {issue.type}: {issue.description}
</foreach>

───────────────────────────────────────────────────────────────
IMPROVEMENTS NEEDED
───────────────────────────────────────────────────────────────
🔴 CRITICAL ({count}):
<foreach {issue} in {critical_issues}>
- {issue.description}
</foreach>

🟡 HIGH ({count}):
<foreach {issue} in {high_issues}>
- {issue.description}
</foreach>

🟢 MEDIUM ({count}):
<foreach {issue} in {medium_issues}>
- {issue.description}
</foreach>

───────────────────────────────────────────────────────────────
AUTO-FIX OPTIONS
───────────────────────────────────────────────────────────────
1. Fix CRITICAL only
2. Fix CRITICAL + HIGH
3. Fix all issues
4. Manual review (show plan)
5. Skip

───────────────────────────────────────────────────────────────
```

## Section 3: Auto-Fix (Optional)

**STEP 5**: If user selects option 1-3:
- Apply fixes based on choice
- Use Edit tool to update task files
- Re-run validation on fixed tasks
- Display before/after scores

**STEP 6**: If user selects option 4:
- Use Task tool with solution-engineer agent to generate improvement plan
- Show specific edits needed per task
- Wait for user approval before applying

## Quick Reference

- **Architecture**: `Documents/Guides/ARCHITECTURE_PATTERN.md`
- **Testing Guide**: `Documents/Guides/TESTING_GUIDE.md`
- **Templates**: `.claude/templates/TASK_TEMPLATE.md`
- **Related**: `/creation:create-task`, `/task:show-impact`, `/update:update-task`

**NOTES**:
- Validates specifications for quality (80/100 target)
- Checks cross-references to features, components, use cases, domain, BDD
- Detects circular dependencies
- Supports bulk validation ({task_id}="all")
- Optional auto-fix with severity filtering
