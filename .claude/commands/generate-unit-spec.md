---
allowed-tools: [Read, Glob, Grep, Write, Task]
description: Generate unit test specifications with project-aware isolation analysis
argument-hint: [source-file-path]
---

# Generate Unit Test Specification

Generates `.unit` test specification files by discovering project testing standards and ensuring complete isolation of external dependencies.

**Platform**: Check project specific information and documentation

## Instructions

### Phase 1: Project Context Discovery

**CRITICAL: Discover and follow project standards exactly**

- Use `Read` to parse `CLAUDE.md` for:
  - Testing frameworks and standards required by the project
  - Technology stack and architectural patterns
  - Coding conventions and quality requirements
  - **MANDATORY**: Extract ALL testing-related constraints and patterns

- Use `Read` to parse `README.md` for:
  - Build commands and testing approach
  - Project dependencies and tech stack information
  - Testing framework preferences

- Use `Glob` to find relevant testing guides:
  - Search `Documents/Guides/*TEST*GUIDE*` for unit test specification standards
  - Locate any project-specific testing documentation

- Use `Grep` to discover existing testing patterns in codebase:
  - Search for existing test files and their structure
  - Identify dependency injection and mocking patterns
  - Find external service integration points

- Check project-specific documentation structure (docs/, documentation/, .github/) for additional testing guides

**DELIVERABLE**: Complete understanding of project testing requirements and standards

### Phase 2: Subject Analysis and Specification Generation

- Use `Read` to analyze the subject file:
  - Parse class/interface structure and identify all public methods
  - Analyze method parameters, return types, and exception handling
  - Map business logic flow and decision points
  - **CRITICAL**: Identify ALL external dependencies that must be mocked

- **Complete Isolation Analysis**:
  - Database/Storage dependencies (repositories, DAOs, file services)
  - Network/API dependencies (HTTP clients, web service calls)
  - UI service dependencies (if applicable)
  - System resource dependencies (configuration, logging services)
  - Framework-specific service dependencies

- **Code Path Analysis**:
  - Map positive scenarios (happy path testing)
  - Identify negative scenarios (error conditions, validation failures)
  - Analyze boundary conditions and edge cases
  - Consider input combinations and state variations

- Use discovered project testing guide to create `.unit` specification:
  - **MUST follow discovered project specification format exactly**
  - Include comprehensive mock requirements list
  - Create test scenarios focusing on business logic isolation
  - Apply discovered performance categories and standards
  - **CRITICAL**: Ensure specification aligns with project testing standards

### Phase 3: File Placement and Validation

- Use `Glob` to verify project test structure and determine appropriate location
- Generate meaningful filename based on source file structure
- Use `Write` to create the `.unit` specification file in correct project location

- **Quality Validation**:
  - Verify specification follows discovered project format
  - Check that all external dependencies are identified for mocking
  - Ensure test scenarios cover all critical code paths
  - Validate business-readable language (no implementation details)

## Error Handling

**Project Discovery Failures**:
- If `CLAUDE.md` not found: Continue with generic unit testing best practices
- If testing guides missing: Use standard unit testing patterns
- If no existing test patterns found: Apply common testing framework conventions

**Project Documentation Issues**:
- If project testing guides unclear: Check project-specific documentation in /docs, /documentation, or .github folders
- If testing standards vary: Look for project-specific testing configuration files and standards documents

**Subject Analysis Errors**:
- If subject file not found: Display error with path suggestions
- If file parsing fails: Continue with available structural information
- If dependencies unclear: Request additional context or continue with identified patterns

**File Creation Errors**:
- If test directory doesn't exist: Create appropriate directory structure
- If file conflicts exist: Prompt user for overwrite confirmation
- If write permissions insufficient: Suggest alternative locations

## Integration Notes

- **Project-Aware**: Automatically adapts to discovered testing frameworks and standards
- **Technology Agnostic**: Works with any programming language and testing framework
- **Standards Compliant**: **STRICTLY FOLLOWS** discovered project testing requirements
- **Isolation Focused**: Ensures complete external dependency isolation through mocking
- **Quality Assured**: Validates against discovered project specification standards

## Usage Examples

**Note**: First check your project's testing documentation and naming conventions

```bash
# Java service class
/generate-unit-spec "src/main/java/com/example/service/UserService.java"

# TypeScript component  
/generate-unit-spec "src/components/UserProfile.tsx"

# Python module
/generate-unit-spec "src/services/data_processor.py"
```

**CRITICAL**: This command will discover your project's testing standards from CLAUDE.md and documentation, then generate specifications that MUST comply exactly with those discovered requirements.
