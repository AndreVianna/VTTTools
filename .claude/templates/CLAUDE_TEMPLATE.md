# CLAUDE.md

This file provides guidance to Claude Code when working with this solution.

<!-- TIER: NEVER_COMPRESS Lines: 6-12 -->
## ⚠️ [PRIORITY:HIGH] General Behavior ⚠️

- **CRITICAL** Please avoid sycophancy!
- **CRITICAL** NEVER SAY "You are right!", "You're absolutely right!", "You're absolutely correct!", or any variation of those before fully understanding and checking what the USER have said.
- **CRITICAL** ALWAYS check your work and the work of subagents.
- **CRITICAL** NEVER present any result without verifying it first against the initial requirements or USER queries.

<!-- END:CRITICAL Total: 7 lines -->
<!-- TIER: LIGHT_OPTIMIZE Lines: 15-37 -->
## [PRIORITY:HIGH] Solution Context

### Solution Identity
- **SOLUTION_NAME**: {SOLUTION_NAME}
- **SOLUTION_TYPE**: {SOLUTION_TYPE}
- **ARCHITECTURE_PATTERN**: {ARCHITECTURE_PATTERN}
- **USES_CONTAINERS**: {USES_CONTAINERS}
- **TARGET_ENVIRONMENT**: {TARGET_ENVIRONMENT}

### Solution Constraints & Standards
- **CONSTRAINTS**:
  [IF:PROJECT_USE_CONTAINERS] - You and all subagents MUST NEVER use Docker Desktop. NO integration with Docker Desktop is possible. REMOVE ALL references to Docker Desktop.[/IF]
  - {PROJECT_CONSTRAINTS}
- **REQUIREMENTS**:
  [IF:PROJECT_USE_CONTAINERS] - You and any subagents MUST only use Docker CLI though PowerShell.[/IF]
  - {PROJECT_REQUIREMENTS}
- **MANDATORY_STANDARDS**:
  - {PROJECT_MANDATORY_STANDARDS}
- **PREFERRED_PATTERNS**:
  - {PROJECT_PREFERRED_PATTERNS}
- **INFORMATION_LOOKUP**:
  1. **Dynamic Memory** (MCP) → 2. **Docs & Guides** ('{DOCUMENTATION_BASE_FOLDER}') → 3. **Code Base** → 4. **External** (Web Search)

<!-- END:CORE Total: 23 lines -->
<!-- TIER: MODERATE_OPTIMIZE Lines: 40-94 -->
## [PRIORITY:HIGH] Module Architecture

[FOREACH:BACKEND_MODULE]
### Backend Module: {MODULE_NAME}
- **Location**: `{MODULE_PATH}`
- **Type**: {MODULE_TYPE}
- **Tech Stack**: {MODULE_TECH_STACK}
- **Build Commands**:
  - Full: `{MODULE_BUILD_FULL}`
  - Quick: `{MODULE_BUILD_QUICK}`
- **Unit Tests**:
  - All: `{MODULE_TEST_ALL}`
  - Filtered: `{MODULE_TEST_FILTERED}`
  - Coverage: `{MODULE_COVERAGE_COMMAND}`
- **Integration Tests**: `{MODULE_INTEGRATION_TESTS}`
- **Debug Method**: {MODULE_DEBUG_METHOD}
- **Structure**: {MODULE_FOLDER_STRUCTURE}

[/FOREACH]

[FOREACH:FRONTEND_MODULE]
### Frontend Module: {MODULE_NAME}
- **Location**: `{MODULE_PATH}`
- **Type**: {MODULE_TYPE}
- **Tech Stack**: {MODULE_TECH_STACK}
- **Build Commands**:
  - Development: `{MODULE_BUILD_DEV}`
  - Production: `{MODULE_BUILD_PROD}`
- **Test Commands**: `{MODULE_TEST_COMMANDS}`
- **Integration Tests**: `{MODULE_INTEGRATION_TESTS}`
- **Debug Method**: {MODULE_DEBUG_METHOD}
- **Structure**: {MODULE_FOLDER_STRUCTURE}

[/FOREACH]

[FOREACH:STORAGE_MODULE]
### Storage System: {STORAGE_NAME}
- **Type**: {STORAGE_TYPE}
- **Technology**: {STORAGE_TECH_STACK}
- **Schema Location**: `{STORAGE_SCHEMA_PATH}`
- **Migration Commands**: `{STORAGE_MIGRATION_COMMANDS}`

[/FOREACH]

## [PRIORITY:MEDIUM] Cross-Module Operations

### Solution-Wide Commands
- **Build All**: `{SOLUTION_BUILD_ALL}`
- **Test All**: `{SOLUTION_TEST_ALL}`
- **Start Development**: `{SOLUTION_START_DEV}`
- **Deploy**: `{SOLUTION_DEPLOY}`

### Module Dependencies
{MODULE_DEPENDENCY_GRAPH}

<!-- END:OPERATIONAL Total: 55 lines -->
<!-- TIER: HEAVY_OPTIMIZE Lines: 97-135 -->
## [PRIORITY:MEDIUM] Documentation & Navigation

### Documentation Structure
- **Base Folder**: `{DOCUMENTATION_BASE_FOLDER}`
- **Specifications**: `{SPECIFICATIONS_FOLDER}`
- **Guides**: `{GUIDES_FOLDER}`
- **Templates**: `{TEMPLATES_FOLDER}`
- **Troubleshooting**: `{TROUBLESHOOTING_FOLDER}`

### Search Commands
- **Find Folders**: `{FOLDER_SEARCH_COMMANDS}`
- **Find Files**: `{FILE_SEARCH_COMMANDS}`
- **Search Content**: `{FILE_CONTENT_SEARCH_COMMANDS}`

## [PRIORITY:LOW] Reference Context

### Agent Configuration
[IF:AGENTS_AVAILABLE]
**Available Agents** (all discover YOUR project automatically):
- task-organizer: Complex task breakdown and coordination
- solution-engineer: Technical analysis and architecture decisions  
- backend-developer: Server-side code, APIs, databases (any backend tech)
- frontend-developer: UI components, styling (any frontend framework)
- test-automation-developer: Automated testing (any testing framework)
- code-reviewer: Quality assurance and security analysis (any standards)
- devops-specialist: CI/CD, deployment, infrastructure (any DevOps stack)
- shell-developer: Scripts and automation (cross-platform)
- ux-designer: User experience and interface design (any domain)

**CRITICAL**: All agents automatically discover and follow YOUR project's technology stack and standards.
**See**: Documents/Guides/AGENT_USAGE_GUIDE.md for detailed coordination patterns and examples.
[/IF]

### MCP Integration
[IF:MCP_CONFIGURED]
**MCP_SERVERS**: {MCP_SERVER_LIST}
[IF:MEMORY_MCP_CONFIGURED] **DYNAMIC_MEMORY_STRATEGY**: {MCP_MEMORY_USAGE_PATTERN}[/IF]
[IF:SEQUENTIAL_THINKING_MCP_CONFIGURED] **THINKING_MODE**: {SEQUENTIAL_THINKING_STRATEGY}[/IF]
[/IF]

<!-- END:REFERENCE Total: 49 lines -->
---
**CONTEXT_ENGINEERING_NOTES**:
- Priority markers guide AI attention allocation (NEVER_COMPRESS: 30 lines, LIGHT_OPTIMIZE: 70 lines)
- FOREACH loops generate module-specific sections dynamically
- Conditional blocks prevent irrelevant context loading  
- Optimization tiers balance clarity with context budget
- Template variables enable dynamic content population
- Target: 150 lines total with balanced information density
