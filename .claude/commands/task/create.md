---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, Write, Edit, Glob, Bash
description: Create work item task with cross-references to features, use cases, and structure
argument-hint: {task_type:string} {task_title:string} {task_description:string:optional} {jira_ticket_id:string:optional} {jira_ticket_url:string:optional}
---

# Create Task Command

Create comprehensive work item with full cross-referencing to features, use cases, structure components, and domain models.

## Actions

1. **Validate inputs and generate task ID**:
   - Verify {task_type} is valid: feature, bug, refactor, tech-debt, infrastructure, documentation
   - Verify {task_title} is not empty
   - **Validate and process Jira fields (if provided)**:
     - If {jira_ticket_id} provided: must match regex `^[A-Z]+-[0-9]+$` (e.g., MAM-123, JIRA-456)
     - If {jira_ticket_id} provided but {jira_ticket_url} NOT provided:
       - Auto-generate URL: `https://rossvideo.atlassian.net/browse/{jira_ticket_id}`
       - Store generated URL in {jira_ticket_url}
     - If BOTH {jira_ticket_id} and {jira_ticket_url} provided:
       - Validate URL is valid (starts with http:// or https://)
       - Extract ticket ID from URL (parse from `/browse/{ID}` pattern)
       - If extracted ID ≠ {jira_ticket_id}: **ERROR** "Jira ticket ID mismatch: URL contains '{extracted_id}' but argument is '{jira_ticket_id}'"
     - If only {jira_ticket_url} provided (no ID): **ERROR** "Jira ticket ID required when URL provided"
   - Use Glob to find existing tasks: "Documents/Tasks/*/TASK.md"
   - Generate new ID based on type and sequential number:
     - feature → TASK-{next_number}
     - bug → BUG-{next_number}
     - refactor → REFACTOR-{next_number}
     - tech-debt → DEBT-{next_number}
     - infrastructure → INFRA-{next_number}
     - documentation → DOCS-{next_number}
   - Create directory: "Documents/Tasks/{task_id}/"

2. **Load project context**:
   - Read SOLUTION.md (if exists) for: solution_name, features, areas, architecture
   - Read STRUCTURE.md (if exists) for: components, layers, dependencies
   - Use Glob to discover available features and use cases for multiselect prompts

3. **Initialize task memory**:
   - Create entity: name="{task_id}", entityType="task"
   - observations: ["title: {task_title}", "type: {task_type}", "status: planned", "description: {task_description}"]
   - If {jira_ticket_id} provided: add observations ["jira_ticket_id: {jira_ticket_id}", "jira_ticket_url: {jira_ticket_url}", "jira_last_sync: {current_date}"]
   - Add variable tracking list

4. **Run interactive task definition** (iterative until complete):
   - Use Task tool with solution-engineer agent:
     ```markdown
     ROLE: Task Specification Analyst

     Define work item "{task_id}: {task_title}" with comprehensive cross-references.

     TYPE: {task_type}
     AVAILABLE FEATURES: {discovered_features}
     AVAILABLE COMPONENTS: {discovered_components}
     AVAILABLE USE CASES: {discovered_use_cases}

     QUESTION SEQUENCE:
     1. SCOPE: Priority, effort estimate, objective, success criteria
     2. FEATURE CROSS-REFS: Which features affected? Which use cases?
     3. TECHNICAL CROSS-REFS: Which components? Which domain areas? Which BDD files?
     4. IMPLEMENTATION PLAN: Approach, steps, considerations, risks
     5. DEPENDENCIES: Blocking tasks, blocked tasks, external dependencies
     6. ACCEPTANCE CRITERIA: Given/When/Then format (3+ criteria)

     REQUIRED VARIABLES:
     - task_priority, effort_estimate, primary_objective, success_criteria
     - affected_features[], affected_use_cases[], affected_components[]
     - affected_domain_areas[], affected_bdd_files[]
     - implementation_strategy, implementation_steps[]
     - acceptance_criteria[], risks[]

     OUTPUT:
     STATUS: [questions_needed|complete]
     QUESTIONS: [5 max]
     MISSING_VARIABLES: [list]
     ```
   - Continue loop until STATUS=complete

5. **Generate task specification**:
   - Load TASK_TEMPLATE.md
   - Apply DSL variable substitution (populate cross-reference sections, foreach loops)
   - Write to: "Documents/Tasks/{task_id}/TASK.md"
   - Create placeholder: "Documents/Tasks/{task_id}/Notes.md"

6. **Update backlog**:
   - If BACKLOG.md not exists: create from BACKLOG_TEMPLATE.md
   - Else: read existing backlog
   - Add task to appropriate section based on priority
   - Update statistics (task counts by type and priority)
   - Write updated BACKLOG.md
   - Validate: re-read and confirm task appears correctly

7. **Create cross-reference relationships and update specifications**:
   - Create memory relations for task-feature, task-component, task-usecase (relationType: "affects", "modifies", "implements")
   - For each affected feature: update feature spec "Related Tasks" section with task entry
   - For each affected use case: update use case spec "Related Tasks" section
   - Validate bidirectional traceability

**Reporting**:
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
- Review task: Documents/Tasks/{task_id}/TASK.md
- Validate: /validation:validate-task {task_id}
- When ready: /implementation:implement-task {task_id}
```

**NOTES**:
- Supports all task types with auto-generated IDs
- Creates bidirectional relationships in memory
- Updates backlog automatically
- Enables task-driven development alongside feature-driven
