---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Validate technical structure specification for architectural integrity
argument-hint: {mode:string:optional(full)}
---

# Validate Structure Command

Comprehensive architectural validation of technical structure specification. Validates layer architecture, dependency rules, feature-component mappings, and cross-referencing integrity.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Phase 0: Validation & Setup

- **STEP 0A**: Parse {mode} parameter for performance optimization:
  <case {mode}>
  <is "fast">
    - Set {skip_file_existence_checks} = true
    - Set {skip_codebase_validation} = true
    - Set {limit_feature_reads} = 10
    - Display: "Fast mode: Quality scoring only, skipping file validation"
  </is>
  <is "full">
    - Set {skip_file_existence_checks} = false
    - Set {skip_codebase_validation} = false
    - Set {limit_feature_reads} = unlimited
    - Display: "Full mode: Complete validation with all checks"
  </is>
  <otherwise>
    - Default to "full" mode
  </otherwise>
  </case>

- **STEP 0B**: Use Read tool to load "Documents/Structure/STRUCTURE.md" - abort if missing with guidance to run /define-structure
- **STEP 0C**: Extract solution name and platform type from specification
- **STEP 0D**: Use mcp__memory__search_nodes for existing validation entity
  <if (validation entity exists)>
  - Increment iteration counter
  </if>

## Phase 1: Quality Scoring

- **STEP 1A**: Use Task tool with code-reviewer agent to score against checklist:
  ```markdown
  ROLE: Structure Specification Quality Reviewer

  TASK: Score technical structure against quality checklist

  STRUCTURE FILE: Documents/Structure/STRUCTURE.md
  FEATURE SPECS: Documents/Areas/*/Features/*.md

  SCORING RUBRIC (100 points total):

  **Platform & Organization (15 points)**:
  - 5pts: Platform type clearly specified
  - 5pts: Architecture style documented (monolith/microservices/etc.)
  - 5pts: All components/projects/modules listed with paths

  **Layer Architecture (25 points)**:
  - 10pts: All four layers represented (Domain, Application, Infrastructure, UI)
  - 5pts: Each component assigned to correct layer
  - 5pts: Layer responsibilities clearly documented
  - 5pts: Layer dependency flow diagram present

  **Feature Mapping (30 points) - CRITICAL**:
  - 15pts: Every feature mapped to implementing components
  - 15pts: Every component mapped to features it implements
  - BIDIRECTIONAL: Both directions documented

  **Dependencies (20 points)**:
  - 5pts: Internal dependencies documented for all components
  - 5pts: External dependencies listed with versions
  - 5pts: Dependency rules (allowed/forbidden) specified
  - 5pts: Dependency violations identified (if any)

  **Build & Deployment (10 points)**:
  - 5pts: Build commands documented
  - 3pts: Build order specified
  - 2pts: Deployment structure described

  TARGET: 80/100 minimum

  For each dimension, identify:
  - Score achieved
  - Issues found (critical, high, medium, low)
  - Specific improvements needed

  OUTPUT: Complete scoring with issue list
  ```

- **STEP 1B**: Parse scores and categorize issues

## Phase 2: Cross-Reference Validation

- **STEP 2A**: Validate bidirectional feature-component mappings:
  - Load all feature specifications: Glob "Documents/Areas/*/Features/*.md"
  - Display: "Validating {feature_count} features..."
  - For each feature:
    - Display progress: "Checking feature {current}/{total}: {feature_name}"
    - Check if STRUCTURE.md lists implementing components
    - Check if feature spec has "Structure Mapping" section
    - Verify both directions match
  - Report mismatches:
    - Features in STRUCTURE but not in feature specs
    - Features in specs but not in STRUCTURE
    - Component→feature mappings without reverse

- **STEP 2B**: Validate component existence:
  <if ({skip_file_existence_checks} equals false)>
  - For each component listed in STRUCTURE.md:
    - Check if component exists in codebase (search for file/folder)
    - Verify component is in declared layer (path matches layer)
  - Report missing or misplaced components
  <else>
  - Skip file existence checks (fast mode)
  - Display: "Skipped component existence validation (fast mode)"
  </if>

- **STEP 2C**: Validate feature completeness:
  <if ({limit_feature_reads} equals unlimited)>
  - List all features from solution spec
  <else>
  - List first {limit_feature_reads} features (fast mode)
  - Display: "Validating sample of {limit_feature_reads} features (fast mode)"
  </if>
  - Check each feature has at least one implementing component
  - Report unmapped features (orphaned features with no implementation)

## Phase 3: Dependency Validation

- **STEP 3A**: Validate layer dependency rules:
  - Check Domain layer has no dependencies on other layers
  - Check Application layer only depends on Domain
  - Check Infrastructure/UI layers depend on Application/Domain (not each other)
  - Report violations with specific component→component examples

- **STEP 3B**: Validate internal dependencies:
  - For each component's internal dependencies:
    - Verify target component exists
    - Check dependency follows layer rules
    - Identify circular dependencies

- **STEP 3C**: Validate external dependencies:
  - Check all external dependencies have versions specified
  - Identify deprecated or vulnerable packages (if possible)
  - Check for duplicate dependencies across components

## Phase 4: Generate Validation Report

- **STEP 4A**: Display validation results:
  ```
  ═══════════════════════════════════════════════════════════════
  STRUCTURE VALIDATION RESULTS
  ═══════════════════════════════════════════════════════════════

  SECTION 1: QUALITY SCORES
  ═══════════════════════════════════════════════════════════════

  Platform & Organization: {score}/15  [{grade}]
  Layer Architecture:      {score}/25  [{grade}]
  Feature Mapping:         {score}/30  [{grade}]  ← CRITICAL
  Dependencies:            {score}/20  [{grade}]
  Build & Deployment:      {score}/10  [{grade}]

  OVERALL SCORE: {total_score}/100  [{overall_grade}]
  TARGET: 80/100 minimum

  STATUS: {pass_or_fail}

  ═══════════════════════════════════════════════════════════════
  SECTION 2: CROSS-REFERENCE VALIDATION
  ═══════════════════════════════════════════════════════════════

  Feature-Component Traceability:
  ✓ Features with mappings: {mapped_features}/{total_features}
  ✓ Components with mappings: {mapped_components}/{total_components}
  ✓ Bidirectional consistency: {consistent_mappings}/{total_mappings}

  Issues Found:
  <foreach {issue} in {cross_ref_issues}>
  - {issue.severity}: {issue.description}
    Example: {issue.example}
  </foreach>

  ═══════════════════════════════════════════════════════════════
  SECTION 3: ARCHITECTURAL VIOLATIONS
  ═══════════════════════════════════════════════════════════════

  Layer Dependency Violations:
  <foreach {violation} in {layer_violations}>
  - 🔴 {violation.from} → {violation.to}
    Violation: {violation.reason}
    Fix: {violation.recommendation}
  </foreach>

  Circular Dependencies:
  <foreach {cycle} in {circular_dependencies}>
  - ⚠️  {cycle.path}
    Impact: {cycle.impact}
    Fix: {cycle.recommendation}
  </foreach>

  Missing Components:
  <foreach {missing} in {missing_components}>
  - Component "{missing.name}" referenced but not found in codebase
  </foreach>

  Orphaned Features:
  <foreach {orphan} in {orphaned_features}>
  - Feature "{orphan.name}" has no implementing components
    Recommendation: {orphan.recommendation}
  </foreach>

  ═══════════════════════════════════════════════════════════════
  SECTION 4: PROPOSED IMPROVEMENTS
  ═══════════════════════════════════════════════════════════════

  🔴 CRITICAL Issues ({critical_count}):
  <foreach {issue} in {critical_issues}>
  - {issue.description}
    Impact: {issue.impact}
    Fix: {issue.fix}
  </foreach>

  🟡 HIGH Priority ({high_count}):
  <foreach {issue} in {high_issues}>
  - {issue.description}
    Fix: {issue.fix}
  </foreach>

  🟢 MEDIUM Priority ({medium_count}):
  <foreach {issue} in {medium_issues}>
  - {issue.description}
    Fix: {issue.fix}
  </foreach>

  ═══════════════════════════════════════════════════════════════
  SECTION 5: AUTO-FIX OPTIONS
  ═══════════════════════════════════════════════════════════════

  Apply improvements automatically:

  1. Fix CRITICAL issues only ({critical_count} items)
  2. Fix CRITICAL + HIGH issues ({critical_count + high_count} items)
  3. Fix CRITICAL + HIGH + MEDIUM ({critical_count + high_count + medium_count} items)
  4. Fix all issues including LOW priority
  5. Manual review - show detailed improvement plan
  6. Skip auto-fix - I'll handle manually

  ═══════════════════════════════════════════════════════════════
  ```

## Phase 5: Auto-Fix Implementation (if requested)

- **STEP 5A**: Collect user choice for auto-fix option (1-6)
- **STEP 5B**:
  <case {user_choice}>
  <is 1>
  - Apply only critical fixes using Edit/Write tools
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
  - Generate detailed improvement plan without applying
  </is>
  <is 6>
  - Exit without changes
  </is>
  </case>

- **STEP 5C**: Re-run validation to show improvement
- **STEP 5D**: Report new score and remaining issues

**IMPORTANT NOTES**:
- Validates technical structure architectural integrity
- Checks bidirectional feature-component traceability (CRITICAL)
- Identifies layer dependency violations
- Detects circular dependencies
- Finds orphaned features (no implementing components)
- Finds missing components (referenced but don't exist)
- Supports auto-fix with user control
- Target score: 80/100 minimum
