---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Run unit tests for specified scope with coverage reporting
argument-hint: {scope:string} {name:string:optional}
---

# Test Unit Command

Runs unit tests for specified scope (feature, use-case, module, plugin, project, or class) and reports pass/fail status, coverage metrics, and failure details. Updates memory with test results.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Phase 0: Scope Determination

- **STEP 0A**: Parse {scope} and {name} parameters:
  <case {scope}>
  <is "feature">
    - Find all test files for feature: {name}
    - Pattern: "Source/*/Tests/**/*{name}*Tests.*"
  <is "use-case">
    - Find test files for use case: {name}
    - Pattern: "Source/*/Tests/**/*{name}*Tests.*"
  <is "module" or "plugin">
    - Framework-specific (e.g., dotnet test {name}.csproj or npm test {name})
    - Identify project structure
  <is "project">
    - Run all tests in solution/workspace
    - dotnet test OR npm test (depending on project type)
  <is "class">
    - Run tests for specific class: {name}Tests
    - Find and run that specific test file
  <otherwise>
    - Error: "Invalid scope. Use: feature, use-case, module, plugin, project, or class"
  </case>

## Phase 1: Run Tests

- **STEP 1A**: Determine test command based on project:
  <if (C# project)>
  - Use Bash: "dotnet test {scope_path} --logger 'console;verbosity=detailed'"
  </if>
  <if (TypeScript project)>
  - Use Bash: "npm test {scope_pattern}"
  </if>

- **STEP 1B**: Execute tests and capture output
- **STEP 1C**: Parse test results:
  - Total tests
  - Passing tests
  - Failing tests
  - Test execution time
  - Coverage percentage (if available)

## Phase 2: Analyze Failures (If Any)

<if (failures exist)>
- **STEP 2A**: Parse failure details:
  - Test name
  - Failure message
  - Stack trace
  - Expected vs actual

- **STEP 2B**: Categorize failures:
  - Assertion failures
  - Exceptions
  - Timeouts
  - Setup/teardown issues
</if>

## Phase 3: Display Results

- **STEP 3A**: Format and display test report:
  ```
  ═══════════════════════════════════════════
  UNIT TEST RESULTS
  ═══════════════════════════════════════════

  Scope: {scope} {name}
  Tests Run: {total}
  Duration: {seconds}s

  Results:
  ✅ Passing: {pass}/{total} ({percentage}%)
  ❌ Failing: {fail}/{total}

  Coverage: {coverage}% (Target: {target}%)

  <if (all passing)>
  ═══════════════════════════════════════════
  ✅ ALL TESTS PASSING
  ═══════════════════════════════════════════
  </if>

  <if (failures)>
  ═══════════════════════════════════════════
  ❌ TEST FAILURES
  ═══════════════════════════════════════════

  <foreach {failure} in {failures}>
  ❌ {test_name}
     File: {test_file}:{line}
     Error: {failure_message}
     Expected: {expected}
     Actual: {actual}

  </foreach>

  Recommendation:
  - Fix failing tests before committing
  - Review test logic and implementation
  - Ensure all acceptance criteria met
  </if>

  <if (coverage below target)>
  ⚠️  Coverage below target: {coverage}% < {target}%
  - Add tests for uncovered code paths
  - Focus on: {uncovered_files}
  </if>
  ```

## Phase 4: Update STATUS Files & Memory

- **STEP 4A**: Update STATUS.md files with test results:

  <if (scope is use-case)>
  - Update USECASE_STATUS.md:
    - Test scores: {passing}/{total}
    - Coverage: {percent}%
    - Test grade: {A-F}
    - Check off test roadmap items if passing
  </if>

  <if (scope is feature)>
  - Update FEATURE_STATUS.md:
    - Aggregate test scores from all use cases
    - Update feature test grade
  - Update each USECASE_STATUS.md in feature
  </if>

  <if (scope is module or project)>
  - Update PROJECT_STATUS.md:
    - Overall test coverage
    - Overall test grade
  - Update relevant FEATURE and USECASE STATUS files
  </if>

- **STEP 4B**: Update memory (for fast queries):
  - Update UseCaseImplementation or FeatureImplementation entities
  - Store: timestamp, pass/fail counts, coverage

**IMPORTANT NOTES**:
- Runs UNIT tests only (Phase 2 scope)
- Integration tests are Phase 3
- Flexible scope (feature, use-case, module, class, project)
- Reports coverage against targets from configuration
- Failures block commit (if configured)
- Essential quality gate before /commit-changes