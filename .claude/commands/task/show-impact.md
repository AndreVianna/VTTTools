---
allowed-tools: [mcp__memory__search_nodes, mcp__memory__open_nodes, mcp__memory__read_graph, Task, Read, Glob, Grep, Bash]
description: Analyze task impact and show complete dependency graph
argument-hint: {task_id:string}
---

# Show Task Impact Command

Analyzes complete impact of a task across all layers (business, technical, domain). Shows dependency graph, affected specifications, blast radius, and risk assessment.

**Platform**: Cross-platform (Windows/Linux/macOS)
**Reference**: See @Documents/Guides/IMPLEMENTATION_GUIDE.md for workflow context

## 1. Validation & Extraction

**STEP 1A**: Validate {task_id} and load task: "Documents/Tasks/{task_id}/TASK.md"
- Abort if not found

**STEP 1B**: Parse task specification to extract: {affected_features}, {affected_use_cases}, {affected_components}, {affected_domain_areas}, {affected_bdd_files}, {blocking_tasks}, {blocked_tasks}

## 2. Dependency Analysis

**STEP 2A**: Read specifications and extract dependencies (Features → use_cases/components/domain; Components → dependencies/dependents from STRUCTURE.md; Use Cases → parent_feature/components/entities)

**STEP 2B**: Build dependency graph (direct + indirect), calculate blast radius

**STEP 2C**: Use Task tool with solution-engineer agent to analyze: blast radius, risk level, high-risk items, hidden dependencies, downstream impact, mitigation recommendations

## 3. Display Impact Report

**STEP 3A**: Display comprehensive impact analysis:
```
## IMPACT ANALYSIS: {task_id}
────────────────────────────────────────────────────
Task: {task_title} | Type: {task_type} | Priority: {task_priority} | Status: {task_status}

BLAST RADIUS - Risk: {risk_level} {risk_icon} | Total Affected: {blast_radius}
────────────────────────────────────────────────────
Features: {feature_count} direct, {indirect_feature_count} indirect
Use Cases: {usecase_count} direct, {indirect_usecase_count} indirect
Components: {component_count} direct, {indirect_component_count} indirect
Domain: {domain_count} direct, {indirect_domain_count} indirect
BDD: {bdd_count} direct, {indirect_bdd_count} indirect

DIRECT IMPACT
────────────────────────────────────────────────────
🎯 Features: <foreach {feature} in {affected_features}>- {feature.name} ({feature.area}) | {feature.impact} | Use Cases: {feature.affected_use_cases}</foreach>
🔧 Components: <foreach {component} in {affected_components}>- {component.name} ({component.layer}) | {component.change_type} | Deps: {component.dependencies} | Used By: {component.dependents}</foreach>
📋 Use Cases: <foreach {usecase} in {affected_use_cases}>- {usecase.name} ({usecase.feature})</foreach>
🏛️  Domain: <foreach {domain} in {affected_domain_areas}>- {domain.name} | Entities: {domain.entities}</foreach>

INDIRECT IMPACT
────────────────────────────────────────────────────
<if ({hidden_dependencies} not empty)>⚠️  Hidden Dependencies: <foreach {hidden} in {hidden_dependencies}>- {hidden.type}: {hidden.name} | {hidden.dependency_reason} | Risk: {hidden.risk_level}</foreach></if>
<if ({downstream_impact} not empty)>⚠️  Downstream Impact: <foreach {downstream} in {downstream_impact}>- {downstream.type}: {downstream.name} | {downstream.impact_reason} | Mitigation: {downstream.mitigation}</foreach></if>

DEPENDENCIES
────────────────────────────────────────────────────
<if ({blocking_tasks} not empty)>Blocked By: <foreach {blocker} in {blocking_tasks}>- {blocker.task_id}: {blocker.title} ({blocker.status})</foreach></if>
<if ({blocked_tasks} not empty)>Blocks: <foreach {blocked} in {blocked_tasks}>- {blocked.task_id}: {blocked.title} ({blocked.status})</foreach></if>

RISK ASSESSMENT - {risk_level}
────────────────────────────────────────────────────
High-Risk Items: <foreach {risk} in {high_risk_items}>- {risk.name}: {risk.reason} | Mitigation: {risk.mitigation}</foreach>
Recommendations: <foreach {recommendation} in {mitigation_recommendations}>- {recommendation.description}</foreach>

AFFECTED FILES ({total_file_count})
────────────────────────────────────────────────────
<foreach {feature} in {all_affected_features}>- Documents/Areas/{feature.area}/Features/{feature.name}.md</foreach>
<foreach {usecase} in {all_affected_use_cases}>- Documents/Areas/{usecase.area}/Features/{usecase.feature}/UseCases/{usecase.name}.md</foreach>
<foreach {domain} in {affected_domain_areas}>- Documents/Areas/{domain}/Domain/DOMAIN_MODEL.md</foreach>
- Documents/Structure/STRUCTURE.md
<foreach {bdd} in {affected_bdd_files}>- Documents/Areas/**/{bdd.file_name}</foreach>
- Documents/Tasks/{task_id}/TASK.md

DEPENDENCY GRAPH
────────────────────────────────────────────────────
{task_id}
├─ Features: <foreach {feature} in {affected_features}>{feature} ({usecases})</foreach>
├─ Components: <foreach {component} in {affected_components}>{component} ({layer}) → {deps} | {dependents}</foreach>
└─ Domain: <foreach {domain} in {affected_domain_areas}>{domain} ({entities})</foreach>

NEXT STEPS
────────────────────────────────────────────────────
Before: <foreach {rec} in {pre_implementation_recommendations}>- {rec.description}</foreach>
During: <foreach {rec} in {during_implementation_recommendations}>- {rec.description}</foreach>
Testing: <foreach {test} in {testing_recommendations}>- {test.description}</foreach>

Actions:
- Review impact report
- Validate: /validation:validate-task {task_id}
- Implement: /implementation:implement-task {task_id}
- If high-risk: Break into smaller tasks
────────────────────────────────────────────────────
```

## Quick Reference

- **Architecture**: `Documents/Guides/ARCHITECTURE_PATTERN.md`
- **Implementation Guide**: `Documents/Guides/IMPLEMENTATION_GUIDE.md`
- **Templates**: `.claude/templates/TASK_TEMPLATE.md`
- **Related**: `/validation:validate-task`, `/implementation:implement-task`, `/task:list-tasks`

**CRITICAL**: Complete impact analysis prevents breaking changes. Use before implementation to assess risk and plan mitigation strategies.
