---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Extract solution specification from existing codebase through systematic analysis
argument-hint: {project_folder:string:optional}
---

# Solution Specification Extraction Command

Extract comprehensive technical specification from existing codebase through systematic analysis. Documents actual architecture, patterns, and implementation as-is without judgment or design recommendations.

**Platform**: Cross-platform (Windows/Linux/macOS)
**Output**: Documents/SOLUTION.md
**Template**: .claude/templates/SOLUTION_TEMPLATE.md
**Guide**: See @Documents/Guides/ARCHITECTURE_PATTERN.md for pattern details

## Section 1: Validation & Multi-Technology Discovery

**Validation**:
<if ({project_folder} is empty)>
- Set {project_folder} = current working directory "."
- Use Bash: "pwd" to confirm path
<else>
- Validate folder exists: "test -d {project_folder} && echo 'exists' || echo 'missing'"
- Abort if missing
</if>
- Ensure output directory: "mkdir -p Documents"
- Validate SOLUTION_TEMPLATE.md exists using Read tool

**Technology Detection**: Glob/Grep for backend (*.csproj/.NET, pom.xml/Java, package.json/Node, go.mod, Cargo.toml, requirements.txt), frontend (react/vue/angular/svelte, tsconfig.json), ORM (DbSet</EF, JpaRepository/JPA, prisma, models.Model), cache (Redis/Memcached), real-time (SignalR/socket.io)

**Discovery Strategy**: For each tech, WebSearch discovery patterns and store in memory. Examples: EF→DbSet<T>, JPA→@Entity, React→*.tsx

Report detected technologies before proceeding.

## Section 2: Initialize Memory & Exhaustive Analysis

**Memory Initialization**: Create "current_solution_extraction" entity with observations: ["status: analysis_starting", "analysis_complete: false", "project_folder: {project_folder}"]. Track variables per SOLUTION_TEMPLATE.md.

**Exhaustive Analysis Task** (Use Task tool with solution-engineer agent):

```markdown
ROLE: Solution Architecture Extraction Analyst

TASK: Extract complete solution architecture using technology-adaptive exhaustive discovery.

CRITICAL: Document reality with 100% coverage. Extract ALL entities, components, patterns.

PROJECT: {project_folder}
OUTPUT: Documents/SOLUTION.md
TEMPLATE: .claude/templates/SOLUTION_TEMPLATE.md
TECHNOLOGIES: {detected_technologies}
STRATEGIES: {discovery_patterns}

────────────────────────────────────────────────────────────────────
STEP 1: TECHNOLOGY-SPECIFIC INVENTORY (Create Complete Lists)
────────────────────────────────────────────────────────────────────

CRITICAL: ONLY create inventories. Do NOT analyze content yet.

<if (Entity Framework Core detected)>
**ENTITIES**: grep -r "DbSet<" --include="*Context.cs" → Extract ALL entity names → Store: entity_list
**ENUMS**: grep -r "^[[:space:]]*public enum " --include="*.cs" → Extract ALL enum names → Store: enum_list
Report: "Found {entity_count} entities, {enum_count} enums"
</if>

<if (Spring Data JPA detected)>
**ENTITIES**: grep -r "@Entity" --include="*.java" → Cross-ref "JpaRepository<" → Store: entity_list
</if>

<if (React detected)>
**COMPONENTS**: find src -name "*.tsx" -o -name "*.jsx" → Store: component_files
**PAGES**: find src/pages -name "*.tsx" → Store: page_files
</if>

<if (Redux detected)>
**SLICES**: grep -r "createSlice" src --include="*.ts" → Store: slice_list
</if>

CHECKPOINT: Report all inventory counts before proceeding.

────────────────────────────────────────────────────────────────────
STEP 2: EXHAUSTIVE ANALYSIS (MANDATORY - Process ALL Items)
────────────────────────────────────────────────────────────────────

CRITICAL: MUST process EVERY item. NO SAMPLING.

<if (Entity Framework Core detected)>
**ENTITY ANALYSIS** (Mandatory Loop):
<foreach entity_name in entity_list>
  Progress: "Entity {N} of {total}: {entity_name}"
  - Read entity file
  - Extract: properties, relationships, base classes, enums
  - Store: "entity_{entity_name}: {data}"
</foreach>
VERIFY: entities_analyzed == entity_count

**ENUM ANALYSIS** (Complete Values Required):
<foreach enum_name in enum_list>
  Progress: "Enum {N} of {total}: {enum_name}"
  - grep "public enum {enum_name}" -A 30 → Parse ALL values until "}"
  - VERIFY: Contains closing brace (completeness check)
  - Store: "enum_{enum_name}_values: [all_values]"
</foreach>
VERIFY: enums_analyzed == enum_count
</if>

<if (React detected)>
**COMPONENT ANALYSIS** (Sample-based for patterns):
- Component structure patterns
- Routing patterns
- State management approach
</if>

**ARCHITECTURE ANALYSIS**:
- Bounded contexts (namespace/package structure)
- Ports & adapters (interface patterns)
- Use case patterns (service methods)
- Domain interactions (dependency flow)

────────────────────────────────────────────────────────────────────
STEP 3: FORCED VERIFICATION (Cannot Self-Report Complete)
────────────────────────────────────────────────────────────────────

<if (Entity Framework Core detected)>
**COUNTS**:
- Expected (DbSet): {dbset_count}
- Analyzed: {entities_analyzed}
- Match: <if (NOT match)>ERROR: analysis_needed</if>

**ENUMS**:
<foreach enum in analyzed_enums>
- {enum.name}: {enum.value_count} values, complete: {enum.complete}
- <if (NOT complete)>ERROR</if>
</foreach>
</if>

**COMPLETION CRITERIA** (ALL must be TRUE):
- [ ] All entities from DbContext analyzed
- [ ] All enums complete
- [ ] All bounded contexts identified
- [ ] Architecture patterns documented

<if (ALL met)>STATUS: complete</if>
<else>STATUS: analysis_needed, ACTIONS: {missing_items}</else>

────────────────────────────────────────────────────────────────────
OUTPUT FORMAT
────────────────────────────────────────────────────────────────────

STATUS: [analysis_needed|complete]

EXTRACTION_METRICS:
- Entities: Y of X ({pct}%)
- Enums: B of A ({pct}%)
- Coverage: {overall_pct}%
- Confidence: [High|Medium|Low]

EXTRACTED_VARIABLES: [list]
MISSING_VARIABLES: [N/A items]

VERIFICATION_RESULTS:
- Entity count match: YES/NO
- Enum completeness: YES/NO
- Coverage acceptable: YES/NO

<if (complete)>
JUSTIFICATION:
- All {entity_count} entities analyzed ✓
- All {enum_count} enums complete ✓
- Coverage: {pct}% ✓
</if>
```

## Section 3: Specification Generation

**Generate Specification**: Load memory (mcp__memory__open_nodes), template (Read SOLUTION_TEMPLATE.md), parse observations, apply DSL substitution, prepend extraction metadata:

```markdown
---
Extraction Metadata:

<if (EF Core detected)>
Backend (.NET {version}):
- Entities: {entities_analyzed}/{entity_count} ({pct}%)
- Enums: {enums_complete}/{enum_count} ({pct}%)
- Confidence: {confidence}
</if>

<if (React detected)>
Frontend (React {version}):
- Components: {component_count}
- Pages: {page_count}
- Confidence: {confidence}
</if>

Overall: {overall_confidence} ({coverage}% verified)
Date: {current_date}
---
```

Write to Documents/SOLUTION.md, validate with Read, update memory: "status: extraction_complete"

**Report**: Path, metrics ({entity_count} entities, {enum_count} enums, {confidence}), extracted vs. N/A summary

## Section 4: Validation

Read document to verify accuracy. Confirm reflects actual codebase, N/A entries justified.

## Quick Reference

- **Architecture**: `Documents/Guides/ARCHITECTURE_PATTERN.md`
- **Templates**: `.claude/templates/SOLUTION_TEMPLATE.md`
- **Output**: `Documents/SOLUTION.md`
- **Related**: `/extraction:extract-project`, `/extraction:extract-structure`, `/extraction:extract-features`

**NOTES**: Documents reality as-is without judgment. N/A = missing patterns (accurate, not failure). Enables AI to work with existing codebases.
