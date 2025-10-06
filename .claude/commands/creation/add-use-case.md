---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Bash, TodoWrite]
description: Create detailed use case specification for a feature within area boundaries
argument-hint: {feature_name:string} {use_case_name:string} {use_case_description:string:optional}
---

# Add Use Case Command

Create comprehensive use case specification following DDD, Clean Architecture, and Hexagonal Architecture principles. Supports both standalone use case creation and coordinated creation from parent feature analysis.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Phase 0: Validation & Context Detection

- **STEP 0A**: Validate arguments:
  - {feature_name} is not empty and contains valid characters - abort if invalid
  - {use_case_name} is not empty and contains valid characters - abort if invalid
- **STEP 0B**: Validate parent feature exists with fallback:
  - Use mcp__memory__open_nodes to retrieve "{feature_name}" entity
  <if (feature not found in memory)>
    - Use Glob to search for feature file: "Documents/Areas/*/Features/{feature_name}.md"
    <if (feature file found)>
      - Parse feature content to extract basic metadata
      - Use mcp__memory__create_entities to create minimal feature entity:
        - name: "{feature_name}"
        - entityType: "feature"
        - observations: ["status: file_exists", "specification_path: {found_path}"]
      - Set {parent_feature_found} = true
      - Set {parent_feature_name} = {feature_name}
    <else>
      - Abort with error: "Feature '{feature_name}' not found in memory or filesystem. Please create the feature first using /add-feature"
    </if>
  <else>
    - Set {parent_feature_found} = true
    - Set {parent_feature_name} = {feature_name}
    - Extract feature_use_cases list from feature entity if available
    <if (feature_use_cases exists)>
      - Verify {use_case_name} exists in feature_use_cases list
      <if (use case not in list)>
        - Warning: "Use case '{use_case_name}' not found in feature '{feature_name}' use case list. Proceeding with standalone creation."
      <else>
        - Extract area assignment and purpose for {use_case_name} from feature_use_cases
        - Set {target_area} from use case area in feature analysis
        - Set {use_case_purpose} from use case purpose in feature analysis
      </if>
    </if>
  </if>
- **STEP 0C**: Use Bash tool: "mkdir -p Documents/Areas" to ensure area directory structure exists
- **STEP 0D**: Validate SOLUTION_TEMPLATE.md and USE_CASE_TEMPLATE.md exist using Read tool - abort if missing
- **STEP 0E**: Read solution specification using Read tool: "Documents/SOLUTION.md" to understand areas and architecture
- **STEP 0F**: Read structure specification (if exists): "Documents/Structure/STRUCTURE.md"
  <if (structure spec exists)>
  - Extract available components, layers, current mappings
  - Store for component mapping questions during analysis
  <else>
  - Set {has_structure} = false
  - Log: "No structure spec - use case will be created without component mapping"
  </if>

## Phase 1: Initialize Use Case Memory

- **STEP 1A**: Use mcp__memory__create_entities to create use case entity:
  - name: "{use_case_name}"
  - entityType: "use_case"
  - observations: ["status: specifying", "specification_complete: false"]
- **STEP 1B**: Add original_description handling:
  <if ({use_case_description} is not empty)>
    - Use mcp__memory__add_observations to add: ["original_description: {use_case_description}", "description: {use_case_description}"]
  <else if ({use_case_purpose} exists from feature analysis)>
    - Use mcp__memory__add_observations to add: ["original_description: {use_case_purpose}", "description: {use_case_purpose}"]
  <else>
    - Use mcp__memory__add_observations to add: ["original_description: Not provided", "description: Not provided"]
  </if>
- **STEP 1C**: Create feature-use case relationship:
  - Use mcp__memory__create_relations to create relationship:
    - from: "{feature_name}"
    - to: "{use_case_name}"
    - relationType: "contains_use_case"
  - Use mcp__memory__add_observations to add: ["creation_context: feature-driven"]
- **STEP 1D**: Use mcp__memory__add_observations to add use case variable tracking:
  - ["variables_needed: use_case_name,use_case_type,use_case_purpose,owning_area,target_users,user_operation,parent_feature,business_value,user_benefit,use_case_scope,abstraction_level,primary_actor,ui_type,access_method,http_method,endpoint_path,response_format,route_path,layout_description,navigation_path,ui_elements,parent_page,modal_trigger,modal_size_and_style,location_in_page,submit_action,component_type,parent_pages_list,component_props,parent_component,specific_location,button_or_menu_text,on_click_behavior,enabled_disabled_loading,ui_data_needs,local_global_server,endpoints_called,state_management_approach,interaction_flow,validation_approach,loading_indicators,success_feedback,error_display,application_service_name,domain_entities_involved,domain_services_used,infrastructure_needs,primary_port_method,secondary_port_requirements,adapter_specifications,domain_terminology,business_rules_enforced,domain_events_published,input_specification,input_validation_rules,preconditions_required,business_rules_applied,processing_workflow,domain_entity_interactions,business_validation_rules,output_specification,output_format_requirements,postconditions_guaranteed,error_scenarios,interface_definition,data_access_requirements,external_system_interactions,performance_expectations,layer_responsibility_mapping,dependency_flow_requirements,abstraction_requirements,simplicity_justification,unit_test_requirements,integration_test_scenarios,acceptance_test_conditions,bdd_test_outline,acceptance_criteria,implementation_pattern,code_structure_guidance,testing_implementation_strategy,technical_dependencies,area_coordination_needs,external_system_dependencies,area_boundary_compliance,interface_design_guidance,error_handling_strategy,change_log,spec_version,last_updated,update_reason"]

## Phase 2: Use Case Analysis & Area Assignment

- **STEP 2A**: Use mcp__memory__open_nodes to retrieve current state for "{use_case_name}"
- **STEP 2B**: Extract and initialize control variables from memory observations:
  - Set {specification_complete} from "specification_complete" observation (default: false)
  - Set {creation_context} from "creation_context" observation
  - Set {parent_feature_name} from "parent_feature" observation (if exists)
- **STEP 2C**:
  <if ({creation_context} equals "coordinated")>
    - Use mcp__memory__open_nodes to retrieve parent feature "{parent_feature_name}" for context
    - Extract area assignment and architectural context from parent feature
    - Set {target_area} from parent feature analysis
  <else>
    - Set {target_area} = "Unknown" (will be determined through analysis)
  </if>
- **STEP 2D**:
  <while ({specification_complete} equals false)>
  - Use Task tool with solution-engineer agent with EXACT prompt:
    ```markdown
    ROLE: Use Case Specification Analyst

    TASK: Create detailed use case specification for "{use_case_name}" following architectural principles and area boundaries.

    OBJECTIVE: Generate implementation-ready use case specification that maintains DDD, Clean Architecture, and Hexagonal Architecture integrity.

    SOLUTION SPECIFICATION: Documents/SOLUTION.md
    USE_CASE_TEMPLATE: .claude/templates/USE_CASE_TEMPLATE.md
    CREATION_CONTEXT: {creation_context}

    📋 QUALITY CHECKLIST: Review embedded checklist at end of template (target: 80/100 minimum)
    <if ({creation_context} equals "coordinated")>
    PARENT_FEATURE: {parent_feature_name}
    PARENT_CONTEXT: Use parent feature analysis for area assignment and architectural guidance
    </if>

    CRITICAL ARCHITECTURE INTEGRATION:
    This use case MUST align with established project architecture and area boundaries.

    MANDATORY SPECIFICATION SEQUENCE:
    1. AREA ASSIGNMENT (FIRST - CRITICAL): Determine owning area for this use case
    2. UI PRESENTATION (SECOND - CRITICAL): Determine UI type and presentation details
    3. CLEAN ARCHITECTURE MAPPING (THIRD - CRITICAL): Define Application Service responsibilities
    4. HEXAGONAL INTEGRATION (FOURTH - CRITICAL): Specify port operations and adapter needs
    5. DDD ALIGNMENT (FIFTH - CRITICAL): Ensure domain entity coordination and business rules
    5.5. STRUCTURE COMPONENT MAPPING (CRITICAL - NEW): Map to specific code components
    6. IMPLEMENTATION DETAILS (LAST): Input/output, validation, error handling

    <if (Documents/Structure/STRUCTURE.md exists)>
    AVAILABLE COMPONENTS: {components_from_structure}

    Structure mapping questions to ask:
    - Which specific component/class will handle this use case? (e.g., SetTaskPriorityHandler)
    - What domain entities will be accessed? (e.g., Task, Priority)
    - What is the file path for the handler? (e.g., Source/API/Features/.../Handler.cs)
    - What infrastructure components are needed? (e.g., TaskRepository)
    </if>

    REQUIRED USE CASE VARIABLES:
    Business Definition: use_case_type (operation type), use_case_purpose (what it accomplishes), user_operation (user goal), business_value (business benefit)
    Area Integration: owning_area (primary area), parent_feature (if coordinated), target_users (who uses it), use_case_scope (boundaries)
    UI Presentation: ui_type (NO_UI, API_ENDPOINT, FULL_PAGE, MODAL, FORM, WIDGET, BUTTON, MENU_ITEM, PANEL), access_method (how accessed)
    UI Details (if applicable): route_path OR parent_page, navigation_path, ui_elements (list), ui_data_needs, state_management_approach, interaction_flow
    Clean Architecture: application_service_name (Application Service), domain_entities_involved (Domain Layer), infrastructure_needs (Infrastructure Layer)
    Hexagonal Architecture: primary_port_method (inbound interface), secondary_port_requirements (outbound interfaces), adapter_specifications (implementation needs)
    DDD Alignment: domain_terminology (ubiquitous language), business_rules_enforced (domain invariants), domain_events_published (domain events)
    Structure Mapping: structure_components (specific handler/class names with layers and file paths), domain_entities_used (entities/VOs with properties/methods), component_dependencies (required components) (NEW)
    Implementation Spec: input_specification (input data), business_rules_applied (logic), output_specification (output data), error_scenarios (error handling)
    Testing Requirements: acceptance_criteria (acceptance tests), unit_test_requirements (unit testing), integration_test_scenarios (integration testing)
    Change Tracking: change_log (evolution history), spec_version (current version), last_updated (date), update_reason (creation/update reason)

    AREA ASSIGNMENT RULES:
    <if ({creation_context} equals "coordinated")>
      - Use area assignment from parent feature analysis
      - Validate use case fits within assigned area boundaries
      - Respect cross-area coordination if parent feature spans areas
    <else>
      - Analyze use case against solution specification areas
      - Assign to most appropriate area based on domain responsibility
      - Use "Shared" area if use case serves multiple areas
    </if>

    CRITICAL ARCHITECTURE STANDARDS - ENFORCE:
    The use case MUST follow these project principles:
    - DDD (Domain-Driven Design): Operate within area boundaries as bounded context
    - Hexagonal Architecture: Define clear port operations and adapter dependencies
    - Clean Architecture: Map to Application Layer with proper domain coordination
    - Separation of Concerns: Single responsibility within area boundaries
    - Well-Defined Contracts: Clear interface definitions for ports
    - KISS Principle: Justify complexity and identify simplifications

    CONSTRAINTS - DO NOT:
    - Make assumptions beyond solution specification and use case description
    - Violate established area boundaries from solution specification
    - Create complex business logic without domain justification
    - Skip architectural alignment validation
    - Include implementation code or detailed technical specifications

    CONSTRAINTS - DO:
    - ONLY use information from solution specification, parent feature (if any), and use case description
    - MANDATORY: Assign use case to appropriate area based on solution specification
    - MANDATORY: Map use case to Clean Architecture Application Layer
    - MANDATORY: Define Hexagonal port operations and adapter needs
    - MANDATORY: Ensure DDD alignment with area as bounded context
    - Apply proper Title Case capitalization to all names and concepts
    - Validate use case maintains architectural integrity

    OBSERVATION FORMAT REQUIREMENT:
    Store all collected information as structured observations using format:
    - "variable_name: value" (for single values with proper Title Case)
    - "variable_name: [item1, item2, item3]" (for lists with Title Case items)
    - "error_scenarios: [{condition: ErrorCondition, handling: Strategy}]" (for error handling)
    - "acceptance_criteria: [{id: AC-01, description: Criteria, precondition: Given, action: When, result: Then}]" (for acceptance tests)

    <examples>
    - "owning_area: TaskManagement"
    - "application_service_name: SetTaskPriorityService"
    - "domain_entities_involved: [Task Entity, Priority Value Object]"
    - "primary_port_method: setTaskPriority(taskId, priorityLevel)"
    - "error_scenarios: [{condition: Task Not Found, handling: Return error with identifier}, {condition: Invalid Priority, handling: Return validation error with valid options}]"
    - "acceptance_criteria: [{id: AC-01, description: Priority assignment succeeds, precondition: Valid task and priority, action: SetTaskPriority called, result: Task updated and event published}]"
    </examples>

    OUTPUT FORMAT:
    STATUS: [specification_needed|complete]
    ANALYSIS: [comprehensive assessment of use case specification progress]
    AREA_ASSIGNMENT: [owning area determined and validated]
    ARCHITECTURE_MAPPING: [Clean Architecture and Hexagonal Architecture alignment]
    IMPLEMENTATION_READINESS: [assessment of specification completeness for AI implementation]
    NEXT_STEPS: [if complete, confirm specification ready for implementation]
    ```
  - Extract agent response and parse STATUS value
  <if (STATUS equals "specification_needed")>
    - Continue specification cycle with additional analysis
    - Update memory with specification progress
  </if>
  <if (STATUS equals "complete")>
    - Use mcp__memory__add_observations to update: "specification_complete: true", "status: use_case_ready"
    - Continue WHILE loop until specification_complete equals true
  </if>
  </while>

## Phase 3: Use Case Specification Generation

- **STEP 3A**: Use mcp__memory__open_nodes to retrieve all observations for "{use_case_name}" entity
- **STEP 3B**: Load template using Read tool: ".claude/templates/USE_CASE_TEMPLATE.md"
- **STEP 3C**: Extract area assignment and determine output location:
  - Extract {owning_area} from memory observations
  - Extract {parent_feature} from memory observations
  - Set output path: "Documents/Areas/{owning_area}/Features/{parent_feature}/UseCases/{use_case_name}.md"
  - Use Bash tool to create area directory: "mkdir -p Documents/Areas/{owning_area}/Features/{parent_feature}/UseCases"
- **STEP 3D**: Parse memory observations to extract use case variables:
  - Process business context and architecture mapping
  - Extract functional specifications and testing requirements
  - Handle error scenarios and acceptance criteria
  - Parse implementation guidance and dependencies
- **STEP 3E**: Apply DSL template variable substitution:
  - Replace all {variable_name} placeholders with extracted values
  - Process `foreach` loops for error scenarios, acceptance criteria, dependencies
  - Handle conditional blocks for parent feature context
  - Ensure proper Title Case capitalization throughout
- **STEP 3F**: Write use case specification to determined location: "Documents/Areas/{owning_area}/Features/{parent_feature}/UseCases/{use_case_name}.md"
- **STEP 3G**: Use Read tool to validate use case specification was created successfully
- **STEP 3H**: Use mcp__memory__add_observations to update: "status: use_case_complete", "specification_path: [output_path]"

## Phase 3.5: Duplicate Detection and Auto-Promotion to Shared

- **STEP 3.5A**: Check for Duplicate Use Cases Across Areas
  - Use Glob tool to search for all existing use case files: "Documents/Areas/**/Features/**/UseCases/*.md"
  <if (other use case files found)>
    - **SCAN FOR DUPLICATES**: Compare "{use_case_name}" against all found use case file names
    <if (exact name match found in different area)>
      - **DETECT ORIGINAL**: Identify which use case was created first (by file timestamp or memory creation)
      - **DETECT ORIGINAL FEATURE**: Extract feature name from original path
      - **CREATE SHARED DIRECTORY**: Use Bash tool: "mkdir -p Documents/Areas/Shared/Features/{feature_name}/UseCases"
      - **PROMOTE BOTH TO SHARED**: Move both use cases to "Documents/Areas/Shared/Features/{feature_name}/UseCases/"
      - **UPDATE PARENT REFERENCES**: Edit both use cases under "Business Context" section:
        - Change "Parent Feature: {original_feature}" to "Parent Feature: (Shared) {original_feature}, {current_feature}"
      - **UPDATE MEMORY**: Add to both use case entities: "location: Shared", "parent_features: [{original_feature}, {current_feature}]"
      - **UPDATE FEATURE MEMORY**:
        - Add to current parent feature: "shared_use_cases: [{use_case_name}]"
        - Add to original parent feature: "shared_use_cases: [{use_case_name}]"
      - **CLEANUP**: Remove duplicate files from original area folders using Bash: "rm Documents/Areas/{original_area}/Features/{original_feature}/UseCases/{use_case_name}.md"
      - **REPORT**: "🔄 Use case {use_case_name} promoted to Shared (found duplicate in {original_area})"
      - **UPDATE PATH**: Set output_path = "Documents/Areas/Shared/Features/{feature_name}/UseCases/{use_case_name}.md"
    </if>
  </if>

## Phase 4: Parent Feature Coordination (If Applicable)

- **STEP 4A**:
<if ({parent_feature_detected} equals true)>
  - Use mcp__memory__open_nodes to retrieve parent feature "{parent_feature_name}"
  - Update parent feature with use case completion status
  - Use mcp__memory__add_observations to update parent feature: "use_case_completed: {use_case_name}"
  - Check if all use cases for parent feature are complete
  <if (all parent feature use cases complete)>
    - Update parent feature: "status: feature_complete"
  </if>
</if>

## Phase 5: Completion & Reporting

- **STEP 5A**: Validate use case specification accurately reflects analysis and architectural requirements
- **STEP 5B**: Confirm specification is placed in correct area directory structure
- **STEP 5C**: 
<if ({parent_feature_detected} equals true)>
  Report coordination status with parent feature
</if>
- **STEP 5D**: Report completion to user with:
  - Use case specification location
  - Area assignment confirmation
  - Architectural integration summary
  - Parent feature coordination status (if applicable)
  - Next steps for implementation

## Phase 6: Update Parent Feature Specification

- **STEP 6A**: Locate parent feature specification:
  - Use mcp__memory__open_nodes to get feature entity
  - Extract specification_path from feature observations
  <if (specification_path not found)>
    - Use Glob: "Documents/Areas/*/Features/{feature_name}.md"
  </if>
  - Use Read tool to read feature specification

- **STEP 6B**: Extract feature metadata:
  - Parse current version from change log (default "1.0.0")
  - Parse existing use cases from "### Use Case Breakdown" section
  - Identify which use case entry matches {use_case_name}

- **STEP 6C**: Update feature in memory:
  - Use mcp__memory__add_observations to add:
    - "use_case_specifications_created: [{existing_list}, {use_case_name}]"
    - Calculate new minor version: increment minor number (e.g., "1.0.0" → "1.1.0")
    - "current_version: {new_version}"
    - "change_log: [{existing_changes}, {new_change_entry}]"
    - New change entry: {date: {current_date}, version: {new_version}, description: Created {use_case_name} use case specification}

- **STEP 6D**: Generate updated feature document:
  - Use Read tool to load FEATURE_TEMPLATE.md
  - Apply DSL template variable substitution with updated feature data
  - Ensure Change Log shows new entry at top
  - Use Write tool to save updated feature specification

- **STEP 6E**: Validate feature update:
  - Use Read tool to verify feature specification was updated correctly
  - Confirm new change log entry appears

## Phase 6F: Update Structure Cross-References (NEW)

<if ({has_structure} AND {structure_components} not empty)>
- **STEP 6F1**: Update parent feature structure mapping:
  - Read parent feature specification
  - Locate "Structure Mapping" section
  - For each component in {structure_components}:
    - Update component's "Use Cases Implemented" to include {use_case_name}
  - Use Edit tool to apply updates

- **STEP 6F2**: Update STRUCTURE.md component details:
  - Read "Documents/Structure/STRUCTURE.md"
  - Locate "By Component" section
  - For each component in {structure_components}:
    - Add use case to component's implementation notes
    - Example: "Component.Handler: Implements FeatureName use cases: UseCase1, UseCase2"
  - Use Edit tool to apply updates

- **STEP 6F3**: Validate bidirectional consistency:
  - USE_CASE.md lists components ✓
  - FEATURE.md component entry lists this use case ✓
  - STRUCTURE.md component entry references this use case ✓
</if>

## Phase 7: Final Description Refinement

- **STEP 7A**: Read generated use case specification document:
  - Use Read tool: "{specification_path}" (from memory observations)
  - Extract complete document content for analysis

- **STEP 7B**: Analyze specification content to extract key elements:
  - Core use case purpose and operation scope
  - Architecture integration (area assignment, service mapping, port definitions)
  - Business value and user workflow impact
  - Technical implementation requirements and complexity
  - Domain coordination and business rules

- **STEP 7C**: Use Task tool with solution-engineer agent for description refinement:
  ```markdown
  ROLE: Documentation Analyst

  TASK: Create refined, professional description for use case "{use_case_name}" based on complete specification analysis.

  INPUT: Complete use case specification document content

  OBJECTIVE: Generate concise, precise, professional description that captures the use case essence and replaces the initial description with a comprehensive summary.

  ANALYSIS FOCUS:
  - Use case scope and primary operation
  - Architecture integration and area context
  - Business workflow and user impact
  - Technical implementation approach
  - Domain coordination requirements

  OUTPUT REQUIREMENTS:
  - 1-2 sentences maximum
  - Technical accuracy reflecting specification
  - Clear operational purpose
  - Professional documentation quality
  - Captures architectural context

  FORMAT: Return only the refined description text, ready for direct substitution.
  ```

- **STEP 7D**: Update use case description in memory:
  - Extract refined description from agent response
  - Use mcp__memory__add_observations to update: "description: {refined_comprehensive_description}"
  - Keep original_description unchanged in memory
  - Update version tracking: "description_refined: true", "description_refinement_date: {current_date}"

- **STEP 7E**: Regenerate use case specification with refined description:
  - Use Read tool to load USE_CASE_TEMPLATE.md
  - Apply DSL template variable substitution with updated description
  - Use Write tool to save updated use case specification
  - Verify refined description appears in document header

- **STEP 7F**: Update parent feature specification with refined use case description:
  - Update feature_use_cases list in memory with refined use case description
  - Regenerate feature specification to reflect use case description improvements
  - Ensure consistency across feature and use case documents

- **STEP 7G**: Final validation and reporting:
  - Confirm refined description maintains accuracy and professional quality
  - Report description evolution: original vs refined
  - Validate use case-feature description consistency

**IMPORTANT NOTES**:
- This command creates implementation-ready use case specifications within area boundaries
- Supports both standalone use case creation and coordinated creation from feature analysis
- Maintains architectural integrity through DDD area boundaries and Clean Architecture principles
- Generated specifications provide detailed guidance for AI-driven implementation while respecting established architecture