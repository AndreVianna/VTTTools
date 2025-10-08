---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Stage all changes and commit to current branch with conventional commit message
argument-hint: {message:string:optional}
---

# Commit Changes Command

Stages all current changes and commits to current branch. Supports user-provided commit messages or auto-generates conventional commit messages based on changes and specifications.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Quick Reference
- **Architecture**: `Documents/Guides/VTTTOOLS_STACK.md`
- **Commands**: `Documents/Guides/COMMON_COMMANDS.md` → Git section

## Process

### Pre-Commit Validation

- **STEP 1**: Check git status
  - Use Bash: "git status --porcelain"
  - <if (no changes)>
    - Display: "No changes to commit"
    - Exit
  </if>

- **STEP 2**: Verify on a branch (not detached HEAD)
- **STEP 3**: Get current branch name: "git rev-parse --abbrev-ref HEAD"

### Generate Commit Message (If Not Provided)

<if ({message} is empty)>

- **STEP 1**: Analyze changed files:
  - Use Bash: "git diff --name-only --cached" (staged)
  - Use Bash: "git diff --name-only" (unstaged)
  - Determine which area/feature affected

- **STEP 2**: Check memory for recent implementation:
  - What use case was just implemented?
  - What layer was completed?
  - Get spec version

- **STEP 3**: Use Task tool to generate conventional commit message:
  ```markdown
  ROLE: Commit Message Generator

  TASK: Generate conventional commit message from changes

  CHANGED FILES: {file_list}
  RECENT WORK: {from memory - last use case implemented}
  SPECIFICATIONS: {relevant spec references}

  CONVENTIONAL COMMITS FORMAT:
  {type}({scope}): {description}

  [optional body]

  [optional footer]

  TYPES:
  - feat: New feature
  - fix: Bug fix
  - refactor: Code restructuring
  - test: Adding tests
  - docs: Documentation
  - style: Formatting
  - chore: Maintenance

  SCOPES: {area-name} or domain-{area} or {feature-name}

  EXAMPLES:
  - feat(domain-assets): implement asset entity with validation
  - feat(assets): implement create asset use case
  - test(auth): add login service unit tests
  - fix(assets): handle null asset name validation

  Based on changed files, generate appropriate commit message.
  Reference specifications in commit body.

  OUTPUT: Complete conventional commit message.
  ```

- **STEP 4**: Display generated message to user:
  ```
  Generated commit message:
  {commit_message}

  {commit_body}

  Use this message? [Y/N/Edit]
  ```

  <if (user says Edit)>
  - Prompt for custom message
  </if>

</if>

### Stage and Commit

- **STEP 1**: Stage all changes:
  - Use Bash: "git add ."

- **STEP 2**: Create commit:
  - Use Bash: git commit -m "{message}"

- **STEP 3**: Capture commit SHA:
  - Use Bash: "git rev-parse HEAD"

### Update STATUS Files & Memory

- **STEP 1**: Update STATUS.md files with commit SHA:
  - Parse commit message for scope (domain-{area}, {area}, feat({area}), etc.)
  - Determine which STATUS files affected:
    - If "domain-": Update DOMAIN_STATUS.md
    - If specific use case mentioned: Update USECASE_STATUS.md
    - Always: Update PROJECT_STATUS.md recent activity
  - For each affected STATUS file:
    - Add commit SHA to commits list
    - Update last_updated timestamp
    - If commit completes a roadmap item, check it off

- **STEP 2**: Update memory:
  - Update relevant implementation entity with commit SHA
  - Update last_commit_date

### Reporting

- **STEP 1**: Display commit confirmation:
  ```
  CHANGES COMMITTED

  Branch: {branch_name}
  Commit: {commit_sha}
  Message: {commit_message}

  Files Committed: {count}
  {file_list}

  Next Steps:
  - Continue implementing: /implement-use-case {next}
  - Review commits: git log
  - Create PR when feature complete: /create-pr
  ```

## Important Notes
- Stages ALL current changes (git add .)
- Supports user message or auto-generates conventional commits
- Links commits to specifications in memory
- Essential step after /implement-use-case completion
- User controls commit timing (INTERACTIVE mode)
