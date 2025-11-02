---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, Glob, Bash
description: Display hierarchical solution structure with specification, implementation, and testing status
argument-hint: {detail_level:string:optional(summary)} {mode:string:optional(full)}
---

# Solution Status

Display hierarchical solution structure: specifications, implementation progress, testing status.

**Modes**:
- summary (default): Areas → Features (collapsed)
- detailed: Areas → Features → Use Cases
- full: Complete hierarchy with implementation & test status

## 1. Discover Solution Structure

- Read Documents/SOLUTION.md (abort if not found)
- Extract solution name
- Glob discover all artifacts:
  - Domain Models: Documents/Areas/*/DOMAIN_MODEL.md
  - Features: Documents/Areas/*/Features/*.md
  - Use Cases: Documents/Areas/*/Features/*/UseCases/*.md
  - BDD: Documents/Areas/**/*.feature
  - Structure: Documents/Structure/STRUCTURE.md
  - Tasks: Documents/Tasks/*/TASK.md, Documents/Tasks/BACKLOG.md
  - STATUS files: *_STATUS.md at all levels
- Parse paths to build hierarchy (areas→features→use cases)

## 2. Load STATUS Data

<case {mode}>
<is "fast">
- Skip STATUS files (spec count only)
</is>
<is "full">
- Read SOLUTION_STATUS.md: phase progress, metrics
- Read DOMAIN_STATUS.md per area: implementation status
- Read FEATURE_STATUS.md per feature: use case matrix
- Read USE_CASE_STATUS.md per use case: layer status, tests, quality
</is>
</case>

- Parse structure data (if exists): components, layers, feature mapping
- Parse task data (if exists): backlog, sprint, priorities

## 3. Display View

<case {detail_level}>
<is "summary">
```
SOLUTION STRUCTURE

{Solution Name} v{version}

{Area 1} ({feature_count} features, {use_case_count} use cases)
  - {Feature 1} ({use_case_count} use cases)
  - {Feature 2} ({use_case_count} use cases)

{Area 2} ({feature_count} features, {use_case_count} use cases)
  - {Feature 3} ({use_case_count} use cases)

Summary: {area_count} areas, {feature_count} features, {use_case_count} use cases
```
</is>

<is "detailed">
```
SOLUTION STRUCTURE (Detailed)

{Solution Name} v{version}

{Area 1}
  {Feature 1}
    - {Use Case 1.1} ({ui_type})
    - {Use Case 1.2} ({ui_type})
  {Feature 2}
    - {Use Case 2.1} ({ui_type})

{Area 2}
  {Feature 3}
    - {Use Case 3.1} ({ui_type})

BDD Coverage: {bdd_count} files, {scenario_count} scenarios
```
</is>

<is "full">
```
SOLUTION STRUCTURE (Full Status)

{Area 1}
  {Feature 1}
    - {Use Case 1.1} | Impl: {✅/🔨/❌} | Tests: {passing}/{total} | Quality: {score}
    - {Use Case 1.2} | Impl: {status} | Tests: {status} | Quality: {score}

Overall: {impl_percent}% implemented, {test_percent}% tested, {quality_avg}/100 quality
```
</is>
</case>

## 4. Display Technical & Work Views

<if ({has_structure})>
```
TECHNICAL VIEW
Platform: {platform}
Architecture: {architecture}
Components: Domain ({count}), Application ({count}), Infrastructure ({count}), UI ({count})
Feature Mapping: {mapped}/{total}
```
</if>

<if ({has_tasks})>
```
WORK VIEW
Tasks: {total} ({completed} done, {in_progress} active, {blocked} blocked)
By Type: Features ({count}), Bugs ({count}), Refactor ({count})
Current Sprint: {sprint_name} ({sprint_tasks} tasks, {sprint_velocity} points)
```
</if>

## 5. Display Metrics

```
SOLUTION METRICS
Specification: {area_count} areas, {feature_count} features, {use_case_count} use cases
BDD: {bdd_count} files, {scenario_count} scenarios ({bdd_percent}% coverage)
UI: Pages ({count}), APIs ({count}), Forms ({count}), Widgets ({count})
Implementation: {impl_percent}% complete
Quality: {quality_avg}/100 average
```

**Commands**:
- Details: /task:show-impact {task_id}
- Validate: /validation:validate-solution
- Implement: /implementation:implement-feature {name}
