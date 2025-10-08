---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Validate project specification against architectural patterns and engineering principles
argument-hint:
---

# Project Specification Validation Command

Comprehensive architectural validation of project specification against DDD, Clean Architecture, Hexagonal Architecture patterns, and software engineering principles. Provides quality scoring, prioritized improvements, and auto-fix capability.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Quick Reference
- **Template**: Documents/Templates/PROJECT_TEMPLATE.md
- **Tech Stack**: Documents/Guides/VTTTOOLS_STACK.md
- **Architecture**: DDD + Clean Architecture + Hexagonal Architecture

## Process

### Validation & Setup

- **STEP 0A**: Use Read tool to load "Documents/PROJECT.md" - abort if missing with guidance to run /create-project
- **STEP 0B**: Extract project name from specification file header (first # heading)
- **STEP 0C**: Use mcp__memory__search_nodes to check for existing "Project_Validation_{project_name}" entity
- **STEP 0D**:
  <if (validation entity exists)>
  - Use mcp__memory__open_nodes to get iteration count
  - Increment {iteration} = previous + 1
  - Display: "Re-validation (Iteration {iteration})"
  <else>
  - Set {iteration} = 1
  - Display: "Initial Validation"
  </if>

### Memory Cleanup & Initialization

- **STEP 1A**:
  <if (Project_Validation entity exists from previous run)>
  - Use mcp__memory__delete_entities to clean up old analysis entities
  </if>

- **STEP 1B**: Use mcp__memory__create_entities to create validation tracking:
  - name: "Project_Validation_{project_name}"
  - entityType: "validation_session"
  - observations: ["project_name: {project_name}", "iteration: {iteration}", "date: {current_date}", "target_score: 80/100"]

### Quality Scoring

- **STEP 2A**: Use Task tool with code-reviewer agent to score project against checklist:
  ```markdown
  ROLE: Project Specification Quality Reviewer

  TASK: Score project specification against quality checklist from PROJECT_TEMPLATE.md

  PROJECT FILE: Documents/PROJECT.md

  SCORING RUBRIC (100 points total):

  **Project Identity & Value (15 points)**:
  - 5pts: Product type clearly defined
  - 5pts: Target user type and primary workflow explicit
  - 5pts: Interface type and interaction method specified

  **Domain Architecture (DDD) (30 points)**:
  - 10pts: Bounded contexts identified with clear responsibilities (minimum 3)
  - 5pts: Domain interactions documented with direction
  - 5pts: Ubiquitous language defined (10+ core domain terms minimum)
  - 5pts: Domain entities, value objects, services specified per context
  - 5pts: Domain events identified for state changes

  **Clean Architecture (25 points)**:
  - 10pts: Domain layer complete (entities, value objects, domain services, business rules)
  - 5pts: Application layer defined (use cases with clear responsibilities)
  - 5pts: Infrastructure layer specified (adapters, external integrations)
  - 5pts: Dependency rule compliance validated (inward dependencies only)

  **Hexagonal Architecture (Ports & Adapters) (15 points)**:
  - 5pts: Primary ports defined (inbound interfaces)
  - 5pts: Secondary ports defined (outbound interfaces)
  - 3pts: Primary adapters specified (UI, API, CLI, etc.)
  - 2pts: Secondary adapters specified (database, email, external APIs)

  **Implementation Guidance (15 points)**:
  - 5pts: Technology stack specified with versions
  - 5pts: Implementation priority follows architecture-first approach
  - 5pts: Development phases documented (Domain → Application → Infrastructure → UI)

  For each dimension, identify:
  - Score achieved
  - Issues found (critical, high, medium, low priority)
  - Specific improvements needed
  - Estimated impact of each fix

  OUTPUT: Complete scoring with issue list.
  ```

- **STEP 2B**: Parse scores and store in memory

### Generate Prioritized Improvements

- **STEP 3A**: Categorize all identified issues into priority levels:
  - 🔴 CRITICAL: Issues preventing 80/100 target
  - 🟡 HIGH: Significant quality/architectural impact
  - 🟢 MEDIUM: Quality enhancements
  - 🔵 LOW: Nice-to-have improvements

- **STEP 3B**: For each improvement, calculate:
  - Point impact (+X points)
  - Effort estimate (Low: <30min, Medium: 30min-2h, High: >2h)
  - Projected score if applied

### Display Standardized Report

Display 3-section report to console:

#### Section 1: Grade Table
```
PROJECT SPECIFICATION VALIDATION
Project: {project_name}
Iteration: {iteration}
Overall: {score}/100 ({PASS/FAIL})

Dimension                    | Score  | Target | Status
-----------------------------|--------|--------|--------
Project Identity & Value     | XX/15  | 12/15  | PASS/WARN
Domain Architecture (DDD)    | XX/30  | 24/30  | PASS/WARN
Clean Architecture           | XX/25  | 20/25  | PASS/WARN
Hexagonal (Ports & Adapters) | XX/15  | 12/15  | PASS/WARN
Implementation Guidance      | XX/15  | 12/15  | PASS/WARN
-----------------------------|--------|--------|--------
TOTAL                        | XX/100 | 80/100 | PASS/WARN
```

#### Section 2: Proposed Improvements
```
PROPOSED IMPROVEMENTS

🔴 CRITICAL ({count})
1. {Issue title}
   Current: {problem}
   Required: {fix}
   Impact: +{X} pts | Effort: {Low/Med/High}

🟡 HIGH ({count})
{items}

🟢 MEDIUM ({count})
{items}

🔵 LOW ({count})
{items}
```

#### Section 3: Apply Changes
```
APPLY IMPROVEMENTS?
Total: {count} | Impact: {current}→{projected} (+{delta})

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

- **STEP 5A**: Collect user choice (1-6)
- **STEP 5B**:
  <case {user_choice}>
  <is 1>
    - Apply only CRITICAL improvements
  <is 2>
    - Apply CRITICAL + HIGH improvements
  <is 3>
    - Apply CRITICAL + HIGH + MEDIUM improvements
  <is 4>
    - Apply ALL improvements
  <is 5>
    - For each improvement, ask user Y/N, apply if Y
  <is 6>
    - Skip auto-fix, exit command
  </case>

- **STEP 5C**: Apply selected improvements using Edit/Write tools
- **STEP 5D**: Store applied improvements in memory
- **STEP 5E**: Auto re-run validation (recursive call)
- **STEP 5F**: Display new scores and remaining issues
- **STEP 5G**: Offer to continue with remaining improvements or exit

**IMPORTANT NOTES**:
- This command validates project specification against embedded quality checklist
- Supports iterative re-evaluation with automatic improvement tracking
- Auto-fix capability applies improvements directly to specification files
- No arguments needed - automatically finds Documents/PROJECT.md
- Console-only output with standardized 3-section format