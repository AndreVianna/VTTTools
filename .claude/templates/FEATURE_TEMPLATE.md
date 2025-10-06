# {feature_name} Feature

**Original Request**: {original_description}

**{feature_name}** is a {feature_type} that {description}. This feature affects the {primary_area} area and enables {target_users} to {user_value}.

---

## Change Log
<foreach {change} IN {change_log}>
- *{change.date}* — **{change.version}** — {change.description}
</foreach>
<examples>
- *2025‑03‑14* — **1.0.0** — Feature analysis created
- *2025‑03‑20* — **1.1.0** — Use cases identified and added
</examples>

---

## Feature Overview

### Business Value
- **User Benefit**: {user_benefit}
- **Business Objective**: {business_objective}
- **Success Criteria**: {success_criteria}

### Area Assignment
- **Primary Area**: {primary_area}
- **Secondary Areas**: {secondary_areas}
- **Cross-Area Impact**: {cross_area_impact}

---

## UI Presentation

### Feature UI Overview
- **Has UI Components**: {has_ui}
<if ({has_ui} equals yes)>
- **Primary UI Type**: {primary_ui_type}
- **UI Complexity**: {ui_complexity}
- **Estimated UI Components**: {ui_component_count}

### Use Case UI Breakdown
<foreach {use_case} IN {feature_use_cases}>
- **{use_case.name}**: {use_case.ui_type} - {use_case.ui_location}
</foreach>
<examples>
- **Login**: FULL_PAGE - Route: /login with credentials form
- **Logout**: BUTTON - Location: Header user menu
- **Get Current User**: API_ENDPOINT - No UI (backend only)
- **Update Profile**: FORM - Location: /settings/profile page
</examples>

### UI Integration Points
- **Navigation Entries**: {menu_items_needed}
- **Routes Required**: {route_paths}
- **Shared Components**: {reusable_components}
</if>

<if ({has_ui} equals no)>
- **UI Components**: None (API/Backend feature)
- **Access Method**: API endpoints or internal services
</if>

---

## Architecture Analysis

### Area Impact Assessment
<foreach {area} IN {affected_areas}>
- **{area.name}**: {area.impact_description}
</foreach>
<examples>
- **TaskManagement**: Core priority logic and validation rules
- **UserInterface**: Priority display and filtering capabilities
- **Shared**: Priority constants and common validation utilities
</examples>

### Use Case Breakdown
<foreach {usecase} IN {feature_use_cases}>
- **{usecase.name}** ({usecase.area}): {usecase.purpose}
</foreach>
<examples>
- **SetTaskPriority** (TaskManagement): Set priority level for new or existing tasks
- **UpdateTaskPriority** (TaskManagement): Modify priority of existing tasks
- **ViewTasksByPriority** (UserInterface): Display tasks filtered by priority level
- **ValidatePriorityRules** (Shared): Ensure priority assignments follow business rules
</examples>

### Architectural Integration
- **New Interfaces Needed**: {new_interfaces}
- **External Dependencies**: {external_dependencies}
- **Implementation Priority**: {implementation_order}

---

## Technical Considerations

### Area Interactions
<foreach {interaction} IN {area_interactions}>
- **{interaction.from}** → **{interaction.to}**: {interaction.purpose}
</foreach>
<examples>
- **TaskManagement** → **UserInterface**: Priority changes trigger UI filter updates
- **TaskManagement** → **DataPersistence**: Priority modifications require data persistence
- **UserInterface** → **TaskManagement**: User priority filter requests invoke task queries
</examples>

### Integration Requirements
- **Data Sharing**: {data_sharing_needs}
- **Interface Contracts**: {interface_contracts}
- **Dependency Management**: {dependency_strategy}

### Implementation Guidance
- **Development Approach**: {development_approach}
- **Testing Strategy**: {testing_requirements}
- **Architecture Compliance**: {architecture_validation}

---

## Structure Mapping

This section maps the feature to technical structure components for implementation traceability.

### Implementing Components
<foreach {component} IN {implementing_components}>
- **{component.name}** ({component.type}, Layer: {component.layer})
  - **Responsibility**: {component.feature_responsibility}
  - **Use Cases Implemented**: {component.use_cases}
  - **Changes Required**: {component.change_type}
</foreach>

<examples>
- **API.Features.TaskManagement** (Project, Layer: Application)
  - **Responsibility**: Implements priority management use cases
  - **Use Cases Implemented**: SetTaskPriority, UpdateTaskPriority, ValidatePriorityRules
  - **Changes Required**: Add new use case handlers and validators
- **Domain.Tasks** (Project, Layer: Domain)
  - **Responsibility**: Domain logic for priority constraints
  - **Use Cases Implemented**: Priority business rules
  - **Changes Required**: Add Priority value object and validation
- **UI.Web.Features.Tasks** (Project, Layer: UI)
  - **Responsibility**: Priority UI components and filtering
  - **Use Cases Implemented**: ViewTasksByPriority
  - **Changes Required**: Add priority selector and filter components
</examples>

<if ({implementing_components} is empty)>
- Not yet mapped to structure components
- Structure mapping will be completed during implementation planning
</if>

### Component Dependencies
<foreach {component} IN {implementing_components}>
**{component.name}** depends on:
<foreach {dep} IN {component.dependencies}>
  - {dep.component_name} ({dep.dependency_type})
</foreach>
</foreach>

### Structure Impact Assessment
- **New Components Needed**: {new_components_required}
- **Existing Components Modified**: {modified_components_count}
- **Dependency Changes**: {dependency_changes}
- **Breaking Changes**: {breaking_changes}

---

## Use Case Implementation Plan

### Implementation Phases
<foreach {phase} IN {implementation_phases}>
#### Phase {phase.number}: {phase.name}
<foreach {usecase} IN {phase.use_cases}>
- **{usecase}**: {phase.rationale}
</foreach>
</foreach>
<examples>
#### Phase 1: Core Priority Operations
- **SetTaskPriority**: Foundation capability for priority assignment
- **ValidatePriorityRules**: Essential validation before other operations

#### Phase 2: Priority Management
- **UpdateTaskPriority**: Build on foundation to enable priority changes
- **ViewTasksByPriority**: Add user-facing priority filtering capabilities
</examples>

### Dependencies & Prerequisites
- **Technical Dependencies**: {technical_prerequisites}
- **Area Dependencies**: {area_prerequisites}
- **External Dependencies**: {external_prerequisites}

---

## Related Tasks

This section tracks work items (tasks) that implement, enhance, or fix this feature.

<foreach {task} IN {related_tasks}>
### {task.id}: {task.title}
- **Type**: {task.type}
- **Status**: {task.status}
- **Priority**: {task.priority}
- **Effort**: {task.effort}
- **Description**: {task.description}
- **Specification**: Documents/Tasks/{task.id}/TASK.md
</foreach>

<examples>
### TASK-042: Implement priority management feature
- **Type**: feature
- **Status**: in-progress
- **Priority**: High
- **Effort**: 13 story points
- **Description**: Implement complete priority management functionality including all use cases
- **Specification**: Documents/Tasks/TASK-042/TASK.md

### BUG-015: Fix priority validation edge case
- **Type**: bug
- **Status**: completed
- **Priority**: Medium
- **Effort**: 3 story points
- **Description**: Handle null priority values gracefully
- **Specification**: Documents/Tasks/BUG-015/TASK.md
</examples>

<if ({related_tasks} is empty)>
- No tasks currently associated with this feature
- Create tasks with: `/creation:create-task {type} "{title}"`
</if>

**Task Summary**:
- Total Tasks: {task_count}
- Completed: {completed_tasks}
- In Progress: {in_progress_tasks}
- Planned: {planned_tasks}

---

This {feature_name} feature provides clear guidance for implementing {user_value} within the {primary_area} area while maintaining architectural integrity and area boundary respect.

<!--
═══════════════════════════════════════════════════════════════
FEATURE SPECIFICATION QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════

## Business Clarity (25 points)
□ 5pts: Feature has clear user benefit statement
□ 5pts: Business objective is specific and measurable
□ 5pts: Success criteria are defined and testable
□ 5pts: Target users clearly identified
□ 5pts: User value explicitly stated

## UI Presentation (check within Architecture Alignment)
□ Has UI specified: yes/no
□ If has UI: Primary UI type identified
□ If has UI: Use case UI types listed
□ If has UI: Navigation entries and routes documented

## Architecture Alignment (30 points)
□ 10pts: Primary area correctly assigned based on core responsibility
□ 5pts: Secondary areas identified if cross-cutting
□ 5pts: Area impact assessment complete for all affected areas
□ 5pts: Area interactions documented with clear direction
□ 5pts: No circular dependencies between areas

## Use Case Coverage (25 points)
□ 10pts: All feature use cases identified and listed
□ 5pts: Each use case assigned to appropriate area
□ 5pts: Use case purposes clearly stated
□ 5pts: Implementation phases logically ordered by dependencies

## Implementation Guidance (20 points)
□ 5pts: New interfaces needed are identified
□ 5pts: External dependencies documented
□ 5pts: Implementation priority clearly stated
□ 5pts: Technical considerations address integration requirements

## Target Score: 80/100 minimum

### Common Issues to Avoid:
❌ Vague business objectives ("improve user experience")
❌ Missing area impact assessment
❌ Use cases assigned to wrong areas
❌ Unclear dependencies between use cases
❌ Missing cross-area interactions
-->