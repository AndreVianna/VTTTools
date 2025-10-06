---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Bash, TodoWrite]
description: Update technical structure specification with natural language requests
argument-hint: {update_details:string}
---

# Update Structure Command

Updates existing technical structure specification based on natural language modification requests. Supports adding/modifying/removing components, updating dependencies, and maintaining feature-component mappings.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Phase 0: Validation & Setup

- **STEP 0A**: Validate {update_details} is not empty
- **STEP 0B**: Use Read tool to load "Documents/Structure/STRUCTURE.md" - abort if missing
- **STEP 0C**: Extract solution name and platform type from structure specification
- **STEP 0D**: Use mcp__memory__search_nodes to find structure entity (optional)

## Phase 1: Parse Update Request

- **STEP 1A**: Use Task tool with solution-engineer agent to analyze update request:
  ```markdown
  ROLE: Structure Update Analyst

  TASK: Parse natural language update request and determine modification strategy

  UPDATE REQUEST: "{update_details}"
  CURRENT STRUCTURE: Documents/Structure/STRUCTURE.md
  PLATFORM: {platform_type}

  ANALYSIS REQUIRED:
  1. **Update Type**:
     - ADD_COMPONENT: Adding new project/module/package
     - MODIFY_COMPONENT: Changing existing component properties
     - REMOVE_COMPONENT: Removing component
     - UPDATE_DEPENDENCY: Changing dependencies
     - UPDATE_FEATURE_MAPPING: Changing feature-component links
     - UPDATE_LAYER: Reassigning component to different layer

  2. **Target Section**:
     - Component list (projects/modules/packages)
     - Feature-Component Mapping
     - Dependencies
     - Layer Architecture
     - Build Configuration

  3. **Affected Components**: List specific components
  4. **Affected Features**: List features whose mappings change
  5. **Impact Assessment**: Architectural implications

  6. **Cross-Reference Updates Needed**:
     - Which feature specifications need updating?
     - Which use case specifications need updating?
     - Is dependency graph affected?

  OUTPUT FORMAT:
  UPDATE_TYPE: [type]
  TARGET_SECTIONS: [sections]
  AFFECTED_COMPONENTS: [list]
  AFFECTED_FEATURES: [list]
  CROSS_REFERENCE_UPDATES: [files that need updating]
  ARCHITECTURE_IMPACT: [assessment]
  READY_TO_APPLY: [yes|needs_clarification]
  ```

- **STEP 1B**: Parse agent response
- **STEP 1C**: Handle clarification if needed

## Phase 2: Apply Structure Update

- **STEP 2A**: Based on UPDATE_TYPE:
  <case {UPDATE_TYPE}>
  <is ADD_COMPONENT>
    - Use Edit tool to add new component to appropriate section
    - Add to layer architecture section
    - Update feature mapping if feature specified
    - Add dependencies if specified
  </is>
  <is MODIFY_COMPONENT>
    - Use Edit tool to update component properties
    - Update dependencies if changed
    - Update feature mapping if changed
  </is>
  <is REMOVE_COMPONENT>
    - Use Edit tool to remove component
    - Remove from feature mappings
    - Update dependent components
    - Check for orphaned features
  </is>
  <is UPDATE_DEPENDENCY>
    - Update dependency graph
    - Validate no circular dependencies introduced
  </is>
  <is UPDATE_FEATURE_MAPPING>
    - Update bidirectional feature-component mappings
    - Ensure consistency
  </is>
  <is UPDATE_LAYER>
    - Move component to different layer
    - Validate layer dependency rules still satisfied
  </is>
  </case>

- **STEP 2B**: Update structure version (increment minor)
- **STEP 2C**: Add change log entry

## Phase 3: Update Cross-References

- **STEP 3A**: For each affected feature specification:
  - Read feature specification file
  - Update "Structure Mapping" section with new component list
  - Ensure consistency with STRUCTURE.md

- **STEP 3B**: For each affected use case specification:
  <if (component changes affect specific use cases)>
  - Read use case specification
  - Update "Technical Implementation" section
  - Update component file paths if changed
  </if>

- **STEP 3C**: Validate bidirectional consistency:
  - STRUCTURE.md feature→component mapping
  - FEATURE.md component list
  - Both match

## Phase 4: Update Memory

- **STEP 4A**:
  <if (structure entity exists in memory)>
  - Use mcp__memory__add_observations to update with changes
  - Update component list
  - Update feature mappings
  </if>

- **STEP 4B**: Update structure-feature relationships:
  <if (feature mappings changed)>
  - Delete old relationships using mcp__memory__delete_relations
  - Create new relationships using mcp__memory__create_relations
  </if>

## Phase 5: Validation & Reporting

- **STEP 5A**: Validate updated structure:
  - No broken cross-references
  - No circular dependencies introduced
  - Layer dependencies still valid

- **STEP 5B**: Display update summary:
  ```
  ✓ STRUCTURE UPDATED

  Changes Applied:
  - {change_summary}

  Components Affected: {component_count}
  Features Affected: {feature_count}
  Cross-References Updated: {cross_ref_count}

  New Version: {version}

  Next Steps:
  - Review Documents/Structure/STRUCTURE.md
  - Run /validate-structure to verify integrity
  - Check affected feature specifications
  ```

**IMPORTANT NOTES**:
- Updates technical structure via natural language
- Automatically maintains cross-references
- Updates both structure and feature specifications
- Validates architectural integrity
- Prevents breaking changes (circular dependencies, layer violations)
