---
allowed-tools: mcp__memory__*, Task, Read, Glob
description: Display task status with cross-references, progress, and metrics
argument-hint: {task_id:string}
---

# Display Task

Show comprehensive task status: cross-references, implementation progress, acceptance criteria status.

## 1. Load Task Context
- Validate task_id non-empty
- Read task spec: Documents/Tasks/{task_id}/TASK.md
- Extract: title, type, status, priority, effort, description
- Extract cross-references: affected features, use cases, components, domain areas
- Check for implementation progress tracking

## 2. Display Status Report
```
═══════════════════════════════════════════
TASK STATUS: {task_id}
═══════════════════════════════════════════

Title: {task_title}
Type: {task_type}
Priority: {task_priority}
Status: {task_status}
Effort: {effort_estimate}

Progress: {progress_percent}% complete

Description:
{task_description}

───────────────────────────────────────────
CROSS-REFERENCES
───────────────────────────────────────────

Features Affected: {feature_count}
{foreach feature: - {feature.name} ({feature.area})}

Use Cases Affected: {use_case_count}
{foreach use_case: - {use_case.name} ({use_case.feature})}

Components Modified: {component_count}
{foreach component: - {component.name} ({component.layer})}

Domain Areas: {domain_count}
{foreach domain: - {domain.name}}

───────────────────────────────────────────
IMPLEMENTATION STATUS
───────────────────────────────────────────

<if (status equals "planned")>
📋 PLANNED - Not started

Next: /task:coding:prepare {task_id}
</if>

<if (status equals "in-progress")>
🔨 IN PROGRESS

Completed Steps:
{completed_steps_summary}

Current Phase: {current_phase}

Next: {next_command}
</if>

<if (status equals "completed")>
✅ COMPLETED

Completion Date: {completion_date}
Duration: {duration}
</if>

<if (status equals "blocked")>
🚫 BLOCKED

Blockers:
{foreach blocker: - {blocker.description}}

Blocked By Tasks:
{foreach blocking_task: - {blocking_task.id}: {blocking_task.title} ({blocking_task.status})}
</if>

───────────────────────────────────────────
ACCEPTANCE CRITERIA ({met_count}/{total_count})
───────────────────────────────────────────

{foreach criterion: {✅|❌|⏳} {criterion.given_when_then}}

───────────────────────────────────────────
DEPENDENCIES
───────────────────────────────────────────

<if (blocking_tasks)>
Blocked By: {blocking_task_count} tasks
{foreach: - {task.id}: {task.title} ({task.status})}
</if>

<if (blocked_tasks)>
Blocks: {blocked_task_count} tasks
{foreach: - {task.id}: {task.title} ({task.status})}
</if>

═══════════════════════════════════════════

Related Commands:
- Show impact: /task:show-impact {task_id}
- Continue work: {next_lifecycle_command}
```

**Note**: Comprehensive task overview with cross-references and lifecycle progress. Quick way to check task status.
