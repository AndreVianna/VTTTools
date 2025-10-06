---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Bash, TodoWrite]
description: Create AI development specification through guided requirements gathering
argument-hint: {project_name:string} {project_details:string:optional}
---

# AI Project Specification Creation Command

Create comprehensive technical specification optimized for AI-guided software development. Focuses on gathering essential product, architecture, and technology information needed by AI agents to autonomously develop software.

## Phase 0: Validation & Setup

- **STEP 0A**: Validate {project_name} is not empty and contains valid characters - abort if invalid with clear error message
- **STEP 0B**: Use Bash tool: "mkdir -p Documents" to ensure output directory exists
- **STEP 0C**: Validate PROJECT_TEMPLATE.md exists using Read tool - abort if missing

## Phase 1: Initialize Project Memory

- **STEP 1A**: Use mcp__memory__create_entities to create project entity:
  - name: "{project_name}"
  - entityType: "project"
  - observations: ["status: information_gathering", "gathering_complete: false", "question_count: 0"]
- **STEP 1B**: Add original_description handling:
  <if ({project_details} is not empty)>
    - Use mcp__memory__add_observations to add: ["original_description: {project_details}", "description: {project_details}"]
  <else>
    - Use mcp__memory__add_observations to add: ["original_description: Not provided", "description: Not provided"]
  </if>
- **STEP 1C**: Use mcp__memory__add_observations to add core variable tracking:
  - ["variables_needed: project_name,product_type,core_purpose,change_log,spec_version,last_updated,update_reason,bounded_contexts,domain_interactions,ubiquitous_language,domain_layer,application_layer,infrastructure_layer,ui_layer,primary_ports,secondary_ports,primary_adapters,secondary_adapters,complexity_justification,simplification_opportunities,target_user_type,primary_user_workflow,has_frontend,has_backend,has_database,needs_auth,needs_realtime,application_type,frontend_tech,backend_tech,database_tech,interface_type,deployment_target,external_apis,auth_method,data_entities,storage_requirements,interaction_method,ui_framework,tech_stack"]

## Phase 2: AI-Focused Information Gathering Cycle

- **STEP 2A**: Use mcp__memory__open_nodes to retrieve current state for "{project_name}"
- **STEP 2B**: Extract and initialize control variables from memory observations:
  - Set {gathering_complete} from "gathering_complete" observation (default: false)
  - Set {question_count} from "question_count" observation (default: 0)
- **STEP 2C**:
  <while ({gathering_complete} equals false)>
  - Use Task tool with solution-engineer agent with EXACT prompt:
    ```markdown
    ROLE: AI Development Specification Analyst

    TASK: Analyze MCP memory entity "{project_name}" and guide AI development specification creation.

    OBJECTIVE: Gather information for AI-guided automated software development (NOT traditional project management).

    TARGET OUTPUT FILE: "Documents/PROJECT.md"

    TEMPLATE LOCATION: ".claude/templates/PROJECT_TEMPLATE.md"
    DSL SYNTAX REFERENCE: ".claude/guides/COMMAND_SYNTAX.md"

    📋 QUALITY CHECKLIST: Review embedded checklist at end of template (target: 80/100 minimum)

    INSTRUCTIONS:
    1. First, use the DSL syntax (already in the context) to understand template variable substitution and control flow syntax
    2. Read the template at ".claude/templates/PROJECT_TEMPLATE.md" to understand required variables and structure
    3. Check if target file "Documents/PROJECT.md" already exists:
       - If file exists: Read existing content and analyze for accuracy and completeness
       - If file exists: Build upon correct information, fix or remove incorrect/outdated content
       - If file exists: Update specification to match current memory observations
       - If file is new: Start fresh specification creation
    4. Analyze MCP memory entity "{project_name}" for specification data completeness

    CRITICAL ARCHITECTURE-FIRST APPROACH:
    This specification MUST follow Architecture-First principles. Establish architectural foundation BEFORE implementation details.

    MANDATORY QUESTION SEQUENCE:
    1. DOMAIN ANALYSIS (FIRST - CRITICAL): Identify bounded contexts, domain entities, domain services
    2. CLEAN ARCHITECTURE LAYERS (SECOND - CRITICAL): Define Domain, Application, Infrastructure, UI layers
    3. HEXAGONAL ARCHITECTURE (THIRD - CRITICAL): Specify ports, adapters, dependency flow
    4. KISS VALIDATION (FOURTH - CRITICAL): Justify complexity, identify simplifications
    5. IMPLEMENTATION DETAILS (LAST): Technology stack, deployment (informed by architecture)

    REQUIRED HIGH-LEVEL ARCHITECTURE VARIABLES:
    Change Log: change_log (version history), spec_version (current version), last_updated (date), update_reason (why updated)
    Domain Architecture: bounded_contexts (domain names and purposes), domain_interactions (high-level communication), ubiquitous_language (key domain terms)
    Clean Architecture: application_layer (use case names), infrastructure_layer (adapter names), ui_layer (component names)
    Hexagonal Architecture: primary_ports (inbound interface names), secondary_ports (outbound interface names), primary_adapters (inbound adapter names), secondary_adapters (outbound adapter names)
    Architecture Principles: complexity_justification (why architecture needed), simplification_opportunities (areas kept simple)
    Product Definition: project_name, product_type, core_purpose, target_user_type, primary_user_workflow
    Technical Implementation: has_frontend, has_backend, has_database, needs_auth, needs_realtime, application_type, frontend_tech, backend_tech, database_tech, tech_stack
    Integration & Deployment: interface_type, deployment_target, external_apis, auth_method, data_entities, storage_requirements, interaction_method, ui_framework

    FOCUS ON HIGH-LEVEL GUIDANCE:
    - Ask for USE CASE NAMES, not detailed input/output/flows
    - Ask for INTERFACE CONCEPTS, not detailed method signatures
    - Ask for DOMAIN BOUNDARIES, not comprehensive domain modeling
    - Ask for ENTITY NAMES, not detailed business rules
    - Ask for BASIC CONSTRAINTS, not complex validation logic

    CRITICAL ARCHITECTURE STANDARDS - ENFORCE:
    The project MUST follow these principles and standards:
    - DDD (Domain-Driven Design): Bounded contexts, ubiquitous language, domain models
    - Hexagonal Architecture: Ports and adapters pattern with dependency inversion
    - Clean Architecture: Clear layer separation with dependency rule enforcement
    - Separation of Concerns: Single responsibility principle throughout
    - Well-Defined Contracts: Clear interfaces between all components
    - KISS Principle: Keep implementation simple, avoid over-engineering

    CONSTRAINTS - DO NOT:
    - Make assumptions beyond memory observations from "{project_name}" entity
    - Include business concerns: timelines, stakeholders, costs, risks, human resources
    - Skip architectural foundation questions - ARCHITECTURE MUST BE ESTABLISHED FIRST
    - Allow flat feature lists without domain organization
    - Permit implementation details before architectural patterns are defined
    - Blindly preserve incorrect or outdated specification content
    - Modify template file or DSL syntax file

    CONSTRAINTS - DO:
    - ONLY use information from MCP memory entity "{project_name}"
    - MANDATORY: Ask domain boundary questions BEFORE any feature questions
    - MANDATORY: Define Clean Architecture layers before technology choices
    - MANDATORY: Specify Hexagonal ports/adapters before implementation details
    - MANDATORY: Validate KISS principle compliance for all architectural decisions
    - Apply proper Title Case capitalization to all feature names, technology names
    - FOCUS on architectural guidance that enables AI agents to build well-structured code
    - Validate existing specification content against current memory observations
    - Fix or remove incorrect/outdated information from existing specification
    - Follow DSL variable syntax exactly as defined in COMMAND_SYNTAX.md
    - Ensure all template variables have corresponding memory observations

    OBSERVATION FORMAT REQUIREMENT:
    Store all collected information as structured observations using format:
    - "variable_name: value" (for single values with proper Title Case capitalization)
    - "variable_name: [item1, item2, item3]" (for lists with Title Case items)
    - "variable_name: true/false" (for boolean flags)
    - Complex objects: "variable_name: [{name: Value, property: Detail}]" for nested structures

    CAPITALIZATION REQUIREMENTS:
    - All feature names: Title Case (Task Creation, Due Date Management, Priority Setting)
    - All technology names: Proper Case (React, JavaScript, HTML, CSS, PostgreSQL)
    - All domain names: Title Case (Task Management, User Interface, Data Persistence)
    - All architectural components: Title Case (Domain Layer, Application Layer, Infrastructure Layer)

    OUTPUT FORMAT:
    STATUS: [questions_needed|complete]
    ANALYSIS: [brief assessment of current information completeness and existing file status]
    MISSING_VARIABLES: [list of core variables still needing data]
    QUESTIONS: [unlimited questions - provide as many as needed to fill gaps]
    COMPLETION_REASON: [if STATUS=complete, justify why no more questions needed]
    NEXT_STEPS: [if STATUS=complete, confirm ready for specification generation]
    ```
  - Extract agent response and parse STATUS value
  <if (STATUS equals "questions_needed")>
    - Review agent QUESTIONS list for quality, relevance, and redundancy
    - Select maximum 5 best questions considering:
      - Relevance to missing core variables
      - No redundancy with previous questions
      - Clear, actionable phrasing
      - Focus on AI development needs
    - Present selected questions to user with clear numbering
    - Collect user answers for each question
    - Use mcp__memory__add_observations to add answers in format: "Q-01:{QuestionText}:{UserAnswer}", "Q-02:{QuestionText}:{UserAnswer}", etc.
    - Use mcp__memory__add_observations to increment: "question_count: [new_count]"
  </if>
  <if (STATUS equals "complete")>
    - Use mcp__memory__add_observations to update: "gathering_complete: true", "status: specification_ready"
    - Continue WHILE loop until gathering_complete equals true
  </if>
  </while>

## Phase 3: AI Development Specification Generation

- **STEP 3A**: Use mcp__memory__open_nodes to retrieve all observations for "{project_name}" entity
- **STEP 3B**: Load template using Read tool: ".claude/templates/PROJECT_TEMPLATE.md"
- **STEP 3C**: Parse memory observations to extract variable values:
  - Process "variable_name: value" format observations with Title Case preservation
  - Create variable mapping for template substitution including complex architecture objects
  - Handle boolean variables: convert "true"/"false" strings to DSL boolean conditions
  - Process architecture collections: bounded_contexts, application_layer, primary_ports, secondary_ports, etc.
  - Parse complex nested structures for domain contexts, use cases, ports, and adapters
  - Ensure proper capitalization for all extracted values
- **STEP 3D**: Apply DSL template variable substitution:
  - Replace all {variable_name} placeholders with extracted values from memory
  - Process `if` conditional blocks based on extracted boolean flags
  - Process `foreach`loops for nested architecture structures, collections, and feature lists
  - Ensure all 35+ architecture and implementation variables are properly substituted
  - Validate that no conditional blocks remain empty or incomplete
- **STEP 3E**: Write processed specification to: "Documents/PROJECT.md"
- **STEP 3F**: Use Read tool to validate document was created successfully and contains expected content
- **STEP 3G**: Use mcp__memory__add_observations to update project status: "status: specification_complete", "document_path: Documents/PROJECT.md"
- **STEP 3H**: Report completion to user with:
  - Success confirmation
  - Document location path
  - Brief summary of specification sections created
  - Recommendation for next workflow commands

## Phase 4: Validation & Cleanup

- **STEP 4A**: Use Read tool to perform final validation of generated specification document
- **STEP 4B**: Verify all critical sections are present and properly formatted
- **STEP 4C**: Confirm DSL template processing completed without errors
- **STEP 4D**: Report final status and provide guidance for next steps in AI development workflow

## Phase 5: Final Description Refinement

- **STEP 5A**: Read generated project specification document:
  - Use Read tool: "Documents/PROJECT.md"
  - Extract complete document content for analysis

- **STEP 5B**: Analyze specification content to extract key elements:
  - Core project purpose and functionality scope
  - Architecture context (DDD bounded contexts, Clean Architecture layers)
  - Business value and target user impact
  - Technical complexity and system boundaries
  - Key features and capabilities

- **STEP 5C**: Use Task tool with solution-engineer agent for description refinement:
  ```markdown
  ROLE: Documentation Analyst

  TASK: Create refined, professional description for project "{project_name}" based on complete specification analysis.

  INPUT: Complete project specification document content

  OBJECTIVE: Generate concise, precise, professional description that captures the project essence and replaces the initial description with a comprehensive summary.

  ANALYSIS FOCUS:
  - Project scope and primary functionality
  - Architectural approach and complexity
  - Business value and user benefits
  - Technical boundaries and system design
  - Key capabilities and features

  OUTPUT REQUIREMENTS:
  - 1-2 sentences maximum
  - Technical accuracy reflecting specification
  - Clear business value proposition
  - Professional documentation quality
  - Captures architectural approach

  FORMAT: Return only the refined description text, ready for direct substitution.
  ```

- **STEP 5D**: Update project description in memory:
  - Extract refined description from agent response
  - Use mcp__memory__add_observations to update: "description: {refined_comprehensive_description}"
  - Keep original_description unchanged in memory
  - Update version tracking: "description_refined: true", "description_refinement_date: {current_date}"

- **STEP 5E**: Regenerate project specification with refined description:
  - Use Read tool to load PROJECT_TEMPLATE.md
  - Apply DSL template variable substitution with updated description
  - Use Write tool to save updated "Documents/PROJECT.md"
  - Verify refined description appears in document header

- **STEP 5F**: Final validation and reporting:
  - Confirm refined description maintains accuracy and professional quality
  - Report description evolution: original vs refined

**IMPORTANT NOTES**:
- This command creates technical specifications optimized for AI agent consumption
- Focus is on providing clear architectural and functional guidance for autonomous software development
- Generated specifications should enable AI agents to make informed development decisions
- Business management aspects (timelines, stakeholders, costs) are intentionally excluded