---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, mcp__thinking__sequentialthinking, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Generic project initialization with AI-optimized CLAUDE.md template management
argument-hint: Optional mode (quick|full|template-only) - defaults to full
---

# Prime Command - Generic Project Initialization

Systematically prepare development environment with AI-optimized CLAUDE.md template generation, project detection, and context optimization for any project type.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Process

### Environment Setup & Validation

- **Read settings.json**: Use `Read` tool to load `.claude/settings.json` file
- **Validate OS property**: Extract and validate "os" property:
  - Abort if missing: "FATAL: settings.json missing required 'os' property. Add: \"os\": \"windows|linux|mac\""
  - Abort if invalid value: "FATAL: Invalid 'os' value '{value}'. Must be: windows, linux, mac"
- **Determine setup script path**: Based on OS property:
  - "windows": `.claude/scripts/setup.ps1`
  - "linux": `.claude/scripts/setup.sh`  
  - "mac": `.claude/scripts/setup.sh`
- **Execute setup script**: Use `Bash` tool with appropriate shell:
  - Windows: `pwsh -ExecutionPolicy Bypass -File ".claude/scripts/setup.ps1"`
  - Linux/Mac: `bash ".claude/scripts/setup.sh"`
- **Validate setup success**: Monitor exit code and abort Prime if setup fails (exit code ≠ 0)
- **Log setup completion**: Record successful environment setup before proceeding

### Simple Project Analysis

- **STEP 1**: Use `Bash` command `ls -la` to examine project root structure
- **STEP 2**: Use `Bash` command `wc -c README.md` to check README.md size and verify it exists
- **STEP 3**: Use `Bash` command `find . -maxdepth 1 -type d -name "Documents"` to check for Documents folder
- **STEP 4**: Use `Bash` command `find . -name "package.json" -o -name "pom.xml" -o -name "*.csproj" -o -name "Cargo.toml"` to detect project technologies
- **STEP 5**: Use `Bash` command `find . -name "docker-compose.yml" -o -name "Dockerfile"` to check container usage
- **STEP 6**: Set solution variables based on findings:
  - SOLUTION_NAME = Project folder name
  - SOLUTION_TYPE = Detected from technologies or "Utility Repository" as default
  - ARCHITECTURE_PATTERN = Determined from structure analysis
  - USES_CONTAINERS = "Yes" if Docker files found, "No" otherwise
  - TARGET_ENVIRONMENT = "Development Environment" as default
- **STEP 7**: Set operational commands based on detected technologies or use utility defaults:
  - For utility projects: BUILD = "N/A", TEST = "Manual testing", RUN = "pwsh script.ps1", LINT = "N/A"
  - For detected frameworks: Extract actual commands from package.json/pom.xml/etc.
- **STEP 8**: Set search commands based on detected OS:
  - Windows: Use PowerShell commands (Get-ChildItem, Select-String)
  - Linux/Mac: Use Unix commands (find, grep)
- **MANDATORY REPORTING**: Report to user the project analysis results and variable values that will be used

### Dynamic CLAUDE.md Generation

#### Step 2A: Template Processing Setup
- **Check for existing CLAUDE.md**: Use `Read` tool to examine current CLAUDE.md if it exists
- **Load template**: Use `Read` to load the new `.claude/templates/CLAUDE_TEMPLATE.md`
- **Prepare variable substitution**: Create comprehensive variable mapping from Phase 1 discoveries

#### Step 2B: Template Variable Substitution
- **Load template**: Use `Read` to load `.claude/templates/CLAUDE_TEMPLATE.md`
- **Apply solution variables**: Substitute all solution variables determined in Phase 1
- **Apply operational commands**: Substitute all command variables determined in Phase 1  
- **Apply conditional variables**: Set MCP_CONFIGURED = "true", AGENTS_AVAILABLE = "true", etc.
- **Apply search commands**: Use OS-specific commands determined in Phase 1
- **IMPORTANT**: The template now uses hardcoded documentation structure that assumes:
  - Main Project Document: ./README.md (always present)
  - Documentation Folder: ./Documents (may or may not exist)
  - Sub-folders under ./Documents/ (may or may not exist)
- **NOTE**: The template's hardcoded documentation paths will remain as-is since they represent the expected/standard structure

#### Step 2C: Apply Template Substitution
- **Write CLAUDE.md**: Use `Write` to create CLAUDE.md from template with substituted variables
- **Process conditional blocks**: Handle [IF:PROJECT_USE_CONTAINERS], [IF:AGENTS_AVAILABLE], [IF:MCP_CONFIGURED] based on detection
- **NOTE**: Documentation structure in template is now hardcoded and will appear as:
  - Main Project Document: ./README.md
  - Documentation Folder: ./Documents  
  - Specifications: ./Documents/Specification
  - Guides: ./Documents/Guides
  - Templates: ./Documents/Templates
  - Troubleshooting: ./Documents/Troubleshooting
- **These paths represent the recommended/standard documentation structure for projects**

### Mandatory Template Cleanup

- **STEP 1**: Use `Read` to load the generated CLAUDE.md file
- **STEP 2**: Use `Edit` to remove ALL lines containing exactly: `<!-- TIER: NEVER_COMPRESS Lines: 1-30 -->`
- **STEP 3**: Use `Edit` to remove ALL lines containing exactly: `<!-- END:CRITICAL Total: 11 lines -->`
- **STEP 4**: Use `Edit` to remove ALL lines containing exactly: `<!-- TIER: LIGHT_OPTIMIZE Lines: 12-80 -->`
- **STEP 5**: Use `Edit` to remove ALL lines containing exactly: `<!-- END:CORE Total: 44 lines -->`
- **STEP 6**: Use `Edit` to remove ALL lines containing exactly: `<!-- TIER: MODERATE_OPTIMIZE Lines: 45-120 -->`
- **STEP 7**: Use `Edit` to remove ALL lines containing exactly: `<!-- END:OPERATIONAL Total: 84 lines -->`
- **STEP 8**: Use `Edit` to remove ALL lines containing exactly: `<!-- TIER: HEAVY_OPTIMIZE Lines: 85-150 -->`
- **STEP 9**: Use `Edit` to remove ALL lines containing exactly: `<!-- END:REFERENCE Total: 99 lines -->`
- **STEP 10**: Use `Edit` to remove the line containing: `---`
- **STEP 11**: Use `Edit` to remove ALL lines starting with: `**CONTEXT_ENGINEERING_NOTES**:`
- **STEP 12**: Use `Read` to verify cleanup was successful - NO tier comments should remain
- **MANDATORY FINAL VALIDATION**: Use `Grep` to search generated CLAUDE.md for ".claude/" in documentation section:
  - If found: ERROR - report which variables contain ".claude/" and set them to "N/A"
  - Use `Edit` to fix any remaining ".claude/" references in documentation
- **FINAL VERIFICATION**: Use `Read` to show user the final clean CLAUDE.md
- **Report completion**: Confirm generation successful with clean, professional output

### Context Budget Validation

- **Run budget validator**: Use `Bash` to execute `context_budget_validator` script in `.claude/scripts/utilities` folder
- **Count effective lines**: Use `Read` to count lines in generated CLAUDE.md after conditional processing and variable substitution
- **Validate tier markers**: Verify NEVER_COMPRESS, LIGHT_OPTIMIZE, MODERATE_OPTIMIZE, HEAVY_OPTIMIZE tier markers are present
- **Check tier compliance**: Ensure NEVER_COMPRESS sections (⚠️ marked) remain intact and unmodified
- **Calculate conditional impact**: Count lines added/removed by conditional block processing
- **Assess command variant expansion**: Measure line impact of build and test command variants
- **Apply tier-based optimization**: If >150 lines total:
  - Level 1: Optimize HEAVY_OPTIMIZE sections only (keep NEVER_COMPRESS, LIGHT_OPTIMIZE, MODERATE_OPTIMIZE intact)
  - Level 2: Optimize HEAVY_OPTIMIZE + MODERATE_OPTIMIZE sections (keep NEVER_COMPRESS + LIGHT_OPTIMIZE intact)
  - Level 3: Optimize all except NEVER_COMPRESS sections (emergency budget compliance)
- **Run context optimizer**: Use `Bash` to execute `context_optimizer` script in `.claude/scripts/utilities` folder with specified optimization level
- **Validate critical preservation**: Ensure ⚠️ marked sections, build/test command variants, and conditional logic remain fully functional
- **Verify command executability**: Test that all generated command variants are syntactically correct and executable
- **Report optimization results**: Present detailed breakdown:
  - Total lines: pre/post optimization
  - Lines by tier: NEVER_COMPRESS, LIGHT_OPTIMIZE, MODERATE_OPTIMIZE, HEAVY_OPTIMIZE
  - Conditional blocks processed: count and impact
  - Command variants generated: count and validation status
  - Optimization level applied: none/level1/level2/level3
  - Budget compliance: pass/fail with target ~150 lines

### Session Initialization

- **Load project state**: Use `Bash` to check git status with `git status --porcelain` and `git branch --show-current`
- **Check recent activity**: Use `Bash` to run `git log --oneline -5` for recent commits
- **Store session context**: Use `mcp__memory__add_observations` to record session initialization data
- **Present summary**: Display project characteristics, CLAUDE.md status, git state, and recommended next steps

## Quick Reference
- CLAUDE_TEMPLATE.md: Template for CLAUDE.md generation
- settings.json: Project settings and OS configuration

## Error Handling

- **Missing settings.json**: "FATAL: .claude/settings.json not found"
- **Missing os property**: "FATAL: settings.json missing required 'os' property. Add: \"os\": \"windows|linux|mac\""
- **Invalid os value**: "FATAL: Invalid 'os' value '{value}'. Valid values: windows, linux, mac"
- **Missing setup script**: "FATAL: Setup script not found: .claude/scripts/setup.{ps1|sh}"
- **Setup execution failure**: "FATAL: Environment setup failed (exit code: {code}). Check setup script output above."
- **Missing scripts**: Provide fallback detection if platform-specific scripts unavailable
- **Template not found**: Use built-in minimal template if CLAUDE_TEMPLATE.md missing
- **Template syntax errors**: "ERROR: Invalid template syntax - unclosed [IF:condition] blocks found. Fix template before proceeding."
- **Conditional mismatch**: "WARNING: Template conditions don't match detected project characteristics. Review conditional logic."
- **Variable substitution failure**: "ERROR: Failed to populate template variables. Check project detection output."
- **Command validation failure**: "ERROR: Generated commands are not executable. Review build/test command detection."
- **Budget validation failure**: "WARNING: Generated CLAUDE.md exceeds 150 lines ({actual_lines}). Applied optimization level {level}."
- **Documentation path validation**: "ERROR: Generated CLAUDE.md contains .claude/ paths in documentation section. This indicates detection logic failed."
- **AI infrastructure contamination**: "CRITICAL: If any documentation variable contains '.claude/', immediately reset to 'N/A' and report the error."
- **Script execution errors**: Report specific error messages and suggest manual alternatives
- **Git repository detection**: Handle non-git directories gracefully

## Expected Outcomes

- **Generated CLAUDE.md**: Context-optimized project documentation targeting ~150 lines with tier-based optimization
- **Project profile in memory**: Stored understanding of project characteristics for session continuity  
- **Session readiness**: Prepared development environment with clear status and next steps
- **Error-free execution**: Graceful handling of missing dependencies or script failures
