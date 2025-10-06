---
allowed-tools: [mcp__memory__search_nodes, mcp__memory__open_nodes, mcp__memory__read_graph, Task, Read, Glob, Grep, Bash]
description: Analyze task impact and show complete dependency graph
argument-hint: {task_id:string}
---

# Show Task Impact Command

Analyzes complete impact of a task across all layers (business, technical, domain). Shows dependency graph, affected specifications, blast radius, and risk assessment.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Phase 0: Validation

- **STEP 0A**: Validate {task_id} is not empty
- **STEP 0B**: Use Read tool to load task: "Documents/Tasks/{task_id}/TASK.md"
  - Abort if not found

## Phase 1: Extract Task Cross-References

- **STEP 1A**: Parse task specification to extract all references:
  - {affected_features} - business layer
  - {affected_use_cases} - use case layer
  - {affected_components} - technical layer
  - {affected_domain_areas} - domain layer
  - {affected_bdd_files} - testing layer
  - {blocking_tasks} - task dependencies
  - {blocked_tasks} - dependent tasks

## Phase 2: Expand Dependency Graph

- **STEP 2A**: For each affected feature:
  - Read feature specification: "Documents/Areas/*/Features/{feature}.md"
  - Extract: use_cases, implementing_components, domain_models
  - Add to impact set

- **STEP 2B**: For each affected component:
  - Read STRUCTURE.md to find component details
  - Extract: dependencies, dependent_components, implemented_features
  - Add to impact set

- **STEP 2C**: For each affected use case:
  - Read use case specification
  - Extract: parent_feature, structure_components, domain_entities
  - Add to impact set

- **STEP 2D**: Build complete dependency graph:
  - Direct references (from task spec)
  - Indirect references (from expanded references)
  - Calculate blast radius

## Phase 3: Analyze Impact

- **STEP 3A**: Use Task tool with solution-engineer agent:
  ```markdown
  ROLE: Impact Analysis Specialist

  TASK: Analyze complete impact of task "{task_id}"

  DIRECT REFERENCES:
  - Features: {affected_features}
  - Components: {affected_components}
  - Use Cases: {affected_use_cases}
  - Domain: {affected_domain_areas}

  EXPANDED REFERENCES (from dependency graph):
  {expanded_impact_set}

  ANALYSIS REQUIRED:
  1. Calculate blast radius (how many total items affected)
  2. Identify high-risk changes (breaking changes, widely-used components)
  3. Find hidden dependencies not in task spec
  4. Estimate downstream impact (what else might break)
  5. Assess risk level (Low/Medium/High/Critical)
  6. Recommend mitigation strategies

  OUTPUT FORMAT:
  BLAST_RADIUS: {total_affected_items}
  RISK_LEVEL: [Low|Medium|High|Critical]
  HIGH_RISK_ITEMS: [list]
  HIDDEN_DEPENDENCIES: [items not in task spec]
  DOWNSTREAM_IMPACT: [what might break]
  MITIGATION_RECOMMENDATIONS: [list]
  ```

- **STEP 3B**: Parse analysis results

## Phase 4: Display Impact Report

- **STEP 4A**: Display comprehensive impact analysis:
  ```
  ═══════════════════════════════════════════════════════════════
  IMPACT ANALYSIS: {task_id}
  ═══════════════════════════════════════════════════════════════

  Task: {task_title}
  Type: {task_type}  |  Priority: {task_priority}  |  Status: {task_status}

  ═══════════════════════════════════════════════════════════════
  BLAST RADIUS
  ═══════════════════════════════════════════════════════════════

  Overall Risk: {risk_level} {risk_icon}

  Total Items Affected: {blast_radius}

  By Layer:
  - Features: {feature_count} direct, {indirect_feature_count} indirect
  - Use Cases: {usecase_count} direct, {indirect_usecase_count} indirect
  - Components: {component_count} direct, {indirect_component_count} indirect
  - Domain Models: {domain_count} direct, {indirect_domain_count} indirect
  - BDD Files: {bdd_count} direct, {indirect_bdd_count} indirect

  ═══════════════════════════════════════════════════════════════
  DIRECT IMPACT (From Task Spec)
  ═══════════════════════════════════════════════════════════════

  🎯 Features:
  <foreach {feature} in {affected_features}>
  - {feature.name} (Area: {feature.area})
    Impact: {feature.impact}
    Use Cases: {feature.affected_use_cases}
  </foreach>

  🔧 Components:
  <foreach {component} in {affected_components}>
  - {component.name} (Layer: {component.layer})
    Change Type: {component.change_type}
    Depends On: {component.dependencies}
    Used By: {component.dependents}
  </foreach>

  📋 Use Cases:
  <foreach {usecase} in {affected_use_cases}>
  - {usecase.name} (Feature: {usecase.feature})
  </foreach>

  🏛️  Domain Areas:
  <foreach {domain} in {affected_domain_areas}>
  - {domain.name}
    Entities: {domain.entities}
  </foreach>

  ═══════════════════════════════════════════════════════════════
  INDIRECT IMPACT (From Dependency Graph)
  ═══════════════════════════════════════════════════════════════

  <if ({hidden_dependencies} not empty)>
  ⚠️  Hidden Dependencies (not in task spec):
  <foreach {hidden} in {hidden_dependencies}>
  - {hidden.type}: {hidden.name}
    Reason: {hidden.dependency_reason}
    Risk: {hidden.risk_level}
  </foreach>
  </if>

  <if ({downstream_impact} not empty)>
  ⚠️  Downstream Impact (might break):
  <foreach {downstream} in {downstream_impact}>
  - {downstream.type}: {downstream.name}
    Reason: {downstream.impact_reason}
    Mitigation: {downstream.mitigation}
  </foreach>
  </if>

  ═══════════════════════════════════════════════════════════════
  DEPENDENCY CHAIN
  ═══════════════════════════════════════════════════════════════

  Task Dependencies:
  <if ({blocking_tasks} not empty)>
  Blocked By:
  <foreach {blocker} in {blocking_tasks}>
  - {blocker.task_id}: {blocker.title} ({blocker.status})
  </foreach>
  </if>

  <if ({blocked_tasks} not empty)>
  Blocks:
  <foreach {blocked} in {blocked_tasks}>
  - {blocked.task_id}: {blocked.title} ({blocked.status})
  </foreach>
  </if>

  ═══════════════════════════════════════════════════════════════
  RISK ASSESSMENT
  ═══════════════════════════════════════════════════════════════

  Overall Risk: {risk_level}

  High-Risk Items:
  <foreach {risk} in {high_risk_items}>
  - {risk.name}: {risk.reason}
    Mitigation: {risk.mitigation}
  </foreach>

  Recommended Actions:
  <foreach {recommendation} in {mitigation_recommendations}>
  - {recommendation.description}
  </foreach>

  ═══════════════════════════════════════════════════════════════
  AFFECTED FILES
  ═══════════════════════════════════════════════════════════════

  Specifications:
  <foreach {feature} in {all_affected_features}>
  - Documents/Areas/{feature.area}/Features/{feature.name}.md
  </foreach>

  <foreach {usecase} in {all_affected_use_cases}>
  - Documents/Areas/{usecase.area}/Features/{usecase.feature}/UseCases/{usecase.name}.md
  </foreach>

  <foreach {domain} in {affected_domain_areas}>
  - Documents/Areas/{domain}/Domain/DOMAIN_MODEL.md
  </foreach>

  Structure:
  - Documents/Structure/STRUCTURE.md

  BDD:
  <foreach {bdd} in {affected_bdd_files}>
  - Documents/Areas/**/{bdd.file_name}
  </foreach>

  Task:
  - Documents/Tasks/{task_id}/TASK.md

  Total Files Affected: {total_file_count}

  ═══════════════════════════════════════════════════════════════
  ```

## Phase 5: Visualize Dependency Graph (Optional)

- **STEP 5A**: Generate ASCII dependency graph:
  ```
  DEPENDENCY GRAPH FOR {task_id}

  {task_id}
  │
  ├─ Features
  │  ├─ {feature1}
  │  │  └─ Use Cases: {usecase1}, {usecase2}
  │  └─ {feature2}
  │
  ├─ Components
  │  ├─ {component1} (Layer: {layer})
  │  │  ├─ Depends on: {dep1}, {dep2}
  │  │  └─ Used by: {dependent1}
  │  └─ {component2}
  │
  └─ Domain
     └─ {domain_area1}
        └─ Entities: {entity1}, {entity2}
  ```

## Phase 6: Recommendations

- **STEP 6A**: Provide actionable recommendations:
  ```
  RECOMMENDATIONS:

  Before Implementation:
  <foreach {recommendation} in {pre_implementation_recommendations}>
  - {recommendation.description}
  </foreach>

  During Implementation:
  <foreach {recommendation} in {during_implementation_recommendations}>
  - {recommendation.description}
  </foreach>

  Testing Requirements:
  <foreach {test} in {testing_recommendations}>
  - {test.description}
  </foreach>

  Next Steps:
  - Review impact report
  - Validate cross-references are complete: /validate-task {task_id}
  - If ready: /implement-task {task_id}
  - If too risky: Break task into smaller tasks
  ```

**IMPORTANT NOTES**:
- Analyzes complete task impact across all layers
- Shows both direct and indirect (hidden) dependencies
- Calculates blast radius (total affected items)
- Identifies high-risk changes
- Recommends mitigation strategies
- Visualizes dependency graph
- Helps decide if task should be broken down
- Critical for understanding change impact before implementation
