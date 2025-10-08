---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Create work item task with cross-references to features, use cases, and structure
argument-hint: {task_type:string} {task_title:string} {task_description:string:optional}
---

# Create Task Command

Create comprehensive work item specification with full cross-referencing to features, use cases, structure components, and domain models. Supports feature development, bugs, refactoring, technical debt, and infrastructure work.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Quick Reference
- **Stack Guide**: Documents/Guides/VTTTOOLS_STACK.md
- **Template**: .claude/templates/TASK_TEMPLATE.md
- **Backlog Template**: .claude/templates/BACKLOG_TEMPLATE.md

## Process

### Step 0: Validation & Setup

- **STEP 0A**: Validate {task_type} is valid:
  - Supported: feature, bug, refactor, tech-debt, infrastructure, documentation
  - Abort if invalid with list of valid types
- **STEP 0B**: Validate {task_title} is not empty
- **STEP 0C**: Use Bash tool: "mkdir -p Documents/Tasks" to ensure directory exists
- **STEP 0D**: Validate TASK_TEMPLATE.md exists using Read tool
- **STEP 0E**: Generate task ID:
  - Use Glob to find existing tasks: "Documents/Tasks/*/TASK.md"
  - Parse existing IDs
  - Generate new ID based on type:
    - feature → TASK-{next_number}
    - bug → BUG-{next_number}
    - refactor → REFACTOR-{next_number}
    - tech-debt → DEBT-{next_number}
    - infrastructure → INFRA-{next_number}
    - documentation → DOCS-{next_number}
  - Set {task_id}

### Step 1: Load Context

- **STEP 1A**: Load solution context:
  <if (Documents/SOLUTION.md exists)>
  - Read solution specification
  - Extract: solution_name, features, areas, architecture
  <else>
  - Log: "No solution spec - task will have limited context"
  </if>

- **STEP 1B**: Load structure context:
  <if (Documents/Structure/STRUCTURE.md exists)>
  - Read structure specification
  - Extract: components, layers, dependencies
  <else>
  - Log: "No structure spec - no component mapping available"
  </if>

- **STEP 1C**: Discover available features and use cases:
  - Use Glob: "Documents/Areas/*/Features/*.md" (features)
  - Use Glob: "Documents/Areas/*/Features/*/UseCases/*.md" (use cases)
  - Parse names for multiselect prompts

### Step 2: Initialize Task Memory

- **STEP 2A**: Use mcp__memory__create_entities to create task entity:
  - name: "{task_id}"
  - entityType: "task"
  - observations: ["title: {task_title}", "type: {task_type}", "status: planned", "created_date: {current_date}"]
- **STEP 2B**:
  <if ({task_description} is not empty)>
  - Use mcp__memory__add_observations: ["description: {task_description}"]
  <else>
  - Use mcp__memory__add_observations: ["description: {task_title}"]
  </if>
- **STEP 2C**: Add variable tracking:
  - ["variables_needed: task_id,task_title,task_type,task_status,task_priority,task_description,effort_estimate,affected_features,affected_use_cases,affected_components,affected_domain_areas,affected_bdd_files,primary_objective,success_criteria,implementation_strategy,implementation_steps,blocking_tasks,blocked_tasks,external_dependencies,acceptance_criteria,technical_considerations,risks,design_decisions,sprint_name,story_points"]

### Step 3: Interactive Task Definition

- **STEP 3A**: Use mcp__memory__open_nodes to get current task state
- **STEP 3B**:
  <while ({gathering_complete} equals false)>
  - Use Task tool with solution-engineer agent:
    ```markdown
    ROLE: Task Specification Analyst

    TASK: Define work item "{task_id}: {task_title}" with comprehensive cross-references

    TYPE: {task_type}
    CONTEXT: {task_description}

    AVAILABLE FEATURES: {discovered_features}
    AVAILABLE COMPONENTS: {discovered_components}
    AVAILABLE USE CASES: {discovered_use_cases}

    MANDATORY QUESTION SEQUENCE:

    1. TASK SCOPE (FIRST):
       - Priority (Critical/High/Medium/Low)
       - Effort estimate (story points or hours)
       - Primary objective
       - Success criteria (measurable)

    2. FEATURE CROSS-REFERENCES (SECOND - CRITICAL):
       - Which features does this task affect? (multiselect)
       - What is the impact on each feature?
       - Which use cases are affected? (multiselect)

    3. TECHNICAL CROSS-REFERENCES (THIRD - CRITICAL):
       - Which structure components need changes? (multiselect)
       - What type of changes for each component?
       - Which domain areas/models are affected?
       - Which BDD files need updates?

    4. IMPLEMENTATION PLAN (FOURTH):
       - Technical approach
       - Implementation steps with estimates
       - Key considerations
       - Risks

    5. DEPENDENCIES (FIFTH):
       - Blocking tasks (must complete first)
       - Tasks that will be blocked by this
       - External dependencies

    6. ACCEPTANCE CRITERIA (LAST):
       - Given/When/Then format (3+ criteria)
       - Verification methods

    REQUIRED VARIABLES:
    - task_priority, effort_estimate, primary_objective, success_criteria
    - affected_features[], affected_use_cases[], affected_components[]
    - affected_domain_areas[], affected_bdd_files[]
    - implementation_strategy, implementation_steps[]
    - acceptance_criteria[], risks[]

    OUTPUT FORMAT:
    STATUS: [questions_needed|complete]
    QUESTIONS: [5 max]
    MISSING_VARIABLES: [list]
    ```
  - Handle questions/answers loop
  - Store in memory
  </while>

### Step 4: Generate Task Specification

- **STEP 4A**: Use mcp__memory__open_nodes to retrieve all task observations
- **STEP 4B**: Load template: ".claude/templates/TASK_TEMPLATE.md"
- **STEP 4C**: Apply DSL template variable substitution:
  - Populate cross-reference sections
  - Process foreach loops for affected items
  - Include implementation plan
- **STEP 4D**: Write to: "Documents/Tasks/{task_id}/TASK.md"
- **STEP 4E**: Create Notes.md placeholder: "Documents/Tasks/{task_id}/Notes.md"

### Step 5: Update Backlog

- **STEP 5A**: Read or create BACKLOG.md:
  <if (Documents/Tasks/BACKLOG.md not exists)>
  - Create from BACKLOG_TEMPLATE.md with initial task
  <else>
  - Read existing backlog
  - Add task to appropriate section based on priority
  </if>

- **STEP 5B**: Update backlog statistics:
  - Increment task counts by type and priority
  - Update unscheduled backlog section

- **STEP 5C**: Write updated BACKLOG.md

- **STEP 5D**: Validation checkpoint - verify backlog update succeeded:
  - Re-read BACKLOG.md
  - Confirm task appears in appropriate section (by type/priority)
  - Confirm statistics are updated correctly
  - If validation fails: Log warning (task still created, backlog manually fixable)

### Step 6: Create Cross-Reference Relationships

- **STEP 6A**: Create task-feature relationships:
  <foreach {feature} in {affected_features}>
  - Use mcp__memory__create_relations:
    - from: "{task_id}"
    - to: "{feature.name}"
    - relationType: "affects"
  </foreach>

- **STEP 6B**: Create task-component relationships:
  <foreach {component} in {affected_components}>
  - Use mcp__memory__create_relations:
    - from: "{task_id}"
    - to: "{component.name}"
    - relationType: "modifies"
  </foreach>

- **STEP 6C**: Create task-usecase relationships:
  <foreach {usecase} in {affected_use_cases}>
  - Use mcp__memory__create_relations:
    - from: "{task_id}"
    - to: "{usecase.name}"
    - relationType: "implements"
  </foreach>

### Step 7: Update Referenced Specifications

- **STEP 7A**: For each affected feature:
  <foreach {feature} in {affected_features}>
  - Read feature specification: "Documents/Areas/{feature.area}/Features/{feature.name}.md"
  - Locate "Related Tasks" section
  - Add task entry:
    ```
    ### {task_id}: {task_title}
    - **Type**: {task_type}
    - **Status**: {task_status}
    - **Priority**: {task_priority}
    - **Effort**: {effort_estimate}
    - **Description**: {task_description}
    - **Specification**: Documents/Tasks/{task_id}/TASK.md
    ```
  - Use Edit tool to insert into feature specification
  - Update task counts in "Task Summary"
  </foreach>

- **STEP 7B**: For each affected use case:
  <foreach {usecase} in {affected_use_cases}>
  - Read use case specification
  - Locate "Related Tasks" section
  - Add task entry (same format as above)
  - Use Edit tool to insert
  </foreach>

- **STEP 7C**: Validate cross-reference updates:
  - Confirm task appears in all referenced feature/use case specs
  - Bidirectional traceability: Task→Feature and Feature→Task ✓

### Step 8: Reporting

- **STEP 8A**: Display task creation summary:
  ```
  ✓ TASK CREATED: {task_id}

  Title: {task_title}
  Type: {task_type}
  Priority: {task_priority}
  Effort: {effort_estimate}

  Cross-References:
  - Features: {feature_count}
  - Use Cases: {use_case_count}
  - Components: {component_count}
  - Domain Areas: {domain_area_count}

  Created:
  - Documents/Tasks/{task_id}/TASK.md
  - Documents/Tasks/{task_id}/Notes.md
  - Updated: Documents/Tasks/BACKLOG.md

  Next Steps:
  - Review task specification
  - Run /validate-task {task_id}
  - Assign to sprint (if ready)
  - When ready to implement: /implement-task {task_id}
  ```

**IMPORTANT NOTES**:
- Creates work items that cross-reference business, technical, and domain layers
- Supports all task types (feature, bug, refactor, tech-debt, infrastructure, documentation)
- Auto-generates task IDs with type prefixes
- Creates bidirectional relationships in memory
- Updates backlog automatically
- Enables task-driven development alongside feature-driven development
