---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, Edit, Glob, Grep
description: Validate BDD feature files against Cucumber best practices and quality standards
argument-hint: {scope:string:optional(all)}
---

# BDD Feature Files Validation

Validate Cucumber BDD feature files against Gherkin best practices, BDD principles, and quality standards. Provides scoring with automated fixes.

## 1. Parse Scope & Initialize

<case {scope}>
<is empty or "all">
  - Set {target_path} = "Documents/Areas"
<is area name>
  - Verify area exists: Glob "Documents/Areas/{scope}"
  - Set {target_path} = "Documents/Areas/{scope}"
<is feature name>
  - Find feature: Glob "Documents/Areas/*/Features/{scope}/*.feature"
<otherwise>
  - Abort with error: "Invalid scope. Use: 'all', area name, or feature name"
</case>

- Use mcp__memory__search_nodes for "BDD_Validation"
- If exists: increment iteration, else set iteration = 1

## 2. Scan & Score

- Use Glob "{target_path}/**/*.feature" to find files
- For each feature file:
  - Use Task with code-reviewer agent:
    ```markdown
    ROLE: BDD Quality Reviewer

    TASK: Score BDD feature file against Gherkin best practices

    FILE: {file_path}

    SCORING (100 points):
    - Structure (25pts): User story format, Background user-only, Rule usage, scenario titles, hierarchy
    - Language (25pts): CRITICAL - Zero "the system/application/service" (10pts), declarative user-focused, business terminology
    - Coverage (30pts): Happy path, business rules tested, error scenarios, edge cases
    - Maintainability (20pts): 3-7 steps per scenario, one behavior, logical tagging

    TARGET: 80/100 minimum

    CRITICAL CHECKS:
    - No "the system/application/service" language (10pt penalty per violation)
    - Background contains ONLY user context (no system state)
    - Rule for constraints only (not workflows/categories)

    OUTPUT: Score, issues by priority (Critical/High/Medium/Low), specific fixes
    ```
  - Store scores and issues

## 3. Display Results

```
═══════════════════════════════════════════
BDD VALIDATION RESULTS
═══════════════════════════════════════════
Scope: {scope}
Files: {count}
Average: {avg}/100 ({PASS ✅ | FAIL ❌})
Iteration: {iteration}

┌──────────────────┬────────┬────────┬────────┐
│ Dimension        │ Score  │ Target │ Status │
├──────────────────┼────────┼────────┼────────┤
│ Structure        │ XX/25  │ 20/25  │ ✅/⚠️  │
│ Language         │ XX/25  │ 20/25  │ ✅/⚠️  │
│ Coverage         │ XX/30  │ 24/30  │ ✅/⚠️  │
│ Maintainability  │ XX/20  │ 16/20  │ ✅/⚠️  │
├──────────────────┼────────┼────────┼────────┤
│ TOTAL            │ XX/100 │ 80/100 │ ✅/⚠️  │
└──────────────────┴────────┴────────┴────────┘

═══════════════════════════════════════════
PROPOSED IMPROVEMENTS
═══════════════════════════════════════════

🔴 CRITICAL ({count})
1. [{FILE}] System-centric language
   Current: "the system should validate" found {N} times
   Required: Replace with user-focused language
   Impact: +10 pts | Effort: Low

🟡 HIGH ({count})
{improvements}

🟢 MEDIUM ({count})
{improvements}

🔵 LOW ({count})
{improvements}
```

## 4. Auto-Fix Options

```
═══════════════════════════════════════════
APPLY IMPROVEMENTS?
═══════════════════════════════════════════
Total: {count} | Impact: {current}→{projected}

Options:
1. Apply CRITICAL only
2. Apply CRITICAL + HIGH
3. Apply CRITICAL + HIGH + MEDIUM (ALL except LOW)
4. Apply ALL
5. Interactive review
6. Skip

[Enter 1-6]:
```

## 5. Apply Fixes & Re-validate

<case {user_choice}>
<is 1-4>
  - Apply selected fixes using Edit tool
  - Re-run validation recursively
  - Display iteration comparison
<is 5>
  - Prompt Y/N for each fix
<is 6>
  - Exit
</case>

- Use mcp__memory__add_observations to store results
- Display final summary with next steps

**IMPORTANT**: Validates against BDD_CUCUMBER_GUIDE.md standards. Iterative improvement with auto-fix for system language, Background violations, Rule misuse.
