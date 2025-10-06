---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Bash, TodoWrite]
description: Analyze business feature request and generate use case specifications
argument-hint: {feature_name:string} {feature_description:string:optional}
---

# Add Feature Command

Analyze business feature request against project architecture and break down into implementable use cases. Maintains DDD area boundaries and Clean Architecture principles while documenting comprehensive use case specifications.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Phase 0: Validation & Setup

- **STEP 0A**: Validate {feature_name} is not empty and contains valid characters - abort if invalid with clear error message
- **STEP 0B**: Use Bash tool: "mkdir -p Documents/Areas" to ensure area directory structure exists
- **STEP 0C**: Validate SOLUTION_TEMPLATE.md and FEATURE_TEMPLATE.md exist using Read tool - abort if missing
- **STEP 0D**: Read solution specification using Read tool: "Documents/SOLUTION.md" to understand existing areas and architecture
- **STEP 0E**: Read structure specification (if exists): "Documents/Structure/STRUCTURE.md"
  <if (structure spec exists)>
  - Extract available components, layers, and current feature mappings
  - Store for component mapping questions
  <else>
  - Set {has_structure} = false
  - Log: "No structure spec - feature will be created without component mapping"
  </if>

## Phase 1: Initialize Feature Memory

- **STEP 1A**: Use mcp__memory__create_entities to create feature entity:
  - name: "{feature_name}"
  - entityType: "feature"
  - observations: ["status: analyzing", "analysis_complete: false", "use_cases_identified: 0"]
- **STEP 1B**:
  <if ({feature_description} is not empty)>
    - Use mcp__memory__add_observations to add: ["original_description: {feature_description}", "description: {feature_description}"]
  <else>
    - Use mcp__memory__add_observations to add: ["original_description: Not provided", "description: Not provided"]
  </if>
- **STEP 1C**: Use mcp__memory__add_observations to add feature variable tracking:
  - ["variables_needed: feature_name,feature_type,feature_purpose,target_area,target_users,user_value,user_benefit,business_objective,success_criteria,primary_area,secondary_areas,cross_area_impact,affected_areas,feature_use_cases,new_interfaces,external_dependencies,implementation_order,area_interactions,data_sharing_needs,interface_contracts,dependency_strategy,development_approach,testing_requirements,architecture_validation,implementation_phases,technical_prerequisites,area_prerequisites,external_prerequisites,change_log,spec_version,last_updated,update_reason"]
- **STEP 1D**: Create solution-feature relationship:
  - Use mcp__memory__search_nodes to find solution entity
  <if (solution entity not found)>
    - Use Glob to search for "Documents/SOLUTION.md"
    <if (solution file found)>
      - Parse solution name from file header
      - Use mcp__memory__create_entities to create minimal solution entity:
        - name: "{solution_name}"
        - entityType: "solution"
        - observations: ["status: file_exists", "specification_path: Documents/SOLUTION.md"]
    <else>
      - Log warning: "Solution specification not found, feature will be created without solution relationship"
      - Continue without relationship
    </if>
  </if>
  <if (solution entity exists or was created)>
    - Use mcp__memory__create_relations to create relationship:
      - from: "{solution_name}"
      - to: "{feature_name}"
      - relationType: "contains_feature"
  </if>

## Phase 2: Feature Analysis & Area Assignment

- **STEP 2A**: Use mcp__memory__open_nodes to retrieve current state for "{feature_name}"
- **STEP 2B**: Extract and initialize control variables from memory observations:
  - Set {analysis_complete} from "analysis_complete" observation (default: false)
  - Set {use_cases_identified} from "use_cases_identified" observation (default: 0)
  - Set {analysis_iterations} from "analysis_iterations" observation (default: 0)

- **STEP 2C**: 
  <while ({analysis_complete} equals false)>
  - Use Task tool with solution-engineer agent with EXACT prompt:
    ```markdown
    ROLE: Feature Architecture Analyst

    TASK: Analyze feature request "{feature_name}" against existing project architecture and break down into area-aligned use cases.

    OBJECTIVE: Bridge business feature requests with technical use case implementation following DDD, Clean Architecture, and Hexagonal Architecture principles.

    SOLUTION SPECIFICATION: Documents/SOLUTION.md
    FEATURE TEMPLATE: .claude/templates/FEATURE_TEMPLATE.md
    TARGET OUTPUT: Documents/Areas/{area}/Features/{feature_name}.md

    📋 QUALITY CHECKLIST: Review embedded checklist at end of template (target: 80/100 minimum)

    CRITICAL ARCHITECTURE INTEGRATION:
    This analysis MUST maintain architectural integrity established in solution specification.

    MANDATORY ANALYSIS SEQUENCE:
    1. AREA ASSIGNMENT (FIRST - CRITICAL): Determine which areas this feature affects
    2. ARCHITECTURE ALIGNMENT (SECOND - CRITICAL): Ensure feature respects area boundaries
    3. USE CASE IDENTIFICATION (THIRD - CRITICAL): Break feature into area-specific use cases
    4. INTERFACE ANALYSIS (FOURTH - CRITICAL): Identify new ports/adapters needed
    5. STRUCTURE COMPONENT MAPPING (FIFTH - CRITICAL): Map to implementing components
    6. IMPLEMENTATION PLANNING (LAST): Priority and dependency analysis

    <if (Documents/Structure/STRUCTURE.md exists)>
    AVAILABLE COMPONENTS: {components_from_structure}

    Structure component mapping questions to ask:
    - Which components will implement this feature? (multiselect from available components)
    - For each component: What is its role in implementing this feature?
    - Are new components needed? If yes, specify names and layers
    - What type of changes required? (new files, modify existing, refactor)
    </if>

    REQUIRED FEATURE VARIABLES:
    Area Assignment: target_area (primary area affected), secondary_areas (additional areas), cross_area_impact (if spans multiple areas)
    Business Analysis: feature_type (capability type), feature_purpose (what it accomplishes), user_value (user benefit), business_objective (business goal)
    Use Case Breakdown: feature_use_cases (list of constituent use cases with area assignments), implementation_order (priority sequence)
    Architecture Impact: affected_areas (areas impacted), new_interfaces (ports/adapters needed), area_interactions (cross-area communication)
    Structure Mapping: implementing_components (components that implement feature), new_components_required (if new components needed), modified_components_count, dependency_changes, breaking_changes (NEW)
    Implementation Guidance: development_approach (how to build), testing_requirements (testing strategy), architecture_validation (compliance checks)
    Change Tracking: change_log (feature evolution), spec_version (current version), last_updated (date), update_reason (why created/updated)

    AREA ASSIGNMENT RULES:
    - Single Area: If feature is contained within one area boundary
    - Multiple Areas: If feature requires coordination between areas
    - Shared Area: If feature provides common functionality used by multiple areas
    - Use solution specification areas as reference for assignment decisions

    CRITICAL ARCHITECTURE STANDARDS - ENFORCE:
    The feature MUST align with these project principles:
    - DDD (Domain-Driven Design): Respect area boundaries as bounded contexts
    - Hexagonal Architecture: Identify required ports and adapters
    - Clean Architecture: Map use cases to Application Layer responsibilities
    - Separation of Concerns: Ensure feature doesn't violate area responsibilities
    - Well-Defined Contracts: Specify interfaces between areas
    - KISS Principle: Justify complexity and identify simplifications

    CONSTRAINTS - DO NOT:
    - Make assumptions beyond solution specification and feature description
    - Include implementation details - focus on feature decomposition
    - Violate established area boundaries from solution specification
    - Create use cases that span multiple areas without justification
    - Skip architectural impact analysis

    CONSTRAINTS - DO:
    - ONLY use information from solution specification and feature request
    - MANDATORY: Assign feature to appropriate area(s) based on solution specification
    - MANDATORY: Break feature into area-aligned use cases
    - MANDATORY: Identify architectural impact on ports/adapters
    - MANDATORY: Respect DDD area boundaries as bounded contexts
    - Apply proper Title Case capitalization to all feature and use case names
    - Validate feature fits within established architecture patterns

    OBSERVATION FORMAT REQUIREMENT:
    Store all collected information as structured observations using format:
    - "variable_name: value" (for single values with proper Title Case)
    - "variable_name: [item1, item2, item3]" (for lists with Title Case items)
    - "affected_areas: [{name: AreaName, impact: Description}]" (for area impact)
    - "feature_use_cases: [{name: UseCaseName, area: AreaName, purpose: Description}]" (for use case breakdown)

    <examples>
    - "primary_area: TaskManagement"
    - "affected_areas: [{name: TaskManagement, impact: Core priority logic}, {name: UserInterface, impact: Priority display}]"
    - "feature_use_cases: [{name: SetTaskPriority, area: TaskManagement, purpose: Set priority for tasks}, {name: ViewTasksByPriority, area: UserInterface, purpose: Filter tasks by priority}]"
    - "implementation_order: [SetTaskPriority, UpdateTaskPriority, ViewTasksByPriority]"
    </examples>

    OUTPUT FORMAT:
    STATUS: [analysis_needed|ready]
    ANALYSIS: [comprehensive assessment of feature analysis progress]
    <if (STATUS is analysis_needed)>
    QUESTIONS: [list specific questions needed for feature decomposition]
    </if>
    AREA_ASSIGNMENT: [primary area and secondary areas identified, or preliminary assignments]
    USE_CASES_IDENTIFIED: [list of use cases with area assignments, or preliminary use case ideas]
    ARCHITECTURAL_IMPACT: [new interfaces, dependencies, area interactions needed]
    IMPLEMENTATION_PRIORITY: [recommended order for use case implementation]
    <if (STATUS is analysis_needed)>
    NEXT_STEPS: [specify what information is required]
    <else>
    NEXT_STEPS: [confirm use case generation can proceed]
    </if>
    ```
  - Extract agent response and parse STATUS value from response
  - Use mcp__memory__add_observations to increment: "analysis_iterations: {new_count}"
  - Store raw agent response for debugging: "agent_response_{iteration}: {full_response}"

  <if (STATUS is analysis_needed)>
  - Extract QUESTIONS from agent response for user input
  - Review agent QUESTIONS list for quality, relevance, and redundancy
  - Select maximum 5 best questions considering:
    - Relevance to missing feature variables
    - No redundancy with previous questions
    - Clear, actionable phrasing
    - Focus on architectural decisions and feature decomposition
  - Present selected questions to user with clear numbering
  - Collect user answers for each question
  - Calculate question offset: {base_number} = ({analysis_iterations} - 1) * 5
  - Use mcp__memory__add_observations to add answers in format:
    - "Q{base_number + 1}:{QuestionText}:{UserAnswer}"
    - "Q{base_number + 2}:{QuestionText}:{UserAnswer}"
    - etc. (e.g., iteration 1: Q01-Q05, iteration 2: Q06-Q10)
  - Store partial analysis results from agent response:
    - "partial_analysis_{iteration}: {analysis_content}"
    - Any preliminary area assignments or use case ideas
  - Continue WHILE loop for additional analysis iteration with user input
  </if>

  <if (STATUS is ready)>
  - Extract complete analysis from agent response sections:
    - Parse AREA_ASSIGNMENT for primary and secondary areas
    - Parse USE_CASES_IDENTIFIED for complete use case list
    - Parse ARCHITECTURAL_IMPACT for interfaces and dependencies
    - Parse IMPLEMENTATION_PRIORITY for implementation order

  - Store complete analysis using mcp__memory__add_observations:
    - "primary_area: {extracted_primary_area}"
    - "secondary_areas: {extracted_secondary_areas}"
    - "cross_area_impact: {extracted_cross_area_impact}"
    - "feature_type: {extracted_feature_type}"
    - "feature_purpose: {extracted_purpose}"
    - "user_value: {extracted_user_value}"
    - "user_benefit: {extracted_user_benefit}"
    - "business_objective: {extracted_objective}"
    - "success_criteria: {extracted_success_criteria}"
    - "affected_areas: {extracted_affected_areas}"
    - "feature_use_cases: {extracted_use_cases}"
    - "implementation_order: {extracted_order}"
    - "new_interfaces: {extracted_interfaces}"
    - "external_dependencies: {extracted_external_deps}"
    - "area_interactions: {extracted_interactions}"
    - "data_sharing_needs: {extracted_data_sharing}"
    - "interface_contracts: {extracted_contracts}"
    - "dependency_strategy: {extracted_dependencies}"
    - "development_approach: {extracted_approach}"
    - "testing_requirements: {extracted_testing}"
    - "architecture_validation: {extracted_validation}"
    - "implementation_phases: {extracted_phases}"
    - "technical_prerequisites: {extracted_tech_prereqs}"
    - "area_prerequisites: {extracted_area_prereqs}"
    - "external_prerequisites: {extracted_external_prereqs}"

  - Generate change log entry and metadata:
    - "change_log: [{date: {current_date}, version: 1.0.0, description: Feature analysis created}]"
    - "spec_version: 1.0.0"
    - "last_updated: {current_date}"
    - "update_reason: Initial feature analysis and use case breakdown"

  - Count identified use cases and update tracking:
    - Extract use case count from feature_use_cases list
    - Use mcp__memory__add_observations: "use_cases_identified: {use_case_count}"

  - Update completion status:
    - Use mcp__memory__add_observations: "analysis_complete: true"
    - Use mcp__memory__add_observations: "status: ready_for_specification"
  </if>
  </while>

- **STEP 2D**: Validate analysis completeness:
  - Use mcp__memory__open_nodes to retrieve complete "{feature_name}" entity
  - Verify critical variables are populated from agent analysis:
    - primary_area must exist and be non-empty
    - feature_use_cases must contain at least one use case with area assignment
    - implementation_order must be defined with proper sequence
    - new_interfaces should be identified (or explicitly noted as none needed)
    - feature_type must be specified (Enhancement, Core Feature, Infrastructure, etc.)
    - affected_areas must list all impacted areas with impact descriptions
  <if (missing critical variables)>
    - List missing variables for debugging: "validation_errors: [list of missing variables]"
    - Attempt recovery by re-running agent with specific prompt for missing data
      <if (recovery fails after one retry)>
        - Report error with detailed missing variable list
        - Use mcp__memory__add_observations: "status: analysis_failed", "error: Missing critical variables after agent analysis"
        - Abort command execution with clear error message
      </if>
  </if>
  <if (all critical variables present)>
    - Use mcp__memory__add_observations: "validation_complete: true"
  </if>

- **STEP 2E**: Validate architecture constraints:
  - Use mcp__memory__open_nodes to retrieve complete "{feature_name}" entity with all analysis data
  - **DDD Validation**:
    - Verify each use case is assigned to exactly one bounded context area
    - Check no use case violates area boundary responsibilities from solution specification
    - Validate area interactions follow domain event patterns (no direct cross-area coupling)
  - **Clean Architecture Validation**:
    - Confirm use cases map to Application Layer responsibilities
    - Verify proposed domain entities stay within appropriate Domain Layer
    - Check infrastructure dependencies use proper ports/adapters pattern
  - **Hexagonal Architecture Validation**:
    - Validate all external dependencies have identified ports in new_interfaces
    - Check new interfaces follow port/adapter pattern naming and structure
    - Verify no direct external system coupling in use case definitions
  - **KISS Principle Validation**:
    - Check for unnecessary cross-area dependencies in area_interactions
    - Validate implementation_order follows logical progression without complexity
    - Verify no over-engineering in proposed new_interfaces
  <if (architecture violations found)>
    - Store violations: "architecture_violations: [list of specific violations with remediation suggestions]"
    - Use mcp__memory__add_observations: "architecture_validated: false"
    - Report architecture compliance issues to user with specific violations
    - Request user guidance on architecture resolution or proceed with violations noted
  </if>
  <if (architecture compliant)>
    - Use mcp__memory__add_observations: "architecture_validated: true"
    - Store validation results: "architecture_compliance: DDD boundaries respected, Clean Architecture aligned, Hexagonal patterns followed, KISS principle maintained"
  </if>
  - Continue to Phase 3

## Phase 3: Directory Structure & Documentation Preparation

- **STEP 3A**: Use mcp__memory__open_nodes to retrieve feature analysis for "{feature_name}"
- **STEP 3B**: Extract target area assignment from analysis results
- **STEP 3C**: Use Bash tool to create area directory structure:
  - "mkdir -p Documents/Areas/{primary_area}/Features/{feature_name}"
  <if (secondary_areas exist)>
    - Create directories for each secondary area
  </if>
  <if (cross_area_impact)>
    - Create Shared area: "mkdir -p Documents/Areas/Shared/Features/{feature_name}"
  </if>
- **STEP 3D**: Use mcp__memory__add_observations to update feature status: "status: ready_for_specification"

## Phase 4: Feature Specification Generation

- **STEP 4A**: Use mcp__memory__open_nodes to retrieve all observations for "{feature_name}" entity
- **STEP 4B**: Load template using Read tool: ".claude/templates/FEATURE_TEMPLATE.md"
- **STEP 4C**: Parse memory observations to extract feature variables:
  - Process area assignments and impact assessments
  - Extract use case breakdown with area mappings
  - Handle architectural integration requirements
  - Parse implementation phases and dependencies
- **STEP 4D**: Apply DSL template variable substitution:
  - Replace all {variable_name} placeholders with extracted values
  - Process `foreach` loops for use cases, areas, phases, interactions
  - Handle conditional blocks for cross-area vs single-area features
  - Ensure proper Title Case capitalization throughout
- **STEP 4E**: Determine output location based on area assignment:
  <if (single area)>
    - Write to: "Documents/Areas/{primary_area}/Features/{feature_name}/{feature_name}.md"
  </if>
  <if (cross-area)>
    - Write to: "Documents/Areas/Shared/Features/{feature_name}/{feature_name}.md"
  </if>
- **STEP 4F**: Use Read tool to validate feature specification was created successfully
- **STEP 4G**: Use mcp__memory__add_observations to update: "status: feature_complete", "specification_path: [output_path]"

## Phase 5: Completion & Reporting

- **STEP 5A**: Validate feature specification accurately reflects analysis and use case breakdown
- **STEP 5B**: Confirm area directory structure is properly organized
- **STEP 5C**: Report completion to user with:
  - Feature specification location
  - Identified use case list with area assignments
  - Area assignment summary
  - Architecture compliance report:
    - DDD boundary respect: ✅/⚠️ (based on architecture_validated status)
    - Clean Architecture alignment: ✅/⚠️ (from architecture_compliance observation)
    - Hexagonal Architecture patterns: ✅/⚠️ (from validation results)
    - KISS principle adherence: ✅/⚠️ (complexity assessment)
    <if`architecture violations exist>
      - List specific violations with remediation suggestions
    </if>
  - Next steps for implementation

## Phase 6: Update Project Specification

- **STEP 6A**: Locate and read solution specification:
  - Use Glob to find: "Documents/SOLUTION.md"
  <if (not found)>
    - Log warning: "Project specification not found, skipping project update"
    - Continue to completion
  </if>
  - Use Read tool to read solution specification

- **STEP 6B**: Extract solution metadata:
  - Use mcp__memory__search_nodes for solution entity
  <if (solution entity found)>
    - Extract solution_name and current_version from observations
  <else>
    - Parse solution name from file header
    - Extract current version from latest change log entry (default "1.0.0")
  </if>

- **STEP 6C**: Parse current features list:
  - Extract existing features from "## Features" section
  <if (section not found)>
    - Set {features_section_exists} = false
    - Plan to create section after "### User Experience"
  <else>
    - Parse existing feature entries into list
    - Set {features_section_exists} = true
  </if>

- **STEP 6D**: Prepare feature entry for solution:
  - Create new feature entry structure:
    - name: {feature_name}
    - primary_area: {primary_area}
    - type: {feature_type}
    - description: {description}
    - use_case_count: {use_cases_identified}
    - specification_path: {specification_path}

- **STEP 6E**: Update solution in memory:
  <if (solution entity exists)>
    - Use mcp__memory__add_observations to add:
      - "solution_features: [{existing_features}, {new_feature_entry}]"
      - Calculate new minor version: increment minor number (e.g., "1.2.0" → "1.3.0")
      - "current_version: {new_version}"
      - "change_log: [{existing_changes}, {new_change_entry}]"
      - New change entry: {date: {current_date}, version: {new_version}, description: Added {feature_name} feature with {use_cases_identified} use cases}
  </if>

- **STEP 6F**: Generate updated solution document:
  - Use Read tool to load SOLUTION_TEMPLATE.md
  - Apply DSL template variable substitution with updated solution data
  - Ensure Features section includes all features with new feature added
  - Ensure Change Log shows new entry at top
  - Use Write tool to save updated "Documents/SOLUTION.md"

- **STEP 6G**: Validate solution update:
  - Use Read tool to verify solution specification was updated correctly
  - Confirm new feature appears in Features section
  - Confirm new change log entry appears

## Phase 6H: Update Structure Specification (NEW)

<if ({has_structure} AND {implementing_components} not empty)>
- **STEP 6H1**: Read current structure specification: "Documents/Structure/STRUCTURE.md"
- **STEP 6H2**: Update feature-component mappings:
  - Add feature to "By Feature" mapping section:
    <foreach {component} in {implementing_components}>
    - Add: "{feature_name} → {component.name} ({component.layer}): {component.role}"
    </foreach>
  - Add feature reference to "By Component" mapping section:
    <foreach {component} in {implementing_components}>
    - Update component entry to include "{feature_name}: {component.feature_implementation_notes}"
    </foreach>
- **STEP 6H3**: Use Edit tool to apply structure updates
- **STEP 6H4**: Validate bidirectional mapping consistency:
  - Feature lists components ✓
  - Components list feature ✓
- **STEP 6H5**: Use mcp__memory__create_relations to create structure-feature relationships:
  <foreach {component} in {implementing_components}>
  - from: "{component.name}"
  - to: "{feature_name}"
  - relationType: "implements"
  </foreach>

- **STEP 6H6**: Validation checkpoint - verify structure update succeeded:
  - Re-read STRUCTURE.md
  - Confirm feature appears in "By Feature" mapping
  - Confirm components list feature in "By Component" mapping
  - If validation fails: Log error and continue (don't abort - feature spec still valid)
</if>

## Phase 7: Final Description Refinement

- **STEP 7A**: Read generated feature specification document:
  - Use Read tool: "{specification_path}" (from memory observations)
  - Extract complete document content for analysis

- **STEP 7B**: Analyze specification content to extract key elements:
  - Core feature purpose and functionality scope
  - Architecture integration (area assignments, use cases, interfaces)
  - Business value and user benefits
  - Technical complexity and implementation scope
  - Cross-area coordination requirements

- **STEP 7C**: Use Task tool with solution-engineer agent for description refinement:
  ```markdown
  ROLE: Documentation Analyst

  TASK: Create refined, professional description for feature "{feature_name}" based on complete specification analysis.

  INPUT: Complete feature specification document content

  OBJECTIVE: Generate concise, precise, professional description that captures the feature essence and replaces the initial description with a comprehensive summary.

  ANALYSIS FOCUS:
  - Feature scope and primary functionality
  - Architecture integration and area coordination
  - Business value and user impact
  - Technical implementation requirements
  - Use case breakdown and complexity

  OUTPUT REQUIREMENTS:
  - 1-2 sentences maximum
  - Technical accuracy reflecting specification
  - Clear business value proposition
  - Professional documentation quality
  - Captures architectural context

  FORMAT: Return only the refined description text, ready for direct substitution.
  ```

- **STEP 7D**: Update feature description in memory:
  - Extract refined description from agent response
  - Use mcp__memory__add_observations to update: "description: {refined_comprehensive_description}"
  - Keep original_description unchanged in memory
  - Update version tracking: "description_refined: true", "description_refinement_date: {current_date}"

- **STEP 7E**: Regenerate feature specification with refined description:
  - Use Read tool to load FEATURE_TEMPLATE.md
  - Apply DSL template variable substitution with updated description
  - Use Write tool to save updated feature specification
  - Verify refined description appears in document header

- **STEP 7F**: Update solution specification with refined feature description:
  - Update solution_features list in memory with refined feature description
  - Regenerate solution specification to reflect feature description improvements
  - Ensure consistency across solution and feature documents

- **STEP 7G**: Final validation and reporting:
  - Confirm refined description maintains accuracy and professional quality
  - Report description evolution: original vs refined
  - Validate feature-solution description consistency

**IMPORTANT NOTES**:
- This command bridges business feature requests with technical use case specifications
- Maintains architectural integrity through area boundary respect and DDD principles
- Documents comprehensive use case breakdown within the feature specification
- Generated specifications provide clear guidance for AI-driven implementation