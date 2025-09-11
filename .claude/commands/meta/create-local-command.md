---
allowed-tools: [Read, Glob, Grep, Write, Bash, WebSearch]
description: Create personal slash commands using discovered project patterns
argument-hint: [command-description]
---

# Create Local Command Meta-Generator

Intelligently generates personal slash commands saved to local folder (not committed to repo) based on natural language descriptions by discovering project command patterns and standards.

**Platform**: Check project specific information and documentation

## Instructions

### Phase 1: Project Context Discovery

**CRITICAL: Discover and follow project command standards exactly**

- Use `Read` to parse `CLAUDE.md` for:
  - Command creation patterns and conventions used in the project
  - Tool preferences and architectural standards
  - Personal command guidelines and local development patterns
  - **MANDATORY**: Extract ALL command-related requirements and patterns

- Use `Read` to parse `README.md` for:
  - Project workflow and development tool preferences
  - Build system integration and automation approaches
  - Technology stack and framework requirements

- Use `Glob` to examine existing commands:
  - Search `.claude/commands/**/*.md` for shared command patterns
  - Search `.claude/commands/**/*.local.md` for existing personal commands
  - Identify common frontmatter configurations and tool usage patterns

- Use `Grep` to discover command patterns:
  - Search for common tool combinations and usage patterns
  - Identify project-specific command structure and formatting
  - Find existing argument hint formats and description patterns

- Check project-specific command documentation, personal workflow guides, and local development patterns

**DELIVERABLE**: Complete understanding of project command creation requirements and personal command standards

### Phase 2: Requirement Analysis and Design

- **Command Requirement Analysis**:
  - Parse command description and extract key functionality requirements
  - Identify required tools based on described functionality
  - Map requirements to appropriate command phases and structure
  - Apply discovered project command patterns with personal workflow considerations
  - **CRITICAL**: Follow discovered project command creation standards exactly

- **Tool Selection and Architecture**:
  - Select minimal, essential tools based on actual functionality needs
  - Apply discovered project tool preferences and restrictions
  - Design command structure using discovered project patterns
  - Generate appropriate frontmatter following discovered format standards
  - Consider personal development environment and workflow needs

- **Name Generation**:
  - Generate 3-5 potential command names using discovered naming conventions
  - Check for conflicts with existing local commands only (namespace separation)
  - Apply discovered project terminology and naming standards

- Use `WebSearch` to research relevant best practices:
  - Search for industry patterns related to the command functionality
  - Find current standards and approaches for the specific domain
  - Validate tool choices against current best practices

### Phase 3: Local Command Creation and Setup

- **Local Directory Setup**:
  - Use `Glob` to check if `.claude/commands/` directory exists
  - Use `Bash` to create directory if needed: `mkdir -p .claude/commands`
  - Handle directory creation using cross-platform approach

- **Command File Generation**:
  - Create command markdown file following discovered project template format
  - Apply discovered frontmatter standards and tool selection patterns
  - Use discovered project command structure with personal workflow adaptations
  - **MUST follow discovered project command creation standards exactly**

- **Content Creation**:
  - Generate command content using discovered project patterns
  - Include project discovery phase as first step (consistent with other commands)
  - Apply discovered error handling and integration patterns
  - Follow discovered documentation and formatting standards
  - Add note about personal/local command status

- Use `Write` to create command file in `.claude/commands/` directory:
  - The file must have the `.local` before the extensions: `{COMMAND_NAME}.local.md`
  - Use discovered naming conventions and file organization
  - Include proper frontmatter with optimized tool list
  - Follow discovered project command documentation standards

- **Validation**:
  - Verify command follows discovered project patterns
  - Check frontmatter compliance with discovered standards
  - Ensure personal workflow integration
  - Provide summary of created local command and its capabilities

## Error Handling

**Project Discovery Failures**:
- If `CLAUDE.md` not found: Continue with standard command creation patterns
- If no existing commands found: Use generic command structure templates
- If patterns unclear: Apply common command creation best practices

**Local Directory Issues**:
- If local directory creation fails: Provide guidance on permissions and alternative locations
- If local commands conflict: Suggest alternative names or provide overwrite options
- If git integration issues: Ensure local commands are properly excluded from repository

**Personal Workflow Integration Issues**:
- If local environment conflicts: Provide guidance on personal command customization
- If tool availability varies: Adapt tool selection for local environment capabilities
- If workflow integration unclear: Provide guidance on personal development patterns

## Integration Notes

- **Personal Focus**: Creates commands optimized for individual workflow and development environment
- **Project-Aware**: Uses discovered project patterns but adapts for personal use
- **Repository Safe**: Local commands are not committed, allowing for personal experimentation
- **Standards Compliant**: **STRICTLY FOLLOWS** discovered project command creation requirements
- **Namespace Separated**: Local commands operate independently from shared project commands

## Usage Examples

**Note**: Check project-specific command creation patterns and personal workflow preferences first

```bash
# Personal productivity command
/create-local-command "Personal command to backup my current work, commit changes, and sync with my personal notes system"

# Environment-specific command
/create-local-command "Command to set up my development environment with my personal tools, configurations, and preferences"

# Personal testing command
/create-local-command "Run my personal code quality checks including my custom linting rules and formatting preferences"
```

**CRITICAL**: This meta-command will discover your project's command creation patterns, then create personal commands that follow those standards while being optimized for your individual workflow and not committed to the repository.