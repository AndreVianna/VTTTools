# {component_name} Component

**Type**: {component_type}
**Layer**: {component_layer}
**Platform**: {platform_type}
**Last Updated**: {last_updated}

---

## Overview

**Purpose**: {component_purpose}

**Responsibilities**:
<foreach {responsibility} in {component_responsibilities}>
- {responsibility.description}
</foreach>

<examples>
**Purpose**: Core domain entities and business logic for task management

**Responsibilities**:
- Define Task entity with business invariants
- Implement Priority value object with validation
- Enforce task lifecycle business rules
- Publish domain events for state changes
</examples>

---

## Layer Architecture

**Assigned Layer**: {component_layer}

<case {component_layer}>
<is Domain>
**Domain Layer Compliance**:
- ✅ No dependencies on other layers
- ✅ Pure business logic only
- ✅ Domain events for state changes
- ✅ Ubiquitous language throughout

**Contains**:
- Entities: {domain_entities}
- Value Objects: {value_objects}
- Domain Services: {domain_services}
- Domain Events: {domain_events}
</is>

<is Application>
**Application Layer Compliance**:
- ✅ Depends only on Domain layer
- ✅ Orchestrates domain objects
- ✅ Implements use cases
- ✅ No infrastructure concerns

**Contains**:
- Use Case Handlers: {use_case_handlers}
- Application Services: {application_services}
- DTOs/Commands/Queries: {application_contracts}
</is>

<is Infrastructure>
**Infrastructure Layer Compliance**:
- ✅ Implements domain/application interfaces
- ✅ External system integration
- ✅ Persistence, messaging, external APIs
- ✅ No business logic

**Contains**:
- Repositories: {repositories}
- Adapters: {adapters}
- External Service Clients: {external_clients}
</is>

<is UI>
**UI Layer Compliance**:
- ✅ Depends on Application layer only
- ✅ Presentation logic only
- ✅ User interaction handling
- ✅ No business logic

**Contains**:
- Pages/Views: {pages}
- Components: {ui_components}
- Controllers/ViewModels: {controllers}
</is>
</case>

---

## Features Implemented

This component implements the following business features:

<foreach {feature} in {implemented_features}>
### {feature.name}
- **Area**: {feature.area}
- **Component Role**: {feature.component_role}
- **Use Cases**: {feature.use_cases}
- **Implementation Notes**: {feature.implementation_notes}
</foreach>

<examples>
### TaskManagement
- **Area**: TaskManagement
- **Component Role**: Core domain logic for task entities
- **Use Cases**: CreateTask, UpdateTask, DeleteTask, SetTaskPriority
- **Implementation Notes**: Task entity with rich domain model, Priority value object

### CategoryManagement
- **Area**: TaskManagement
- **Component Role**: Category entity and validation
- **Use Cases**: CreateCategory, UpdateCategory, DeleteCategory
- **Implementation Notes**: Category entity with color validation
</examples>

<if ({implemented_features} is empty)>
- This component is infrastructure/shared and doesn't directly implement business features
</if>

---

## Dependencies

### Internal Dependencies
<foreach {dependency} in {internal_dependencies}>
- **{dependency.component_name}** ({dependency.layer})
  - Purpose: {dependency.purpose}
  - Type: {dependency.dependency_type}
</foreach>

<examples>
- **VttTools.Domain** (Domain)
  - Purpose: Access domain entities and business logic
  - Type: Project Reference (compile-time)
</examples>

<if ({internal_dependencies} is empty)>
- None - This is a leaf component with no internal dependencies
</if>

### External Dependencies
<foreach {dependency} in {external_dependencies}>
- **{dependency.name}** {dependency.version}
  - Purpose: {dependency.purpose}
  - Type: {dependency.package_type}
</foreach>

<examples>
- **Microsoft.EntityFrameworkCore** 8.0.0
  - Purpose: ORM for database persistence
  - Type: NuGet Package
- **FluentValidation** 11.9.0
  - Purpose: Input validation library
  - Type: NuGet Package
</examples>

### Dependents (Components that depend on this)
<foreach {dependent} in {dependent_components}>
- **{dependent.name}** ({dependent.layer}): {dependent.usage_description}
</foreach>

<examples>
- **VttTools.Application** (Application): Uses domain entities and services
- **VttTools.API** (Infrastructure): References domain for DTOs
</examples>

---

## Code Organization

**File Path**: {component_path}

**Structure**:
<foreach {folder} in {component_structure}>
- `{folder.path}/`: {folder.description}
</foreach>

<examples>
**File Path**: Source/Domain/VttTools.Domain.csproj

**Structure**:
- `Entities/`: Domain entities (Task, Category)
- `ValueObjects/`: Value objects (Priority, DueDate)
- `Services/`: Domain services
- `Events/`: Domain events
- `Exceptions/`: Domain-specific exceptions
</examples>

---

## Build Configuration

**Build Command**: {build_command}
**Test Command**: {test_command}
**Output**: {output_path}

<if ({component_type} equals executable)>
**Entry Point**: {entry_point}
**Runtime**: {runtime_environment}
</if>

---

## Testing

**Test Project**: {test_project_name}
**Test Coverage**: {test_coverage_target}%
**Current Coverage**: {current_coverage}%

**Test Categories**:
- Unit Tests: {unit_test_count}
- Integration Tests: {integration_test_count}
- BDD Tests: {bdd_test_count}

---

## Related Tasks

<foreach {task} in {component_tasks}>
### {task.id}: {task.title}
- **Type**: {task.type}
- **Status**: {task.status}
- **Changes**: {task.change_description}
</foreach>

<examples>
### TASK-042: Implement Priority value object
- **Type**: feature
- **Status**: completed
- **Changes**: Added Priority.cs with validation logic

### BUG-023: Fix Task.SetPriority null reference
- **Type**: bug
- **Status**: completed
- **Changes**: Added null checks in Task.cs:142
</examples>

---

## Change Log
<foreach {change} in {component_change_log}>
- **{change.date}**: {change.description}
</foreach>

<examples>
- **2025-03-14**: Component created with Task and Category entities
- **2025-03-20**: Added Priority value object
- **2025-03-25**: Implemented domain events for task state changes
</examples>

---

<!--
═══════════════════════════════════════════════════════════════
COMPONENT SPECIFICATION QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════

## Component Identity (15 points)
□ 5pts: Component type and layer clearly specified
□ 5pts: Purpose and responsibilities documented
□ 5pts: File path and structure documented

## Feature Mapping (25 points)
□ 15pts: All implemented features listed with roles
□ 10pts: Use cases mapped to this component

## Dependencies (25 points)
□ 10pts: Internal dependencies documented
□ 10pts: External dependencies with versions
□ 5pts: Dependent components listed

## Layer Compliance (20 points)
□ 10pts: Assigned to correct layer
□ 10pts: Dependency rules followed (no layer violations)

## Build & Testing (15 points)
□ 5pts: Build configuration documented
□ 5pts: Test project and coverage specified
□ 5pts: Code organization clear

## Target Score: 80/100 minimum

### Common Issues to Avoid:
❌ Component not mapped to features
❌ Missing dependency information
❌ Layer assignment incorrect
❌ No test coverage data
❌ Unclear responsibilities
-->
