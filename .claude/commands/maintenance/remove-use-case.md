---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Bash, TodoWrite]
description: Remove a use case from a feature, updating all related documents and memory
argument-hint: {feature_name:string} {use_case_name:string} {cleanup_orphans:flag:optional(true)}
---

# Remove Use Case Command

Safely remove a use case from a feature, maintaining consistency between memory graph and documentation while preserving project integrity.

## Process

### Validation & Setup

- **STEP 0A**: Validate {feature_name} is not empty and contains valid characters - abort if invalid with clear error message
- **STEP 0B**: Validate {use_case_name} is not empty and contains valid characters - abort if invalid with clear error message
- **STEP 0C**: Set {cleanup_orphans} default to true if not provided

### Entity Verification

- **STEP 1A**: Use mcp__memory__search_nodes to find feature entity with name "{feature_name}"
- **STEP 1B**:
  <if (feature entity not found)>
  - Display error: "Feature '{feature_name}' not found in memory. Available features: [list found features]"
  - Abort operation with guidance to check feature name or run /extract-all to sync memory
  </if>
- **STEP 1C**: Use mcp__memory__search_nodes to find use case entity with name "{use_case_name}"
- **STEP 1D**:
  <if (use case entity not found)>
  - Display error: "Use case '{use_case_name}' not found in memory. Available use cases: [list found use cases]"
  - Abort operation with guidance to check use case name or run /extract-all to sync memory
  </if>
- **STEP 1E**: Use mcp__memory__open_nodes to verify feature→use_case relationship exists
- **STEP 1F**:
  <if (relationship does not exist)>
  - Display error: "Use case '{use_case_name}' is not associated with feature '{feature_name}'"
  - Show actual parent feature for the use case
  - Abort operation with correction guidance
  </if>

### Dependency Analysis

- **STEP 2A**: Use mcp__memory__search_nodes to find any entities that reference the use case
- **STEP 2B**: Check for relationships pointing TO the use case entity
- **STEP 2C**:
  <if (dependencies found)>
  - Display warning: "Use case '{use_case_name}' has dependencies:"
  - List all dependent entities and relationship types
  - Ask user confirmation: "Continue with removal? Dependencies will be cleaned up. (Y/N)"
  </if>
  <if (user declines)>
  - Abort operation gracefully
  </if>
- **STEP 2D**: Use Glob tool to find use case document: "Documents/Areas/*/UseCases/{use_case_name}.md"
- **STEP 2E**: Store document path for later deletion

### Memory Entity Removal

- **STEP 3A**: Use mcp__memory__delete_relations to remove feature→use_case relationship
- **STEP 3B**: Use mcp__memory__delete_relations to remove any other relationships involving the use case
- **STEP 3C**: Use mcp__memory__delete_entities to remove use case entity from memory
- **STEP 3D**: Use mcp__memory__open_nodes to get current feature entity observations
- **STEP 3E**: Parse feature observations to extract current use case list
- **STEP 3F**: Remove {use_case_name} from the use case list
- **STEP 3G**: Decrement use_cases_count if present
- **STEP 3H**: Generate new version number (increment minor version)
- **STEP 3I**: Create change log entry: "{current_date} — {new_version} — Removed {use_case_name} use case"
- **STEP 3J**: Use mcp__memory__add_observations to update feature with:
  - Updated use case list
  - New version number
  - Updated change log
  - Last updated date

### Document Cleanup

- **STEP 4A**:
  <if (use case document path found)>
  - Use Read tool to verify document exists and read content for backup reference
  - Use Bash tool: "rm '{use_case_document_path}'" to delete use case document
  - Report: "Deleted use case document: {use_case_document_path}"
   </if>
- **STEP 4B**:
  <if (use case document path NOT found)>
  - Report: "No use case document found for {use_case_name} - memory-only removal"
  </if>
- **STEP 4C**: Use Glob tool to find feature document: "Documents/Areas/*/Features/{feature_name}.md"
- **STEP 4D**:
 <if (feature document found)>
  - Use Read tool to load feature document content
  - Use Edit tool to update feature document:
    - Remove {use_case_name} from use case lists
    - Update version in change log
    - Add removal entry to change log
  - Report: "Updated feature document: {feature_document_path}"
  </if>

### Orphan Cleanup (Conditional)

- **STEP 5A**:
  <if ({cleanup_orphans} equals true)>
  - Use Glob tool to find potential orphaned files: "**/*{use_case_name}*"
  - Filter results to exclude legitimate files (other features, documentation)
  </if>
  <if (orphaned files found)>
  - List orphaned files for user review
  - Ask confirmation: "Remove {count} orphaned files? (Y/N)"
  </if>
  <if (user confirms)>
  - Use Bash tool to remove orphaned files
  </if>
- **STEP 5B**: Use Glob tool to check for broken references: "Documents/**/*.md"
- **STEP 5C**: Use Bash tool: "grep -r '{use_case_name}' Documents/" to find remaining references
- **STEP 5D**:
  <if (references found)>
  - Display warning: "Found {count} remaining references to '{use_case_name}' in:"
  - List files with references
  - Recommend manual review and cleanup
  </if>

### Impact Assessment

- **STEP 6A**: Check if feature has any remaining use cases
- **STEP 6B**:
  <if (no use cases remain)>
  - Display warning: "Feature '{feature_name}' now has no use cases"
  - Suggest: "Consider adding use cases with /add-use-case or removing feature with /remove-feature"
  </if>
- **STEP 6C**: Assess impact on related features that might reference this use case
- **STEP 6D**: Check solution specification for any references to the removed use case

### Completion Report

- **STEP 7A**: Display comprehensive removal summary:
  ```
  ✓ USE CASE REMOVAL COMPLETED

  Removed: {use_case_name}
  From Feature: {feature_name}

  Actions Taken:
  - Deleted use case entity from memory
  - Removed feature→use_case relationship
  - Deleted use case document: {document_path}
  - Updated feature document and version
  - Cleaned up {orphan_count} orphaned files

  Feature Status:
  - Remaining use cases: {remaining_count}
  - New version: {new_version}
  - Last updated: {date}

  <if`warnings exist>
  Warnings:
  - {warning_list}

  Next Steps:
  - Review remaining references manually
  - Consider running /validate-solution to check consistency
  ```

### Validation Check

- **STEP 8A**: Use mcp__memory__search_nodes to verify use case entity was completely removed
- **STEP 8B**: Use mcp__memory__open_nodes to verify feature no longer references the use case
- **STEP 8C**:
  <if (inconsistencies found)>
  - Display error: "Cleanup incomplete - found inconsistencies:"
  - List remaining issues
  - Recommend: "Run /extract-all to resync memory with documents"
  </if>

## Quick Reference
- VTTTOOLS_STACK.md: VttTools technology stack overview
- ARCHITECTURE_PATTERN.md: DDD Contracts + Service Implementation pattern

**IMPORTANT NOTES**:
- This command performs destructive operations - use with caution
- Always maintains feature document consistency and version tracking
- Provides comprehensive cleanup while preserving project integrity
- Offers rollback guidance through detailed reporting
- Integrates with existing project structure and memory graph