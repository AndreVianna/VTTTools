---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, Edit, Glob
description: Validate task specification for completeness and cross-reference integrity
argument-hint: {task_id:string:optional(all)}
---

# Validate Task

Comprehensive validation of task specifications. Validates cross-references, acceptance criteria, dependencies, and traceability to features, components, and domain models.

## 1. Determine Scope

<case {task_id}>
<is "all" or empty>
  - Use Glob: "Documents/Tasks/*/TASK.md"
<otherwise>
  - Set {tasks_to_validate} = "Documents/Tasks/{task_id}/TASK.md"
  - Abort if not found
</case>

## 2. Score Quality

- For each task:
  - Use Task with code-reviewer agent:
    ```markdown
    ROLE: Task Specification Quality Reviewer

    TASK: Validate task against quality checklist

    FILE: {task_file}

    SCORING (100 points):
    - Task Identity & Scope (15pts): Type, title/description, priority/effort estimate
    - Cross-References (35pts) - CRITICAL: Affected features with impact, structure components, domain areas/models, BDD files
    - Success Criteria (15pts): Clear measurable criteria (3+), acceptance criteria in Given/When/Then
    - Implementation Plan (20pts): Technical approach, steps with estimates, dependencies
    - Quality & Testing (15pts): Testing requirements, risk assessment, code locations

    TARGET: 80/100 minimum

    OUTPUT: Scores and prioritized improvements
    ```
  - Parse and store scores

## 3. Cross-Reference Validation

- For each task:
  - Validate feature references: Check if features exist
  - Validate component references: Check in STRUCTURE.md and codebase
  - Validate use case references: Check if exists and belongs to referenced features
  - Validate BDD file references: Check if exists
  - Validate domain area references: Check if domain model exists
  - Validate blocking tasks: Check if exists, detect circular dependencies
  - Validate blocked tasks: Check if exists, verify reverse relationship

## 4. Display Results

```
═══════════════════════════════════════════
TASK VALIDATION
═══════════════════════════════════════════
{Task: {id} | Tasks: {count}}
Score: {score}/100 ({PASS ✅ | FAIL ❌})

┌──────────────────────┬────────┬────────┬────────┐
│ Dimension            │ Score  │ Target │ Status │
├──────────────────────┼────────┼────────┼────────┤
│ Identity & Scope     │ XX/15  │ 12/15  │ ✅/⚠️  │
│ Cross-References     │ XX/35  │ 28/35  │ ✅/⚠️  │
│ Success Criteria     │ XX/15  │ 12/15  │ ✅/⚠️  │
│ Implementation Plan  │ XX/20  │ 16/20  │ ✅/⚠️  │
│ Quality & Testing    │ XX/15  │ 12/15  │ ✅/⚠️  │
├──────────────────────┼────────┼────────┼────────┤
│ TOTAL                │ XX/100 │ 80/100 │ ✅/⚠️  │
└──────────────────────┴────────┴────────┴────────┘

CROSS-REFERENCE INTEGRITY:
Feature references: {valid}/{total}
Component references: {valid}/{total}
Use case references: {valid}/{total}
BDD file references: {valid}/{total}

DEPENDENCY VALIDATION:
Blocking task dependencies: {valid}/{total}
Circular dependencies: {count}

═══════════════════════════════════════════
PROPOSED IMPROVEMENTS
═══════════════════════════════════════════

🔴 CRITICAL ({count})
🟡 HIGH ({count})
🟢 MEDIUM ({count})
🔵 LOW ({count})
```

## 5. Auto-Fix Options

```
═══════════════════════════════════════════
APPLY IMPROVEMENTS?
═══════════════════════════════════════════

Options:
1. Fix CRITICAL only
2. Fix CRITICAL + HIGH
3. Fix CRITICAL + HIGH + MEDIUM
4. Fix all issues
5. Manual review
6. Skip

[Enter 1-6]:
```

## 6. Apply & Re-validate

- Apply fixes and re-validate

**IMPORTANT**: Validates cross-reference integrity (features, components, use cases, domain, BDD). Validates dependency relationships (no circular dependencies). Supports validating single task or all tasks. Target: 80/100 minimum.
