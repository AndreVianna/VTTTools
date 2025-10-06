# {solution_name} - Technical Structure Specification

**Platform**: {platform_type}
**Last Updated**: {last_updated}
**Version**: {structure_version}

---

## Overview

This document describes the technical implementation structure of {solution_name}, including projects/modules/packages organization, dependencies, and mapping to business features.

**Architecture Style**: {architecture_style}
**Organization Pattern**: {organization_pattern}

---

## Structure Organization

### Platform: {platform_type}

<case {platform_type}>
<is dotnet>
**Solution File**: {solution_file_path}

**Projects**:
<foreach {project} in {projects}>
- **{project.name}** ({project.type})
  - **Path**: {project.path}
  - **Purpose**: {project.purpose}
  - **Layer**: {project.layer}
  - **Implements Features**: {project.features}
  - **Dependencies**: {project.dependencies}
</foreach>
<examples>
- **VttTools.Domain** (ClassLibrary)
  - **Path**: Source/Domain/VttTools.Domain.csproj
  - **Purpose**: Core domain entities, value objects, and business logic
  - **Layer**: Domain
  - **Implements Features**: TaskManagement, CategoryManagement, PriorityManagement
  - **Dependencies**: None (pure domain layer)
- **VttTools.Application** (ClassLibrary)
  - **Path**: Source/Application/VttTools.Application.csproj
  - **Purpose**: Use case implementations and application services
  - **Layer**: Application
  - **Implements Features**: TaskManagement, CategoryManagement
  - **Dependencies**: VttTools.Domain
- **VttTools.API** (WebApi)
  - **Path**: Source/API/VttTools.API.csproj
  - **Purpose**: REST API endpoints and controllers
  - **Layer**: Infrastructure
  - **Implements Features**: TaskManagement (API access)
  - **Dependencies**: VttTools.Application, VttTools.Domain
</examples>
</is>

<is java>
**Build Tool**: {build_tool}
**Root POM/Build File**: {build_file_path}

**Modules**:
<foreach {module} in {modules}>
- **{module.name}** ({module.type})
  - **Path**: {module.path}
  - **Purpose**: {module.purpose}
  - **Layer**: {module.layer}
  - **Implements Features**: {module.features}
  - **Dependencies**: {module.dependencies}
</foreach>
</is>

<is python>
**Package Manager**: {package_manager}

**Packages**:
<foreach {package} in {packages}>
- **{package.name}**
  - **Path**: {package.path}
  - **Purpose**: {package.purpose}
  - **Layer**: {package.layer}
  - **Implements Features**: {package.features}
  - **Dependencies**: {package.dependencies}
</foreach>
</is>

<is typescript>
**Package Manager**: {package_manager}
**Build Tool**: {build_tool}

**Packages**:
<foreach {package} in {packages}>
- **{package.name}**
  - **Path**: {package.path}
  - **Purpose**: {package.purpose}
  - **Layer**: {package.layer}
  - **Implements Features**: {package.features}
  - **Dependencies**: {package.dependencies}
</foreach>
</is>

<otherwise>
**Components**:
<foreach {component} in {components}>
- **{component.name}**
  - **Path**: {component.path}
  - **Purpose**: {component.purpose}
  - **Layer**: {component.layer}
  - **Implements Features**: {component.features}
  - **Dependencies**: {component.dependencies}
</foreach>
</otherwise>
</case>

---

## Layer Architecture

### Domain Layer
<foreach {component} in {domain_components}>
- **{component.name}**: {component.description}
  - Contains: {component.contents}
</foreach>

### Application Layer
<foreach {component} in {application_components}>
- **{component.name}**: {component.description}
  - Contains: {component.contents}
</foreach>

### Infrastructure Layer
<foreach {component} in {infrastructure_components}>
- **{component.name}**: {component.description}
  - Contains: {component.contents}
</foreach>

### UI/Presentation Layer
<foreach {component} in {ui_components}>
- **{component.name}**: {component.description}
  - Contains: {component.contents}
</foreach>

---

## Feature-to-Component Mapping

This section provides bidirectional traceability between business features and technical components.

### By Feature
<foreach {feature} in {features}>
**{feature.name}** → Implemented in:
<foreach {component} in {feature.components}>
  - {component.name} ({component.layer}): {component.role}
</foreach>
</foreach>
<examples>
**TaskManagement** → Implemented in:
  - VttTools.Domain (Domain): Task entity, Priority value object, domain logic
  - VttTools.Application (Application): CreateTask, UpdateTask, DeleteTask use case handlers
  - VttTools.API (Infrastructure): REST API endpoints for task operations
  - VttTools.UI.Web (UI): Task list, task editor, task detail components

**CategoryManagement** → Implemented in:
  - VttTools.Domain (Domain): Category entity and validation
  - VttTools.Application (Application): Category use case handlers
  - VttTools.UI.Web (UI): Category selector, category management UI
</examples>

### By Component
<foreach {component} in {all_components}>
**{component.name}** → Implements:
<foreach {feature} in {component.features}>
  - {feature.name}: {feature.implementation_notes}
</foreach>
</foreach>
<examples>
**VttTools.Domain** → Implements:
  - TaskManagement: Core Task entity, business rules, priority logic
  - CategoryManagement: Category entity, validation rules
  - PriorityManagement: Priority value object, ordering logic

**VttTools.Application** → Implements:
  - TaskManagement: Use case orchestration for CRUD operations
  - CategoryManagement: Category use case handlers

**VttTools.API** → Implements:
  - TaskManagement: HTTP endpoints for task API
  - CategoryManagement: HTTP endpoints for category API

**VttTools.UI.Web** → Implements:
  - TaskManagement: Task UI components (list, editor, details)
  - CategoryManagement: Category selection and management UI
</examples>

---

## Dependency Graph

### Internal Dependencies
<foreach {component} in {all_components}>
**{component.name}**:
  - Depends on: {component.internal_dependencies}
  - Used by: {component.dependents}
</foreach>

### External Dependencies
<foreach {dependency} in {external_dependencies}>
- **{dependency.name}** {dependency.version}
  - Purpose: {dependency.purpose}
  - Used by: {dependency.consuming_components}
</foreach>

---

## Dependency Rules

### Allowed Dependencies
<foreach {rule} in {dependency_rules_allowed}>
- {rule.from} → {rule.to}: {rule.reason}
</foreach>

### Forbidden Dependencies
<foreach {rule} in {dependency_rules_forbidden}>
- {rule.from} ⛔ {rule.to}: {rule.reason}
</foreach>

### Layer Dependency Flow
```
{layer_dependency_diagram}
```

---

## Build Configuration

### Build Order
<foreach {step} in {build_order}>
{step.sequence}. {step.component} - {step.reason}
</foreach>

### Build Commands
- **Clean**: {build_clean_command}
- **Build**: {build_command}
- **Test**: {test_command}
- **Package**: {package_command}
- **Deploy**: {deploy_command}

---

## Deployment Structure

### Deployment Units
<foreach {unit} in {deployment_units}>
**{unit.name}**:
  - **Type**: {unit.type}
  - **Components**: {unit.components}
  - **Entry Point**: {unit.entry_point}
  - **Dependencies**: {unit.runtime_dependencies}
</foreach>

### Environment Configuration
- **Development**: {dev_config_notes}
- **Staging**: {staging_config_notes}
- **Production**: {prod_config_notes}

---

## Implementation Guidelines

### Adding New Features
1. Identify which components need changes (use Feature Mapping above)
2. Update component code following layer architecture
3. Update this document if new components created
4. Verify dependency rules not violated

### Adding New Components
1. Determine appropriate layer
2. Document purpose and responsibilities
3. Map to features it will implement
4. Define dependencies (internal and external)
5. Update build configuration
6. Update this specification

### Refactoring Guidelines
- Maintain layer boundaries
- Preserve feature mappings
- Update dependency graph
- Document breaking changes

---

## Change Log
<foreach {change} in {structure_change_log}>
- **{change.date}** (v{change.version}): {change.description}
</foreach>

---

<!--
═══════════════════════════════════════════════════════════════
STRUCTURE SPECIFICATION QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════

## Platform & Organization (15 points)
□ 5pts: Platform type clearly specified (dotnet/java/python/typescript/etc.)
□ 5pts: Architecture style documented (monolith/microservices/modular monolith)
□ 5pts: All components/projects/modules listed with paths

## Layer Architecture (25 points)
□ 10pts: All four layers represented (Domain, Application, Infrastructure, UI)
□ 5pts: Each component assigned to correct layer
□ 5pts: Layer responsibilities clearly documented
□ 5pts: Layer dependency flow diagram present

## Feature Mapping (30 points) - CRITICAL FOR CROSS-REFERENCING
□ 15pts: Every feature mapped to implementing components
□ 15pts: Every component mapped to features it implements
□ BIDIRECTIONAL: Both directions documented

## Dependencies (20 points)
□ 5pts: Internal dependencies documented for all components
□ 5pts: External dependencies listed with versions
□ 5pts: Dependency rules (allowed/forbidden) specified
□ 5pts: Dependency violations identified (if any)

## Build & Deployment (10 points)
□ 5pts: Build commands documented
□ 3pts: Build order specified
□ 2pts: Deployment structure described

## Target Score: 80/100 minimum

### Common Issues to Avoid:
❌ Missing feature→component mappings (breaks traceability)
❌ Components not assigned to layers
❌ Circular dependencies not identified
❌ External dependency versions not specified
❌ Build commands generic/incomplete
❌ No deployment configuration
-->
