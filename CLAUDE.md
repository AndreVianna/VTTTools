# CLAUDE.md

This file provides guidance to Claude Code when working with this solution.

## ⚠️ [PRIORITY:HIGH] General Behavior ⚠️

- **CRITICAL** Please avoid sycophancy!
- **CRITICAL** NEVER SAY "You are right!", "You're absolutely right!", "You're absolutely correct!", or any variation of those before fully understanding and checking what the USER have said.
- **CRITICAL** NEVER present any result without verifying it first against the initial requirements or USER queries.

## ⚠️ [PRIORITY:CRITICAL] Code Comments Policy ⚠️

- **MANDATORY** Comments are a LAST RESORT. Use ONLY when code cannot be made self-explanatory.
- **MANDATORY** Before adding a comment, try these alternatives IN ORDER:
  1. Use descriptive variable/property/method names
  2. Extract complex logic into well-named helper methods
  3. Simplify the code structure
  4. ONLY THEN consider a comment if absolutely necessary
- **MANDATORY** DELETE all useless, redundant, and verbose comments whenever found:
  - Obvious comments (e.g., `// Set user name` above `user.Name = name;`)
  - Commented-out code (delete it - use git history if needed)
  - Outdated comments that don't match current code
  - AI-generated placeholder comments (e.g., `// TODO: implement this`)
  - Comments that just repeat what the code does
- **CRITICAL** This applies to ALL code - even from other sessions/agents/developers
- **GOOD comments** (rare cases):
  - Complex algorithms with citations
  - Non-obvious business rules
  - Critical security/performance gotchas
  - Intentional deviations from standard patterns (with WHY)

**Examples:**
```typescript
// ❌ BAD - Obvious
// Set the user name
user.name = name;

// ❌ BAD - Redundant
// Loop through all users
users.forEach(user => ...);

// ✅ GOOD - Self-documenting, no comment needed
const isEligibleForDiscount = user.isPremium && order.total > 100;

// ✅ GOOD - Rare case where comment adds value
// SECURITY: Use constant-time comparison to prevent timing attacks
return crypto.timingSafeEqual(hash1, hash2);
```

## ⚠️ [PRIORITY:CRITICAL] File Creation Policy ⚠️

### Persistent Files
- **FORBIDDEN**: Creating persistent files (documents, reports, logs, etc.) WITHOUT explicit user request
- **MANDATORY**: Ask user permission BEFORE creating any persistent file
- **EXCEPTION**: Code files, configuration files, or project artifacts that are part of the requested work

### Temporary Files
- **ALLOWED**: Creating temporary files (.txt, .md, .json) to assist with analysis or complex work
- **MANDATORY**: Delete ALL temporary files when task is complete
- **LOCATION**: Use system temp directory or working directory for temporary files
- **CLEANUP**: Always verify temp files are deleted before task completion

### Reports and Analysis
- **MANDATORY**: When user requests "report" or "analysis", present findings in CONSOLE output
- **FORBIDDEN**: Creating document files for reports unless explicitly requested
- **FORMAT**: Use clear, structured console output with markdown formatting

**Examples:**
```
❌ BAD - User asks "analyze the code"
→ Creates "CODE_ANALYSIS_REPORT.md" without permission

✅ GOOD - User asks "analyze the code"
→ Presents analysis in console output
→ If temp files used for analysis, deletes them after

❌ BAD - User asks "check for duplicates"
→ Creates "DUPLICATES_REPORT.md"

✅ GOOD - User asks "check for duplicates"
→ Uses temp file for processing (if needed)
→ Presents findings in console
→ Deletes temp file

✅ GOOD - User says "create a report document for this analysis"
→ Creates the requested document file
```

## ⚠️ [PRIORITY:CRITICAL] Command Execution Standards ⚠️

### Documented Commands - ABSOLUTE REQUIREMENT
- **MANDATORY**: ALWAYS use commands EXACTLY as documented in `Documents/Guides/COMMON_COMMANDS.md`
- **FORBIDDEN**: Running commands you see in npm/script output directly (e.g., `node run-feature.cjs`)
- **FORBIDDEN**: Running raw `npx cucumber-js` or similar tools directly
- **FORBIDDEN**: "Optimizing" or "simplifying" documented commands
- **FORBIDDEN**: Using alternative commands even if they "should work"
- **CRITICAL**: If a command is marked "PREFERRED", it is the ONLY acceptable command
- **MANDATORY**: Before running ANY test/build/deploy command, verify against COMMON_COMMANDS.md
- **FORBIDDEN**: Assuming you remember the correct command from earlier in the session

### Examples - What You Must Do:
```bash
✅ CORRECT: npm run test:bdd:feature HandleRegistration    # From COMMON_COMMANDS.md line 285
✅ CORRECT: npm run test:bdd:smoke                         # From COMMON_COMMANDS.md line 280
✅ CORRECT: dotnet test VttTools.slnx                      # From COMMON_COMMANDS.md line 215

❌ WRONG: node run-feature.cjs HandleRegistration          # Even if you see it in npm output
❌ WRONG: npx cucumber-js "../../Documents/..."            # Even if it "should work"
❌ WRONG: cross-env NODE_OPTIONS='...' cucumber-js         # Even if it's the underlying command
```

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

### Solution File
**IMPORTANT**: Always use `Source/VttTools.slnx` (not `VttTools.sln`) for all build operations.
- **Build Command**: `dotnet build Source/VttTools.slnx`
- **Restore Command**: `dotnet restore Source/VttTools.slnx`
- **Test Command**: `dotnet test Source/VttTools.slnx`

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

### Testing
**Frameworks**: xUnit (backend), Vitest (frontend unit), Cucumber+Playwright (BDD e2e)
**Commands**: See `Documents/Guides/COMMON_COMMANDS.md` § Testing Commands
**Quick Reference**:
- Backend: `dotnet test --filter "FullyQualifiedName~TestClass"`
- Frontend Unit: `npm test -- TestFile.test.ts --run`
- BDD E2E: `npm run test:bdd` or `npm run test:bdd:critical`
**Philosophy**: E2E tests may FAIL (exposing bugs). Unit tests should PASS (verifying implementation).

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
- **VTTTOOLS_STACK.md** - Complete technology stack reference (C#/.NET, React/TypeScript, testing frameworks)
- **CODE_EXAMPLES.md** - All code pattern examples (backend, frontend, testing, PowerShell)
- **COMMON_COMMANDS.md** - Build, test, and deployment commands (dotnet, npm, EF Core, PowerShell)
- ARCHITECTURE_PATTERN.md - DDD Contracts + Service Implementation pattern
- CODING_STANDARDS.md - VttTools coding standards (extracted from codebase)
- CSHARP_STYLE_GUIDE.md - VttTools C# style guide
- TYPESCRIPT_STYLE_GUIDE.md - VttTools TypeScript/React style guide
- TESTING_GUIDE.md - VttTools testing approach
- IMPLEMENTATION_GUIDE.md - VttTools Phase 2 implementation workflow
- CODE_QUALITY_GUIDE.md - VttTools quality standards
- No need for excessive comments, always use the clean code rule for comments.
- Whenever you find any unecessary on redundant comment in the code, delete it immediatelly independent if it is part of the current change or not.