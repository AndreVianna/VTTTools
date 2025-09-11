---
allowed-tools: [Read, Write, Edit, Glob, Grep, Task]
description: Generate feature specifications using discovered project patterns
argument-hint: [feature-name] [feature-description]
---

# Feature Specification Generator

Generates comprehensive feature specifications from feature descriptions by discovering project architectural patterns, templates, and requirements standards.

**Platform**: Check project specific information and documentation

## Instructions

### Phase 1: Project Context Discovery

**CRITICAL: Discover and follow project specification standards exactly**

- Use `Read` to parse `CLAUDE.md` for:
  - Architectural patterns and technology stack requirements
  - Feature specification standards and quality requirements
  - Development workflow and implementation patterns
  - **MANDATORY**: Extract ALL specification-related constraints and standards

- Use `Read` to parse `README.md` for:
  - Project architecture and technology stack information
  - Build system and dependency requirements
  - Integration patterns and compatibility constraints

- Use `Glob` to find specification templates:
  - Search `Documents/Templates/*FEATURE*` for feature specification templates
  - Locate existing specification examples and patterns
  - Find architectural guides and documentation standards

- Use `Grep` to discover existing architectural patterns:
  - Search for existing specification patterns in documentation
  - Identify technology stack usage and integration approaches
  - Find naming conventions and project-specific terminology

- Check project-specific specification template locations, formats, and architectural naming conventions

**DELIVERABLE**: Complete understanding of project specification requirements and architectural standards

### Phase 2: Input Analysis and Requirements Extraction

- **Input Format Validation**:
  - Parse feature name from single quotes (e.g., 'User Management' → User_Management)
  - Support multiple description formats: plain text, user stories, BDD statements, document paths
  - Extract key business requirements and technical implications
  - Assess specification complexity based on discovered project patterns

- **Requirements Analysis**:
  - Parse feature description and extract functional requirements
  - Identify user roles, capabilities, and business benefits
  - Map feature requirements to system components using discovered architecture
  - Assess integration complexity with existing architecture patterns
  - **CRITICAL**: Apply discovered project terminology and conventions exactly

### Phase 3: Specification Generation

- **Architecture Design**:
  - Apply discovered project architectural patterns and technology stack
  - Design components using discovered service patterns and integration approaches
  - Follow discovered naming conventions and organizational structures
  - **MUST use discovered project technology requirements exactly**

- **Specification Structure Creation**:
  - Use discovered specification template format
  - Include all sections required by discovered project standards
  - Apply discovered project context and technical specifications
  - Generate acceptance criteria using discovered testing approaches
  - **CRITICAL**: Follow discovered project specification format exactly**

- **Content Generation**:
  - Create functional requirements using discovered project patterns
  - Generate technical specifications following discovered architecture
  - Include implementation guidelines based on discovered project standards
  - Apply discovered testing strategy and quality requirements

### Phase 4: File Creation and Validation

- **File System Preparation**:
  - Convert feature name to directory format using discovered naming conventions
  - Create appropriate directory structure following discovered project organization
  - Use `Write` to create specification file in correct project location

- **Specification Validation**:
  - Verify specification includes all sections required by discovered template
  - Check compliance with discovered architectural patterns and technology requirements
  - Validate completeness of functional requirements and technical specifications
  - Ensure integration with discovered project workflow and quality standards

### Phase 5: Conditional Processing

- **Complete Specification Path** (if sufficient information available):
  - Generate complete specification following discovered template format
  - Include all required sections with discovered project-specific content
  - Provide file location and next steps based on discovered workflow

- **Clarification Questions Path** (if insufficient information):
  - Generate structured questions grouped by discovered project requirements
  - Provide context for missing information based on discovered specification standards
  - Offer guidance for information gathering using discovered project patterns

## Error Handling

**Project Discovery Failures**:
- If `CLAUDE.md` not found: Continue with generic specification patterns
- If templates missing: Use standard feature specification approaches
- If no existing patterns found: Apply common specification conventions

**Project Template Issues**:
- If specification format unclear: Check project-specific template examples and format documentation
- If naming conventions vary: Look for project-specific architectural guidelines and naming standard documentation

**Input Validation Errors**:
- If feature name malformed: Provide format examples and retry guidance
- If description insufficient: Request detailed feature description with format options
- If document path invalid: Suggest alternative paths and verify accessibility

**Specification Generation Issues**:
- If architectural patterns unclear: Use discovered project fallback patterns
- If template compliance fails: Apply discovered project correction guidance
- If technology stack conflicts: Use discovered project resolution approaches

**File System Errors**:
- If directory creation fails: Suggest alternative locations and provide guidance
- If file writing issues: Offer conflict resolution and alternative naming
- If permissions insufficient: Provide platform-specific guidance

## Integration Notes

- **Project-Aware**: Automatically adapts to discovered specification templates and architectural patterns
- **Framework Agnostic**: Works with any project architecture and technology stack
- **Standards Compliant**: **STRICTLY FOLLOWS** discovered project specification requirements
- **Workflow Compatible**: Integrates with discovered project development and validation processes
- **Quality Focused**: Applies discovered project quality standards and acceptance criteria

## Usage Examples

**Note**: Check project-specific specification templates and naming conventions before starting

```bash
# Simple feature description
/generate-feature-spec 'User Profile Management' "Allow users to create, edit, and manage their profile information including contact details, preferences, and avatar images."

# User story format
/generate-feature-spec 'Asset Batch Operations' "As a media manager, I want to perform batch operations on multiple assets simultaneously so that I can efficiently manage large media libraries and reduce repetitive tasks."

# BDD format  
/generate-feature-spec 'Smart Search Integration' "Given that users need to find assets quickly, When they enter natural language search queries, Then the system should return relevant assets using AI-powered semantic search with metadata correlation."

# Document reference
/generate-feature-spec 'Advanced Timeline Editor' "Documents/Timeline_Requirements_Analysis.md"
```

**CRITICAL**: This command will discover your project's specification templates and architectural standards, then generate feature specifications that MUST comply exactly with those discovered requirements and patterns.