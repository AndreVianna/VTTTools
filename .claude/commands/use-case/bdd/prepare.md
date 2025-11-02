---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, Write, Edit, Glob, Bash
description: Generate or update BDD feature files from solution specifications following Cucumber best practices
argument-hint: {feature_name:string:optional} {use_case_name:string:optional}
---

# Generate BDD Feature Files Command

Generate production-ready Cucumber BDD feature files from solution specifications, following Gherkin best practices and preserving manual scenarios.

## Actions

1. **Validate inputs and determine scope**:
   - If {use_case_name} provided without {feature_name}: abort with usage example
   - If {feature_name} provided: verify feature exists in memory OR search with Glob
   - If {use_case_name} provided: verify use case exists and belongs to feature
   - Set scope: "single_use_case" OR "feature_and_use_cases" OR "all_features_and_use_cases"
   - Use memory search to get target entities
   - Display generation plan: scope, feature count, use case count, files to generate/update

2. **Load BDD excellence guide**:
   - Read ".claude/guides/BDD_CUCUMBER_GUIDE.md" completely
   - Extract: scenario patterns (1-6), step transformation rules, Rule keyword usage guidelines, coverage checklist, quality rubric (80/100 minimum)

3. **Deep specification analysis** (per entity):
   - Extract business rules (search for "must", "cannot", "requires" constraints)
   - Parse acceptance criteria (map each to scenario)
   - Identify edge cases and boundary conditions
   - Catalog error scenarios
   - Map integration points (cross-area interactions, domain events)
   - Validate coverage completeness

4. **Generate scenario blueprint** (per entity):
   - Determine Rule keyword usage (use ONLY if concrete business constraints exist)
   - Plan scenario organization (happy path, business rules under Rules, errors, edge cases, integration)
   - Map scenarios to patterns (Pattern 1-6 from guide)
   - Validate scenario structure (ONE behavior per scenario, 3-7 steps)
   - Create JSON blueprint with scenario distribution and estimated coverage
   - Display blueprint summary for verification

5. **Generate feature-level BDD** (if in scope):
   - For each target feature:
     - Resolve BDD path: "Documents/Areas/{area}/Features/{feature_name}.feature"
     - If exists: read and parse manual scenarios (@manual, @custom, @user-defined)
     - Use Task tool with solution-engineer agent:
       ```markdown
       ROLE: Expert BDD Feature Generator

       Generate TOP-QUALITY Cucumber feature file for "{feature_name}" using 4-phase approach.

       INPUTS:
       - BDD_CUCUMBER_GUIDE.md patterns and rules
       - BDD_FEATURE_TEMPLATE.md structure
       - Feature data: type, purpose, user value, use cases, cross-area impact
       - Scenario blueprint JSON

       PHASES:
       1. ANALYZE: Extract business rules (concrete constraints only), integration points, user journeys, edge cases/errors
       2. BLUEPRINT: Decide Rule keyword usage, organize scenarios, plan Background, structure each scenario (3-7 steps)
       3. GENERATE GHERKIN:
          - Feature with As/I want/So that user story
          - Background with user context only (NO system state)
          - Rule blocks ONLY for concrete business constraints
          - Direct scenarios for workflows/journeys
          - Apply scenario patterns, use declarative language
          - PRESERVE @manual scenarios if existing file
       4. SELF-VALIDATE (before output):
          - Structure (25pts): proper hierarchy, Background user-only, Rule usage correct
          - Language (25pts): NO "the system" language, user-focused, business terminology
          - Coverage (30pts): happy path, business rules valid+invalid, integration, errors, edge cases
          - Maintainability (20pts): 3-7 steps per scenario, ONE behavior each
          - TARGET: 80/100 minimum

       OUTPUT: Complete Gherkin feature file passing all validation checks.
       ```
     - Merge generated content with preserved manual scenarios
     - Write to feature BDD path

6. **Generate use case-level BDD** (if in scope):
   - For each target use case:
     - Resolve BDD path: "Documents/Areas/{area}/UseCases/{use_case_name}.feature"
     - If exists: read and parse manual scenarios
     - Use Task tool with solution-engineer agent (similar 4-phase prompt but focused on use case testing):
       ```markdown
       ROLE: Expert BDD Use Case Generator

       Generate TOP-QUALITY Cucumber use case feature file for "{use_case_name}".

       INPUTS:
       - Patterns and rules from guide
       - Use case data: type, purpose, business value, acceptance criteria, error scenarios
       - Scenario blueprint JSON

       SCENARIO REQUIREMENTS (complexity-based):
       - Minimum (simple): 4 scenarios (happy path, validation, error, edge case)
       - Recommended (standard): 6-8 scenarios (+ authorization, data-driven)
       - Comprehensive (complex): 10+ scenarios (+ multiple validations under Rules, integration)
       - File length target: 60-120 lines

       Follow same 4-phase approach: Analyze → Blueprint → Generate → Self-Validate (80/100 minimum)

       OUTPUT: Complete Gherkin that passes validation.
       ```
     - Merge with manual content
     - Write to use case BDD path

7. **Quality validation and metrics**:
   - For each generated file:
     - Validate Gherkin syntax and structure
     - Calculate quality score: Structure (0-25), Language (0-25), Coverage (0-30), Maintainability (0-20)
     - Determine quality level: Excellent (90-100), Good (80-89), Acceptable (70-79), Needs Improvement (<70)
     - Log quality assessment
     - Identify improvement opportunities (flag "the system" language, scenarios >7 steps, missing Rule usage)
   - If processing by area: calculate area-level metrics, display area completion report, pause for user confirmation

**Reporting**:
```
✓ BDD GENERATION COMPLETED

Scope: {scope_description}

Files Processed:
- Feature BDD: {feature_count} ({created} created, {updated} updated)
- Use Case BDD: {use_case_count} ({created} created, {updated} updated)

Scenarios:
- Generated: {new_count}
- Preserved: {preserved_count}
- Updated: {updated_count}
- Removed: {removed_count}

Quality:
- Avg Score: {avg_score}/100
- Files ≥ 80/100: {compliant_count}/{total_count}

Generated Files:
{file_list}

Next Steps:
- Review scenarios for business accuracy
- Implement step definitions
- Run BDD tests
```

**NOTES**:
- Follows comprehensive BDD guide and Gherkin best practices
- Uses 4-phase approach: Analyze → Blueprint → Generate → Self-Validate
- Rule keyword used ONLY for concrete business constraints
- Preserves manual scenarios while updating generated content
- Quality gate: 80/100 minimum score (enforced via self-validation)
