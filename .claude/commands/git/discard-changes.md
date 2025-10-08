---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Discard all uncommitted changes and reset to last commit (with safety warnings)
argument-hint:
---

# Discard Changes Command

Resets all uncommitted changes back to the last commit. Includes comprehensive safety warnings showing exactly what will be lost. Requires explicit user confirmation.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Quick Reference
- **Architecture**: `Documents/Guides/VTTTOOLS_STACK.md`
- **Commands**: `Documents/Guides/COMMON_COMMANDS.md` → Git section

## Process

### Safety Check

- **STEP 1**: Check for uncommitted changes:
  - Use Bash: "git status --porcelain"
  - <if (no changes)>
    - Display: "No uncommitted changes to discard"
    - Exit
  </if>

- **STEP 2**: Identify what will be lost:
  - Use Bash: "git diff --name-status" (modified files)
  - Use Bash: "git ls-files --others --exclude-standard" (untracked files)

### Display Comprehensive Warning

- **STEP 1**: Show detailed impact:
  ```
  WARNING: DISCARD ALL UNCOMMITTED CHANGES

  This will PERMANENTLY DELETE all changes since last commit!

  MODIFIED FILES (will be reset):
  {foreach {file} in {modified_files}}
  - {file} (modified)
  {end}

  NEW FILES (will be deleted):
  {foreach {file} in {untracked_files}}
  - {file} (untracked)
  {end}

  DELETED FILES (will be restored):
  {foreach {file} in {deleted_files}}
  - {file} (deleted)
  {end}

  Last Commit: {commit_sha} - "{commit_message}"
  Branch: {branch_name}

  Total Files Affected: {count}

  THIS ACTION CANNOT BE UNDONE!

  Type 'DISCARD' to confirm (or anything else to cancel): _
  ```

- **STEP 2**: Wait for explicit confirmation
  - Must type exactly "DISCARD" (case-sensitive)
  - Anything else cancels operation

### Discard Changes

<if (user confirms with "DISCARD")>

- **STEP 1**: Reset tracked files:
  - Use Bash: "git reset --hard HEAD"

- **STEP 2**: Remove untracked files:
  - Use Bash: "git clean -fd"

- **STEP 3**: Verify clean state:
  - Use Bash: "git status --porcelain"
  - Should be empty

- **STEP 4**: Display confirmation:
  ```
  CHANGES DISCARDED

  All uncommitted changes have been removed.
  Working directory reset to: {commit_sha}

  Current Status: Clean (no uncommitted changes)
  Branch: {branch_name}

  Next Steps:
  - Review git log to see commit history
  - Continue implementation or try different approach
  ```

</if>

<if (user cancels)>
- Display: "Discard cancelled. No changes were made."
- Exit
</if>

### Update Memory

- **STEP 1**: If use case was in progress, update status:
  - Find relevant implementation entities
  - Set status back to previous state
  - Remove uncommitted file references

## Important Notes
- DESTRUCTIVE operation - cannot be undone
- Requires explicit "DISCARD" confirmation
- Shows exactly what will be lost before confirming
- Resets to last commit (git reset --hard HEAD)
- Removes untracked files (git clean -fd)
- Use when: generated code is wrong, want to start over, abandon current work
- Alternative: /commit-changes then git revert if you want to keep history
