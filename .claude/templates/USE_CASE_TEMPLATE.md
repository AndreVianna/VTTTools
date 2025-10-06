# {use_case_name} Use Case

**Original Request**: {original_description}

**{use_case_name}** is a {use_case_type} that {description}. This use case operates within the {owning_area} area and enables {target_users} to {user_operation}.

---

## Change Log
<foreach {change} IN {change_log}>
- *{change.date}* — **{change.version}** — {change.description}
</foreach>
<examples>
- *2025‑03‑14* — **1.0.0** — Use case specification created
- *2025‑03‑20* — **1.1.0** — Business rules refined
</examples>

---

## Use Case Overview

### Business Context
- **Parent Feature**: {parent_feature}
- **Owning Area**: {owning_area}
- **Business Value**: {business_value}
- **User Benefit**: {user_benefit}

### Scope Definition
- **Primary Actor**: {primary_actor}
- **Scope**: {use_case_scope}
- **Level**: {abstraction_level}

---

## UI Presentation

### Presentation Type
- **UI Type**: {ui_type}
- **Access Method**: {access_method}

<case {ui_type}>
<is NO_UI>
- **UI Components**: None
- **Access**: Internal service or background process
- **Visibility**: Not user-facing

<is API_ENDPOINT>
- **Endpoint**: {http_method} {endpoint_path}
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/GraphQL
- **Response Format**: {response_format}
<examples>
- **Endpoint**: GET /api/users/:id
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/GraphQL
- **Response Format**: JSON with user object
</examples>

<is FULL_PAGE>
- **Route**: {route_path}
- **Page Layout**: {layout_description}
- **Navigation**: {navigation_path}
- **Key UI Elements**:
  <foreach {element} IN {ui_elements}>
  - {element.type}: {element.description}
  </foreach>
<examples>
- **Route**: /login
- **Page Layout**: Centered card on neutral background
- **Navigation**: Direct URL or "Sign In" link from landing page
- **Key UI Elements**:
  - Form Field: Email input with validation
  - Form Field: Password input with show/hide toggle
  - Button: "Login" submit button with loading state
  - Link: "Forgot password?" link to reset flow
  - Display: Error message area for validation feedback
</examples>

<is MODAL>
- **Container Page**: {parent_page}
- **Trigger**: {modal_trigger}
- **Modal Type**: {modal_size_and_style}
- **Key UI Elements**:
  <foreach {element} IN {ui_elements}>
  - {element.type}: {element.description}
  </foreach>
<examples>
- **Container Page**: Adventure Details Page
- **Trigger**: "Delete Adventure" button click
- **Modal Type**: Small confirmation dialog
- **Key UI Elements**:
  - Text: "Are you sure you want to delete this adventure?"
  - Button: "Cancel" (secondary)
  - Button: "Delete" (danger, primary)
</examples>

<is FORM>
- **Container Page**: {parent_page}
- **Form Location**: {location_in_page}
- **Submit Action**: {what_happens_on_submit}
- **Key UI Elements**:
  <foreach {element} IN {ui_elements}>
  - {element.type}: {element.description}
  </foreach>
<examples>
- **Container Page**: Settings Page
- **Form Location**: Profile tab content area
- **Submit Action**: Update user profile, show success message
- **Key UI Elements**:
  - Form Field: Display name input
  - Form Field: Email input (validated)
  - Form Field: Avatar upload
  - Button: "Save Changes" with loading state
  - Button: "Cancel" returns to view mode
</examples>

<is WIDGET or PANEL>
- **Component Type**: {reusable|page_specific}
- **Used In**: {parent_pages_list}
- **Props Required**: {component_props}
- **Key UI Elements**:
  <foreach {element} IN {ui_elements}>
  - {element.type}: {element.description}
  </foreach>
<examples>
- **Component Type**: Reusable widget
- **Used In**: Dashboard, Adventure Details, Scene View
- **Props Required**: userId, displaySize
- **Key UI Elements**:
  - Image: User avatar with fallback initials
  - Text: User display name
  - Badge: User role indicator
</examples>

<is BUTTON or MENU_ITEM>
- **Container**: {parent_component}
- **Location**: {specific_location}
- **Label**: {button_or_menu_text}
- **Action**: {on_click_behavior}
- **Visual States**: {enabled_disabled_loading}
<examples>
- **Container**: Application header
- **Location**: User menu dropdown
- **Label**: "Logout"
- **Action**: Clear session, redirect to landing page
- **Visual States**: Always enabled when user authenticated
</examples>

</case>

### UI State Requirements
<if ({ui_type} is not NO_UI and {ui_type} is not API_ENDPOINT)>
- **Data Dependencies**: {ui_data_needs}
- **State Scope**: {local|global|server}
- **API Calls**: {endpoints_called}
- **State Management**: {state_management_approach}
<examples>
- **Data Dependencies**: Current user from auth context, adventure list from API
- **State Scope**: Global for user, server for adventure list
- **API Calls**: GET /api/adventures
- **State Management**: Redux auth slice, React Query for adventures
</examples>
</if>

### UI Behavior & Flow
<if ({ui_type} is not NO_UI and {ui_type} is not API_ENDPOINT)>
- **User Interactions**: {interaction_flow}
- **Validation Feedback**: {validation_approach}
- **Loading States**: {loading_indicators}
- **Success Handling**: {success_feedback}
- **Error Handling**: {error_display}
<examples>
- **User Interactions**: User enters credentials, clicks login, sees spinner, receives result
- **Validation Feedback**: Inline errors below fields, real-time email format validation
- **Loading States**: Disabled submit button with spinner during authentication
- **Success Handling**: Redirect to dashboard with success toast
- **Error Handling**: Display error message below form, highlight invalid fields
</examples>
</if>

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: {application_service_name}
- **Domain Entities**: {domain_entities_involved}
- **Domain Services**: {domain_services_used}
- **Infrastructure Dependencies**: {infrastructure_needs}

### Hexagonal Architecture
- **Primary Port Operation**: {primary_port_method}
- **Secondary Port Dependencies**: {secondary_port_requirements}
- **Adapter Requirements**: {adapter_specifications}

### DDD Alignment
- **Bounded Context**: {owning_area}
- **Ubiquitous Language**: {domain_terminology}
- **Business Invariants**: {business_rules_enforced}
- **Domain Events**: {domain_events_published}

---

## Functional Specification

### Input Requirements
- **Input Data**: {input_specification}
- **Input Validation**: {input_validation_rules}
- **Preconditions**: {preconditions_required}
<examples>
- **Input Data**: Task identifier (UUID), Priority level (Low|Medium|High|Critical)
- **Input Validation**: Task exists in system, Priority level is valid enum value
- **Preconditions**: Task must exist, Task must not be archived, User has modification permissions
</examples>

### Business Logic
- **Business Rules**: {business_rules_applied}
- **Processing Steps**: {processing_workflow}
- **Domain Coordination**: {domain_entity_interactions}
- **Validation Logic**: {business_validation_rules}
<examples>
- **Business Rules**: Priority levels must be valid enum, Completed tasks can have priority updated
- **Processing Steps**: Validate task exists → Validate priority → Update entity → Persist → Publish event
- **Domain Coordination**: Task entity coordination with Priority value object
- **Validation Logic**: Priority enum validation, Task existence check, Permission validation
</examples>

### Output Specification
- **Output Data**: {output_specification}
- **Output Format**: {output_format_requirements}
- **Postconditions**: {postconditions_guaranteed}

### Error Scenarios
<foreach {error} IN {error_scenarios}>
- **{error.condition}**: {error.handling_strategy}
</foreach>
<examples>
- **Task Not Found**: Return error with task identifier not found message
- **Invalid Priority**: Return validation error with valid priority level options
- **Permission Denied**: Return authorization error if user cannot modify task
- **Persistence Failure**: Return system error if task update cannot be saved
</examples>

---

## Technical Implementation

This section maps the use case to specific technical structure components and domain models.

### Structure Components
<foreach {component} IN {structure_components}>
- **{component.name}** ({component.layer})
  - **Role**: {component.use_case_role}
  - **Methods/Handlers**: {component.methods}
  - **File Location**: {component.file_path}
</foreach>

<examples>
- **API.Features.TaskManagement.Handlers.SetTaskPriorityHandler** (Application Layer)
  - **Role**: Orchestrates priority update workflow
  - **Methods**: HandleAsync(SetTaskPriorityCommand)
  - **File Location**: Source/API/Features/TaskManagement/Handlers/SetTaskPriorityHandler.cs
- **Domain.Tasks.Task** (Domain Layer)
  - **Role**: Contains priority business logic
  - **Methods**: SetPriority(Priority), ValidatePriorityTransition()
  - **File Location**: Source/Domain/Tasks/Task.cs
- **Infrastructure.Persistence.TaskRepository** (Infrastructure Layer)
  - **Role**: Persists task priority changes
  - **Methods**: UpdateAsync(Task)
  - **File Location**: Source/Infrastructure/Persistence/TaskRepository.cs
</examples>

<if ({structure_components} is empty)>
- Not yet mapped to structure components
- Mapping will be completed during implementation phase
</if>

### Domain Models Used
<foreach {entity} IN {domain_entities_used}>
- **{entity.name}** ({entity.type})
  - **Properties Accessed**: {entity.properties}
  - **Methods Called**: {entity.methods}
  - **Events Published**: {entity.events}
</foreach>

<examples>
- **Task** (Entity)
  - **Properties Accessed**: Id, Priority, Status, LastModified
  - **Methods Called**: SetPriority(), ValidatePriorityTransition()
  - **Events Published**: TaskPriorityChanged
- **Priority** (Value Object)
  - **Properties Accessed**: Level, DisplayName
  - **Methods Called**: IsValid(), CompareTo()
  - **Events Published**: None
</examples>

### Component Dependencies
**This use case requires**:
<foreach {dependency} IN {component_dependencies}>
- {dependency.component_name} ({dependency.layer}): {dependency.purpose}
</foreach>

### Data Flow
```
{data_flow_diagram}
```

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**: {interface_definition}
- **Data Access Patterns**: {data_access_requirements}
- **External Integration**: {external_system_interactions}
- **Performance Requirements**: {performance_expectations}

### Architecture Compliance
- **Layer Responsibilities**: {layer_responsibility_mapping}
- **Dependency Direction**: {dependency_flow_requirements}
- **Interface Abstractions**: {abstraction_requirements}
- **KISS Validation**: {simplicity_justification}

### Testing Strategy
- **Unit Testing**: {unit_test_requirements}
- **Integration Testing**: {integration_test_scenarios}
- **Acceptance Criteria**: {acceptance_test_conditions}
- **BDD Scenarios**: {bdd_test_outline}

---

## Acceptance Criteria

<foreach {criteria} IN {acceptance_criteria}>
- **AC-{criteria.id}**: {criteria.description}
  - **Given**: {criteria.precondition}
  - **When**: {criteria.action}
  - **Then**: {criteria.expected_result}
</foreach>
<examples>
- **AC-01**: Priority assignment succeeds for valid inputs
  - **Given**: Valid task identifier and priority level
  - **When**: SetTaskPriority operation called
  - **Then**: Task priority updated and TaskPriorityChanged event published

- **AC-02**: Invalid priority levels rejected
  - **Given**: Task identifier and invalid priority value
  - **When**: SetTaskPriority operation called
  - **Then**: Validation error returned with valid options

- **AC-03**: Non-existent tasks handled gracefully
  - **Given**: Invalid task identifier
  - **When**: SetTaskPriority operation called
  - **Then**: Task not found error returned
</examples>

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: {implementation_pattern}
- **Code Organization**: {code_structure_guidance}
- **Testing Approach**: {testing_implementation_strategy}

### Dependencies
- **Technical Dependencies**: {technical_dependencies}
- **Area Dependencies**: {area_coordination_needs}
- **External Dependencies**: {external_system_dependencies}

### Architectural Considerations
- **Area Boundary Respect**: {area_boundary_compliance}
- **Interface Design**: {interface_design_guidance}
- **Error Handling**: {error_handling_strategy}

---

## Related Tasks

This section tracks work items (tasks) that implement, enhance, or fix this use case.

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
### TASK-042: Implement SetTaskPriority use case
- **Type**: feature
- **Status**: completed
- **Priority**: High
- **Effort**: 5 story points
- **Description**: Implement priority assignment with validation and event publishing
- **Specification**: Documents/Tasks/TASK-042/TASK.md

### BUG-023: Fix priority persistence issue
- **Type**: bug
- **Status**: completed
- **Priority**: Critical
- **Effort**: 2 story points
- **Description**: Priority changes not saving to database correctly
- **Specification**: Documents/Tasks/BUG-023/TASK.md
</examples>

<if ({related_tasks} is empty)>
- No tasks currently associated with this use case
- Create tasks with: `/creation:create-task {type} "{title}"`
</if>

**Task Summary**:
- Total Tasks: {task_count}
- Completed: {completed_tasks}
- In Progress: {in_progress_tasks}
- Planned: {planned_tasks}

---

This {use_case_name} use case provides comprehensive implementation guidance for {user_operation} within the {owning_area} area while maintaining architectural integrity and area boundary respect.

<!--
═══════════════════════════════════════════════════════════════
USE CASE SPECIFICATION QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════

## Business Context (20 points)
□ 5pts: Parent feature clearly identified
□ 5pts: Owning area correctly assigned
□ 5pts: Business value explicitly stated
□ 5pts: Primary actor and scope defined

## Architecture Integration (30 points)
□ 10pts: Clean Architecture mapping complete (service, entities, domain services)
□ 10pts: Hexagonal Architecture elements defined (ports, adapters)
□ 5pts: DDD alignment documented (bounded context, domain events)
□ 5pts: Infrastructure dependencies identified
□ UI Presentation: UI type specified (NO_UI, API_ENDPOINT, FULL_PAGE, etc.)
□ UI Presentation: If user-facing UI, location/route specified
□ UI Presentation: If user-facing UI, key UI elements listed

## Functional Specification (30 points)
□ 5pts: Input requirements fully specified with validation rules
□ 5pts: Business rules clearly documented
□ 5pts: Processing steps detailed
□ 5pts: Output specification complete
□ 5pts: Error scenarios comprehensive (4+ error conditions)
□ 5pts: Preconditions and postconditions explicit

## Implementation Guidance (20 points)
□ 5pts: Interface contract defined
□ 5pts: Testing strategy includes unit, integration, and acceptance criteria
□ 5pts: Acceptance criteria in Given/When/Then format (3+ criteria)
□ 5pts: Architecture compliance validated (layers, dependencies, KISS)

## Target Score: 80/100 minimum

### Common Issues to Avoid:
❌ Missing error scenarios (must have 4+)
❌ Vague business rules without specifics
❌ Missing domain events when state changes occur
❌ Incomplete acceptance criteria (need 3+ ACs minimum)
❌ No validation rules specified
❌ Missing preconditions/postconditions
❌ UI type not specified (must be one of: NO_UI, API_ENDPOINT, FULL_PAGE, MODAL, FORM, WIDGET, BUTTON, MENU_ITEM, PANEL)
❌ User-facing UI without location/route specified
❌ Forms/pages without UI elements listed
-->