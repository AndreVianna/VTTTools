---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Bash, TodoWrite]
description: Update feature specification with natural language modification requests
argument-hint: {feature_name:string} {update_details:string}
---

# Update Feature Specification Command

Updates existing feature specification based on natural language modification requests. Supports adding use cases, modifying business details, changing area assignments while maintaining architectural integrity.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Quick Reference

**Templates**:
- `.claude/templates/FEATURE_TEMPLATE.md` - Feature specification structure

**Guides**:
- `Documents/Guides/ARCHITECTURE_PATTERN.md` - DDD Contracts pattern
- `.claude/guides/COMMAND_SYNTAX.md` - DSL syntax reference

## Process

### Validation & Setup

- **STEP 0A**: Validate {feature_name} and {update_details} are not empty - abort if invalid
- **STEP 0B**: Use Glob to find feature file: "Documents/Areas/*/Features/{feature_name}.md"
  <if (not found)>
  - Display error with available features, abort
  </if>
- **STEP 0C**: Use Read tool to load feature specification
- **STEP 0D**: Use mcp__memory__search_nodes to find feature entity (optional)

### Parse Update Request

- **STEP 1A**: Use Task tool with solution-engineer agent:
  ```markdown
  ROLE: Feature Specification Update Analyst

  TASK: Parse update request and determine modification strategy

  FEATURE: {feature_name}
  UPDATE REQUEST: "{update_details}"
  CURRENT SPEC: {feature_file_content}

  ANALYSIS REQUIRED:
  1. **Update Type**:
     - ADD: New use case, secondary area, architectural element
     - MODIFY: Business value, area assignment, description
     - REMOVE: Deprecated use case, removed dependency
     - CLARIFY: Enhance vague sections

  2. **Target Sections**:
     - Business Value (user benefit, business objective, success criteria)
     - Area Assignment (primary/secondary areas, cross-area impact)
     - Use Case Breakdown (add/modify/remove use cases)
     - Architectural Integration (new interfaces, dependencies)
     - Implementation Plan (phases, priorities)

  3. **Specific Changes**:
     - Exact text modifications
     - Variables affected
     - Related section updates

  4. **Architecture Impact**:
     - Does this change area boundaries?
     - Does this affect use case area assignments?
     - Does this create new dependencies?

  OUTPUT FORMAT:
  UPDATE_TYPE: [ADD|MODIFY|REMOVE|CLARIFY]
  TARGET_SECTIONS: [sections]
  SPECIFIC_CHANGES: [detailed instructions]
  ARCHITECTURE_IMPACT: [analysis]
  READY_TO_APPLY: [yes|needs_clarification]
  <if (needs clarification)>
  QUESTIONS: [questions for user]
  </if>
  ```

- **STEP 1B**: Parse response
- **STEP 1C**: Handle clarification questions if needed

### Apply Update

- **STEP 2A**: Load FEATURE_TEMPLATE.md for structure reference
- **STEP 2B**: Apply changes based on UPDATE_TYPE:
  <case {UPDATE_TYPE}>
  <is ADD>
    - Insert new content maintaining template structure
    - <if (adding use case)>
      - Update use case breakdown section
      - Update implementation plan
      - Consider creating use case spec with /add-use-case
    </if>
  <is MODIFY>
    - Replace existing content with Edit tool
    - Update related sections for consistency
  <is REMOVE>
    - Remove content with Edit tool
    - Clean orphaned references
  <is CLARIFY>
    - Enhance existing content with additional detail
  </case>

- **STEP 2C**: Update change log:
  - Increment version (minor: 1.1.0 → 1.2.0)
  - Add change entry with date and description

### Update Memory

- **STEP 3A**:
  <if (feature entity exists)>
  - Parse updated spec for variable values
  - Use mcp__memory__add_observations to update entity
  - Store update history
  </if>

### Reporting

- **STEP 4A**: Display update summary:
  ```
  ✓ FEATURE UPDATED: {feature_name}

  Changes Applied:
  - {modification_summary}

  Affected Sections:
  - {section_list}

  New Version: {version}

  Next Steps:
  - Review {feature_file_path}
  - Run /validate-feature {feature_name}
  <if (use cases added)>
  - Create use case specs with /add-use-case
  </if>
  <if (area assignment changed)>
  - Review use case area assignments
  </if>
  ```

**IMPORTANT NOTES**:
- Updates feature specs via natural language
- Maintains FEATURE_TEMPLATE structure
- Can enrich extracted specs with business context
- Supports incremental specification enhancement
- Recommends validation after updates