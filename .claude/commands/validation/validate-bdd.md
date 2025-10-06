---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Validate BDD feature files against Cucumber best practices and quality standards
argument-hint: {scope:string:optional(all)}
---

# BDD Feature Files Validation Command

Perform comprehensive quality validation of Cucumber BDD feature files against Gherkin best practices, BDD principles, and quality standards from BDD_FEATURE_TEMPLATE.md. Validates structure, language, coverage, and maintainability.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Phase 0: Validation & Setup

- **STEP 0A**: Parse {scope} parameter:
  <case {scope}>
  <is empty or "all">
    - Set {validation_scope} = "all_features"
    - Set {target_path} = "Documents/Areas"
  <is area name>
    - Set {validation_scope} = "area"
    - Set {target_path} = "Documents/Areas/{scope}"
    - Verify area exists using Glob
  <is feature name>
    - Set {validation_scope} = "feature"
    - Use Glob to find feature: "Documents/Areas/*/Features/{scope}/*.feature"
  <otherwise>
    - Display error: "Invalid scope. Use: 'all', area name, or feature name"
    - Show available areas and abort
  </case>

- **STEP 0B**: Validate BDD_FEATURE_TEMPLATE.md and BDD_CUCUMBER_GUIDE.md exist
- **STEP 0C**: Initialize validation tracking:
  - Set {total_files} = 0
  - Set {files_scanned} = 0
  - Set {total_issues} = 0
  - Set {critical_violations} = 0
  - Set {warnings} = 0

## Phase 1: Memory Cleanup & Initialization

- **STEP 1A**: Use mcp__memory__search_nodes to check for existing "BDD_Validation" entity
- **STEP 1B**:
  <if (BDD_Validation entity exists)>
  - Use mcp__memory__open_nodes to get all relationships
  - Use mcp__memory__delete_relations to delete all relationships
  - Use mcp__memory__delete_entities to delete related entities:
    - "BDD_Structure_Analysis"
    - "BDD_Language_Analysis"
    - "BDD_Coverage_Analysis"
    - "BDD_Maintainability_Analysis"
    - "BDD_Recommendations"
  - Use mcp__memory__delete_entities to delete "BDD_Validation"
  </if>

- **STEP 1C**: Use mcp__memory__create_entities to create fresh BDD_Validation entity:
  - name: "BDD_Validation"
  - entityType: "validation_report"
  - observations: ["scope: {validation_scope}", "validation_date: {current_date}", "status: initializing", "target_score: 80/100"]

## Phase 2: File Discovery & Collection

- **STEP 2A**: Use Glob to find all .feature files in scope:
  - Pattern: "{target_path}/**/*.feature"
  - Store file paths list
  - Count total files: {total_files}

- **STEP 2B**: Use mcp__memory__add_observations to update:
  - "total_files: {total_files}"
  - "phase: file_discovery_complete"

- **STEP 2C**: Display scan plan:
  ```
  ═══════════════════════════════════════════
  BDD VALIDATION STARTED
  ═══════════════════════════════════════════
  Scope: {validation_scope}
  Files to validate: {total_files}
  Target quality: 80/100 minimum
  ```

## Phase 3: Automated Quality Checks

<foreach {feature_file} in {feature_files}>

- **STEP 3A**: Use Read tool to load feature file content
- **STEP 3B**: Increment {files_scanned}

### Structure Quality Checks (25 points possible)

- **CHECK 3B1**: Feature has user story format (As/I want/So that) - 5pts
  - Use Grep with pattern: "As a .* I want .* So that"
  - <if (not found)>
    - Deduct 5pts, add critical issue: "Missing user story format"
  </if>

- **CHECK 3B2**: Background contains ONLY user context - 5pts
  - Use Grep in Background section for: "the system|the application|the service"
  - <if (found)>
    - Deduct 5pts, add critical issue: "Background contains system state"
  </if>

- **CHECK 3B3**: Rule usage appropriate - 5pts
  - Count Rule keywords: Use Grep pattern "^  Rule:"
  - <if (Rules exist)>
    - For each Rule, verify 2+ scenarios under it
    - Verify Rule statement is concrete constraint (not workflow/category)
    - <if (Rule used incorrectly)>
      - Deduct 5pts, add warning: "Rule misused for {description}"
    </if>
  </if>

- **CHECK 3B4**: Scenario titles descriptive - 5pts
  - Use Grep pattern: "Scenario: (.+)"
  - Check for vague titles: "Test", "Check", "Verify" without specifics
  - <if (>20% vague titles)>
    - Deduct 3pts, add warning: "Scenario titles lack specificity"
  </if>

- **CHECK 3B5**: Gherkin hierarchy proper - 5pts
  - Verify Feature → Background/Rule → Scenario → Steps structure
  - Check indentation (2 spaces per level)
  - <if (hierarchy issues found)>
    - Deduct 5pts, add critical issue: "Gherkin structure violations"
  </if>

### Language Quality Checks (25 points possible)

- **CHECK 3C1**: CRITICAL - Zero "the system/application/service" - 10pts
  - Use Grep pattern: "the (system|application|service)" (case-insensitive)
  - Count total occurrences
  - <if (occurrences > 0)>
    - Deduct 10pts, add CRITICAL issue: "{count} system-centric language violations"
    - List line numbers with violations
  </if>

- **CHECK 3C2**: Declarative user-focused language - 5pts
  - Check for imperative patterns: "click", "navigate to URL", "find element"
  - <if (>5 imperative steps found)>
    - Deduct 3pts, add warning: "Imperative implementation details in steps"
  </if>

- **CHECK 3C3**: Business terminology used - 5pts
  - Verify domain terms appear (not generic CRUD)
  - <if (only generic terms)>
    - Deduct 2pts, add suggestion: "Use domain-specific terminology"
  </if>

- **CHECK 3C4**: Consistent verb tenses - 5pts
  - Check for tense mixing in Then steps
  - <if (inconsistent tenses found)>
    - Deduct 2pts, add warning: "Inconsistent verb tenses"
  </if>

### Coverage Completeness Checks (30 points possible)

- **CHECK 3D1**: Happy path scenarios present - 10pts
  - Use Grep for @happy-path tag or scenario titles with "Successfully", "Complete"
  - <if (no happy path found)>
    - Deduct 10pts, add CRITICAL: "Missing happy path scenarios"
  </if>

- **CHECK 3D2**: Business rules tested - 10pts
  - <if (Rules exist)>
    - For each Rule, verify valid + invalid scenarios
    - <if (Rules missing invalid cases)>
      - Deduct 5pts per Rule, add warning: "Rule missing invalid case"
    </if>
  </if>

- **CHECK 3D3**: Error scenarios included - 5pts
  - Use Grep for @error-handling tag or "error", "fail", "reject" in titles
  - <if (no error scenarios)>
    - Deduct 5pts, add warning: "Missing error handling scenarios"
  </if>

- **CHECK 3D4**: Edge cases addressed - 5pts
  - Use Grep for @edge-case tag or "empty", "maximum", "minimum", "boundary"
  - <if (no edge cases AND file is use case level)>
    - Deduct 3pts, add suggestion: "Consider edge case scenarios"
  </if>

### Maintainability Checks (20 points possible)

- **CHECK 3E1**: Scenarios average 3-7 steps - 10pts
  - Count steps per scenario (Given/When/Then/And lines)
  - Calculate average steps
  - Count scenarios >7 steps
  - <if (average >7 OR >20% scenarios exceed 7)>
    - Deduct 5pts, add warning: "Scenarios too verbose"
    - List scenarios exceeding 7 steps
  </if>

- **CHECK 3E2**: Each scenario tests ONE behavior - 5pts
  - Check for multiple When-Then pairs in single scenario
  - <if (multiple When-Then found in >10% scenarios)>
    - Deduct 3pts, add warning: "Scenarios testing multiple behaviors"
  </if>

- **CHECK 3E3**: Logical organization and tagging - 5pts
  - Verify tags present: Use Grep for "@"
  - Check for standard tags: @happy-path, @error-handling, @edge-case
  - <if (no tags OR inconsistent tagging)>
    - Deduct 2pts, add suggestion: "Improve tagging consistency"
  </if>

### Calculate File Score

- **STEP 3F**: Sum all dimension scores:
  - {structure_score} = 25 - deductions
  - {language_score} = 25 - deductions
  - {coverage_score} = 30 - deductions
  - {maintainability_score} = 20 - deductions
  - {total_score} = sum of all dimensions

- **STEP 3G**: Determine grade:
  <case {total_score}>
  <is >= 90>
    - Set {grade} = "Excellent"
  <is >= 80>
    - Set {grade} = "Good"
  <is >= 70>
    - Set {grade} = "Acceptable"
  <otherwise>
    - Set {grade} = "Needs Work"
    - Increment {critical_violations}
  </case>

- **STEP 3H**: Store file results in memory:
  - Use mcp__memory__add_observations for file analysis:
    - "file_{files_scanned}: {file_path}"
    - "score_{files_scanned}: {total_score}/100"
    - "grade_{files_scanned}: {grade}"
    - "structure_{files_scanned}: {structure_score}/25"
    - "language_{files_scanned}: {language_score}/25"
    - "coverage_{files_scanned}: {coverage_score}/30"
    - "maintainability_{files_scanned}: {maintainability_score}/20"
    - "issues_{files_scanned}: [{issue_list}]"

- **STEP 3I**: Display progress:
  ```
  [{files_scanned}/{total_files}] {filename}: {total_score}/100 ({grade})
  ```

</foreach>

## Phase 4: Aggregate Analysis & Statistics

- **STEP 4A**: Calculate overall statistics:
  - Average score across all files
  - Count files by grade (Excellent, Good, Acceptable, Needs Work)
  - Total issues by type (critical, warnings, suggestions)
  - Most common issues identified

- **STEP 4B**: Use mcp__memory__add_observations to store aggregates:
  - "average_score: {average}"
  - "excellent_count: {count}"
  - "good_count: {count}"
  - "acceptable_count: {count}"
  - "needs_work_count: {count}"
  - "total_critical_issues: {count}"
  - "total_warnings: {count}"
  - "total_suggestions: {count}"

## Phase 5: Pattern Analysis

- **STEP 5A**: Identify common quality patterns:
  - Most frequent violations
  - Files with lowest scores
  - Areas needing attention
  - Best practice examples to follow

- **STEP 5B**: Use Task tool with code-reviewer agent for deeper analysis on files scoring <80:
  ```markdown
  ROLE: BDD Quality Improvement Analyst

  TASK: Analyze below-target BDD files and provide specific improvement recommendations

  FILES BELOW TARGET (<80):
  {list_of_files_with_scores}

  TEMPLATE STANDARDS: .claude/templates/BDD_FEATURE_TEMPLATE.md
  GUIDE REFERENCE: .claude/guides/BDD_CUCUMBER_GUIDE.md

  For each file, provide:
  1. Specific issues preventing target score
  2. Concrete refactoring recommendations
  3. Example improvements (before/after)
  4. Priority level (critical, high, medium, low)

  OUTPUT: Detailed improvement roadmap for each file.
  ```

## Phase 6: Generate Validation Report

- **STEP 6A**: Create comprehensive validation report with sections:

### Report Structure:

```markdown
═══════════════════════════════════════════════════════════════
BDD FEATURE FILES VALIDATION REPORT
═══════════════════════════════════════════════════════════════

**Validation Date**: {current_date}
**Scope**: {validation_scope}
**Files Validated**: {total_files}
**Target Quality**: 80/100 minimum

## OVERALL ASSESSMENT

**Average Score**: {average_score}/100
**Status**: {PASS if >=80, FAIL if <80}

**Grade Distribution**:
- Excellent (90-100): {count} files ({percentage}%)
- Good (80-89): {count} files ({percentage}%)
- Acceptable (70-79): {count} files ({percentage}%)
- Needs Work (<70): {count} files ({percentage}%)

## QUALITY BY DIMENSION

| Dimension | Average | Target | Status |
|-----------|---------|--------|--------|
| Structure | {avg}/25 | 20/25 | {✅ or ⚠️} |
| Language | {avg}/25 | 20/25 | {✅ or ⚠️} |
| Coverage | {avg}/30 | 24/30 | {✅ or ⚠️} |
| Maintainability | {avg}/20 | 16/20 | {✅ or ⚠️} |

## CRITICAL ISSUES ({count})

<foreach {critical_issue} in {critical_issues}>
- **{file_path}** (Line {line}): {issue_description}
</foreach>

## WARNINGS ({count})

<foreach {warning} in {warnings}>
- **{file_path}**: {warning_description}
</foreach>

## FILES NEEDING ATTENTION

<if (files with score <80 exist)>
### Below Target (<80 score)

<foreach {file} in {below_target_files}>
**{file_path}**: {score}/100
- Structure: {structure_score}/25
- Language: {language_score}/25
- Coverage: {coverage_score}/30
- Maintainability: {maintainability_score}/20

**Issues**:
{issue_list}

**Recommendations**:
{specific_improvements}
</foreach>
</if>

## TOP PERFORMERS

<foreach {file} in {top_5_files}>
**{file_path}**: {score}/100 ⭐
- Strengths: {strengths}
</foreach>

## COMMON PATTERNS

### ✅ Strengths Across Files
{common_strengths}

### ⚠️ Common Issues
{common_issues}

### 💡 Improvement Opportunities
{improvement_opportunities}

## RECOMMENDATIONS

### Immediate Actions (Critical)
{critical_recommendations}

### Short-Term Improvements (High Priority)
{high_priority_recommendations}

### Long-Term Enhancements (Medium Priority)
{medium_priority_recommendations}

## VALIDATION METRICS

- **System Language Violations**: {count} occurrences across {file_count} files
- **Background Violations**: {count} files with system state in Background
- **Rule Misuse**: {count} files using Rule for workflows/categories
- **Verbose Scenarios**: {count} scenarios exceeding 7 steps
- **Missing Coverage**: {count} files missing error/edge scenarios
- **Scenario Outlines**: {count} data-driven tests (target: 20+)
- **Integration Scenarios**: {count} cross-area tests (target: 15+)

## NEXT STEPS

<if ({critical_violations} > 0)>
1. **Address critical violations**: {critical_violations} issues requiring immediate attention
2. **Review files scoring <70**: {count} files need comprehensive revision
</if>

<if ({average_score} < 80)>
3. **Systematic improvements needed** to reach 80/100 minimum target
4. **Estimated effort**: {hours} hours based on issue count
</if>

<if ({average_score} >= 80)>
✅ **BDD quality standards met!** Continue maintaining quality in future files.
</if>

═══════════════════════════════════════════════════════════════
```

- **STEP 6B**: Calculate projected scores if improvements applied

## Phase 7: Display Proposed Improvements (Section 2)

- **STEP 7A**: Categorize all issues by priority:
  - 🔴 CRITICAL: System language violations, Background system state, missing coverage
  - 🟡 HIGH: Rule misuse, verbose scenarios, missing Scenario Outlines
  - 🟢 MEDIUM: Tagging inconsistencies, organization improvements
  - 🔵 LOW: Minor wording improvements, additional edge cases

- **STEP 7B**: Display Section 2:
  ```
  ═══════════════════════════════════════════
  PROPOSED IMPROVEMENTS
  ═══════════════════════════════════════════

  🔴 CRITICAL ({count})
  1. [{FILE}] System-centric language violations
     Current: "{the system should validate}" found in {count} steps
     Required: Replace with "my input should be validated"
     Impact: +10 pts | Effort: Low

  2. [{FILE}] Background contains system state
     Current: "Given the system supports X"
     Required: "Given X is available" or remove
     Impact: +5 pts | Effort: Low

  🟡 HIGH ({count})
  3. [{FILE}] Rule used for workflow grouping
     Current: "Rule: User Registration Flow"
     Recommended: Remove Rule, list scenarios directly
     Impact: +5 pts | Effort: Low

  🟢 MEDIUM ({count})
  {improvements}

  🔵 LOW ({count})
  {improvements}
  ```

## Phase 8: Apply Changes (Section 3)

- **STEP 8A**: Display Section 3:
  ```
  ═══════════════════════════════════════════
  APPLY IMPROVEMENTS?
  ═══════════════════════════════════════════
  Total: {count} ({C}C + {H}H + {M}M + {L}L)
  Impact: {current_avg} → {projected_avg} (+{delta} pts)
  Effort: ~{hours} hours

  Options:
  1. Apply CRITICAL only
  2. Apply CRITICAL + HIGH
  3. Apply CRITICAL + HIGH + MEDIUM (ALL except LOW)
  4. Apply ALL
  5. Interactive review (approve each)
  6. Skip - I'll fix manually

  [Enter 1-6]:
  ```

- **STEP 8B**: Collect user choice
- **STEP 8C**:
  <case {user_choice}>
  <is 1>
    - Apply CRITICAL improvements only
  <is 2>
    - Apply CRITICAL + HIGH improvements
  <is 3>
    - Apply CRITICAL + HIGH + MEDIUM improvements
  <is 4>
    - Apply ALL improvements (including LOW)
  <is 5>
    - For each improvement, display and ask "Apply this fix? [Y/N]"
    - Apply if user answers Y
  <is 6>
    - Skip auto-fix, exit command
  </case>

- **STEP 8D**: Apply selected improvements:
  - Use Edit tool for language transformations
  - Use Edit tool for Background fixes
  - Use Edit tool for Rule restructuring
  - Use Edit/Write for adding missing scenarios

- **STEP 8E**: Store applied improvements in memory:
  - "improvements_applied_{iteration}: [{list}]"
  - "files_modified_{iteration}: {count}"

- **STEP 8F**: Auto re-run validation (recursive call to this command)
- **STEP 8G**: Display iteration comparison:
  ```
  Iteration {previous}: {old_score}/100
  Iteration {current}: {new_score}/100
  Improvement: +{delta} points

  Remaining issues: {count}
  ```

- **STEP 8H**: If issues remain, offer to continue or exit

## Phase 9: Update Memory with Final Results

- **STEP 9A**: Use mcp__memory__add_observations to finalize BDD_Validation entity:
  - "status: validation_complete"
  - "iteration: {iteration}"
  - "phase: complete"
  - "average_score: {average_score}"
  - "total_issues: {total_issues}"
  - "critical_violations: {critical_violations}"
  - "files_below_target: {count}"
  - "validation_passed: {true if average >= 80}"

- **STEP 7B**: Create analysis entities for tracking:
  - Use mcp__memory__create_entities for:
    - "BDD_Structure_Analysis" with structure findings
    - "BDD_Language_Analysis" with language findings
    - "BDD_Coverage_Analysis" with coverage findings
    - "BDD_Maintainability_Analysis" with maintainability findings

- **STEP 7C**: Create relationships:
  - Use mcp__memory__create_relations:
    - "BDD_Validation" → "BDD_Structure_Analysis" (relationType: "contains")
    - "BDD_Validation" → "BDD_Language_Analysis" (relationType: "contains")
    - "BDD_Validation" → "BDD_Coverage_Analysis" (relationType: "contains")
    - "BDD_Validation" → "BDD_Maintainability_Analysis" (relationType: "contains")

## Phase 8: Actionable Recommendations

<if ({critical_violations} > 0 OR {average_score} < 80)>

- **STEP 8A**: Generate improvement plan using Task tool with solution-engineer agent:
  ```markdown
  ROLE: BDD Quality Improvement Strategist

  TASK: Create prioritized improvement plan for BDD files below quality target

  VALIDATION RESULTS:
  - Files below 80: {count}
  - Critical violations: {count}
  - Average score: {average_score}/100

  Create action plan with:
  1. Quick wins (1-2 hours, high impact)
  2. Systematic improvements (4-8 hours, medium impact)
  3. Long-term enhancements (ongoing, continuous improvement)

  Provide specific file-by-file guidance for below-target files.
  ```

- **STEP 8B**: Display improvement plan to user

</if>

<if ({average_score} >= 80)>
- **STEP 8C**: Display success message:
  ```
  ✅ BDD VALIDATION PASSED

  All {total_files} feature files meet quality standards!
  Average score: {average_score}/100

  Continue following BDD best practices for future files.
  ```
</if>

**IMPORTANT NOTES**:
- Validates against BDD_FEATURE_TEMPLATE.md and BDD_CUCUMBER_GUIDE.md
- Supports scope: all, area name, feature name, or use case name
- Iterative improvement with progress tracking
- Auto-fix for: system language, Background violations, Rule misuse, missing scenarios
- Console-only output with standardized 3-section format
- Re-runnable for continuous quality improvement
