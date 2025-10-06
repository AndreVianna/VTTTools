# Claude Code Slash Command Creation Guide

This comprehensive guide covers everything you need to know about creating effective custom slash commands for Claude Code, based on best practices from official documentation and community repositories.

## Table of Contents

1. [Introduction](#introduction)
2. [Quick Start](#quick-start)
3. [File Structure & Organization](#file-structure--organization)
4. [Frontmatter Reference](#frontmatter-reference)
5. [Content Structure Best Practices](#content-structure-best-practices)
6. [Tool Integration Guide](#tool-integration-guide)
7. [Advanced Features](#advanced-features)
8. [Real-World Examples](#real-world-examples)
9. [Community Patterns](#community-patterns)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

## Introduction

Custom slash commands transform Claude Code into a powerful, personalized coding assistant that adapts to your specific workflows and team standards. They are reusable, shareable workflows stored as markdown files that Claude executes automatically for consistent results.

### Benefits

- **Consistency**: Standardized workflows across team members
- **Efficiency**: Complex multi-step operations with a single command
- **Context Management**: Systematic preparation and state management
- **Team Collaboration**: Shareable commands via version control
- **Customization**: Project-specific workflows and conventions

### Use Cases

- Project context preparation and session initialization
- Code review and quality assurance workflows
- Testing and deployment automation
- Documentation generation and maintenance
- Development environment setup and validation

## Quick Start

### 1. Create Your First Command

```bash
mkdir -p .claude/commands
touch .claude/commands/hello.md
```

### 2. Basic Command Structure

```markdown
---
description: A simple greeting command
---

# Hello Command

This command provides a friendly greeting and project overview.

## Instructions
- Greet the user warmly
- Provide a brief overview of the current project
- List the most recently modified files
- Ask how you can help today
```

### 3. Using Your Command

In Claude Code, type `/hello` and press Enter. Claude will execute the instructions automatically.

## AI Command Design Principles

**CRITICAL INSIGHT**: Commands are instructions for AI systems, not human documentation. Design for intelligence amplification, not simplicity.

### Tool Philosophy Revolution

- **MAXIMIZE, Don't Minimize**: Give AI systems access to ALL relevant tools for maximum capability
- **Intelligence Amplification**: More tools = better outcomes, not complexity
- **Fail-Safe Redundancy**: Multiple tools provide alternatives and error recovery paths

```yaml
# ❌ OLD THINKING (Minimalist)
allowed-tools: [Read, Write]

# ✅ NEW THINKING (Maximalist for AI Intelligence)
allowed-tools: [Task, mcp__thinking__sequentialthinking, mcp__memory__create_entities, mcp__memory__add_observations, mcp__memory__read_graph, mcp__memory__search_nodes, Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, TodoWrite]
```

### Command Intelligence Levels

| Level | Capabilities | When to Use | Example Tools |
|-------|--------------|-------------|---------------|
| **Basic** | Single agent, minimal tools | Simple, one-step tasks | Read, Write, Edit |
| **Enhanced** | Multi-tool with memory | Complex analysis tasks | + mcp__memory, WebSearch, TodoWrite |
| **Powerhouse** | Multi-agent orchestration | Production-critical, learning systems | + Task, mcp__thinking, parallel agents |

### AI-First Design Principles

1. **Directive Language**: Use MUST/SHOULD/NEVER keywords for clear AI instruction
2. **Algorithmic Structure**: IF-THEN-ELSE logic beats narrative prose
3. **Validation Gates**: Explicit checkpoints and success/failure criteria
4. **Memory Integration**: Store patterns and learn from every execution
5. **Multi-Agent Coordination**: Parallel specialized experts > single generalist
6. **Web Enhancement**: Integrate current knowledge beyond training data

## Prompt Engineering for AI Systems

**KEY INSIGHT**: AI systems need algorithmic instructions with directive language, not conversational requests.

### Directive Language Requirements

**CRITICAL KEYWORDS for AI Instruction:**

| Keyword | Purpose | Usage |
|---------|---------|-------|
| **MUST** | Critical requirements that cannot be skipped | `MUST use mcp__thinking__sequentialthinking for complex analysis` |
| **SHOULD** | Strongly recommended actions with flexibility | `SHOULD use WebSearch for current standards` |
| **NEVER** | Explicit prohibitions and guard rails | `NEVER modify files without user confirmation` |
| **ALWAYS** | Consistent behaviors across all executions | `ALWAYS store successful patterns in memory` |

### Structure Patterns That Work

```markdown
# ✅ ALGORITHMIC (GOOD for AI)
**EXECUTION ALGORITHM:**
1. VALIDATE input → IF invalid THEN EXIT("error message")
2. PROCESS data → IF fails THEN retry with fallback
3. CONFIRM with user → IF declined THEN EXIT gracefully

**SUCCESS CRITERIA**: Valid output generated with user confirmation
**FAILURE CONDITIONS**: Invalid input OR user cancellation OR processing error
```

```markdown
# ❌ NARRATIVE (BAD for AI) 
"Please consider validating the input if you think it might be helpful, and then process the data in whatever way seems most appropriate."
```

### Validation Gates and Checkpoints

**Essential Pattern for Complex Commands:**

```markdown
**MANDATORY VALIDATION GATES:**
- Gate 1: VALIDATE file exists → ELSE EXIT("File not found: [path]")
- Gate 2: CONFIRM user intent → ELSE EXIT("Operation cancelled")  
- Gate 3: VERIFY output quality → ELSE RETRY with adjustments
```

### Agent Prompt Structure

```markdown
**OPTIMAL AGENT PROMPT FORMAT:**
```markdown
EXECUTE [task] for: [$ARGUMENTS]

**MANDATORY TOOLS USAGE:**
- MUST use [critical tools]
- SHOULD use [recommended tools]

**EXECUTION ALGORITHM:**
1. [Step with validation]
2. [Step with success criteria]
3. [Step with fallback]

**SUCCESS CRITERIA**: [Specific measurable outcome]
**FAILURE CONDITIONS**: [Clear error scenarios]
```
```

### Template Management

```markdown
# ❌ BAD: Embed all templates (creates 150+ line prompts)
**ALL TEMPLATES:**
[API template - 30 lines]
[UI template - 30 lines]  
[Batch template - 30 lines]
...

# ✅ GOOD: Template selection (concise, targeted)
**TEMPLATE SELECTOR:**
IF type="API" → Use API_TEMPLATE (see reference section)
ELIF type="UI" → Use UI_TEMPLATE
ELSE → REQUEST user specification
```

## Multi-Agent Orchestration Patterns

**POWER INSIGHT**: Parallel specialized agents provide superior analysis and quality compared to single agent approaches.

### When to Use Multi-Agent Orchestration

| Scenario | Agent Count | Strategy | Benefits |
|----------|-------------|----------|----------|
| **Simple Tasks** | 1 agent | Direct execution | Speed, minimal overhead |
| **Complex Analysis** | 2-3 agents | Parallel expertise | Quality, diverse perspectives |
| **Production Critical** | 3+ agents | Full orchestration | Maximum intelligence, continuous learning |

### Orchestration Patterns

#### **Pattern 1: Parallel Expertise**
```markdown
**PARALLEL EXECUTION STRATEGY:**
Launch multiple agents simultaneously using Task tool:

**Agent 1 - solution-engineer (Primary Analysis):**
- Main analysis and generation
- MUST use mcp__thinking__sequentialthinking
- MUST store patterns in mcp__memory

**Agent 2 - test-automation-developer (Quality Validation):**
- Quality analysis and standards validation
- WebSearch for current best practices
- Cross-reference with industry standards

**Agent 3 - [domain-specialist] (Conditional):**
- backend-developer for API tasks
- frontend-developer for UI tasks
- devops-specialist for infrastructure tasks
```

#### **Pattern 2: Sequential Hand-off**
```markdown
**SEQUENTIAL EXPERTISE CHAIN:**
1. Launch solution-engineer for initial analysis
2. Pass results to code-reviewer for validation
3. Final review by domain specialist if needed
4. Consolidate using mcp__thinking__sequentialthinking
```

#### **Pattern 3: Validation Loop**
```markdown
**ITERATIVE IMPROVEMENT:**
1. Generate initial output (solution-engineer)
2. Validate quality (code-reviewer)
3. IF gaps found → refine (solution-engineer) 
4. REPEAT until quality threshold met
5. LIMIT: Maximum 3 iterations to prevent loops
```

### Consolidation Strategy

```markdown
**INTELLIGENCE INTEGRATION:**
- USE mcp__thinking__sequentialthinking to consolidate all agent outputs
- APPLY TodoWrite to track complex consolidation process
- MERGE research findings from multiple agents
- STORE successful collaboration patterns in mcp__memory
- PRESENT unified, enhanced result to user
```

### Coordination Commands

```markdown
**Task Tool Usage:**
- Launch agents in parallel when possible
- Use specific agent types: solution-engineer, backend-developer, etc.
- Provide clear, directive prompts to each agent
- Collect and consolidate outputs systematically

**Agent Communication:**
- Each agent MUST use mcp__memory to store findings
- Consolidation phase MUST read all agent memory contributions
- Final output SHOULD integrate all perspectives intelligently
```

## Memory and Learning Integration

**GAME CHANGER**: Commands that learn and improve through persistent memory storage provide exponentially better results over time.

### Memory Strategy for Production Commands

**MANDATORY for Complex Commands:**

```yaml
# REQUIRED memory tools in frontmatter
allowed-tools: [mcp__memory__create_entities, mcp__memory__add_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes]
```

```markdown
**MEMORY USAGE PATTERN:**
1. **Initialize**: Load existing knowledge before starting
2. **Learn**: Store discoveries and patterns during execution  
3. **Apply**: Use stored patterns to enhance current execution
4. **Update**: Store successful outcomes for future use
```

### Learning Loop Implementation

#### **Before Execution (Knowledge Loading):**
```markdown
**KNOWLEDGE INITIALIZATION:**
- LOAD existing knowledge: mcp__memory__read_graph
- SEARCH for relevant patterns: mcp__memory__search_nodes "[task type] patterns"
- OPEN specific knowledge: mcp__memory__open_nodes ["user preferences", "successful approaches"]
```

#### **During Execution (Pattern Storage):**
```markdown
**CONTINUOUS LEARNING:**
- CREATE entities for new discoveries: mcp__memory__create_entities
- ADD observations for patterns: mcp__memory__add_observations "successful approach X for scenario Y" 
- STORE user corrections: mcp__memory__add_observations "user prefers Z over Y"
```

#### **After Execution (Knowledge Consolidation):**
```markdown
**CONSOLIDATION:**
- STORE successful execution patterns
- RECORD user feedback and preferences  
- UPDATE approach effectiveness metrics
- BUILD knowledge base for future executions
```

### Memory Entity Patterns

| Entity Type | Purpose | Storage Pattern |
|-------------|---------|----------------|
| **Command Patterns** | Successful execution approaches | `mcp__memory__create_entities [{"name": "BDD-API-Pattern", "type": "command_pattern"}]` |
| **User Preferences** | Personal choices and feedback | `mcp__memory__add_observations "user prefers detailed scenarios"` |
| **Quality Metrics** | Success rates and effectiveness | `mcp__memory__add_observations "approach X: 90% user acceptance"` |
| **Error Resolutions** | Successful error handling | `mcp__memory__add_observations "file permission issue → solution Y"` |

### Continuous Improvement Cycle

```markdown
**ADAPTIVE COMMAND BEHAVIOR:**

```markdown
**Phase 1**: Execute with memory-enhanced approach
- Load → Apply → Store discoveries

**Phase 2**: Learn from user feedback  
- Capture preferences → Store corrections → Update patterns

**Phase 3**: Improve for next execution
- Enhanced templates → Better type detection → Optimized workflows
```

**RESULT**: Commands become MORE intelligent and effective with each use
```

## File Structure & Organization

### Location Options

- **Project Commands**: `.claude/commands/` (project specific, shared via git)
- **Personal Commands**: `~/.claude/commands/` (user-specific, not shared)

### Naming Conventions

- Use kebab-case: `code-review.md`, `setup-environment.md`
- Be descriptive: `prime-context.md` not `init.md`
- Use namespacing for related commands: `test-unit.md`, `test-integration.md`

### Directory Organization

#### Namespace Structure (Recommended for Multiple Commands)

```markdown
.claude/
├── commands/
│   ├── setup/           # Context and environment preparation
│   │   └── prime.md     # /setup:prime
│   ├── meta/            # Meta-commands for command generation and tooling
│   │   ├── create-command.md        # /meta:create-command
│   │   └── create-local-command.md  # /meta:create-local-command
│   ├── dev/             # Development workflow commands (reserved for future)
│   ├── doctor/          # Diagnostic and health check commands
│   │   ├── build.md     # /doctor:build  
│   │   ├── plugin.md    # /doctor:plugin
│   │   └── test.md      # /doctor:test
│   ├── analyze/         # Analysis and assessment commands
│   │   └── test.md      # /analyze:test
└── slash-command-guide.md
```

#### Simple Flat Structure (For Few Commands)

```markdown
.claude/
├── commands/
│   ├── code-review.md
│   ├── prime-context.md  
│   └── debug-session.md
└── slash-command-guide.md
```

## Frontmatter Reference

Frontmatter is optional YAML metadata at the top of your command file:

```markdown
---
allowed-tools: Bash, Read, Write, mcp__memory__read_graph
description: Brief description of what this command does
argument-hint: Optional parameters this command accepts
model: claude-sonnet-4 (optional, specify AI model)
---
```

### allowed-tools

Explicitly list tools Claude can use:

```yaml
allowed-tools: Bash, Read, Write, Edit, Grep, Glob, LS
allowed-tools: Bash(git status:*), Read(*.md)  # With restrictions
allowed-tools: mcp__memory__*, mcp__thinking__* # MCP tools
```

### Common Tool Categories

- **Core**: `Bash`, `Read`, `Write`, `Edit`, `Grep`, `Glob`, `LS`
- **Advanced**: `MultiEdit`, `TodoRead`, `TodoWrite`, `WebFetch`, `WebSearch`
- **MCP Memory**: `mcp__memory__read_graph`, `mcp__memory__search_nodes`
- **MCP Thinking**: `mcp__thinking__sequentialthinking`
- **MCP Browser**: `mcp__playwright__browser_*`

### description

Clear, concise explanation (1-2 sentences):

```yaml
description: Prepare comprehensive session context for development work
description: Review code changes and generate detailed feedback report
description: Set up development environment and verify dependencies
```

### argument-hint

Describe expected parameters:

```yaml
argument-hint: file-path or directory to analyze
argument-hint: Optional depth level (quick|full) - defaults to full
argument-hint: branch-name to compare against (defaults to main)
```

## Content Structure Best Practices

### Standard Format

```markdown
---
frontmatter: here
---

# Command Title

Brief description of what this command accomplishes and when to use it.

## Instructions

Clear, actionable steps that Claude should follow:

### Phase 1: Discovery
- Step 1: Specific action to take
- Step 2: Another specific action
- Step 3: Validation or check

### Phase 2: Analysis
- Use specific tools and commands
- Handle edge cases and errors
- Provide clear success criteria

### Phase 3: Summary
- Consolidate findings
- Provide recommendations
- Set up for next steps
```

### H1 Title Guidelines

- Use descriptive, action-oriented titles
- Examples: "Prime Context for Development", "Code Review Workflow", "Environment Setup"

### Description Paragraph

- Explain purpose and benefits
- Mention when/why to use this command
- Keep it concise (2-3 sentences max)

### Instructions Section

- Use H2 "Instructions" header
- Break complex workflows into phases (H3 subheaders)
- Use bullet points for specific actions
- Include validation and error handling steps

## Tool Integration Guide

### Core Tools

#### Bash

Execute shell commands:

```markdown
- Run `git status --porcelain` to check for changes
- Execute `tree -I 'node_modules|target' -L 3` for project structure
- Use `find . -name "*.java" -mtime -7` to find recent Java files
```

#### Read/Write/Edit

File operations:

```markdown
- Read the main configuration file with `Read`
- Check if CLAUDE.md exists and read its contents
- Edit specific sections using `Edit` tool
```

#### Grep/Glob

Search and pattern matching:

```markdown
- Use `Grep` to find TODO comments: pattern "TODO|FIXME"
- Find all test files with `Glob`: pattern "**/*Test.java"
```

### MCP Tools

#### Memory Management

```markdown
- Load project history: `mcp__memory__read_graph`
- Search for specific context: `mcp__memory__search_nodes`
- Open relevant memory nodes: `mcp__memory__open_nodes`
```

#### Sequential Thinking

```markdown
- For complex analysis, use `mcp__thinking__sequentialthinking`
- Break down problems into logical steps
- Revise and iterate on solutions
```

#### Browser Automation

```markdown
- Navigate to documentation: `mcp__playwright__browser_navigate`
- Take screenshots: `mcp__playwright__browser_take_screenshot`
- Interact with web interfaces for testing
```

### Tool Maximization Strategy

**PARADIGM SHIFT**: AI systems benefit from comprehensive tool access, not minimal permissions.

- **MAXIMIZE tool availability** for intelligence amplification
- **PROVIDE redundancy** through multiple tool options for fallback strategies  
- **ENABLE learning** through memory and web research tools
- **SUPPORT multi-agent** coordination through Task tool access

**RECOMMENDED Tool Arsenal for AI Commands:**
```yaml
allowed-tools: [
  # Agent coordination
  Task,
  # Intelligence amplification
  mcp__thinking__sequentialthinking,
  # Memory and learning  
  mcp__memory__create_entities, mcp__memory__add_observations, mcp__memory__read_graph, mcp__memory__search_nodes,
  # File operations
  Read, Write, Edit, Glob, Grep,
  # Current knowledge
  WebSearch, WebFetch,
  # Process tracking
  TodoWrite
]
```

**Security Considerations:**
- Tool access enables better outcomes, not security risks
- AI systems use tools responsibly when properly instructed
- Benefits of intelligence amplification outweigh minimal security concerns

## Advanced Features

### Optional Error Handling Patterns

Modern command design supports flexible error handling based on command complexity and user needs rather than imposing rigid validation requirements.

#### Interactive Error Handling Consultation

Commands can intelligently assess their risk profile and consult users about appropriate error handling:

```markdown
## Instructions

### Phase N: Error Handling Assessment (Optional)
- Scan command description for explicit error handling keywords:
  "validation", "error handling", "robust", "production"
- Analyze potential failure points:
  - File operations → "File not found, permission errors"
  - Network operations → "Connectivity issues, timeouts" 
  - User input → "Invalid formats, missing data"
  - System commands → "Command failures, dependencies"
- If risks identified but not explicitly addressed, ask user:
  "I identified these potential error scenarios: [LIST]
   Would you like error handling for any of these?
   If yes, specify desired behavior: fail silently, show message, suggest alternatives?"
- Integrate user preferences into command implementation
```

#### Adaptive Complexity Levels

Commands should match their complexity to actual needs:

- **Simple Commands**: Focus on core functionality, minimal error handling
- **Moderate Commands**: Include basic validation with clear error messages  
- **Complex Commands**: Comprehensive error handling, recovery strategies, user guidance

#### Error Handling Decision Matrix

| Command Type | File Operations | Network Calls | User Input | Recommended Level |
|-------------|----------------|---------------|------------|-------------------|
| Utility     | None/Read-only | None         | Simple     | None/Basic        |
| Workflow    | Read/Write     | Optional     | Moderate   | Basic/Moderate    |
| Production  | Complex        | Required     | Complex    | Comprehensive     |

#### Implementation Patterns

```markdown
# Simple Command (no error handling)
## Instructions
- Execute core functionality directly
- Assume happy path operations

# Moderate Command (basic error handling)  
## Instructions
- Validate inputs before processing
- Provide clear error messages on failure
- Include basic recovery suggestions

# Complex Command (comprehensive error handling)
## Instructions
- Multi-level validation (input, environment, dependencies)
- Graceful error recovery with multiple fallback strategies
- Detailed error reporting with actionable next steps
- Progress tracking and rollback capabilities
```

### $ARGUMENTS Parameter

Accept command-line arguments:

```markdown
# File Analysis Command

Analyze the file or directory specified in $ARGUMENTS.

## Instructions
- If $ARGUMENTS is provided, analyze that specific file/directory
- If no arguments, prompt user to specify what to analyze
- Use appropriate tools based on file type
```

Usage: `/analyze src/main/java/MyClass.java`

### Conditional Logic

```markdown
## Instructions
- Check if pom.xml exists (Maven project) or package.json (Node project)
- If Maven: run `mvn compile -DskipTests`
- If Node: run `npm install && npm run build`
- If neither: provide setup guidance
```

### Error Handling and Fallbacks

```markdown
## Instructions
- Try to load memory with `mcp__memory__read_graph`
- If memory tools unavailable, search for previous session notes in .md files
- If git is not available, use `LS` to explore directory structure
- Always provide useful context even if some tools fail
```

### Context Management Strategies

```markdown
## Instructions

### Context Discovery Phase
1. Project structure: Use `tree` or `LS` for directory layout
2. Version control: Check `git status`, current branch, recent commits
3. Build state: Verify build files, check for compilation errors
4. Memory integration: Load previous session context if available

### Context Preparation Phase
1. Summarize current project state
2. Identify active work areas and focus
3. Flag any blocking issues or missing context
4. Prepare development environment for productive work
```

## Real-World Examples

### Example 1: Context Preparation Command

```markdown
---
allowed-tools: Bash, TodoRead, mcp__memory__read_graph, mcp__memory__search_nodes
description: Prepare comprehensive session context for development work
argument-hint: Optional depth level (quick|full)
---

# Prime Development Context

Systematically prepare the development environment by loading project state, memory, and active work context.

## Instructions

### Phase 1: Project State Discovery
- Execute `tree -I 'node_modules|target|.git' -L 3` to map current structure
- Run `git status --porcelain` and `git branch --show-current` for git context
- Check `git log --oneline -5` for recent activity

### Phase 2: Memory Integration
- Load full memory graph using `mcp__memory__read_graph`
- Search memory for project-related nodes: `mcp__memory__search_nodes`
- Identify continuation points from previous sessions

### Phase 3: Active Work Assessment
- Check current todos with `TodoRead`
- Scan recent commits for work patterns and focus areas
- Identify any blocking issues or missing context

### Phase 4: Context Summary
- Provide concise summary of current project state
- Highlight recommended next steps based on findings
- Flag any issues that need attention before starting work
```

### Example 2: Code Review Command

```markdown
---
allowed-tools: Bash, Grep, Read, mcp__thinking__sequentialthinking
description: Comprehensive code review with quality analysis
argument-hint: branch-name or commit-hash to review
---

# Code Review Workflow

Perform systematic code review analyzing changes, quality, and adherence to project standards.

## Instructions

### Phase 1: Change Analysis
- If $ARGUMENTS provided, use it as branch/commit reference
- Run `git diff $ARGUMENTS` or `git diff HEAD~1` for recent changes
- Use `Grep` to identify modified functions and classes

### Phase 2: Quality Assessment
- Check for code style consistency with project patterns
- Look for potential bugs, security issues, or performance concerns
- Verify test coverage for new/modified code

### Phase 3: Standards Compliance
- Ensure naming conventions match project guidelines
- Verify documentation and comments are adequate
- Check for proper error handling and logging

### Phase 4: Review Report
- Summarize findings with specific line references
- Provide actionable recommendations for improvements
- Highlight positive aspects and good practices found
```

### Example 3: Environment Setup Command

```markdown
---
allowed-tools: Bash, Read, Write
description: Set up and verify development environment
---

# Development Environment Setup

Verify and configure the development environment for optimal productivity.

## Instructions

### Phase 1: Environment Check
- Verify required tools: `java -version`, `mvn --version`, `node --version`
- Check environment variables: JAVA_HOME, M2_HOME
- Validate project structure and key files

### Phase 2: Dependency Management
- For Maven projects: run `mvn dependency:resolve`
- For Node projects: run `npm install`
- Check for any missing or outdated dependencies

### Phase 3: Build Verification
- Attempt clean build: `mvn clean compile -DskipTests`
- Run basic tests to verify setup: `mvn test -Dtest=*SmokeTest`
- Generate any necessary configuration files

### Phase 4: Setup Summary
- Report environment status and any issues found
- Provide next steps for resolving any problems
- Document setup for future reference
```

### Example 4: Command with Optional Error Handling

```markdown
---
allowed-tools: mcp__thinking__sequentialthinking, Bash, Read, Write
description: Deploy application with user-configurable error handling
---

# Application Deployment Command

Deploy application to target environment with flexible error handling based on deployment context.

## Instructions

### Phase 1: Deployment Analysis
- Use `mcp__thinking__sequentialthinking` to analyze deployment requirements
- Assess deployment complexity and potential failure points
- Determine if this is development, staging, or production deployment

### Phase 2: Error Handling Consultation
- Analyze potential risks:
  - Network connectivity issues during deployment
  - Service dependencies not available
  - Configuration file validation failures
  - Rollback requirements if deployment fails
- Ask user: "This deployment involves [RISKS]. Would you like error handling for:
  - Automatic rollback on failure?
  - Deployment validation checks?
  - Service health monitoring?"
- Document user preferences for implementation

### Phase 3: Deployment Execution
- Execute deployment steps based on complexity level chosen
- Apply error handling strategies as requested by user
- Monitor deployment progress with appropriate level of validation

### Phase 4: Deployment Verification
- Verify deployment success based on chosen validation level
- Report results with detail level matching error handling complexity
- Provide next steps or rollback guidance if issues detected
```

## Community Patterns

### Namespace Organization

MAM Modules uses organized namespaced commands:

- `/setup:prime` - Context and environment preparation  
- `/meta:create-command`, `/meta:create-local-command` - Meta-commands for tooling
- `/doctor:build`, `/doctor:plugin`, `/doctor:test` - Diagnostic suite
- `/analyze:test` - Analysis and assessment tools
- `/dev:*` - Reserved namespace for future development workflow commands

Popular community patterns include:

- `/dev:code-review`, `/dev:refactor`, `/dev:debug`
- `/test:unit`, `/test:integration`, `/test:generate`  
- `/deploy:build`, `/deploy:release`, `/deploy:verify`

### Multi-Phase Workflows

Breaking complex operations into phases:

1. **Discovery**: Understand current state
2. **Analysis**: Process information and identify issues
3. **Action**: Execute changes or preparations
4. **Validation**: Verify results and provide feedback

### Agent Integration

Using specialized agents for complex tasks:

```markdown
- Use general-purpose agent for multi-step research tasks
- Delegate complex analysis to thinking tools
- Orchestrate multiple tools for comprehensive workflows
```

### Memory Continuity

Maintaining context across sessions:

```markdown
- Always save important decisions and progress to memory
- Search memory for previous context before starting new work
- Update memory with session outcomes for future reference
```

## Best Practices

### Command Design

- **Single Responsibility**: Each command should have one clear purpose
- **Idempotent**: Safe to run multiple times without side effects
- **Self-Contained**: Include all necessary context and instructions
- **User-Friendly**: Clear naming and helpful descriptions

### Instructions Writing

- **Be Specific**: Use exact commands, not vague descriptions
- **Include Validation**: Add checks to ensure steps completed successfully
- **Handle Errors**: Provide fallbacks when tools or commands fail
- **Stay Focused**: Avoid tangential tasks not related to command purpose

### Tool Usage

- **Maximum Intelligence**: Request ALL tools that could enhance AI capabilities and outcomes
- **Learning Integration**: Include memory tools for continuous improvement and pattern storage
- **Web Enhancement**: Include WebSearch and WebFetch for current knowledge beyond training data  
- **Multi-Agent Support**: Include Task tool for specialized agent coordination
- **Intelligence Amplification**: Include mcp__thinking__sequentialthinking for complex analysis
- **Process Tracking**: Include TodoWrite for transparency in complex workflows

### Error Handling Strategy

**PARADIGM SHIFT**: Error handling for AI systems should be explicit and learning-based, not optional.

- **Mandatory Directives**: AI systems MUST have explicit error handling instructions, not optional patterns
- **Learning-Based**: Store error patterns and successful resolutions in memory for improvement
- **Intelligent Recovery**: Use memory and web research to find solutions to common problems
- **Guard Rails**: Use NEVER keywords to prevent harmful actions and ensure safety
- **Validation Gates**: Include explicit checkpoints with clear success/failure criteria
- **Fallback Strategies**: Provide alternative approaches when primary methods fail

### Maintenance

- **Version Control**: Keep commands in git for team sharing and history
- **Documentation**: Include usage examples and parameter descriptions
- **Regular Review**: Update commands as project needs evolve
- **Testing**: Verify commands work in different project states

### Team Collaboration

- **Consistent Style**: Follow team conventions for naming and structure
- **Shared Vocabulary**: Use project specific terminology consistently
- **Progressive Enhancement**: Build commands that work for different skill levels
- **Knowledge Sharing**: Document complex commands with examples and rationale

## Command Evolution Case Study: Learning from `add-bdd-scenarios`

**REAL-WORLD EXAMPLE**: The evolution of the `add-bdd-scenarios` command demonstrates critical AI command design insights.

### Evolution Phases and Lessons

#### **Phase 1: Basic Implementation** ❌
```yaml
# Initial approach - functional but limited
allowed-tools: [Task, Read, Write]
structure: Single agent, basic instructions
result: Worked but lacked guidance and consistency
```

**Issues Identified:**
- Insufficient tool access limited capabilities
- No learning or memory integration  
- Lacked concrete templates and examples
- No quality assurance mechanisms

#### **Phase 2: Over-Simplification** ❌
```yaml  
# Misguided "simplification" 
allowed-tools: [Task, Read, Edit]
structure: Minimal tools, removed complexity
result: Too basic, insufficient AI guidance
```

**Critical Mistakes:**
- Reduced tools thinking "simpler is better"
- Removed essential templates and examples
- No quality validation or learning
- AI system lacked direction for consistent output

#### **Phase 3: AI Powerhouse** ✅
```yaml
# Optimized for AI intelligence amplification
allowed-tools: [Task, mcp__thinking__sequentialthinking, mcp__memory__*, Read, Edit, Write, Glob, Grep, WebSearch, WebFetch, TodoWrite]
structure: Multi-agent orchestration with learning
result: Production-ready with continuous improvement
```

**Success Factors:**
- **Comprehensive tool access** enables intelligence amplification
- **Multi-agent orchestration** provides diverse expertise
- **Memory integration** enables continuous learning and improvement
- **Web research** keeps knowledge current beyond training data
- **Sequential thinking** ensures thorough analysis and decision-making

### Key Insights for Future Commands

| Lesson | Wrong Approach | Right Approach |
|--------|----------------|----------------|
| **Tool Philosophy** | Minimize tools for "simplicity" | Maximize tools for intelligence |
| **Agent Strategy** | Single agent for "efficiency" | Multi-agent for quality and expertise |
| **Learning** | Static commands | Memory-integrated continuous improvement |
| **Knowledge** | Training data only | Training + web research + stored patterns |
| **Structure** | Narrative instructions | Algorithmic directives with validation gates |

**CONCLUSION**: Commands should be designed as **AI intelligence amplification systems**, not simplified task runners.

## Troubleshooting

### Common Issues

#### Command Not Found

- Verify file is in `.claude/commands/` directory
- Check file extension is `.md`
- Ensure filename matches command name (kebab-case)

#### Tool Permission Errors

```markdown
# Add tools to frontmatter
---
allowed-tools: Bash, Read, Write
---
```

#### Syntax Errors in Frontmatter

```yaml
# Correct YAML format
---
allowed-tools: Bash, Read, Write
description: Description without quotes unless needed
---

# Not this
---
allowed-tools = Bash, Read, Write  # Wrong syntax
description = "Description"        # Wrong syntax
---
```

#### Commands Too Slow

- Break into smaller, focused commands
- Use specific tool permissions: `Bash(git status:*)`
- Avoid unnecessary file reads or complex searches
- Consider using `$ARGUMENTS` for targeted operations

#### Context Management Issues

- Load only relevant context, not everything
- Use memory tools to maintain continuity
- Summarize rather than dumping raw information
- Focus on actionable information

### Debugging Commands

1. **Test in Isolation**: Run command in simple project first
2. **Check Tool Availability**: Verify all requested tools are available
3. **Validate Frontmatter**: Use YAML validator for syntax
4. **Review Instructions**: Ensure they're specific and actionable
5. **Monitor Execution**: Watch for error messages during execution

### Getting Help

- Check official documentation: <https://docs.anthropic.com/en/docs/claude-code>
- Review community repositories for examples
- Test commands incrementally while developing
- Use simple commands as building blocks for complex workflows

---

This guide provides comprehensive coverage of Claude Code slash command creation. Start with simple commands and gradually incorporate advanced features as your needs grow. Remember that good commands are specific, reliable, and focused on solving real development workflow challenges.
