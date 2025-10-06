---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Implement complete feature by orchestrating domain + all use case implementations
argument-hint: {feature_name:string}
---

# Implement Feature Command

Orchestrates implementation of complete feature including domain layer (if not done) and all use cases. Provides progress tracking and can pause/resume. Creates PR when complete.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Phase 0: Validation & Planning

- **STEP 0A**: Validate {feature_name} is not empty
- **STEP 0B**: Find feature spec: "Documents/Areas/*/Features/{feature_name}.md"
- **STEP 0C**: Read feature spec to get:
  - Owning area
  - List of use cases
  - Use case count

- **STEP 0D**: Check prerequisites:
  - Domain model exists for area
  - Coding standards exist
  - Configuration exists

## Phase 0.5: Check for Implementation Roadmap (Optional Enhancement)

- **STEP 0.5A**: Look for feature roadmap:
  - Parse feature directory from feature specification path
  - Look for: "{feature_directory}/ROADMAP.md"
  - Example paths to check:
    - "Documents/Areas/*/Features/ROADMAP.md" (if feature is file in Features/)
    - "Documents/Areas/*/Features/{feature_name}/ROADMAP.md" (if feature is folder)
  <if (roadmap found)>
    - Read roadmap file
    - Extract: implementation_phases, use_case_sequence, quality_gates, risks
    - Display: "Found implementation roadmap - will follow planned phases"
    - Set {has_roadmap} = true
    - Set {use_roadmap_sequence} = true
  <else>
    - Set {has_roadmap} = false
    - Display: "No roadmap found - using default implementation order"
    - Set {use_roadmap_sequence} = false
  </if>

- **STEP 0.5B**: If roadmap exists, validate it's ready:
  - Check roadmap validation status in memory
  - <if (not validated or score < 80)>
    - Warn: "Roadmap not validated. Validate first? [Y/N]"
    - <if (Y)>
      - Run /validation:validate-roadmap feature {feature_name}
      - Wait for validation completion
    </if>
  </if>

## Phase 1: Check Domain Layer Status

- **STEP 1A**: Check if domain layer implemented for area:
  - Use mcp__memory__search_nodes for "DomainImpl_{area}"

<if (domain not implemented)>
  - Display: "Domain layer not implemented for {area}. Implement domain first? [Y/N]"
  <if (user says Y)>
    - Run /implement-domain {area}
    - Wait for completion and user commit
  <else>
    - Abort: "Domain layer required before use case implementation"
  </if>
</if>

## Phase 2: Implement Use Cases Sequentially

- **STEP 2A**: Initialize feature implementation tracking:
  - Use mcp__memory__create_entities:
    - name: "FeatureImpl_{feature_name}"
    - observations: ["use_cases_total: {count}", "use_cases_completed: 0", "started: {date}"]

- **STEP 2B**: Determine implementation sequence:
  <if ({has_roadmap} AND {use_roadmap_sequence})>
    - Extract use case sequence from roadmap phases
    - Set {implementation_order} = roadmap sequence
    - Set {quality_gates} = roadmap quality gates
    - Display: "Using roadmap-planned sequence"
  <else>
    - Set {implementation_order} = default order (from feature spec or alphabetical)
    - Set {quality_gates} = none
    - Display: "Using default implementation order"
  </if>

- **STEP 2C**: Display implementation plan:
  ```
  ═══════════════════════════════════════════
  FEATURE IMPLEMENTATION PLAN
  ═══════════════════════════════════════════

  Feature: {feature_name}
  Area: {area_name}
  Use Cases: {count}
  <if ({has_roadmap})>
  Roadmap: ✅ Found (following planned phases)
  Phases: {roadmap_phase_count}
  </if>

  Implementation Order:
  <foreach {usecase} in {implementation_order}>
  {index}. {usecase.name} <if ({has_roadmap})>(Phase {usecase.phase})</if>
  </foreach>

  Estimated Time: {estimate based on count and complexity}

  Domain Layer: ✅ Already implemented

  <if ({has_roadmap} AND {quality_gates} not empty)>
  Quality Gates: {quality_gate_count} checkpoints planned
  </if>

  Proceed? [Y/N]
  ```

- **STEP 2D**: For each use case in implementation order:
  <foreach {use_case} in {feature_use_cases}>

  - Display: "Implementing ({index}/{total}): {use_case}"

  - Call /implement-use-case {use_case}
    - This generates code, tests, and waits for user approval/commit
    - User commits when satisfied

  - Use mcp__memory__add_observations:
    - "use_cases_completed: {new_count}"
    - "last_completed: {use_case}"

  - Display progress:
    ```
    Progress: {completed}/{total} use cases
    ██████████░░░░░░░░░░ 50%

    Completed:
    ✅ {use_case_1}
    ✅ {use_case_2}

    Remaining:
    ⏳ {use_case_3}
    ⏳ {use_case_4}

    Continue to next use case? [Y/N/Pause]
    ```

  <if (user says Pause)>
    - Store state in memory
    - Exit: "Feature implementation paused. Resume with /implement-feature {feature_name}"
  </if>

  </foreach>

## Phase 3: Feature-Level Validation

- **STEP 3A**: All use cases complete, run comprehensive tests:
  - /test-unit feature {feature_name}
  - Display: Results for entire feature

- **STEP 3B**: Run automated code review:
  - /review-code {feature_name}
  - Display: Issues found

- **STEP 3C**: Summary:
  ```
  ═══════════════════════════════════════════
  FEATURE IMPLEMENTATION COMPLETE
  ═══════════════════════════════════════════

  Feature: {feature_name}
  Area: {area_name}
  Use Cases Implemented: {count}/{total}

  Implementation Summary:
  - Total Files: {count}
  - Total Tests: {count}
  - Tests Passing: {pass}/{total}
  - Overall Coverage: {percent}%

  Code Review:
  - Critical Issues: {count}
  - Warnings: {count}
  - Status: {APPROVED | NEEDS_FIXES}

  Git Status:
  - Branch: {current_branch}
  - Commits: {count} (all use cases committed)
  - Ready for PR: {yes|no}

  Next Steps:
  <if (issues exist)>
  - Fix critical issues before PR
  </if>
  <if (ready)>
  - /create-pr (creates PR with auto-generated description)
  </if>
  ```

## Phase 4: Update Memory

- **STEP 4A**: Use mcp__memory__add_observations:
  - "status: COMPLETE"
  - "completed_date: {date}"
  - "all_tests_passing: {bool}"
  - "ready_for_pr: {bool}"

**IMPORTANT NOTES**:
- Orchestrates domain + all use cases for a feature
- Can pause and resume
- Tracks progress in memory
- Each use case requires user commit (INTERACTIVE mode)
- Final validation before suggesting PR
- High-level command for implementing complete features