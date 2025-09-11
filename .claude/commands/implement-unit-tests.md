---
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep, Task]
description: Implement executable unit tests using discovered project frameworks
argument-hint: [unit-spec-file-path]
---

# Implement Unit Tests

Implements executable unit tests from `.unit` specification files by discovering project testing frameworks, patterns, and standards, then creating complete test implementations.

**Platform**: Check project specific information and documentation

## Instructions

### Phase 1: Project Context Discovery

**CRITICAL: Discover and follow project testing standards exactly**

- Use `Read` to parse `CLAUDE.md` for:
  - Testing frameworks and tools used in the project
  - Unit testing standards and isolation requirements  
  - Build commands and test execution approaches
  - **MANDATORY**: Extract ALL unit testing-related constraints and standards

- Use `Read` to parse `README.md` for:
  - Testing framework versions and configuration details
  - Build system integration and test execution commands
  - Test directory structure and organization patterns

- Use `Glob` to find unit testing guides:
  - Search `Documents/Guides/*UNIT*TEST*` for unit test implementation standards
  - Locate project-specific testing patterns and examples
  - Find existing unit test files for reference

- Use `Grep` to discover existing testing patterns:
  - Search for existing test files and their structure
  - Identify testing framework usage and mocking patterns
  - Find test execution and build integration approaches

- Check project-specific testing framework setup documentation, CI/CD integration guides, and test execution procedures

**DELIVERABLE**: Complete understanding of project unit testing requirements and framework standards

### Phase 2: Specification Analysis and Implementation Planning

- Use `Read` to analyze the `.unit` specification file:
  - Parse specification format and extract test scenarios
  - Identify subject class and methods to be tested
  - Extract mock requirements and isolation needs
  - Map test scenarios to implementation approach

- **Implementation Planning**:
  - Apply discovered testing framework patterns (JUnit, NUnit, pytest, etc.)
  - Use discovered mocking framework approaches (Mockito, Moq, mock, etc.)
  - Follow discovered test organization and naming conventions
  - Plan test execution using discovered build integration patterns
  - **CRITICAL**: Implement using exactly the discovered project testing patterns

### Phase 3: Test Implementation and Execution

- **Test Implementation**:
  - Create test classes following discovered project structure and naming
  - Implement test methods using discovered testing framework patterns
  - Apply discovered mocking and isolation strategies
  - Use discovered assertion patterns and test data approaches
  - **MUST follow discovered project unit testing standards exactly**

- **Test Execution and Verification**:
  - Use discovered build commands to execute tests
  - Apply discovered test reporting and verification approaches
  - Ensure all tests pass using discovered project criteria
  - Generate test reports using discovered reporting tools

- Use `Write` to create test files in discovered project test structure
- Use `Bash` to execute tests using discovered project build commands

### Phase 4: Quality Validation and Completion

- **Test Quality Validation**:
  - Verify test coverage meets discovered project standards
  - Check test isolation and mocking compliance
  - Validate test execution performance against discovered requirements
  - Ensure integration with discovered build and CI/CD processes

- **Completion Verification**:
  - Confirm all specification scenarios are implemented
  - Validate test execution and reporting
  - Check integration with discovered project testing infrastructure
  - Provide summary of implemented tests and coverage metrics

## Error Handling

**Project Discovery Failures**:
- If `CLAUDE.md` not found: Continue with standard unit testing framework detection
- If testing guides missing: Use common unit testing implementation patterns
- If no existing patterns found: Apply standard testing framework conventions

**Project Testing Setup Issues**:
- If testing framework unclear: Check project-specific testing setup documentation and configuration files
- If test execution varies: Look for project-specific CI/CD integration guides and testing procedure documentation

**Specification Analysis Errors**:
- If `.unit` file not found: Display error with path suggestions
- If specification format invalid: Provide parsing error details and format guidance
- If subject class unclear: Request clarification or additional context

**Implementation Errors**:
- If test implementation fails: Provide detailed error analysis and corrections
- If testing framework integration issues: Check dependencies and configuration
- If test execution failures: Analyze causes and provide fixes

**Build Integration Issues**:
- If test execution commands fail: Verify discovered build configuration
- If test reporting issues: Check discovered reporting tool setup
- If CI/CD integration problems: Validate discovered pipeline configuration

## Integration Notes

- **Project-Aware**: Automatically adapts to discovered testing frameworks and unit testing patterns
- **Framework Agnostic**: Works with any testing framework (JUnit, NUnit, pytest, etc.)
- **Standards Compliant**: **STRICTLY FOLLOWS** discovered project unit testing requirements
- **Build Integration**: Uses discovered test execution commands and build integration
- **Quality Focused**: Applies discovered test coverage and quality standards
- **Procedure Compliance**: Follow project-specific test execution procedures and CI/CD integration requirements

## Usage Examples

```bash
# JUnit test implementation
/implement-unit-tests "Documents/specifications/UserService.unit"

# Python unittest implementation  
/implement-unit-tests "specs/data_processor.unit"

# .NET NUnit test implementation
/implement-unit-tests "Tests/Specifications/OrderManager.unit"
```

**CRITICAL**: This command will discover your project's unit testing framework and standards, then implement tests that MUST comply exactly with those discovered requirements and patterns.
