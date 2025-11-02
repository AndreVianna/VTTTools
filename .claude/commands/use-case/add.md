---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, Write, Edit, Glob, Bash
description: Create detailed use case specification for a feature within area boundaries
argument-hint: {feature_name:string} {use_case_name:string} {use_case_description:string:optional} {jira_story_id:string:optional} {jira_story_url:string:optional}
---

# Add Use Case Command

Create implementation-ready use case specification following DDD, Clean Architecture, and Hexagonal Architecture principles.

## Actions

1. **Validate inputs and locate parent feature**:
   - Verify {feature_name} and {use_case_name} are valid
   - **Validate and process Jira fields (if provided)**:
     - If {jira_story_id} provided: must match regex `^[A-Z]+-[0-9]+$`
     - If {jira_story_id} provided but {jira_story_url} NOT provided:
       - Auto-generate URL: `https://rossvideo.atlassian.net/browse/{jira_story_id}`
       - Store generated URL in {jira_story_url}
     - If BOTH {jira_story_id} and {jira_story_url} provided:
       - Validate URL is valid
       - Extract story ID from URL (parse from `/browse/{ID}` pattern)
       - If extracted ID ≠ {jira_story_id}: **ERROR** "Jira story ID mismatch: URL contains '{extracted_id}' but argument is '{jira_story_id}'"
     - If only {jira_story_url} provided (no ID): **ERROR** "Jira story ID required when URL provided"
   - Search memory for feature entity OR use Glob to find feature file
   - If feature not found: abort with "Feature '{feature_name}' not found. Run /add-feature first."
   - Extract feature context (area assignment, use cases list) if available

2. **Initialize use case memory**:
   - Create entity: name="{use_case_name}", entityType="use_case", observations=["status: specifying"]
   - Add description from {use_case_description} (if provided) or from feature analysis
   - If {jira_story_id} provided: add observations ["jira_story_id: {jira_story_id}", "jira_story_url: {jira_story_url}"]
   - Create relationship: from="{feature_name}", to="{use_case_name}", relationType="contains_use_case"

3. **Run specification analysis** (iterative until complete):
   - Use Task tool with solution-engineer agent:
     ```markdown
     ROLE: Use Case Specification Analyst

     Create implementation-ready use case specification for "{use_case_name}" following MAM Modules architecture.

     INPUTS:
     - USE_CASE_TEMPLATE: .claude/templates/USE_CASE_TEMPLATE.md
     - SOLUTION: Documents/SOLUTION.md
     - STRUCTURE (if exists): Documents/Structure/STRUCTURE.md
     - Parent feature: {feature_name} (for area assignment and context)

     MANDATORY SEQUENCE:
     1. Determine owning area (from parent feature or solution spec)
     2. Determine UI presentation type (NO_UI, API_ENDPOINT, FULL_PAGE, MODAL, FORM, WIDGET, BUTTON, PANEL)
     3. Map to Clean Architecture Application Service
     4. Specify Hexagonal ports (primary inbound, secondary outbound adapters)
     5. Map to DDD domain entities and business rules
     6. Map to structure components (specific Java classes/React components with file paths)
     7. Define input/output, validation, error handling

     REQUIRED VARIABLES:
     - owning_area, parent_feature, use_case_type, use_case_purpose, target_users
     - ui_type, access_method, ui_elements (if applicable)
     - application_service_name, domain_entities_involved, infrastructure_needs
     - primary_port_method, secondary_port_requirements, adapter_specifications
     - structure_components (handler classes, file paths)
     - input_specification, business_rules_applied, output_specification, error_scenarios
     - acceptance_criteria

     Store all as observations: "variable_name: value"

     OUTPUT:
     STATUS: [specification_needed|complete]
     ANALYSIS: [progress assessment]
     ```
   - Continue loop until STATUS=complete

4. **Generate use case specification**:
   - Load USE_CASE_TEMPLATE.md
   - Extract owning_area and parent_feature from memory
   - Set path: "Documents/Areas/{owning_area}/Features/{parent_feature}/UseCases/{use_case_name}.md"
   - Create directory structure
   - Apply DSL variable substitution (handle foreach loops for errors/acceptance criteria)
   - Write specification file

4b. **Generate Use Case Status Tracker**:
   - Load USE_CASE_STATUS_TEMPLATE.md
   - Apply DSL substitution with initial values:
     - last_updated: {current_date}
     - status: NOT_STARTED
     - overall_grade: N/A
     - All layer statuses: ❌ (not implemented)
     - All test statuses: ❌ (not tested)
     - Implementation percent: 0%
   - Write to: Documents/Areas/{owning_area}/Features/{parent_feature}/UseCases/{use_case_name}/USE_CASE_STATUS.md

5. **Check for duplicate use cases across areas**:
   - Use Glob to find all existing use case files
   - If exact name match found in different area:
     - Create Shared directory: "Documents/Areas/Shared/Features/{feature_name}/UseCases/"
     - Move both use cases to Shared location
     - Update both with "Parent Feature: (Shared) {original_feature}, {current_feature}"
     - Update memory for both entities and parent features
     - Cleanup original files

6. **Update parent feature specification**:
   - Read parent feature spec (from memory path or Glob search)
   - Parse current version from change log
   - Increment minor version (e.g., "1.0.0" → "1.1.0")
   - Add change log entry: "Created {use_case_name} use case specification"
   - Regenerate feature document with updated data
   - If structure mapping exists: update STRUCTURE.md and FEATURE.md cross-references

7. **Refine description** (post-generation quality improvement):
   - Read generated use case specification completely
   - Use Task tool with solution-engineer agent to create refined description:
     ```markdown
     ROLE: Documentation Analyst

     Create refined description for use case "{use_case_name}" (1-2 sentences max).

     INPUT: Complete use case specification content

     OUTPUT: Professional description capturing operational purpose and architecture context.
     ```
   - Update memory: "description: {refined_description}"
   - Regenerate use case specification with refined description
   - Update parent feature with refined use case description

**Reporting**:
```
✓ USE CASE CREATED: {use_case_name}

Area: {owning_area}
Feature: {parent_feature}
Type: {use_case_type}
UI Type: {ui_type}

Created:
- {use_case_spec_path}
- {use_case_spec_path}/USE_CASE_STATUS.md

Next Steps:
- Review specification
- Validate: /use-case:validate {use_case_name}
- Prepare implementation: /use-case:coding:prepare {use_case_name}
- Track progress: /use-case:display {use_case_name}
```

**NOTES**:
- Supports coordinated creation from feature analysis or standalone creation
- Maintains architectural integrity through DDD/Clean/Hexagonal alignment
- Auto-promotes duplicate use cases to Shared area
- Refines description post-generation for quality
