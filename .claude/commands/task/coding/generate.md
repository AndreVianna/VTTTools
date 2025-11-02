---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, Write, Edit, Glob, SlashCommand, Bash
description: Implement task by orchestrating work across features, components, domain, and use cases
argument-hint: {task_id:string}
---

# Implement Task Command

Orchestrate task implementation based on cross-references. Analyze task scope and delegate to appropriate implementation commands.

## Actions

1. **Validate and parse task**:
   - Verify {task_id} is not empty
   - Read task spec: "Documents/Tasks/{task_id}/TASK.md"
   - Parse metadata: task_type, task_status, priority, effort
   - Parse cross-references: affected_features, affected_components, affected_use_cases, affected_domain_areas
   - Validate task is ready:
     - If status="completed": warn and prompt to continue
     - If status="blocked": error with blocker list and exit

2. **Check for implementation roadmap** (optional):
   - Look for: "Documents/Tasks/{task_id}/ROADMAP.md"
   - If found:
     - Read and extract: implementation_phases, orchestration_sequence, quality_gates
     - Validate roadmap (score ≥ 80)
     - Set orchestration_plan from roadmap
   - If not found: analyze task scope with agent (next step)

3. **Analyze implementation scope** (if no roadmap):
   - Use Task tool with solution-engineer agent:
     ```markdown
     ROLE: Task Implementation Orchestrator

     Analyze task scope and plan orchestrated implementation for MAM Modules.

     TASK: Documents/Tasks/{task_id}/TASK.md
     CROSS-REFERENCES:
     - Features: {affected_features}
     - Components: {affected_components}
     - Use Cases: {affected_use_cases}
     - Domain Areas: {affected_domain_areas}

     ANALYSIS:
     1. Determine implementation order (domain first, then use cases, then structure, then BDD)
     2. Identify slash commands to invoke:
        - /implementation:implement-domain {area} (if domain affected)
        - /implementation:implement-use-case {use_case} (if use cases affected)
        - Custom for structure changes
        - /creation:generate-bdd (if BDD updates needed)
     3. Estimate duration and break into phases
     4. Check prerequisites and blockers

     OUTPUT:
     IMPLEMENTATION_ORDER: [phases]
     COMMANDS_TO_RUN: [specific slash commands]
     CUSTOM_WORK: [work not covered by commands]
     ESTIMATED_DURATION: [time]
     PREREQUISITES_MET: [yes|no]
     BLOCKERS: [list if any]
     ```
   - Parse implementation plan: commands_to_run, estimated_duration
   - Validate prerequisites met

4. **Update task status to in-progress**:
   - Edit task spec: status="in-progress"
   - Add activity log entry: "Implementation started: {current_date}"
   - Update backlog with status change

5. **Execute implementation plan**:
   - Display progress header with total phases and estimated duration
   - For each command in orchestration plan:
     - Display: "Phase {current}/{total}: {command.name}"
     - Execute based on command type:
       - domain_implementation → SlashCommand: "/implementation:implement-domain {area_name}"
       - usecase_implementation → SlashCommand: "/implementation:implement-use-case {use_case_name}"
       - structure_modification → Use Task tool with solution-engineer agent to modify code
       - bdd_update → SlashCommand: "/creation:generate-bdd {scope}"
     - Track progress: {completed_commands}/{total_commands}

6. **Validation and testing**:
   - If task requires unit tests: SlashCommand: "/quality:test-unit {scope}"
   - Validate acceptance criteria: check each criterion, mark as ✓/✗
   - Run code review: SlashCommand: "/quality:review-code {scope}"

7. **Update task status and cross-references**:
   - Determine final status:
     - If all acceptance criteria met AND tests passing: status="completed"
     - Else: status="in-progress", document remaining work
   - Edit task spec: update status, progress (100% if done), activity log, completion date
   - Update backlog: move to completed section if done
   - For each affected feature: add implementation notes
   - For each affected use case: update implementation status
   - Update structure components: document changes

**Reporting**:
```
TASK IMPLEMENTATION: {task_id}

Title: {task_title}
Status: {final_status}

Results:
- Domain Changes: {count} areas
- Use Cases: {count}
- Components Modified: {count}
- BDD Files Updated: {count}

Testing:
- Unit Tests: {status}
- Acceptance Criteria: {met}/{total}

{if completed}
✅ TASK COMPLETED

Code Changes: {file_list}
Next: Review and create PR

{if in-progress}
⚠️ PARTIALLY COMPLETED

Remaining: {remaining_work_list}
Next: Address remaining items, re-run /implement-task {task_id}
```

**NOTES**:
- Orchestrates task implementation across all layers
- Analyzes cross-references to determine work scope
- Delegates to specialized implementation commands
- Updates task status and progress automatically
- Validates acceptance criteria
- Supports partial completion and resume
