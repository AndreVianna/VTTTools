---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Create pull request from current branch with auto-generated or custom description
argument-hint: {description:string:optional}
---

# Create PR Command

Creates pull request from current branch to parent/main branch. Supports custom descriptions or auto-generates comprehensive PR description from commits, specifications, and implementation status.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Phase 0: Validation

- **STEP 0A**: Verify git repository and GitHub CLI:
  - Check: gh CLI installed
  - <if (not installed)>
    - Error: "GitHub CLI (gh) required. Install: https://cli.github.com"
  </if>

- **STEP 0B**: Check branch status:
  - Current branch name
  - Parent/base branch (usually main or develop)
  - Commits ahead of base
  - <if (no commits ahead)>
    - Error: "No commits to create PR from"
  </if>

- **STEP 0C**: Verify all changes committed:
  - Use Bash: "git status --porcelain"
  - <if (uncommitted changes)>
    - Warning: "Uncommitted changes exist. Commit first? [Y/N]"
    - <if (Y)>
      - Run /commit-changes
    </if>
  </if>

## Phase 1: Generate PR Description (If Not Provided)

<if ({description} is empty)>

- **STEP 1A**: Gather PR context:
  - Use Bash: "git log {base}..HEAD --oneline" (commits in branch)
  - Use Bash: "git diff --name-status {base}..HEAD" (files changed)
  - Query memory for implementation status
  - Find which features/use cases implemented

- **STEP 1B**: Use Task tool to generate PR description:
  ```markdown
  ROLE: Pull Request Description Generator

  TASK: Create comprehensive PR description

  BRANCH: {current_branch}
  COMMITS: {commit_list}
  FILES_CHANGED: {file_list}
  IMPLEMENTATION_STATUS: {from memory - which use cases implemented}

  PR DESCRIPTION STRUCTURE:

  ## Summary
  Brief overview of what this PR implements

  ## Changes
  - Feature: {feature_name}
  - Use Cases Implemented: {list}
  - Specifications: {links to docs}

  ## Implementation Details
  - Domain Layer: {changes}
  - Application Layer: {changes}
  - Infrastructure Layer: {changes}
  - UI Layer: {changes}

  ## Testing
  - Unit Tests: {pass}/{total} passing
  - Coverage: {percent}%
  - All tests passing: {yes/no}

  ## Code Review
  - Automated Review: {status}
  - Issues: {count} (Critical: X, High: Y)

  ## Checklist
  - [ ] All use cases implemented
  - [ ] Unit tests passing
  - [ ] Code reviewed
  - [ ] Documentation updated
  - [ ] No breaking changes

  ## Related
  - Specifications: Documents/Areas/{area}/Features/{feature}
  - BDD Scenarios: {bdd_files}

  Based on commits and implementation status, generate professional PR description.
  ```

- **STEP 1C**: Display generated description:
  ```
  Generated PR Description:
  ┌─────────────────────────────────────────┐
  │ {pr_description}                        │
  └─────────────────────────────────────────┘

  Use this description? [Y/N/Edit]
  ```

</if>

## Phase 2: Create Pull Request

- **STEP 2A**: Push current branch to remote (if not pushed):
  - Use Bash: "git push origin {branch} -u"

- **STEP 2B**: Create PR using GitHub CLI:
  - Use Bash: gh pr create --title "{pr_title}" --body "{pr_description}" --base {base_branch}

- **STEP 2C**: Capture PR URL from output

## Phase 3: Update Memory

- **STEP 3A**: Store PR information:
  - Update feature/area implementation entity
  - Add: pr_url, pr_number, pr_created_date

## Phase 4: Reporting

- **STEP 4A**: Display PR details:
  ```
  ✓ PULL REQUEST CREATED

  PR #: {pr_number}
  URL: {pr_url}
  From: {current_branch}
  To: {base_branch}
  Commits: {count}

  PR includes:
  - Features: {feature_list}
  - Use Cases: {use_case_list}
  - Files Changed: {count}
  - Tests: {passing}/{total}

  Next Steps:
  - Review PR at: {pr_url}
  - Wait for CI/CD checks
  - Request reviews if needed
  - Merge when approved
  ```

**IMPORTANT NOTES**:
- Creates PR from current branch to parent/main
- Auto-generates description from commits and specs if not provided
- Includes implementation summary and test results
- Links to specifications and BDD files
- Requires GitHub CLI (gh) installed
- User reviews and merges PR via GitHub interface
- Final step after feature implementation complete