---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Bash, TodoWrite]
description: Update task specification with natural language modification requests
argument-hint: {task_id:string} {update_details:string}
---

# Update Task Command

Updates existing task specification based on natural language modification requests. Supports updating status, cross-references, acceptance criteria, and all task properties while maintaining cross-reference integrity.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Phase 0: Validation & Setup

- **STEP 0A**: Validate {task_id} and {update_details} are not empty
- **STEP 0B**: Use Read tool to load: "Documents/Tasks/{task_id}/TASK.md"
  - Abort if not found
- **STEP 0C**: Use mcp__memory__search_nodes to find task entity (optional)

## Phase 1: Parse Update Request

- **STEP 1A**: Use Task tool with solution-engineer agent:
  ```markdown
  ROLE: Task Update Analyst

  TASK: Parse update request and determine modifications

  UPDATE REQUEST: "{update_details}"
  CURRENT TASK: Documents/Tasks/{task_id}/TASK.md

  UPDATE TYPES SUPPORTED:
  - UPDATE_STATUS: Change status (planned/in-progress/completed/blocked)
  - UPDATE_PRIORITY: Change priority level
  - ADD_FEATURE_REFERENCE: Add feature to affected_features
  - REMOVE_FEATURE_REFERENCE: Remove feature from affected_features
  - ADD_COMPONENT_REFERENCE: Add component to affected_components
  - REMOVE_COMPONENT_REFERENCE: Remove component
  - UPDATE_ACCEPTANCE_CRITERIA: Add/modify/remove AC
  - ADD_BLOCKER: Add blocking task
  - REMOVE_BLOCKER: Remove blocker (unblock)
  - UPDATE_NOTES: Add implementation notes
  - UPDATE_EFFORT: Change effort estimate

  ANALYSIS REQUIRED:
  1. Determine update type
  2. Identify affected sections
  3. Specify exact changes
  4. Check cross-reference impacts

  OUTPUT FORMAT:
  UPDATE_TYPE: [type]
  AFFECTED_SECTIONS: [sections]
  SPECIFIC_CHANGES: [detailed modifications]
  CROSS_REFERENCE_UPDATES: [features/components that need updating]
  READY: [yes|needs_clarification]
  ```

- **STEP 1B**: Parse agent response

## Phase 2: Apply Update

- **STEP 2A**: Based on UPDATE_TYPE, apply changes using Edit tool:
  <case {UPDATE_TYPE}>
  <is UPDATE_STATUS>
    - Update status field
    - Update progress percentage if moving to completed
    - Add activity log entry
  </is>
  <is ADD_FEATURE_REFERENCE>
    - Add feature to affected_features list
    - Describe impact
    - Update feature specification (add task reference)
  </is>
  <is ADD_COMPONENT_REFERENCE>
    - Add component to affected_components list
    - Describe required changes
  </is>
  <is UPDATE_ACCEPTANCE_CRITERIA>
    - Add/modify/remove AC in acceptance criteria section
  </is>
  <is ADD_BLOCKER>
    - Add to blocking_tasks list
    - Update status to "blocked" if not already
  </is>
  <is REMOVE_BLOCKER>
    - Remove from blocking_tasks
    - Change status from "blocked" if no more blockers
  </is>
  </case>

- **STEP 2B**: Update task version (increment minor)
- **STEP 2C**: Add change log entry

## Phase 3: Update Cross-References

- **STEP 3A**:
  <if (feature references changed)>
  - For each added feature:
    - Read feature specification
    - Add task reference in feature notes/tasks section (if exists)
  - For each removed feature:
    - Remove task reference from feature specification
  </if>

- **STEP 3B**:
  <if (component references changed)>
  - Update structure documentation if needed
  </if>

- **STEP 3C**: Update backlog:
  - Reflect status changes
  - Update sprint allocation if changed
  - Update priority sorting if changed

## Phase 4: Update Memory

- **STEP 4A**:
  <if (task entity exists in memory)>
  - Use mcp__memory__add_observations to update with changes
  </if>

- **STEP 4B**: Update relationships if cross-references changed:
  <if (features added or removed)>
  - Delete old task-feature relationships
  - Create new task-feature relationships
  </if>

## Phase 5: Reporting

- **STEP 5A**: Display update summary:
  ```
  ✓ TASK UPDATED: {task_id}

  Changes Applied:
  - {change_summary}

  <if (status changed)>
  Status: {old_status} → {new_status}
  </if>

  <if (cross_references changed)>
  Cross-References Updated:
  - Features: {feature_changes}
  - Components: {component_changes}
  </if>

  Next Steps:
  - Review Documents/Tasks/{task_id}/TASK.md
  - Run /validate-task {task_id} if major changes
  <if ({new_status} equals "completed")>
  - Task complete! Check /task:list-tasks for next item
  </if>
  ```

**IMPORTANT NOTES**:
- Updates task specifications via natural language
- Automatically maintains cross-reference integrity
- Updates backlog and related specifications
- Supports all task properties and relationships
- Handles status transitions (planned→in-progress→completed)
- Updates sprint/milestone tracking
