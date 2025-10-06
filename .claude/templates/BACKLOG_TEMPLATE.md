# {solution_name} - Product Backlog

**Last Updated**: {last_updated}
**Current Sprint**: {current_sprint}
**Solution Version**: {solution_version}

---

## Backlog Overview

**Total Tasks**: {total_tasks}
**Completed**: {completed_tasks} ({completed_percent}%)
**In Progress**: {in_progress_tasks}
**Planned**: {planned_tasks}
**Blocked**: {blocked_tasks}

---

## By Type

| Type | Total | Completed | In Progress | Planned | Blocked |
|------|-------|-----------|-------------|---------|---------|
| Feature | {feature_total} | {feature_completed} | {feature_in_progress} | {feature_planned} | {feature_blocked} |
| Bug | {bug_total} | {bug_completed} | {bug_in_progress} | {bug_planned} | {bug_blocked} |
| Refactor | {refactor_total} | {refactor_completed} | {refactor_in_progress} | {refactor_planned} | {refactor_blocked} |
| Tech Debt | {tech_debt_total} | {tech_debt_completed} | {tech_debt_in_progress} | {tech_debt_planned} | {tech_debt_blocked} |
| Infrastructure | {infra_total} | {infra_completed} | {infra_in_progress} | {infra_planned} | {infra_blocked} |
| Documentation | {docs_total} | {docs_completed} | {docs_in_progress} | {docs_planned} | {docs_blocked} |

---

## By Priority

| Priority | Total | Completed | Remaining |
|----------|-------|-----------|-----------|
| Critical | {critical_total} | {critical_completed} | {critical_remaining} |
| High | {high_total} | {high_completed} | {high_remaining} |
| Medium | {medium_total} | {medium_completed} | {medium_remaining} |
| Low | {low_total} | {low_completed} | {low_remaining} |

---

## Sprint Organization

<foreach {sprint} in {sprints}>
### Sprint {sprint.number}: {sprint.name}
**Dates**: {sprint.start_date} → {sprint.end_date}
**Goal**: {sprint.goal}
**Status**: {sprint.status}

**Metrics**:
- Story Points: {sprint.completed_points}/{sprint.planned_points}
- Tasks: {sprint.completed_tasks}/{sprint.planned_tasks}
- Velocity: {sprint.velocity}

**Tasks**:
<foreach {task} in {sprint.tasks}>
- [{task.status_icon}] **{task.id}**: {task.title} ({task.type}, {task.priority})
  - Story Points: {task.story_points}
  - Assigned: {task.assigned_to}
  - Progress: {task.percent_complete}%
</foreach>
<examples>
- [✅] **TASK-042**: Implement priority management feature (feature, High)
  - Story Points: 13
  - Assigned: Team A
  - Progress: 100%
- [🔨] **TASK-043**: Add category filtering (feature, Medium)
  - Story Points: 8
  - Assigned: Team B
  - Progress: 65%
- [📋] **BUG-015**: Fix priority validation edge case (bug, Critical)
  - Story Points: 3
  - Assigned: Team A
  - Progress: 0%
</examples>

**Sprint Retrospective**:
<if ({sprint.status} equals "completed")>
- **What Went Well**: {sprint.retro_well}
- **What Needs Improvement**: {sprint.retro_improve}
- **Action Items**: {sprint.retro_actions}
</if>

---

</foreach>

## Milestone Tracking

<foreach {milestone} in {milestones}>
### Milestone: {milestone.name}
**Target Date**: {milestone.target_date}
**Status**: {milestone.status} ({milestone.percent_complete}%)

**Objectives**:
<foreach {objective} in {milestone.objectives}>
- {objective.description} - {objective.status}
</foreach>

**Tasks**:
- Total: {milestone.total_tasks}
- Completed: {milestone.completed_tasks}
- In Progress: {milestone.in_progress_tasks}
- Remaining: {milestone.remaining_tasks}

**Critical Path**:
<foreach {task} in {milestone.critical_path}>
- {task.id}: {task.title} ({task.status})
</foreach>

---

</foreach>

## Backlog (Unscheduled)

### High Priority
<foreach {task} in {high_priority_backlog}>
- **{task.id}**: {task.title}
  - Type: {task.type}
  - Effort: {task.effort}
  - Affects: {task.affected_features}
  - Components: {task.affected_components}
</foreach>

### Medium Priority
<foreach {task} in {medium_priority_backlog}>
- **{task.id}**: {task.title}
  - Type: {task.type}
  - Effort: {task.effort}
  - Affects: {task.affected_features}
</foreach>

### Low Priority
<foreach {task} in {low_priority_backlog}>
- **{task.id}**: {task.title}
  - Type: {task.type}
  - Effort: {task.effort}
</foreach>

---

## Feature Progress

<foreach {feature} in {features_with_tasks}>
### Feature: {feature.name}
**Area**: {feature.area}
**Status**: {feature.status}

**Tasks**:
- Total: {feature.total_tasks}
- Completed: {feature.completed_tasks} ({feature.percent_complete}%)
- In Progress: {feature.in_progress_tasks}
- Planned: {feature.planned_tasks}

**Task List**:
<foreach {task} in {feature.tasks}>
- [{task.status_icon}] {task.id}: {task.title}
</foreach>

---

</foreach>

## Technical Debt Tracking

**Total Tech Debt Items**: {tech_debt_total}
**High Priority**: {tech_debt_high}
**Addressed This Quarter**: {tech_debt_addressed}

<foreach {debt} in {tech_debt_items}>
### {debt.id}: {debt.title}
- **Priority**: {debt.priority}
- **Impact**: {debt.impact}
- **Effort**: {debt.effort}
- **Component**: {debt.component}
- **Rationale**: {debt.rationale}
- **Plan**: {debt.plan}
</foreach>

---

## Blocked Items

<foreach {blocked} in {blocked_items}>
### {blocked.id}: {blocked.title}
- **Blocked By**: {blocked.blocker}
- **Since**: {blocked.blocked_since}
- **Impact**: {blocked.impact}
- **Resolution Plan**: {blocked.resolution}
</foreach>

---

## Velocity Tracking

### Historical Velocity
<foreach {sprint} in {completed_sprints}>
- **Sprint {sprint.number}**: {sprint.velocity} points
</foreach>

**Average Velocity**: {average_velocity} points/sprint
**Trend**: {velocity_trend}

### Burndown

```
{burndown_chart_data}
```

---

## Release Planning

<foreach {release} in {planned_releases}>
### Release {release.version}: {release.name}
**Target Date**: {release.target_date}
**Status**: {release.status}

**Features**:
<foreach {feature} in {release.features}>
- {feature.name} ({feature.status})
</foreach>

**Tasks**:
- Total: {release.total_tasks}
- Completed: {release.completed_tasks}
- Remaining: {release.remaining_tasks}
- At Risk: {release.at_risk_tasks}

---

</foreach>

## Capacity Planning

### Current Capacity
- **Team Size**: {team_size}
- **Sprint Capacity**: {sprint_capacity} points
- **Current Allocation**: {current_allocation}%

### Upcoming Sprints
<foreach {sprint} in {upcoming_sprints}>
**Sprint {sprint.number}**:
- Planned Points: {sprint.planned_points}
- Planned Tasks: {sprint.planned_tasks}
- Risk Level: {sprint.risk_level}
</foreach>

---

## Metrics & Insights

### Completion Rates
- **Last Sprint**: {last_sprint_completion}%
- **Last 3 Sprints Avg**: {three_sprint_avg_completion}%
- **Overall**: {overall_completion}%

### Time to Completion
- **Average**: {avg_time_to_completion} days
- **By Type**:
  - Features: {feature_avg_days} days
  - Bugs: {bug_avg_days} days
  - Tech Debt: {tech_debt_avg_days} days

### Quality Metrics
- **Bugs per Sprint**: {bugs_per_sprint}
- **Tech Debt Accumulation Rate**: {tech_debt_rate}
- **Blocked Items Trend**: {blocked_trend}

---

## Change Log
<foreach {change} in {backlog_change_log}>
- **{change.date}**: {change.description}
</foreach>

---

<!--
═══════════════════════════════════════════════════════════════
BACKLOG QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════

## Organization (20 points)
□ 5pts: All tasks categorized by type
□ 5pts: All tasks prioritized
□ 5pts: Sprint organization clear
□ 5pts: Milestone tracking present

## Sprint Management (25 points)
□ 10pts: Current sprint clearly identified
□ 5pts: Sprint goals documented
□ 5pts: Story points/velocity tracked
□ 5pts: Sprint retrospectives captured

## Feature Tracking (20 points)
□ 10pts: Feature progress tracked
□ 5pts: Feature-to-task mapping clear
□ 5pts: Feature completion percentages accurate

## Technical Debt (15 points)
□ 5pts: Tech debt items tracked
□ 5pts: Tech debt prioritized
□ 5pts: Debt resolution plans documented

## Metrics (20 points)
□ 5pts: Velocity tracked historically
□ 5pts: Completion rates calculated
□ 5pts: Time to completion measured
□ 5pts: Trend analysis present

## Target Score: 80/100 minimum

### Common Issues to Avoid:
❌ Tasks not assigned to sprints/milestones
❌ No velocity tracking
❌ Missing priority assignments
❌ Tech debt not tracked separately
❌ No burndown/completion metrics
❌ Blocked items not highlighted
-->
