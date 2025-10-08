---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Extract project specification from existing codebase through systematic analysis
argument-hint: {project_folder:string:optional}
---

# Project Specification Extraction Command

Extract comprehensive technical specification from existing codebase through systematic analysis. Documents actual architecture, patterns, and implementation as-is without judgment or design recommendations.

**Platform**: Cross-platform (Windows/Linux/macOS)
**Reference**: `.claude/templates/PROJECT_TEMPLATE.md` for output structure
**Guide**: `Documents/Guides/ARCHITECTURE_PATTERN.md` for architecture principles

## 1. Validation & Technology Detection

**STEP 1.1 - Validate Environment**:
<if ({project_folder} is empty)>
- Set {project_folder} = current working directory "."
- Use Bash: "pwd" to confirm directory
<else>
- Validate {project_folder} exists: Bash "test -d {project_folder} && echo 'exists' || echo 'missing'"
- Abort if missing
</if>
- Ensure output directory: Bash "mkdir -p Documents"
- Validate PROJECT_TEMPLATE.md exists using Read tool

**STEP 1.2 - Detect Technologies**:
Use Glob/Grep to identify technologies:
- Backend: *.csproj (.NET), pom.xml/build.gradle (Java), package.json (Node), go.mod (Go), Cargo.toml (Rust), requirements.txt (Python)
- Frontend: package.json (react/vue/angular/svelte), tsconfig.json (TypeScript), vite/webpack.config (build tools)
- ORM: DbSet< (EF Core), JpaRepository (Spring JPA), prisma/schema.prisma (Prisma), models.Model (Django)
- Infrastructure: Redis/StackExchange.Redis (cache), SignalR (real-time .NET), socket.io/ws (real-time Node)

Store detected technologies in memory with versions.

**STEP 1.3 - Retrieve Discovery Patterns**:
<foreach {technology} in {detected_technologies}>
- WebSearch discovery patterns for {technology.name} {technology.version}
- Store in memory: "discovery_pattern_{technology.name}: {patterns}"
</foreach>

## 2. Initialize Extraction Memory

**STEP 2.1 - Create Extraction Entity**:
Use mcp__memory__create_entities:
- name: "current_project_extraction"
- entityType: "extraction"
- observations: ["status: analysis_starting", "analysis_complete: false", "analysis_count: 0", "project_folder: {project_folder}"]

**STEP 2.2 - Track Variables**:
Use mcp__memory__add_observations to track required variables (see PROJECT_TEMPLATE.md for complete list)

## 3. Systematic Codebase Analysis

Use Task tool with solution-engineer agent for exhaustive extraction:

```markdown
ROLE: Project Architecture Extraction Analyst

TASK: Extract complete project architecture using technology-adaptive exhaustive discovery.

CRITICAL: Document reality with 100% coverage. Extract ALL entities, components, patterns.

TARGET: "Documents/PROJECT.md"
TEMPLATE: ".claude/templates/PROJECT_TEMPLATE.md"
PROJECT: "{project_folder}"
TECHNOLOGIES: {detected_technologies}
STRATEGIES: {discovery_patterns}

## PHASE 1: INVENTORY (CREATE COMPLETE LISTS - NO ANALYSIS YET)
───────────────────────────────────────────────────────────────

<if (Entity Framework Core detected)>
**ENTITY INVENTORY**: grep "DbSet<" in *Context.cs → extract all entity names → store entity_list
**ENUM INVENTORY**: grep "public enum" in *.cs → extract all enum names → store enum_list
</if>

<if (Spring Data JPA detected)>
**ENTITY INVENTORY**: grep "@Entity" in *.java → extract class names → cross-ref JpaRepository
</if>

<if (React detected)>
**COMPONENT INVENTORY**: find *.tsx/*.jsx → store component_files
**PAGE INVENTORY**: find src/pages/*.tsx → store page_files
</if>

<if (Redux detected)>
**SLICE INVENTORY**: grep "createSlice" in *.ts → store slice_list
</if>

CHECKPOINT - Report inventories:
```
INVENTORY COMPLETE
Entities: {entity_count}
Enums: {enum_count}
Components: {component_count}
```

## PHASE 2: ANALYSIS (MANDATORY - PROCESS ALL INVENTORY ITEMS)
───────────────────────────────────────────────────────────────

<if (Entity Framework Core detected)>
**ENTITY ANALYSIS** (Loop all entities):
<foreach entity_name in entity_list>
  Read file → Extract properties/relationships/enums → Store data
</foreach>
VERIFY: entities_analyzed == entity_count

**ENUM ANALYSIS** (Loop all enums):
<foreach enum_name in enum_list>
  grep -A 30 → Extract ALL values to closing brace → Store data
</foreach>
VERIFY: enums_analyzed == enum_count (all complete)
</if>

**ARCHITECTURE**: Bounded contexts, ports/adapters, use cases, domain interactions

## PHASE 3: VERIFICATION (FORCED - CANNOT SELF-REPORT COMPLETE)
───────────────────────────────────────────────────────────────

<if (Entity Framework Core detected)>
VERIFY: entities_analyzed == dbset_count (ERROR if mismatch)
VERIFY: all enums complete with closing braces (ERROR if incomplete)
</if>

CRITERIA (ALL required): Entities analyzed, Enums complete, Contexts identified, Architecture documented
STATUS: complete (High confidence) OR analysis_needed (Low confidence)

OUTPUT: STATUS, METRICS (entities/enums/coverage %), EXTRACTED_VARIABLES, MISSING_VARIABLES (N/A), VERIFICATION results
```

## 4. Generate Specification Document

**STEP 4.1-4**: Retrieve memory observations → Load PROJECT_TEMPLATE.md → Parse variables (handle N/A) → Apply DSL substitution

**STEP 4.5**: Prepend extraction metadata (technologies detected, entities/enums/components analyzed, confidence, coverage %, date)

**STEP 4.6-9**: Write "Documents/PROJECT.md" → Validate → Update memory (status: extraction_complete) → Report (path, metrics, N/A summary)

## Quick Reference

- **Architecture**: `Documents/Guides/ARCHITECTURE_PATTERN.md`
- **Templates**: `.claude/templates/PROJECT_TEMPLATE.md`
- **Output**: `Documents/PROJECT.md`
- **Related**: `/extraction:extract-solution`, `/extraction:extract-structure`

**IMPORTANT NOTES**:
- Documents existing reality without judgment
- Specifications reflect actual implementation as-is
- N/A entries indicate missing/unimplemented patterns (accurate documentation)
- Enables AI agents to work with codebases as they exist
