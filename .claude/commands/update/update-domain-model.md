---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Bash, TodoWrite]
description: Update domain model with natural language modification requests
argument-hint: {area_name:string} {update_details:string}
---

# Update Domain Model Command

Updates existing domain model specification based on natural language modification requests. Supports adding entities, modifying attributes, adding invariants, defining aggregates while maintaining DDD principles and domain purity.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Quick Reference

**Templates**:
- `.claude/templates/DOMAIN_MODEL_TEMPLATE.md` - Domain model structure

**Guides**:
- `Documents/Guides/ARCHITECTURE_PATTERN.md` - DDD Contracts pattern
- `.claude/guides/COMMAND_SYNTAX.md` - DSL syntax reference

## Process

### Validation & Setup

- **STEP 0A**: Validate {area_name} and {update_details} are not empty
- **STEP 0B**: Use Glob to find domain model: "Documents/Areas/{area_name}/DOMAIN_MODEL.md"
  <if (not found)>
  - Error: "Domain model for {area_name} not found. Run /model-domain or /extract-domain-model first."
  </if>
- **STEP 0C**: Use Read to load current domain model

### Parse Update Request

- **STEP 1A**: Use Task tool with solution-engineer agent:
  ```markdown
  ROLE: Domain Model Update Analyst

  TASK: Parse update request for domain model

  AREA: {area_name}
  UPDATE REQUEST: "{update_details}"
  CURRENT MODEL: {domain_model_content}

  UPDATE TYPES:
  - ADD_ENTITY: New domain entity
  - ADD_ATTRIBUTE: New property to entity
  - ADD_INVARIANT: New business rule/constraint
  - ADD_VALUE_OBJECT: New immutable validated type
  - ADD_AGGREGATE: Define aggregate boundary
  - ADD_DOMAIN_SERVICE: Extract complex logic
  - ADD_TERM: New ubiquitous language term
  - MODIFY: Change existing element
  - REMOVE: Delete element
  - CLARIFY: Add detail to existing

  EXAMPLES:
  - "add entity Payment with attributes Amount, Status, ProcessedAt"
  - "add attribute Email to User entity with validation: must be unique"
  - "add invariant to Asset: published assets must be public"
  - "add value object Priority with values Low, Medium, High, Critical"
  - "define Asset as aggregate root containing AssetMetadata children"
  - "add domain service AssetOwnershipValidator"

  DDD VALIDATION:
  - Entities must have identity and lifecycle
  - Value Objects must be immutable
  - Aggregates must have clear boundaries
  - Domain layer stays pure (no infrastructure)

  OUTPUT:
  UPDATE_TYPE: [type from above]
  TARGET_ELEMENT: [what's being modified]
  SPECIFIC_CHANGES: [detailed instructions]
  DDD_COMPLIANCE: [maintains domain purity? yes/no]
  READY_TO_APPLY: [yes|needs_clarification]
  ```

- **STEP 1B**: Parse response, handle clarifications if needed

### Apply Update

- **STEP 2A**: Use Edit tool to update DOMAIN_MODEL.md
- **STEP 2B**: Update change log (increment version)
- **STEP 2C**: Validate domain model structure maintained

### Update Memory

- **STEP 3A**: Update domain model entity in memory with changes
- **STEP 3B**: Store update history

### Reporting

- **STEP 4A**: Display summary:
  ```
  ✓ DOMAIN MODEL UPDATED: {area_name}

  Changes Applied:
  - {modification_summary}

  New Version: {version}

  Next Steps:
  - Review Documents/Areas/{area_name}/DOMAIN_MODEL.md
  - Run /validate-domain-model {area_name}
  - If use cases affected: Update use case specs
  - If domain implemented: May need to regenerate via /implement-domain
  ```

**IMPORTANT NOTES**:
- Updates domain model via natural language
- Maintains DDD principles and domain purity
- Can enrich extracted models with missing details
- Can refine greenfield models based on implementation learnings
- Updates trigger potential code regeneration in Phase 2