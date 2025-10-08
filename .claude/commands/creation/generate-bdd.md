---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Bash]
description: Generate or update BDD feature files from solution specifications following Cucumber best practices
argument-hint: {feature_name:string:optional} {use_case_name:string:optional}
---

# Generate BDD Feature Files

Generate or intelligently update Cucumber BDD feature files from solution specifications, following Gherkin best practices and maintaining existing manual scenarios.

## Parameters

- `{feature_name}` - Optional feature name to generate BDD for specific feature
- `{use_case_name}` - Optional use case name (requires feature_name)

**Usage Examples**:
```bash
/generate-bdd                               # Generate for all
/generate-bdd "Asset Management"            # Specific feature
/generate-bdd "Asset Management" "CreateAsset"  # Specific use case
```

## Process

### Validation & Scope

**Validate Inputs**:
- If use_case provided without feature → error and abort
- Verify feature/use case exist in memory graph
- Display error with available entities if not found

**Determine Scope**:
- Both provided → Generate single use case BDD
- Feature only → Generate feature + all use cases
- Neither → Generate BDD for entire solution

### Specification Loading

**Load from Memory Graph**:
- Query target features and use cases from memory
- Extract: business rules, acceptance criteria, error scenarios, integration points
- Identify cross-use-case workflows for feature-level integration scenarios

**Load Templates & Guidelines**:
- Reference: `Documents/Guides/BDD_CUCUMBER_GUIDE.md` for Gherkin best practices
- Use: `.claude/templates/BDD_FEATURE_TEMPLATE.md` (if exists)

### BDD Generation (Feature-Level)

**For Each Feature** (using solution-engineer agent):

Generate feature-level BDD file covering:
- Cross-use-case user journeys
- Integration scenarios spanning multiple use cases
- Feature-level business rules

**Apply Gherkin Best Practices**:
- Declarative language (user-focused, NOT system-focused)
- Rule keyword ONLY for concrete business constraints
- Background for user context only (NO system state)
- 3-7 steps per scenario
- One behavior per scenario

**Smart Update** (if file exists):
- PRESERVE: @manual, @custom, @user-defined scenarios
- UPDATE: Generated scenarios with new specification data
- REMOVE: Deprecated scenarios
- ADD: New scenarios from updated specs

**Output**: `Documents/Areas/{area}/Features/{feature}.feature`

### BDD Generation (Use Case-Level)

**For Each Use Case** (using solution-engineer agent):

Generate use case-level BDD file covering:
- Happy path (core success flow)
- Business rule validation (valid + invalid cases)
- Error handling (all failure modes)
- Edge cases (boundary conditions)
- Data-driven variations (Scenario Outline)

**Map from Specifications**:
- Each acceptance criterion → scenario
- Each business rule → Rule with valid/invalid scenarios
- Each error scenario → error handling scenario
- Boundary conditions → edge case scenarios

**Quality Requirements**:
- Minimum 4 scenarios (simple use cases)
- 6-8 scenarios (standard complexity)
- 10+ scenarios (complex use cases)
- Target: 60-120 lines per file

**Output**: `Documents/Areas/{area}/Features/{feature}/UseCases/{use_case}.feature`

### Large-Scale Generation

**For All Features/Use Cases**:
- Process by area for organization
- Track progress with TodoWrite
- Display area completion metrics
- Optional: Pause between areas for quality review

### Quality Validation

**Post-Generation Checks**:
- Verify Gherkin syntax validity
- Count scenarios per file (ensure adequate coverage)
- Check for system-focused language ("the system", "the application")
- Verify Rule keyword used correctly
- Assess against quality rubric (80/100 minimum)

**Quality Report**:
```
File: {path}
Scenarios: {count}
Quality Score: {score}/100
Issues: {list if any}
```

### Finalization

**Generation Summary**:
- Files created vs updated count
- Scenarios generated vs preserved vs deprecated
- Coverage of features and use cases
- Quality metrics summary

**Next Steps Guidance**:
- Review generated scenarios for business accuracy
- Implement step definitions
- Run BDD tests to validate implementation
- Consider additional @manual scenarios

## Important Notes

- Generates production-ready Cucumber BDD feature files
- Preserves manually-created scenarios during updates
- Follows `Documents/Guides/BDD_CUCUMBER_GUIDE.md` principles
- Maintains consistency between feature and use case level testing
- Intelligent merge for existing files
- Quality-focused generation (80/100 minimum score)

## Quick Reference

- **Guidelines**: `Documents/Guides/BDD_CUCUMBER_GUIDE.md`
- **Templates**: `.claude/templates/BDD_FEATURE_TEMPLATE.md`
- **Output Locations**:
  - Features: `Documents/Areas/{area}/Features/{feature}.feature`
  - Use Cases: `Documents/Areas/{area}/Features/{feature}/UseCases/{use_case}.feature`
- **Next**: Implement step definitions, run `/validation:validate-bdd`

---

**CRITICAL**: Generated scenarios use declarative, user-focused language. NO "the system" language allowed. Rule keyword only for concrete business constraints.
