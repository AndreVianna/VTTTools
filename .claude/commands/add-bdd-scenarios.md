---
allowed-tools: [Read, Write, Edit, Glob, Grep, Task]
description: Add BDD scenarios to use case documents using discovered project patterns
argument-hint: [use-case-code-or-file-path]
---

# Add BDD Scenarios to Use Case Documentation

Analyzes existing use case markdown files and appends a comprehensive "BDD Scenarios" section containing Gherkin-formatted test scenarios by discovering project BDD patterns and standards.

**Platform**: Check project specific information and documentation

## Instructions

### Phase 1: Project Context Discovery

**CRITICAL: Discover and follow project BDD standards exactly**

- Use `Read` to parse `CLAUDE.md` for:
  - BDD scenario patterns and terminology used in the project
  - Testing standards and Gherkin formatting requirements
  - Use case documentation patterns and conventions
  - **MANDATORY**: Extract ALL BDD-related requirements and patterns

- Use `Glob` to find existing BDD scenario examples:
  - Search `Documents/**/*BDD*` for BDD guides and examples
  - Locate existing use case files with BDD scenarios for pattern reference
  - Find project-specific scenario templates and formats

- Use `Grep` to discover existing BDD patterns:
  - Search for existing Gherkin scenarios and their structure
  - Identify common tags and scenario organization approaches
  - Find project-specific BDD terminology and naming conventions

- Check project-specific BDD scenario examples, use case documentation structure, and terminology standards

**DELIVERABLE**: Complete understanding of project BDD scenario requirements and formatting standards

### Phase 2: Use Case Analysis and Type Detection

- Use `Read` to analyze the use case file:
  - Parse use case structure and identify key functionality
  - Extract business requirements and user interactions
  - Identify system interactions and data flows
  - Determine appropriate BDD scenario types

- **Simple Type Detection**:
  - **API Use Cases**: Keywords like HTTP, endpoint, request, response, status codes
  - **UI Use Cases**: Keywords like click, button, form, page, user interface, navigation
  - **Integration Use Cases**: Keywords like message, protocol, integration, data exchange
  - **Workflow Use Cases**: Keywords like workflow, process, approval, state transition
  - **CRITICAL**: Apply discovered project type classification patterns

- **Smart File Resolution** (if use case code provided):
  - If argument matches pattern like "API-02-001", search for matching file
  - Use `Glob` to find: `**/*${code}*.md` in project documentation
  - Check project-specific documentation organization patterns and use case file structure
  - If multiple matches found, present options to user for selection

### Phase 3: BDD Scenario Generation

- **Scenario Creation**:
  - Apply discovered project BDD scenario patterns and templates
  - Use discovered Gherkin formatting standards and tag conventions
  - Generate scenarios covering positive paths, error handling, and edge cases
  - **MUST follow discovered project BDD terminology and patterns exactly**

- **Scenario Types Based on Detection**:
  - **API Scenarios**: Request/response validation, authentication, error codes
  - **UI Scenarios**: User interactions, navigation flows, form validation
  - **Integration Scenarios**: Data exchange, message handling, protocol compliance
  - **Workflow Scenarios**: Process steps, state transitions, approvals

- **Quality Standards**:
  - Ensure scenarios are business-readable (no technical implementation details)
  - Apply discovered project tagging conventions
  - Use discovered project test data and example patterns
  - Follow discovered project scenario organization approaches

### Phase 4: File Update and Completion

- **User Confirmation**:
  - Present generated BDD scenarios to user for review
  - Show detected use case type and applied patterns
  - Ask for confirmation before modifying the file

- **File Modification**:
  - Use `Edit` to append scenarios as "## BDD Scenarios" section
  - Preserve all existing file content
  - **CRITICAL**: Wrap all BDD content in ```gherkin syntax blocks for proper markdown rendering
  - Follow discovered project formatting standards

- **Completion**:
  - Confirm successful addition of scenarios
  - Provide summary of generated scenarios and their focus areas

## Error Handling

**Project Discovery Failures**:
- If `CLAUDE.md` not found: Continue with standard BDD scenario patterns
- If BDD guides missing: Use generic Gherkin formatting standards
- If no existing patterns found: Apply common BDD scenario conventions

**Project Documentation Structure Issues**:
- If use case organization unclear: Check project-specific documentation structure and file organization patterns
- If BDD terminology varies: Look for project-specific BDD style guides and scenario examples

**File Resolution Errors**:
- If use case code not found: Display error with path suggestions
- If multiple files match code: Present options for user selection
- If file path invalid: Provide guidance on correct file paths

**Use Case Analysis Errors**:
- If file not readable: Check permissions and provide guidance
- If use case content unclear: Request additional context
- If type detection uncertain: Prompt user for manual type selection

**Scenario Generation Issues**:
- If BDD scenarios already exist: Offer options to overwrite or merge
- If scenario generation fails: Provide fallback generic scenarios
- If formatting issues: Apply standard Gherkin formatting

## Integration Notes

- **Project-Aware**: Automatically adapts to discovered project BDD patterns and standards
- **Format Compliant**: **STRICTLY FOLLOWS** discovered project Gherkin formatting requirements
- **Type Adaptive**: Generates appropriate scenarios based on use case type detection
- **Quality Focused**: Ensures scenarios are business-readable and follow discovered conventions
- **File Safe**: Preserves existing content while adding new BDD scenarios section

## Usage Examples

```bash
# Use case code (auto-resolves to full path)
/add-bdd-scenarios API-02-001

# Full file path
/add-bdd-scenarios "Documents/Use_Cases/01_Asset_API/API-01-001_POST_Create_Asset.md"

# UI use case
/add-bdd-scenarios "Documents/Use_Cases/Asset_Library_Search_Workflow.md"
```

**CRITICAL**: This command will discover your project's BDD patterns and terminology, then generate scenarios that MUST comply exactly with those discovered requirements and formatting standards.