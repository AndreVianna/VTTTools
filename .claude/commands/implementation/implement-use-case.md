---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Implement use case as vertical slice (Application + Infrastructure + UI) with unit tests
argument-hint: {use_case_name:string}
---

# Implement Use Case Command

Generates complete vertical slice implementation for a use case including Application layer service, Infrastructure layer adapters/controllers, UI layer components (if applicable), and comprehensive unit tests for each layer. Validates with tests before allowing commit.

**Reference**: See Documents/Guides/IMPLEMENTATION_GUIDE.md for detailed workflow
**Stack**: See Documents/Guides/VTTTOOLS_STACK.md for DDD pattern and conventions
**Examples**: See Documents/Guides/CODE_EXAMPLES.md for code patterns

## Prerequisites & Validation

- **STEP 0A**: Validate {use_case_name} is not empty
- **STEP 0B**: Use Glob to find: "Documents/Areas/*/Features/*/UseCases/{use_case_name}.md"
  <if (not found)>
  - Error with available use cases, abort
  </if>

- **STEP 0C**: Verify prerequisites exist:
  - Use case specification
  - DOMAIN_MODEL.md for owning area
  - Documents/Guides/CODING_STANDARDS.md
  - ImplementationConfig in memory
  - Domain layer implemented (DomainImpl_{area} entity)

- **STEP 0D**: Check implementation status:
  - Search memory for "Impl_{use_case_name}"
  <if (exists)>
  - Display status, ask: "Regenerate? [Y/N]"
  </if>

- **STEP 0E**: Check for roadmap (optional):
  - Look for: UseCases/{use_case_name}/ROADMAP.md
  <if (roadmap found)>
    - Read roadmap, extract layer sequence
    - Validate if score < 80
  <else>
    - Use default sequence: Domain→Application→Infrastructure→UI
  </if>

## Load Context

- **STEP 1A**: Read specifications:
  - Use case specification (full content)
  - Domain model for area
  - BDD scenarios

- **STEP 1B**: Read guides:
  - Documents/Guides/CODING_STANDARDS.md
  - Documents/Guides/CSHARP_STYLE_GUIDE.md
  - Documents/Guides/TYPESCRIPT_STYLE_GUIDE.md (if UI required)
  - Documents/Guides/VTTTOOLS_STACK.md
  - Documents/Guides/CODE_EXAMPLES.md

- **STEP 1C**: Load implementation configuration from memory

- **STEP 1D**: Extract key information:
  - Owning area
  - UI type (NO_UI, API_ENDPOINT, FULL_PAGE, FORM, WIDGET, etc.)
  - Input/output specifications
  - Business rules (BR-XX)
  - Error scenarios (4+ required)
  - Acceptance criteria (3+ required)
  - Invariants from domain model (INV-XX)

## Generate Application Layer

- **STEP 2A**: Use Task tool with solution-engineer agent:
  ```markdown
  ROLE: Application Service Implementation Specialist

  TASK: Generate application service with ALL business logic for "{use_case_name}"

  CONTEXT:
  - USE_CASE_SPEC: {use_case_spec_content}
  - DOMAIN_MODEL: {domain_model_content}

  REFERENCE:
  - ARCHITECTURE: Documents/Guides/VTTTOOLS_STACK.md (DDD Contracts pattern)
  - CODING_STANDARDS: Documents/Guides/CODING_STANDARDS.md
  - EXAMPLES: Documents/Guides/CODE_EXAMPLES.md (Service Implementation section)

  TARGET: Source/{area}/Services/{UseCase}Service.cs

  REQUIREMENTS:
  1. Implement I{Entity}Service interface from Domain project
  2. Use primary constructor for dependency injection
  3. **ALL business logic goes in service** (anemic domain models)
  4. Validate ALL invariants (INV-XX) from domain model
  5. Enforce ALL business rules (BR-XX) from spec
  6. Handle ALL error scenarios (ES-XX) from spec
  7. Return TypedResult<HttpStatusCode, Entity>
  8. Follow orchestration: Load → Validate → Create/Modify → Persist

  TRACEABILITY:
  - Add generation comment with date, spec path, use case name
  - Reference AC-XX, BR-XX, ES-XX in code comments
  - Document layer as: Application (Service Implementation)

  Follow coding standards exactly. Output complete service implementation.
  ```

- **STEP 2B**: Write service file
- **STEP 2C**: Generate unit tests (reference TESTING_GUIDE.md)
- **STEP 2D**: Write test file

- **STEP 2E**: Run application tests:
  <if (failures)>
  - Analyze, fix, retry (max 3 attempts)
  </if>

- **STEP 2F**: Update status:
  - UseCases/{use_case_name}_STATUS.md: Application layer ✅
  - Check off roadmap Phase 2B items
  - Update last_updated, overall percent

- **STEP 2G**: User approval (if INTERACTIVE mode):
  Display summary, ask to continue

## Generate Infrastructure Layer

- **STEP 3A**: Determine infrastructure needs:
  - Repository implementation (if data access)
  - API controller/endpoint (if exposed via API)
  - External service adapters (if external dependencies)

- **STEP 3B**: Generate repository (if needed):
  - Reference CODE_EXAMPLES.md (Storage Implementation)
  - Follow VTTTOOLS_STACK.md conventions

- **STEP 3C**: Generate API handlers:
  - Based on ui_type and http_method from spec
  - Follow EndpointMapper pattern
  - Reference CODE_EXAMPLES.md (API Handlers)

- **STEP 3D**: Generate infrastructure tests
- **STEP 3E**: Write infrastructure files

- **STEP 3F**: Run infrastructure tests:
  <if (failures)>
  - Analyze, fix, retry
  </if>

- **STEP 3G**: Update status:
  - Infrastructure layer ✅
  - Check off roadmap Phase 2C items

- **STEP 3H**: User approval (if INTERACTIVE)

## Generate UI Layer

- **STEP 4A**: Check ui_type from spec:
  <case {ui_type}>
  <is NO_UI or API_ENDPOINT>
    - Skip UI generation
    - Display: "No UI required"

  <is FULL_PAGE>
    - Generate: React page at pages/{feature}/
    - Generate: Route configuration
    - Generate: State management

  <is FORM>
    - Generate: Form with validation
    - Generate: Submit handler

  <is WIDGET>
    - Generate: Reusable component
    - Generate: Props interface

  <is BUTTON or MENU_ITEM>
    - Generate: Action handler
    - Provide integration instructions
  </case>

- **STEP 4B**: Use Task tool for UI (if applicable):
  - Reference TYPESCRIPT_STYLE_GUIDE.md
  - Reference CODE_EXAMPLES.md (React Components)
  - Reference VTTTOOLS_STACK.md (Theme requirements)
  - **CRITICAL**: MUST support dark/light mode (useTheme hook)

- **STEP 4C**: Write UI files
- **STEP 4D**: Generate UI tests (React Testing Library)
- **STEP 4E**: Run UI tests

- **STEP 4F**: Update status:
  - UI layer ✅ (if generated)
  - Check off roadmap Phase 2D items

- **STEP 4G**: User approval (if INTERACTIVE)

## Comprehensive Validation

- **STEP 5A**: Run ALL unit tests:
  - Domain (if new elements)
  - Application
  - Infrastructure
  - UI (if applicable)

- **STEP 5B**: Calculate coverage, validate thresholds

- **STEP 5C**: Display complete summary:
  ```
  ## USE CASE IMPLEMENTATION COMPLETE
  ───────────────────────────────────────────

  Use Case: {use_case_name}
  Area: {area_name}
  UI Type: {ui_type}

  Files Generated:

  Application Layer
  ───────────────────────────────────────────
  • {UseCase}Service.cs
  • {UseCase}ServiceTests.cs

  Infrastructure Layer
  ───────────────────────────────────────────
  • {Entity}Repository.cs
  • {UseCase}Handlers.cs
  • Infrastructure tests

  UI Layer (if applicable)
  ───────────────────────────────────────────
  • {UseCase}Component.tsx
  • Component tests

  Test Results:
  - Application: {pass}/{total} ({coverage}%)
  - Infrastructure: {pass}/{total} ({coverage}%)
  - UI: {pass}/{total} ({coverage}%)
  - OVERALL: {total_pass}/{total_tests} ({overall_coverage}%)

  Quality: ✅ Syntax valid, ✅ Coverage target met, ✅ Standards followed

  READY TO COMMIT

  Next: /quality:review-code {use_case_name}
  Then: /git:commit-changes "feat({area}): implement {use_case_name}"
  ```

## Update Memory & Tracking

- **STEP 6A**: Create memory entity:
  - name: "Impl_{use_case_name}"
  - entityType: "use_case_implementation"
  - observations: status, area, files, tests, coverage, dates

- **STEP 6B**: Create relationship to use case entity

- **STEP 6C**: Update STATUS files:
  - USECASE_STATUS.md: Status IMPLEMENTED, mark roadmap complete
  - FEATURE_STATUS.md: Increment completed count
  - PROJECT_STATUS.md: Update overall percentage

**NOTES**:
- Implements complete vertical slice for ONE use case
- Tests must pass before completion
- INTERACTIVE mode allows user approval at checkpoints
- Traceability via code comments and STATUS files
- Memory tracks implementation (fast queries)
- User commits via /git:commit-changes when satisfied
