---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Implement use case as vertical slice (Application + Infrastructure + UI) with unit tests
argument-hint: {use_case_name:string}
---

# Implement Use Case Command

Generates complete vertical slice implementation for a use case including Application layer service, Infrastructure layer adapters/controllers, UI layer components (if applicable), and comprehensive unit tests for each layer. Validates with tests before allowing commit.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Phase 0: Validation & Prerequisites

- **STEP 0A**: Validate {use_case_name} is not empty
- **STEP 0B**: Use Glob to find use case spec: "Documents/Areas/*/Features/*/UseCases/{use_case_name}.md"
  <if (not found)>
  - Error with available use cases, abort
  </if>

- **STEP 0C**: Verify prerequisites:
  - Use case specification exists ✓
  - DOMAIN_MODEL.md exists for owning area
  - Documents/Guides/CODING_STANDARDS.md exists
  - ImplementationConfig exists in memory
  - Domain layer implemented for area (DomainImpl_{area} entity exists)

- **STEP 0D**: Check if use case already implemented:
  - Use mcp__memory__search_nodes for "Impl_{use_case_name}"
  <if (exists)>
  - Display current status
  - Ask: "Regenerate? [Y/N]"
  </if>

## Phase 0.5: Check for Implementation Roadmap (Optional Enhancement)

- **STEP 0.5A**: Look for use case roadmap:
  - Parse use case directory from use case specification path
  - Look for: "{usecase_directory}/ROADMAP.md"
  - Example paths to check:
    - "Documents/Areas/*/Features/*/UseCases/ROADMAP.md" (if use case is file in UseCases/)
    - "Documents/Areas/*/Features/*/UseCases/{use_case_name}/ROADMAP.md" (if use case is folder)
  <if (roadmap found)>
    - Read roadmap file
    - Extract: implementation_phases (Domain→Application→Infrastructure→UI), quality_gates
    - Display: "Found implementation roadmap - will follow layer sequence"
    - Set {has_roadmap} = true
    - Set {layer_sequence} = roadmap phases
  <else>
    - Set {has_roadmap} = false
    - Set {layer_sequence} = default (Domain→Application→Infrastructure→UI)
    - Display: "No roadmap found - using standard layer sequence"
  </if>

- **STEP 0.5B**: If roadmap exists, validate it:
  - Check roadmap validation status in memory
  - <if (not validated or score < 80)>
    - Warn: "Roadmap not validated. Validate first? [Y/N]"
    - <if (Y)>
      - Run /validation:validate-roadmap use-case {use_case_name}
    </if>
  </if>

## Phase 1: Load Complete Context

- **STEP 1A**: Read use case specification (full content)
- **STEP 1B**: Read domain model for area
- **STEP 1C**: Read coding standards and guides:
  - Documents/Guides/CODING_STANDARDS.md (overview)
  - Documents/Guides/CSHARP_STYLE_GUIDE.md (C# backend)
  - Documents/Guides/TYPESCRIPT_STYLE_GUIDE.md (if UI_TYPE requires frontend)
  - Documents/Guides/ARCHITECTURE_PATTERN.md (DDD Contracts pattern)
- **STEP 1D**: Read BDD scenarios for acceptance criteria
- **STEP 1E**: Load implementation configuration

- **STEP 1F**: Extract key information:
  - Owning area
  - UI type (NO_UI, API_ENDPOINT, FULL_PAGE, FORM, WIDGET, BUTTON, etc.)
  - Input/output specifications
  - Business rules
  - Error scenarios (4+ required)
  - Acceptance criteria (3+ required)
  - Interface contracts

## Phase 2: Generate Application Layer (Service Implementation with Business Logic)

- **STEP 2A**: Use Task tool with solution-engineer agent:
  ```markdown
  ROLE: Application Service Implementation Specialist

  TASK: Generate application service with ALL business logic for "{use_case_name}"

  USE_CASE_SPEC: {use_case_spec_content}
  DOMAIN_MODEL: {domain_model_content}
  CODING_STANDARDS: {coding_standards_content}

  ARCHITECTURE PATTERN: DDD Contracts + Service Implementation
  - Domain entities are **data contracts** (anemic - no behavior)
  - **ALL business logic goes in this service**
  - Service validates invariants, enforces business rules, orchestrates operations

  TARGET: Source/{area}/Application/Services/{UseCase}Service.cs

  GENERATE:

  1. **Service Class** (Implements I{Entity}Service interface):
     - Constructor: Inject repository, other services, logger
     - Implements interface from Domain project
     - Contains ALL business logic for use case

  2. **Business Logic Implementation** (CRITICAL - This is where logic lives):
     - **Validate inputs**: Check all pre-conditions from spec
     - **Enforce invariants**: Validate all INV-XX rules from domain model
     - **Apply business rules**: Implement all BR-XX rules from spec
     - **Handle errors**: Cover all error_scenarios from spec
     - **Orchestrate**: Load entities → Validate → Create new/modify → Persist
     - **Return**: Result<Entity> with success or failure

  3. **Service Orchestration Pattern**:
     ```csharp
     public async Task<Result<Asset>> CreateAssetAsync(Guid userId, CreateAssetData data, CancellationToken ct)
     {
         // INPUT VALIDATION (from use case spec)
         if (string.IsNullOrWhiteSpace(data.Name))
             return Result.Failure("Name required");

         // INVARIANT: INV-01 - Name max 128 chars (from domain model)
         if (data.Name.Length > 128)
             return Result.Failure("Name max 128 characters");

         // BUSINESS_RULE: BR-03 - User must own or have access to display resource
         var display = await _resourceStorage.GetByIdAsync(data.ResourceId);
         if (display == null || (display.OwnerId != userId && !display.IsPublic))
             return Result.Failure("Display resource not accessible");

         // CREATE ENTITY (using with expression on data contract)
         var asset = new Asset {
             Id = Guid.CreateVersion7(),
             OwnerId = userId,
             Type = data.Type,
             Name = data.Name,
             Description = data.Description,
             IsPublished = false,
             IsPublic = false,
             Display = display
         };

         // PERSIST
         await _repository.AddAsync(asset, ct);

         // OPTIONAL: Raise domain event if needed
         // await _eventBus.PublishAsync(new AssetCreated(asset.Id));

         return Result.Success(asset);
     }
     ```

  4. **Traceability Comments**:
     ```csharp
     // GENERATED: {date} by Claude Code Phase 2
     // SPEC: Documents/Areas/{area}/Features/{feature}/UseCases/{use_case}.md
     // USE_CASE: {use_case}
     // LAYER: Application (Service Implementation)

     /// <summary>Asset management service implementation</summary>
     /// <remarks>
     /// Implements business logic for asset operations.
     /// Entities are data contracts - all logic is here.
     /// </remarks>
     public class AssetService : IAssetService
     {
         // ACCEPTANCE_CRITERION: AC-01 - {criterion}
         // BUSINESS_RULE: BR-01 - {rule} (enforced here)
         // ERROR_SCENARIO: ES-03 - {scenario} (handled here)
     }
     ```

  CRITICAL RESPONSIBILITIES:
  - ✅ Validate ALL invariants from domain model (entities don't validate themselves)
  - ✅ Enforce ALL business rules from spec
  - ✅ Handle ALL error scenarios
  - ✅ Orchestrate with domain entities (load, modify via with, persist)
  - ✅ Return Result<Entity> (domain contracts as return types)

  Follow coding standards exactly.
  OUTPUT: Complete service implementation with all business logic.
  ```

- **STEP 2B**: Write service file
- **STEP 2C**: Generate service unit tests
- **STEP 2D**: Write test file

- **STEP 2E**: Run application layer tests
  <if (failures)>
  - Display failures
  - Analyze and fix
  - Retry (max 3)
  </if>

- **STEP 2F**: Update USECASE_STATUS.md:
  - Read: UseCases/{use_case_name}_STATUS.md
  - Update: Application layer ✅, files list, test scores
  - Check off roadmap: Phase 2B items
  - Update: last_updated, overall percent

- **STEP 2G**: User approval checkpoint (if INTERACTIVE mode):
  ```
  Application layer complete for {use_case_name}:
  - {UseCase}Service.cs created
  - {UseCase}ServiceTests.cs created
  - Tests: {passing}/{total} passing
  - STATUS.md updated

  Review code? [Y/N]
  Continue to Infrastructure layer? [Y/N]
  ```

## Phase 3: Generate Infrastructure Layer

- **STEP 3A**: Determine what infrastructure needed based on use case:
  - Repository implementation (if data access)
  - API controller/endpoint (if exposed via API)
  - External service adapters (if external dependencies)

- **STEP 3B**: Generate repository (if needed):
  - Repository class implementing interface
  - Database access using EF Core or similar
  - Maps domain entities to/from database

- **STEP 3C**: Generate API controller/endpoint:
  - Based on ui_type and http_method from spec
  - EndpointMapper pattern (follows coding standards)
  - DTO mapping
  - Calls application service
  - Returns appropriate HTTP responses

- **STEP 3D**: Generate unit tests for infrastructure:
  - Mock database for repository tests
  - Mock service for controller tests

- **STEP 3E**: Write infrastructure files

- **STEP 3F**: Run infrastructure tests
  <if (failures)>
  - Analyze, fix, retry
  </if>

- **STEP 3F**: Update USECASE_STATUS.md:
  - Update: Infrastructure layer ✅, files list
  - Check off roadmap: Phase 2C items
  - Update: overall percent

- **STEP 3G**: User approval checkpoint (if INTERACTIVE)

## Phase 4: Generate UI Layer (If Applicable)

- **STEP 4A**: Check ui_type from use case spec:
  <case {ui_type}>
  <is NO_UI or API_ENDPOINT>
    - Skip UI generation
    - Display: "No UI required for this use case"

  <is FULL_PAGE>
    - Generate: React page component at pages/{feature}/
    - Generate: Route configuration
    - Generate: Page-specific state management

  <is FORM>
    - Generate: Form component with React Hook Form
    - Generate: Validation schema
    - Generate: Submit handler calling API

  <is WIDGET>
    - Generate: Reusable component
    - Generate: Props interface
    - Generate: Component logic

  <is BUTTON or MENU_ITEM>
    - Generate: Action handler
    - Generate: Component integration instructions
  </case>

- **STEP 4B**: Use Task tool for UI generation:
  ```markdown
  ROLE: UI Component Implementation Specialist

  TASK: Generate React component for "{use_case_name}"

  USE_CASE_SPEC: {spec with UI Presentation section}
  UI_TYPE: {ui_type}
  UI_LOCATION: {route or container}
  UI_ELEMENTS: {ui_elements from spec}
  STATE_REQUIREMENTS: {state requirements from spec}

  Generate:
  - Component file following coding standards
  - TypeScript interfaces for props
  - State management integration (Redux if needed)
  - API calls using service layer
  - Form validation (if FORM type)
  - Loading/error states
  - Accessibility attributes

  Follow Material-UI patterns and coding standards.
  ```

- **STEP 4C**: Write UI component file
- **STEP 4D**: Generate UI component tests (React Testing Library)
- **STEP 4E**: Run UI tests

- **STEP 4E**: Update USECASE_STATUS.md (if UI layer generated):
  - Update: UI layer ✅, files list
  - Check off roadmap: Phase 2D items

- **STEP 4F**: User approval checkpoint (if INTERACTIVE)

## Phase 5: Comprehensive Validation

- **STEP 5A**: Run ALL unit tests for use case:
  - Domain tests (if new domain elements)
  - Application tests
  - Infrastructure tests
  - UI tests (if applicable)

- **STEP 5B**: Calculate coverage
- **STEP 5C**: Validate meets thresholds from configuration

- **STEP 5D**: Display complete summary:
  ```
  ═══════════════════════════════════════════
  USE CASE IMPLEMENTATION COMPLETE
  ═══════════════════════════════════════════

  Use Case: {use_case_name}
  Area: {area_name}
  UI Type: {ui_type}

  Files Generated:
  ┌─────────────────────────────────────────┐
  │ Application Layer                       │
  ├─────────────────────────────────────────┤
  │ • {UseCase}Service.cs                   │
  │ • {UseCase}ServiceTests.cs              │
  ├─────────────────────────────────────────┤
  │ Infrastructure Layer                    │
  ├─────────────────────────────────────────┤
  │ • {Entity}Repository.cs                 │
  │ • {UseCase}Controller.cs                │
  │ • Infrastructure tests                  │
  ├─────────────────────────────────────────┤
  │ UI Layer                                │
  ├─────────────────────────────────────────┤
  │ • {UseCase}Page.tsx (or component)      │
  │ • Component tests                       │
  └─────────────────────────────────────────┘

  Test Results:
  - Application: {pass}/{total} passing ({coverage}%)
  - Infrastructure: {pass}/{total} passing ({coverage}%)
  - UI: {pass}/{total} passing ({coverage}%)
  - OVERALL: {total_pass}/{total_tests} passing ({overall_coverage}%)

  Quality Checks:
  - ✅ Syntax valid (compiles)
  - ✅ Meets coverage target ({target}%+)
  - ✅ Follows coding standards
  - ✅ Domain purity maintained

  READY TO COMMIT

  Actions:
  1. Review generated code
  2. Run /review-code {use_case_name} for automated review
  3. /commit-changes "feat({area}): implement {use_case_name} use case"
  4. Continue to next use case

  [Waiting for user action...]
  ```

## Phase 6: Update Memory & Tracking

- **STEP 6A**: Use mcp__memory__create_entities:
  - name: "Impl_{use_case_name}"
  - entityType: "use_case_implementation"
  - observations:
    - "status: IMPLEMENTED"
    - "use_case: {use_case_name}"
    - "area: {area_name}"
    - "application_files: [{list}]"
    - "infrastructure_files: [{list}]"
    - "ui_files: [{list}]"
    - "test_files: [{list}]"
    - "tests_passing: {count}"
    - "tests_total: {count}"
    - "coverage_percent: {number}"
    - "generated_date: {date}"
    - "spec_version: {version}"
    - "review_status: NOT_REVIEWED"

- **STEP 6B**: Create relationship to use case entity from Phase 1

- **STEP 6C**: Final STATUS.md update:
  - Update USECASE_STATUS.md:
    - Status: IMPLEMENTED (or TESTED if all tests pass)
    - Overall grade: Calculate from implementation + tests
    - Mark roadmap complete through Phase 2
    - Update next action: "Code review" or "Commit"
  - Update FEATURE_STATUS.md:
    - Increment completed use cases count
    - Update feature overall percentage
  - Update PROJECT_STATUS.md:
    - Increment overall completed count
    - Update project percentage

**IMPORTANT NOTES**:
- Implements complete vertical slice for one use case
- Generates Application + Infrastructure + UI (if applicable) + Unit Tests
- Tests must pass before completion
- User controls via approval mode (INTERACTIVE default)
- Traceability maintained via code comments
- Memory tracks implementation status (fast queries)
- STATUS.md files track persistently (version controlled)
- Updates cascade: USECASE → FEATURE → PROJECT STATUS files
- User commits via /commit-changes when satisfied
- Core command of Phase 2 - used repeatedly for each use case