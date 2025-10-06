---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Assess existing code implementation status, quality, and specification compliance
argument-hint: {scope:string:optional(all)}
---

# Assess Implementation Command

Analyzes existing codebase to discover which use cases are implemented, runs tests, evaluates code quality, and assesses specification compliance. Provides actionable recommendations (KEEP, ENHANCE, REFACTOR, COMPLETE, IMPLEMENT) for each use case.

**Platform**: Cross-platform (Windows/Linux/macOS)
**Critical for**: Brownfield projects before Phase 2 implementation

## Phase 0: Scope & Prerequisites

- **STEP 0A**: Parse {scope} parameter:
  <case {scope}>
  <is empty or "all">
    - Set {assessment_scope} = "all_use_cases"
    - Use Glob: "Documents/Areas/*/Features/*/UseCases/*.md"
  <is area name>
    - Find all use cases in area
  <is feature name>
    - Find all use cases in feature
  <is use case name>
    - Single use case assessment
  </case>

- **STEP 0B**: Verify prerequisites:
  - Project specification exists
  - Use case specifications exist
  - Source/ directory exists (brownfield requirement)

## Phase 1: Discover Existing Implementations

<foreach {use_case} in {use_cases_to_assess}>

- **STEP 1A**: Read use case specification
- **STEP 1B**: Extract implementation identifiers:
  - primary_port_method (e.g., "CreateAssetAsync")
  - application_service_name (e.g., "AssetService")
  - Owning area
  - UI type

- **STEP 1C**: Search for implementation files:

  **Method 1 - Signature Matching** (most reliable):
  - Use Grep to find primary_port_method in Source/
  - Example: Search for "CreateAssetAsync" signature
  - Files containing this method are implementations

  **Method 2 - Class Name Matching** (fallback):
  - Search for {UseCaseName}Service.cs pattern
  - Search for {Entity}Controller.cs pattern
  - Search for {UseCaseName}Page.tsx pattern (if FULL_PAGE)

  **Method 3 - Traceability Comments** (if exist):
  - Search for "USE_CASE: {use_case_name}" in comments
  - Direct link from code to spec

- **STEP 1D**: Categorize found files by layer:
  - Domain: Entity records, value objects, interfaces
  - Application: Service implementations
  - Infrastructure: Repositories, controllers, endpoints
  - UI: React components (pages, forms, widgets, etc.)

- **STEP 1E**: Determine implementation status:
  <if (all layers found)>
    - Status: FULLY_IMPLEMENTED
  <else if (some layers found)>
    - Status: PARTIALLY_IMPLEMENTED
    - Missing layers: {list}
  <else>
    - Status: NOT_IMPLEMENTED
  </if>

</foreach>

## Phase 2: Discover and Run Tests

<foreach {use_case} in {implemented_use_cases}>

- **STEP 2A**: Search for test files:
  - Pattern: *{ServiceName}Tests.cs, *{ControllerName}Tests.cs
  - Pattern: *.test.tsx, *.test.ts
  - Map test files to implementation files

- **STEP 2B**: Run unit tests for use case:
  - C#: `dotnet test --filter "FullyQualifiedName~{ServiceName}" --collect:"XPlat Code Coverage"`
  - TypeScript: `npm test -- --testNamePattern="{ComponentName}"`

- **STEP 2C**: Parse test results:
  - Tests passing: count
  - Tests failing: count
  - Coverage percentage
  - Failure details (if any)

- **STEP 2D**: Categorize test status:
  <if (no test files found)>
    - Status: NO_TESTS
  <else if (all tests passing and coverage >= 80%)>
    - Status: PASSING_GOOD_COVERAGE
  <else if (all tests passing but coverage < 80%)>
    - Status: PASSING_LOW_COVERAGE
  <else if (some tests failing)>
    - Status: FAILING
  </if>

</foreach>

## Phase 3: Analyze Code Quality

<foreach {use_case} in {implemented_use_cases}>

- **STEP 3A**: Run automated code review on implementation files:
  - Use /review-code for this use case
  - Or use Task tool with code-reviewer agent directly

- **STEP 3B**: Check:
  - Coding standards compliance
  - Cyclomatic complexity
  - Security issues (OWASP)
  - Architecture violations
  - Code smells

- **STEP 3C**: Calculate quality score (0-100):
  - 100 = perfect, no issues
  - 80-99 = good, minor issues
  - 60-79 = acceptable, some concerns
  - <60 = needs work, significant issues

</foreach>

## Phase 4: Assess Specification Compliance

<foreach {use_case} in {implemented_use_cases}>

- **STEP 4A**: Use Task tool with code-reviewer agent:
  ```markdown
  ROLE: Specification Compliance Auditor

  TASK: Compare implementation to use case specification

  USE_CASE_SPEC: {spec_content}
  IMPLEMENTATION_FILES: {code_files}

  CHECK:

  **Acceptance Criteria Coverage**:
  - Read all ACs from spec (AC-01, AC-02, etc.)
  - For each AC, check if code implements it
  - Score: {implemented_acs}/{total_acs}

  **Error Scenario Coverage**:
  - Read all error scenarios from spec (ES-01, ES-02, etc.)
  - Check if code handles each scenario
  - Score: {handled_scenarios}/{total_scenarios}

  **Invariant Enforcement**:
  - Read invariants from domain model (INV-01, INV-02, etc.)
  - Check if service validates these
  - Score: {enforced_invariants}/{total_invariants}

  **Business Rule Implementation**:
  - Read business rules from spec (BR-01, BR-02, etc.)
  - Check if code implements these
  - Score: {implemented_rules}/{total_rules}

  OUTPUT:
  - compliance_score: 0-100 (weighted average)
  - missing_acs: [list]
  - missing_error_scenarios: [list]
  - missing_invariants: [list]
  - missing_business_rules: [list]
  ```

- **STEP 4B**: Store compliance results

</foreach>

## Phase 5: Generate Recommendations

<foreach {use_case} in {all_use_cases}>

- **STEP 5A**: Determine recommendation based on status, quality, compliance:

  ```
  IF status = NOT_IMPLEMENTED:
    recommendation = IMPLEMENT
    action = "Run /implement-use-case {name}"

  ELSE IF status = PARTIALLY_IMPLEMENTED:
    recommendation = COMPLETE
    action = "Run /implement-use-case {name} --complete-existing"

  ELSE IF status = FULLY_IMPLEMENTED:
    IF quality >= 80 AND compliance >= 80:
      recommendation = KEEP_AS_IS
      action = "No changes needed, document linkage"

    ELSE IF compliance >= 70 AND compliance < 80:
      recommendation = ENHANCE
      action = "Add missing: {missing_acs}, {missing_error_scenarios}"
      specific = List what needs to be added

    ELSE IF quality < 80 OR compliance < 70:
      recommendation = REFACTOR
      action = "Consider: Regenerate with /implement-use-case OR manual refactor"
      issues = List quality and compliance issues
  ```

</foreach>

## Phase 6: Generate STATUS Files (Persistent Tracking)

<critical>
**CRITICAL REQUIREMENT**: This phase MUST properly populate all STATUS files with real assessment data collected in Phases 1-5. DO NOT create placeholder or stub files. Each STATUS file must contain:
- Real implementation status (FULLY_IMPLEMENTED/PARTIALLY_IMPLEMENTED/NOT_IMPLEMENTED)
- Actual discovered file paths from Phase 1
- Real test results from Phase 2
- Actual quality scores from Phase 3
- Real compliance data from Phase 4
- Specific recommendations from Phase 5

If context is insufficient to populate all files, STOP and process in batches of 10-15 files at a time.
</critical>

- **STEP 6A**: Store all assessment data in memory FIRST (MANDATORY):

  <critical>
  This step is MANDATORY and must be completed BEFORE generating any STATUS files. Memory storage ensures data persistence and enables batch processing.
  </critical>

  <foreach {use_case} in {assessed_use_cases}>
  - Create memory entity: "UseCase: {use_case_name}"
    - entityType: "use_case_assessment"
    - observations:
      - "implementation_status: {FULLY_IMPLEMENTED|PARTIALLY_IMPLEMENTED|NOT_IMPLEMENTED}"
      - "domain_files: {list_of_entity_vo_interface_files}"
      - "application_files: {list_of_service_files}"
      - "infrastructure_files: {list_of_handler_endpoint_files}"
      - "ui_files: {list_of_component_files}"
      - "test_files: {list_of_test_files}"
      - "test_status: {NO_TESTS|PASSING_GOOD_COVERAGE|PASSING_LOW_COVERAGE|FAILING}"
      - "tests_passing: {count}/{total}"
      - "coverage_percent: {percent}%"
      - "quality_score: {score}/100"
      - "compliance_score: {score}/100"
      - "acs_implemented: {count}/{total}"
      - "error_scenarios_handled: {count}/{total}"
      - "invariants_enforced: {count}/{total}"
      - "business_rules_implemented: {count}/{total}"
      - "recommendation: {KEEP_AS_IS|ENHANCE|REFACTOR|COMPLETE|IMPLEMENT}"
      - "missing_acs: {list}"
      - "missing_error_scenarios: {list}"
      - "quality_issues: {list}"
      - "area: {area_name}"
      - "feature: {feature_name}"
      - "ui_type: {ui_type}"
  - Create relation: "{use_case_name}" -> "belongs_to_feature" -> "{feature_name}"
  - Create relation: "{use_case_name}" -> "belongs_to_area" -> "{area_name}"
  </foreach>

  <foreach {feature} in {features}>
  - Create memory entity: "Feature: {feature_name}"
    - entityType: "feature_assessment"
    - observations:
      - "area: {area_name}"
      - "use_case_count: {total}"
      - "fully_implemented: {count}"
      - "partially_implemented: {count}"
      - "not_implemented: {count}"
      - "tests_complete: {count}"
      - "tests_missing: {count}"
      - "average_quality: {score}/100"
  </foreach>

  <foreach {area} in {areas}>
  - Create memory entity: "Area: {area_name}"
    - entityType: "area_assessment"
    - observations:
      - "feature_count: {total}"
      - "use_case_count: {total}"
      - "entities: {list}"
      - "value_objects: {list}"
      - "service_interfaces: {list}"
      - "domain_contracts_exist: {true|false}"
      - "domain_tests_exist: {true|false}"
  </foreach>

  **Verification**: Confirm all assessment data stored in memory before proceeding to file generation.

- **STEP 6B**: Load STATUS templates:
  - Read: .claude/templates/PROJECT_STATUS_TEMPLATE.md
  - Read: .claude/templates/DOMAIN_STATUS_TEMPLATE.md
  - Read: .claude/templates/FEATURE_STATUS_TEMPLATE.md
  - Read: .claude/templates/USECASE_STATUS_TEMPLATE.md

- **STEP 6C**: Create PROJECT_STATUS.md:
  - Retrieve aggregate data from memory entities
  - Apply DSL variable substitution with real data
  - Populate Section 1: Scores from all areas/features/use cases
    - Total use cases, by status (FULLY/PARTIAL/NOT)
    - Average quality and compliance scores
    - Test coverage percentage
  - Populate Section 2: Roadmap with Phase 1 ✅, Phase 2 status, Phase 3 🔜
  - Write to: Documents/PROJECT_STATUS.md
  - Verify: File is 100+ lines with real data, not stub

- **STEP 6D**: For each area, create DOMAIN_STATUS.md:
  - Retrieve area entity from memory
  - Apply template variables (area name, entities, VOs, interfaces)
  - Section 1: Implementation status (existing vs not), test status, quality scores
    - Real entity/VO/interface file names from assessment
    - Real test file status
  - Section 2: Roadmap for domain contract generation
  - Write to: Documents/Areas/{area}/DOMAIN_STATUS.md
  - Verify: File contains real file names, not placeholders

- **STEP 6E**: For each feature, create FEATURE_STATUS.md:
  - Retrieve feature entity and all use case entities for this feature from memory
  - Apply template with real feature data
  - Section 1: Use case implementation matrix with real grades
    - Table: Use Case | Impl Status | Test Status | Quality | Grade
    - Real status for each use case (not ✅/🔨/❌ placeholders)
  - Section 2: Feature roadmap with specific next actions
  - Write to: Documents/Areas/{area}/Features/{feature}_STATUS.md
  - Verify: File is 50-75 lines with complete use case matrix

- **STEP 6F**: For each use case, create USECASE_STATUS.md:

  <critical>
  This is the most critical step. Each file MUST be 150-200 lines with complete assessment data.
  If context is insufficient, STOP and inform user to batch process.
  </critical>

  - Retrieve use case assessment entity from memory
  - Apply template with ALL assessment data fields
  - Section 1: Layer-by-layer scores with REAL file names
    - Domain: List actual entity/VO/interface files (e.g., "Asset.cs", "IAssetService.cs")
    - Application: List actual service files (e.g., "AssetService.cs")
    - Infrastructure: List actual handler/endpoint files (e.g., "AssetHandlers.cs", "AssetEndpoints.cs")
    - UI: List actual component files (e.g., "CreateAssetPage.tsx") or N/A
    - Test files: List actual test files or "NO_TESTS"
    - Quality score: Real score from Phase 3 (e.g., "87/100")
    - Compliance score: Real score from Phase 4 (e.g., "75/100")
    - ACs implemented: Real count (e.g., "5/6")
    - Error scenarios: Real count (e.g., "3/4")
  - Section 2: Detailed roadmap with SPECIFIC checkboxes
    - Missing ACs: List by name (e.g., "AC-03: Duplicate name validation")
    - Missing error scenarios: List by name (e.g., "ES-02: Invalid file type")
    - Quality issues: List specific issues from Phase 3
  - Assessment Data section: POPULATE ALL FIELDS
    - recommendation: KEEP_AS_IS|ENHANCE|REFACTOR|COMPLETE|IMPLEMENT
    - Specific missing items from Phase 4
    - Specific quality issues from Phase 3
  - Next Action: Based on recommendation, provide SPECIFIC command
  - Write to: Documents/Areas/{area}/Features/{feature}/UseCases/{use_case}_STATUS.md
  - Verify: File is 150+ lines with all real data, NOT a 20-line stub

- **STEP 6G**: Generate summary report:
  - Aggregate all data from memory entities
  - Write to: Documents/IMPLEMENTATION_ASSESSMENT.md (comprehensive report)
  - Include: Full assessment details, all discovered files, all recommendations
  - Display to console

- **STEP 6E**: Display summary:
  ```
  ═══════════════════════════════════════════
  ✓ IMPLEMENTATION ASSESSMENT COMPLETE
  ═══════════════════════════════════════════

  Use Cases Assessed: 58

  Status:
  - ✅ Keep As-Is: 12 (already good quality)
  - 💡 Enhance: 4 (add missing features)
  - 🔧 Refactor: 2 (quality issues)
  - 🔨 Complete: 5 (partial implementations)
  - ⚙️  Implement: 35 (not yet implemented)

  Implementation Priority:
  1. IMPLEMENT (35 use cases) - Fresh implementations needed
  2. COMPLETE (5 use cases) - Finish what's started
  3. ENHANCE (4 use cases) - Add missing ACs/error scenarios
  4. REFACTOR (2 use cases) - Quality improvements
  5. KEEP (12 use cases) - No action needed

  Report: Documents/IMPLEMENTATION_ASSESSMENT.md

  Next Steps:
  - Review assessment report for details
  - Run /solution-status to see updated implementation status
  - Begin with IMPLEMENT recommendations: /implement-use-case {name}
  - Or start with high-value COMPLETE/ENHANCE items
  ```

## Command Location

**Folder**: `.claude/commands/assessment/`
**File**: `assess-implementation.md`

## Updated Phase 2 Workflow Documentation

Update IMPLEMENTATION_GUIDE.md to include:

**Brownfield Preparation**:
```
1. /extract-coding-standards
2. /assess-implementation "all" ← Critical brownfield step
3. Review assessment report
4. /configure-implementation
5. Prioritize based on recommendations
```

## Summary

Creates comprehensive brownfield assessment capability that:
- ✅ Discovers existing implementations
- ✅ Runs and evaluates existing tests
- ✅ Analyzes code quality
- ✅ Assesses spec compliance
- ✅ Provides actionable recommendations
- ✅ Updates memory for other commands to use
- ✅ Prevents unnecessary regeneration of good code
- ✅ Focuses effort on gaps and quality issues

**Estimated effort to create command**: 2-3 hours
**Value for brownfield projects**: Critical - saves weeks of work by not regenerating existing good code