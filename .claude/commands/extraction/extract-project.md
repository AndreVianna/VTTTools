---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Extract project specification from existing codebase through systematic analysis
argument-hint: {project_folder:string:optional}
---

# Project Specification Extraction Command

Extract comprehensive technical specification from existing codebase through systematic analysis. Documents actual architecture, patterns, and implementation as-is without judgment or design recommendations.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Phase 0: Validation & Setup

- **STEP 0A**:
<if ({project_folder} is empty)>
  - Set {project_folder} = current working directory "."
  - Use Bash tool: "pwd" to confirm current directory path
<else>
  - Validate {project_folder} exists using Bash tool: "test -d {project_folder} && echo 'exists' || echo 'missing'"
  - Abort if missing: "ERROR: Project folder '{project_folder}' does not exist"
</if>
- **STEP 0B**: Use Bash tool: "mkdir -p Documents" to ensure output directory exists
- **STEP 0C**: Validate PROJECT_TEMPLATE.md exists using Read tool - abort if missing

## Phase 0B: Multi-Technology Detection & Discovery Strategy

- **STEP 0B1**: Detect ALL technologies in the project:
  - Use Glob and Grep to identify technology indicator files and patterns
  - **Backend Detection**:
    - Glob: "{project_folder}/**/*.csproj" → .NET/C# project
    - Glob: "{project_folder}/**/pom.xml" or "build.gradle" → Java project
    - Glob: "{project_folder}/**/package.json" (check for express/fastify/nest) → Node.js backend
    - Glob: "{project_folder}/**/go.mod" → Go project
    - Glob: "{project_folder}/**/Cargo.toml" → Rust project
    - Glob: "{project_folder}/**/requirements.txt" or "pyproject.toml" → Python project
  - **Frontend Detection**:
    - Check package.json for: react, vue, angular, svelte → identify frontend framework
    - Glob: "{project_folder}/**/tsconfig.json" → TypeScript usage
    - Glob: "{project_folder}/**/vite.config.*" or "webpack.config.*" → build tool
  - **Database/ORM Detection**:
    - Grep: "DbSet<" in *.cs files → Entity Framework Core
    - Grep: "JpaRepository" in *.java files → Spring Data JPA
    - Glob: "**/prisma/schema.prisma" → Prisma ORM
    - Grep: "models.Model" in *.py files → Django ORM
  - **Cache Detection**:
    - Grep: "Redis" or "StackExchange.Redis" or "redis-client"
    - Grep: "Memcached" or "memcache"
  - **Real-time Detection**:
    - Grep: "SignalR" in *.cs files
    - Grep: "socket.io" or "ws" in package.json
  - Store detected technologies in memory with versions where available

- **STEP 0B2**: For EACH detected technology, perform web search to get discovery patterns:
  <foreach {technology} in {detected_technologies}>
  - Use WebSearch tool with query: "How to discover all entities in {technology.name} {technology.version} programmatically best practices"
  - Extract discovery patterns from search results (file patterns, commands, conventions)
  - Use mcp__memory__add_observations to store: "discovery_pattern_{technology.name}: {patterns}"
  - Examples of patterns to extract:
    - For Entity Framework: "Search for DbSet<T> declarations in *Context.cs files"
    - For Spring JPA: "Search for @Entity annotations"
    - For Django: "Search for models.Model inheritance"
    - For React: "Find all .tsx/.jsx files in src/ folder"
  </foreach>

- **STEP 0B3**: Report detected technologies and selected strategies:
  ```
  TECHNOLOGY DETECTION COMPLETE
  ────────────────────────────────
  Backend: {backend_tech} {version}
  Frontend: {frontend_tech} {version}
  ORM: {orm_tech} {version}
  Cache: {cache_tech}
  Real-time: {realtime_tech}
  Build: {build_tech}

  Discovery Strategies Loaded:
  - {tech1}: {strategy1}
  - {tech2}: {strategy2}
  ```

## Phase 1: Initialize Extraction Memory

- **STEP 1A**: Use mcp__memory__create_entities to create extraction entity:
  - name: "current_project_extraction"
  - entityType: "extraction"
  - observations: ["status: analysis_starting", "analysis_complete: false", "analysis_count: 0", "project_folder: {project_folder}"]
- **STEP 1B**: Use mcp__memory__add_observations to add extraction variable tracking:
  - ["variables_needed: project_name,product_type,core_purpose,change_log,spec_version,last_updated,update_reason,bounded_contexts,domain_interactions,ubiquitous_language,domain_layer,application_layer,infrastructure_layer,ui_layer,primary_ports,secondary_ports,primary_adapters,secondary_adapters,complexity_justification,simplification_opportunities,target_user_type,primary_user_workflow,has_frontend,has_backend,has_database,needs_auth,needs_realtime,application_type,frontend_tech,backend_tech,database_tech,interface_type,deployment_target,external_apis,auth_method,data_entities,storage_requirements,interaction_method,ui_framework,tech_stack"]

## Phase 2: Systematic Codebase Analysis

- **STEP 2A**: Use mcp__memory__open_nodes to retrieve current state for "current_project_extraction"
- **STEP 2B**: Extract and initialize control variables from memory observations:
  - Set {analysis_complete} from "analysis_complete" observation (default: false)
  - Set {analysis_count} from "analysis_count" observation (default: 0)
- **STEP 2C**: Use Task tool with solution-engineer agent for exhaustive multi-technology extraction with EXACT prompt:
  ```markdown
  ROLE: Project Architecture Extraction Analyst with Exhaustive Discovery

  TASK: Extract complete project architecture using technology-adaptive exhaustive discovery methodology.

  CRITICAL MANDATE: Document reality with 100% coverage. Extract ALL entities, components, and patterns.

  TARGET OUTPUT FILE: "Documents/PROJECT.md"
  TEMPLATE LOCATION: ".claude/templates/PROJECT_TEMPLATE.md"
  PROJECT FOLDER: "{project_folder}"

  DETECTED TECHNOLOGIES: {detected_technologies}
  DISCOVERY STRATEGIES: {discovery_patterns}

  ═══════════════════════════════════════════════════════════════════════════
  PHASE 1: TECHNOLOGY-SPECIFIC INVENTORY (CREATE COMPLETE LISTS)
  ═══════════════════════════════════════════════════════════════════════════

  CRITICAL: This phase ONLY creates inventories. Do NOT analyze content yet.

  FOR EACH DETECTED TECHNOLOGY:

  <if (Entity Framework Core detected)>
  **ENTITY INVENTORY** (.NET/EF Core):
  1. Execute: grep -r "DbSet<" {project_folder} --include="*Context.cs"
  2. Parse output to extract ALL entity names from DbSet<EntityName> declarations
  3. Store complete list: entity_list = [Entity1, Entity2, ...]
  4. Report: "Found {count} entities in DbContext"
  5. For each entity, locate file: {project_folder}/**/Domain/**/{EntityName}.cs
  6. Verify all entity files exist

  **ENUM INVENTORY** (.NET/C#):
  1. Execute: grep -r "^[[:space:]]*public enum " {project_folder} --include="*.cs"
  2. Extract ALL enum names
  3. Store: enum_list = [Enum1, Enum2, ...]
  4. Report: "Found {count} enums"
  </if>

  <if (Spring Data JPA detected)>
  **ENTITY INVENTORY** (Java/JPA):
  1. Execute: grep -r "@Entity" {project_folder} --include="*.java"
  2. Extract class names following @Entity annotation
  3. Cross-reference: grep -r "JpaRepository<" to validate
  4. Store: entity_list = [Entity1, Entity2, ...]
  </if>

  <if (React detected)>
  **COMPONENT INVENTORY** (React):
  1. Execute: find {project_folder}/src -name "*.tsx" -o -name "*.jsx"
  2. Store all file paths: component_files = [path1, path2, ...]
  3. Report: "Found {count} React component files"

  **PAGE INVENTORY**:
  1. Execute: find {project_folder}/src/pages -name "*.tsx"
  2. Store: page_files = [path1, path2, ...]
  </if>

  <if (Redux detected)>
  **SLICE INVENTORY**:
  1. Execute: grep -r "createSlice" {project_folder}/src --include="*.ts"
  2. Extract slice names
  3. Store: slice_list = [slice1, slice2, ...]
  </if>

  **INVENTORY CHECKPOINT**:
  Report complete inventories before proceeding:
  ```
  INVENTORY COMPLETE
  ─────────────────────
  Entities to analyze: {entity_count}
  Enums to analyze: {enum_count}
  Components to analyze: {component_count}
  ```

  ═══════════════════════════════════════════════════════════════════════════
  PHASE 2: EXHAUSTIVE ANALYSIS (MANDATORY PROCESSING OF ALL ITEMS)
  ═══════════════════════════════════════════════════════════════════════════

  CRITICAL: MUST process EVERY item in inventories. NO SAMPLING ALLOWED.

  <if (Entity Framework Core detected)>
  **ENTITY ANALYSIS** (Mandatory Loop):

  entities_analyzed = 0
  entity_count = length of entity_list

  <foreach entity_name in entity_list>
    Report progress: "Processing entity {entities_analyzed + 1} of {entity_count}: {entity_name}"

    1. Use Read tool on entity file
    2. Extract: properties, relationships, base classes, enums used
    3. Store observations: "entity_{entity_name}: {data}"
    4. Increment: entities_analyzed = entities_analyzed + 1
  </foreach>

  VERIFICATION: entities_analyzed MUST equal entity_count
  <if (entities_analyzed < entity_count)>
    ERROR: "INCOMPLETE - Only {entities_analyzed} of {entity_count} entities analyzed"
    STATUS: analysis_needed
  </if>

  **ENUM ANALYSIS** (Mandatory Loop - Complete Values Required):

  enums_analyzed = 0
  enum_count = length of enum_list

  <foreach enum_name in enum_list>
    Report progress: "Processing enum {enums_analyzed + 1} of {enum_count}: {enum_name}"

    1. Execute: grep -r "public enum {enum_name}" -A 30 --include="*.cs"
    2. Parse output to extract ALL values until closing brace "}"
    3. Verify completeness: must contain closing brace
    4. Store: "enum_{enum_name}_values: [all_values]"
    5. Increment: enums_analyzed = enums_analyzed + 1

    <if (closing brace not found)>
      WARNING: "Enum {enum_name} may be incomplete"
    </if>
  </foreach>

  VERIFICATION: enums_analyzed MUST equal enum_count
  </if>

  <if (React detected)>
  **COMPONENT ANALYSIS** (Sample-based for high-level understanding):
  - Analyze component structure patterns (not exhaustive per-component)
  - Identify routing patterns
  - Extract state management approach
  </if>

  **ARCHITECTURE ANALYSIS**:
  - Bounded contexts (from namespace/package structure)
  - Ports & adapters (interface patterns)
  - Use case patterns (service methods)
  - Domain interactions (dependency flow)

  ═══════════════════════════════════════════════════════════════════════════
  PHASE 3: FORCED VERIFICATION (CANNOT SELF-REPORT COMPLETE)
  ═══════════════════════════════════════════════════════════════════════════

  <if (Entity Framework Core detected)>
  **ENTITY COUNT VERIFICATION**:
  - Expected (from DbSet): {dbset_count}
  - Actually analyzed: {entities_analyzed}
  - Match: {dbset_count} == {entities_analyzed}
  - <if (NOT match)>
    ERROR: "Entity count mismatch! Missing: {calculate_difference}"
    STATUS: analysis_needed
  </if>

  **ENUM COMPLETENESS VERIFICATION**:
  <foreach enum in analyzed_enums>
  - Enum: {enum.name}
  - Values found: {enum.value_count}
  - Has closing brace: {enum.complete}
  - <if (NOT enum.complete)>
    ERROR: "Enum {enum.name} incomplete"
  </if>
  </foreach>
  </if>

  **COMPLETION CRITERIA** (ALL must be TRUE):
  - [ ] All entities from DbContext analyzed
  - [ ] All enums have complete value lists
  - [ ] All bounded contexts identified
  - [ ] Architecture patterns documented

  <if (ALL criteria met)>
    STATUS: complete
    CONFIDENCE: High
  </if>
  <else>
    STATUS: analysis_needed
    CONFIDENCE: Low
    REQUIRED_ACTIONS: {list_what_is_missing}
  </else>

  ═══════════════════════════════════════════════════════════════════════════
  OUTPUT FORMAT
  ═══════════════════════════════════════════════════════════════════════════

  STATUS: [analysis_needed|complete]

  EXTRACTION_METRICS:
  - Entities inventoried: X
  - Entities analyzed: Y of X ({percentage}%)
  - Enums inventoried: A
  - Enums analyzed: B of A ({percentage}%)
  - Coverage: {overall_percentage}%
  - Confidence: [High|Medium|Low]

  EXTRACTED_VARIABLES: [comprehensive list]
  MISSING_VARIABLES: [items not found - marked N/A]

  VERIFICATION_RESULTS:
  - Entity count match: YES/NO
  - Enum completeness: YES/NO
  - Coverage acceptable: YES/NO

  <if (STATUS=analysis_needed)>
  NEXT_ACTIONS: [specific items requiring additional analysis]
  </if>

  <if (STATUS=complete)>
  COMPLETION_JUSTIFICATION:
  - All {entity_count} entities analyzed ✓
  - All {enum_count} enums complete ✓
  - Coverage: {percentage}% ✓
  - Verification passed ✓
  </if>
  ```

## Phase 3: Reality-Based Specification Generation

- **STEP 3A**: Use mcp__memory__open_nodes to retrieve all observations for "current_project_extraction" entity
- **STEP 3B**: Load template using Read tool: ".claude/templates/PROJECT_TEMPLATE.md"
- **STEP 3C**: Parse memory observations to extract variable values:
  - Process extracted "variable_name: value" format observations
  - Handle "N/A" entries for missing architectural elements
  - Create variable mapping including "Not implemented" and "Mixed approach" designations
  - Preserve Title Case capitalization for extracted values
  - Process actual technology collections and implementation patterns found
- **STEP 3D**: Apply DSL template variable substitution with extracted reality:
  - Replace {variable_name} placeholders with extracted values (including N/A entries)
  - Process `if` blocks based on actual implementation detection
  - Handle `foreach` loops for actual collections found in codebase
  - Process conditional blocks that may evaluate to "N/A" or "Not implemented"
  - Ensure honest representation of current codebase state
- **STEP 3E**: Prepend extraction metadata to specification content:
  ```markdown
  ---
  Extraction Metadata:

  <if (Entity Framework Core detected)>
  Backend Analysis (.NET {version}):
  - ORM: Entity Framework Core {version}
  - Discovery Method: DbSet declarations + namespace analysis
  - Entities Found: {entity_count}
  - Entities Verified: {entities_analyzed} of {entity_count} ({percentage}%)
  - Enums Found: {enum_count}
  - Enums Complete: {enums_complete} of {enum_count} ({percentage}%)
  - Confidence: {confidence_level}
  </if>

  <if (React detected)>
  Frontend Analysis (React {version}):
  - Framework: React + TypeScript
  - Discovery Method: Component file analysis
  - Components Found: {component_count}
  - Pages Found: {page_count}
  - Confidence: {confidence_level}
  </if>

  <if (Other technologies detected)>
  Infrastructure:
  - Real-time: {realtime_tech}
  - Cache: {cache_tech}
  - Build: {build_tech}
  </if>

  Overall Confidence: {overall_confidence} ({coverage}% verified)
  Extraction Date: {current_date}
  ---
  ```
- **STEP 3F**: Write complete specification (metadata + content) to: "Documents/PROJECT.md"
- **STEP 3G**: Use Read tool to validate document was created and accurately reflects extracted reality
- **STEP 3H**: Use mcp__memory__add_observations to update status: "status: extraction_complete", "document_path: Documents/PROJECT.md"
- **STEP 3I**: Report completion to user with:
  - Success confirmation
  - Document location path
  - Extraction metrics: "{entity_count} entities, {enum_count} enums, {confidence} confidence"
  - Summary of what was extracted vs. what was marked N/A
  - Note about honest documentation of current state

## Phase 4: Extraction Validation & Cleanup

- **STEP 4A**: Use Read tool to perform final validation of extracted specification document
- **STEP 4B**: Verify specification accurately reflects actual codebase without imposing ideal patterns
- **STEP 4C**: Confirm all N/A entries are properly justified and accurate
- **STEP 4D**: Report final extraction status and note that specification reflects current implementation reality

**IMPORTANT NOTES**:
- This command documents existing codebase reality without judgment or improvement suggestions
- Generated specifications reflect actual implementation patterns, architecture, and organization
- N/A entries indicate missing or unimplemented patterns - this is accurate documentation, not a failure
- Purpose is to enable AI agents to work effectively with existing codebases as they are