---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, Edit, Glob
description: Validate technical structure specification for architectural integrity
argument-hint: {mode:string:optional(full)}
---

# Validate Structure

Comprehensive architectural validation of technical structure specification. Validates layer architecture, dependency rules, feature-component mappings, and cross-referencing integrity.

## 1. Initialize

<case {mode}>
<is "fast">
  - Skip file existence checks, skip codebase validation, limit feature reads to 10
<is "full">
  - Complete validation with all checks
<otherwise>
  - Default to "full" mode
</case>

- Read "Documents/Structure/STRUCTURE.md" - abort if missing
- Extract solution name and platform type
- Check memory for iteration count

## 2. Score Quality

- Use Task with code-reviewer agent:
  ```markdown
  ROLE: Structure Specification Quality Reviewer

  TASK: Score technical structure against quality checklist

  FILE: Documents/Structure/STRUCTURE.md

  SCORING (100 points):
  - Platform & Organization (15pts): Platform type, architecture style, all components listed with paths
  - Layer Architecture (25pts): All four layers (Domain/Application/Infrastructure/UI), components assigned to layers, responsibilities documented, dependency diagram
  - Feature Mapping (30pts) - CRITICAL: Every feature mapped to components, every component mapped to features (bidirectional)
  - Dependencies (20pts): Internal deps, external deps with versions, dependency rules, violations identified
  - Build & Deployment (10pts): Build commands, build order, deployment structure

  TARGET: 80/100 minimum

  OUTPUT: Scores and prioritized improvements
  ```

## 3. Cross-Reference Validation

- Load all feature specs: Glob "Documents/Areas/*/Features/*.md"
- For each feature:
  - Check if STRUCTURE.md lists implementing components
  - Check if feature spec has "Structure Mapping" section
  - Verify bidirectional match
- Report mismatches
- <if ({mode} is "full")>
  - Validate component existence in codebase
  - Validate feature completeness
</if>

## 4. Dependency Validation

- Validate layer dependency rules (Domain has no deps, Application only on Domain, etc.)
- Validate internal dependencies (target exists, follows layer rules)
- Identify circular dependencies
- Validate external dependencies (versions specified)

## 5. Display Results

```
═══════════════════════════════════════════
STRUCTURE VALIDATION
═══════════════════════════════════════════
Score: {score}/100 ({PASS ✅ | FAIL ❌})
Mode: {mode}
Iteration: {iteration}

┌──────────────────────┬────────┬────────┬────────┐
│ Dimension            │ Score  │ Target │ Status │
├──────────────────────┼────────┼────────┼────────┤
│ Platform & Organizat.│ XX/15  │ 12/15  │ ✅/⚠️  │
│ Layer Architecture   │ XX/25  │ 20/25  │ ✅/⚠️  │
│ Feature Mapping      │ XX/30  │ 24/30  │ ✅/⚠️  │
│ Dependencies         │ XX/20  │ 16/20  │ ✅/⚠️  │
│ Build & Deployment   │ XX/10  │  8/10  │ ✅/⚠️  │
├──────────────────────┼────────┼────────┼────────┤
│ TOTAL                │ XX/100 │ 80/100 │ ✅/⚠️  │
└──────────────────────┴────────┴────────┴────────┘

CROSS-REFERENCE VALIDATION:
Features with mappings: {N}/{total}
Components with mappings: {N}/{total}
Bidirectional consistency: {N}/{total}

ARCHITECTURAL VIOLATIONS:
Layer dependency violations: {count}
Circular dependencies: {count}
Missing components: {count}
Orphaned features: {count}

═══════════════════════════════════════════
PROPOSED IMPROVEMENTS
═══════════════════════════════════════════

🔴 CRITICAL ({count})
🟡 HIGH ({count})
🟢 MEDIUM ({count})
🔵 LOW ({count})
```

## 6. Auto-Fix Options

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

## 7. Apply & Re-validate

- Apply fixes using Edit tool
- Re-validate and display iteration comparison

**IMPORTANT**: Validates bidirectional feature-component traceability (CRITICAL). Identifies layer dependency violations, circular dependencies, orphaned features, missing components. Supports auto-fix. Target: 80/100 minimum.
