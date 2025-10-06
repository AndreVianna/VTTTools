---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Define technical structure and architecture for the solution
argument-hint: {platform_type:string}
---

# Define Structure Command

Define technical architecture and structure organization for the solution through guided Q&A. Documents projects/modules/packages, layer architecture, dependencies, and feature-to-component mapping.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Phase 0: Validation & Setup

- **STEP 0A**: Validate {platform_type} is a supported platform:
  - Supported: dotnet, java, python, typescript, go, rust, ruby, php
  - Abort if unsupported with list of valid options
- **STEP 0B**: Use Bash tool: "mkdir -p Documents/Structure" to ensure output directory exists
- **STEP 0C**: Validate STRUCTURE_TEMPLATE.md exists using Read tool - abort if missing
- **STEP 0D**: Check for existing SOLUTION.md to understand business context:
  <if (Documents/SOLUTION.md exists)>
  - Read solution specification to extract: solution_name, features, areas, bounded_contexts
  - This will inform structure-to-feature mapping questions
  <else>
  - Log warning: "No solution specification found. Structure will be created independently."
  - Set {solution_name} = project folder name
  </if>

## Phase 1: Initialize Structure Memory

- **STEP 1A**: Use mcp__memory__create_entities to create structure entity:
  - name: "{solution_name}_structure"
  - entityType: "structure"
  - observations: ["status: information_gathering", "gathering_complete: false", "platform_type: {platform_type}", "question_count: 0"]
- **STEP 1B**: Use mcp__memory__add_observations to add variable tracking:
  - ["variables_needed: solution_name,platform_type,architecture_style,organization_pattern,projects,modules,packages,components,domain_components,application_components,infrastructure_components,ui_components,layer_architecture,dependency_rules,external_dependencies,build_configuration,deployment_units,feature_component_mapping,component_feature_mapping"]

## Phase 2: Guided Architecture Definition

- **STEP 2A**: Use mcp__memory__open_nodes to retrieve current state for "{solution_name}_structure"
- **STEP 2B**: Extract control variables from memory
- **STEP 2C**:
  <while ({gathering_complete} equals false)>
  - Use Task tool with solution-engineer agent with EXACT prompt:
    ```markdown
    ROLE: Technical Architecture Analyst

    TASK: Define technical structure for {platform_type} solution through guided Q&A

    OBJECTIVE: Document technical implementation structure with feature mapping

    SOLUTION NAME: {solution_name}
    PLATFORM: {platform_type}
    TEMPLATE LOCATION: ".claude/templates/STRUCTURE_TEMPLATE.md"

    EXISTING FEATURES: {features_from_solution_spec}
    EXISTING AREAS: {areas_from_solution_spec}

    MANDATORY QUESTION SEQUENCE:

    1. ARCHITECTURE STYLE (FIRST):
       - Monolith, Microservices, Modular Monolith, Serverless, Hybrid
       - Rationale for choice

    2. COMPONENT ORGANIZATION (SECOND):
       <case {platform_type}>
       <is dotnet>
       - Solution organization (.sln structure)
       - Project breakdown (class library, web api, console, test projects)
       - Naming conventions
       </is>
       <is java>
       - Build tool (Maven/Gradle)
       - Module structure
       - Package organization
       </is>
       <is python>
       - Package manager (pip/poetry/conda)
       - Package structure
       - Module organization
       </is>
       <is typescript>
       - Package manager (npm/yarn/pnpm)
       - Workspace organization
       - Build tool (vite/webpack/esbuild)
       </is>
       </case>

    3. LAYER ARCHITECTURE (THIRD):
       - Domain layer components (entities, value objects)
       - Application layer components (use cases, handlers)
       - Infrastructure layer components (repositories, adapters)
       - UI layer components (controllers, views, pages)

    4. FEATURE-COMPONENT MAPPING (FOURTH - CRITICAL):
       - For each existing feature: which component(s) will implement it?
       - For each component: which feature(s) does it implement?
       - Bidirectional mapping required

    5. DEPENDENCIES (FIFTH):
       - Internal dependencies (component → component)
       - External dependencies (NuGet/Maven/npm packages)
       - Dependency rules (allowed/forbidden)

    6. BUILD & DEPLOYMENT (LAST):
       - Build commands
       - Build order
       - Deployment units

    REQUIRED VARIABLES:
    - platform_type, architecture_style, organization_pattern
    - projects/modules/packages (depending on platform)
    - domain_components, application_components, infrastructure_components, ui_components
    - feature_component_mapping, component_feature_mapping (BIDIRECTIONAL)
    - dependency_rules, external_dependencies
    - build_configuration, deployment_units

    OUTPUT FORMAT:
    STATUS: [questions_needed|complete]
    MISSING_VARIABLES: [list]
    QUESTIONS: [5 max per iteration]
    COMPLETION_REASON: [if complete]
    ```
  - Parse STATUS and handle questions/answers loop
  - Store answers in memory observations
  </while>

## Phase 3: Generate Structure Specification

- **STEP 3A**: Use mcp__memory__open_nodes to retrieve all observations for "{solution_name}_structure"
- **STEP 3B**: Load template using Read tool: ".claude/templates/STRUCTURE_TEMPLATE.md"
- **STEP 3C**: Parse memory observations and create variable mapping
- **STEP 3D**: Apply DSL template variable substitution:
  - Process platform-specific case blocks
  - Process foreach loops for components, features, dependencies
  - Ensure bidirectional feature-component mapping is complete
- **STEP 3E**: Write specification to: "Documents/Structure/STRUCTURE.md"
- **STEP 3F**: Validate document was created successfully
- **STEP 3G**: Use mcp__memory__add_observations to update status: "status: structure_defined", "document_path: Documents/Structure/STRUCTURE.md"

## Phase 4: Create Feature Mapping Cross-References

- **STEP 4A**: Read all existing feature specifications:
  - Use Glob: "Documents/Areas/*/Features/*.md"
  - Parse feature names and current structure mappings
- **STEP 4B**: For each feature with component mapping:
  - Use Edit tool to update feature specification
  - Add/update "Structure Mapping" section with implementing components
  - Ensure bidirectional reference integrity
- **STEP 4C**: Use mcp__memory__create_relations to establish structure-feature relationships:
  <foreach {component} in {all_components}>
    <foreach {feature} in {component.features}>
    - from: "{component.name}"
    - to: "{feature.name}"
    - relationType: "implements"
    </foreach>
  </foreach>

## Phase 5: Platform-Specific Setup

<case {platform_type}>
<is dotnet>
- **STEP 5A**: Create platform-specific directory: "Documents/Structure/Projects/"
- **STEP 5B**: Document each project:
  <foreach {project} in {projects}>
  - Create: "Documents/Structure/Projects/{project.name}.md"
  - Document: purpose, dependencies, features implemented
  </foreach>
</is>
<is java>
- **STEP 5A**: Create platform-specific directory: "Documents/Structure/Modules/"
- **STEP 5B**: Document each module
</is>
<is python>
- **STEP 5A**: Create platform-specific directory: "Documents/Structure/Packages/"
- **STEP 5B**: Document each package
</is>
<is typescript>
- **STEP 5A**: Create platform-specific directory: "Documents/Structure/Packages/"
- **STEP 5B**: Document each package/workspace
</is>
</case>

## Phase 6: Validation & Reporting

- **STEP 6A**: Validate structure specification:
  - All components assigned to layers
  - Feature mapping is bidirectional
  - No circular dependencies
  - Dependency rules specified
- **STEP 6B**: Display completion summary:
  ```
  ✓ STRUCTURE DEFINED

  Platform: {platform_type}
  Architecture: {architecture_style}
  Components: {component_count}
  Features Mapped: {mapped_features}/{total_features}

  Created:
  - Documents/Structure/STRUCTURE.md
  - Documents/Structure/{platform_folder}/ ({count} files)

  Next Steps:
  - Review Documents/Structure/STRUCTURE.md
  - Run /validate-structure to check quality
  - Update feature specs if mapping changed
  ```

**IMPORTANT NOTES**:
- Defines technical architecture separate from business features
- Creates bidirectional feature-component traceability
- Platform-specific organization (projects/modules/packages)
- Supports all major platforms and languages
- Maintains cross-references to feature specifications
