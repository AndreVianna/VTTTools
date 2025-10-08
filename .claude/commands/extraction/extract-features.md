---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Extract Areas, Features, and Use Cases from existing codebase into specification files
argument-hint: {area_filter:string:optional} {feature_filter:string:optional} {dry_run:flag:optional(false)} {test_session_limit:flag:optional(false)}
---

# Extract Features

Extract Areas, Features, and Use Cases from existing codebase through reverse engineering, generating specification files using established templates.

## Parameters

- `{area_filter}` - Optional area name filter (e.g., "Asset Management")
- `{feature_filter}` - Optional feature name filter
- `{dry_run}` - Preview mode without creating files (default: false)
- `{test_session_limit}` - Test session limit handling in dry run (default: false)

**Usage Examples**:
```bash
/extract-features                           # Extract all
/extract-features "Asset Management"        # Specific area
/extract-features "" "User Authentication"  # Specific feature
/extract-features "" "" true                # Dry run
```

## Process

### Setup & Validation

**Validate Environment**:
- Confirm current directory is project root
- Ensure `Documents/Areas/` directory exists
- Load templates: `.claude/templates/FEATURE_TEMPLATE.md`, `.claude/templates/USE_CASE_TEMPLATE.md`
- Initialize memory entity for extraction session

**Parse Filters**:
- Apply area/feature filters if provided
- Set extraction scope accordingly

### Codebase Discovery

**Technology Detection**:
- Detect project technologies (C#/.NET, React, etc.)
- Reference: `Documents/Guides/VTTTOOLS_STACK.md` for architecture patterns

**Discovery Analysis** (using solution-engineer agent):
- **Areas**: Analyze folder structure for domain boundaries (modules, namespaces, bounded contexts)
- **Features**: Within areas, identify major capabilities (service groups, component groups)
- **Use Cases**: Within features, identify specific operations (methods, endpoints, handlers)

**Frontend Classification Rules** (CRITICAL):
- Domain-specific UI → Assign to business domain (Login UI → Authentication area)
- Cross-cutting UI → Platform Infrastructure only (AppLayout, ThemeProvider, ErrorBoundary)
- NO monolithic "Frontend Application" feature

**Discovery Output**: Hierarchical JSON structure with areas → features → use cases

### Scope Assessment & User Approval

**Large Codebases (>50 files detected)**:
Display options:
- **A) Generate script + extract first area** (recommended for atomic, no-fail execution)
- **B) Dry run preview** (safe testing)
- **C) Full extraction** (risky, uses retry logic)

**Domain Assignment Review**:
- Present frontend component assignments
- Flag suspicious patterns (monolithic features, misclassified UI)
- Offer auto-correction or manual review

**User Confirmation**: Display discovered structure, wait for approval to proceed

### Batch Generation

**Strategy**:
- Single batch if ≤5 features
- Area-based batching if >5 features
- 5 features per batch maximum

**For Each Batch**:
- Track with TodoWrite tool
- Generate feature specifications using FEATURE_TEMPLATE.md
- Generate use case specifications using USE_CASE_TEMPLATE.md
- Extract template variables from codebase analysis (agent reads code, docs, tests)
- Update memory graph (create entities and relationships)

**Retry Logic**:
- If session limit hit, add batch to retry queue
- Wait 30s cooldown, retry failed batches
- Report any persistent failures

### Structure Validation

**Post-Generation Validation**:
- Verify all expected files created at correct nested paths
- Search for misplaced files
- Auto-correct file placement if needed
- Report validation results and corrections applied

### Script Generation (Option A)

If user selected script generation for large codebases:
- Generate PowerShell (.ps1) or Bash (.sh) script
- Script contains area-by-area extraction commands
- Save to `.claude/scripts/extract_all_features.*`
- Extract first area immediately for progress
- User runs script at convenience for remaining areas

### Finalization

**Memory Updates**:
- Record extraction completion
- Store file counts and entity counts
- Timestamp completion

**Reporting**:
- Display files generated count
- Show output location structure
- Provide next steps (review specs, run /generate-bdd, /validate-solution)

## Important Notes

- Performs reverse engineering (code → specifications)
- Extracted info based on code analysis, not design intent
- "N/A" entries expected for undocumented information
- Manual review/refinement recommended after extraction
- TodoWrite provides real-time progress tracking
- Memory graph enables future project structure queries

## Quick Reference

- **Templates**: `.claude/templates/FEATURE_TEMPLATE.md`, `.claude/templates/USE_CASE_TEMPLATE.md`
- **Architecture**: `Documents/Guides/VTTTOOLS_STACK.md`
- **Output**: `Documents/Areas/{area}/Features/{feature}/{feature}.md`
- **Next**: `/generate-bdd`, `/validate-solution`, `/extract-solution`

---

**CRITICAL**: Dry run mode recommended for large codebases first. Script generation (Option A) provides safest execution for >50 files.
