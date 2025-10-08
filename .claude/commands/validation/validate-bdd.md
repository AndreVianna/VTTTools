---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Validate BDD feature files against Cucumber best practices and quality standards
argument-hint: {scope:string:optional(all)}
---

# BDD Feature Files Validation

Validate Cucumber BDD feature files against Gherkin best practices, BDD principles, and quality standards.

**References**:
- Template: `.claude/templates/BDD_FEATURE_TEMPLATE.md`
- Guide: `.claude/guides/BDD_CUCUMBER_GUIDE.md`

**Target**: 80/100 minimum score

## Section 1: Setup & Discovery

**STEP 1**: Parse scope and locate files
<case {scope}>
<is empty or "all">
  - Set {target_path} = "Documents/Areas"
  - Use Glob: "{target_path}/**/*.feature"
<is area name>
  - Set {target_path} = "Documents/Areas/{scope}"
  - Verify area exists, find all .feature files
<is feature name>
  - Use Glob: "Documents/Areas/*/Features/{scope}/*.feature"
<otherwise>
  - Show error: "Invalid scope. Use: 'all', area name, or feature name"
  - Display available options and abort
</case>

**STEP 2**: Initialize memory tracking
- Use mcp__memory__search_nodes for existing "BDD_Validation" entity
- <if (exists)>Delete all relations and related entities</if>
- Use mcp__memory__create_entities:
  - name: "BDD_Validation"
  - entityType: "validation_report"
  - observations: ["scope: {scope}", "target_score: 80", "status: initializing"]

**STEP 3**: Display scan plan
```
BDD VALIDATION STARTED
Scope: {scope}
Files: {total_files}
Target: 80/100
```

## Section 2: Quality Validation

<foreach {feature_file} in {feature_files}>

**STEP 1**: Read file content and initialize score components:
- {structure_score} = 25
- {language_score} = 25
- {coverage_score} = 30
- {maintainability_score} = 20

### Structure Checks (25 pts)

**User Story Format (5pts)**
- Use Grep: "As a .* I want .* So that"
- <if (not found)>Deduct 5pts, critical: "Missing user story"</if>

**Background Usage (5pts)**
- Use Grep in Background: "the system|the application|the service"
- <if (found)>Deduct 5pts, critical: "Background contains system state"</if>

**Rule Usage (5pts)**
- Use Grep: "^  Rule:"
- <if (Rules exist)>
  - Verify each Rule has 2+ scenarios
  - Check Rule is concrete constraint (not workflow/category)
  - <if (misused)>Deduct 5pts, warning: "Rule misused"</if>
</if>

**Scenario Titles (5pts)**
- Use Grep: "Scenario: (.+)"
- Check for vague titles: "Test", "Check", "Verify" without specifics
- <if (>20% vague)>Deduct 3pts, warning: "Titles lack specificity"</if>

**Gherkin Hierarchy (5pts)**
- Verify Feature → Background/Rule → Scenario → Steps
- Check indentation (2 spaces per level)
- <if (violations)>Deduct 5pts, critical: "Structure violations"</if>

### Language Checks (25 pts)

**CRITICAL: Zero System Language (10pts)**
- Use Grep: "the (system|application|service)" (case-insensitive)
- <if (found)>
  - Deduct 10pts, CRITICAL: "{count} system-centric violations"
  - List line numbers
</if>

**Declarative Language (5pts)**
- Check for imperative: "click", "navigate to URL", "find element"
- <if (>5 found)>Deduct 3pts, warning: "Imperative implementation details"</if>

**Business Terminology (5pts)**
- Verify domain terms (not generic CRUD)
- <if (only generic)>Deduct 2pts, suggestion: "Use domain terminology"</if>

**Consistent Tenses (5pts)**
- Check Then steps for tense mixing
- <if (inconsistent)>Deduct 2pts, warning: "Inconsistent tenses"</if>

### Coverage Checks (30 pts)

**Happy Path (10pts)**
- Use Grep: "@happy-path|Successfully|Complete"
- <if (not found)>Deduct 10pts, CRITICAL: "Missing happy path"</if>

**Business Rules (10pts)**
- <if (Rules exist)>
  - Verify each Rule has valid + invalid scenarios
  - <if (missing invalid)>Deduct 5pts per Rule, warning: "Missing invalid case"</if>
</if>

**Error Handling (5pts)**
- Use Grep: "@error-handling|error|fail|reject"
- <if (not found)>Deduct 5pts, warning: "Missing error scenarios"</if>

**Edge Cases (5pts)**
- Use Grep: "@edge-case|empty|maximum|minimum|boundary"
- <if (not found AND use case level)>Deduct 3pts, suggestion: "Consider edge cases"</if>

### Maintainability Checks (20 pts)

**Scenario Length (10pts)**
- Count steps per scenario (Given/When/Then/And)
- Calculate average
- <if (average >7 OR >20% exceed 7)>
  - Deduct 5pts, warning: "Scenarios too verbose"
</if>

**Single Behavior (5pts)**
- Check for multiple When-Then pairs
- <if (>10% have multiple)>Deduct 3pts, warning: "Multiple behaviors"</if>

**Organization & Tagging (5pts)**
- Use Grep: "@"
- Check standard tags: @happy-path, @error-handling, @edge-case
- <if (no tags OR inconsistent)>Deduct 2pts, suggestion: "Improve tagging"</if>

### Calculate & Store Results

**STEP 2**: Calculate total score and grade
- {total_score} = {structure_score} + {language_score} + {coverage_score} + {maintainability_score}
- Grade: 90+ = Excellent, 80-89 = Good, 70-79 = Acceptable, <70 = Needs Work

**STEP 3**: Store in memory
- Use mcp__memory__add_observations:
  - "file_{index}: {file_path}"
  - "score_{index}: {total_score}/100"
  - "grade_{index}: {grade}"
  - "issues_{index}: [{issue_list}]"

**STEP 4**: Display progress
```
[{current}/{total}] {filename}: {score}/100 ({grade})
```

</foreach>

## Section 3: Analysis & Reporting

**STEP 1**: Calculate aggregates
- Average score
- Grade distribution (Excellent/Good/Acceptable/Needs Work)
- Total issues by type (critical/warnings/suggestions)
- Most common violations

**STEP 2**: Store aggregates in memory
- Use mcp__memory__add_observations for overall metrics

**STEP 3**: Generate validation report

```markdown
## BDD VALIDATION REPORT
───────────────────────────────────────────────────────────────

**Date**: {date}
**Scope**: {scope}
**Files**: {total_files}
**Target**: 80/100

## OVERALL ASSESSMENT

**Average Score**: {average}/100
**Status**: {PASS if >=80, FAIL if <80}

**Grade Distribution**:
- Excellent (90-100): {count} ({percentage}%)
- Good (80-89): {count} ({percentage}%)
- Acceptable (70-79): {count} ({percentage}%)
- Needs Work (<70): {count} ({percentage}%)

## QUALITY BY DIMENSION

| Dimension        | Average | Target | Status |
|-----------------|---------|--------|--------|
| Structure       | {avg}/25 | 20/25 | {status} |
| Language        | {avg}/25 | 20/25 | {status} |
| Coverage        | {avg}/30 | 24/30 | {status} |
| Maintainability | {avg}/20 | 16/20 | {status} |

## CRITICAL ISSUES ({count})

<foreach {issue} in {critical_issues}>
- **{file}** (Line {line}): {description}
</foreach>

## WARNINGS ({count})

<foreach {warning} in {warnings}>
- **{file}**: {description}
</foreach>

## FILES NEEDING ATTENTION

<if (files scoring <80 exist)>
### Below Target (<80)

<foreach {file} in {below_target}>
**{file_path}**: {score}/100
- Structure: {structure}/25
- Language: {language}/25
- Coverage: {coverage}/30
- Maintainability: {maintainability}/20

**Issues**: {issues}
**Recommendations**: {recommendations}
</foreach>
</if>

## TOP PERFORMERS

<foreach {file} in {top_5}>
**{file}**: {score}/100
- Strengths: {strengths}
</foreach>

## COMMON PATTERNS

### Strengths
{common_strengths}

### Issues
{common_issues}

### Opportunities
{improvement_opportunities}

## RECOMMENDATIONS

### Critical (Immediate)
{critical_recommendations}

### High Priority (Short-term)
{high_priority_recommendations}

### Medium Priority (Long-term)
{medium_priority_recommendations}

## NEXT STEPS

<if ({critical_violations} > 0)>
1. Address {critical_violations} critical violations immediately
2. Review {count} files scoring <70
</if>

<if ({average_score} < 80)>
3. Systematic improvements needed to reach 80/100
4. Estimated effort: {hours} hours
</if>

<if ({average_score} >= 80)>
VALIDATION PASSED! Continue maintaining quality.
</if>

───────────────────────────────────────────────────────────────
```

## Section 4: Improvement Workflow

**STEP 1**: Categorize issues by priority
- CRITICAL: System language, Background violations, missing coverage
- HIGH: Rule misuse, verbose scenarios, missing Scenario Outlines
- MEDIUM: Tagging, organization improvements
- LOW: Minor wording, additional edge cases

**STEP 2**: Display improvement options
```
## PROPOSED IMPROVEMENTS
───────────────────────────────────────────

Total: {count} ({C}C + {H}H + {M}M + {L}L)
Impact: {current_avg} → {projected_avg} (+{delta} pts)
Effort: ~{hours} hours

CRITICAL ({count})
{critical_improvements_list}

HIGH ({count})
{high_improvements_list}

MEDIUM ({count})
{medium_improvements_list}

LOW ({count})
{low_improvements_list}

Options:
1. Apply CRITICAL only
2. Apply CRITICAL + HIGH
3. Apply CRITICAL + HIGH + MEDIUM
4. Apply ALL
5. Interactive review (approve each)
6. Skip - Manual fixes

[Enter 1-6]:
```

**STEP 3**: Apply selected improvements
<case {user_choice}>
<is 1>Apply CRITICAL only
<is 2>Apply CRITICAL + HIGH
<is 3>Apply CRITICAL + HIGH + MEDIUM
<is 4>Apply ALL improvements
<is 5>Interactive approval for each
<is 6>Skip auto-fix
</case>

**STEP 4**: Apply fixes using Edit tool
- System language transformations
- Background fixes
- Rule restructuring
- Add missing scenarios

**STEP 5**: Re-run validation (recursive)
- Display iteration comparison
- Show improvement delta
- <if (issues remain)>Offer to continue</if>

**STEP 6**: Finalize memory
- Use mcp__memory__add_observations for final status
- Create analysis entities for tracking
- Create relationships between entities

## Quick Reference

- **Architecture**: `Documents/Guides/ARCHITECTURE_PATTERN.md`
- **Templates**: `.claude/templates/BDD_FEATURE_TEMPLATE.md`
- **Guides**: `.claude/guides/BDD_CUCUMBER_GUIDE.md`, `Documents/Guides/TESTING_GUIDE.md`
- **Related**: `/creation:generate-bdd`, `/update:update-bdd`

**NOTES**:
- Reference BDD_CUCUMBER_GUIDE.md for Gherkin syntax
- Console-only output (no file writes)
- Iterative improvement with progress tracking
- Auto-fix supports common violations
- Re-runnable for continuous quality
