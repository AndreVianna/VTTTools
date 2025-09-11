---
allowed-tools: [Read, Glob, Grep, Write, Bash, WebSearch]
description: Create project slash commands using discovered project patterns
argument-hint: [command-description]
---

# Create Command Meta-Generator

Intelligently generates new slash commands based on natural language descriptions by discovering project command patterns, standards, and conventions.

**Platform**: Check project specific information and documentation

## Instructions

### Phase 1: Project Context Discovery

**CRITICAL: Discover and follow project command standards exactly**

- Use `Read` to parse `CLAUDE.md` for:
  - Command creation patterns and conventions used in the project
  - Tool preferences and architectural standards
  - Command organization and naming conventions
  - **MANDATORY**: Extract ALL command-related requirements and patterns

- Use `Read` to parse `README.md` for:
  - Project workflow and development tool preferences
  - Build system integration and automation approaches
  - Technology stack and framework requirements

- Use `Glob` to examine existing commands:
  - Search `.claude/commands/**/*.md` for existing command patterns
  - Identify common frontmatter configurations and tool usage
  - Find project-specific command naming and organization conventions

- Use `Grep` to discover command patterns:
  - Search for common tool combinations and usage patterns
  - Identify project-specific command structure and formatting
  - Find existing argument hint formats and description patterns

- Check project-specific command documentation, style guides, and development workflow patterns

**DELIVERABLE**: Complete understanding of project command creation requirements and standards

### Phase 2: Requirement Analysis and Design

- **Command Requirement Analysis**:
  - Parse command description and extract key functionality requirements
  - Identify required tools based on described functionality
  - Map requirements to appropriate command phases and structure
  - Apply discovered project command patterns and conventions
  - **CRITICAL**: Follow discovered project command creation standards exactly

- **Tool Selection and Architecture**:
  - Select minimal, essential tools based on actual functionality needs
  - Apply discovered project tool preferences and restrictions
  - Design command structure using discovered project patterns
  - Generate appropriate frontmatter following discovered format standards

- **Name Generation**:
  - Generate 3-5 potential command names using discovered naming conventions
  - Check for conflicts with existing commands using discovered organization patterns
  - Apply discovered project terminology and naming standards

- Use `WebSearch` to research relevant best practices:
  - Search for industry patterns related to the command functionality
  - Find current standards and approaches for the specific domain
  - Validate tool choices against current best practices

### Phase 3: Command Creation and Validation

- **Command File Generation**:
  - Create command markdown file following discovered project template format
  - Apply discovered frontmatter standards and tool selection patterns
  - Use discovered project command structure and phase organization
  - **MUST follow discovered project command creation standards exactly**

- **Content Creation**:
  - Generate command content using discovered project patterns
  - Include project discovery phase as first step (consistent with other commands)
  - Apply discovered error handling and integration patterns
  - Follow discovered documentation and formatting standards

- Use `Write` to create command file in `.claude/commands/` directory:
  - Use discovered naming conventions and file organization
  - Include proper frontmatter with optimized tool list
  - Follow discovered project command documentation standards

- **Validation**:
  - Verify command follows discovered project patterns
  - Check frontmatter compliance with discovered standards
  - Ensure integration with discovered project workflow
  - Provide summary of created command and its capabilities

## Error Handling

**Project Discovery Failures**:
- If `CLAUDE.md` not found: Continue with standard command creation patterns
- If no existing commands found: Use generic command structure templates
- If patterns unclear: Apply common command creation best practices

**Requirement Analysis Issues**:
- If command description insufficient: Request more detailed requirements
- If functionality unclear: Ask for clarification on intended use and scope
- If tool requirements ambiguous: Provide guidance on tool selection

**Command Creation Errors**:
- If command directory doesn't exist: Create `.claude/commands/` directory structure
- If name conflicts detected: Suggest alternative names using discovered conventions
- If file creation fails: Provide guidance on permissions and alternative locations

**Project Integration Issues**:
- If command patterns inconsistent: Provide guidance on discovered project standards
- If tool selection conflicts: Apply discovered project tool preferences
- If formatting issues: Use discovered project formatting and documentation patterns

## Integration Notes

- **Project-Aware**: Automatically adapts to discovered command creation patterns and standards
- **Framework Agnostic**: Works with any project type and creates commands following discovered patterns
- **Standards Compliant**: **STRICTLY FOLLOWS** discovered project command creation requirements
- **Pattern Consistent**: Creates commands that use the same project discovery pattern as optimized commands
- **Quality Focused**: Generates commands that follow discovered project quality and formatting standards

## Usage Examples

**Note**: Check project-specific command creation patterns and conventions first

```bash
# Simple utility command
/create-command "Generate a quick commit message based on git diff output and file changes"

# Testing command
/create-command "Run project tests with coverage reporting and open the coverage report in browser"

# Documentation command
/create-command "Generate API documentation from code comments and save to docs folder"
```

**CRITICAL**: This meta-command will discover your project's command creation patterns and standards, then create new commands that MUST comply exactly with those discovered requirements and follow the same project-aware discovery pattern.