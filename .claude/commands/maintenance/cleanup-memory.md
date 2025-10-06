---
allowed-tools: [mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, mcp__memory__delete_entities, mcp__memory__delete_relations, Bash, TodoWrite]
description: Clean up stale memory entities from old sessions
argument-hint: {scope:string:optional(all)}
---

# Cleanup Memory Command

Removes stale memory entities from previous sessions to maintain memory graph cleanliness. Identifies and removes temporary entities, failed sessions, and orphaned relationships.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Phase 0: Setup

- **STEP 0A**: Parse {scope} parameter:
  <case {scope}>
  <is "all">
    - Clean all temporary entities
  </is>
  <is "validations">
    - Clean only validation session entities
  </is>
  <is "extractions">
    - Clean only extraction session entities
  </is>
  <is "dry-run">
    - Show what would be deleted without deleting
  </is>
  <otherwise>
    - Default to "all"
  </otherwise>
  </case>

## Phase 1: Discover Stale Entities

- **STEP 1A**: Use mcp__memory__read_graph to get complete memory graph
- **STEP 1B**: Identify temporary entity types:
  - validation_session entities (from validate-* commands)
  - extraction entities (from extract-* commands)
  - current_solution_extraction, current_project_extraction (old terminology)
  - Project_Validation_* (old validation sessions)
  - Solution_Validation_* (may be stale)

- **STEP 1C**: Identify entities to clean:
  ```
  Stale Entity Criteria:
  1. entityType contains "validation_session" AND iteration > 1
  2. entityType contains "extraction" AND status = "complete"
  3. entityType = "project" (old terminology, should be "solution")
  4. Orphaned relationships (point to deleted entities)
  ```

- **STEP 1D**: Build deletion list
- **STEP 1E**: Display what will be cleaned:
  ```
  ═══════════════════════════════════════════
  MEMORY CLEANUP ANALYSIS
  ═══════════════════════════════════════════

  Entities to Remove:
  - Validation Sessions: {validation_session_count}
  - Extraction Sessions: {extraction_session_count}
  - Old Project Entities: {old_project_count}
  - Orphaned Relationships: {orphaned_relation_count}

  Total Entities: {total_entities_to_delete}
  Total Relationships: {total_relations_to_delete}

  <if ({scope} equals "dry-run")>
  DRY RUN MODE - Nothing will be deleted
  </if>

  ═══════════════════════════════════════════
  ```

## Phase 2: Confirm Deletion

<if ({scope} not equals "dry-run")>
- **STEP 2A**: Ask user for confirmation:
  ```
  Delete {total_entities_to_delete} entities and {total_relations_to_delete} relationships?

  WARNING: This action cannot be undone.

  Type 'yes' to confirm, or 'no' to cancel:
  ```
- **STEP 2B**: Collect user input
- **STEP 2C**:
  <if (user confirms)>
  - Proceed to Phase 3
  <else>
  - Display: "Cleanup cancelled"
  - Exit
  </if>
</if>

## Phase 3: Execute Cleanup

<if ({scope} not equals "dry-run")>
- **STEP 3A**: Delete relationships first:
  - Use mcp__memory__delete_relations to remove orphaned relationships
  - Display progress: "Deleted {current}/{total} relationships"

- **STEP 3B**: Delete entities:
  - Use mcp__memory__delete_entities to remove stale entities in batches
  - Batch size: 10 entities per call
  - Display progress: "Deleted {current}/{total} entities"

- **STEP 3C**: Verify cleanup:
  - Use mcp__memory__read_graph to confirm entities removed
  - Check no orphaned relationships remain

- **STEP 3D**: Display completion summary:
  ```
  ✓ MEMORY CLEANUP COMPLETE

  Removed:
  - {deleted_entities} entities
  - {deleted_relations} relationships

  Remaining Memory Graph:
  - Total Entities: {remaining_entities}
  - Total Relationships: {remaining_relations}

  Memory Health: {health_status}
  ```
</if>

<if ({scope} equals "dry-run")>
- **STEP 3A**: Display dry-run summary:
  ```
  DRY RUN COMPLETE - No changes made

  Would Remove:
  - Entities: {total_entities_to_delete}
  - Relationships: {total_relations_to_delete}

  To execute cleanup:
  /maintenance:cleanup-memory all
  ```
</if>

## Phase 4: Optimize Memory (Optional)

<if (cleanup executed successfully)>
- **STEP 4A**: Suggest optimization:
  ```
  Recommendations:
  - Run cleanup after major refactoring sessions
  - Run cleanup-memory dry-run periodically to check for bloat
  - Keep permanent entities: solution, features, use cases, tasks
  - Remove temporary: validations, extractions

  Next Cleanup: Recommended after {next_recommendation_time}
  ```
</if>

**IMPORTANT NOTES**:
- Removes temporary session entities (validations, extractions)
- Cleans up orphaned relationships
- Preserves permanent entities (solution, features, use cases, tasks, structure)
- Dry-run mode available for safety
- Requires user confirmation before deletion
- Cannot be undone - use dry-run first to verify
- Improves memory graph performance
- Recommended frequency: After major sessions or monthly
