---
allowed-tools: [Read, Glob, Grep, Task, Write]
description: Validate feature specifications against discovered project standards
argument-hint: [specification-file-path]
---

# Feature Specification Validator

Validates feature specifications against discovered project architectural patterns, technical standards, and integration requirements. Focuses on implementation compatibility and completeness.

**Platform**: Check project specific information and documentation

## Instructions

### Phase 1: Project Context Discovery

**CRITICAL: Discover and follow project validation standards exactly**

- Use `Read` to parse `CLAUDE.md` for:
  - Architectural patterns and technical constraints required by the project
  - Technology stack versions and framework requirements
  - Validation standards and quality gates
  - **MANDATORY**: Extract ALL specification validation requirements and patterns

- Use `Read` to parse `README.md` for:
  - Project architecture and technology stack information
  - Build system requirements and dependencies
  - Integration patterns and compatibility requirements

- Use `Glob` to find relevant templates and validation guides:
  - Search `Documents/Templates/*FEATURE*` for specification templates
  - Locate architectural guides and validation documentation
  - Find existing specification examples and patterns

- Use `Grep` to discover existing architectural patterns:
  - Search for architectural conventions in codebase
  - Identify integration patterns and service dependencies
  - Find build system and dependency management patterns

- Check project-specific validation standards, architectural guidelines, and template format documentation

**DELIVERABLE**: Complete understanding of project validation requirements and architectural standards

### Phase 2: Specification Structure Validation

- Use `Read` to examine specification file and validate structure:
  - Verify file exists at provided path and is readable
  - Confirm specification follows discovered template structure
  - Extract project context and technology stack declarations
  - Validate all required sections are present and complete

- **Template Compliance Check**:
  - Validate against discovered specification template format
  - Check for required sections based on discovered project standards
  - Verify technology stack alignment with discovered project requirements
  - Assess completeness of technical specifications

### Phase 3: Architectural Compatibility Validation

- **Technology Stack Compatibility**:
  - Validate technology versions against discovered project stack
  - Check framework compatibility with discovered project requirements
  - Assess build system alignment with discovered build patterns
  - Verify dependency compatibility with discovered project dependencies

- **Architecture Pattern Validation**:
  - Validate architectural patterns against discovered project patterns
  - Check service integration approaches against discovered standards
  - Assess data layer patterns against discovered project conventions
  - Verify UI/frontend patterns against discovered project frameworks

- **Integration Compatibility Assessment**:
  - Check integration points against discovered project architecture
  - Validate service dependencies against discovered project services
  - Assess API patterns against discovered project API standards
  - Verify deployment patterns against discovered project deployment approaches

### Phase 4: Implementation Readiness Assessment

- **Gap Analysis**:
  - Identify missing technical components required for implementation
  - Check for architectural misalignments with discovered project patterns
  - Assess implementation blockers based on discovered project constraints
  - Validate completeness against discovered project requirements

- **Compliance Assessment**:
  - Database layer compliance with discovered project data patterns
  - Backend service compliance with discovered project service patterns
  - Frontend architecture compliance with discovered project UI frameworks
  - Build integration compliance with discovered project build system

- Use `Write` to create validation report:
  - Document compatibility assessment results
  - List identified issues and recommended fixes
  - Provide implementation readiness assessment
  - Follow discovered project reporting standards

## Validation Report Format

```markdown
# Feature Specification Validation Report

## Implementation Readiness: [COMPATIBLE/NEEDS REVISION/INCOMPATIBLE]

### Executive Summary
- **Specification File**: [path/to/specification.md]
- **Project Standards Compliance**: [assessment]
- **Critical Issues Count**: [number]
- **Architecture Alignment**: [assessment]

## Critical Issues (Implementation Blockers)
[List issues that would prevent successful implementation]

## Architecture Compatibility Assessment
### Technology Stack: [COMPLIANT/NEEDS UPDATE]
[Assessment against discovered project technology requirements]

### Service Architecture: [COMPLIANT/NEEDS UPDATE] 
[Assessment against discovered project service patterns]

### Data Layer: [COMPLIANT/NEEDS UPDATE]
[Assessment against discovered project data patterns]

### Build Integration: [COMPLIANT/NEEDS UPDATE]
[Assessment against discovered project build requirements]

## Recommended Actions
### Critical Fixes (Blocks Implementation)
[Specific actions needed to enable implementation]

### Architecture Alignment (High Priority)
[Actions needed to align with discovered project patterns]

### Best Practice Improvements (Medium Priority)
[Improvements to better follow discovered project standards]

## Implementation Risk Assessment
[Overall risk level and confidence in successful implementation based on discovered project requirements]
```

## Error Handling

**Project Discovery Failures**:
- If `CLAUDE.md` not found: Continue with generic architectural validation patterns
- If templates missing: Use standard specification validation approaches
- If no existing patterns found: Apply common architectural validation practices

**Project Standards Issues**:
- If validation criteria unclear: Check project-specific architectural guidelines and validation standards documentation
- If template format varies: Look for project-specific specification template examples and format guides

**Specification Validation Errors**:
- If specification file not found: Display error with path suggestions
- If specification malformed: Provide format guidance using discovered templates
- If incomplete specification: List missing sections based on discovered requirements

**Compatibility Assessment Issues**:
- If technology stack unclear: Request clarification based on discovered project requirements
- If architectural patterns ambiguous: Provide guidance using discovered project patterns
- If integration points missing: Suggest additions based on discovered project architecture

## Integration Notes

- **Project-Aware**: Automatically adapts to discovered project validation standards and architectural patterns
- **Framework Agnostic**: Works with any project architecture and technology stack
- **Standards Compliant**: **STRICTLY FOLLOWS** discovered project specification requirements
- **Implementation Focused**: Identifies specific gaps that would prevent successful development
- **Quality Assured**: Applies discovered project quality gates and validation standards

## Usage Examples

**Note**: Review project-specific validation requirements and architectural standards first

```bash
# Feature specification validation
/validate-feature-spec "Documents/UserAuthentication/Specification.md"

# Project feature document validation
/validate-feature-spec "specs/reporting-feature.md"

# Architecture compliance check
/validate-feature-spec "features/data-integration.md"
```

**CRITICAL**: This command will discover your project's architectural standards and validation requirements, then validate specifications to ensure they MUST comply exactly with those discovered patterns and constraints.