---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Bash, TodoWrite]
description: Update use case specification with natural language modification requests
argument-hint: {use_case_name:string} {update_details:string}
---

# Update Use Case Specification Command

Updates existing use case specification based on natural language modification requests. Supports adding error scenarios, acceptance criteria, business rules, or modifying architecture mappings while maintaining template structure.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Quick Reference

**Templates**:
- `.claude/templates/USE_CASE_TEMPLATE.md` - Use case specification structure

**Guides**:
- `Documents/Guides/ARCHITECTURE_PATTERN.md` - DDD Contracts pattern
- `.claude/guides/COMMAND_SYNTAX.md` - DSL syntax reference

## Process

### Validation & Setup

- **STEP 0A**: Validate {use_case_name} and {update_details} are not empty - abort if invalid
- **STEP 0B**: Use Glob to find use case file: "Documents/Areas/*/Features/*/UseCases/{use_case_name}.md"
  <if (not found)>
  - Display error with available use cases, abort
  </if>
- **STEP 0C**: Use Read tool to load use case specification
- **STEP 0D**: Use mcp__memory__search_nodes to find use case entity (optional)

### Parse Update Request

- **STEP 1A**: Use Task tool with solution-engineer agent:
  ```markdown
  ROLE: Use Case Specification Update Analyst

  TASK: Parse update request and determine modification strategy

  USE CASE: {use_case_name}
  UPDATE REQUEST: "{update_details}"
  CURRENT SPEC: {use_case_file_content}

  ANALYSIS REQUIRED:
  1. **Update Type**: ADD, MODIFY, REMOVE, or CLARIFY

  2. **Target Sections**:
     - Business Context (parent feature, owning area, business value)
     - Architecture Integration (Clean/Hexagonal/DDD mappings)
     - Functional Specification (input/output, business rules, error scenarios)
     - Acceptance Criteria (Given/When/Then criteria)
     - Implementation Guidance (interface contracts, testing strategy)

  3. **Specific Changes**:
     - Exact modifications needed
     - Variables affected
     - Related section updates

  4. **Quality Checks**:
     - Maintains 4+ error scenarios requirement?
     - Maintains 3+ acceptance criteria requirement?
     - Preserves architecture alignment?

  OUTPUT FORMAT:
  UPDATE_TYPE: [ADD|MODIFY|REMOVE|CLARIFY]
  TARGET_SECTIONS: [sections]
  SPECIFIC_CHANGES: [instructions]
  QUALITY_IMPACT: [checklist compliance]
  READY_TO_APPLY: [yes|needs_clarification]
  <if (needs clarification)>
  QUESTIONS: [questions]
  </if>
  ```

- **STEP 1B**: Parse response and handle clarifications

### Apply Update

- **STEP 2A**: Load USE_CASE_TEMPLATE.md for structure reference
- **STEP 2B**: Apply changes:
  <case {UPDATE_TYPE}>
  <is ADD>
    - <if (adding error scenario)>
      - Find Error Scenarios section
      - Add new scenario maintaining format consistency
      - Ensure count remains 4+
    </if>
    - <if (adding acceptance criterion)>
      - Find Acceptance Criteria section
      - Add new AC in Given/When/Then format
      - Increment AC number (AC-01, AC-02, etc.)
      - Ensure count remains 3+
    </if>
    - <if (adding business rule)>
      - Update Business Logic section
      - Add rule to business_rules_applied
    </if>
  <is MODIFY or REMOVE or CLARIFY>
    - Use Edit tool with specific changes
  </case>

- **STEP 2C**: Update change log and version

### Update Memory & Parent Feature

- **STEP 3A**: Update use case entity in memory if exists
- **STEP 3B**: Find parent feature and update its change log:
  - Read parent feature spec
  - Add change entry: "Use case {use_case_name} updated: {summary}"
  - Update parent feature file

### Reporting

- **STEP 4A**: Display summary:
  ```
  ✓ USE CASE UPDATED: {use_case_name}

  Changes Applied:
  - {modification_summary}

  Affected Sections:
  - {section_list}

  Quality Status:
  - Error Scenarios: {count}/4 minimum
  - Acceptance Criteria: {count}/3 minimum

  Next Steps:
  - Review {use_case_file_path}
  - Run /validate-use-case {use_case_name}
  - Regenerate BDD if acceptance criteria changed: /generate-bdd {feature_name} {use_case_name}
  ```

**IMPORTANT NOTES**:
- Updates use case specs via natural language
- Maintains USE_CASE_TEMPLATE structure and quality minimums
- Can enrich extracted specs with business rules and error scenarios
- Auto-updates parent feature change log
- Recommends BDD regeneration if acceptance criteria changed