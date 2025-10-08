---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Bash, TodoWrite]
description: Create detailed domain model for a bounded context through guided modeling
argument-hint: {area_name:string}
---

# Model Domain Command

Creates comprehensive domain model specification for a bounded context through guided domain-driven design modeling session. Captures entities, value objects, aggregates, domain services, and ubiquitous language needed for domain-first implementation.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Quick Reference
- **Stack Guide**: Documents/Guides/VTTTOOLS_STACK.md
- **Template**: .claude/templates/DOMAIN_MODEL_TEMPLATE.md

## Process

### Step 0: Validation & Setup

- **STEP 0A**: Validate {area_name} is not empty - abort if invalid
- **STEP 0B**: Use Read tool to verify "Documents/SOLUTION.md" exists
  <if (not found)>
  - Error: "Project specification required. Run /create-solution-spec first."
  </if>
- **STEP 0C**: Verify area exists in solution specification bounded contexts
  <if (area not found)>
  - Display available areas, abort
  </if>
- **STEP 0D**: Check if domain model already exists: "Documents/Areas/{area_name}/DOMAIN_MODEL.md"
  <if (exists)>
  - Error: "Domain model already exists. Use /update-domain-model to modify."
  </if>
- **STEP 0E**: Use Bash to create area directory: "mkdir -p Documents/Areas/{area_name}"

### Step 1: Initialize Domain Model Memory

- **STEP 1A**: Use mcp__memory__create_entities to create domain model entity:
  - name: "DomainModel_{area_name}"
  - entityType: "domain_model"
  - observations: ["area: {area_name}", "status: modeling", "modeling_complete: false"]

- **STEP 1B**: Use mcp__memory__add_observations to add variable tracking:
  - ["variables_needed: area_name,context_purpose,boundaries,domain_terms,entities,value_objects,aggregates,domain_services,business_rules,change_log"]

### Step 2: Guided Domain Modeling Session

- **STEP 2A**: Use Task tool with solution-engineer agent for iterative modeling:
  ```markdown
  ROLE: Domain-Driven Design Modeling Expert

  TASK: Guide domain modeling session for "{area_name}" bounded context

  PROJECT: Documents/SOLUTION.md
  TEMPLATE: .claude/templates/DOMAIN_MODEL_TEMPLATE.md

  OBJECTIVE: Create complete, implementation-ready domain model through guided questions

  CRITICAL DDD PRINCIPLES:
  - Domain layer is pure business logic (no infrastructure)
  - Entities have identity and lifecycle
  - Value Objects are immutable and compared by value
  - Aggregates enforce consistency boundaries
  - Domain Services handle complex multi-entity logic
  - Ubiquitous Language creates shared understanding

  MODELING SEQUENCE:
  1. UBIQUITOUS LANGUAGE (FIRST): Define core domain terms
  2. IDENTIFY ENTITIES: What are the key business objects?
  3. DEFINE ATTRIBUTES: What data does each entity contain?
  4. SPECIFY INVARIANTS: What rules must always be true?
  5. DEFINE BEHAVIOR: What can entities do?
  6. IDENTIFY VALUE OBJECTS: What concepts need validation and immutability?
  7. DEFINE AGGREGATES: How do entities cluster together?
  8. EXTRACT DOMAIN SERVICES: What logic doesn't belong to single entity?
  9. DOCUMENT DOMAIN EVENTS: What state changes notify other contexts?

  ASK QUESTIONS in this sequence. For each answer:
  - Store as observations in memory
  - Ask follow-up questions for completeness
  - Provide examples to clarify
  - Validate against DDD principles

  REQUIRED VARIABLES:
  - context_purpose: Why this bounded context exists
  - boundaries: What's included/excluded
  - domain_terms: [{ concept, definition }] (minimum 10 terms)
  - entities: [{ name, type, attributes, invariants, methods, events, relationships }]
  - value_objects: [{ name, properties, validation_rules, methods }]
  - aggregates: [{ name, root, entities, boundary_rule, invariants }]
  - domain_services: [{ name, purpose, operations, dependencies }]
  - business_rules: [{ id, category, statement, enforcement }]

  STATUS OPTIONS:
  - modeling_needed: Need more information, ask questions
  - complete: Have all required domain model details

  OUTPUT FORMAT:
  STATUS: [modeling_needed|complete]
  QUESTIONS: [list of guided questions] (if modeling_needed)
  ANALYSIS: [modeling progress assessment]
  COMPLETENESS: [what's defined, what's missing]
  NEXT_STEPS: [guidance]
  ```

- **STEP 2B**: Iterative modeling loop:
  <while ({modeling_complete} equals false)>
  - Present questions to user
  - Collect answers
  - Store answers in memory as observations
  - Re-run agent to assess completeness
  - Continue until status = complete
  </while>

### Step 3: Generate Domain Model Document

- **STEP 3A**: Use mcp__memory__open_nodes to retrieve all domain model data
- **STEP 3B**: Load DOMAIN_MODEL_TEMPLATE.md
- **STEP 3C**: Apply DSL variable substitution with collected domain data
- **STEP 3D**: Write to "Documents/Areas/{area_name}/DOMAIN_MODEL.md"
- **STEP 3E**: Use Read to verify file created successfully

### Step 4: Update Project & Memory

- **STEP 4A**: Read solution specification
- **STEP 4B**: Update project change log (increment minor version)
- **STEP 4C**: Add entry: "Domain model created for {area_name}"
- **STEP 4D**: Use mcp__memory__add_observations to finalize:
  - "status: complete"
  - "modeling_complete: true"
  - "document_path: Documents/Areas/{area_name}/DOMAIN_MODEL.md"

### Step 5: Reporting

- **STEP 5A**: Display completion summary:
  ```
  ✓ DOMAIN MODEL CREATED: {area_name}

  Bounded Context: {area_name}
  Entities: {count} defined
  Value Objects: {count} defined
  Aggregates: {count} defined
  Domain Services: {count} defined
  Business Rules: {count} documented

  Specification: Documents/Areas/{area_name}/DOMAIN_MODEL.md

  Next Steps:
  - Review domain model for completeness
  - Run /validate-domain-model {area_name}
  - Create features and use cases referencing this domain
  - In Phase 2: /implement-domain {area_name} will use this model
  ```

**IMPORTANT NOTES**:
- Creates detailed domain model for bounded context
- Enables domain-first implementation in Phase 2
- Use BEFORE creating features/use cases (or alongside)
- Greenfield approach via guided Q&A
- For brownfield, use /extract-domain-model instead
- Domain model is prerequisite for /implement-domain command