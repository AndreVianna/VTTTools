---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Bash, TodoWrite]
description: Validate feature specification against quality standards and architecture alignment
argument-hint: {feature_name:string:optional(all)}
---

# Feature Specification Validation Command

Validates feature specifications against FEATURE_TEMPLATE.md quality checklist, architecture alignment, and implementation readiness. Provides scoring, prioritized improvements, and auto-fix capability.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Quick Reference
- **Template**: Documents/Templates/FEATURE_TEMPLATE.md
- **Tech Stack**: Documents/Guides/VTTTOOLS_STACK.md
- **Architecture**: Area-driven feature organization

## Process

### Scope Determination

- **STEP 0A**: Parse {feature_name} parameter:
  <case {feature_name}>
  <is empty or "all">
    - Set {validation_scope} = "all_features"
    - Use Glob: "Documents/Areas/*/Features/*.md" to find all feature files
  <otherwise>
    - Set {validation_scope} = "single_feature"
    - Use Glob: "Documents/Areas/*/Features/{feature_name}.md" to find feature file
    - <if (not found)>
      - Display error with available features, abort
    </if>
  </case>

- **STEP 0B**: Initialize iteration tracking:
  <if (validation entity exists for scope)>
  - Increment iteration count
  <else>
  - Set {iteration} = 1
  </if>

### Quality Scoring

<foreach {feature_file} in {feature_files}>

- **STEP 1A**: Use Task tool with code-reviewer agent:
  ```markdown
  ROLE: Feature Specification Quality Reviewer

  TASK: Score feature specification against FEATURE_TEMPLATE.md checklist

  FEATURE FILE: {feature_file_path}

  SCORING RUBRIC (100 points):

  **Business Clarity (25 points)**:
  - 5pts: Feature has clear user benefit statement
  - 5pts: Business objective is specific and measurable
  - 5pts: Success criteria are defined and testable
  - 5pts: Target users clearly identified
  - 5pts: User value explicitly stated

  **Architecture Alignment (30 points)**:
  - 10pts: Primary area correctly assigned based on core responsibility
  - 5pts: Secondary areas identified if cross-cutting
  - 5pts: Area impact assessment complete for all affected areas
  - 5pts: Area interactions documented with clear direction
  - 5pts: No circular dependencies between areas

  **Use Case Coverage (25 points)**:
  - 10pts: All feature use cases identified and listed
  - 5pts: Each use case assigned to appropriate area
  - 5pts: Use case purposes clearly stated
  - 5pts: Implementation phases logically ordered by dependencies

  **Implementation Guidance (20 points)**:
  - 5pts: New interfaces needed are identified
  - 5pts: External dependencies documented
  - 5pts: Implementation priority clearly stated
  - 5pts: Technical considerations address integration requirements

  Identify issues by priority (Critical, High, Medium, Low) with specific fixes.

  OUTPUT: Scores and prioritized improvements.
  ```

- **STEP 1B**: Parse and store scores

</foreach>

### Display Results

#### Section 1: Grade Table
```
FEATURE SPECIFICATION VALIDATION
<if (scope is all)>
Features Validated: {count}
Average Score: {avg}/100
</if>
<if (scope is single)>
Feature: {feature_name}
</if>
Iteration: {iteration}
Overall: {score}/100 ({PASS/FAIL})

Dimension               | Score  | Target | Status
------------------------|--------|--------|--------
Business Clarity        | XX/25  | 20/25  | PASS/WARN
Architecture Alignment  | XX/30  | 24/30  | PASS/WARN
Use Case Coverage       | XX/25  | 20/25  | PASS/WARN
Implementation Guidance | XX/20  | 16/20  | PASS/WARN
------------------------|--------|--------|--------
TOTAL                   | XX/100 | 80/100 | PASS/WARN
```

#### Section 2: Proposed Improvements
```
PROPOSED IMPROVEMENTS

🔴 CRITICAL ({count})
1. [{FEATURE}] {Issue}
   Current: {problem}
   Required: {fix}
   Impact: +{X} pts | Effort: {Low/Med/High}

🟡 HIGH ({count})
{improvements}

🟢 MEDIUM ({count})
{improvements}

🔵 LOW ({count})
{improvements}
```

#### Section 3: Apply Changes
```
APPLY IMPROVEMENTS?
Total: {count} | Impact: {current}→{projected}

Options:
1. Apply CRITICAL only
2. Apply CRITICAL + HIGH
3. Apply CRITICAL + HIGH + MEDIUM (ALL except LOW)
4. Apply ALL
5. Interactive review
6. Skip

[Enter 1-6]:
```

### Auto-Fix Implementation

- **STEP 3A**: Execute selected improvements:
  <case {user_choice}>
  <is 1-4>
    - Apply improvements based on selection
    - Use Edit tool for specification updates
  <is 5>
    - For each improvement, prompt Y/N, apply if approved
  <is 6>
    - Exit without changes
  </case>

- **STEP 3B**: Store applied improvements in memory
- **STEP 3C**: Recursively re-run validation
- **STEP 3D**: Display iteration comparison and offer next steps

**IMPORTANT NOTES**:
- Validates against FEATURE_TEMPLATE.md embedded checklist
- Supports scope: specific feature or all features
- Iterative improvement with progress tracking
- Auto-fix for: missing use cases, area assignments, architecture violations
- Console-only output with standardized format