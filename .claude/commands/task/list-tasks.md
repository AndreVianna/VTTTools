---
allowed-tools: [mcp__memory__search_nodes, mcp__memory__open_nodes, mcp__memory__read_graph, Task, Read, Glob, Grep, Bash]
description: List and filter tasks from backlog
argument-hint: {filter:string:optional}
---

# List Tasks Command

Display tasks from backlog with filtering by status, type, priority, sprint, or feature. Provides quick overview of work items and their current state.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Process

### Parse Filter

- **STEP 0A**: Parse {filter} parameter:
  <case {filter}>
  <is empty or "all">
    - Set {filter_type} = "all"
    - Display all tasks
  </is>
  <is "status:planned" or "status:in-progress" or "status:completed" or "status:blocked">
    - Set {filter_type} = "status"
    - Set {filter_value} = extracted status value
  </is>
  <is "type:feature" or "type:bug" or "type:refactor" etc>
    - Set {filter_type} = "type"
    - Set {filter_value} = extracted type value
  </is>
  <is "priority:critical" or "priority:high" etc>
    - Set {filter_type} = "priority"
    - Set {filter_value} = extracted priority value
  </is>
  <is "sprint:{name}">
    - Set {filter_type} = "sprint"
    - Set {filter_value} = sprint name
  </is>
  <is "feature:{name}">
    - Set {filter_type} = "feature"
    - Set {filter_value} = feature name
  </is>
  <otherwise>
    - Display error: "Invalid filter. Use: status:X, type:X, priority:X, sprint:X, feature:X, or 'all'"
    - Exit
  </otherwise>
  </case>

### Discover Tasks

- **STEP 1A**: Use Glob to find all tasks: "Documents/Tasks/*/TASK.md"
- **STEP 1B**: For each task file:
  - Read task specification
  - Extract: task_id, title, type, status, priority, effort, affected_features, affected_components
  - Store in task list

### Apply Filter

- **STEP 2A**: Filter task list based on {filter_type}:
  <case {filter_type}>
  <is "all">
    - Include all tasks
  </is>
  <is "status">
    - Include only tasks where status equals {filter_value}
  </is>
  <is "type">
    - Include only tasks where type equals {filter_value}
  </is>
  <is "priority">
    - Include only tasks where priority equals {filter_value}
  </is>
  <is "sprint">
    - Read BACKLOG.md to find tasks in sprint
    - Include only tasks assigned to {filter_value} sprint
  </is>
  <is "feature">
    - Include only tasks where affected_features contains {filter_value}
  </is>
  </case>

- **STEP 2B**: Sort filtered tasks:
  - Primary sort: Priority (Critical → High → Medium → Low)
  - Secondary sort: Status (blocked → in-progress → planned → completed)

### Display Results

- **STEP 3A**: Calculate summary statistics for filtered set
- **STEP 3B**: Display task list:
  ```
  TASK LIST <if ({filter} not empty)> (Filter: {filter})</if>

  Summary:
  - Total Tasks: {filtered_count} <if ({filter} not empty)>of {total_count}</if>
  - In Progress: {in_progress_count}
  - Planned: {planned_count}
  - Completed: {completed_count}
  - Blocked: {blocked_count}

  <foreach {task} in {filtered_tasks}>
  [{status_icon}] {task.id}: {task.title}
      Type: {task.type}  |  Priority: {task.priority}  |  Effort: {task.effort}
      Status: {task.status}  |  Progress: {task.progress}%
      <if ({task.affected_features} not empty)>
      Features: {task.affected_features}
      </if>
      <if ({task.affected_components} not empty)>
      Components: {task.affected_components}
      </if>
      <if ({task.blocking_tasks} not empty)>
      ⚠️  Blocked by: {task.blocking_tasks}
      </if>
      Path: Documents/Tasks/{task.id}/TASK.md
  </foreach>

  Status Icons:
  ✅ Completed  |  🔨 In Progress  |  📋 Planned  |  🚫 Blocked
  ```

### Quick Actions

- **STEP 4A**: Suggest relevant next actions:
  <if (filter equals "status:planned" AND have high priority tasks)>
  - Suggest: "Start high priority task: /implement-task {highest_priority_task_id}"
  </if>
  <if (filter equals "status:blocked")>
  - Suggest: "Review blockers and resolve dependencies"
  </if>
  <if (filter equals "status:in-progress")>
  - Suggest: "Continue with: /implement-task {first_in_progress_task}"
  </if>

## Quick Reference
- VTTTOOLS_STACK.md: VttTools technology stack overview
- IMPLEMENTATION_GUIDE.md: VttTools Phase 2 implementation workflow

**IMPORTANT NOTES**:
- Lists tasks with flexible filtering
- Supports filtering by status, type, priority, sprint, or feature
- Shows cross-references (features, components)
- Indicates blocked tasks
- Sorted by priority and status
- Provides quick action suggestions
- Use without filter to see all tasks
