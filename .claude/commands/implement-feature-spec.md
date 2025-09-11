---
allowed-tools: [Read, Write, Edit, Glob, Grep, Task]
description: Orchestrate feature implementation using discovered project patterns
argument-hint: [specification-file-path]
---

# Feature Implementation Orchestrator

Transforms feature specifications into fully implemented and tested features by discovering project implementation patterns and coordinating appropriate specialized agents.

**Platform**: Check project specific information and documentation

## Instructions

### Phase 1: Project Context Discovery

**CRITICAL: Discover and follow project implementation standards exactly**

- Use `Read` to parse `CLAUDE.md` for:
  - Implementation patterns and agent coordination preferences
  - Architecture requirements and technology constraints
  - Code quality standards and review processes
  - **MANDATORY**: Extract ALL implementation-related requirements and patterns

- Use `Read` to parse `README.md` for:
  - Build system and development workflow information
  - Testing requirements and quality gates
  - Technology stack and dependency management

- Use `Glob` to find relevant templates and guides:
  - Search `Documents/Templates/*FEATURE*` for specification templates
  - Locate implementation guides and architectural documentation
  - Find existing feature implementation examples

- Use `Grep` to discover existing implementation patterns:
  - Search for architectural patterns in codebase
  - Identify testing and validation approaches
  - Find integration points and dependency patterns

- Check project-specific implementation workflow documentation and agent coordination preferences

**DELIVERABLE**: Complete understanding of project implementation requirements and coordination patterns

### Phase 2: Specification Analysis and Planning

- Use `Read` to analyze the feature specification file:
  - Parse specification structure and extract requirements
  - Identify acceptance criteria and technical specifications
  - Map feature requirements to implementation tasks
  - Assess complexity and required specializations

- **Implementation Planning**:
  - Break down specification into implementable tasks
  - Apply discovered project task organization patterns
  - Identify required agent specializations based on discovered preferences
  - Plan implementation sequence using discovered coordination patterns
  - **CRITICAL**: Follow discovered project planning and coordination standards exactly

- Use `Write` to create implementation plan document:
  - Document task breakdown and dependencies
  - Record architectural decisions and integration points
  - Save implementation strategy following discovered project documentation patterns

### Phase 3: Coordinated Implementation

- Use `Task` to coordinate with appropriate specialized agents:
  - Apply discovered agent coordination patterns from project documentation
  - Use discovered implementation standards and quality requirements
  - Follow discovered code review and validation processes
  - **MUST implement according to discovered project patterns exactly**

- **Implementation Coordination**:
  - Route tasks to appropriate specialists based on discovered preferences
  - Apply discovered quality gates and validation checkpoints
  - Use discovered testing and verification approaches
  - Follow discovered integration and deployment patterns

- **Quality Assurance**:
  - Apply discovered code review processes
  - Use discovered testing standards and coverage requirements
  - Follow discovered security and compliance validation
  - **CRITICAL**: Ensure all output meets discovered project standards

### Phase 4: Verification and Documentation

- Verify implementation against specification requirements:
  - Validate all acceptance criteria are met
  - Confirm integration with existing architecture using discovered patterns
  - Check compliance with discovered quality standards
  - Ensure testing coverage meets discovered requirements

- Use `Write` to create implementation documentation:
  - Document completed implementation and architectural decisions
  - Record integration points and deployment notes
  - Provide maintenance and enhancement recommendations
  - Follow discovered project documentation standards

## Error Handling

**Project Discovery Failures**:
- If `CLAUDE.md` not found: Continue with standard implementation coordination patterns
- If templates missing: Use generic feature implementation approaches
- If no existing patterns found: Apply common development coordination practices

**Project Workflow Issues**:
- If implementation patterns unclear: Check project-specific architectural guidelines and workflow documentation
- If agent coordination fails: Look for project-specific agent configuration and coordination preferences

**Specification Errors**:
- If specification file not found: Display error with path suggestions
- If specification malformed: Provide format guidance and template references
- If requirements unclear: Request clarification or additional specifications

**Implementation Coordination Issues**:
- If agent coordination fails: Retry with simplified task breakdown
- If quality gates fail: Apply discovered remediation processes
- If integration issues arise: Use discovered conflict resolution patterns

**Verification Failures**:
- If acceptance criteria not met: Identify gaps and coordinate fixes
- If quality standards not achieved: Apply discovered improvement processes
- If testing requirements not satisfied: Coordinate additional test implementation

## Integration Notes

- **Project-Aware**: Automatically adapts to discovered implementation and coordination patterns
- **Framework Agnostic**: Works with any development architecture and technology stack
- **Standards Compliant**: **STRICTLY FOLLOWS** discovered project implementation requirements
- **Quality Focused**: Applies discovered testing and code review standards
- **Documentation Driven**: Uses discovered documentation and planning patterns
- **Workflow Integration**: Follow project-specific implementation coordination patterns documented in project guides

## Usage Examples

```bash
# Feature specification document
/implement-feature-spec "Documents/UserManagement/Specification.md"

# Feature requirements file
/implement-feature-spec "specs/authentication-feature.md"

# Project feature document
/implement-feature-spec "features/reporting-dashboard.md"
```

**CRITICAL**: This command will discover your project's implementation patterns and coordination standards, then orchestrate feature development that MUST comply exactly with those discovered requirements and processes.
