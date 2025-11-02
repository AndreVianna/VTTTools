---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, Write, Bash, TodoWrite
description: Create domain model specification for bounded context
argument-hint: {area_name:string} {area_description:string:optional}
---

# Add Domain

Create comprehensive domain model specification for bounded context following DDD principles.

## 1. Validation
- Validate area_name non-empty
- Verify SOLUTION.md exists
- Check DOMAIN_MODEL_TEMPLATE.md exists
- Initialize domain entity in memory with status: analyzing

## 2. Domain Analysis
Delegate to solution-engineer:
```
ROLE: DDD Domain Modeler

TASK: Model domain "{area_name}" (description: {area_description}) following DDD principles

ANALYSIS REQUIRED:
1. ENTITIES: Aggregate roots, entities with identity, properties, invariants
2. VALUE OBJECTS: Immutable domain concepts with validation rules
3. AGGREGATES: Consistency boundaries (root + members)
4. DOMAIN SERVICES: Business logic not belonging to entities
5. DOMAIN EVENTS: State change notifications with payloads
6. REPOSITORIES: Persistence interfaces (entity → data)
7. UBIQUITOUS LANGUAGE: Domain terminology (10+ terms with definitions)
8. BUSINESS RULES: Constraints and invariants enforced by domain

OUTPUT:
STATUS: [analysis_needed|ready]
ENTITIES: [{name, classification, properties, invariants}]
VALUE_OBJECTS: [{name, properties, immutability}]
AGGREGATES: [{root, members, boundary_rule}]
DOMAIN_SERVICES: [{name, purpose, operations}]
UBIQUITOUS_LANGUAGE: [{concept, definition}]
BUSINESS_RULES: [{rule_id, description, enforcement}]
QUESTIONS: [if analysis_needed]
```

**If analysis_needed**: Collect user input (max 5 questions), iterate
**If ready**: Extract variables, store observations in memory

## 3. Architecture Validation
- Verify aggregates have clear roots
- Check entity relationships don't violate aggregate boundaries
- Validate domain services have clear responsibilities
- Ensure ubiquitous language is comprehensive (10+ terms)

## 4. Generate Domain Model Specification
- Load DOMAIN_MODEL_TEMPLATE.md
- Apply DSL variable substitution
- Write to: Documents/Areas/{area_name}/DOMAIN_MODEL.md
- Create area folder structure if not exists
- Update SOLUTION.md with domain reference

## 5. Generate Domain Status Tracker
- Load DOMAIN_STATUS_TEMPLATE.md
- Apply DSL substitution with initial values:
  - last_updated: {current_date}
  - status: NOT_STARTED
  - overall_grade: N/A
  - entity_count, vo_count: from analysis
  - All implementation checkboxes: unchecked
- Write to: Documents/Areas/{area_name}/DOMAIN_STATUS.md

## 6. Integration
<if (Documents/SOLUTION.md exists)>
- Update bounded contexts section
- Add domain interaction references
- Update ubiquitous language with domain terms
</if>

## 7. Description Refinement
- Use solution-engineer to create refined context purpose
- Update domain model document

## 8. Completion
Report:
```
✓ DOMAIN MODEL CREATED: {area_name}

Entities: {entity_count}
Value Objects: {vo_count}
Aggregates: {aggregate_count}
Domain Services: {service_count}
Ubiquitous Language: {term_count} terms

Created:
- Documents/Areas/{area_name}/DOMAIN_MODEL.md
- Documents/Areas/{area_name}/DOMAIN_STATUS.md

Next Steps:
- Review domain model
- Validate: /domain:validate {area_name}
- Implement domain layer: /domain:implement {area_name}
- Add features for this area: /feature:add {feature_name}
- Track progress: /domain:explain {area_name}
```

**Note**: Establishes DDD foundation for bounded context. Creates entities, value objects, aggregates, and domain language.
