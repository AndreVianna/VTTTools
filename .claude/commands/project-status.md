---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Glob, Grep, Bash]
description: Display hierarchical project structure with specification, implementation, and testing status
argument-hint: {detail_level:string:optional(summary)}
---

# Project Status Command

Displays hierarchical visualization of complete project status showing specifications (Project → Domain Models → Features → Use Cases → BDD), implementation progress (Phase 2), and testing results (Phase 3) across all project phases.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Process

### Setup & Scope

- **STEP 0A**: Parse {detail_level} parameter:
  <case {detail_level}>
  <is "summary" or empty>
    - Show: Project → Features (collapsed use cases)
  <is "detailed">
    - Show: Project → Features → Use Cases → BDD files
  <is "full">
    - Show: Project → Features → Use Cases → BDD files + future: implementation & test status
  <otherwise>
    - Display error, show valid options: summary, detailed, full
  </case>

### Discover Project Structure

- **STEP 1A**: Use Read tool to check for "Documents/PROJECT.md"
  <if (not found)>
  - Display: "No project specification found. Run /create-project or /extract-project first."
  - Exit
  </if>

- **STEP 1B**: Extract project name from specification header

- **STEP 1C**: Use Glob to discover all artifacts and STATUS files:
  - Project Status: "Documents/PROJECT_STATUS.md"
  - Domain Models: "Documents/Areas/*/DOMAIN_MODEL.md"
  - Domain Status: "Documents/Areas/*/DOMAIN_STATUS.md"
  - Features: "Documents/Areas/*/Features/*.md"
  - Feature Status: "Documents/Areas/*/Features/*_STATUS.md"
  - Use Cases: "Documents/Areas/*/Features/*/UseCases/*.md"
  - Use Case Status: "Documents/Areas/*/Features/*/UseCases/*_STATUS.md"
  - BDD Files: "Documents/Areas/**/*.feature"

- **STEP 1D**: Parse file paths to build hierarchy:
  - Extract area names from paths
  - Group features by area
  - Group use cases by feature
  - Map STATUS files to their specs

### Read STATUS Files for Implementation Data

- **STEP 2A**: Read PROJECT_STATUS.md (if exists):
  - Extract: phase progress, overall grades, metrics
  - Parse: implementation percent, test coverage, quality scores
  - If not exists: Display warning and calculate from individual files

- **STEP 2B**: For each area, read DOMAIN_STATUS.md (if exists):
  - Extract: domain implementation status, entities/VOs implemented
  - Extract: test status, quality scores, grade
  - Fallback to memory if STATUS file missing

- **STEP 2C**: For each feature, read FEATURE_STATUS.md (if exists):
  - Extract: use case matrix with implementation/test status
  - Extract: feature-level grades and metrics
  - Use for summary view aggregation

- **STEP 2D**: For each use case, read USECASE_STATUS.md (if exists):
  - Extract: layer-by-layer status (Application ✅, Infrastructure ✅, UI ✅/❌)
  - Extract: test results (passing/total, coverage, grade)
  - Extract: quality scores, spec compliance
  - Extract: UI type and location
  - Extract: recommendation (KEEP, ENHANCE, REFACTOR, COMPLETE, IMPLEMENT)
  - Fallback to use case spec for UI type if STATUS missing

### Display Hierarchical Structure

- **STEP 3A**: Format and display tree structure:

### Summary View (detail_level = summary):
```
PROJECT STRUCTURE

📦 {Project Name} v{version}
│
├─ 📂 {Area 1} ({feature_count} features)
│   ├─ 📚 Domain Model: {status} ({entity_count} entities, {vo_count} value objects)
│   ├─ 📄 {Feature 1} ({use_case_count} use cases)
│   ├─ 📄 {Feature 2} ({use_case_count} use cases)
│   └─ 📄 {Feature 3} ({use_case_count} use cases)
│
├─ 📂 {Area 2} ({feature_count} features)
│   ├─ 📄 {Feature 4} ({use_case_count} use cases)
│   └─ 📄 {Feature 5} ({use_case_count} use cases)
│
└─ 📂 {Area 3} ({feature_count} features)
    └─ 📄 {Feature 6} ({use_case_count} use cases)

Summary:
- Total Areas: {count}
- Total Features: {count}
- Total Use Cases: {count}
- Total BDD Files: {count}
```

### Detailed View (detail_level = detailed):
```
PROJECT STRUCTURE (Detailed)

📦 {Project Name} v{version}
│
├─ 📂 {Area 1}
│   │
│   ├─ 📄 {Feature 1}
│   │   ├─ 📋 {Use Case 1.1} ({ui_icon} {ui_type})
│   │   ├─ 📋 {Use Case 1.2} ({ui_icon} {ui_type})
│   │   └─ 📋 {Use Case 1.3} ({ui_icon} {ui_type})
│   │
│   └─ 📄 {Feature 2}
│       ├─ 📋 {Use Case 2.1}
│       └─ 📋 {Use Case 2.2}
│
├─ 📂 {Area 2}
│   └─ 📄 {Feature 3}
│       ├─ 📋 {Use Case 3.1}
│       ├─ 📋 {Use Case 3.2}
│       ├─ 📋 {Use Case 3.3}
│       └─ 📋 {Use Case 3.4}
│
└─ 📂 {Area 3}
    └─ 📄 {Feature 4}
        └─ 📋 {Use Case 4.1}

BDD Coverage:
- Feature-level BDD: {count} files
- Use Case-level BDD: {count} files
- Total Scenarios: {count}
```

### Full View (detail_level = full):
```
PROJECT STRUCTURE (Full)

📦 {Project Name} v{version}
│
├─ 📂 {Area 1}
│   │
│   ├─ 📄 {Feature 1}
│   │   │
│   │   ├─ 📋 {Use Case 1.1} ({ui_icon} {ui_type}: {ui_location})
│   │   │   ├─ 🧪 BDD: {Use Case 1.1}.feature ({scenario_count} scenarios)
│   │   │   ├─ ⚙️  Implementation: [PLACEHOLDER - Phase 2]
│   │   │   └─ ✅ Tests: [PLACEHOLDER - Phase 2]
│   │   │
│   │   ├─ 📋 {Use Case 1.2}
│   │   │   ├─ 🧪 BDD: {Use Case 1.2}.feature ({scenario_count} scenarios)
│   │   │   ├─ ⚙️  Implementation: [PLACEHOLDER - Phase 2]
│   │   │   └─ ✅ Tests: [PLACEHOLDER - Phase 2]
│   │   │
│   │   └─ 🧪 Feature BDD: {Feature 1}.feature ({scenario_count} scenarios)
│   │
│   └─ 📄 {Feature 2}
│       └─ 📋 {Use Case 2.1}
│           ├─ 🧪 BDD: {Use Case 2.1}.feature
│           ├─ ⚙️  Implementation: [PLACEHOLDER - Phase 2]
│           └─ ✅ Tests: [PLACEHOLDER - Phase 2]
│
└─ [Additional areas...]

Legend:
  📦 Project Specification
  📂 Bounded Context (Area)
  📄 Feature Specification
  📋 Use Case Specification
  🧪 BDD Feature File
  ⚙️  Implementation Status [Phase 2]
  ✅ Test Status [Phase 2]

UI Type Icons:
  ⚙️  NO_UI - Internal/background operation
  🔌 API_ENDPOINT - REST/GraphQL endpoint
  🖥️ FULL_PAGE - Dedicated page/route
  🪟 MODAL - Dialog/overlay
  📝 FORM - Form within page
  🧩 WIDGET - Reusable component
  🔘 BUTTON - Action button
  📋 MENU_ITEM - Navigation item
  📊 PANEL - Collapsible section

Summary:
- Areas: {count}
- Features: {count}
- Use Cases: {count}
- BDD Files: {count} ({scenario_count} scenarios total)
- Implementation: [Phase 2 - Not yet available]
- Test Coverage: [Phase 2 - Not yet available]
```

### Display Statistics

- **STEP 4A**: Calculate and display key metrics:
  ```
  PROJECT METRICS

  Specification Coverage:
  - Bounded Contexts (Areas): {count}
  - Features: {count}
  - Use Cases: {count}
  - BDD Feature Files: {count}
  - BDD Scenarios: {count}

  UI Distribution:
  - 🖥️ Full Pages: {count} use cases
  - 🔌 API Endpoints: {count} use cases
  - 📝 Forms: {count} use cases
  - 🔘 Buttons: {count} use cases
  - 🧩 Widgets: {count} use cases
  - 🪟 Modals: {count} use cases
  - 📋 Menu Items: {count} use cases
  - 📊 Panels: {count} use cases
  - ⚙️  No UI/Internal: {count} use cases

  Quality Indicators:
  - Features with BDD: {count}/{total} ({percentage}%)
  - Use Cases with BDD: {count}/{total} ({percentage}%)
  - Avg Scenarios/Use Case: {average}
  - Use Cases with UI specified: {count}/{total} ({percentage}%)

  Phase 1 Status: ✅ COMPLETE
  Phase 2 Status: 🔜 READY (Implementation & Testing)
  ```

### Future Extensibility (Phase 2 Placeholders)

**STEP 5A**: When Phase 2 is implemented, this command will also show:

**Implementation Status** (per use case):
- ⚙️  NOT_STARTED - No code generated
- 🔨 IN_PROGRESS - Partial implementation
- ✅ IMPLEMENTED - Code complete
- ⚠️  NEEDS_UPDATE - Spec changed after implementation

**Test Status** (per use case):
- 📝 NO_TESTS - Step definitions not created
- 🧪 TESTS_EXIST - Step definitions created
- ✅ PASSING - All BDD scenarios pass
- ❌ FAILING - Some scenarios fail ({count} failures)
- ⚠️  OUTDATED - BDD regenerated, tests need update

**Integration with Phase 2 Commands**:
- /implement-use-case will update implementation status
- /test-implementation will update test status
- /show-structure will display real-time progress

**Current State**: Placeholders shown, actual status tracking awaits Phase 2

## Quick Reference
- VTTTOOLS_STACK.md: VttTools technology stack overview
- ARCHITECTURE_PATTERN.md: DDD Contracts + Service Implementation pattern

**IMPORTANT NOTES**:
- Displays complete project status from FILES (persistent, version controlled)
- PRIMARY data source: STATUS.md files at all levels
- FALLBACK: Memory entities if STATUS files don't exist
- Supports 3 detail levels: summary, detailed, full
- Full view shows implementation status, test results, grades from STATUS files
- Run /assess-implementation first to generate STATUS files
- STATUS files updated automatically by implementation commands
- Useful for: tracking real progress, identifying gaps, prioritizing work