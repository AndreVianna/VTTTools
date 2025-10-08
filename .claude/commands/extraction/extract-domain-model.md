---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Extract domain model from existing codebase through code analysis
argument-hint: {area_name:string:optional(all)}
---

# Extract Domain Model Command

Analyzes existing codebase to reverse-engineer domain model specification for a bounded context or all bounded contexts. Discovers entities, value objects, aggregates, domain services, and business rules from code structure and implementation.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Quick Reference

- **Stack Reference**: Documents/Guides/VTTTOOLS_STACK.md
- **Template**: .claude/templates/DOMAIN_MODEL_TEMPLATE.md
- **Output Location**: Documents/Areas/{area_name}/DOMAIN_MODEL.md

## Process: Validation & Setup

- **STEP 0A**: Parse {area_name} parameter:
  <case {area_name}>
  <is empty or "all">
    - Set {extraction_scope} = "all_areas"
    - Read solution specification to get list of bounded contexts
    - Set {areas_to_extract} = all bounded context names
  <otherwise>
    - Set {extraction_scope} = "single_area"
    - Set {areas_to_extract} = [{area_name}]
  </case>

- **STEP 0B**: Verify solution specification exists
- **STEP 0C**: For each area in {areas_to_extract}, verify area exists in project bounded contexts
  <if (any area not found)>
  - Display available areas, abort
  </if>

<foreach {area} in {areas_to_extract}>

- **STEP 0D**: Check if domain model already exists for area:
  - Use Glob: "Documents/Areas/{area}/DOMAIN_MODEL.md"
  <if (exists)>
  - Warning: "Domain model exists for {area}. Skip or overwrite? [S/O]"
  <if (user says S)>
    - Skip this area, continue with next
  </if>
  </if>

- **STEP 0E**: Locate source code for area:
  - Use Glob: "Source/{area}/**/*.cs" OR "Source/*/{area}/**/*.cs"
  - <if (no files found)>
    - Warning: "No source code found for {area}. Skip this area? [Y/N]"
    <if (Y)>
      - Continue to next area
    <else>
      - Abort entire extraction
    </if>
  </if>

## Process: Code Analysis & Discovery

- **STEP 1A**: Use Task tool with solution-engineer agent for code analysis:
  ```markdown
  ROLE: Domain Model Reverse Engineer

  TASK: Analyze existing code to extract domain model for "{area_name}"

  CODE LOCATION: Source/{area_name}/ or related folders

  ANALYSIS OBJECTIVES:

  1. **DISCOVER ENTITIES**:
     - Classes in Domain/ or similar folders
     - Classes with Id property (identity)
     - Classes with business logic methods
     - Identify aggregate roots (referenced by others, manage children)

     For each entity, extract:
     - All properties (name, type, nullable, constraints)
     - Validation logic (from constructors, setters, methods)
     - Business methods (public methods that change state)
     - Events raised (if event sourcing or domain events used)

  2. **DISCOVER VALUE OBJECTS**:
     - Immutable types with value equality
     - Types with validation in constructor
     - Enum types or constrained strings
     - Record types or classes with no identity

     For each, extract:
     - Properties
     - Validation rules (from constructor/factory)
     - Equality implementation

  3. **IDENTIFY AGGREGATES**:
     - Entity clusters that change together
     - Aggregate roots (entities that own collections)
     - Boundary rules (what's inside aggregate, what's outside)
     - Analyze: Which entities are loaded/saved together?

  4. **FIND DOMAIN SERVICES**:
     - Services in Domain layer folder
     - Complex logic involving multiple entities
     - Pure business logic (no infrastructure)

     Extract: Operations, dependencies

  5. **EXTRACT BUSINESS RULES**:
     - Validation logic in entities
     - Invariants in constructors
     - Constraints in methods
     - Guard clauses

     Document: What rule, where enforced, why it exists

  6. **BUILD UBIQUITOUS LANGUAGE**:
     - Class names → domain concepts
     - Property names → domain terms
     - Method names → domain operations
     - Comments explaining domain concepts

  EXTRACTION CONFIDENCE:
  For each extracted element, rate confidence:
  - HIGH: Clear from code structure
  - MEDIUM: Inferred from patterns
  - LOW: Guessed, needs validation

  OUTPUT FORMAT:
  Provide extracted domain model data in same structure as DOMAIN_MODEL_TEMPLATE variables:
  - entities: [{ name, attributes, invariants, methods, events, relationships, confidence }]
  - value_objects: [{ name, properties, validation, confidence }]
  - aggregates: [{ name, root, entities, boundary, confidence }]
  - domain_services: [{ name, operations, confidence }]
  - business_rules: [{ id, statement, enforcement, confidence }]
  - domain_terms: [{ concept, definition, confidence }]
  - missing_information: [what couldn't be extracted, needs human input]
  ```

- **STEP 1B**: Parse agent analysis results
- **STEP 1C**: Store extracted data in memory

## Process: Handle Extraction Gaps

- **STEP 2A**: Review missing_information from analysis
- **STEP 2B**: For items with LOW confidence or missing:
  - Ask user clarifying questions
  - Examples:
    - "Is Asset an Aggregate Root? [Y/N]"
    - "What's the invariant for the Name property? (found validation but no comment)"
    - "AssetType appears to be a value object. What validation rules apply?"
  - Collect answers
  - Update memory observations

## Process: Generate Domain Model Document

- **STEP 3A**: Use mcp__memory__open_nodes to get complete domain model data
- **STEP 3B**: Load DOMAIN_MODEL_TEMPLATE.md
- **STEP 3C**: Apply DSL variable substitution
- **STEP 3D**: Mark low-confidence items with: `[EXTRACTED - Please verify]`
- **STEP 3E**: Write to "Documents/Areas/{area_name}/DOMAIN_MODEL.md"

## Process: Update Memory & Project

- **STEP 4A**: Update solution specification change log
- **STEP 4B**: Use mcp__memory__add_observations:
  - "status: extracted"
  - "extraction_complete: true"
  - "confidence_high: {count}"
  - "confidence_medium: {count}"
  - "confidence_low: {count}"
  - "needs_review: {bool}"

</foreach>

## Process: Reporting

- **STEP 5A**: Display extraction summary:

<if ({extraction_scope} equals "single_area")>
  ```
  ✓ DOMAIN MODEL EXTRACTED: {area_name}

  From Source: Source/{area_name}/

  Extracted:
  - Entities: {count} ({high_conf} high confidence, {low_conf} need review)
  - Value Objects: {count}
  - Aggregates: {count}
  - Domain Services: {count}
  - Business Rules: {count}
  - Ubiquitous Language: {count} terms

  Confidence:
  - High: {percentage}% (clear from code)
  - Medium: {percentage}% (inferred)
  - Low: {percentage}% (needs verification)

  Output: Documents/Areas/{area_name}/DOMAIN_MODEL.md

  ⚠️  REVIEW REQUIRED:
  Items marked [EXTRACTED - Please verify]:
  - {list_of_low_confidence_items}

  Next Steps:
  - Review Documents/Areas/{area_name}/DOMAIN_MODEL.md
  - Verify low-confidence extractions
  - Use /update-domain-model to correct/clarify
  - Run /validate-domain-model {area_name}
  ```
</if>

<if ({extraction_scope} equals "all_areas")>
  ```
  ✓ DOMAIN MODELS EXTRACTED: All Areas

  Areas Processed: {total_areas}

  <foreach {area} in {areas_extracted}>
  📚 {area}:
     - Entities: {count}
     - Value Objects: {count}
     - Aggregates: {count}
     - Confidence: {high_percent}% high, {low_percent}% needs review
     - Output: Documents/Areas/{area}/DOMAIN_MODEL.md
  </foreach>

  Overall Statistics:
  - Total Entities: {total_entities}
  - Total Value Objects: {total_vos}
  - Total Aggregates: {total_aggregates}
  - Average Confidence: {avg_confidence}%

  ⚠️  AREAS NEEDING REVIEW:
  <foreach {area} in {areas_with_low_confidence}>
  - {area}: {low_confidence_count} items need verification
  </foreach>

  Next Steps:
  - Review all DOMAIN_MODEL.md files in Documents/Areas/*/
  - Run /validate-domain-model all
  - Use /update-domain-model {area} to refine any area
  - Check /solution-status to see domain model coverage
  ```
</if>

**IMPORTANT NOTES**:
- Reverse engineers domain model from existing code
- Brownfield approach - analyzes Source/ codebase
- Confidence levels indicate reliability of extraction
- Low-confidence items flagged for human review
- Use /update-domain-model to refine extracted model
- Prerequisite for domain-first implementation in Phase 2