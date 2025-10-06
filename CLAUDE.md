# CLAUDE.md

This file provides guidance to Claude Code when working with this solution.

## ⚠️ [PRIORITY:HIGH] General Behavior ⚠️

- **CRITICAL** Please avoid sycophancy!
- **CRITICAL** NEVER SAY "You are right!", "You're absolutely right!", "You're absolutely correct!", or any variation of those before fully understanding and checking what the USER have said.
- **CRITICAL** NEVER present any result without verifying it first against the initial requirements or USER queries.

## ⚠️ [CRITICAL] Command Execution Standards ⚠️

### Multi-Phase Command Execution
- **MANDATORY**: ALL phases of a command MUST be executed in sequence
- **FORBIDDEN**: Skipping phases for "efficiency" or "time-saving"
- **REQUIRED**: Complete each phase before proceeding to the next
- **VALIDATION**: Each phase completion must be verified through memory observations

### Phase Completion Tracking
- **TRACK**: Use memory observations to record phase completion status
- **VERIFY**: Check phase completion before proceeding
- **REPORT**: Provide progress updates during multi-step operations
- **TRANSPARENCY**: If a phase will take significant time, inform user BEFORE skipping

### Error Handling
- **IF BLOCKED**: Report specific reason for blockage with phase and step number
- **IF INCOMPLETE**: Mark status as "partial_complete" with specifics
- **IF TIME CONSTRAINT**: Ask user permission before skipping: "Phase 3 requires generating {N} items. Continue? (Y/N)"

## [PRIORITY:HIGH] Solution Context

### Solution Identity
**COMPRESSED**: **SOLUTION_NAME**:Claude Code Tools, **SOLUTION_TYPE**:Utility Repository, **ARCHITECTURE_PATTERN**:Cross-platform configuration management, **USES_CONTAINERS**:No, **TARGET_ENVIRONMENT**:Multi-platform (Windows/Linux/macOS)

### Solution Constraints & Standards
- **CONSTRAINTS**:
  - PowerShell execution policy must allow script execution on Windows
  - Cross-platform compatibility required for all shared components
- **REQUIREMENTS**:
  - Claude Code CLI (latest version)
  - PowerShell X.Y+ (Windows) or Bash X.Y+ (Linux/macOS)
  - Git version control
- **MANDATORY_STANDARDS**:
  - Follow cognitive infrastructure philosophy
  - Maintain platform-specific implementations where needed
  - Preserve AI-assisted development workflows
- **PREFERRED_PATTERNS**:
  - Script-based automation over compiled solutions
  - Template-driven configuration generation
  - Modular platform-specific implementations
- **INFORMATION_LOOKUP**:
  1. **Dynamic Memory** (MCP) → 2. **Docs & Guides** → 3. **External** (Web Search)

## Architecture

### Key Files
- DSL SYNTAX REFERENCE: @.claude/guides/COMMAND_SYNTAX.md

### Search Commands
- **Find Folders**:`find . -type d -name "*pattern*"`;
- **Find Files**:`find . -name "*pattern*" -type f`;
- **Search Content**:`grep -r "pattern" .` or `rg "pattern"`

### Scripts
**Language**:PowerShell
Setup:`pwsh -ExecutionPolicy Bypass -File .claude/scripts/setup.ps1`
Log Viewer: `pwsh -ExecutionPolicy Bypass -File .claude/scripts/view_logs.ps1`

### MCP Integration
**MCP_SERVERS**: memory, thinking
**DYNAMIC_MEMORY_STRATEGY**: Use memory specific entries to store task progress and share information between tasks
**THINKING_MODE**: Sequential thinking for complex problem solving

### Available Agents
**Location**:`.claude/agents/`
- task-organizer:Complex task breakdown, dependencies, coordination;
- solution-engineer:Architecture decisions, requirements analysis;
- code-reviewer:Security (OWASP), quality, best practices;
- shell-developer:Command line scripts (.cmd, PowerShell);
- ux-designer:UI/UX definitions, styling, user interface layout;

### AI Folder Structure (Claude Code Specific - Generic, Reusable)
**Commands**:`.claude/commands/` - Slash command definitions
**Generic Guides**:`.claude/guides/` - Generic guides (BDD, Command Syntax, Workflow, etc.)
**Templates**:`.claude/templates/` - Document templates
**Syntax Reference**:`@.claude/guides/COMMAND_SYNTAX.md`

**Generic Guides (.claude/guides/)**:
- COMMAND_SYNTAX.md - DSL syntax for command definitions
- BDD_CUCUMBER_GUIDE.md - Cucumber/Gherkin best practices
- WORKFLOW_GUIDE.md - Phase 1-3 workflow
- COMMANDS_DEFINITION_GUIDE.md - How to create commands
- AGENT_USAGE_GUIDE.md, SUBAGENTS_DEFINITION_GUIDE.md, HOOKS_DEFINITON_GUIDE.md

### Project Folder Structure (Project-Specific Content)
**Documentation**:`Documents/` - Specifications, domain models, features, use cases
**Specifications**:`Documents/Areas/` - Area/Feature/UseCase hierarchy
**Project Guides**:`Documents/Guides/` - Project-specific guides
**Project Templates**:`Documents/Templates/` - Project-specific templates

**Project-Specific Guides (Documents/Guides/)**:
- ARCHITECTURE_PATTERN.md - DDD Contracts + Service Implementation pattern
- CODING_STANDARDS.md - VttTools coding standards (extracted from codebase)
- CSHARP_STYLE_GUIDE.md - VttTools C# style guide
- TYPESCRIPT_STYLE_GUIDE.md - VttTools TypeScript/React style guide
- TESTING_GUIDE.md - VttTools testing approach
- IMPLEMENTATION_GUIDE.md - VttTools Phase 2 implementation workflow
- CODE_QUALITY_GUIDE.md - VttTools quality standards
