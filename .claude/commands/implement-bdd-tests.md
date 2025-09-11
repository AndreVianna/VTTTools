---
allowed-tools: [Read, Write, Bash, Glob, Grep, Task]
description: Implement executable BDD tests using discovered project frameworks
argument-hint: [feature-file-path]
---

# Implement BDD Tests

Implements executable BDD tests from `.feature` files by discovering project BDD frameworks and testing standards, then creating complete test implementations.

**Platform**: Check project specific information and documentation

## Instructions

### Phase 1: Project Context Discovery

**CRITICAL: Discover and follow project BDD standards exactly**

- Use `Read` to parse `CLAUDE.md` for:
  - BDD testing frameworks and tools used in the project
  - Testing architecture patterns and requirements
  - Build commands and test execution approaches
  - **MANDATORY**: Extract ALL BDD-related constraints and standards

- Use `Read` to parse `README.md` for:
  - Testing framework information and build setup
  - BDD tool versions and configuration details
  - Test execution commands and CI/CD integration

- Use `Glob` to find BDD testing guides:
  - Search `Documents/Guides/*BDD*GUIDE*` for BDD implementation standards
  - Locate project-specific BDD patterns and examples

- Use `Grep` to discover existing BDD patterns:
  - Search for existing step definitions and their structure
  - Identify BDD framework integration points (Cucumber, SpecFlow, etc.)
  - Find test execution patterns and reporting approaches

- Check project-specific BDD documentation, examples, and CI/CD integration guides

**DELIVERABLE**: Complete understanding of project BDD framework and testing requirements

### Phase 2: Feature Analysis and Implementation

- Use `Read` to analyze the `.feature` file:
  - Parse Gherkin scenarios and step definitions
  - Identify required test environment (UI, API, service layer)
  - Map scenarios to appropriate testing approach
  - Extract test data requirements and business logic

- **Environment and Framework Selection**:
  - Apply discovered BDD framework (Cucumber, Serenity, SpecFlow, etc.)
  - Use discovered testing architecture patterns
  - Follow discovered step definition organization
  - **CRITICAL**: Implement using exactly the discovered project patterns

- **Test Implementation**:
  - Create step definition classes following discovered project structure
  - Implement Given-When-Then steps using discovered patterns
  - Use discovered testing framework annotations and conventions
  - Apply discovered test data management approaches
  - **MUST follow discovered project BDD implementation standards exactly**

### Phase 3: Test Execution and Validation

- Use discovered build commands to execute tests:
  - Apply discovered test execution commands from project documentation
  - Use discovered reporting and verification approaches
  - Follow discovered CI/CD integration patterns

- **Test Verification**:
  - Ensure all scenarios are implemented and passing
  - Verify test reports are generated using discovered reporting tools
  - Validate test execution follows discovered project patterns
  - Check integration with discovered build and reporting systems

- Use `Write` to create test files in discovered project test structure
- Use `Bash` to execute tests using discovered project commands

## Error Handling

**Project Discovery Failures**:
- If `CLAUDE.md` not found: Continue with standard BDD framework detection
- If BDD guides missing: Use common BDD implementation patterns
- If no existing BDD patterns found: Apply standard framework conventions

**Project Setup Issues**:
- If BDD framework unclear: Check project-specific testing setup documentation and CI/CD configuration
- If test execution fails: Look for project-specific troubleshooting guides and testing environment documentation

**Feature File Errors**:
- If `.feature` file not found: Display error with path suggestions
- If Gherkin syntax invalid: Provide parsing error details and suggestions
- If scenarios unclear: Request clarification or additional context

**Implementation Errors**:
- If step definitions fail: Provide detailed error analysis and corrections
- If framework integration issues: Check dependencies and configuration
- If test execution failures: Analyze causes and provide fixes

**Build Integration Issues**:
- If test commands fail: Verify discovered build configuration
- If reporting issues: Check discovered reporting tool setup
- If CI/CD integration problems: Validate discovered pipeline configuration

## Integration Notes

- **Project-Aware**: Automatically adapts to discovered BDD frameworks and testing patterns
- **Framework Agnostic**: Works with any BDD framework (Cucumber, Serenity, SpecFlow, etc.)
- **Standards Compliant**: **STRICTLY FOLLOWS** discovered project BDD requirements
- **Build Integration**: Uses discovered build commands and test execution approaches
- **Reporting**: Applies discovered test reporting and verification tools
- **Workflow Integration**: Consult project-specific workflow documentation for BDD integration patterns and CI/CD requirements

## Usage Examples

```bash
# Cucumber feature
/implement-bdd-tests "src/test/resources/features/user-login.feature"

# Serenity BDD feature
/implement-bdd-tests "features/asset-management.feature"

# SpecFlow feature (C#/.NET)
/implement-bdd-tests "Features/OrderProcessing.feature"
```

**CRITICAL**: This command will discover your project's BDD framework and testing standards, then implement tests that MUST comply exactly with those discovered requirements and patterns.
