---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Assess existing code implementation status, quality, and specification compliance
argument-hint: {scope:string:optional(all)}
---

# Assess Implementation

Analyzes existing codebase to discover implemented use cases, runs tests, evaluates quality, and assesses specification compliance. Provides actionable recommendations (KEEP, ENHANCE, REFACTOR, COMPLETE, IMPLEMENT).

**Platform**: Cross-platform | **Critical for**: Brownfield projects before Phase 2

## Prerequisites & Scope

<case {scope}>
<is empty or "all">
  - {assessment_scope} = "all_use_cases"
  - Use Glob: "Documents/Areas/*/Features/*/UseCases/*.md"
<is area name>
  - Find all use cases in area
<is feature name>
  - Find all use cases in feature
<is use case name>
  - Single use case assessment
</case>

**Verify**:
- Project specification exists
- Use case specifications exist
- Source/ directory exists

## Section 1: Discover Implementations

<foreach {use_case} in {use_cases_to_assess}>

**1.1 Extract from Spec**: primary_port_method, service_name, area, ui_type

**1.2 Search Files** (3 methods):
1. Signature: Grep primary_port_method in Source/
2. Class name: `{UseCaseName}Service.cs`, `{Entity}Controller.cs`, `{Name}Page.tsx`
3. Traceability: "USE_CASE: {use_case_name}" comments

**1.3 Categorize** (see @Documents/Guides/VTTTOOLS_STACK.md):
- Domain: Entities, VOs, interfaces | Application: Services
- Infrastructure: Repositories, handlers, endpoints | UI: React components

**1.4 Status**:
- All layers = FULLY_IMPLEMENTED
- Some layers = PARTIALLY_IMPLEMENTED (missing: {list})
- No layers = NOT_IMPLEMENTED

</foreach>

## Section 2: Test Discovery & Execution

<foreach {use_case} in {implemented_use_cases}>

**2.1 Find**: `*{ServiceName}Tests.cs`, `*.test.tsx`

**2.2 Run** (see @Documents/Guides/TESTING_GUIDE.md):
- C#: `dotnet test --filter "FullyQualifiedName~{ServiceName}" --collect:"XPlat Code Coverage"`
- TypeScript: `npm test -- --testNamePattern="{ComponentName}"`

**2.3 Parse**: Pass/fail count, coverage %, failure details

**2.4 Status**:
- No tests = NO_TESTS | All pass, >=80% = PASSING_GOOD_COVERAGE
- All pass, <80% = PASSING_LOW_COVERAGE | Some fail = FAILING

</foreach>

## Section 3: Quality & Compliance

<foreach {use_case} in {implemented_use_cases}>

**3.1 Quality** (use /review-code or Task with code-reviewer):
- Check: Standards (@Documents/Guides/CODING_STANDARDS.md), complexity, OWASP, architecture, smells
- Score: 0-100 (100=perfect, 80-99=good, 60-79=acceptable, <60=needs work)

**3.2 Compliance** (Task with code-reviewer):
```markdown
ROLE: Compliance Auditor | TASK: Compare to spec
USE_CASE_SPEC: {spec_content} | FILES: {code_files}
CHECK: ACs {impl}/{total}, Scenarios {handled}/{total}, Invariants {enforced}/{total}, Rules {impl}/{total}
OUTPUT: compliance_score (0-100), missing_acs, missing_scenarios, missing_invariants, missing_rules
```

</foreach>

## Section 4: Generate Recommendations & Persist

**4.1 Recommendation Logic**:
- NOT_IMPLEMENTED → IMPLEMENT: `/implement-use-case {name}`
- PARTIALLY_IMPLEMENTED → COMPLETE: `/implement-use-case {name} --complete-existing`
- FULLY_IMPLEMENTED:
  - quality>=80 & compliance>=80 → KEEP_AS_IS: Document linkage
  - compliance>=70 & <80 → ENHANCE: Add missing ACs/scenarios
  - Otherwise → REFACTOR: Regenerate or manual refactor

**4.2 Store in Memory** (MANDATORY - enables batch processing):

<critical>Store ALL data BEFORE generating STATUS files.</critical>

<foreach {use_case} in {assessed_use_cases}>
Create entity "UseCase: {use_case_name}" (type: use_case_assessment) with observations:
implementation_status, domain/application/infrastructure/ui/test_files, test_status, tests_passing, coverage_percent, quality_score, compliance_score, acs_implemented, error_scenarios_handled, invariants_enforced, business_rules_implemented, recommendation, missing_acs, missing_scenarios, quality_issues, area, feature, ui_type
Create relations: belongs_to_feature, belongs_to_area
</foreach>

<foreach {feature} in {features}>
Create entity "Feature: {feature_name}" (type: feature_assessment) with:
area, use_case_count, fully/partially/not_implemented counts, tests_complete, tests_missing, average_quality
</foreach>

<foreach {area} in {areas}>
Create entity "Area: {area_name}" (type: area_assessment) with:
feature/use_case counts, entities, VOs, service_interfaces, domain_contracts_exist, domain_tests_exist
</foreach>

**4.3 Generate STATUS Files**:

<critical>REAL data only, NOT placeholders. Batch 10-15 if insufficient context.</critical>

Load templates from `.claude/templates/*_STATUS_TEMPLATE.md`

- **PROJECT_STATUS.md** (Documents/): Aggregate scores (total use cases, status, averages, coverage), roadmap (Phase 1-3). Verify: 100+ lines
- **DOMAIN_STATUS.md** (Documents/Areas/{area}/): Area entity, implementation status (entities/VOs/interfaces with REAL file names), tests, quality. Verify: Real file names
- **FEATURE_STATUS.md** (Documents/Areas/{area}/Features/{feature}_STATUS.md): Feature + use case entities, matrix (Use Case | Impl | Test | Quality | Grade), roadmap. Verify: 50-75 lines
- **USECASE_STATUS.md** (Documents/Areas/{area}/Features/{feature}/UseCases/{use_case}_STATUS.md):
  - Layer scores with REAL file names (e.g., "Asset.cs", "AssetService.cs", "AssetHandlers.cs", "CreateAssetPage.tsx" or "N/A")
  - Quality/compliance scores, ACs/scenarios implemented
  - Roadmap with SPECIFIC missing items by name (e.g., "AC-03: Duplicate validation", "ES-02: Invalid file type")
  - Assessment data, recommendation, next action command
  - Verify: 150+ lines, NOT stub

**4.4 Summary Report**: Write Documents/IMPLEMENTATION_ASSESSMENT.md (aggregate from memory, all details/files/recommendations)

**4.5 Display**:
```
## ASSESSMENT COMPLETE - {total} Use Cases
───────────────────────────────────────
Status: ✅ KEEP {count} | 💡 ENHANCE {count} | 🔧 REFACTOR {count} | 🔨 COMPLETE {count} | ⚙️ IMPLEMENT {count}

Priority: 1.IMPLEMENT 2.COMPLETE 3.ENHANCE 4.REFACTOR 5.KEEP

Report: Documents/IMPLEMENTATION_ASSESSMENT.md
Next: /solution-status, then /implement-use-case {name}
```

## Brownfield Workflow

Update @Documents/Guides/IMPLEMENTATION_GUIDE.md:
1. /extract-coding-standards
2. /assess-implementation "all"
3. Review report
4. /configure-implementation
5. Prioritize by recommendations
