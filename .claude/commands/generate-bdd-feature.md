---
allowed-tools: [Read, Write, Edit, Glob, Grep, Task]
description: Generate BDD feature files using discovered project standards
argument-hint: [feature-description]
---

# Generate BDD Feature File

Generates BDD `.feature` files by discovering project BDD standards and creating comprehensive test scenarios with appropriate Gherkin formatting.

**Platform**: Check project specific information and documentation

## Instructions

### Phase 1: Project Context Discovery

**CRITICAL: Discover and follow project BDD standards exactly**

- Use `Read` to parse `CLAUDE.md` for:
  - BDD testing standards and feature file organization patterns
  - Gherkin formatting requirements and conventions
  - Testing environment and framework requirements
  - **MANDATORY**: Extract ALL BDD feature creation requirements and standards

- Use `Read` to parse `README.md` for:
  - Testing framework information and BDD tool setup
  - Feature file organization and directory structure
  - Build and execution commands for BDD tests

- Use `Glob` to find BDD specification guides:
  - Search `Documents/Guides/*BDD*SPEC*` for BDD specification standards
  - Locate existing feature file examples and templates
  - Find project-specific BDD patterns and conventions

- Use `Grep` to discover existing BDD patterns:
  - Search for existing .feature files and their structure
  - Identify common scenario patterns and tag usage
  - Find project-specific BDD terminology and naming conventions

- Check project-specific Gherkin style guides, feature file organization patterns, and BDD framework setup documentation

**DELIVERABLE**: Complete understanding of project BDD feature file requirements and standards

### Phase 2: Feature Analysis and Planning

- **Feature Requirements Analysis**:
  - Parse feature description and extract key behaviors
  - Identify user roles, goals, and business benefits
  - Map feature to system components and user workflows
  - Determine testing scope and scenario requirements

- **Scenario Planning**:
  - Plan positive path scenarios (happy path testing)
  - Identify negative scenarios (error conditions, validation failures)
  - Consider edge cases and boundary conditions
  - Apply discovered project scenario organization patterns
  - **CRITICAL**: Follow discovered project BDD terminology and conventions exactly

### Phase 3: Feature File Creation

- **Gherkin Structure Creation**:
  - Create feature description following discovered project format
  - Use discovered project user story format and business language
  - Apply discovered tag conventions and scenario organization
  - **MUST follow discovered project Gherkin formatting standards exactly**

- **Scenario Implementation**:
  - Implement Given-When-Then steps using discovered project patterns
  - Use discovered project terminology and domain language
  - Apply discovered test data and example patterns
  - Focus on business behavior without technical implementation details

- **File Organization**:
  - Use `Glob` to verify project feature file directory structure
  - Generate meaningful filename following discovered naming conventions
  - Use `Write` to create `.feature` file in appropriate project location

### Phase 4: Quality Validation

- **Standards Compliance Check**:
  - Verify feature file follows discovered project format
  - Check Gherkin syntax against discovered standards
  - Validate business language usage (no implementation details)
  - Ensure scenario completeness and clarity

- **Project Integration Validation**:
  - Confirm integration with discovered testing framework
  - Validate tag usage and scenario organization
  - Check file placement and naming convention compliance
  - Ensure compatibility with discovered build and execution processes

## Error Handling

**Project Discovery Failures**:
- If `CLAUDE.md` not found: Continue with standard BDD feature file patterns
- If BDD guides missing: Use common Gherkin formatting standards
- If no existing patterns found: Apply standard BDD conventions

**Project BDD Setup Issues**:
- If Gherkin format unclear: Check project-specific BDD style guides and feature file examples
- If framework integration varies: Look for project-specific BDD framework setup and configuration documentation

**Feature Description Issues**:
- If description insufficient: Request more detailed requirements
- If feature scope unclear: Ask for clarification on user roles and goals
- If business context missing: Prompt for additional domain information

**File Creation Errors**:
- If feature directory doesn't exist: Create appropriate directory structure
- If file conflicts exist: Prompt user for overwrite confirmation
- If write permissions insufficient: Suggest alternative locations

## Integration Notes

- **Project-Aware**: Automatically adapts to discovered BDD standards and feature file patterns
- **Framework Agnostic**: Works with any BDD framework (Cucumber, Serenity, SpecFlow, etc.)
- **Standards Compliant**: **STRICTLY FOLLOWS** discovered project BDD requirements
- **Quality Focused**: Ensures scenarios are business-readable and follow discovered conventions
- **Build Ready**: Creates feature files compatible with discovered testing framework
- **Style Compliance**: Follow project-specific feature file organization and Gherkin formatting standards

## Usage Examples

```bash
# Generate feature for user authentication
/generate-bdd-feature "User login functionality that allows users to authenticate with username/password, supports remember me option, handles invalid credentials gracefully, and provides password reset capability."

# Generate feature for data processing
/generate-bdd-feature "Batch data import feature that processes CSV files, validates data format, handles duplicate records, provides progress feedback, and generates summary reports."

# Generate feature for API functionality  
/generate-bdd-feature "REST API for user management that supports CRUD operations, authentication, role-based access control, input validation, and proper error responses."
```

**CRITICAL**: This command will discover your project's BDD standards and feature file patterns, then generate .feature files that MUST comply exactly with those discovered requirements and conventions.
