---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Bash, TodoWrite]
description: Validate use case specification against quality standards and architecture integration
argument-hint: {use_case_name:string:optional(all)}
---

# Use Case Specification Validation Command

Validates use case specifications against USE_CASE_TEMPLATE.md quality checklist, architecture integration, and implementation readiness. Provides scoring, prioritized improvements, and auto-fix capability.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Phase 0: Scope Determination

- **STEP 0A**: Parse {use_case_name} parameter:
  <case {use_case_name}>
  <is empty or "all">
    - Set {validation_scope} = "all_use_cases"
    - Use Glob: "Documents/Areas/*/Features/*/UseCases/*.md" to find all use case files
  <otherwise>
    - Set {validation_scope} = "single_use_case"
    - Use Glob: "Documents/Areas/*/Features/*/UseCases/{use_case_name}.md" to find use case file
    - <if (not found)>
      - Display error with available use cases, abort
    </if>
  </case>

- **STEP 0B**: Initialize iteration tracking:
  <if (validation entity exists for scope)>
  - Increment iteration count
  <else>
  - Set {iteration} = 1
  </if>

## Phase 1: Quality Scoring

<foreach {use_case_file} in {use_case_files}>

- **STEP 1A**: Use Task tool with code-reviewer agent:
  ```markdown
  ROLE: Use Case Specification Quality Reviewer

  TASK: Score use case specification against USE_CASE_TEMPLATE.md checklist

  USE CASE FILE: {use_case_file_path}

  SCORING RUBRIC (100 points):

  **Business Context (20 points)**:
  - 5pts: Parent feature clearly identified
  - 5pts: Owning area correctly assigned
  - 5pts: Business value explicitly stated
  - 5pts: Primary actor and scope defined

  **Architecture Integration (30 points)**:
  - 10pts: Clean Architecture mapping complete (service, entities, domain services)
  - 10pts: Hexagonal Architecture elements defined (ports, adapters)
  - 5pts: DDD alignment documented (bounded context, domain events)
  - 5pts: Infrastructure dependencies identified

  **UI Presentation (within Architecture Integration)**:
  - Check: UI type specified (NO_UI, API_ENDPOINT, FULL_PAGE, MODAL, FORM, WIDGET, BUTTON, MENU_ITEM, PANEL)
  - Check: If user-facing UI (not NO_UI/API_ENDPOINT), location/route specified
  - Check: If FORM/PAGE/MODAL, key UI elements listed
  - If UI section missing or incomplete, deduct from Architecture Integration score

  **Functional Specification (30 points)**:
  - 5pts: Input requirements fully specified with validation rules
  - 5pts: Business rules clearly documented
  - 5pts: Processing steps detailed
  - 5pts: Output specification complete
  - 5pts: Error scenarios comprehensive (4+ error conditions REQUIRED)
  - 5pts: Preconditions and postconditions explicit

  **Implementation Guidance (20 points)**:
  - 5pts: Interface contract defined
  - 5pts: Testing strategy includes unit, integration, and acceptance criteria
  - 5pts: Acceptance criteria in Given/When/Then format (3+ criteria REQUIRED)
  - 5pts: Architecture compliance validated (layers, dependencies, KISS)

  Identify issues by priority (Critical, High, Medium, Low) with specific fixes.

  CRITICAL CHECKS:
  - Must have 4+ error scenarios
  - Must have 3+ acceptance criteria
  - All architecture sections must be populated
  - UI type must be specified (one of: NO_UI, API_ENDPOINT, FULL_PAGE, MODAL, FORM, WIDGET, BUTTON, MENU_ITEM, PANEL)
  - If UI type is user-facing (not NO_UI/API_ENDPOINT), UI location/route must be specified

  OUTPUT: Scores and prioritized improvements.
  ```

- **STEP 1B**: Parse and store scores

</foreach>

## Phase 2: Display Results

### Section 1: Grade Table
```
═══════════════════════════════════════════
USE CASE SPECIFICATION VALIDATION
═══════════════════════════════════════════
<if (scope is all)>
Use Cases Validated: {count}
Average Score: {avg}/100
</if>
<if (scope is single)>
Use Case: {use_case_name}
</if>
Iteration: {iteration}
Overall: {score}/100 ({PASS ✅ | FAIL ❌})

┌──────────────────────────────┬────────┬────────┬────────┐
│ Dimension                    │ Score  │ Target │ Status │
├──────────────────────────────┼────────┼────────┼────────┤
│ Business Context             │ XX/20  │ 16/20  │ ✅/⚠️  │
│ Architecture Integration     │ XX/30  │ 24/30  │ ✅/⚠️  │
│ Functional Specification     │ XX/30  │ 24/30  │ ✅/⚠️  │
│ Implementation Guidance      │ XX/20  │ 16/20  │ ✅/⚠️  │
├──────────────────────────────┼────────┼────────┼────────┤
│ TOTAL                        │ XX/100 │ 80/100 │ ✅/⚠️  │
└──────────────────────────────┴────────┴────────┴────────┘
```

### Section 2: Proposed Improvements
```
═══════════════════════════════════════════
PROPOSED IMPROVEMENTS
═══════════════════════════════════════════

🔴 CRITICAL ({count})
1. [{USE_CASE}] {Issue}
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

### Section 3: Apply Changes
```
═══════════════════════════════════════════
APPLY IMPROVEMENTS?
═══════════════════════════════════════════
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

## Phase 3: Auto-Fix Implementation

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
- Validates against USE_CASE_TEMPLATE.md embedded checklist
- Enforces minimums: 4+ error scenarios, 3+ acceptance criteria
- Supports scope: specific use case or all use cases
- Iterative improvement with progress tracking
- Auto-fix for: missing error scenarios, missing ACs, architecture mappings
- Console-only output with standardized format