---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite
description: Stage all changes and commit to current branch with conventional commit message
argument-hint: {message:string:optional}
---

# Commit Changes Command

Stages all current changes and commits to current branch. Supports user-provided commit messages or auto-generates conventional commit messages based on changes and specifications.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Phase 0: Pre-Commit Validation

- **STEP 0A**: Check git status
  - Use Bash: "git status --porcelain"
  - <if (no changes)>
    - Display: "No changes to commit"
    - Exit
  </if>

- **STEP 0B**: Verify on a branch (not detached HEAD)
- **STEP 0C**: Get current branch name: "git rev-parse --abbrev-ref HEAD"

## Phase 1: Generate Commit Message (If Not Provided)

<if ({message} is empty)>

- **STEP 1A**: Analyze changed files:
  - Use Bash: "git diff --name-only --cached" (staged)
  - Use Bash: "git diff --name-only" (unstaged)
  - Determine which area/feature affected

- **STEP 1B**: Check memory for recent implementation:
  - What use case was just implemented?
  - What layer was completed?
  - Get spec version

- **STEP 1C**: Use Task tool to generate conventional commit message:
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

- **STEP 1D**: Display generated message to user:
  ```
  Generated commit message:
  ┌─────────────────────────────────────────┐
  │ {commit_message}                        │
  │                                         │
  │ {commit_body}                           │
  └─────────────────────────────────────────┘

  Use this message? [Y/N/Edit]
  ```

  <if (user says Edit)>
  - Prompt for custom message
  </if>

</if>

## Phase 2: Stage and Commit

- **STEP 2A**: Stage all changes:
  - Use Bash: "git add ."

- **STEP 2B**: Create commit:
  - Use Bash: git commit -m "{message}"

- **STEP 2C**: Capture commit SHA:
  - Use Bash: "git rev-parse HEAD"

## Phase 3: Update STATUS Files & Memory

- **STEP 3A**: Update STATUS.md files with commit SHA:
  - Parse commit message for scope (domain-{area}, {area}, feat({area}), etc.)
  - Determine which STATUS files affected:
    - If "domain-": Update DOMAIN_STATUS.md
    - If specific use case mentioned: Update USE_CASE_STATUS.md
    - Always: Update PROJECT_STATUS.md recent activity
  - For each affected STATUS file:
    - Add commit SHA to commits list
    - Update last_updated timestamp
    - If commit completes a roadmap item, check it off

- **STEP 3B**: Update memory:
  - Update relevant implementation entity with commit SHA
  - Update last_commit_date

## Phase 4: Reporting

- **STEP 4A**: Display commit confirmation:
  ```
  ✓ CHANGES COMMITTED

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

**IMPORTANT NOTES**:
- Stages ALL current changes (git add .)
- Supports user message or auto-generates conventional commits
- Links commits to specifications in memory
- Essential step after /implement-use-case completion
- User controls commit timing (INTERACTIVE mode)