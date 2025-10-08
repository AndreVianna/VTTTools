---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Bash, TodoWrite]
description: Update project specification with natural language modification requests
argument-hint: {update_details:string}
---

# Update Project Specification Command

Updates existing project specification based on natural language modification requests. Supports adding, modifying, or removing elements while maintaining architectural integrity and template structure.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Quick Reference

**Templates**:
- `.claude/templates/PROJECT_TEMPLATE.md` - Project specification structure

**Guides**:
- `Documents/Guides/ARCHITECTURE_PATTERN.md` - DDD Contracts pattern
- `.claude/guides/COMMAND_SYNTAX.md` - DSL syntax reference

## Process

### Validation & Setup

- **STEP 0A**: Validate {update_details} is not empty - abort if missing with usage guidance
- **STEP 0B**: Use Read tool to load "Documents/PROJECT.md" - abort if missing with guidance to run /create-project first
- **STEP 0C**: Extract project name from specification file header
- **STEP 0D**: Use mcp__memory__search_nodes to find project entity (optional - may not exist)

### Parse Update Request

- **STEP 1A**: Use Task tool with solution-engineer agent to analyze update request:
  ```markdown
  ROLE: Specification Update Analyst

  TASK: Parse natural language update request and determine modification strategy

  UPDATE REQUEST: "{update_details}"

  CURRENT SPECIFICATION: Documents/PROJECT.md

  ANALYSIS REQUIRED:
  1. **Update Type**: Determine what kind of update:
     - ADD: Adding new element (bounded context, use case, technology, etc.)
     - MODIFY: Changing existing element (rename, update description, change value)
     - REMOVE: Removing element (deprecated feature, removed dependency)
     - CLARIFY: Adding detail to vague/incomplete section

  2. **Target Section**: Identify which template section(s) affected:
     - Bounded Contexts
     - Domain Interactions
     - Ubiquitous Language
     - Application Layer (use cases)
     - Primary/Secondary Ports
     - Primary/Secondary Adapters
     - Technology Stack
     - Other sections

  3. **Required Changes**: Specify exact modifications needed:
     - What text to add/modify/remove
     - Which variables affected
     - Impact on related sections (dependencies)

  4. **Validation Requirements**: Check if update maintains:
     - DDD principles (bounded context integrity)
     - Clean Architecture (dependency rule)
     - Hexagonal Architecture (port/adapter pattern)
     - Template structure completeness

  OUTPUT FORMAT:
  UPDATE_TYPE: [ADD|MODIFY|REMOVE|CLARIFY]
  TARGET_SECTIONS: [list of affected sections]
  SPECIFIC_CHANGES: [detailed modification instructions]
  ARCHITECTURE_IMPACT: [how this affects DDD/Clean/Hexagonal]
  VALIDATION_CONCERNS: [any risks or constraints]
  READY_TO_APPLY: [yes|needs_clarification]
  <if (needs_clarification)>
  QUESTIONS: [list questions for user]
  </if>
  ```

- **STEP 1B**: Parse agent response
- **STEP 1C**:
  <if (needs_clarification)>
  - Display questions to user
  - Collect answers
  - Re-run agent with additional context
  </if>

### Apply Update

- **STEP 2A**: Load PROJECT_TEMPLATE.md to understand structure
- **STEP 2B**: Based on UPDATE_TYPE:
  <case {UPDATE_TYPE}>
  <is ADD>
    - Use Edit tool to insert new content in appropriate section
    - Maintain template structure and formatting
    - Update related sections if dependencies exist
  <is MODIFY>
    - Use Edit tool to replace existing content
    - Ensure consistency across related sections
  <is REMOVE>
    - Use Edit tool to remove content
    - Check for orphaned references and clean up
  <is CLARIFY>
    - Use Edit tool to expand/enhance existing content
    - Add detail without changing meaning
  </case>

- **STEP 2C**: Validate edit maintains proper markdown structure and DSL syntax
- **STEP 2D**: Save updated specification

### Update Memory

- **STEP 3A**:
  <if (project entity exists in memory)>
  - Parse updated specification to extract new variable values
  - Use mcp__memory__add_observations to update project entity with changes
  - Update version: increment minor version (e.g., 1.2.0 → 1.3.0)
  - Add change log entry with update description
  </if>

- **STEP 3B**: Store update history:
  - "update_{timestamp}: {update_details}"
  - "modified_sections: [{section_list}]"

### Validation & Reporting

- **STEP 4A**: Use Read tool to verify updated file is valid
- **STEP 4B**: Display update summary:
  ```
  ✓ PROJECT SPECIFICATION UPDATED

  Changes Applied:
  - {section}: {modification_summary}

  Modified Sections:
  - {section_list}

  New Version: {version}

  Next Steps:
  - Review Documents/PROJECT.md
  - Run /validate-project to check quality
  - Consider updating affected features if architecture changed
  ```

- **STEP 4C**: Recommend follow-up actions based on update type:
  <if (bounded contexts changed)>
  - Suggest: Review feature area assignments
  </if>
  <if (tech stack changed)>
  - Suggest: Update implementation guidance in use cases
  </if>

**IMPORTANT NOTES**:
- Updates existing project specification via natural language requests
- Maintains template structure and architecture integrity
- No project_name argument - auto-finds specification file
- Supports incremental enrichment of extracted specifications
- Validates updates maintain architectural consistency