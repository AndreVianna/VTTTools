---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Bash, TodoWrite]
description: Update BDD feature files with natural language modification requests
argument-hint: {bdd_name:string} {update_details:string}
---

# Update BDD Feature File Command

Updates existing BDD feature files based on natural language modification requests. Supports adding scenarios, updating steps, modifying Rules, or fixing quality issues while maintaining Gherkin syntax and best practices.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Phase 0: Validation & Setup

- **STEP 0A**: Validate {bdd_name} and {update_details} are not empty - abort if invalid
- **STEP 0B**: Use Glob to find BDD file(s):
  <case {bdd_name}>
  <is area name>
    - Pattern: "Documents/Areas/{bdd_name}/**/*.feature"
  <is feature name>
    - Pattern: "Documents/Areas/*/Features/{bdd_name}/*.feature"
  <is use case name>
    - Pattern: "Documents/Areas/*/Features/*/UseCases/{bdd_name}.feature"
  <otherwise>
    - Display error with available BDD files, abort
  </case>

- **STEP 0C**: Use Read tool to load BDD file(s)

## Phase 1: Parse Update Request

- **STEP 1A**: Use Task tool with solution-engineer agent:
  ```markdown
  ROLE: BDD Feature File Update Analyst

  TASK: Parse update request and determine Gherkin modifications

  BDD FILE: {bdd_file_name}
  UPDATE REQUEST: "{update_details}"
  CURRENT CONTENT: {bdd_file_content}

  ANALYSIS REQUIRED:
  1. **Update Type**:
     - ADD_SCENARIO: Add new scenario (happy path, error, edge case, integration)
     - ADD_RULE: Add new business rule with scenarios
     - MODIFY_SCENARIO: Update existing scenario steps
     - MODIFY_RULE: Update rule statement or scenarios
     - REMOVE_SCENARIO: Remove deprecated scenario
     - FIX_LANGUAGE: Change system-centric to user-focused language
     - CONVERT_TO_OUTLINE: Convert similar scenarios to Scenario Outline

  2. **Target Elements**:
     - Feature declaration
     - Background section
     - Rule sections
     - Specific scenarios
     - Examples tables

  3. **Gherkin Changes**:
     - Exact scenario to add (complete Given/When/Then)
     - Steps to modify
     - Rule statements to add/modify
     - Examples table data

  4. **Quality Validation**:
     - Maintains user-focused language (no "the system")?
     - Proper Rule usage (concrete constraints only)?
     - Scenarios stay within 3-7 steps?
     - Each scenario tests ONE behavior?

  REFERENCE:
  - BDD_FEATURE_TEMPLATE.md for structure
  - BDD_CUCUMBER_GUIDE.md for patterns

  OUTPUT FORMAT:
  UPDATE_TYPE: [type from above]
  TARGET_ELEMENTS: [elements]
  GHERKIN_CHANGES: [complete Gherkin to add/modify]
  QUALITY_COMPLIANCE: [yes|concerns]
  <if (concerns)>
  QUALITY_CONCERNS: [issues]
  </if>
  READY_TO_APPLY: [yes|needs_clarification]
  <if (needs clarification)>
  QUESTIONS: [questions]
  </if>
  ```

- **STEP 1B**: Parse response and handle clarifications

## Phase 2: Apply Update

- **STEP 2A**: Load BDD_FEATURE_TEMPLATE.md for structure reference
- **STEP 2B**: Apply changes based on UPDATE_TYPE:
  <case {UPDATE_TYPE}>
  <is ADD_SCENARIO>
    - Determine proper location (under Feature, or under specific Rule)
    - Insert scenario maintaining proper indentation (2 spaces per level)
    - Add appropriate tags (@happy-path, @error-handling, @edge-case, @integration)
  <is ADD_RULE>
    - Insert Rule section with statement
    - Add scenarios under Rule (minimum 2: valid + invalid)
    - Maintain proper hierarchy
  <is MODIFY_SCENARIO>
    - Use Edit tool to update specific scenario steps
    - Preserve scenario structure
  <is MODIFY_RULE>
    - Update Rule statement or scenarios under it
  <is REMOVE_SCENARIO>
    - Remove scenario while preserving file structure
  <is FIX_LANGUAGE>
    - Replace system-centric language with user-focused
    - Apply transformation patterns from guide
  <is CONVERT_TO_OUTLINE>
    - Identify similar scenarios
    - Replace with single Scenario Outline
    - Create Examples table with data
  </case>

- **STEP 2C**: Validate Gherkin syntax is correct
- **STEP 2D**: Update file metadata (generation date comment if present)

## Phase 3: Reporting

- **STEP 3A**: Display update summary:
  ```
  ✓ BDD FILE UPDATED: {bdd_file_name}

  Changes Applied:
  - {modification_summary}

  <if (scenarios added)>
  Scenarios Added: {count}
  - {scenario_titles}
  </if>

  <if (language fixed)>
  Language Fixes: {count} transformations
  </if>

  <if (rules added/modified)>
  Rules Updated: {count}
  - {rule_statements}
  </if>

  Next Steps:
  - Review {bdd_file_path}
  - Run /validate-bdd {bdd_name} to check quality
  <if (scenarios added)>
  - Implement step definitions for new scenarios
  </if>
  ```

- **STEP 3B**: Recommend validation:
  - Suggest running /validate-bdd to ensure quality maintained
  - If adding scenarios, remind about step definition implementation

**IMPORTANT NOTES**:
- Updates BDD feature files via natural language
- Maintains Gherkin syntax and BDD best practices
- Useful for: adding scenarios after spec changes, fixing validation issues, converting to Scenario Outlines
- Works in both greenfield (refinement) and brownfield (enhancement) workflows
- Validates Gherkin structure after modifications