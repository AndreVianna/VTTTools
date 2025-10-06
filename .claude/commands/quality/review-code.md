---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Automated code review for implemented code against standards and best practices
argument-hint: {scope:string}
---

# Review Code Command

Performs automated code review using code-reviewer agent to check coding standards compliance, architecture patterns, security issues (OWASP), performance concerns, and best practices. Provides prioritized feedback for improvement.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Phase 0: Scope Determination

- **STEP 0A**: Parse {scope} parameter:
  - Can be: {use-case-name} | {feature-name} | {area-name} | "recent" (last commit)
  - Use Glob to find relevant files

- **STEP 0B**: Determine what code to review based on scope

## Phase 1: Gather Review Context

- **STEP 1A**: Read coding standards guides:
  - Documents/Guides/CODING_STANDARDS.md (overview)
  - Documents/Guides/CSHARP_STYLE_GUIDE.md (if reviewing C# code)
  - Documents/Guides/TYPESCRIPT_STYLE_GUIDE.md (if reviewing TypeScript code)
  - Documents/Guides/CODE_QUALITY_GUIDE.md (code smells, anti-patterns, security)
- **STEP 1B**: Read specifications for scope (use case, feature, or area specs)
- **STEP 1C**: Use Glob to find all code files in scope
- **STEP 1D**: Use Read to load code files

## Phase 2: Automated Code Review

- **STEP 2A**: Use Task tool with code-reviewer agent:
  ```markdown
  ROLE: Senior Code Reviewer (Automated)

  TASK: Review code for quality, standards compliance, security, and architecture

  SCOPE: {scope}
  CODE_FILES: {file_list}
  CODING_STANDARDS:
    - Documents/Guides/CSHARP_STYLE_GUIDE.md (C# standards)
    - Documents/Guides/TYPESCRIPT_STYLE_GUIDE.md (TypeScript standards)
    - Documents/Guides/CODE_QUALITY_GUIDE.md (code smells, anti-patterns, security)
    - Documents/Guides/ARCHITECTURE_PATTERN.md (architecture compliance)
  SPECIFICATIONS: {relevant_specs}

  REVIEW CRITERIA:

  **1. Coding Standards Compliance**:
  - Naming conventions followed?
  - File organization correct?
  - Comment quality adequate?
  - Formatting consistent?

  **2. Architecture Compliance**:
  - Follows Clean Architecture layers?
  - Domain purity maintained (no infrastructure in domain)?
  - Dependency direction correct (inward only)?
  - Hexagonal port/adapter pattern followed?

  **3. Security (OWASP Top 10)**:
  - SQL injection risks?
  - XSS vulnerabilities?
  - Authentication/authorization proper?
  - Sensitive data handling?
  - Input validation?

  **4. Code Quality**:
  - Complexity reasonable? (cyclomatic complexity < 10)
  - Duplication minimized? (DRY principle)
  - SOLID principles followed?
  - Error handling robust?
  - Null safety?

  **5. Performance**:
  - N+1 query issues?
  - Unnecessary iterations?
  - Proper async/await usage?
  - Resource disposal (using statements)?

  **6. Testing**:
  - Test coverage adequate?
  - Tests actually test behavior?
  - No test smells (hard-coded values, fragile tests)?

  **7. Specification Compliance**:
  - Implements all acceptance criteria?
  - Handles all error scenarios from spec?
  - Follows business rules from domain model?

  For each issue found, provide:
  - SEVERITY: Critical | High | Medium | Low
  - FILE: Exact file and line number
  - ISSUE: What's wrong
  - RECOMMENDATION: How to fix
  - IMPACT: Why it matters

  OUTPUT: Complete review report with prioritized issues.
  ```

- **STEP 2B**: Parse review results
- **STEP 2C**: Categorize issues by severity

## Phase 3: Display Review Results

- **STEP 3A**: Display formatted review:
  ```
  ═══════════════════════════════════════════
  CODE REVIEW: {scope}
  ═══════════════════════════════════════════

  Files Reviewed: {count}
  Issues Found: {total} ({critical}C + {high}H + {medium}M + {low}L)

  Overall Status: {APPROVED ✅ | CHANGES_REQUESTED ⚠️ | BLOCKED ❌}

  🔴 CRITICAL ({count}) - Must Fix
  ─────────────────────────────────────────
  1. [LoginService.cs:45] SQL Injection Risk
     Issue: User input concatenated into query
     Fix: Use parameterized queries
     Impact: Security vulnerability

  2. [AssetRepository.cs:23] Missing Null Check
     Issue: Potential NullReferenceException
     Fix: Add null coalescing or guard clause
     Impact: Runtime crash possible

  🟡 HIGH ({count}) - Should Fix
  ─────────────────────────────────────────
  3. [CreateAssetService.cs:67] High Complexity
     Issue: Cyclomatic complexity = 15 (threshold: 10)
     Fix: Extract methods, simplify logic
     Impact: Maintainability, testability

  🟢 MEDIUM ({count}) - Consider Fixing
  ─────────────────────────────────────────
  {issues}

  🔵 LOW ({count}) - Optional Improvements
  ─────────────────────────────────────────
  {issues}

  ═══════════════════════════════════════════

  Recommendation:
  <if (critical issues)>
  ❌ DO NOT COMMIT - Fix critical issues first
  </if>
  <if (high issues only)>
  ⚠️ REVIEW RECOMMENDED - Consider fixing high issues before commit
  </if>
  <if (medium/low only)>
  ✅ APPROVED - Safe to commit, address other issues as time allows
  </if>
  ```

## Phase 4: Update STATUS Files & Memory

- **STEP 4A**: Update STATUS.md files with review results:

  <if (scope is use-case)>
  - Update USECASE_STATUS.md:
    - Code quality score: {score}/100
    - Quality grade: {A-F}
    - Issues found: {critical}, {high}, {medium}, {low}
    - Review status: APPROVED | CHANGES_REQUESTED
    - Update roadmap with issues to fix
  </if>

  <if (scope is feature)>
  - Update FEATURE_STATUS.md:
    - Aggregate quality scores
    - List critical/high issues per use case
  </if>

- **STEP 4B**: Update memory:
  - Create CodeReview entity
  - Link to implementation entities

**IMPORTANT NOTES**:
- Automated code review using code-reviewer agent
- Checks standards, architecture, security (OWASP), performance
- Prioritizes issues by severity
- Run before /commit-changes
- Critical issues block commit (if configured)
- Provides specific fix recommendations with file/line numbers