---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Validate roadmap against quality standards, architecture, and feasibility with detailed reporting
argument-hint: {item_type:string:optional} {item_name:string:optional}
---

# Roadmap Validation Command

Validates roadmap specifications against quality standards, architecture alignment, feasibility, and implementation readiness. Generates comprehensive validation report with scores, prioritized improvements, and auto-fix capability.

**Supports**: Context-bound roadmaps (feature/use-case/task/domain) and standalone roadmap files (backward compatible)

**Platform**: Cross-platform (Windows/Linux/macOS)
**Target**: Agentic AI coding (no time/cost estimates required, focus on technical correctness)

## Phase 0: Scope Determination & Initialization

- **STEP 0A**: Parse parameters and locate roadmap (supports context-bound + standalone):
  <if ({item_type} is not empty AND {item_name} is not empty)>
    <!-- NEW: Context-bound roadmap approach -->
    - Validate {item_type}: feature, use-case, task, domain
    - Locate roadmap based on type:
      <case {item_type}>
      <is feature>
        - First find feature spec: Glob "Documents/Areas/*/Features/{item_name}.md" OR "Documents/Areas/*/Features/{item_name}/FEATURE.md"
        - Parse directory from feature spec path
        - Look for ROADMAP.md in same directory or {item_name} subdirectory
        - Paths to check: "{feature_dir}/ROADMAP.md" or "{feature_dir}/{item_name}/ROADMAP.md"
      </is>
      <is use-case>
        - First find use case spec: Glob "Documents/Areas/*/Features/*/UseCases/{item_name}.md" OR ".../{item_name}/USE_CASE.md"
        - Parse directory from use case spec path
        - Look for ROADMAP.md in same directory or {item_name} subdirectory
        - Paths to check: "{usecase_dir}/ROADMAP.md" or "{usecase_dir}/{item_name}/ROADMAP.md"
      </is>
      <is task>
        - Set {roadmap_path} = "Documents/Tasks/{item_name}/ROADMAP.md"
        - Task structure is always folder-based
      </is>
      <is domain>
        - Set {roadmap_path} = "Documents/Areas/{item_name}/Domain/ROADMAP.md"
        - Domain structure is always folder-based
      </is>
      </case>
    - Abort if not found: "Roadmap not found. Run /creation:generate-roadmap {item_type} {item_name} first."
    - Set {roadmap_name} = "{item_type}_{item_name}"
  <else>
    <!-- OLD: Standalone roadmap file approach (backward compatible) -->
    - <if ({item_type} is empty)>
      - Look for roadmaps: Use Glob "Documents/*ROADMAP*.md"
      - Display list, prompt user to select
      - Set {roadmap_path} = selected file
    <else>
      - Treat {item_type} as roadmap filename
      - Set {roadmap_path} = "Documents/{item_type}"
      - <if (not found)>
        - Try: "Documents/{item_type}.md"
      </if>
    </if>
    - Extract roadmap name from filename
  </if>

- **STEP 0B**: Display validation mode:
  - Display: "Validating roadmap: {roadmap_name}"

- **STEP 0C**: Check validation history:
  - Use mcp__memory__search_nodes for "RoadmapValidation_{roadmap_name}"
  <if (exists)>
  - Load previous iteration count
  - Set {iteration} = previous + 1
  <else>
  - Set {iteration} = 1
  </if>

- **STEP 0D**: Initialize validation tracking:
  - Set {timestamp} = current timestamp
  - Prepare for console-based reporting (no file output)

## Phase 1: Parse Roadmap Structure

- **STEP 1A**: Read roadmap file completely

- **STEP 1B**: Use Task tool with solution-engineer agent:
  ```markdown
  ROLE: Roadmap Structure Parser

  TASK: Parse roadmap document into structured data

  ROADMAP CONTENT: {roadmap_content}

  EXTRACT:

  1. **Phases** - Identify all phase sections:
     - Phase headers (## Phase 1, ## Phase 2, etc.)
     - Phase names/titles
     - Phase duration estimates (if present)
     - Phase deliverables sections
     - Phase dependencies

  2. **Use Cases** - Extract all use case references:
     - Use case names mentioned in each phase
     - Use case paths (if specified)
     - Use case status (exists, TO_BE_CREATED, etc.)

  3. **Technical References**:
     - Technology stack mentions (React, Material-UI, etc.)
     - Architecture patterns (DDD, Clean Architecture)
     - Backend APIs (endpoints, services)
     - External dependencies (npm packages, services)

  4. **Quality Specifications**:
     - Test strategy (unit, integration, E2E)
     - Coverage targets
     - Performance requirements
     - Success criteria

  5. **Dependencies**:
     - Phase dependencies (Phase 2 depends on Phase 1)
     - Use case dependencies
     - External dependencies

  OUTPUT: Structured JSON with all extracted data
  ```

- **STEP 1C**: Store parsed structure in memory:
  - Use mcp__memory__create_entities:
    - name: "RoadmapParsed_{roadmap_name}_{iteration}"
    - entityType: "roadmap_parse"
    - observations: [parsed data]

## Phase 2: Quality Scoring - Structure & Organization (20 points)

- **STEP 2A**: Use Task tool with code-reviewer agent:
  ```markdown
  ROLE: Roadmap Structure Quality Reviewer

  TASK: Score roadmap structure and organization

  ROADMAP: {roadmap_content}
  PARSED_DATA: {parsed_structure}

  SCORING RUBRIC (20 points):

  **1. Clear Phase Definitions (5 points)**:
  - 5pts: All phases have numbered headers (## Phase 1, ## Phase 2)
  - 4pts: Most phases numbered, minor inconsistencies
  - 3pts: Some phases missing numbers
  - 2pts: Inconsistent numbering or structure
  - 0pts: No clear phase structure

  **2. Duration Estimates (5 points)**:
  - 5pts: All phases have duration estimates
  - 4pts: Most phases (80%+) have durations
  - 3pts: Some phases (50-79%) have durations
  - 2pts: Few phases have durations
  - 0pts: No duration estimates

  **3. Deliverables Defined (5 points)**:
  - 5pts: All phases have clear deliverables section
  - 4pts: Most phases have deliverables
  - 3pts: Some phases have deliverables
  - 2pts: Deliverables vague or incomplete
  - 0pts: No deliverables defined

  **4. Dependencies Explicit (5 points)**:
  - 5pts: All phase dependencies explicitly stated
  - 4pts: Most dependencies stated
  - 3pts: Some dependencies stated
  - 2pts: Dependencies implied but not explicit
  - 0pts: No dependency information

  IDENTIFY ISSUES:
  - List specific problems
  - Categorize: Critical, High, Medium, Low
  - Mark as AUTO_FIXABLE or MANUAL_FIX_REQUIRED
  - Provide specific fix instructions

  OUTPUT: Score, issues list, fix suggestions
  ```

- **STEP 2B**: Store structure score

## Phase 3: Quality Scoring - Technical Alignment (25 points)

- **STEP 3A**: Load project context:
  - Read: Documents/SOLUTION.md (project specification)
  - Read: Documents/Guides/ARCHITECTURE_PATTERN.md
  - Read: Documents/Guides/CODING_STANDARDS.md

- **STEP 3B**: Validate use case references:
  - For each use case mentioned in roadmap:
    - Use Glob: "Documents/Areas/*/Features/*/UseCases/{use_case_name}.md"
    - Mark as: EXISTS | TO_BE_CREATED | MISSING

- **STEP 3C**: Use Task tool with solution-engineer agent:
  ```markdown
  ROLE: Technical Alignment Validator

  TASK: Score roadmap technical alignment

  ROADMAP: {roadmap_content}
  PROJECT_SPEC: {project_spec_content}
  ARCHITECTURE_PATTERN: {architecture_content}
  USE_CASE_STATUS: {use_case_validation_results}

  SCORING RUBRIC (25 points):

  **1. Use Case Existence (8 points)**:
  - 8pts: All use cases exist or clearly marked TO_BE_CREATED
  - 6pts: Most use cases accounted for, minor gaps
  - 4pts: Several use cases not found, no marking
  - 2pts: Many use cases missing or unclear
  - 0pts: Use cases not specified or all missing

  **2. Technology Stack Match (5 points)**:
  - 5pts: Tech stack matches Project_Specification.md exactly
  - 4pts: Minor version differences or omissions
  - 3pts: Some technologies not specified
  - 2pts: Several mismatches
  - 0pts: Tech stack not specified or major mismatches

  **3. Architecture Pattern Compliance (5 points)**:
  - 5pts: Follows DDD Contracts + Service Implementation pattern
  - 4pts: Mostly compliant, minor deviations
  - 3pts: Some compliance issues
  - 2pts: Several pattern violations
  - 0pts: Does not follow architecture pattern

  **4. Backend APIs Specified (4 points)**:
  - 4pts: All endpoints, DTOs, contracts specified
  - 3pts: Most APIs specified
  - 2pts: Some APIs specified
  - 1pt: Few APIs mentioned
  - 0pts: No API specifications

  **5. UI Components Specified (3 points)**:
  - 3pts: UI tech stack and components clearly specified
  - 2pts: Some UI details provided
  - 1pt: Minimal UI specification
  - 0pts: No UI specification

  IDENTIFY ISSUES with specific fix instructions

  OUTPUT: Score, issues, fix suggestions
  ```

- **STEP 3D**: Store technical alignment score

## Phase 4: Quality Scoring - Feasibility & Dependencies (25 points)

- **STEP 4A**: Build dependency graph:
  - Parse all "depends on" statements
  - Create directed graph: Phase → Dependencies
  - Detect cycles using depth-first search

- **STEP 4B**: Validate prerequisites:
  - For each area mentioned:
    - Check if domain model exists
    - Check if features exist
  - For each use case:
    - Check if parent feature exists

- **STEP 4C**: Use Task tool with solution-engineer agent:
  ```markdown
  ROLE: Feasibility & Dependency Validator

  TASK: Score roadmap feasibility and dependencies

  ROADMAP: {roadmap_content}
  DEPENDENCY_GRAPH: {dependency_graph}
  CYCLES_DETECTED: {circular_dependencies}
  PREREQUISITE_STATUS: {prerequisite_validation}

  SCORING RUBRIC (25 points):

  **1. No Circular Dependencies (10 points)**:
  - 10pts: No circular dependencies detected
  - 7pts: Minor cycles that can be broken easily
  - 4pts: Several cycles requiring reorganization
  - 0pts: Major circular dependencies

  **2. Prerequisites Validated (5 points)**:
  - 5pts: All prerequisites exist (domain models, features)
  - 4pts: Most prerequisites exist
  - 3pts: Some prerequisites missing
  - 2pts: Several prerequisites missing
  - 0pts: Major prerequisites missing

  **3. External Dependencies Documented (5 points)**:
  - 5pts: All external deps documented (packages, services)
  - 4pts: Most external deps documented
  - 3pts: Some external deps documented
  - 2pts: Few external deps mentioned
  - 0pts: No external dependency documentation

  **4. Integration Points Identified (5 points)**:
  - 5pts: All integration points clearly identified
  - 4pts: Most integration points identified
  - 3pts: Some integration points identified
  - 2pts: Few integration points mentioned
  - 0pts: No integration points specified

  IDENTIFY ISSUES with fix instructions

  OUTPUT: Score, issues, fixes
  ```

- **STEP 4D**: Store feasibility score

## Phase 5: Quality Scoring - Completeness (20 points)

- **STEP 5A**: Use Task tool with code-reviewer agent:
  ```markdown
  ROLE: Roadmap Completeness Validator

  TASK: Score roadmap completeness

  ROADMAP: {roadmap_content}

  SCORING RUBRIC (20 points):

  **1. Error Handling Strategy (5 points)**:
  - 5pts: Comprehensive error handling strategy defined
  - 4pts: Error handling mentioned for most scenarios
  - 3pts: Basic error handling mentioned
  - 2pts: Minimal error handling
  - 0pts: No error handling strategy

  **2. Testing Strategy (5 points)**:
  - 5pts: Complete test strategy (unit, integration, E2E) with specifics
  - 4pts: Test strategy defined, minor gaps
  - 3pts: Basic test strategy mentioned
  - 2pts: Minimal testing mentioned
  - 0pts: No testing strategy

  **3. Quality Gates (5 points)**:
  - 5pts: Clear quality gates (coverage %, performance, etc.)
  - 4pts: Most quality gates defined
  - 3pts: Some quality gates mentioned
  - 2pts: Vague quality requirements
  - 0pts: No quality gates

  **4. Success Criteria (5 points)**:
  - 5pts: Measurable, testable success criteria for all phases
  - 4pts: Success criteria for most phases
  - 3pts: Some success criteria defined
  - 2pts: Vague success criteria
  - 0pts: No success criteria

  IDENTIFY ISSUES with fix instructions

  OUTPUT: Score, issues, fixes
  ```

- **STEP 5B**: Store completeness score

## Phase 6: Quality Scoring - Quality Standards (10 points)

- **STEP 6A**: Load coding standards:
  - Read: Documents/Guides/CODING_STANDARDS.md
  - Read: Documents/Guides/CSHARP_STYLE_GUIDE.md
  - Read: Documents/Guides/TYPESCRIPT_STYLE_GUIDE.md

- **STEP 6B**: Use Task tool with code-reviewer agent:
  ```markdown
  ROLE: Quality Standards Validator

  TASK: Score roadmap adherence to quality standards

  ROADMAP: {roadmap_content}
  CODING_STANDARDS: {standards_content}

  SCORING RUBRIC (10 points):

  **1. Coding Standards Referenced (3 points)**:
  - 3pts: Explicitly references coding standards documents
  - 2pts: Mentions standards generally
  - 1pt: Implies standards compliance
  - 0pts: No standards mentioned

  **2. Result<T> Pattern (3 points)**:
  - 3pts: Explicitly mentions Result<T> for error handling
  - 2pts: Mentions error handling pattern
  - 1pt: Implies proper error handling
  - 0pts: No error handling pattern

  **3. Layer Separation (2 points)**:
  - 2pts: Explicitly respects Domain/Application/Infrastructure/UI layers
  - 1pt: Mentions layers
  - 0pts: No layer separation mentioned

  **4. Naming Conventions (2 points)**:
  - 2pts: Uses proper naming (Services, Storage, etc.)
  - 1pt: Mostly proper naming
  - 0pts: Inconsistent or incorrect naming

  IDENTIFY ISSUES with fix instructions

  OUTPUT: Score, issues, fixes
  ```

- **STEP 6C**: Store quality standards score

## Phase 7: Calculate Overall Score & Categorize Issues

- **STEP 7A**: Sum all dimension scores:
  - Structure & Organization: {score}/20
  - Technical Alignment: {score}/25
  - Feasibility & Dependencies: {score}/25
  - Completeness: {score}/20
  - Quality Standards: {score}/10
  - **TOTAL**: {total}/100

- **STEP 7B**: Assign overall grade:
  - 95-100: A+ (Excellent)
  - 90-94: A (Very Good)
  - 85-89: B+ (Good)
  - 80-84: B (Acceptable) ← Minimum for implementation
  - 75-79: C (Needs Improvement)
  - 70-74: D (Significant Issues)
  - <70: F (Not Ready)

- **STEP 7C**: Categorize all issues by priority:
  - **CRITICAL**: Blocks implementation, must fix (< 70 overall or critical gaps)
  - **HIGH**: Major issues, should fix before implementation
  - **MEDIUM**: Quality improvements, fix for better results
  - **LOW**: Minor improvements, optional

- **STEP 7D**: Separate issues by fix type:
  - **AUTO_FIXABLE**: Can be automatically fixed
  - **MANUAL_FIX_REQUIRED**: Requires human decision/input

## Phase 8: Display Validation Results

- **STEP 8A**: Display comprehensive console output:
  ```
  ═══════════════════════════════════════════
  ROADMAP VALIDATION COMPLETE
  ═══════════════════════════════════════════

  Roadmap: {roadmap_name}
  File: {roadmap_path}
  Iteration: {iteration}

  Overall Score: {total}/100 ({grade})
  Status: {PASS ✅ | NEEDS IMPROVEMENT ⚠️ | FAIL ❌}

  ┌─────────────────────────┬────────┬────────┬────────┐
  │ Dimension               │ Score  │ Target │ Status │
  ├─────────────────────────┼────────┼────────┼────────┤
  │ Structure & Organizat.  │ XX/20  │ 16/20  │ ✅/⚠️  │
  │ Technical Alignment     │ XX/25  │ 20/25  │ ✅/⚠️  │
  │ Feasibility & Deps      │ XX/25  │ 20/25  │ ✅/⚠️  │
  │ Completeness            │ XX/20  │ 16/20  │ ✅/⚠️  │
  │ Quality Standards       │ XX/10  │  8/10  │ ✅/⚠️  │
  ├─────────────────────────┼────────┼────────┼────────┤
  │ TOTAL                   │ XX/100 │ 80/100 │ ✅/⚠️  │
  └─────────────────────────┴────────┴────────┴────────┘

  Issues Found: {total_count}
  - 🔴 CRITICAL: {count} (must fix)
  - 🟡 HIGH: {count} (should fix)
  - 🟢 MEDIUM: {count} (recommended)
  - 🔵 LOW: {count} (optional)

  Auto-fixable: {count}/{total}
  Manual fixes required: {count}
  ```

- **STEP 8B**: Display detailed issues by priority:
  ```
  ═══════════════════════════════════════════
  ISSUES FOUND
  ═══════════════════════════════════════════

  <if (critical_issues > 0)>
  🔴 CRITICAL ISSUES ({count})

  1. [{DIMENSION}] {Issue_Title}
     Current: {problem_description}
     Required: {fix_instructions}
     Impact: -{X} pts | Auto-fix: {YES/NO} | Effort: {Low/Med/High}

  2. ...
  </if>

  <if (high_issues > 0)>
  🟡 HIGH PRIORITY ISSUES ({count})

  1. [{DIMENSION}] {Issue_Title}
     Current: {problem_description}
     Recommended: {fix_instructions}
     Impact: -{X} pts | Auto-fix: {YES/NO} | Effort: {Low/Med/High}

  2. ...
  </if>

  <if (medium_issues > 0)>
  🟢 MEDIUM PRIORITY ISSUES ({count})

  1. [{DIMENSION}] {Issue_Title}
     Current: {problem_description}
     Suggested: {fix_instructions}
     Impact: -{X} pts | Auto-fix: {YES/NO} | Effort: {Low/Med/High}

  2. ...
  </if>

  <if (low_issues > 0)>
  🔵 LOW PRIORITY ISSUES ({count})

  1. [{DIMENSION}] {Issue_Title}
     Current: {problem_description}
     Optional: {fix_instructions}
     Impact: -{X} pts | Auto-fix: {YES/NO} | Effort: {Low/Med/High}

  2. ...
  </if>
  ```

- **STEP 8C**: Display manual fix instructions (if any):
  ```
  <if (manual_fixes_required > 0)>
  ═══════════════════════════════════════════
  MANUAL FIXES REQUIRED ({count})
  ═══════════════════════════════════════════

  These issues cannot be automatically fixed and require human judgment:

  ### MANUAL-001: {Issue_Title}
  **Dimension**: {dimension}
  **Priority**: {CRITICAL/HIGH/MEDIUM/LOW}
  **Impact**: -{X} points

  **Why Not Auto-fixable**: {reason - e.g., "Requires business context"}

  **Current State**:
  ```markdown
  {current_code_snippet}
  ```

  **Suggested Fix**:
  1. {step_1_with_details}
  2. {step_2_with_details}
  3. {step_3_with_details}

  **Example**:
  ```markdown
  {example_of_correct_implementation}
  ```

  **Estimated Effort**: {time_estimate}
  **Impact**: +{X} points ({dimension})

  ---

  ### MANUAL-002: ...
  {repeat for all manual fixes}

  </if>
  ```

## Phase 9: Offer Auto-Fix Options

- **STEP 9A**: Display auto-fix options:
  ```
  ═══════════════════════════════════════════
  APPLY IMPROVEMENTS?
  ═══════════════════════════════════════════

  Auto-fixable Issues: {count}
  Potential Impact: {current_score} → {projected_score} ({+X} pts)

  Options:
  1. Apply CRITICAL only ({count} fixes, +{X} pts)
  2. Apply CRITICAL + HIGH ({count} fixes, +{X} pts)
  3. Apply CRITICAL + HIGH + MEDIUM ({count} fixes, +{X} pts)
  4. Apply ALL auto-fixable ({count} fixes, +{X} pts)
  5. Interactive review (approve each fix individually)
  6. Skip auto-fix (review report and fix manually)

  [Enter 1-6]:
  ```

- **STEP 9B**: Process user selection:
  <case {user_choice}>
  <is 1>
    - Apply CRITICAL fixes only
  <is 2>
    - Apply CRITICAL + HIGH fixes
  <is 3>
    - Apply CRITICAL + HIGH + MEDIUM fixes
  <is 4>
    - Apply ALL auto-fixable fixes
  <is 5>
    - Interactive mode: prompt Y/N for each fix
  <is 6>
    - Skip to Phase 11 (update memory and exit)
  </case>

## Phase 10: Apply Auto-Fixes (If Selected)

<if ({user_choice} is 1-5)>

- **STEP 10A**: For each selected auto-fixable issue:

  ### Fix Type 1: Add Missing Duration Estimates
  <if (issue is "missing_duration")>
  - Calculate duration:
    * Count use cases in phase
    * Estimate: {use_case_count} × 2.5 days avg
    * Convert to weeks if > 5 days
  - Use Edit tool:
    * old_string: "## Phase {N}: {Phase_Name}"
    * new_string: "## Phase {N}: {Phase_Name}\n\n**Duration**: {calculated_duration}"
  - Record fix in report:
    * Issue ID
    * Before/after snippets
    * Calculation method
    * Impact: +{points} pts
  </if>

  ### Fix Type 2: Add Technology Stack References
  <if (issue is "missing_tech_stack")>
  - Load tech stack from Project_Specification.md
  - Identify relevant technologies for phase
  - Use Edit tool to add tech stack section
  - Record fix in report with details
  </if>

  ### Fix Type 3: Add Standard Test Strategy
  <if (issue is "missing_test_strategy")>
  - Generate standard test strategy:
    ```markdown
    ## Testing Strategy

    **Unit Tests**:
    - Target: 80%+ code coverage
    - Framework: xUnit (C#), Vitest (TypeScript)
    - Pattern: AAA (Arrange, Act, Assert)

    **Integration Tests**:
    - Database operations with test database
    - API endpoint testing
    - Service integration testing

    **E2E Tests**:
    - Framework: Playwright
    - Critical user flows
    - Cross-browser testing (Chrome, Firefox, Safari)
    ```
  - Use Edit tool to add before first phase
  - Record fix in report
  </if>

  ### Fix Type 4: Generate Success Criteria from Deliverables
  <if (issue is "missing_success_criteria")>
  - Parse phase deliverables
  - Generate criteria:
    * "✅ All X use cases implemented"
    * "✅ Tests passing ({count}/{count})"
    * "✅ Code reviewed with no critical issues"
  - Use Edit tool to add to phase
  - Record fix in report
  </if>

  ### Fix Type 5: Add Technology Versions
  <if (issue is "tech_versions_missing")>
  - Load versions from Project_Specification.md
  - Use Edit tool to add versions to tech mentions
  - Example: "React" → "React 19.1.1"
  - Record fix in report
  </if>

  ### Fix Type 6: Mark Non-existent Use Cases
  <if (issue is "use_case_not_found")>
  - For each non-existent use case:
    * Change mention to: "{UseCase} (TO_BE_CREATED)"
    * Add note: "Use case specification required before implementation"
  - Use Edit tool
  - Record fix in report
  </if>

  ### Fix Type 7: Reorder Phases to Break Circular Dependencies
  <if (issue is "circular_dependency")>
  - Analyze dependency graph
  - Suggest reordering (display to user for approval)
  - If approved: restructure phase order
  - Record fix in report with before/after graph
  </if>

- **STEP 10B**: After all fixes applied, display auto-fix summary:
  ```
  ═══════════════════════════════════════════
  AUTO-FIXES APPLIED ({count})
  ═══════════════════════════════════════════

  ### FIX-001: {Fix_Title}
  **Issue**: {issue_description}
  **Fix Applied**: {what_was_done}

  <if (has_calculation)>
  **Calculation Method**: {method_explanation}
  </if>

  **Before**:
  ```markdown
  {original_code_snippet}
  ```

  **After**:
  ```markdown
  {updated_code_snippet}
  ```

  **Impact**: +{X} points ({dimension})

  ---

  ### FIX-002: ...
  {repeat for all applied fixes}

  Total Impact: +{total_points} points
  ```

- **STEP 10C**: Re-run validation automatically:
  - Display: "Re-validating roadmap after auto-fixes..."
  - Recursively call Phase 1-7
  - Compare scores (iteration N vs N+1)

- **STEP 10D**: Display iteration comparison:
  ```
  ═══════════════════════════════════════════
  VALIDATION IMPROVEMENT
  ═══════════════════════════════════════════

  Before Auto-Fix (Iteration {N}):
  - Score: {old_score}/100
  - Issues: {old_issues_count}

  After Auto-Fix (Iteration {N+1}):
  - Score: {new_score}/100 (+{improvement} pts)
  - Issues: {new_issues_count} (-{fixed_count} fixed)

  Remaining Issues:
  - 🔴 CRITICAL: {count}
  - 🟡 HIGH: {count}
  - Manual fixes required: {count}

  <if (new_score >= 80)>
  ✅ Roadmap ready for implementation!
  Next step: /implementation:implement-roadmap {roadmap_file}
  </if>
  <if (new_score < 80)>
  ⚠️ Manual fixes still required for implementation readiness.
  Review issues above, apply remaining fixes, then re-run validation.
  </if>
  ```

</if>

## Phase 11: Update Memory & Exit

- **STEP 11A**: Use mcp__memory__create_entities or mcp__memory__add_observations:
  - name: "RoadmapValidation_{roadmap_name}"
  - entityType: "roadmap_validation"
  - observations:
    - "roadmap_file: {path}"
    - "iteration: {N}"
    - "validated_date: {timestamp}"
    - "overall_score: {score}/100"
    - "grade: {grade}"
    - "structure_score: {score}/20"
    - "technical_score: {score}/25"
    - "feasibility_score: {score}/25"
    - "completeness_score: {score}/20"
    - "quality_score: {score}/10"
    - "critical_issues: {count}"
    - "high_issues: {count}"
    - "medium_issues: {count}"
    - "low_issues: {count}"
    - "auto_fixes_applied: {count}"
    - "manual_fixes_required: {count}"
    - "ready_for_implementation: {bool}"

- **STEP 11B**: Display final summary:
  ```
  ═══════════════════════════════════════════
  VALIDATION SUMMARY
  ═══════════════════════════════════════════

  Roadmap: {roadmap_name}
  Score: {score}/100 ({grade})
  Status: {READY ✅ | NEEDS FIXES ⚠️}

  Next Steps:
  <if (ready)>
  1. Implement roadmap: /implementation:implement-roadmap {roadmap_file}
  </if>
  <if (not ready)>
  1. Apply {count} manual fixes (see "MANUAL FIXES REQUIRED" above)
  2. Re-run validation: /validation:validate-roadmap {roadmap_file}
  3. When score ≥ 80: /implementation:implement-roadmap {roadmap_file}
  </if>
  ```

**IMPORTANT NOTES**:
- Validates roadmap against project standards and architecture
- **Console-only output** (no file generation) like other validation commands
- Displays comprehensive validation results with scores and issues
- Auto-fixes structural and technical issues where possible
- Manual fix instructions include examples and effort estimates
- Displays before/after snippets for all auto-fixes
- Iterative improvement with score tracking
- Requires 80+ score for implementation readiness
- Memory tracks validation history for fast lookups
- Designed for agentic AI coding (no time/cost concerns)
- Focus on technical correctness and completeness
