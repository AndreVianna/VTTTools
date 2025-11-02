---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, Write, Bash, TodoWrite
description: Analyze business feature request and generate use case specifications
argument-hint: {feature_name:string} {feature_description:string:optional} {jira_epic_id:string:optional} {jira_epic_url:string:optional}
---

# Add Feature

Analyze business feature request against project architecture and break down into implementable use cases.

## 1. Validation
- Validate feature_name non-empty
- **Validate and process Jira fields (if provided)**:
  - If {jira_epic_id} provided: must match regex `^[A-Z]+-[0-9]+$`
  - If {jira_epic_id} provided but {jira_epic_url} NOT provided:
    - Auto-generate URL: `https://rossvideo.atlassian.net/browse/{jira_epic_id}`
    - Store generated URL in {jira_epic_url}
  - If BOTH {jira_epic_id} and {jira_epic_url} provided:
    - Validate URL is valid
    - Extract epic ID from URL (parse from `/browse/{ID}` pattern)
    - If extracted ID ≠ {jira_epic_id}: **ERROR** "Jira epic ID mismatch: URL contains '{extracted_id}' but argument is '{jira_epic_id}'"
  - If only {jira_epic_url} provided (no ID): **ERROR** "Jira epic ID required when URL provided"
- Verify SOLUTION.md + FEATURE_TEMPLATE.md exist
- Initialize feature entity in memory with status: analyzing
- If {jira_epic_id} provided: add observations ["jira_epic_id: {jira_epic_id}", "jira_epic_url: {jira_epic_url}"]

## 2. Feature Analysis
Delegate to solution-engineer:
```
Analyze "{feature_name}" (description: {feature_description}) against MAM architecture.

OBJECTIVE: Break into use cases following Clean Architecture + Hexagonal + DDD

OUTPUT:
STATUS: [analysis_needed|ready]
AREA_ASSIGNMENT: {primary + secondary areas}
USE_CASES: [{name, area, purpose}]
ARCHITECTURAL_IMPACT: {interfaces, dependencies}
QUESTIONS: [if analysis_needed]
```

**If analysis_needed**: Collect user input (max 5 questions), iterate
**If ready**: Extract variables, store observations in memory

## 3. Architecture Validation
- Verify each use case assigned to one bounded context
- Check no area boundary violations
- Validate ports/adapters identified for external dependencies
- Ensure KISS principle (justify complexity)

## 4. Generate Feature Specification
- Load FEATURE_TEMPLATE.md
- Apply DSL substitution with extracted variables
- Write to: Documents/Areas/{primary_area}/Features/{feature_name}/FEATURE.md
- Update SOLUTION.md features list

## 5. Generate Feature Status Tracker
- Load FEATURE_STATUS_TEMPLATE.md
- Apply DSL substitution with initial values:
  - last_updated: {current_date}
  - feature_grade: N/A
  - progress_percent: 0%
  - completed_count: 0
  - total_count: {use_case_count}
  - use_cases: from analysis
  - All implementation checkboxes: unchecked
- Write to: Documents/Areas/{primary_area}/Features/{feature_name}/FEATURE_STATUS.md

## 6. Structure Integration
<if (Documents/Structure/STRUCTURE.md exists)>
- Update feature-component mappings
- Create structure-feature relationships
</if>

## 7. Description Refinement
- Use solution-engineer to create refined description from complete spec
- Update feature and solution documents

## 8. Completion
Report:
```
✓ FEATURE CREATED: {feature_name}

Area: {primary_area}
Use Cases: {count}

Created:
- Documents/Areas/{primary_area}/Features/{feature_name}/FEATURE.md
- Documents/Areas/{primary_area}/Features/{feature_name}/FEATURE_STATUS.md

Next Steps:
- Review specification
- Add use cases: /use-case:add {feature_name} {use_case_name}
- Validate: /feature:validate {feature_name}
- Track progress: /feature:display {feature_name}
```

**Note**: Maintains DDD boundaries, Clean Architecture principles, and Hexagonal patterns.
