---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Bash, TodoWrite]
description: Analyze business feature request and generate use case specifications
argument-hint: {feature_name:string} {feature_description:string:optional}
---

# Add Feature

Analyze business feature request against project architecture and break down into implementable use cases. Maintains DDD area boundaries and Clean Architecture principles while documenting comprehensive use case specifications.

## Parameters

- **feature_name** (required): Name of the feature in Title Case
- **feature_description** (optional): Initial description of feature request

## Process

### Validation & Setup

- Validate feature_name is not empty and contains valid characters
- Ensure Documents/Areas directory structure exists
- Validate SOLUTION_TEMPLATE.md and FEATURE_TEMPLATE.md exist
- Read solution specification to understand existing areas and architecture
- Read structure specification if exists for component mapping context
- Create feature memory entity with status "analyzing" and tracking variables

### Feature Memory Initialization

- Create feature entity in memory with entityType "feature"
- Track analysis state: analysis_complete, use_cases_identified, analysis_iterations
- Store feature_description if provided
- Create solution-feature relationship if solution entity exists
- Initialize variable tracking for all required feature attributes

### Feature Analysis

Use solution-engineer agent iteratively to analyze feature against architecture:

**Agent Objective**: Bridge business feature requests with technical use case implementation following DDD, Clean Architecture, and Hexagonal Architecture principles.

**Analysis Sequence** (Critical Order):
1. Area Assignment - Determine which areas this feature affects
2. Architecture Alignment - Ensure feature respects area boundaries
3. Use Case Identification - Break feature into area-specific use cases
4. Interface Analysis - Identify new ports/adapters needed
5. Structure Component Mapping - Map to implementing components (if structure exists)
6. Implementation Planning - Priority and dependency analysis

**Required Variables**:
- Area Assignment: target_area, secondary_areas, cross_area_impact
- Business Analysis: feature_type, feature_purpose, user_value, business_objective
- Use Case Breakdown: feature_use_cases, implementation_order
- Architecture Impact: affected_areas, new_interfaces, area_interactions
- Structure Mapping: implementing_components, new_components_required, modified_components_count
- Implementation Guidance: development_approach, testing_requirements, architecture_validation
- Change Tracking: change_log, spec_version, last_updated, update_reason

**Iterative Process**:
- Agent returns STATUS: analysis_needed or ready
- If analysis_needed: Present maximum 5 relevant questions to user, collect answers, store in memory with format "Q{number}:{question}:{answer}", continue loop
- If ready: Extract complete analysis, store all variables in memory, mark analysis_complete as true
- Track iteration count and previous questions to avoid redundancy

**Architecture Validation**:
- DDD: Each use case assigned to exactly one bounded context area
- Clean Architecture: Use cases map to Application Layer responsibilities
- Hexagonal Architecture: External dependencies have identified ports
- KISS Principle: No unnecessary cross-area dependencies or complexity

### Area Assignment & Directory Structure

- Extract primary_area and secondary_areas from analysis
- Create directory structure: Documents/Areas/{primary_area}/Features/{feature_name}
- If cross-area feature: Create Documents/Areas/Shared/Features/{feature_name}
- Update feature status in memory to "ready_for_specification"

### Specification Generation

- Load FEATURE_TEMPLATE.md (reference template for all variable placeholders)
- Parse memory observations to extract all feature variables
- Apply DSL template variable substitution (foreach loops, conditionals, Title Case)
- Write to Documents/Areas/{primary_area}/Features/{feature_name}/{feature_name}.md or Shared location
- Validate specification file created successfully
- Update memory: status "feature_complete", specification_path

### Update Solution Specification

- Read Documents/SOLUTION.md
- Extract solution metadata and current features list
- Prepare feature entry with: name, primary_area, type, description, use_case_count, specification_path
- Update solution entity in memory with new feature and incremented version
- Regenerate SOLUTION.md using SOLUTION_TEMPLATE.md with updated data
- Validate solution specification updated correctly

### Update Structure Specification

If structure exists and implementing_components identified:
- Read Documents/Structure/STRUCTURE.md
- Update "By Feature" mapping: feature → components with roles
- Update "By Component" mapping: components → feature with notes
- Create structure-feature relationships in memory for each component
- Validate bidirectional mapping consistency

### Description Refinement

- Read generated feature specification document
- Use solution-engineer agent to create refined, professional 1-2 sentence description
- Update feature description in memory (keep original_description unchanged)
- Regenerate feature specification with refined description
- Update solution specification to reflect refined feature description
- Report description evolution to user

### Completion Report

Present to user:
- Feature specification location
- Identified use case list with area assignments
- Area assignment summary
- Architecture compliance report (DDD, Clean Architecture, Hexagonal patterns, KISS principle)
- List any architecture violations with remediation suggestions
- Next steps for implementation

## Important Notes

- Bridges business feature requests with technical use case specifications
- Maintains architectural integrity through area boundary respect and DDD principles
- Documents comprehensive use case breakdown within feature specification
- Generated specifications provide clear guidance for AI-driven implementation
- Architecture violations are reported but don't block feature creation (noted for remediation)
- Description refinement ensures professional documentation quality

## Quick Reference

- **Templates**: `.claude/templates/FEATURE_TEMPLATE.md`, `.claude/templates/SOLUTION_TEMPLATE.md`
- **Architecture Standards**: DDD bounded contexts, Clean Architecture layers, Hexagonal ports/adapters
- **Area Assignment Rules**: Single area (contained), multiple areas (coordination), shared area (common functionality)
- **Next Commands**: `/add-use-case {feature_name} {use_case_name}`, `/generate-roadmap feature {feature_name}`
- **Related Specs**: Documents/SOLUTION.md, Documents/Structure/STRUCTURE.md
