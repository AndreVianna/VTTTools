---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Bash, TodoWrite]
description: Create AI development specification through guided requirements gathering
argument-hint: {solution_name:string} {solution_details:string:optional}
---

# AI Solution Specification Creation Command

Create comprehensive technical specification optimized for AI-guided software development. Focuses on gathering essential product, architecture, and technology information needed by AI agents to autonomously develop software.

### Validation & Setup

- **STEP 0A**: Validate {solution_name} is not empty and contains valid characters - abort if invalid
- **STEP 0B**: Use Bash tool: "mkdir -p Documents" to ensure output directory exists
- **STEP 0C**: Validate SOLUTION_TEMPLATE.md exists using Read tool - abort if missing

### Initialize Solution Memory

- **STEP 1A**: Use mcp__memory__create_entities to create solution entity:
  - name: "{solution_name}"
  - entityType: "solution"
  - observations: ["status: information_gathering", "gathering_complete: false", "question_count: 0"]
- **STEP 1B**: Add original_description handling:
  <if ({solution_details} is not empty)>
    - Use mcp__memory__add_observations to add: ["original_description: {solution_details}", "description: {solution_details}"]
  <else>
    - Use mcp__memory__add_observations to add: ["original_description: Not provided", "description: Not provided"]
  </if>
- **STEP 1C**: Use mcp__memory__add_observations to add core variable tracking:
  - ["variables_needed: solution_name,product_type,core_purpose,change_log,spec_version,last_updated,update_reason,bounded_contexts,domain_interactions,ubiquitous_language,domain_layer,application_layer,infrastructure_layer,ui_layer,primary_ports,secondary_ports,primary_adapters,secondary_adapters,complexity_justification,simplification_opportunities,target_user_type,primary_user_workflow,has_frontend,has_backend,has_database,needs_auth,needs_realtime,application_type,frontend_tech,backend_tech,database_tech,interface_type,deployment_target,external_apis,auth_method,data_entities,storage_requirements,interaction_method,ui_framework,tech_stack"]

### AI-Focused Information Gathering Cycle

- **STEP 2A**: Use mcp__memory__open_nodes to retrieve current state for "{solution_name}"
- **STEP 2B**: Extract and initialize control variables from memory observations:
  - Set {gathering_complete} from "gathering_complete" observation (default: false)
  - Set {question_count} from "question_count" observation (default: 0)
- **STEP 2C**:
  <while ({gathering_complete} equals false)>
  - Use Task tool with solution-engineer agent with EXACT prompt:
    ```markdown
    ROLE: AI Development Specification Analyst

    TASK: Analyze MCP memory entity "{solution_name}" and guide AI development specification creation.

    OBJECTIVE: Gather information for AI-guided automated software development (NOT traditional solution management).

    TARGET OUTPUT FILE: "Documents/SOLUTION.md"
    TEMPLATE LOCATION: ".claude/templates/SOLUTION_TEMPLATE.md"
    DSL SYNTAX REFERENCE: ".claude/guides/COMMAND_SYNTAX.md"

    📋 QUALITY CHECKLIST: Review embedded checklist at end of template (target: 80/100 minimum)

    INSTRUCTIONS:
    1. Use DSL syntax from context to understand template variable substitution and control flow
    2. Read template at ".claude/templates/SOLUTION_TEMPLATE.md" for required variables and structure
    3. Check if "Documents/SOLUTION.md" exists:
       - If exists: Read, analyze completeness, build upon correct info, fix/remove incorrect content
       - If new: Start fresh specification
    4. Analyze MCP memory entity "{solution_name}" for data completeness

    CRITICAL ARCHITECTURE-FIRST APPROACH:
    Establish architectural foundation BEFORE implementation details.

    MANDATORY QUESTION SEQUENCE:
    1. DOMAIN ANALYSIS (FIRST): Bounded contexts, domain entities, domain services
    2. CLEAN ARCHITECTURE LAYERS (SECOND): Domain, Application, Infrastructure, UI layers
    3. HEXAGONAL ARCHITECTURE (THIRD): Ports, adapters, dependency flow
    4. KISS VALIDATION (FOURTH): Justify complexity, identify simplifications
    5. IMPLEMENTATION DETAILS (LAST): Technology stack, deployment (informed by architecture)

    REQUIRED ARCHITECTURE VARIABLES:
    Change Log: change_log, spec_version, last_updated, update_reason
    Domain: bounded_contexts, domain_interactions, ubiquitous_language
    Clean Architecture: application_layer, infrastructure_layer, ui_layer
    Hexagonal: primary_ports, secondary_ports, primary_adapters, secondary_adapters
    Principles: complexity_justification, simplification_opportunities
    Product: solution_name, product_type, core_purpose, target_user_type, primary_user_workflow
    Technical: has_frontend, has_backend, has_database, needs_auth, needs_realtime, application_type, frontend_tech, backend_tech, database_tech, tech_stack
    Integration: interface_type, deployment_target, external_apis, auth_method, data_entities, storage_requirements, interaction_method, ui_framework

    FOCUS HIGH-LEVEL:
    - Ask for USE CASE NAMES, not detailed flows
    - Ask for INTERFACE CONCEPTS, not method signatures
    - Ask for DOMAIN BOUNDARIES, not comprehensive modeling
    - Ask for ENTITY NAMES, not detailed business rules
    - Ask for BASIC CONSTRAINTS, not complex validation

    ARCHITECTURE STANDARDS - ENFORCE:
    - DDD: Bounded contexts, ubiquitous language, domain models
    - Hexagonal: Ports and adapters with dependency inversion
    - Clean Architecture: Layer separation with dependency rule
    - Separation of Concerns: Single responsibility
    - Well-Defined Contracts: Clear interfaces
    - KISS: Simple implementation, avoid over-engineering

    CONSTRAINTS - DO NOT:
    - Make assumptions beyond memory observations
    - Include business concerns: timelines, stakeholders, costs, risks
    - Skip architectural foundation - ARCHITECTURE FIRST
    - Allow flat feature lists without domain organization
    - Permit implementation before architecture defined
    - Blindly preserve incorrect content
    - Modify template or DSL syntax files

    CONSTRAINTS - DO:
    - ONLY use memory entity "{solution_name}" information
    - MANDATORY: Domain boundaries BEFORE features
    - MANDATORY: Clean Architecture layers before tech choices
    - MANDATORY: Hexagonal ports/adapters before implementation
    - MANDATORY: Validate KISS principle
    - Apply Title Case to feature/technology names
    - Focus on architectural guidance for AI agents
    - Validate/fix existing specification content
    - Follow DSL syntax exactly per COMMAND_SYNTAX.md
    - Ensure all template variables have observations

    OBSERVATION FORMAT:
    - "variable_name: value" (single values with Title Case)
    - "variable_name: [item1, item2, item3]" (lists with Title Case)
    - "variable_name: true/false" (boolean flags)
    - "variable_name: [{name: Value, property: Detail}]" (nested structures)

    CAPITALIZATION:
    - Features: Title Case (Task Creation, Due Date Management)
    - Technology: Proper Case (React, JavaScript, PostgreSQL)
    - Domains: Title Case (Task Management, User Interface)
    - Architecture: Title Case (Domain Layer, Application Layer)

    OUTPUT FORMAT:
    STATUS: [questions_needed|complete]
    ANALYSIS: [brief assessment of completeness and existing file status]
    MISSING_VARIABLES: [list of core variables needing data]
    QUESTIONS: [unlimited questions to fill gaps]
    COMPLETION_REASON: [if STATUS=complete, justify why]
    NEXT_STEPS: [if STATUS=complete, confirm ready for generation]
    ```
  - Extract agent response and parse STATUS value
  <if (STATUS equals "questions_needed")>
    - Review QUESTIONS for quality, relevance, no redundancy
    - Select max 5 best questions considering:
      - Relevance to missing core variables
      - No redundancy with previous questions
      - Clear, actionable phrasing
      - Focus on AI development needs
    - Present selected questions to user with numbering
    - Collect user answers
    - Use mcp__memory__add_observations to add: "Q-01:{QuestionText}:{UserAnswer}", "Q-02:{QuestionText}:{UserAnswer}", etc.
    - Use mcp__memory__add_observations to increment: "question_count: [new_count]"
  </if>
  <if (STATUS equals "complete")>
    - Use mcp__memory__add_observations to update: "gathering_complete: true", "status: specification_ready"
    - Continue WHILE loop until gathering_complete equals true
  </if>
  </while>

### AI Development Specification Generation

- **STEP 3A**: Use mcp__memory__open_nodes to retrieve all observations for "{solution_name}"
- **STEP 3B**: Load template: ".claude/templates/SOLUTION_TEMPLATE.md"
- **STEP 3C**: Parse observations to extract variable values:
  - Process "variable_name: value" format with Title Case preservation
  - Create variable mapping for template substitution with complex architecture objects
  - Handle booleans: convert "true"/"false" to DSL conditions
  - Process architecture collections: bounded_contexts, application_layer, primary_ports, secondary_ports, etc.
  - Parse nested structures for domain contexts, use cases, ports, adapters
  - Ensure proper capitalization
- **STEP 3D**: Apply DSL template substitution:
  - Replace {variable_name} placeholders with memory values
  - Process `if` conditional blocks from boolean flags
  - Process `foreach` loops for nested architecture structures, collections, feature lists
  - Ensure all 35+ architecture/implementation variables substituted
  - Validate no empty/incomplete conditional blocks
- **STEP 3E**: Write processed specification to: "Documents/SOLUTION.md"
- **STEP 3F**: Validate document created successfully with expected content
- **STEP 3G**: Use mcp__memory__add_observations to update: "status: specification_complete", "document_path: Documents/SOLUTION.md"
- **STEP 3H**: Report completion:
  - Success confirmation
  - Document location
  - Brief summary of sections created
  - Next workflow command recommendations

### Validation & Cleanup

- **STEP 4A**: Perform final validation of generated specification
- **STEP 4B**: Verify all critical sections present and properly formatted
- **STEP 4C**: Confirm DSL template processing completed without errors
- **STEP 4D**: Report final status and next steps guidance

### Final Description Refinement

- **STEP 5A**: Read generated solution specification: "Documents/SOLUTION.md"

- **STEP 5B**: Analyze specification for key elements:
  - Core solution purpose and functionality scope
  - Architecture context (DDD bounded contexts, Clean Architecture layers)
  - Business value and target user impact
  - Technical complexity and system boundaries
  - Key features and capabilities

- **STEP 5C**: Use Task tool with solution-engineer agent:
  ```markdown
  ROLE: Documentation Analyst

  TASK: Create refined, professional description for "{solution_name}" based on complete specification analysis.

  INPUT: Complete solution specification document content

  OBJECTIVE: Generate concise, precise description that captures solution essence and replaces initial description with comprehensive summary.

  ANALYSIS FOCUS:
  - Solution scope and primary functionality
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

  FORMAT: Return only refined description text, ready for direct substitution.
  ```

- **STEP 5D**: Update solution description in memory:
  - Extract refined description from agent response
  - Use mcp__memory__add_observations to update: "description: {refined_comprehensive_description}"
  - Keep original_description unchanged
  - Update version tracking: "description_refined: true", "description_refinement_date: {current_date}"

- **STEP 5E**: Regenerate solution specification with refined description:
  - Load SOLUTION_TEMPLATE.md
  - Apply DSL substitution with updated description
  - Save updated "Documents/SOLUTION.md"
  - Verify refined description in document header

- **STEP 5F**: Final validation and reporting:
  - Confirm refined description maintains accuracy and quality
  - Report description evolution: original vs refined

## Quick Reference

- **Architecture**: `Documents/Guides/ARCHITECTURE_PATTERN.md`
- **Templates**: `.claude/templates/SOLUTION_TEMPLATE.md`
- **Output**: `Documents/SOLUTION.md`
- **Related**: `/creation:create-project`, `/validation:validate-solution`, `/update:update-solution`, `/creation:add-feature`

**IMPORTANT NOTES**:
- Creates technical specifications optimized for AI agent consumption
- Focus on clear architectural and functional guidance for autonomous development
- Generated specifications enable AI agents to make informed development decisions
- Business management aspects (timelines, stakeholders, costs) intentionally excluded
