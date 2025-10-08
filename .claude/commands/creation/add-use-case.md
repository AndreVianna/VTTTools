---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Bash, TodoWrite]
description: Create detailed use case specification for a feature within area boundaries
argument-hint: {feature_name:string} {use_case_name:string} {use_case_description:string:optional}
---

# Add Use Case

Create comprehensive use case specification following DDD, Clean Architecture, and Hexagonal Architecture principles. Supports standalone creation and coordinated creation from parent feature analysis.

## Parameters

- `{feature_name}` - Parent feature name (must exist)
- `{use_case_name}` - Use case identifier (Title Case)
- `{use_case_description}` - Optional initial description

**Usage Examples**:
```bash
/add-use-case "Asset Management" "CreateAsset"
/add-use-case "Asset Management" "CreateAsset" "Create new asset with validation"
```

## Process

### Validation

**Validate Inputs**:
- Feature name and use case name are not empty with valid characters
- Parent feature exists (check memory or filesystem)
- If feature not found: abort with error directing to /add-feature

**Load Context**:
- Read solution specification: `Documents/SOLUTION.md`
- Read structure specification if exists: `Documents/Structure/STRUCTURE.md`
- Load templates: `.claude/templates/USE_CASE_TEMPLATE.md`, `.claude/templates/SOLUTION_TEMPLATE.md`
- Extract target area from parent feature if available

### Memory Initialization

**Create Use Case Entity**:
- Entity type: "use_case"
- Initial status: "specifying"
- Store original description if provided
- Create relationship to parent feature
- Track specification completion state

### Use Case Analysis

**Guided Analysis** (using solution-engineer agent iteratively):

**Objective**: Generate implementation-ready use case specification maintaining architectural integrity

**Analysis Sequence**:
1. Area Assignment - Determine owning area
2. UI Presentation - Determine UI type and presentation details
3. Clean Architecture Mapping - Define Application Service responsibilities
4. Hexagonal Integration - Specify port operations and adapter needs
5. DDD Alignment - Ensure domain entity coordination and business rules
6. Structure Component Mapping - Map to specific code components (if structure exists)
7. Implementation Details - Input/output, validation, error handling

**Agent Iterative Process**:
- Agent analyzes current specification state
- Returns STATUS: analysis_needed or ready
- If analysis_needed: Present maximum 5 relevant questions, collect answers, store in memory
- If ready: Extract complete analysis, store all variables, mark complete
- Track iterations to avoid redundant questions

**Required Variables**:
- Business: use_case_type, use_case_purpose, user_operation, business_value
- Area: owning_area, parent_feature, target_users, use_case_scope
- UI: ui_type, access_method, ui elements, interaction_flow
- Clean Architecture: application_service_name, domain_entities_involved
- Hexagonal: primary_port_method, secondary_port_requirements, adapter_specifications
- DDD: domain_terminology, business_rules_enforced, domain_events_published
- Implementation: input/output specifications, error_scenarios, acceptance_criteria
- Testing: unit_test_requirements, integration_test_scenarios, bdd_test_outline

**Architecture Standards Enforced**:
- DDD: Operate within area boundaries (bounded context)
- Hexagonal: Define clear port operations
- Clean Architecture: Map to Application Layer
- Separation of Concerns: Single responsibility
- Well-Defined Contracts: Clear interface definitions

### Specification Generation

**Create Specification File**:
- Extract all variables from memory observations
- Load USE_CASE_TEMPLATE.md
- Apply DSL template variable substitution
- Determine output path: `Documents/Areas/{owning_area}/Features/{parent_feature}/UseCases/{use_case_name}.md`
- Write specification to determined location
- Update memory with specification_path and status "use_case_complete"

### Duplicate Detection

**Check for Duplicates**:
- Search all existing use case files
- If exact name match found in different area:
  - Promote both to Shared area
  - Update parent features to reference Shared use case
  - Move files to `Documents/Areas/Shared/Features/{feature}/UseCases/`
  - Update memory relationships
  - Report promotion to user

### Cross-Reference Updates

**Update Parent Feature**:
- Add use case to feature's use_cases list
- Increment feature version (minor version bump)
- Regenerate feature specification with updated data
- Update solution specification if needed

**Update Structure** (if exists and components identified):
- Update component mappings with new use case
- Maintain bidirectional consistency (use case → component, component → use case)
- Update STRUCTURE.md cross-references

### Description Refinement

**Final Polish**:
- Read generated specification
- Use solution-engineer agent to create refined 1-2 sentence description
- Update memory with refined description (keep original unchanged)
- Regenerate use case and parent feature specs with refined description

### Completion

**Report to User**:
- Use case specification location
- Area assignment confirmation
- Architecture integration summary
- Parent feature coordination status
- Next steps for implementation

## Important Notes

- Supports standalone and coordinated creation from parent feature
- Maintains architectural integrity (DDD, Clean Architecture, Hexagonal)
- Automatically promotes duplicate use cases to Shared area
- Iterative Q&A workflow gathers complete specification details
- Bidirectional cross-references maintained

## Quick Reference

- **Templates**: `.claude/templates/USE_CASE_TEMPLATE.md`
- **Architecture**: `Documents/Guides/VTTTOOLS_STACK.md`
- **Solution Spec**: `Documents/SOLUTION.md`
- **Next**: `/generate-roadmap use_case {use_case_name}`, `/generate-bdd {feature_name} {use_case_name}`

---

**CRITICAL**: Use case must be assigned to exactly one owning area. Cross-area features use Shared area or coordination patterns.
