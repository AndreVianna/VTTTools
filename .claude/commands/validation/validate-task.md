---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Validate task specification for completeness and cross-reference integrity
argument-hint: {task_id:string:optional(all)}
---

# Validate Task Command

Comprehensive validation of task specifications. Validates cross-references, acceptance criteria, dependencies, and traceability to features, components, and domain models.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Phase 0: Setup & Scope

- **STEP 0A**: Determine validation scope:
  <case {task_id}>
  <is "all">
  - Use Glob: "Documents/Tasks/*/TASK.md"
  - Set {tasks_to_validate} = all found task files
  </is>
  <is empty>
  - Set {task_id} = "all"
  - Use Glob: "Documents/Tasks/*/TASK.md"
  - Set {tasks_to_validate} = all found task files
  </is>
  <otherwise>
  - Set {tasks_to_validate} = single task: "Documents/Tasks/{task_id}/TASK.md"
  - Abort if task file not found
  </otherwise>
  </case>

## Phase 1: Validate Each Task

<foreach {task_file} in {tasks_to_validate}>

- **STEP 1A**: Read task specification
- **STEP 1B**: Extract task metadata and cross-references
- **STEP 1C**: Use Task tool with code-reviewer agent:
  ```markdown
  ROLE: Task Specification Quality Reviewer

  TASK: Validate task specification against quality checklist

  TASK FILE: {task_file}

  SCORING RUBRIC (100 points):

  **Task Identity & Scope (15 points)**:
  - 5pts: Task type clearly specified
  - 5pts: Clear, actionable title and description
  - 5pts: Priority and effort estimate provided

  **Cross-References (35 points) - CRITICAL**:
  - 10pts: All affected features documented with impact
  - 10pts: All affected structure components documented
  - 10pts: Affected domain areas/models documented
  - 5pts: Affected BDD files identified

  **Success Criteria (15 points)**:
  - 10pts: Clear, measurable success criteria (3+)
  - 5pts: Acceptance criteria in Given/When/Then format

  **Implementation Plan (20 points)**:
  - 10pts: Technical approach documented
  - 5pts: Implementation steps with time estimates
  - 5pts: Dependencies identified (blocking and blocked)

  **Quality & Testing (15 points)**:
  - 5pts: Testing requirements specified
  - 5pts: Risk assessment completed
  - 5pts: Code locations identified

  TARGET: 80/100 minimum

  OUTPUT: Scoring with issues by priority level
  ```

- **STEP 1D**: Parse score and issues

</foreach>

## Phase 2: Cross-Reference Integrity Validation

<foreach {task_file} in {tasks_to_validate}>

- **STEP 2A**: Validate feature references:
  <foreach {feature} in {task.affected_features}>
  - Check if feature specification exists:
    - Use Glob: "Documents/Areas/*/Features/{feature.name}.md"
  - Report if feature not found
  </foreach>

- **STEP 2B**: Validate component references:
  <foreach {component} in {task.affected_components}>
  - Check if component exists in STRUCTURE.md
  - Check if component exists in codebase
  - Report missing components
  </foreach>

- **STEP 2C**: Validate use case references:
  <foreach {usecase} in {task.affected_use_cases}>
  - Check if use case specification exists
  - Verify use case belongs to referenced features
  - Report orphaned use case references
  </foreach>

- **STEP 2D**: Validate BDD file references:
  <foreach {bdd} in {task.affected_bdd_files}>
  - Check if BDD file exists: "Documents/Areas/**/{bdd.file_name}"
  - Report missing BDD files
  </foreach>

- **STEP 2E**: Validate domain area references:
  <foreach {domain} in {task.affected_domain_areas}>
  - Check if domain model exists: "Documents/Areas/{domain}/Domain/DOMAIN_MODEL.md"
  - Report missing domain models
  </foreach>

</foreach>

## Phase 3: Dependency Validation

<foreach {task_file} in {tasks_to_validate}>

- **STEP 3A**: Validate blocking tasks:
  <foreach {blocker} in {task.blocking_tasks}>
  - Check if blocker task exists: "Documents/Tasks/{blocker.task_id}/TASK.md"
  - Check blocker status (warn if already completed)
  - Detect circular dependencies
  </foreach>

- **STEP 3B**: Validate blocked tasks:
  <foreach {blocked} in {task.blocked_tasks}>
  - Check if blocked task exists
  - Verify reverse relationship
  </foreach>

- **STEP 3C**: Check for circular dependency chains:
  - Build dependency graph
  - Detect cycles
  - Report circular dependencies

</foreach>

## Phase 4: Generate Validation Report

- **STEP 4A**: Calculate aggregate scores:
  <if (validating all tasks)>
  - Average score across all tasks
  - Count tasks below 80/100
  - Identify lowest scoring task
  </if>

- **STEP 4B**: Display validation results:
  ```
  ═══════════════════════════════════════════════════════════════
  TASK VALIDATION RESULTS
  ═══════════════════════════════════════════════════════════════

  <if (validating all)>
  Tasks Validated: {task_count}
  Average Score: {avg_score}/100
  Passing (80+): {passing_count}/{task_count}
  Failing (<80): {failing_count}
  </if>

  <if (validating single task)>
  Task: {task_id} - {task_title}
  Score: {score}/100  [{grade}]
  Status: {pass_or_fail}
  </if>

  ═══════════════════════════════════════════════════════════════
  SECTION 1: QUALITY SCORES (per task or averaged)
  ═══════════════════════════════════════════════════════════════

  Task Identity & Scope:    {score}/15  [{grade}]
  Cross-References:         {score}/35  [{grade}]  ← CRITICAL
  Success Criteria:         {score}/15  [{grade}]
  Implementation Plan:      {score}/20  [{grade}]
  Quality & Testing:        {score}/15  [{grade}]

  OVERALL: {total_score}/100  [{overall_grade}]

  ═══════════════════════════════════════════════════════════════
  SECTION 2: CROSS-REFERENCE INTEGRITY
  ═══════════════════════════════════════════════════════════════

  Feature References:
  ✓ Valid: {valid_feature_refs}
  ✗ Invalid: {invalid_feature_refs}
  <foreach {invalid} in {invalid_feature_references}>
  - Task {invalid.task_id} references non-existent feature: {invalid.feature_name}
  </foreach>

  Component References:
  ✓ Valid: {valid_component_refs}
  ✗ Invalid: {invalid_component_refs}
  <foreach {invalid} in {invalid_component_references}>
  - Task {invalid.task_id} references non-existent component: {invalid.component_name}
  </foreach>

  Use Case References:
  ✓ Valid: {valid_usecase_refs}
  ✗ Invalid: {invalid_usecase_refs}

  BDD File References:
  ✓ Valid: {valid_bdd_refs}
  ✗ Invalid: {invalid_bdd_refs}

  ═══════════════════════════════════════════════════════════════
  SECTION 3: DEPENDENCY VALIDATION
  ═══════════════════════════════════════════════════════════════

  Blocking Task Dependencies:
  ✓ Valid: {valid_blockers}
  ✗ Invalid: {invalid_blockers}

  Circular Dependencies:
  <foreach {cycle} in {circular_dependencies}>
  - ⚠️  {cycle.path}
    Fix: {cycle.recommendation}
  </foreach>

  ═══════════════════════════════════════════════════════════════
  SECTION 4: PROPOSED IMPROVEMENTS
  ═══════════════════════════════════════════════════════════════

  🔴 CRITICAL Issues ({critical_count}):
  <foreach {issue} in {critical_issues}>
  - {issue.description}
  </foreach>

  🟡 HIGH Priority ({high_count}):
  <foreach {issue} in {high_issues}>
  - {issue.description}
  </foreach>

  🟢 MEDIUM Priority ({medium_count}):
  <foreach {issue} in {medium_issues}>
  - {issue.description}
  </foreach>

  ═══════════════════════════════════════════════════════════════
  SECTION 5: AUTO-FIX OPTIONS
  ═══════════════════════════════════════════════════════════════

  1. Fix CRITICAL issues only
  2. Fix CRITICAL + HIGH
  3. Fix CRITICAL + HIGH + MEDIUM
  4. Fix all issues
  5. Manual review - show improvement plan
  6. Skip auto-fix

  ═══════════════════════════════════════════════════════════════
  ```

## Phase 5: Auto-Fix (if requested)

- **STEP 5A**: Collect user choice
- **STEP 5B**: Apply fixes based on choice
- **STEP 5C**: Re-validate to show improvements

**IMPORTANT NOTES**:
- Validates task specifications for quality and completeness
- Checks cross-reference integrity (features, components, use cases, domain, BDD)
- Validates dependency relationships (no circular dependencies)
- Supports validating single task or all tasks
- Target score: 80/100 minimum
- Auto-fix capability for quality improvements
