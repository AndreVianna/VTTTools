---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Bash]
description: Generate or update BDD feature files from solution specifications following Cucumber best practices
argument-hint: {feature_name:string:optional} {use_case_name:string:optional}
---

# Generate BDD Feature Files Command

Generate or intelligently update Cucumber BDD feature files from solution specifications, following Gherkin best practices and maintaining existing manual scenarios.

## Phase 0: Validation & Setup

- **STEP 0A**:
<if ({use_case_name} provided AND {feature_name} not provided)>
  - Display error: "Cannot specify use case without feature. Usage: /generate-bdd [feature_name] [use_case_name]"
  - Show example: "/generate-bdd SmartBudgeting AnalyzeSpendingPatterns"
  - Abort operation
</if>
- **STEP 0B**:
<if ({feature_name} provided)>
  - Use mcp__memory__search_nodes to verify feature exists
  <if (feature not found)>
    - Display error with available features and abort
  </if>
</if>
- **STEP 0C**:
<if ({use_case_name} provided)>
  - Use mcp__memory__search_nodes to verify use case exists
  - Verify use case belongs to specified feature
  <if (validation fails)>
  - Display error with available use cases for feature and abort
  </if>
</if>

## Phase 1: Load BDD Generation Guidelines

- **STEP 1A**: Use Read tool to load ".claude/guides/BDD_CUCUMBER_GUIDE.md"
- **STEP 1B**: Extract comprehensive quality guidelines from enhanced guide sections:

  **Feature File Excellence**:
  - Complete feature file example (HIGH QUALITY)
  - Why excellence criteria (structure, language, coverage)

  **Scenario Pattern Library**:
  - Pattern 1: Business Rule Validation (with examples)
  - Pattern 2: Happy Path (with examples)
  - Pattern 3: Error Handling (with examples)
  - Pattern 4: Edge Case Testing (with examples)
  - Pattern 5: Data-Driven Variations (with examples)
  - Pattern 6: Integration Testing (with examples)

  **Step Writing Best Practices**:
  - Given/When/Then patterns with good/bad examples
  - Transformation rules (system-focused → user-focused)

  **Business Rule Identification**:
  - What makes a good Gherkin Rule
  - How to identify rules from specifications
  - When NOT to use Rule keyword
  - Rule extraction examples

  **Coverage Completeness Checklist**:
  - Happy path coverage requirements
  - Business rules coverage (valid + invalid)
  - Error scenarios coverage
  - Edge cases coverage
  - Integration coverage
  - Data variations coverage

  **Quality Self-Assessment Rubric**:
  - Structure Quality (25pts)
  - Language Quality (25pts)
  - Coverage Completeness (30pts)
  - Maintainability (20pts)
  - Minimum score: 80/100

- **STEP 1C**: Store all guidelines, patterns, and examples for agent reference

## Phase 2: Determine Generation Scope

- **STEP 2A**:
  <case {feature_name} and {use_case_name}
  <is both provided>
  - Set scope to "single_use_case"
  <is feature only>
  - Set scope to "feature_and_use_cases"
  <otherwise>
  - Set scope to "all_features_and_use_cases"
  </case>
- **STEP 2B**: Use mcp__memory__search_nodes to get target entities based on scope
- **STEP 2C**: Display generation plan:
  ```
  BDD GENERATION PLAN
  ────────────────────
  Scope: {scope_description}
  Features: {feature_count}
  Use Cases: {use_case_count}
  Files to generate/update: {file_count}
  ```

## Phase 2B: Deep Specification Analysis (NEW - Quality Enhancement)

<foreach entity in target_entities>

- **STEP 2B1**: Extract business rules and constraints from specifications:
  - Search observations for "must", "cannot", "requires", "should"
  - Identify concrete business constraints (e.g., "minimum 30 days", "cannot exceed income")
  - Store as {business_rules} list with format: constraint statement + rationale

- **STEP 2B2**: Extract all acceptance criteria:
  - Parse acceptance_criteria observations
  - Map each criterion to required scenario
  - Identify which patterns to apply (happy path, validation, error)
  - Store as {acceptance_criteria_map}

- **STEP 2B3**: Identify edge cases and boundary conditions:
  - Extract from error_scenarios observations
  - Identify minimum/maximum boundaries
  - Find "exactly at limit" conditions
  - Store as {edge_cases} list

- **STEP 2B4**: Catalog error conditions:
  - Parse error_scenarios observations
  - Identify all failure modes
  - Map errors to appropriate error messages
  - Store as {error_scenarios} list

- **STEP 2B5**: Map integration points:
  - Identify cross-area interactions from affected_areas
  - Note data flow between bounded contexts
  - Identify domain events published/consumed
  - Store as {integration_points} list

</foreach>

- **STEP 2B6**: Validate coverage completeness:
  - Check all acceptance criteria have scenario mappings
  - Verify business rules have valid + invalid cases
  - Ensure error conditions are covered
  - Flag any gaps for agent attention

## Phase 2C: Generate Scenario Blueprint (NEW - Quality Enhancement)

<foreach entity in target_entities>

- **STEP 2C1**: Determine Rule usage strategy:
  - <if (business_rules list has concrete constraints)>
    - Plan to use Rule keyword for each constraint
    - Map scenarios to appropriate Rules
  <else>
    - Plan NO Rule usage (direct scenario listing)
    - Group scenarios logically without Rules
  </if>

- **STEP 2C2**: Plan scenario organization:
  - Group happy path scenarios
  - Group business rule validation scenarios (under Rules if applicable)
  - Group error handling scenarios
  - Group edge case scenarios
  - Group integration scenarios (feature-level only)
  - Determine scenario execution order

- **STEP 2C3**: Map scenarios to patterns:
  - For each acceptance criterion → determine pattern (Pattern 1-6)
  - For each business rule → apply Pattern 1 (Business Rule Validation)
  - For each error condition → apply Pattern 3 (Error Handling)
  - For each edge case → apply Pattern 4 (Edge Case Testing)
  - For integration points → apply Pattern 6 (Integration Testing)
  - For data variations → apply Pattern 5 (Data-Driven)

- **STEP 2C4**: Validate scenario structure:
  - Ensure each scenario tests ONE behavior
  - Plan 3-7 steps per scenario
  - Identify common setup for Background
  - Flag scenarios needing Scenario Outline

- **STEP 2C5**: Create structured blueprint JSON:
  ```json
  {
    "use_rule_keyword": true/false,
    "business_rules": [
      {
        "rule_statement": "Budget total cannot exceed user income",
        "scenarios": [
          {"name": "Accept budget within income", "pattern": "BusinessRuleValidation", "steps": 4},
          {"name": "Reject budget exceeding income", "pattern": "BusinessRuleValidation", "steps": 5}
        ]
      }
    ],
    "direct_scenarios": [
      {"name": "Successfully create budget", "pattern": "HappyPath", "steps": 5},
      {"name": "Handle service timeout", "pattern": "ErrorHandling", "steps": 4}
    ],
    "background_steps": ["I am authenticated", "I have transaction data"],
    "scenario_outline_candidates": ["Validate with different data sets"],
    "total_scenarios": 12,
    "estimated_coverage": 95%
  }
  ```

- **STEP 2C6**: Display blueprint summary for verification:
  ```
  SCENARIO BLUEPRINT: {entity_name}
  ────────────────────────────────────────
  Use Rule Keyword: {yes/no}
  Business Rules: {count}
  Direct Scenarios: {count}
  Total Scenarios: {count}
  Pattern Distribution:
    - Happy Path: {count}
    - Business Rules: {count}
    - Error Handling: {count}
    - Edge Cases: {count}
    - Integration: {count}
    - Data-Driven: {count}
  Estimated Coverage: {percentage}%
  ```

</foreach>

## Phase 2D: Cross-Area Consistency Validation (NEW)

<if (scope includes multiple areas)>

- **STEP 2D1**: Load quality baseline from Area 1 (if exists):
  - Calculate average scenarios per file
  - Calculate average lines per file
  - Extract common patterns

- **STEP 2D2**: Set quality targets for all areas:
  - Scenarios/file: {Area 1 average} ± 2
  - Lines/file: {Area 1 average} ± 20
  - Language patterns: Match Area 1 declarative style

- **STEP 2D3**: Include targets in all agent prompts

</if>

## Phase 3: Feature-Level BDD Generation

- **STEP 3A**:
  <foreach feature in target_features>
  - Use mcp__memory__open_nodes to get feature observations and relationships
  - Get all use cases related to this feature
  - Parse feature data: name, type, purpose, user value, business objective, affected areas
  </foreach>
- **STEP 3B**: Resolve feature BDD file path:
  - Use Glob tool: "Documents/Areas/*/Features/{feature_name}.md" to find feature specification
  <if (feature spec not found)>
    - Display error: "Feature specification not found for {feature_name}"
    - List available features and abort
  </if>
  - Extract area name from found path (e.g., "Budget Management" from "Documents/Areas/Budget Management/Features/SmartBudgeting.md")
  - Set {feature_bdd_path} = "Documents/Areas/{extracted_area}/Features/{feature_name}.feature"
  - Use Bash tool: "mkdir -p 'Documents/Areas/{extracted_area}/Features'" to ensure directory exists
- **STEP 3C**:
  <if (feature BDD file exists at {feature_bdd_path})>
  - Use Read tool to load existing feature BDD content
  - Parse existing scenarios and extract:
    - Manual scenarios (tagged with @manual, @custom, @user-defined)
    - Generated scenarios to be updated
    - Comments and custom documentation
  </if>
- **STEP 3D**: Use Task tool with solution-engineer agent with EXACT prompt:
  ```markdown
  ROLE: Expert BDD Feature Generator

  TASK: Generate TOP-QUALITY Cucumber feature file using structured 4-phase approach

  FEATURE: {feature_name}

  ═══════════════════════════════════════════════════════════════════════════
  📚 BDD EXCELLENCE GUIDE (Read First)
  ═══════════════════════════════════════════════════════════════════════════

  {pattern_library_from_guide}

  SCENARIO PATTERNS:
  - Pattern 1: Business Rule Validation (Rule + valid/invalid scenarios)
  - Pattern 2: Happy Path (core success flow)
  - Pattern 3: Error Handling (failure modes)
  - Pattern 4: Edge Case Testing (boundaries)
  - Pattern 5: Data-Driven (Scenario Outline)
  - Pattern 6: Integration (cross-component)

  STEP TRANSFORMATION RULES:
  - "the system validates" → "my input is validated"
  - "the application processes" → "my request is processed"
  - "the service analyzes" → "my data is analyzed"
  - Focus on USER OUTCOMES, not system actions

  RULE KEYWORD USAGE:
  ✅ USE for concrete business constraints: "Budget total cannot exceed income"
  ❌ DON'T USE for categories/workflows: "Complete Registration Flow"
  ❌ If no concrete rules exist: Skip Rule, list scenarios directly

  📋 REFERENCE TEMPLATE:
  Follow structure from: .claude/templates/BDD_FEATURE_TEMPLATE.md
  Review embedded quality checklist at end before outputting.

  ═══════════════════════════════════════════════════════════════════════════
  📊 PHASE 1: ANALYZE SPECIFICATIONS
  ═══════════════════════════════════════════════════════════════════════════

  Review and extract from provided data:

  FEATURE DATA:
  - Type: {feature_type}
  - Purpose: {feature_purpose}
  - User Value: {user_value}
  - Business Objective: {business_objective}
  - Target Users: {target_users}
  - Use Cases: {use_case_list}
  - Cross-Area Impact: {cross_area_impact}

  ANALYSIS BLUEPRINT:
  {scenario_blueprint_json}

  EXTRACT:
  1. Business Rules (concrete constraints only)
     - Search for "must", "cannot", "requires", "minimum", "maximum"
     - Example: "Budget cannot exceed income" ✓
     - NOT: "User journey workflows" ✗

  2. Integration Points
     - Which use cases interact?
     - Cross-area data flows?
     - Domain events between contexts?

  3. User Journeys
     - What complete workflows span multiple use cases?
     - What's the critical path?

  4. Edge Cases & Errors
     - Boundary conditions?
     - Failure modes?
     - Degraded scenarios?

  ═══════════════════════════════════════════════════════════════════════════
  📐 PHASE 2: CREATE STRUCTURE BLUEPRINT
  ═══════════════════════════════════════════════════════════════════════════

  Plan scenario organization:

  DECISION: Use Rule keyword?
  - IF concrete business constraints exist → YES, create Rule per constraint
  - IF only workflows/journeys → NO, list scenarios directly under Feature

  SCENARIO ORGANIZATION:
  - Group by Rule (if using Rules)
  - OR group by type (happy path, integration, errors)

  BACKGROUND CONTENT (user context only):
  - Authentication status
  - Data prerequisites
  - NO system/infrastructure state

  SCENARIO STRUCTURE (each scenario = ONE behavior):
  - ONE Given-When-Then sequence
  - 3-7 steps target
  - If > 7 steps: split into multiple scenarios

  ═══════════════════════════════════════════════════════════════════════════
  🎯 PHASE 3: GENERATE GHERKIN (Apply Patterns)
  ═══════════════════════════════════════════════════════════════════════════

  Generate feature file following this structure:

  ```gherkin
  # Generated: {current_date}
  # Feature-level BDD for {feature_name} - Cross-use-case user journeys
  @feature @{feature_name_tag}
  Feature: {feature_name}
    As a {user_role}
    I want {feature_goal}
    So that {business_value}

    Background:
      Given {user_context_step_1}
      And {user_context_step_2}

    # If concrete business rules exist:
    Rule: {concrete_constraint_statement}

      Scenario: {valid_case_description}
        Given {valid_precondition}
        When {action}
        Then {success_outcome}

      Scenario: {invalid_case_description}
        Given {invalid_precondition}
        When {action}
        Then {appropriate_error}

    # Direct scenarios (no Rule needed):
    @happy-path @integration
    Scenario: {user_journey_description}
      Given {user_ready_state}
      When {user_action}
      Then {user_sees_outcome}
      And {observable_side_effect}

    @integration @cross-area
    Scenario: {cross_component_workflow}
      Given {multiple_components_state}
      When {action_affecting_multiple}
      Then {coordinated_outcome}
      And {data_consistency_maintained}

    @error-handling
    Scenario: {error_condition_description}
      Given {error_setup}
      When {action_triggering_error}
      Then {graceful_error_handling}
      And {system_remains_stable}

    @data-driven
    Scenario Outline: {parameterized_scenario}
      Given {parameterized_setup}
      When {parameterized_action}
      Then {parameterized_outcome}

      Examples:
        | param1 | param2 | expected |
        | val1   | val2   | result1  |
  ```

  FOR EACH SCENARIO:
  1. Choose appropriate pattern from library
  2. Use DECLARATIVE language (user-focused)
  3. Keep to 3-7 steps
  4. Test ONE behavior only

  SMART UPDATE (if existing file):
  - PRESERVE @manual, @custom, @user-defined scenarios
  - UPDATE generated scenarios with new data
  - REMOVE deprecated scenarios
  - ADD new scenarios from updated specs

  ═══════════════════════════════════════════════════════════════════════════
  ✅ PHASE 4: SELF-VALIDATE BEFORE OUTPUT
  ═══════════════════════════════════════════════════════════════════════════

  Before outputting, verify ALL criteria:

  STRUCTURE (25pts):
  □ Feature has clear user story format (As/I want/So that)
  □ Background contains ONLY user context (no system state)
  □ Rule used ONLY for concrete business constraints (or not used)
  □ Scenarios have descriptive titles
  □ Proper Gherkin hierarchy

  LANGUAGE (25pts):
  □ NO "the system/application/service" language
  □ All steps focus on user outcomes
  □ Business domain terminology used
  □ Consistent verb tenses
  □ Stakeholder-readable

  COVERAGE (30pts):
  □ Happy path scenarios present
  □ Business rules have valid + invalid scenarios
  □ Integration scenarios for cross-use-case flows
  □ Error scenarios included
  □ Edge cases addressed

  MAINTAINABILITY (20pts):
  □ Scenarios average 3-7 steps
  □ Each scenario tests ONE behavior (single When-Then)
  □ Logical organization
  □ Appropriate tag usage

  IF ANY CHECK FAILS: REVISE before outputting

  TARGET SCORE: 80/100 minimum

  ═══════════════════════════════════════════════════════════════════════════
  📤 OUTPUT
  ═══════════════════════════════════════════════════════════════════════════

  Return complete Gherkin feature file that passes all validation checks.
  ```
- **STEP 3E**: Parse agent response to extract complete Gherkin feature content
- **STEP 3F**:
  <if (existing feature BDD file)>
  - Merge generated content with preserved manual scenarios
  - Maintain file structure and organization
  - Add generation timestamp and metadata
  </if>
- **STEP 3G**: Write updated feature BDD file to {feature_bdd_path}
- **STEP 3H**: Report feature BDD generation: "Generated: {feature_bdd_path}"

## Phase 4: Use Case-Level BDD Generation

- **STEP 4A**:
  <foreach use_case in target_use_cases>
  - Use mcp__memory__open_nodes to get use case observations
  - Parse use case data: name, type, purpose, business value, acceptance criteria, error scenarios
  - Get parent feature information for context
  </foreach>
- **STEP 4B**: Resolve use case BDD file path:
  - Use Glob tool: "Documents/Areas/*/UseCases/{use_case_name}.md" to find use case specification
  <if (use case spec not found)>
    - Display error: "Use case specification not found for {use_case_name}"
    - List available use cases and abort
  </if>
  - Extract area name from found path (e.g., "Financial Reporting" from "Documents/Areas/Financial Reporting/UseCases/AnalyzeSpendingPatterns.md")
  - Set {use_case_bdd_path} = "Documents/Areas/{extracted_area}/UseCases/{use_case_name}.feature"
  - Use Bash tool: "mkdir -p 'Documents/Areas/{extracted_area}/UseCases'" to ensure directory exists
- **STEP 4C**:
  <if (use case BDD file exists at {use_case_bdd_path})>
  - Use Read tool to load existing use case BDD content
  - Parse and preserve manual scenarios and custom content
  </if>
- **STEP 4D**: Use Task tool with solution-engineer agent with EXACT prompt:
  ```markdown
  ROLE: Expert BDD Use Case Generator

  TASK: Generate TOP-QUALITY Cucumber use case feature file using structured 4-phase approach

  USE CASE: {use_case_name}
  PARENT FEATURE: {parent_feature_name}

  ═══════════════════════════════════════════════════════════════════════════
  📚 BDD PATTERNS & RULES (Apply to Use Case Testing)
  ═══════════════════════════════════════════════════════════════════════════

  Use patterns from guide for:
  - Happy Path (Pattern 2): Core use case success
  - Business Rules (Pattern 1): Validation with Rule keyword IF concrete constraints exist
  - Error Handling (Pattern 3): All error scenarios
  - Edge Cases (Pattern 4): Boundary conditions
  - Data-Driven (Pattern 5): Multiple input combinations

  STEP LANGUAGE:
  - "my data is analyzed" NOT "the system analyzes"
  - "I receive error" NOT "the application returns error"
  - Focus on USER OUTCOMES

  RULE USAGE:
  - Use Rule ONLY for concrete business constraints from specs
  - Example: "Analysis requires minimum 30 days of data"
  - Skip Rule if no concrete constraints exist

  📋 REFERENCE TEMPLATE:
  Follow structure from: .claude/templates/BDD_FEATURE_TEMPLATE.md

  IMPORTANT TEMPLATE SECTIONS:
  - Rule Section: When and how to use Rule keyword correctly
  - Scenario Requirements: Minimum 4 scenarios (scales to 12)
  - Language Guidelines: User-focused, no "the system" language
  - Quality Checklist: Review commented checklist at end before outputting

  SMART SCENARIO REQUIREMENTS (Complexity-Based):
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  MINIMUM (Simple Use Cases): 4 scenarios
  1. ✅ Happy Path (1 minimum)
  2. ✅ Validation (1 minimum)
  3. ✅ Error Handling (1 minimum)
  4. ✅ Edge Case (1 minimum)

  RECOMMENDED (Standard Use Cases): 6-8 scenarios
  + Authorization scenarios (if applicable)
  + Data-Driven scenarios (Scenario Outline with Examples)

  COMPREHENSIVE (Complex Use Cases): 10+ scenarios
  + Multiple validation scenarios (grouped under Rules)
  + Multiple error scenarios
  + Integration scenarios
  + Multiple Scenario Outlines with Examples

  FILE LENGTH TARGET: 60-120 lines (scales with complexity)
  SCENARIO COUNT: 4-12 (based on use case complexity)

  RULE KEYWORD USAGE:
  ✅ Use Rule ONLY for concrete business constraints
  ✅ Each Rule must have 2+ scenarios (valid + invalid)
  ❌ Don't use Rule for workflows, categories, or grouping

  Review embedded quality checklist before submitting final feature file.

  ═══════════════════════════════════════════════════════════════════════════
  📊 PHASE 1: EXTRACT FROM SPECIFICATIONS
  ═══════════════════════════════════════════════════════════════════════════

  USE CASE DATA:
  - Type: {use_case_type}
  - Purpose: {use_case_purpose}
  - Business Value: {business_value}
  - Target Users: {target_users}
  - Business Rules: {business_rules_applied}
  - Acceptance Criteria: {acceptance_criteria}
  - Error Scenarios: {error_scenarios}
  - Input/Output: {input_specification} → {output_specification}

  BLUEPRINT:
  {scenario_blueprint_json}

  EXTRACT:
  1. Concrete business rules (constraints with "must"/"cannot")
  2. All acceptance criteria (map each to scenario)
  3. All error conditions (invalid inputs, failures, timeouts)
  4. Edge cases (minimum/maximum boundaries, exactly-at-limit)
  5. Data variations (different valid/invalid combinations)

  ═══════════════════════════════════════════════════════════════════════════
  📐 PHASE 2: PLAN SCENARIO STRUCTURE
  ═══════════════════════════════════════════════════════════════════════════

  RULE DECISION:
  - IF business rules have concrete constraints → Use Rule keyword
  - ELSE → List scenarios directly

  SCENARIO ORGANIZATION:
  - Happy path scenarios first
  - Business rule validation (under Rules if applicable)
  - Error handling scenarios
  - Edge case scenarios
  - Data-driven variations last

  BACKGROUND (user context only):
  - User authentication
  - Data prerequisites
  - NO infrastructure state

  ═══════════════════════════════════════════════════════════════════════════
  🎯 PHASE 3: GENERATE GHERKIN
  ═══════════════════════════════════════════════════════════════════════════

  ```gherkin
  # Generated: {current_date}
  # Use case BDD for {use_case_name}
  @use-case @{area_tag} @{feature_tag}
  Feature: {use_case_name}
    As a {user_role}
    I want to {use_case_goal}
    So that {business_value}

    Background:
      Given {user_context_only}

    # If concrete business rules exist:
    Rule: {concrete_constraint}

      Scenario: {valid_case}
        Given {satisfies_constraint}
        When {action}
        Then {success}

      Scenario: {invalid_case}
        Given {violates_constraint}
        When {action}
        Then {appropriate_error}

    # Direct scenarios:
    @happy-path
    Scenario: {acceptance_criterion_1}
      Given {ready_state}
      When {user_action}
      Then {expected_outcome}

    @error-handling
    Scenario: {error_condition}
      Given {error_setup}
      When {action}
      Then {graceful_error}

    @edge-case
    Scenario: {boundary_condition}
      Given {at_boundary}
      When {action}
      Then {boundary_handling}

    @data-driven
    Scenario Outline: {data_variations}
      Given {param_setup}
      When {param_action}
      Then {param_outcome}

      Examples:
        | input | expected |
        | val1  | result1  |
  ```

  FOR EACH SCENARIO:
  - Apply appropriate pattern
  - Use declarative language
  - 3-7 steps
  - Test ONE behavior
  - Map to acceptance criteria

  ═══════════════════════════════════════════════════════════════════════════
  ✅ PHASE 4: SELF-VALIDATE
  ═══════════════════════════════════════════════════════════════════════════

  Before output, verify:

  □ All acceptance criteria have scenarios
  □ All business rules tested (valid + invalid)
  □ All error scenarios covered
  □ Edge cases included
  □ Background has ONLY user context
  □ NO "the system/application" language
  □ Each scenario = ONE behavior (single When-Then)
  □ Scenarios are 3-7 steps
  □ Rule used correctly (or not used)
  □ Proper tags applied

  TARGET: 80/100 minimum

  Return complete Gherkin that passes validation.
  ```
- **STEP 4E**: Parse agent response to extract complete Gherkin content
- **STEP 4F**:
  <if (existing use case BDD file)>
  - Merge with preserved manual content
  - Update organization and metadata
  </if>
- **STEP 4G**: Write updated use case BDD file to {use_case_bdd_path}
- **STEP 4H**: Report use case BDD generation: "Generated: {use_case_bdd_path}"

## Phase 5: Quality Validation & Metrics

- **STEP 5A**: Validate generated Gherkin structure:
  <foreach generated_bdd_file>
  - Use Read tool to load generated content
  - Parse and verify Gherkin syntax is valid
  - Check Feature/Background/Rule/Scenario hierarchy
  - Verify proper indentation and formatting
  </foreach>

- **STEP 5B**: Quality Scoring (Automated Assessment):
  <foreach generated_bdd_file>
  - **Structure Score** (0-25pts):
    - Feature has user story format: 5pts
    - Background proper (user context only): 5pts
    - Rule usage correct (or not used): 5pts
    - Scenario titles descriptive: 5pts
    - Hierarchy maintained: 5pts

  - **Language Score** (0-25pts):
    - Count occurrences of "the system/application/service": -5pts each
    - Declarative language used: 10pts
    - Business terminology: 5pts
    - Consistent tenses: 5pts
    - Stakeholder-readable: 5pts

  - **Coverage Score** (0-30pts):
    - Happy path present: 10pts
    - Business rules tested: 10pts
    - Error scenarios: 5pts
    - Edge cases: 5pts

  - **Maintainability Score** (0-20pts):
    - Average scenario length 3-7 steps: 10pts
    - Single behavior per scenario: 5pts
    - Logical organization: 5pts

  - **Total Score**: Sum all components
  - **Quality Level**:
    - 90-100: Excellent
    - 80-89: Good
    - 70-79: Acceptable
    - <70: Needs Improvement
  </foreach>

- **STEP 5C**: Log quality metrics:
  ```
  QUALITY ASSESSMENT
  ──────────────────────────────────────
  File: {file_path}
  Structure: {score}/25
  Language: {score}/25
  Coverage: {score}/30
  Maintainability: {score}/20
  ──────────────────────────────────────
  Total Score: {total}/100
  Quality Level: {level}
  ```

- **STEP 5D**: Identify improvement opportunities:
  - Flag scenarios with "the system" language
  - Note scenarios exceeding 7 steps
  - Identify missing Rule usage for business constraints
  - Report duplicate scenarios across files

## Phase 5.5: Area Completion Quality Gate (NEW)

<if (scope is "all_features_and_use_cases" AND processing by area)>

- **STEP 5.5A**: After completing each area, calculate area quality metrics:
  - Average scenarios per use case (target: 4-12 based on complexity)
  - Average lines per use case file (target: 60-120)
  - Language quality: Count "the system" occurrences (target: 0)
  - Rule usage appropriateness (Rules only for concrete constraints)
  - Checklist compliance

- **STEP 5.5B**: Display area completion report:
  ```
  ═══════════════════════════════════════════
  AREA COMPLETED: {area_name}
  ═══════════════════════════════════════════
  Files: {count}
  Avg Scenarios/Use Case: {avg} (target: 4-12)
  Avg Lines/File: {avg} (target: 60-120)
  System Language Count: {count} (target: 0)
  Rules Used Correctly: {yes/no}
  Quality Score: {score}/100

  ⚠️ QUALITY ALERTS:
  {list any files below targets}
  ```

- **STEP 5.5C**: Pause for user confirmation:
  - Display: "Review quality metrics. Continue to next area? (Y/N/R for regenerate)"
  - <if (user chooses R)>
    - Regenerate flagged files with explicit quality instructions
  </if>

</if>

## Phase 6: Generation Summary Report

- **STEP 6A**: Calculate generation statistics:
  - Files created vs updated
  - Scenarios added vs preserved vs removed
  - Coverage of features and use cases
- **STEP 6B**: Display comprehensive generation report:
  ```
  ✓ BDD GENERATION COMPLETED

  Generation Scope: {scope}

  Files Processed:
  - Feature BDD files: {feature_count} ({created_count} created, {updated_count} updated)
  - Use Case BDD files: {use_case_count} ({created_count} created, {updated_count} updated)

  Scenarios:
  - Generated: {new_scenarios_count}
  - Preserved: {preserved_scenarios_count}
  - Updated: {updated_scenarios_count}
  - Removed (deprecated): {removed_scenarios_count}

  Generated Files:
  {list_of_generated_files}

  BDD Guidelines Applied:
  - Declarative scenario writing
  - Business-focused language
  - Proper Gherkin structure
  - Tag-based organization
  - Manual scenario preservation

  Next Steps:
  - Review generated scenarios for business accuracy
  - Implement step definitions for new scenarios
  - Run BDD tests to validate implementation
  - Consider adding @manual scenarios for manual testing
  ```

## Phase 7: Validation & Recommendations

- **STEP 7A**: Verify all target entities have corresponding BDD files
- **STEP 7B**: Check for missing coverage or gaps
- **STEP 7C**: Provide recommendations:
  - Suggest additional manual scenarios if needed
  - Recommend step definition organization
  - Identify areas for test automation priority
  - Suggest BDD best practice improvements

**IMPORTANT NOTES**:
- This command generates production-ready Cucumber BDD feature files
- Follows comprehensive BDD guide principles and Gherkin best practices
- Preserves manual testing scenarios while updating generated content
- Maintains consistency between feature and use case level testing
- Provides intelligent merge capabilities for existing files
- Supports complete project BDD coverage or targeted generation