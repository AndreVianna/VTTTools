# {target_item_name} - Implementation Roadmap

**Target Type**: {roadmap_type}
**Target Item**: {target_item_name}
**Item Specification**: {specification_path}
**Created**: {created_date}
**Last Updated**: {last_updated}
**Version**: {roadmap_version}

---

## Roadmap Overview

**Objective**: {roadmap_objective}

**Scope**: {roadmap_scope}

**Total Phases**: {phase_count}
**Estimated Complexity**: {overall_complexity}

**Deliverables**:
<foreach {deliverable} in {roadmap_deliverables}>
- {deliverable.description}
</foreach>

<examples>
**Objective**: Implement complete UserManagement feature with all 5 use cases and UI components

**Scope**: Implement domain entities, application services, API endpoints, and React UI for user management

**Total Phases**: 4
**Estimated Complexity**: High

**Deliverables**:
- User domain model (Entity, Value Objects)
- 5 use case implementations (Login, Register, UpdateProfile, ChangePassword, DeleteAccount)
- REST API endpoints for all operations
- React UI components (login page, registration, profile editor)
- BDD test coverage (15+ scenarios)
</examples>

---

<case {roadmap_type}>
<is feature>
## Feature Context

**Feature**: {target_item_name}
**Area**: {feature_area}
**Use Cases**: {use_case_count}
**Components Affected**: {component_count}

**Use Cases to Implement**:
<foreach {usecase} in {use_cases_to_implement}>
- {usecase.name} (UI Type: {usecase.ui_type}, Complexity: {usecase.complexity})
</foreach>

**Components Affected**:
<foreach {component} in {affected_components}>
- {component.name} ({component.layer}): {component.change_type}
</foreach>
</is>

<is use-case>
## Use Case Context

**Use Case**: {target_item_name}
**Parent Feature**: {parent_feature}
**Owning Area**: {owning_area}
**UI Type**: {ui_type}

**Layers to Implement**:
- Domain: {domain_entities_involved}
- Application: {application_service_name}
- Infrastructure: {infrastructure_needs}
- UI: {ui_components_needed}

**Structure Components**:
<foreach {component} in {structure_components}>
- {component.name} ({component.layer}): {component.role}
</foreach>
</is>

<is task>
## Task Context

**Task ID**: {target_item_name}
**Task Type**: {task_type}
**Priority**: {task_priority}

**Cross-References**:
- Features: {affected_features}
- Use Cases: {affected_use_cases}
- Components: {affected_components}
- Domain Areas: {affected_domain_areas}

**Scope**:
{task_scope_description}
</is>

<is domain>
## Domain Context

**Domain Area**: {target_item_name}
**Bounded Context**: {bounded_context_name}

**Domain Model to Implement**:
- Entities: {entity_count} ({entity_names})
- Value Objects: {value_object_count} ({vo_names})
- Domain Services: {service_count} ({service_names})
- Aggregates: {aggregate_count}

**Features Using This Domain**:
<foreach {feature} in {features_using_domain}>
- {feature.name}
</foreach>
</is>
</case>

---

## Implementation Phases

<foreach {phase} in {implementation_phases}>
### Phase {phase.number}: {phase.name}

**Objective**: {phase.objective}

**Deliverables**:
<foreach {deliverable} in {phase.deliverables}>
- {deliverable.type}: {deliverable.name}
  - Description: {deliverable.description}
  - Complexity: {deliverable.complexity}
  - Dependencies: {deliverable.dependencies}
</foreach>

**Implementation Sequence**:
<foreach {item} in {phase.implementation_sequence}>
{item.order}. **{item.name}** ({item.type})
- Command: {item.command_to_run}
- Estimated Effort: {item.effort}
- Dependencies: {item.dependencies}
</foreach>

**Success Criteria**:
<foreach {criterion} in {phase.success_criteria}>
- {criterion.description}
</foreach>

**Dependencies**:
- **Prerequisites**: {phase.prerequisites}
- **Blocks**: {phase.blocks_what}

**Validation**:
- Validate after phase: {phase.validation_command}
- Quality gate: {phase.quality_gate_criteria}

---

</foreach>

<examples>
### Phase 1: Domain Foundation

**Objective**: Implement core domain entities and business logic for task management

**Deliverables**:
- Entity: Task
  - Description: Core Task aggregate with business invariants
  - Complexity: Medium
  - Dependencies: Priority value object
- Value Object: Priority
  - Description: Priority levels with validation and ordering
  - Complexity: Low
  - Dependencies: None
- Domain Service: TaskValidator
  - Description: Cross-entity validation rules
  - Complexity: Low
  - Dependencies: Task entity

**Implementation Sequence**:
1. **Priority Value Object** (Domain)
   - Command: /implementation:implement-domain TaskManagement
   - Estimated Effort: 2-3 hours
   - Dependencies: None
2. **Task Entity** (Domain)
   - Command: /implementation:implement-domain TaskManagement
   - Estimated Effort: 4-5 hours
   - Dependencies: Priority VO
3. **TaskValidator Service** (Domain)
   - Command: /implementation:implement-domain TaskManagement
   - Estimated Effort: 2 hours
   - Dependencies: Task entity

**Success Criteria**:
- All entities have unit tests with 80%+ coverage
- Business rules enforced via domain invariants
- Domain events published for state changes

**Dependencies**:
- **Prerequisites**: None (foundation phase)
- **Blocks**: Phase 2 (Application layer needs domain)

**Validation**:
- Validate after phase: /quality:test-unit Domain.TaskManagement
- Quality gate: All tests passing, no architecture violations
</examples>

---

## Dependency Graph

```
{dependency_diagram}
```

**Critical Path**:
<foreach {item} in {critical_path_items}>
- {item.phase}: {item.name} (blocks {item.blocks_count} subsequent items)
</foreach>

<examples>
**Critical Path**:
- Phase 1: Task Entity (blocks 8 subsequent items)
- Phase 2: CreateTask Use Case (blocks Phase 3 API)
- Phase 3: Task API Endpoint (blocks Phase 4 UI)
</examples>

---

## Cross-Reference Traceability

<case {roadmap_type}>
<is feature>
**Feature → Use Cases → Components**:
<foreach {usecase} in {use_cases}>
- {usecase.name} → {usecase.components}
</foreach>
</is>

<is use-case>
**Use Case → Components → Domain Models**:
<foreach {component} in {components}>
- {component.name} ({component.layer}) → Uses: {component.domain_entities}
</foreach>
</is>

<is task>
**Task → Features → Components**:
- Affected Features: {affected_features}
- Affected Components: {affected_components}
- Implementation Order: {orchestration_sequence}
</is>

<is domain>
**Domain → Features → Use Cases**:
<foreach {entity} in {entities}>
- {entity.name} → Used by features: {entity.used_by_features}
</foreach>
</is>
</case>

---

## Risk Assessment

<foreach {risk} in {implementation_risks}>
### Risk: {risk.title}
- **Phase**: {risk.phase_number}
- **Probability**: {risk.probability}
- **Impact**: {risk.impact}
- **Mitigation**: {risk.mitigation_strategy}
- **Contingency**: {risk.contingency_plan}
</foreach>

<examples>
### Risk: Domain model complexity may exceed estimates
- **Phase**: 1
- **Probability**: Medium
- **Impact**: High (delays all subsequent phases)
- **Mitigation**: Start with simplest entities, add complexity incrementally
- **Contingency**: Split Phase 1 into sub-phases if needed
</examples>

---

## Quality Gates

<foreach {gate} in {quality_gates}>
### Gate {gate.phase}: {gate.name}
- **Trigger**: After Phase {gate.phase_number}
- **Criteria**:
  <foreach {criterion} in {gate.criteria}>
  - {criterion.description} (threshold: {criterion.threshold})
  </foreach>
- **Validation Command**: {gate.validation_command}
- **Action if Failed**: {gate.failure_action}
</foreach>

<examples>
### Gate 1: Domain Model Complete
- **Trigger**: After Phase 1
- **Criteria**:
  - All entities have unit tests (threshold: 80%+ coverage)
  - No architecture violations (threshold: 0 violations)
  - Domain events defined (threshold: 1+ event per entity)
- **Validation Command**: /quality:test-unit Domain.TaskManagement
- **Action if Failed**: Fix issues before proceeding to Phase 2
</examples>

---

## Progress Tracking

**Current Phase**: {current_phase_number}
**Overall Progress**: {completed_items}/{total_items} ({progress_percent}%)

<foreach {phase} in {implementation_phases}>
**Phase {phase.number}**: {phase.status}
- Completed: {phase.completed_items}/{phase.total_items}
- In Progress: {phase.in_progress_items}
- Remaining: {phase.remaining_items}
</foreach>

---

## Change Log
<foreach {change} in {roadmap_change_log}>
- **{change.date}**: {change.description}
</foreach>

<examples>
- **2025-03-14**: Roadmap generated from feature specification
- **2025-03-16**: Phase 1 completed, updated progress
- **2025-03-20**: Risk assessment updated after Phase 2 delay
</examples>

---

<!--
═══════════════════════════════════════════════════════════════
ROADMAP QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════

## Scope & Objectives (15 points)
□ 5pts: Clear roadmap objective stated
□ 5pts: Scope well-defined with boundaries
□ 5pts: Deliverables list complete

## Phase Organization (25 points)
□ 10pts: Logical phase breakdown (3-5 phases)
□ 10pts: Items properly sequenced by dependencies
□ 5pts: Each phase has clear objective

## Dependency Management (20 points)
□ 10pts: All dependencies identified
□ 5pts: Critical path documented
□ 5pts: Blocking relationships clear

## Quality Gates (15 points)
□ 10pts: Quality gate after each phase
□ 5pts: Validation commands specified

## Implementation Details (15 points)
□ 5pts: Commands to run documented
□ 5pts: Success criteria per phase
□ 5pts: Complexity estimates provided

## Risk Assessment (10 points)
□ 5pts: Risks identified with mitigation
□ 5pts: Contingency plans documented

## Target Score: 80/100 minimum

### Common Issues to Avoid:
❌ Phases not dependency-ordered
❌ Missing quality gates
❌ No critical path identified
❌ Unclear success criteria
❌ No risk assessment
❌ Commands not specified
-->
