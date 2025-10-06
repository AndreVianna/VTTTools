---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Extract technical structure from existing codebase
argument-hint: {project_folder:string:optional}
---

# Extract Structure Command

Analyze existing codebase to extract technical structure including projects/modules/packages, dependencies, layer organization, and feature-to-component mapping.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Phase 0: Platform Detection

- **STEP 0A**: Set {project_folder} to current directory if not provided
- **STEP 0B**: Use Bash tool: "mkdir -p Documents/Structure" to ensure output directory exists
- **STEP 0C**: Detect platform type using file indicators:
  - Glob: "**/*.sln" OR "**/*.csproj" → dotnet
  - Glob: "**/pom.xml" OR "**/build.gradle" → java
  - Glob: "**/package.json" (check for TypeScript) → typescript
  - Glob: "**/pyproject.toml" OR "**/setup.py" → python
  - Glob: "**/go.mod" → go
  - Glob: "**/Cargo.toml" → rust
  - Set {detected_platform} based on findings
  - Report to user: "Detected platform: {detected_platform}"

## Phase 1: Initialize Extraction Memory

- **STEP 1A**: Use mcp__memory__create_entities to create extraction entity:
  - name: "structure_extraction_{solution_name}"
  - entityType: "structure_extraction"
  - observations: ["status: analyzing", "platform: {detected_platform}", "extraction_complete: false"]
- **STEP 1B**: Check for existing solution specification:
  <if (Documents/SOLUTION.md exists)>
  - Read to extract: solution_name, features[], areas[]
  - Store in memory for feature mapping
  <else>
  - Extract solution_name from project folder name
  - Log: "No solution spec found - feature mapping will be manual"
  </if>

## Phase 2: Platform-Specific Component Discovery

<case {detected_platform}>
<is dotnet>
- **STEP 2A**: Discover solution structure:
  - Use Glob: "**/*.sln"
  - Parse solution file to extract project references
  - Store: "solution_file: {path}"

- **STEP 2B**: Discover all projects:
  - Use Glob: "**/*.csproj"
  - For each project file:
    - Parse project name, type (ClassLibrary, WebApi, Console, etc.)
    - Extract package references (NuGet dependencies)
    - Extract project references (internal dependencies)
    - Infer layer from path/name patterns (Domain/, Application/, Infrastructure/, UI/)
    - Store in memory: "project_{name}: {metadata}"

- **STEP 2C**: Build dependency graph:
  - Parse <ProjectReference> elements from all .csproj files
  - Create internal dependency map
  - Identify circular dependencies (if any)
</is>

<is java>
- **STEP 2A**: Detect build tool:
  - Check for pom.xml → Maven
  - Check for build.gradle → Gradle

- **STEP 2B**: Discover modules:
  - Use Grep to find module declarations
  - Parse module names, types
  - Extract dependencies
  - Infer layer from package structure

- **STEP 2C**: Build dependency graph from POM/Gradle files
</is>

<is python>
- **STEP 2A**: Detect package manager:
  - Check for pyproject.toml → Poetry/modern
  - Check for setup.py → Setuptools
  - Check for requirements.txt → pip

- **STEP 2B**: Discover packages:
  - Use Glob: "**/__init__.py"
  - Identify package structure
  - Parse dependencies from pyproject.toml or requirements.txt

- **STEP 2C**: Infer layer from folder structure
</is>

<is typescript>
- **STEP 2A**: Analyze package.json:
  - Check for workspaces (monorepo)
  - Extract dependencies, devDependencies
  - Identify build tool (vite/webpack/esbuild)

- **STEP 2B**: Discover modules/packages:
  - If workspace: discover all sub-packages
  - Parse tsconfig.json for path mappings
  - Infer layer from folder structure (src/domain, src/application, etc.)

- **STEP 2C**: Extract dependency graph
</is>

<otherwise>
- **STEP 2A**: Generic folder-based discovery
- **STEP 2B**: Infer structure from naming conventions
</otherwise>
</case>

## Phase 3: Layer Classification

- **STEP 3A**: Classify each component by layer:
  - Use path patterns:
    - **/Domain/** OR **/domain/** → Domain Layer
    - **/Application/** OR **/app/** OR **/Features/** → Application Layer
    - **/Infrastructure/** OR **/infra/** OR **/persistence/** → Infrastructure Layer
    - **/UI/** OR **/Web/** OR **/presentation/** → UI Layer
  - Use naming patterns:
    - *.Domain.* → Domain Layer
    - *.Application.* OR *.Features.* → Application Layer
    - *.Infrastructure.* OR *.Persistence.* → Infrastructure Layer
    - *.Web.* OR *.UI.* → UI Layer
  - Store layer assignments in memory

- **STEP 3B**: Validate layer dependencies:
  - Check for violations (UI → Domain direct dependency)
  - Identify dependency rule compliance
  - Report warnings for architectural violations

## Phase 4: Feature-Component Mapping

<if (features exist in solution spec)>
- **STEP 4A**: Use Task tool with solution-engineer agent to map features to components:
  ```markdown
  ROLE: Feature-Component Mapping Analyst

  TASK: Map business features to technical components

  FEATURES: {features_from_solution}
  COMPONENTS: {discovered_components}

  ANALYSIS REQUIRED:
  1. For each feature, identify which component(s) implement it
  2. For each component, identify which feature(s) it implements
  3. Create bidirectional mapping
  4. Justify mapping based on:
     - Component name/path matches feature domain
     - Code analysis (search for feature-related classes)
     - Layer responsibilities match feature needs

  OUTPUT:
  feature_component_mapping: [
    {feature: "FeatureName", components: ["Comp1", "Comp2"]}
  ]
  component_feature_mapping: [
    {component: "Comp1", features: ["Feature1", "Feature2"]}
  ]
  ```
- **STEP 4B**: Store mappings in memory
<else>
- **STEP 4A**: Log: "No features found - skipping feature mapping"
- **STEP 4B**: Set mappings to empty
</if>

## Phase 5: Generate Structure Specification

- **STEP 5A**: Use mcp__memory__open_nodes to retrieve all observations
- **STEP 5B**: Load template: ".claude/templates/STRUCTURE_TEMPLATE.md"
- **STEP 5C**: Apply DSL template variable substitution:
  - Process platform-specific case blocks
  - Populate component lists with layer assignments
  - Include bidirectional feature-component mappings
  - Populate dependency graph
- **STEP 5D**: Write to: "Documents/Structure/STRUCTURE.md"
- **STEP 5E**: Validate document created successfully

## Phase 6: Create Platform-Specific Documentation

<case {detected_platform}>
<is dotnet>
- **STEP 6A**: Create "Documents/Structure/Projects/" directory
- **STEP 6B**: For each project:
  - Create individual project documentation file
  - List features implemented, dependencies, responsibilities
</is>
<is java>
- **STEP 6A**: Create "Documents/Structure/Modules/" directory
- **STEP 6B**: Document each module
</is>
<is python>
- **STEP 6A**: Create "Documents/Structure/Packages/" directory
- **STEP 6B**: Document each package
</is>
<is typescript>
- **STEP 6A**: Create "Documents/Structure/Packages/" directory
- **STEP 6B**: Document each package/workspace
</is>
</case>

## Phase 7: Update Feature Specifications

<if (features exist AND feature_component_mapping exists)>
- **STEP 7A**: For each feature with component mapping:
  - Use Edit tool to update feature specification
  - Update "Structure Mapping" section with implementing components
  - Ensure consistency between STRUCTURE.md and FEATURE.md
- **STEP 7B**: Validate cross-references are bidirectional
</if>

## Phase 8: Create Memory Relationships

- **STEP 8A**: Create structure-feature relationships in memory:
  <foreach {mapping} in {feature_component_mappings}>
  - Use mcp__memory__create_relations:
    - from: "{mapping.component}"
    - to: "{mapping.feature}"
    - relationType: "implements"
  </foreach>

## Phase 9: Reporting

- **STEP 9A**: Display extraction summary:
  ```
  ✓ STRUCTURE EXTRACTED

  Platform: {detected_platform}
  Architecture: {architecture_style}

  Components Discovered:
  - Domain Layer: {domain_count}
  - Application Layer: {application_count}
  - Infrastructure Layer: {infrastructure_count}
  - UI Layer: {ui_count}

  Feature Mapping:
  - Features Mapped: {mapped_features}/{total_features}
  - Components Mapped: {mapped_components}/{total_components}

  Dependencies:
  - Internal: {internal_dep_count}
  - External: {external_dep_count}
  - Violations: {violation_count}

  Created:
  - Documents/Structure/STRUCTURE.md
  - Documents/Structure/{platform_folder}/ ({count} files)

  Next Steps:
  - Review Documents/Structure/STRUCTURE.md
  - Run /validate-structure to check architectural integrity
  - Complete feature mappings if any are incomplete
  ```

**IMPORTANT NOTES**:
- Analyzes existing codebase to extract technical structure
- Automatically detects platform type (.NET, Java, Python, TypeScript, etc.)
- Creates bidirectional feature-component traceability
- Documents layer architecture and dependencies
- Identifies architectural violations
- Updates feature specifications with structure references
