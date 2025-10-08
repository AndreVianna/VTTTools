---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite, SlashCommand]
description: Implement task by orchestrating work across features, components, domain, and use cases
argument-hint: {task_id:string}
---

# Implement Task Command

Orchestrates task implementation based on cross-references. Analyzes task scope and delegates to appropriate implementation commands (implement-domain, implement-use-case, etc.). Updates task status and tracks progress.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Quick Reference
- **Architecture**: `Documents/Guides/VTTTOOLS_STACK.md`
- **Code Examples**: `Documents/Guides/CODE_EXAMPLES.md`
- **Implementation**: `Documents/Guides/IMPLEMENTATION_GUIDE.md`

## Process

### Validation & Setup

- **STEP 0A**: Validate {task_id} is not empty
- **STEP 0B**: Use Read tool to load task specification: "Documents/Tasks/{task_id}/TASK.md"
  - Abort if not found: "Task {task_id} not found. Run /create-task first."
- **STEP 0C**: Parse task metadata:
  - Extract: task_type, task_status, priority, effort
  - Extract cross-references: affected_features, affected_components, affected_use_cases, affected_domain_areas
- **STEP 0D**: Validate task is ready for implementation:
  <if ({task_status} equals "completed")>
  - Warn: "Task already completed. Continue anyway? (Y/N)"
  - Exit if user says no
  </if>
  <if ({task_status} equals "blocked")>
  - Error: "Task is blocked. Resolve blockers first."
  - List blocking tasks
  - Exit
  </if>

### Check for Implementation Roadmap (Optional Enhancement)

- **STEP 0.5A**: Look for task roadmap:
  - Check: "Documents/Tasks/{task_id}/ROADMAP.md"
  <if (roadmap found)>
    - Read roadmap file
    - Extract: implementation_phases, orchestration_sequence, quality_gates
    - Display: "Found task roadmap - will follow planned orchestration"
    - Set {has_roadmap} = true
    - Set {orchestration_plan} = roadmap phases
  <else>
    - Set {has_roadmap} = false
    - Display: "No roadmap found - will analyze task and create orchestration plan"
  </if>

- **STEP 0.5B**: If roadmap exists, validate it:
  - Check roadmap validation status in memory
  - <if (not validated or score < 80)>
    - Warn: "Roadmap not validated. Validate first? [Y/N]"
    - <if (Y)>
      - Run /validation:validate-roadmap task {task_id}
    </if>
  </if>

### Analyze Implementation Scope

- **STEP 1A**: Determine orchestration plan:
  <if ({has_roadmap})>
    - Use orchestration plan from roadmap
    - Set {commands_to_run} = roadmap phases/commands
    - Display: "Using roadmap orchestration plan ({phase_count} phases)"
    - Skip to Step 1C
  <else>
    - Analyze scope with agent (Step 1B)
  </if>

- **STEP 1B**: Use Task tool with solution-engineer agent to analyze scope (if no roadmap):
  ```markdown
  ROLE: Task Implementation Orchestrator

  TASK: Analyze task scope and plan orchestrated implementation

  TASK SPECIFICATION: Documents/Tasks/{task_id}/TASK.md

  CROSS-REFERENCES:
  - Features: {affected_features}
  - Components: {affected_components}
  - Use Cases: {affected_use_cases}
  - Domain Areas: {affected_domain_areas}

  ANALYSIS REQUIRED:
  1. Determine implementation order based on dependencies:
     - Domain changes first (if domain affected)
     - Use case implementation next
     - Structure/component changes
     - BDD updates last

  2. Identify which existing commands to invoke:
     - /implementation:implement-domain {area} (if domain_areas affected)
     - /implementation:implement-use-case {use_case} (if use_cases affected)
     - Custom implementation for structure changes
     - /creation:generate-bdd (if BDD updates needed)

  3. Estimate total work and break into phases
  4. Identify dependencies and prerequisites
  5. Create implementation plan

  OUTPUT FORMAT:
  IMPLEMENTATION_ORDER: [list of phases]
  COMMANDS_TO_RUN: [specific slash commands]
  CUSTOM_WORK: [work not covered by existing commands]
  ESTIMATED_DURATION: [time estimate]
  PREREQUISITES_MET: [yes|no]
  BLOCKERS: [list if any]
  ```

- **STEP 1C**: Parse implementation plan (from roadmap or agent analysis)
  - Set {commands_to_run} from roadmap or agent output
  - Set {estimated_duration}

- **STEP 1D**: Validate prerequisites are met
  - Check all blocking tasks are completed
  - Verify all required components/features exist

### Update Task Status

- **STEP 2A**: Use Edit tool to update task status to "in-progress"
- **STEP 2B**: Add activity log entry:
  - "Implementation started: {current_date}"
- **STEP 2C**: Update backlog with status change

### Execute Implementation Plan

- **STEP 3A**: Display implementation progress header:
  ```
  IMPLEMENTING TASK: {task_id}
  Total Phases: {phase_count}
  Estimated Duration: {estimated_duration}
  ```

- **STEP 3B**: Execute commands in order from implementation plan:
  <foreach {command} in {commands_to_run}>
  - Display progress: "Phase {current_phase}/{total_phases}: {command.name}"
  - Display: "Executing: {command.name}"
  - <case {command.type}>
    <is domain_implementation>
    - Use SlashCommand: "/implementation:implement-domain {area_name}"
    - Capture results
    </is>
    <is usecase_implementation>
    - Use SlashCommand: "/implementation:implement-use-case {use_case_name}"
    - Capture results
    </is>
    <is structure_modification>
    - Use Task tool with solution-engineer agent to implement structure changes:
      - Read affected component code
      - Apply changes according to task specification
      - Follow coding standards
      - Write updated code
    </is>
    <is bdd_update>
    - Use SlashCommand: "/creation:generate-bdd {scope}"
    - Update BDD files based on changes
    </is>
    </case>
  - Track progress: {completed_commands}/{total_commands}
  - Update task progress percentage
  </foreach>

### Validation & Testing

- **STEP 4A**: Run tests based on task testing requirements:
  <if (task requires unit tests)>
  - Use SlashCommand: "/quality:test-unit {scope}"
  - Capture test results
  </if>

- **STEP 4B**: Validate acceptance criteria:
  <foreach {criterion} in {acceptance_criteria}>
  - Check if criterion is met
  - Mark as ✓ or ✗
  - Document verification results
  </foreach>

- **STEP 4C**: Run code review:
  - Use SlashCommand: "/quality:review-code {scope}"
  - Address any critical issues found

### Update Final Task Status

- **STEP 5A**: Determine final status:
  <if (all acceptance criteria met AND tests passing)>
  - Set {final_status} = "completed"
  <else>
  - Set {final_status} = "in-progress"
  - Document what's remaining
  </if>

- **STEP 5B**: Use Edit tool to update task specification:
  - Update status to {final_status}
  - Update progress to 100% (if completed) or actual percentage
  - Add activity log entry with implementation results
  - Update completion date (if completed)

- **STEP 5C**: Update backlog:
  - Move task to completed section (if done)
  - Update sprint/milestone progress

### Update Cross-Referenced Specifications

- **STEP 6A**: For each affected feature:
  - Add implementation notes
  - Update feature status if all use cases completed

- **STEP 6B**: For each affected use case:
  - Update implementation status
  - Link to task for traceability

- **STEP 6C**: Update structure components:
  - Document changes made
  - Update feature mapping if changed

### Reporting

- **STEP 7A**: Display implementation summary:
  ```
  TASK IMPLEMENTATION: {task_id}

  Title: {task_title}
  Type: {task_type}
  Final Status: {final_status}

  Implementation Results:
  - Domain Changes: {domain_changes_count} areas
  - Use Cases Implemented: {usecase_count}
  - Components Modified: {component_count}
  - BDD Files Updated: {bdd_count}

  Testing:
  - Unit Tests: {unit_test_status}
  - Integration Tests: {integration_test_status}
  - BDD Scenarios: {bdd_status}

  Acceptance Criteria:
  - Met: {criteria_met}/{total_criteria}
  - Remaining: {criteria_remaining}

  <if ({final_status} equals "completed")>
  ✅ TASK COMPLETED SUCCESSFULLY

  Code Changes:
  {list_of_modified_files}

  Next Steps:
  - Review implementation
  - Create pull request (if needed)
  - Move to next task
  </if>

  <if ({final_status} equals "in-progress")>
  ⚠️  TASK PARTIALLY COMPLETED

  Remaining Work:
  <foreach {remaining} in {remaining_work}>
  - {remaining.description}
  </foreach>

  Next Steps:
  - Address remaining items
  - Re-run /implement-task {task_id}
  </if>
  ```

**IMPORTANT NOTES**:
- Orchestrates task implementation across all layers
- Analyzes cross-references to determine work scope
- Delegates to specialized implementation commands
- Updates task status and progress automatically
- Validates acceptance criteria
- Runs tests based on task requirements
- Updates all cross-referenced specifications
- Provides comprehensive implementation tracking
- Supports partial completion and resume
