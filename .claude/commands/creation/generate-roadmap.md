---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Generate implementation roadmap for feature, use case, task, or domain
argument-hint: {item_type:string} {item_name:string}
---

# Generate Roadmap Command

Creates context-aware implementation roadmap by analyzing item specifications and generating dependency-based phase sequencing. Supports features, use cases, tasks, and domains.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Quick Reference
- **Stack Guide**: Documents/Guides/VTTTOOLS_STACK.md
- **Template**: .claude/templates/ROADMAP_TEMPLATE.md

## Process

### Step 0: Validation & Context Discovery

- **STEP 0A**: Validate {item_type}:
  - Supported: feature, use-case, task, domain
  - Abort if invalid with list of valid types
- **STEP 0B**: Validate {item_name} is not empty
- **STEP 0C**: Locate item specification:
  <case {item_type}>
  <is feature>
  - Use Glob: "Documents/Areas/*/Features/{item_name}.md"
  - Abort if not found: "Feature not found. Run /add-feature first."
  </is>
  <is use-case>
    - Use Glob: "Documents/Areas/*/Features/*/UseCases/{item_name}.md"
    - Abort if not found: "Use case not found. Run /add-use-case first."
  </is>
  <is task>
    - Use Read: "Documents/Tasks/{item_name}/TASK.md"
    - Abort if not found: "Task not found. Run /create-task first."
  </is>
  <is domain>
    - Use Glob: "Documents/Areas/{item_name}/Domain/DOMAIN_MODEL.md"
    - Abort if not found: "Domain model not found. Run /model-domain first."
  </is>
  </case>
  - Set {specification_path} = found path
- **STEP 0D**: Validate ROADMAP_TEMPLATE.md exists - abort if missing

### Step 1: Extract Scope from Specification

- **STEP 1A**: Read item specification completely
- **STEP 1B**: Load context specifications:
  <if (SOLUTION.md exists)>
  - Read solution specification for architecture context
  </if>
  <if (STRUCTURE.md exists)>
  - Read structure specification for component context
  </if>

- **STEP 1C**: Use Task tool with solution-engineer agent to extract roadmap scope:
  ```markdown
  ROLE: Roadmap Scope Analyst

  TASK: Extract implementation scope from {item_type} specification

  ITEM TYPE: {item_type}
  ITEM NAME: {item_name}
  SPECIFICATION: {specification_content}
  SOLUTION CONTEXT: {solution_architecture}
  STRUCTURE CONTEXT: {structure_components}

  SCOPE EXTRACTION BY TYPE:

  <case {item_type}>
  <is feature>
  EXTRACT:
  - Use cases to implement (list all from feature spec)
  - Components affected (from Structure Mapping section)
  - Domain entities needed (from use case specs)
  - UI components needed (from use case UI types)
  - Total complexity: sum of use case complexities

  GROUP USE CASES BY:
  - Dependency order (which use cases depend on others)
  - Layer (domain-first, then application, then UI)
  - Complexity (simple first, complex later)
  </is>

  <is use-case>
  EXTRACT:
  - Structure components (from Technical Implementation section)
  - Domain entities used (from spec)
  - Layers to implement (domain, application, infrastructure, UI)
  - UI elements (if UI type not NO_UI)
  - BDD scenarios (from acceptance criteria)

  GROUP BY LAYER:
  - Phase 1: Domain layer (entities, VOs, services)
  - Phase 2: Application layer (use case handler)
  - Phase 3: Infrastructure layer (repositories, adapters)
  - Phase 4: UI layer (components, pages) - if applicable
  </is>

  <is task>
  EXTRACT:
  - Affected features (from task cross-references)
  - Affected use cases (from task cross-references)
  - Affected components (from task cross-references)
  - Affected domain areas (from task cross-references)
  - Implementation strategy (from task spec)

  DETERMINE WORK ORDER:
  - Domain changes first
  - Use case implementations next
  - Structure/component modifications
  - BDD updates last
  </is>

  <is domain>
  EXTRACT:
  - Entities to implement (list from DOMAIN_MODEL.md)
  - Value objects to implement
  - Domain services to implement
  - Aggregates to implement
  - Features that use this domain

  GROUP BY DEPENDENCIES:
  - Independent entities first
  - Value objects next
  - Entities with relationships
  - Aggregates last
  - Domain services last
  </is>
  </case>

  OUTPUT FORMAT:
  items_to_implement: [list with types, names, dependencies]
  suggested_phase_count: [3-5]
  complexity_estimate: [Low|Medium|High|Very High]
  critical_path_items: [items that block others]
  ```

- **STEP 1D**: Parse extracted scope and store in memory

### Step 2: Dependency Analysis

- **STEP 2A**: Use Task tool with solution-engineer agent to analyze dependencies:
  ```markdown
  ROLE: Dependency Analysis Specialist

  TASK: Analyze implementation dependencies and determine optimal sequencing

  ITEMS: {items_to_implement}
  ITEM TYPE: {item_type}

  ANALYSIS REQUIRED:
  1. Build dependency graph (what depends on what)
  2. Identify critical path (items that block most others)
  3. Group items into logical phases (3-5 phases)
  4. Sequence within each phase by complexity (simple first)
  5. Identify risks and quality gates

  DEPENDENCY RULES:
  - Domain entities before application services
  - Application services before infrastructure
  - Infrastructure before UI
  - Simple use cases before complex ones
  - Foundation features before dependent features
  - Entities before aggregates

  OUTPUT FORMAT:
  dependency_graph: [graph representation]
  critical_path: [ordered list]
  suggested_phases: [
    {phase: 1, name: "...", items: [...], objective: "..."}
  ]
  quality_gates: [gates per phase]
  implementation_risks: [risks identified]
  ```

- **STEP 2B**: Parse dependency analysis results

### Step 3: Generate Roadmap Specification

- **STEP 3A**: Create roadmap memory entity:
  - name: "{item_type}_{item_name}_roadmap"
  - entityType: "roadmap"
  - observations: ["target_type: {item_type}", "target_name: {item_name}", "status: planning"]

- **STEP 3B**: Store roadmap variables in memory:
  - roadmap_type, target_item_name, specification_path
  - implementation_phases[], dependency_graph, critical_path
  - quality_gates[], implementation_risks[]
  - roadmap_objective, roadmap_scope, deliverables

- **STEP 3C**: Load template: ".claude/templates/ROADMAP_TEMPLATE.md"
- **STEP 3D**: Apply DSL template variable substitution:
  - Process type-specific case blocks
  - Populate phases with foreach loops
  - Include dependency graph
  - Add quality gates

- **STEP 3E**: Determine roadmap file location:
  <case {item_type}>
  <is feature>
  - Location: Feature directory (same location as feature spec)
  - Parse feature directory from {specification_path}
  - Filename: "ROADMAP.md" (always same name, no prefix)
  - Example: "Documents/Areas/TaskManagement/Features/ROADMAP.md" (if feature is file) OR "Documents/Areas/TaskManagement/Features/PriorityManagement/ROADMAP.md" (if feature is folder)
  </is>
  <is use-case>
    - Location: Use case directory (same location as use case spec)
    - Parse use case directory from {specification_path}
    - Filename: "ROADMAP.md" (always same name, no prefix)
    - Example: "Documents/Areas/.../UseCases/ROADMAP.md" (if use case is file) OR "Documents/Areas/.../UseCases/SetTaskPriority/ROADMAP.md" (if use case is folder)
  </is>
  <is task>
    - Location: Task folder
    - Filename: "ROADMAP.md" (always same name)
    - Path: "Documents/Tasks/{item_name}/ROADMAP.md"
    - Example: "Documents/Tasks/TASK-042/ROADMAP.md"
  </is>
  <is domain>
    - Location: Domain directory
    - Filename: "ROADMAP.md" (always same name, no prefix)
    - Path: "Documents/Areas/{item_name}/Domain/ROADMAP.md"
    - Example: "Documents/Areas/TaskManagement/Domain/ROADMAP.md"
  </is>
  </case>

- **STEP 3F**: Write roadmap specification to calculated path

### Step 4: Create Cross-Reference Relationships

- **STEP 4A**: Create roadmap-item relationship:
  - Use mcp__memory__create_relations:
    - from: "{item_type}_{item_name}_roadmap"
    - to: "{item_name}"
    - relationType: "implementation_plan_for"

- **STEP 4B**: Create roadmap-component relationships (if applicable):
  <foreach {component} in {affected_components}>
  - from: "{item_type}_{item_name}_roadmap"
  - to: "{component.name}"
  - relationType: "will_modify"
  </foreach>

### Step 5: Update Item Specification

- **STEP 5A**: Update source specification with roadmap reference:
  - Read item specification
  - Add note: "Implementation roadmap available: {roadmap_path}"
  - Use Edit tool to add reference (if not already present)

### Step 6: Reporting

- **STEP 6A**: Display roadmap summary:
  ```
  ✓ ROADMAP GENERATED: {item_type} {item_name}

  Type: {roadmap_type}
  Phases: {phase_count}
  Total Items: {total_items_to_implement}
  Complexity: {overall_complexity}

  Phases:
  <foreach {phase} in {phases}>
  - Phase {phase.number}: {phase.name} ({phase.item_count} items)
  </foreach>

  Critical Path:
  <foreach {item} in {critical_path}>
  - {item.name} (blocks {item.blocks_count} items)
  </foreach>

  Created:
  - {roadmap_path}

  Next Steps:
  - Review roadmap: {roadmap_path}
  - Validate quality: /validation:validate-roadmap {item_type} {item_name}
  - When ready: /implementation:implement-roadmap {item_type} {item_name}
  - Track progress: /solution-status
  ```

**IMPORTANT NOTES**:
- Context-aware roadmap generation tied to specific items
- Automatic dependency analysis and phase sequencing
- Type-specific logic (feature, use-case, task, domain)
- Roadmap stored alongside item specification (not standalone)
- Cross-referenced to affected components
- Ready for /implement-roadmap execution
- Supports all workflow types (feature-driven, task-driven, domain-driven)
