---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Bash, TodoWrite]
description: Remove a feature from the project, including all its use cases and related artifacts
argument-hint: {feature_name:string} {force:flag:optional(false)}
---

# Remove Feature Command

Safely remove a feature from the project, including all its use cases and related artifacts, while maintaining project integrity and providing recovery options.

## Process

### Validation & Setup

- **STEP 0A**: Validate {feature_name} is not empty and contains valid characters - abort if invalid with clear error message
- **STEP 0B**: Set {force} default to false if not provided

### Feature Verification & Impact Analysis

- **STEP 1A**: Use mcp__memory__search_nodes to find feature entity with name "{feature_name}"
- **STEP 1B**:
  <if (feature entity not found)>
  - Display error: "Feature '{feature_name}' not found in memory. Available features:"
  - Use mcp__memory__search_nodes to list all feature entities
  - Abort operation with guidance to check feature name or run /extract-all to sync memory
  </if>
- **STEP 1C**: Use mcp__memory__open_nodes to get all feature observations and relationships
- **STEP 1D**: Get all use cases related to this feature via "contains" relationships
- **STEP 1E**: Count total use cases that will be removed
- **STEP 1F**: Use mcp__memory__search_nodes to find any entities that reference this feature
- **STEP 1G**: Analyze cross-feature dependencies and references

### Dependency Check & User Confirmation

- **STEP 2A**:
  <if (dependencies found AND {force} equals false)>
  - Display warning: "Feature '{feature_name}' has dependencies:"
  - List dependent entities, features, and relationship types
  - Show impact summary: "{use_case_count} use cases will be removed"
  - Ask user confirmation: "Continue with feature removal? This action cannot be undone. (Y/N)"
  </if>
  <if (user declines)>
  - Abort operation gracefully
  </if>

- **STEP 2B**:
  <if ({force} equals true)>
  - Display notice: "FORCE mode enabled - skipping dependency checks"
  - Show impact summary for user awareness
  </if>
- **STEP 2C**: Use Glob tool to find feature document: "Documents/Areas/*/Features/{feature_name}.md"
- **STEP 2D**: Use Glob tool to find all use case documents for this feature: "Documents/Areas/*/UseCases/*.md"
- **STEP 2E**: Filter use case documents to match feature's use cases from memory

### Backup Creation (Conditional)

- **STEP 3A**:
  - Create backup directory: "backups/feature_removal_{feature_name}_{backup_timestamp}"
  - Use Bash tool: "mkdir -p 'backups/feature_removal_{feature_name}_{backup_timestamp}'"
- **STEP 3B**:
  <if (feature document found)>
  - Use Bash tool: "cp '{feature_document_path}' 'backups/feature_removal_{feature_name}_{backup_timestamp}/'"
  - Report: "Backed up feature document"
  </if>
- **STEP 3C**:
  <foreach use_case_document in use_case_documents>
  - Use Bash tool: "cp '{use_case_document_path}' 'backups/feature_removal_{feature_name}_{backup_timestamp}/'"
  </foreach>
- **STEP 3D**:
  - Report: "Created backup at: backups/feature_removal_{feature_name}_{backup_timestamp}"

### Cascade Use Case Removal

- **STEP 4A**:
  <foreach use_case in feature_use_cases>
  - Display: "Removing use case: {use_case_name}"
  - Use mcp__memory__delete_relations to remove all relationships involving the use case
  - Use mcp__memory__delete_entities to remove use case entity from memory
  <if (use_case_document_exists)>
    - Use Bash tool: "rm '{use_case_document_path}'" to delete use case document
    - Report: "Deleted use case document: {use_case_document_path}"
  </if>
  </foreach>
- **STEP 4B**: Count and report total use cases removed: "Removed {count} use cases"

### Feature Memory Cleanup

- **STEP 5A**: Use mcp__memory__delete_relations to remove all relationships FROM the feature
- **STEP 5B**: Use mcp__memory__delete_relations to remove all relationships TO the feature
- **STEP 5C**: Use mcp__memory__search_nodes to find project entity
- **STEP 5D**: Use mcp__memory__open_nodes to get project observations
- **STEP 5E**: Parse project observations to extract current feature list
- **STEP 5F**: Remove {feature_name} from the project's feature list
- **STEP 5G**: Decrement features_count if present
- **STEP 5H**: Generate new project version number (increment minor version)
- **STEP 5I**: Create change log entry: "{current_date} — {new_version} — Removed {feature_name} feature"
- **STEP 5J**: Use mcp__memory__add_observations to update project with:
  - Updated feature list
  - New version number
  - Updated change log
  - Last updated date
- **STEP 5K**: Use mcp__memory__delete_entities to remove feature entity from memory

### Document Cleanup

- **STEP 6A**:
  <if (feature document found)>
  - Use Bash tool: "rm '{feature_document_path}'" to delete feature document
  - Report: "Deleted feature document: {feature_document_path}"
  </if>
- **STEP 6B**: Use Read tool to load "Documents/SOLUTION.md"
- **STEP 6C**:
  <if (solution specification contains feature references)>
  - Use Edit tool to update solution specification:
    - Remove feature from Features section (if exists)
    - Remove any feature-specific sections
    - Update version in change log
    - Add removal entry to change log
  - Report: "Updated solution specification document"
  </if>

### Orphan & Reference Cleanup

- **STEP 7A**: Use Glob tool to find potential orphaned files: "**/*{feature_name}*"
- **STEP 7B**: Filter results to exclude legitimate files and backup directory
- **STEP 7C**:
  <if (orphaned files found)>
  - List orphaned files for user review
  - Ask confirmation: "Remove {count} potentially orphaned files? (Y/N)"
  </if>
  <if (user confirms)>
  - Use Bash tool to remove each orphaned file
  - Report files removed
  </if>
- **STEP 7D**: Use Bash tool: "grep -r '{feature_name}' Documents/" to find remaining references
- **STEP 7E**:
  <if (references found)>
  - Display warning: "Found {count} remaining references to '{feature_name}' in:"
  - List files with line numbers and context
  - Recommend manual review and cleanup
  </if>

### Cross-Feature Impact Assessment

- **STEP 8A**: Use mcp__memory__search_nodes to check if any remaining features reference the removed feature
- **STEP 8B**: Use Bash tool to search for feature name in remaining feature documents
- **STEP 8C**:
  <if (cross-references found)>
  - Display impact warning: "Removal may affect other features:"
  - List affected features and reference types
  - Recommend reviewing and updating affected features
  </if>
- **STEP 8D**: Check if any area directories are now empty
- **STEP 8E**:
  <if (empty area directories found)>
  - Ask user: "Remove empty area directories? (Y/N)"
  </if>
  <if (user confirms)>
   - Remove empty directories
  </if>

### Project Consistency Check

- **STEP 9A**: Use mcp__memory__search_nodes to count remaining features
- **STEP 9B**: Use mcp__memory__open_nodes to verify project entity no longer references removed feature
- **STEP 9C**:
  <if (project has no features remaining)>
  - Display warning: "Project now has no features defined"
  - Suggest: "Consider adding features with /add-feature or reviewing project scope"
  </if>
- **STEP 9D**: Verify all memory relationships are consistent

### Completion Report

- **STEP 10A**: Display comprehensive removal summary:
  ```
  ✓ FEATURE REMOVAL COMPLETED

  Removed Feature: {feature_name}
  Use Cases Removed: {use_case_count}
  Documents Deleted: {document_count}

  Actions Taken:
  - Deleted feature entity from memory
  - Removed project→feature relationship
  - Deleted feature document: {feature_document_path}
  - Removed {use_case_count} use cases and documents
  - Updated solution specification and version
  - Created backup at: {backup_path}

  Project Status:
  - Remaining features: {remaining_feature_count}
  - New project version: {new_version}
  - Last updated: {date}

  Warnings:
  - {warning_list}

  Recovery:
  - Backup location: {backup_path}
  - To restore: Copy documents back and run /extract-all

  Next Steps:
  - Review cross-references manually
  - Consider running /validate-solution to check consistency
  - Update any dependent features that referenced {feature_name}
  ```

### Final Validation

- **STEP 11A**: Use mcp__memory__search_nodes to verify feature entity was completely removed
- **STEP 11B**: Use mcp__memory__search_nodes to verify no orphaned use case entities remain
- **STEP 11C**: Use mcp__memory__open_nodes to verify project entity reflects the removal
- **STEP 11D**:
  <if (inconsistencies found)>
  - Display error: "Cleanup incomplete - found inconsistencies:"
  - List remaining issues
  </if>
  <if (backup exists)> - Provide restoration guidance
  - Recommend: "Run /extract-all to resync memory with documents"
  </if>

## Quick Reference
- VTTTOOLS_STACK.md: VttTools technology stack overview
- ARCHITECTURE_PATTERN.md: DDD Contracts + Service Implementation pattern

**IMPORTANT NOTES**:
- This command performs extensive destructive operations - use with extreme caution
- Backup is enabled by default to provide recovery option
- Force flag bypasses dependency checks but shows impact for awareness
- Maintains project document consistency and version tracking
- Provides comprehensive cleanup while preserving project integrity
- Offers detailed rollback guidance through backup and reporting
- Integrates with existing project structure and memory graph