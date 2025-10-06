# {task_id}: {task_title}

**Type**: {task_type}
**Status**: {task_status}
**Priority**: {task_priority}
**Effort**: {effort_estimate}
**Created**: {created_date}
**Last Updated**: {last_updated}

---

## Description

{task_description}

---

## Cross-References

### Business Layer (Features)
<foreach {feature} in {affected_features}>
- **{feature.name}** (Area: {feature.area})
  - Impact: {feature.impact_description}
  - Use Cases Affected: {feature.affected_use_cases}
</foreach>
<examples>
- **TaskManagement** (Area: TaskManagement)
  - Impact: Adds priority filtering capability to task management
  - Use Cases Affected: CreateTask, UpdateTask, ViewTasksByPriority
- **UserInterface** (Area: UserInterface)
  - Impact: New UI components for priority selection and filtering
  - Use Cases Affected: ViewTasksByPriority
</examples>

<if ({affected_features} is empty)>
- None - This task doesn't directly affect business features
</if>

### Technical Layer (Structure)
<foreach {component} in {affected_components}>
- **{component.name}** ({component.type}, Layer: {component.layer})
  - Changes Required: {component.change_description}
  - Estimated Impact: {component.impact_level}
</foreach>
<examples>
- **VttTools.Domain** (Project, Layer: Domain)
  - Changes Required: Add Priority value object with validation logic
  - Estimated Impact: Medium - new value object, affects Task entity
- **VttTools.Application.Features.Tasks** (Project, Layer: Application)
  - Changes Required: Add SetTaskPriority use case handler
  - Estimated Impact: Low - new handler following existing patterns
- **VttTools.UI.Web.Components** (Project, Layer: UI)
  - Changes Required: Add PrioritySelector and TaskPriorityFilter components
  - Estimated Impact: Medium - 2 new React components
</examples>

<if ({affected_components} is empty)>
- None - This task doesn't modify technical structure
</if>

### Domain Layer (Models)
<foreach {domain} in {affected_domain_areas}>
- **{domain.area_name}**
  - Entities Affected: {domain.entities}
  - Value Objects Affected: {domain.value_objects}
  - Change Type: {domain.change_type}
</foreach>

<if ({affected_domain_areas} is empty)>
- None - This task doesn't affect domain models
</if>

### Testing Layer (BDD)
<foreach {bdd} in {affected_bdd_files}>
- **{bdd.file_name}**
  - Scenarios to Update: {bdd.scenarios}
  - New Scenarios Needed: {bdd.new_scenarios}
</foreach>

<if ({affected_bdd_files} is empty)>
- None - No BDD files require updates
</if>

---

## Objectives

### Primary Objective
{primary_objective}

### Success Criteria
<foreach {criterion} in {success_criteria}>
- {criterion.id}: {criterion.description}
  - Measurement: {criterion.measurement}
  - Target: {criterion.target}
</foreach>

---

## Technical Approach

### Implementation Strategy
{implementation_strategy}

### Key Steps
<foreach {step} in {implementation_steps}>
{step.sequence}. **{step.title}**
   - Action: {step.action}
   - Component: {step.component}
   - Estimated Time: {step.time_estimate}
</foreach>

### Technical Considerations
<foreach {consideration} in {technical_considerations}>
- **{consideration.category}**: {consideration.description}
</foreach>

---

## Dependencies

### Blocking Tasks
<foreach {blocker} in {blocking_tasks}>
- **{blocker.task_id}**: {blocker.title}
  - Status: {blocker.status}
  - Reason: {blocker.blocking_reason}
</foreach>

<if ({blocking_tasks} is empty)>
- None - No blocking dependencies
</if>

### Blocked Tasks
<foreach {blocked} in {blocked_tasks}>
- **{blocked.task_id}**: {blocked.title}
  - Waiting on: {blocked.waiting_reason}
</foreach>

<if ({blocked_tasks} is empty)>
- None - No tasks waiting on this
</if>

### External Dependencies
<foreach {external} in {external_dependencies}>
- **{external.name}**: {external.description}
  - Status: {external.status}
  - Impact: {external.impact}
</foreach>

---

## Acceptance Criteria

<foreach {ac} in {acceptance_criteria}>
### AC-{ac.number}: {ac.title}
**Given**: {ac.given}
**When**: {ac.when}
**Then**: {ac.then}

**Verification Method**: {ac.verification_method}
**Status**: {ac.status}
</foreach>

---

## Testing Requirements

### Unit Tests
- **Coverage Target**: {unit_test_coverage_target}%
- **Key Scenarios**: {unit_test_scenarios}
- **Components to Test**: {unit_test_components}

### Integration Tests
- **Scenarios**: {integration_test_scenarios}
- **Systems Involved**: {integration_test_systems}

### BDD Tests
- **Feature Files to Update**: {bdd_files_to_update}
- **New Scenarios Needed**: {new_bdd_scenarios}

---

## Risk Assessment

<foreach {risk} in {risks}>
### Risk: {risk.title}
- **Probability**: {risk.probability}
- **Impact**: {risk.impact}
- **Mitigation**: {risk.mitigation}
- **Contingency**: {risk.contingency}
</foreach>

---

## Implementation Notes

### Design Decisions
<foreach {decision} in {design_decisions}>
- **{decision.title}**
  - Decision: {decision.choice}
  - Rationale: {decision.rationale}
  - Alternatives Considered: {decision.alternatives}
</foreach>

### Code Locations
<foreach {location} in {code_locations}>
- **{location.component}**: `{location.file_path}`
  - Lines: {location.line_range}
  - Change Type: {location.change_type}
</foreach>

### Configuration Changes
<foreach {config} in {configuration_changes}>
- **{config.file}**
  - Setting: {config.setting_name}
  - Old Value: {config.old_value}
  - New Value: {config.new_value}
  - Reason: {config.reason}
</foreach>

---

## Sprint Planning

**Sprint**: {sprint_name}
**Sprint Goal Alignment**: {sprint_goal_alignment}
**Story Points**: {story_points}
**Assigned To**: {assigned_to}

### Time Breakdown
- **Analysis**: {analysis_time}
- **Implementation**: {implementation_time}
- **Testing**: {testing_time}
- **Review**: {review_time}
- **Total**: {total_time}

---

## Progress Tracking

### Completion Status
- **Analysis**: {analysis_status} ({analysis_percent}%)
- **Implementation**: {implementation_status} ({implementation_percent}%)
- **Testing**: {testing_status} ({testing_percent}%)
- **Review**: {review_status} ({review_percent}%)
- **Overall**: {overall_percent}%

### Activity Log
<foreach {activity} in {activity_log}>
- **{activity.date}** ({activity.user}): {activity.description}
</foreach>

---

## Related Documentation

- **Feature Specifications**: <foreach {feature} in {affected_features}>{feature.spec_path}</foreach>
- **Use Case Specifications**: <foreach {uc} in {affected_use_cases}>{uc.spec_path}</foreach>
- **Domain Models**: <foreach {domain} in {affected_domain_areas}>{domain.spec_path}</foreach>
- **Structure Documentation**: Documents/Structure/STRUCTURE.md
- **BDD Files**: <foreach {bdd} in {affected_bdd_files}>{bdd.file_path}</foreach>

---

## Change Log
<foreach {change} in {task_change_log}>
- **{change.date}**: {change.description} (by {change.user})
</foreach>

---

<!--
═══════════════════════════════════════════════════════════════
TASK SPECIFICATION QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════

## Task Identity & Scope (15 points)
□ 5pts: Task type clearly specified (feature/bug/refactor/tech-debt/infrastructure)
□ 5pts: Clear, actionable title and description
□ 5pts: Priority and effort estimate provided

## Cross-References (35 points) - CRITICAL FOR TRACEABILITY
□ 10pts: All affected features documented with impact
□ 10pts: All affected structure components documented
□ 10pts: Affected domain areas/models documented
□ 5pts: Affected BDD files identified

## Success Criteria (15 points)
□ 10pts: Clear, measurable success criteria (3+ criteria)
□ 5pts: Acceptance criteria in Given/When/Then format

## Implementation Plan (20 points)
□ 10pts: Technical approach documented
□ 5pts: Implementation steps with time estimates
□ 5pts: Dependencies identified (blocking and blocked)

## Quality & Testing (15 points)
□ 5pts: Testing requirements specified
□ 5pts: Risk assessment completed
□ 5pts: Code locations identified

## Target Score: 80/100 minimum

### Common Issues to Avoid:
❌ Missing cross-references (features, components, domain)
❌ Vague success criteria (not measurable)
❌ No acceptance criteria
❌ Missing dependencies
❌ No testing requirements
❌ Incomplete risk assessment
-->
