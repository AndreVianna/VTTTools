---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Glob, Grep, Bash]
description: Display hierarchical solution structure with specification, implementation, and testing status
argument-hint: {detail_level:string:optional(summary)} {mode:string:optional(full)}
---

# Solution Status Command

Displays hierarchical visualization of complete solution status showing specifications (Solution → Domain Models → Features → Use Cases → BDD), implementation progress (Phase 2), and testing results (Phase 3) across all solution phases.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Process

### Setup & Scope

- **STEP 0A**: Parse {mode} parameter for performance:
  <case {mode}>
  <is "fast">
    - Set {read_all_status_files} = false (skip STATUS.md files)
    - Set {limit_task_display} = 10
    - Display: "Fast mode: Overview only"
  </is>
  <is "full">
    - Set {read_all_status_files} = true
    - Set {limit_task_display} = unlimited
  </is>
  <otherwise>
    - Default to "full" mode
  </otherwise>
  </case>

- **STEP 0B**: Parse {detail_level} parameter:
  <case {detail_level}>
  <is "summary" or empty>
    - Show: Solution → Features (collapsed use cases)
  <is "detailed">
    - Show: Solution → Features → Use Cases → BDD files
  <is "full">
    - Show: Solution → Features → Use Cases → BDD files + implementation & test status
  <otherwise>
    - Display error, show valid options: summary, detailed, full
  </case>

### Discover Solution Structure

- **STEP 1A**: Use Read tool to check for "Documents/SOLUTION.md"
  <if (not found)>
  - Display: "No solution specification found. Run /create-solution or /extract-solution first."
  - Exit
  </if>

- **STEP 1B**: Extract solution name from specification header

- **STEP 1C**: Use Glob to discover all artifacts and STATUS files:
  - Solution Status: "Documents/SOLUTION_STATUS.md"
  - Domain Models: "Documents/Areas/*/DOMAIN_MODEL.md"
  - Domain Status: "Documents/Areas/*/DOMAIN_STATUS.md"
  - Features: "Documents/Areas/*/Features/*.md"
  - Feature Status: "Documents/Areas/*/Features/*_STATUS.md"
  - Use Cases: "Documents/Areas/*/Features/*/UseCases/*.md"
  - Use Case Status: "Documents/Areas/*/Features/*/UseCases/*_STATUS.md"
  - BDD Files: "Documents/Areas/**/*.feature"
  - Structure: "Documents/Structure/STRUCTURE.md" (NEW)
  - Tasks: "Documents/Tasks/*/TASK.md" (NEW)
  - Backlog: "Documents/Tasks/BACKLOG.md" (NEW)

- **STEP 1D**: Parse file paths to build hierarchy:
  - Display: "Analyzing solution structure..."
  - Extract area names from paths
  - Display progress: "Found {area_count} areas, {feature_count} features, {usecase_count} use cases"
  - Group features by area
  - Group use cases by feature
  - Map STATUS files to their specs
  - Display: "Loading structure and task data..."
  - Parse structure components and layer assignments (NEW)
  - Parse task IDs, types, statuses, and cross-references (NEW)
  - Display: "Analysis complete: {area_count} areas, {feature_count} features, {component_count} components, {task_count} tasks"

### Read STATUS Files for Implementation Data

- **STEP 2A**: Read SOLUTION_STATUS.md (if exists):
  - Extract: phase progress, overall grades, metrics
  - Parse: implementation percent, test coverage, quality scores
  - If not exists: Display warning and calculate from individual files

- **STEP 2B**: For each area, read DOMAIN_STATUS.md (if exists):
  - Extract: domain implementation status, entities/VOs implemented
  - Extract: test status, quality scores, grade
  - Fallback to memory if STATUS file missing

- **STEP 2C**: For each feature, read FEATURE_STATUS.md (if exists):
  - Extract: use case matrix with implementation/test status
  - Extract: feature-level grades and metrics
  - Use for summary view aggregation

- **STEP 2D**: For each use case, read USECASE_STATUS.md (if exists):
  - Extract: layer-by-layer status (Application ✅, Infrastructure ✅, UI ✅/❌)
  - Extract: test results (passing/total, coverage, grade)
  - Extract: quality scores, spec compliance
  - Extract: UI type and location
  - Extract: recommendation (KEEP, ENHANCE, REFACTOR, COMPLETE, IMPLEMENT)
  - Fallback to use case spec for UI type if STATUS missing

### Read Structure Data

- **STEP 2E1**: Read STRUCTURE.md (if exists):
  <if (Documents/Structure/STRUCTURE.md exists)>
  - Extract: platform_type, architecture_style, component_count
  - Parse components by layer (domain, application, infrastructure, ui)
  - Extract feature-component mappings
  - Store for display
  <else>
  - Set {has_structure} = false
  - Log: "No structure documentation found"
  </if>

### Read Tasks Data

- **STEP 2F1**: Read BACKLOG.md (if exists):
  <if (Documents/Tasks/BACKLOG.md exists)>
  - Extract: total_tasks, task_counts_by_type, task_counts_by_status
  - Extract: current_sprint, sprint_tasks
  - Store for display
  <else>
  - Set {has_tasks} = false
  - Log: "No tasks/backlog found"
  </if>

- **STEP 2F2**: Read individual task files:
  <if (task files exist)>
  - Parse each task: id, title, type, status, priority, affected_features, affected_components
  - Group by status and sprint
  </if>

### Display Hierarchical Structure

- **STEP 3A**: Format and display tree structure:

### Summary View (detail_level = summary):
```
SOLUTION STRUCTURE

📦 {Solution Name} v{version}
│
├─ 📂 {Area 1} ({feature_count} features)
│   ├─ 📚 Domain Model: {status} ({entity_count} entities, {vo_count} value objects)
│   ├─ 📄 {Feature 1} ({use_case_count} use cases)
│   ├─ 📄 {Feature 2} ({use_case_count} use cases)
│   └─ 📄 {Feature 3} ({use_case_count} use cases)
│
├─ 📂 {Area 2} ({feature_count} features)
│   ├─ 📄 {Feature 4} ({use_case_count} use cases)
│   └─ 📄 {Feature 5} ({use_case_count} use cases)
│
└─ 📂 {Area 3} ({feature_count} features)
    └─ 📄 {Feature 6} ({use_case_count} use cases)

Summary:
- Total Areas: {count}
- Total Features: {count}
- Total Use Cases: {count}
- Total BDD Files: {count}
```

### Detailed View (detail_level = detailed):
```
SOLUTION STRUCTURE (Detailed)

📦 {Solution Name} v{version}
│
├─ 📂 {Area 1}
│   │
│   ├─ 📄 {Feature 1}
│   │   ├─ 📋 {Use Case 1.1} ({ui_icon} {ui_type})
│   │   ├─ 📋 {Use Case 1.2} ({ui_icon} {ui_type})
│   │   └─ 📋 {Use Case 1.3} ({ui_icon} {ui_type})
│   │
│   └─ 📄 {Feature 2}
│       ├─ 📋 {Use Case 2.1}
│       └─ 📋 {Use Case 2.2}
│
├─ 📂 {Area 2}
│   └─ 📄 {Feature 3}
│       ├─ 📋 {Use Case 3.1}
│       ├─ 📋 {Use Case 3.2}
│       ├─ 📋 {Use Case 3.3}
│       └─ 📋 {Use Case 3.4}
│
└─ 📂 {Area 3}
    └─ 📄 {Feature 4}
        └─ 📋 {Use Case 4.1}

BDD Coverage:
- Feature-level BDD: {count} files
- Use Case-level BDD: {count} files
- Total Scenarios: {count}
```

### Full View (detail_level = full):
```
SOLUTION STRUCTURE (Full)

📦 {Solution Name} v{version}
│
├─ 📂 {Area 1}
│   │
│   ├─ 📄 {Feature 1}
│   │   │
│   │   ├─ 📋 {Use Case 1.1} ({ui_icon} {ui_type}: {ui_location})
│   │   │   ├─ 🧪 BDD: {Use Case 1.1}.feature ({scenario_count} scenarios)
│   │   │   ├─ ⚙️  Implementation: [PLACEHOLDER - Phase 2]
│   │   │   └─ ✅ Tests: [PLACEHOLDER - Phase 2]
│   │   │
│   │   ├─ 📋 {Use Case 1.2}
│   │   │   ├─ 🧪 BDD: {Use Case 1.2}.feature ({scenario_count} scenarios)
│   │   │   ├─ ⚙️  Implementation: [PLACEHOLDER - Phase 2]
│   │   │   └─ ✅ Tests: [PLACEHOLDER - Phase 2]
│   │   │
│   │   └─ 🧪 Feature BDD: {Feature 1}.feature ({scenario_count} scenarios)
│   │
│   └─ 📄 {Feature 2}
│       └─ 📋 {Use Case 2.1}
│           ├─ 🧪 BDD: {Use Case 2.1}.feature
│           ├─ ⚙️  Implementation: [PLACEHOLDER - Phase 2]
│           └─ ✅ Tests: [PLACEHOLDER - Phase 2]
│
└─ [Additional areas...]

Legend:
  📦 Solution Specification
  📂 Bounded Context (Area)
  📄 Feature Specification
  📋 Use Case Specification
  🧪 BDD Feature File
  ⚙️  Implementation Status [Phase 2]
  ✅ Test Status [Phase 2]

UI Type Icons:
  ⚙️  NO_UI - Internal/background operation
  🔌 API_ENDPOINT - REST/GraphQL endpoint
  🖥️ FULL_PAGE - Dedicated page/route
  🪟 MODAL - Dialog/overlay
  📝 FORM - Form within page
  🧩 WIDGET - Reusable component
  🔘 BUTTON - Action button
  📋 MENU_ITEM - Navigation item
  📊 PANEL - Collapsible section

Summary:
- Areas: {count}
- Features: {count}
- Use Cases: {count}
- BDD Files: {count} ({scenario_count} scenarios total)
- Implementation: [Phase 2 - Not yet available]
- Test Coverage: [Phase 2 - Not yet available]
```

### Display Technical View (Structure)

<if ({has_structure})>
- **STEP 3B1**: Display structure overview:
  ```
  TECHNICAL VIEW (Structure)

  Platform: {platform_type}
  Architecture: {architecture_style}

  📦 Components by Layer:
  ├─ 🏛️  Domain Layer: {domain_component_count} components
  │   <foreach {component} in {domain_components}>
  │   ├─ {component.name}
  │   │   └─ Implements: {component.features}
  │   </foreach>
  │
  ├─ ⚙️  Application Layer: {application_component_count} components
  │   <foreach {component} in {application_components}>
  │   ├─ {component.name}
  │   │   └─ Implements: {component.features}
  │   </foreach>
  │
  ├─ 🔌 Infrastructure Layer: {infrastructure_component_count} components
  │   <foreach {component} in {infrastructure_components}>
  │   ├─ {component.name}
  │   │   └─ Implements: {component.features}
  │   </foreach>
  │
  └─ 🖥️ UI Layer: {ui_component_count} components
      <foreach {component} in {ui_components}>
      ├─ {component.name}
      │   └─ Implements: {component.features}
      </foreach>

  Feature-Component Traceability:
  - Features Mapped: {mapped_features}/{total_features}
  - Components Mapped: {mapped_components}/{total_components}
  - Unmapped Features: {unmapped_feature_count}
  - Orphaned Components: {orphaned_component_count}
  ```
<else>
- **STEP 3B1**: Display message:
  ```
  TECHNICAL VIEW (Structure)

  No structure documentation found.

  Create structure documentation:
  - For new solutions: /creation:define-structure {platform}
  - For existing codebases: /extraction:extract-structure
  ```
</if>

### Display Work View (Tasks)

<if ({has_tasks})>
- **STEP 3C1**: Display task overview:
  ```
  WORK VIEW (Tasks & Backlog)

  Overall Progress:
  - Total Tasks: {total_tasks}
  - Completed: {completed_tasks} ({completed_percent}%)
  - In Progress: {in_progress_tasks}
  - Planned: {planned_tasks}
  - Blocked: {blocked_tasks}

  📊 By Type:
  - Features: {feature_tasks} ({feature_completed} completed)
  - Bugs: {bug_tasks} ({bug_completed} completed)
  - Refactoring: {refactor_tasks} ({refactor_completed} completed)
  - Tech Debt: {tech_debt_tasks} ({tech_debt_completed} completed)
  - Infrastructure: {infra_tasks} ({infra_completed} completed)

  🎯 By Priority:
  - Critical: {critical_tasks} ({critical_remaining} remaining)
  - High: {high_tasks} ({high_remaining} remaining)
  - Medium: {medium_tasks} ({medium_remaining} remaining)
  - Low: {low_tasks} ({low_remaining} remaining)

  <if ({current_sprint} not empty)>
  🏃 Current Sprint: {current_sprint}
  - Sprint Tasks: {sprint_tasks_total}
  - Completed: {sprint_completed}
  - In Progress: {sprint_in_progress}
  - Remaining: {sprint_remaining}
  - Velocity: {sprint_velocity} points
  </if>

  📋 Task List (Top 10 by Priority):
  <foreach {task} in {top_priority_tasks}>
  [{task.status_icon}] {task.id}: {task.title}
      Type: {task.type}  |  Priority: {task.priority}  |  Effort: {task.effort}
      <if ({task.affected_features} not empty)>Affects: {task.affected_features}</if>
  </foreach>

  <if ({blocked_tasks} > 0)>
  ⚠️  Blocked Items: {blocked_tasks}
  <foreach {task} in {blocked_task_list}>
  - {task.id}: {task.title} (blocked by {task.blocker})
  </foreach>
  </if>

  Commands:
  - View all tasks: /task:list-tasks
  - Filter tasks: /task:list-tasks status:in-progress
  - Task details: /task:show-impact {task_id}
  ```
<else>
- **STEP 3C1**: Display message:
  ```
  WORK VIEW (Tasks & Backlog)

  No tasks found.

  Create work items:
  - /creation:create-task {type} "{title}"
  ```
</if>

### Display Statistics

- **STEP 4A**: Calculate and display key metrics:
  ```
  SOLUTION METRICS

  Specification Coverage:
  - Bounded Contexts (Areas): {count}
  - Features: {count}
  - Use Cases: {count}
  - BDD Feature Files: {count}
  - BDD Scenarios: {count}

  UI Distribution:
  - 🖥️ Full Pages: {count} use cases
  - 🔌 API Endpoints: {count} use cases
  - 📝 Forms: {count} use cases
  - 🔘 Buttons: {count} use cases
  - 🧩 Widgets: {count} use cases
  - 🪟 Modals: {count} use cases
  - 📋 Menu Items: {count} use cases
  - 📊 Panels: {count} use cases
  - ⚙️  No UI/Internal: {count} use cases

  Quality Indicators:
  - Features with BDD: {count}/{total} ({percentage}%)
  - Use Cases with BDD: {count}/{total} ({percentage}%)
  - Avg Scenarios/Use Case: {average}
  - Use Cases with UI specified: {count}/{total} ({percentage}%)

  <if ({has_structure})>
  Structure Metrics:
  - Platform: {platform_type}
  - Total Components: {component_count}
  - By Layer: Domain ({domain_count}), Application ({app_count}), Infrastructure ({infra_count}), UI ({ui_count})
  - Feature Mapping: {mapped_features}/{total_features} features mapped
  </if>

  <if ({has_tasks})>
  Work Metrics:
  - Total Tasks: {total_tasks}
  - Completion Rate: {completed_percent}%
  - Current Sprint: {current_sprint} ({sprint_tasks} tasks)
  - Blocked Items: {blocked_tasks}
  </if>

  Phase 1 Status: ✅ COMPLETE
  Phase 2 Status: 🔜 READY (Implementation & Testing)
  ```

### Future Extensibility (Phase 2 Placeholders)

**STEP 5A**: When Phase 2 is implemented, this command will also show:

**Implementation Status** (per use case):
- ⚙️  NOT_STARTED - No code generated
- 🔨 IN_PROGRESS - Partial implementation
- ✅ IMPLEMENTED - Code complete
- ⚠️  NEEDS_UPDATE - Spec changed after implementation

**Test Status** (per use case):
- 📝 NO_TESTS - Step definitions not created
- 🧪 TESTS_EXIST - Step definitions created
- ✅ PASSING - All BDD scenarios pass
- ❌ FAILING - Some scenarios fail ({count} failures)
- ⚠️  OUTDATED - BDD regenerated, tests need update

**Integration with Phase 2 Commands**:
- /implement-use-case will update implementation status
- /test-implementation will update test status
- /show-structure will display real-time progress

**Current State**: Placeholders shown, actual status tracking awaits Phase 2

## Quick Reference
- VTTTOOLS_STACK.md: VttTools technology stack overview
- ARCHITECTURE_PATTERN.md: DDD Contracts + Service Implementation pattern

**IMPORTANT NOTES**:
- Displays complete solution status from FILES (persistent, version controlled)
- PRIMARY data source: STATUS.md files at all levels
- FALLBACK: Memory entities if STATUS files don't exist
- Supports 3 detail levels: summary, detailed, full
- Full view shows implementation status, test results, grades from STATUS files
- Run /assess-implementation first to generate STATUS files
- STATUS files updated automatically by implementation commands
- Useful for: tracking real progress, identifying gaps, prioritizing work