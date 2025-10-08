---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Bash, TodoWrite]
description: Create AI development specification through guided requirements gathering
argument-hint: {project_name:string} {project_details:string:optional}
---

# AI Project Specification Creation Command

Create comprehensive technical specification optimized for AI-guided software development. Focuses on gathering essential product, architecture, and technology information needed by AI agents to autonomously develop software.

### Validation & Setup

- **STEP 0A**: Validate {project_name} is not empty and contains valid characters - abort if invalid
- **STEP 0B**: Use Bash: "mkdir -p Documents" to ensure output directory exists
- **STEP 0C**: Validate PROJECT_TEMPLATE.md exists using Read tool - abort if missing

### Initialize Project Memory

- **STEP 1A**: Use mcp__memory__create_entities to create project entity:
  - name: "{project_name}", entityType: "project"
  - observations: ["status: information_gathering", "gathering_complete: false", "question_count: 0"]
- **STEP 1B**: Add description handling:
  <if ({project_details} is not empty)>
    - Use mcp__memory__add_observations: ["original_description: {project_details}", "description: {project_details}"]
  <else>
    - Use mcp__memory__add_observations: ["original_description: Not provided", "description: Not provided"]
  </if>
- **STEP 1C**: Use mcp__memory__add_observations to add core variable tracking:
  - ["variables_needed: project_name,product_type,core_purpose,change_log,spec_version,last_updated,update_reason,bounded_contexts,domain_interactions,ubiquitous_language,domain_layer,application_layer,infrastructure_layer,ui_layer,primary_ports,secondary_ports,primary_adapters,secondary_adapters,complexity_justification,simplification_opportunities,target_user_type,primary_user_workflow,has_frontend,has_backend,has_database,needs_auth,needs_realtime,application_type,frontend_tech,backend_tech,database_tech,interface_type,deployment_target,external_apis,auth_method,data_entities,storage_requirements,interaction_method,ui_framework,tech_stack"]

### AI-Focused Information Gathering Cycle

- **STEP 2A**: Use mcp__memory__open_nodes to retrieve current state for "{project_name}"
- **STEP 2B**: Extract control variables from observations: {gathering_complete} (default: false), {question_count} (default: 0)
- **STEP 2C**:
  <while ({gathering_complete} equals false)>
  - Use Task tool with solution-engineer agent with EXACT prompt:
    ```markdown
    ROLE: AI Development Specification Analyst

    TASK: Analyze MCP memory entity "{project_name}" and guide AI development specification creation.

    OBJECTIVE: Gather information for AI-guided automated software development.

    TARGET OUTPUT: "Documents/PROJECT.md" | TEMPLATE: ".claude/templates/PROJECT_TEMPLATE.md" | DSL: ".claude/guides/COMMAND_SYNTAX.md"

    📋 QUALITY TARGET: 80/100 minimum (see template checklist)

    INSTRUCTIONS:
    1. Read DSL syntax and template to understand variables and structure
    2. Check if "Documents/PROJECT.md" exists: read, analyze, fix/update incorrect content
    3. Analyze MCP memory entity "{project_name}" for completeness

    ARCHITECTURE-FIRST APPROACH (MANDATORY SEQUENCE):
    1. DOMAIN ANALYSIS: Bounded contexts, domain entities, domain services
    2. CLEAN ARCHITECTURE: Domain, Application, Infrastructure, UI layers
    3. HEXAGONAL ARCHITECTURE: Ports, adapters, dependency flow
    4. KISS VALIDATION: Justify complexity, identify simplifications
    5. IMPLEMENTATION: Technology stack, deployment (informed by architecture)

    REQUIRED VARIABLES:
    Change Log: change_log, spec_version, last_updated, update_reason
    Domain: bounded_contexts, domain_interactions, ubiquitous_language
    Clean Arch: application_layer, infrastructure_layer, ui_layer
    Hexagonal: primary_ports, secondary_ports, primary_adapters, secondary_adapters
    Principles: complexity_justification, simplification_opportunities
    Product: project_name, product_type, core_purpose, target_user_type, primary_user_workflow
    Technical: has_frontend, has_backend, has_database, needs_auth, needs_realtime, application_type, frontend_tech, backend_tech, database_tech, tech_stack
    Integration: interface_type, deployment_target, external_apis, auth_method, data_entities, storage_requirements, interaction_method, ui_framework

    FOCUS HIGH-LEVEL: Use case names (not flows), interface concepts (not signatures), domain boundaries (not full models), entity names (not rules)

    ENFORCE STANDARDS: DDD (Bounded contexts, ubiquitous language), Hexagonal (Ports/adapters), Clean Architecture (Layer separation), KISS (Avoid over-engineering)

    DO NOT: Make assumptions beyond memory; include business concerns (timelines, costs); skip architecture questions; allow flat features without domains; permit implementation before architecture

    DO: Use only "{project_name}" memory; ask domain questions FIRST; define layers before tech; specify ports/adapters before implementation; validate KISS; apply Title Case capitalization; validate existing content; follow DSL syntax exactly

    OBSERVATION FORMAT: "variable_name: value" (Title Case) | "variable_name: [item1, item2]" (lists) | "variable_name: true/false" (flags) | Complex: "variable_name: [{name: Value, property: Detail}]"

    CAPITALIZATION: Features, technologies, domains, components = Title Case

    OUTPUT FORMAT:
    STATUS: [questions_needed|complete]
    ANALYSIS: [completeness assessment and file status]
    MISSING_VARIABLES: [list]
    QUESTIONS: [unlimited - provide all needed]
    COMPLETION_REASON: [if complete]
    NEXT_STEPS: [if complete]
    ```
  - Parse agent STATUS value
  <if (STATUS equals "questions_needed")>
    - Review QUESTIONS for quality/relevance/redundancy
    - Select max 5 best questions (relevance, no redundancy, clear, AI-focused)
    - Present to user with numbering
    - Collect answers
    - Use mcp__memory__add_observations: "Q-01:{QuestionText}:{UserAnswer}", "Q-02:...", increment question_count
  </if>
  <if (STATUS equals "complete")>
    - Use mcp__memory__add_observations: "gathering_complete: true", "status: specification_ready"
  </if>
  </while>

### AI Development Specification Generation

- **STEP 3A**: Use mcp__memory__open_nodes to retrieve all "{project_name}" observations
- **STEP 3B**: Load template: ".claude/templates/PROJECT_TEMPLATE.md"
- **STEP 3C**: Parse observations to extract variables: "variable_name: value" format with Title Case, boolean conversion, architecture collections, nested structures
- **STEP 3D**: Apply DSL template substitution: Replace {variable_name}, process if/foreach, ensure 35+ variables substituted
- **STEP 3E**: Write to "Documents/PROJECT.md"
- **STEP 3F**: Validate document created with expected content
- **STEP 3G**: Update memory: "status: specification_complete", "document_path: Documents/PROJECT.md"
- **STEP 3H**: Report completion: success, location, summary, next workflow commands

### Validation & Cleanup

- **STEP 4A**: Final validation of generated specification
- **STEP 4B**: Verify critical sections present and formatted
- **STEP 4C**: Confirm DSL processing completed without errors
- **STEP 4D**: Report status and provide next steps guidance

### Final Description Refinement

- **STEP 5A**: Read "Documents/PROJECT.md" for complete content
- **STEP 5B**: Extract key elements: core purpose, architecture context, business value, technical complexity, key features
- **STEP 5C**: Use Task tool with solution-engineer agent:
  ```markdown
  ROLE: Documentation Analyst

  TASK: Create refined description for "{project_name}" based on complete specification.

  OBJECTIVE: Generate concise, precise, professional description replacing initial description.

  ANALYSIS FOCUS: Scope, architecture, business value, boundaries, capabilities

  OUTPUT REQUIREMENTS: 1-2 sentences, technical accuracy, business value, professional quality, architectural approach

  FORMAT: Return only refined description text.
  ```
- **STEP 5D**: Update memory: "description: {refined_description}", keep original_description, add "description_refined: true", "description_refinement_date: {current_date}"
- **STEP 5E**: Regenerate specification with refined description: Load template, apply substitution, write updated "Documents/PROJECT.md"
- **STEP 5F**: Validate quality and report evolution: original vs refined

## Quick Reference

- **Architecture**: `Documents/Guides/ARCHITECTURE_PATTERN.md`
- **Templates**: `.claude/templates/PROJECT_TEMPLATE.md`
- **Output**: `Documents/PROJECT.md`
- **Related**: `/creation:create-solution`, `/validation:validate-project`, `/update:update-project`

**IMPORTANT**: Creates technical specifications for AI agent consumption, focusing on architectural and functional guidance for autonomous development. Business aspects (timelines, costs) intentionally excluded.
