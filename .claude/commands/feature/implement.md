---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, SlashCommand, Bash
description: Implement complete feature by orchestrating domain + all use case implementations
argument-hint: {feature_name:string}
---

# Implement Feature Command

Orchestrate implementation of complete feature including domain layer and all use cases with progress tracking, pause/resume capability.

## Actions

1. **Validate and locate feature**:
   - Verify {feature_name} is not empty
   - Find feature spec: Glob "Documents/Areas/*/Features/{feature_name}.md"
   - Read feature to get: owning area, list of use cases, use case count
   - Check prerequisites: domain model exists, coding standards exist, implementation configuration exists

2. **Check for implementation roadmap** (optional):
   - Look for feature roadmap: "{feature_directory}/ROADMAP.md"
   - If found:
     - Read and extract: implementation_phases, use_case_sequence, quality_gates, risks
     - Display: "Found implementation roadmap - will follow planned phases"
     - Validate roadmap is ready (score ≥ 80)
   - If not found: use default implementation order (from feature spec or alphabetical)

3. **Check domain layer status**:
   - Search memory for "DomainImpl_{area}" entity
   - If domain not implemented:
     - Display: "Domain layer not implemented for {area}. Implement domain first? [Y/N]"
     - If Y: run /implementation:implement-domain {area}, wait for completion and user commit
     - If N: abort with "Domain layer required before use case implementation"

4. **Initialize tracking and display plan**:
   - Create memory entity: name="FeatureImpl_{feature_name}", observations=["use_cases_total: {count}", "use_cases_completed: 0", "started: {date}"]
   - Determine implementation sequence from roadmap OR default order
   - Display plan:
     ```
     FEATURE IMPLEMENTATION PLAN

     Feature: {feature_name}
     Area: {area_name}
     Use Cases: {count}
     Roadmap: {found/not found}

     Implementation Order:
     {foreach: {index}. {usecase.name} (Phase {usecase.phase if roadmap})}

     Domain Layer: ✅ Implemented
     Proceed? [Y/N]
     ```

5. **Implement use cases sequentially**:
   - For each use case in implementation order:
     - Display: "Implementing ({index}/{total}): {use_case}"
     - Run SlashCommand: "/implementation:implement-use-case {use_case}"
     - Wait for user approval/commit
     - Update memory: "use_cases_completed: {new_count}", "last_completed: {use_case}"
     - Display progress with bar and remaining list
     - Prompt: "Continue to next use case? [Y/N/Pause]"
     - If Pause: store state in memory, exit with "Resume with /implement-feature {feature_name}"

6. **Feature-level validation**:
   - Run comprehensive tests: /quality:test-unit feature {feature_name}
   - Run automated code review: /quality:review-code {feature_name}
   - Display results summary

7. **Update memory and report**:
   - Update observations: "status: COMPLETE", "completed_date: {date}", "all_tests_passing: {bool}", "ready_for_pr: {bool}"
   - Display summary:
     ```
     FEATURE IMPLEMENTATION COMPLETE

     Feature: {feature_name}
     Use Cases: {count}/{total} implemented

     Summary:
     - Total Files: {count}
     - Tests Passing: {pass}/{total}
     - Coverage: {percent}%
     - Code Review: {APPROVED|NEEDS_FIXES}

     Git: Branch {current_branch}, {commit_count} commits

     Next Steps:
     - Fix issues (if any)
     - Create PR: /git:create-pr
     ```

**NOTES**:
- Orchestrates domain + all use cases for a feature
- Can pause and resume at any use case
- Tracks progress in memory
- Each use case requires user commit (INTERACTIVE mode)
- Final validation before suggesting PR
