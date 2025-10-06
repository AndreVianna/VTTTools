---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Bash, TodoWrite]
description: Configure implementation preferences and workflow settings
argument-hint:
---

# Configure Implementation Command

Sets user preferences for Phase 2 implementation workflow including approval mode, quality thresholds, and behavior settings. Configuration stored in memory and used by all implementation commands.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Phase 0: Load Current Configuration

- **STEP 0A**: Use mcp__memory__search_nodes for "ImplementationConfig"
- **STEP 0B**: Display current settings if exist, defaults if new

## Phase 1: Collect Preferences

- **STEP 1A**: Prompt user for configuration:

  ```
  ═══════════════════════════════════════════
  IMPLEMENTATION CONFIGURATION
  ═══════════════════════════════════════════

  1. Approval Mode (How much control do you want?)
     a. INTERACTIVE - Approve each layer and commit (RECOMMENDED for first use)
     b. SEMI_AUTO - Auto-proceed if tests pass, stop on failures
     c. AUTO - Complete entire feature, review at end

     Choice [a/b/c]: _

  2. Quality Thresholds
     - Minimum unit test coverage: ___% (default: 80%)
     - Maximum cyclomatic complexity: ___ (default: 10)
     - Allow code review warnings: [Y/N] (default: Y)

  3. Test Behavior
     - Run tests after each layer: [Y/N] (default: Y)
     - Stop on first test failure: [Y/N] (default: Y)
     - Maximum retry attempts: ___ (default: 3)

  4. Commit Behavior
     - Auto-stage all changes: [Y/N] (default: Y)
     - Require commit message review: [Y/N] (default: Y for INTERACTIVE)
     - Use conventional commits: [Y/N] (default: Y)

  5. Code Review
     - Run automated review before commit: [Y/N] (default: Y)
     - Block commit on critical issues: [Y/N] (default: Y)
     - Block commit on high issues: [Y/N] (default: N)
  ```

- **STEP 1B**: Validate inputs
- **STEP 1C**: Display configuration summary for confirmation

## Phase 2: Store Configuration

- **STEP 2A**: Use mcp__memory__create_entities or update:
  - name: "ImplementationConfig"
  - entityType: "configuration"
  - observations: [all settings]

## Phase 3: Reporting

- **STEP 3A**: Display saved configuration
- **STEP 3B**: Explain how to change: "Run /configure-implementation again to modify"

**IMPORTANT NOTES**:
- INTERACTIVE mode recommended for first implementation
- Configuration persists across implementation sessions
- Can be changed anytime
- Affects all /implement-* commands behavior