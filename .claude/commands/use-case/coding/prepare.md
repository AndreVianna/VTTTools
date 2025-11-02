---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, Write, Edit, Glob, Bash
description: Generate implementation roadmap for feature, use case, task, or domain
argument-hint: {item_type:string} {item_name:string}
---

# Generate Roadmap Command

Create context-aware implementation roadmap by analyzing item specifications and generating dependency-based phase sequencing.

## Actions

1. **Validate inputs and locate item specification**:
   - Verify {item_type} is supported: feature, use-case, task, domain
   - Verify {item_name} is not empty
   - Locate specification based on item type:
     - feature: Glob "Documents/Areas/*/Features/{item_name}.md"
     - use-case: Glob "Documents/Areas/*/Features/*/UseCases/{item_name}.md"
     - task: Read "Documents/Tasks/{item_name}/TASK.md"
     - domain: Glob "Documents/Areas/{item_name}/Domain/DOMAIN_MODEL.md"
   - If not found: abort with "Run /add-{type} or /create-{type} first."
   - Validate ROADMAP_TEMPLATE.md exists

2. **Extract implementation scope**:
   - Read item specification completely
   - If SOLUTION.md exists: read for architecture context
   - If STRUCTURE.md exists: read for component context
   - Use Task tool with solution-engineer agent:
     ```markdown
     ROLE: Roadmap Scope Analyst

     Extract implementation scope from {item_type} specification for MAM Modules.

     ITEM: {item_name}
     SPECIFICATION: {specification_content}
     SOLUTION CONTEXT: {solution_architecture}
     STRUCTURE CONTEXT: {structure_components}

     SCOPE EXTRACTION (by type):
     - feature: use cases to implement, components affected, domain entities, UI components, complexity
       - Group by: dependency order, layer, complexity
     - use-case: structure components, domain entities, layers (domain/application/infrastructure/UI), BDD scenarios
       - Group by layer: Phase 1 Domain, Phase 2 Application, Phase 3 Infrastructure, Phase 4 UI
     - task: affected features, use cases, components, domain areas, implementation strategy
       - Work order: domain changes, use case implementations, component modifications, BDD updates
     - domain: entities, value objects, domain services, aggregates, features using this domain
       - Group by dependencies: independent entities, VOs, entities with relationships, aggregates, domain services

     OUTPUT:
     items_to_implement: [list with types, names, dependencies]
     suggested_phase_count: [3-5]
     complexity_estimate: [Low|Medium|High|Very High]
     critical_path_items: [items that block others]
     ```
   - Parse extracted scope and store in memory

3. **Analyze dependencies and create phase sequencing**:
   - Use Task tool with solution-engineer agent:
     ```markdown
     ROLE: Dependency Analysis Specialist

     Analyze implementation dependencies for MAM Modules and determine optimal sequencing.

     ITEMS: {items_to_implement}

     ANALYSIS:
     1. Build dependency graph (what depends on what)
     2. Identify critical path (items blocking most others)
     3. Group into logical phases (3-5 phases)
     4. Sequence within phases by complexity (simple first)
     5. Identify risks and quality gates

     DEPENDENCY RULES (Clean Architecture + OSGi):
     - Domain entities before application services
     - Application services before infrastructure DAOs
     - Infrastructure before UI
     - Simple use cases before complex ones
     - Foundation features before dependent features
     - Entities before aggregates

     OUTPUT:
     dependency_graph: [graph representation]
     critical_path: [ordered list]
     suggested_phases: [
       {phase: 1, name: "...", items: [...], objective: "..."}
     ]
     quality_gates: [gates per phase]
     implementation_risks: [risks identified]
     ```
   - Parse dependency analysis results

4. **Generate roadmap specification**:
   - Create roadmap memory entity: name="{item_type}_{item_name}_roadmap", entityType="roadmap"
   - Store roadmap variables: roadmap_type, target_item_name, implementation_phases[], dependency_graph, critical_path, quality_gates[], risks[]
   - Load ROADMAP_TEMPLATE.md
   - Apply DSL variable substitution (type-specific case blocks, foreach loops for phases)
   - Determine roadmap location based on item type:
     - feature: Same directory as feature spec, filename "ROADMAP.md"
     - use-case: Same directory as use case spec, filename "ROADMAP.md"
     - task: "Documents/Tasks/{item_name}/ROADMAP.md"
     - domain: "Documents/Areas/{item_name}/Domain/ROADMAP.md"
   - Write roadmap specification

5. **Create cross-references and update item specification**:
   - Create roadmap-item relationship: from="{item_type}_{item_name}_roadmap", to="{item_name}", relationType="implementation_plan_for"
   - Create roadmap-component relationships (if applicable)
   - Update source specification with roadmap reference (use Edit tool if not already present)

**Reporting**:
```
✓ ROADMAP GENERATED: {item_type} {item_name}

Type: {roadmap_type}
Phases: {phase_count}
Total Items: {total_items_to_implement}
Complexity: {overall_complexity}

Phases:
{foreach phase: - Phase {number}: {name} ({item_count} items)}

Critical Path:
{foreach item: - {name} (blocks {blocks_count} items)}

Created: {roadmap_path}

Next Steps:
- Review: {roadmap_path}
- Validate: /validation:validate-roadmap {item_type} {item_name}
- Implement: /implementation:implement-roadmap {item_type} {item_name}
- Track: /solution-status
```

**NOTES**:
- Context-aware roadmap generation tied to specific items
- Automatic dependency analysis and phase sequencing
- Type-specific logic (feature, use-case, task, domain)
- Roadmap stored alongside item specification
- Ready for /implement-roadmap execution
