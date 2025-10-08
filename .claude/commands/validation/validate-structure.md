---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Validate technical structure specification for architectural integrity
argument-hint: {mode:string:optional(full)}
---

# Validate Structure Command

Validates technical structure specification against DDD architecture, layer dependencies, and feature-component traceability.

**Reference**: `Documents/Guides/VTTTOOLS_STACK.md` for architecture patterns

## Setup & Configuration

<case {mode}>
<is "fast">
- Set {skip_file_checks} = true, {skip_codebase_validation} = true, {limit_features} = 10
- Display: "Fast mode: Quality scoring only"
</is>
<is "full">
- Set {skip_file_checks} = false, {skip_codebase_validation} = false, {limit_features} = unlimited
- Display: "Full mode: Complete validation"
</is>
<otherwise>
- Default to "full" mode
</otherwise>
</case>

**Load Structure**: Read "Documents/Structure/STRUCTURE.md" (abort if missing → run /define-structure)
**Check Memory**: Search for existing validation entity (mcp__memory__search_nodes), increment iteration if found

## Section 1: Quality Scoring

Use Task tool with code-reviewer agent:

```markdown
ROLE: Structure Quality Reviewer
TASK: Score against quality checklist

SCORING (100 points):
- Platform & Organization (15pts): Type, architecture style, component paths
- Layer Architecture (25pts): All 4 layers (Domain/Application/Infrastructure/UI), correct assignments, dependency flow
- Feature Mapping (30pts): Bidirectional feature↔component mappings (CRITICAL)
- Dependencies (20pts): Internal/external dependencies, versions, rules, violations
- Build & Deployment (10pts): Commands, order, deployment structure

TARGET: 80/100 minimum

OUTPUT: Scores + categorized issues (critical/high/medium/low)
```

Parse scores and categorize issues for reporting.

## Section 2: Cross-Reference Validation

**Feature-Component Mappings**:
- Glob all features: "Documents/Areas/*/Features/*.md"
- For each feature (progress display):
  - Verify STRUCTURE.md lists implementing components
  - Verify feature spec has "Structure Mapping" section
  - Check bidirectional consistency
- Report mismatches (features without components, components without features)

**Component Existence**:
<if ({skip_file_checks} equals false)>
- For each component in STRUCTURE.md:
  - Check existence in codebase
  - Verify layer placement (path matches declared layer)
- Report missing/misplaced components
<else>
- Skip (fast mode)
</if>

**Feature Completeness**:
<if ({limit_features} equals unlimited)>
- List all features from solution spec
<else>
- List first {limit_features} features (fast mode sample)
</if>
- Check each feature has ≥1 implementing component
- Report orphaned features

## Section 3: Dependency Validation

**Layer Rules** (per VTTTOOLS_STACK.md DDD architecture):
- Domain: No dependencies on other layers
- Application: Only depends on Domain
- Infrastructure/UI: Depend on Application/Domain (not each other)
- Report violations with component→component examples

**Internal Dependencies**:
- Verify target components exist
- Check layer rule compliance
- Identify circular dependencies

**External Dependencies**:
- Check versions specified
- Identify deprecated/vulnerable packages
- Find duplicate dependencies across components

## Section 4: Validation Report

```
## STRUCTURE VALIDATION RESULTS
───────────────────────────────────────────────────────────────

QUALITY SCORES
───────────────────────────────────────────────────────────────
Platform & Organization: {score}/15  [{grade}]
Layer Architecture:      {score}/25  [{grade}]
Feature Mapping:         {score}/30  [{grade}]  ← CRITICAL
Dependencies:            {score}/20  [{grade}]
Build & Deployment:      {score}/10  [{grade}]

OVERALL: {total}/100  [{grade}]  |  TARGET: 80/100  |  {status}

CROSS-REFERENCE VALIDATION
───────────────────────────────────────────────────────────────
✓ Features mapped: {count}/{total}
✓ Components mapped: {count}/{total}
✓ Bidirectional consistency: {count}/{total}

<foreach {issue} in {cross_ref_issues}>
- {severity}: {description}
  Example: {example}
</foreach>

ARCHITECTURAL VIOLATIONS
───────────────────────────────────────────────────────────────
Layer Violations:
<foreach {v} in {layer_violations}>
- 🔴 {v.from} → {v.to}: {v.reason}
  Fix: {v.fix}
</foreach>

Circular Dependencies:
<foreach {cycle} in {circular_deps}>
- ⚠️  {cycle.path}
  Fix: {cycle.fix}
</foreach>

Missing Components: {list}
Orphaned Features: {list with recommendations}

PROPOSED IMPROVEMENTS
───────────────────────────────────────────────────────────────
🔴 CRITICAL ({count}):
<foreach {i} in {critical}>
- {i.description}
  Impact: {i.impact} | Fix: {i.fix}
</foreach>

🟡 HIGH ({count}): {list with fixes}
🟢 MEDIUM ({count}): {list with fixes}

AUTO-FIX OPTIONS
───────────────────────────────────────────────────────────────
1. Fix CRITICAL only ({count} items)
2. Fix CRITICAL + HIGH ({count} items)
3. Fix CRITICAL + HIGH + MEDIUM ({count} items)
4. Fix all issues (including LOW)
5. Manual review - show detailed plan
6. Skip - handle manually
───────────────────────────────────────────────────────────────
```

## Section 5: Auto-Fix (if requested)

Collect user choice (1-6):

<case {user_choice}>
<is 1>
- Apply critical fixes (Edit/Write tools)
</is>
<is 2>
- Apply critical + high fixes
</is>
<is 3>
- Apply critical + high + medium fixes
</is>
<is 4>
- Apply all fixes
</is>
<is 5>
- Generate detailed improvement plan (no changes)
</is>
<is 6>
- Exit without changes
</is>
</case>

Re-run validation to show improvement and report new score + remaining issues.

---

**KEY VALIDATIONS**:
- ✓ Bidirectional feature↔component traceability (CRITICAL)
- ✓ Layer dependency rules (Domain→Application→Infrastructure/UI)
- ✓ Component existence and placement
- ✓ Circular dependency detection
- ✓ Orphaned features and missing components
- ✓ Architecture pattern compliance (see VTTTOOLS_STACK.md)
