---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Implement domain layer (entities, value objects, domain services) for bounded context
argument-hint: {area_name:string}
---

# Implement Domain Command

Generates domain layer implementation for a bounded context including entities, value objects, aggregates, domain services, and business rules. Creates unit tests and validates domain purity (no infrastructure dependencies).

**Platform**: Cross-platform (Windows/Linux/macOS)

## Phase 0: Validation & Prerequisites

- **STEP 0A**: Validate {area_name} is not empty
- **STEP 0B**: Verify prerequisites exist:
  - Documents/Areas/{area_name}/DOMAIN_MODEL.md (required)
  - Documents/Guides/CODING_STANDARDS.md (required)
  - ImplementationConfig in memory (run /configure-implementation if missing)

- **STEP 0C**: Check if domain already implemented:
  - Use mcp__memory__search_nodes for "DomainImpl_{area_name}"
  <if (exists and status = COMPLETE)>
  - Warning: "Domain layer already implemented. Regenerate? [Y/N]"
  </if>

## Phase 0.5: Check for Implementation Roadmap (Optional Enhancement)

- **STEP 0.5A**: Look for domain roadmap:
  - Check: "Documents/Areas/{area_name}/Domain/ROADMAP.md"
  <if (roadmap found)>
    - Read roadmap file
    - Extract: entity_sequence, implementation_phases, dependencies, quality_gates
    - Display: "Found domain implementation roadmap - will follow planned sequence"
    - Set {has_roadmap} = true
    - Set {entity_sequence} = roadmap sequence (simple entities first, aggregates last)
  <else>
    - Set {has_roadmap} = false
    - Display: "No roadmap found - entities will be implemented in default order"
  </if>

- **STEP 0.5B**: If roadmap exists, validate it:
  - Check roadmap validation status in memory
  - <if (not validated or score < 80)>
    - Warn: "Roadmap not validated. Validate first? [Y/N]"
    - <if (Y)>
      - Run /validation:validate-roadmap domain {area_name}
    </if>
  </if>

## Phase 1: Load Context

- **STEP 1A**: Read DOMAIN_MODEL.md for area
- **STEP 1B**: Read coding standards:
  - Documents/Guides/CODING_STANDARDS.md (overview)
  - Documents/Guides/CSHARP_STYLE_GUIDE.md (C# formatting and patterns)
  - Documents/Guides/ARCHITECTURE_PATTERN.md (DDD Contracts pattern)
- **STEP 1C**: Read project architecture from SOLUTION.md
- **STEP 1D**: Load configuration (approval mode, quality thresholds)

## Phase 2: Generate Domain Entities

- **STEP 2A**: Use Task tool with solution-engineer agent:
  ```markdown
  ROLE: Domain Contracts Implementation Specialist

  TASK: Generate domain entities as data contracts (anemic entities)

  DOMAIN MODEL: {area_name} DOMAIN_MODEL.md
  CODING STANDARDS: CODING_STANDARDS.md
  ARCHITECTURE PATTERN: DDD Contracts + Service Implementation
  TARGET: Source/{area_name}/Domain/Model/ (or Domain/Entities/)

  CRITICAL: This project uses ANEMIC ENTITIES (data contracts only):
  - Entities are **immutable records** with init-only properties
  - **NO behavior methods** in entities
  - **NO validation logic** in entities (done in services)
  - Business logic lives in **Application Services**

  For each entity in domain model:

  1. **Generate Entity Record**:
     ```csharp
     // GENERATED: {date} - Domain Contract
     // SPEC: Documents/Areas/{area}/DOMAIN_MODEL.md
     public record {EntityName} {
         public Guid Id { get; init; } = Guid.CreateVersion7();
         // All properties from domain model with init-only setters
         [MaxLength({constraint})]
         public string PropertyName { get; init; } = default_value;
     }
     ```

  2. **Properties Only** (No Methods):
     - All attributes from domain model as properties
     - Use appropriate C# types
     - Add validation attributes ([MaxLength], [Required])
     - Init-only setters (immutable)
     - Default values where specified

  3. **Service Interface Contract**:
     Generate I{EntityName}Service interface in Domain project:
     ```csharp
     public interface IAssetService {
         Task<Asset[]> GetAssetsAsync(CancellationToken ct = default);
         Task<Result<Asset>> CreateAssetAsync(Guid userId, CreateAssetData data, ...);
         // All operations from domain model
     }
     ```

  4. **Add Traceability**:
     - File header linking to DOMAIN_MODEL.md
     - Property comments for complex constraints
     - Invariant documentation in comments (enforced in services)

  DOMAIN CONTRACT PURITY:
  - NO implementation logic (just contracts)
  - NO infrastructure types (no DbContext, no HttpClient)
  - NO framework types (no ASP.NET attributes except validation)
  - Service interfaces only (implementations in Application layer)

  OUTPUT: Anemic entity records + service interface contracts following coding standards.
  ```

- **STEP 2B**: Write generated entity files
- **STEP 2C**: Validate syntax (compile check)

## Phase 3: Generate Value Objects

- **STEP 3A**: For each value object, generate:
  - Enum types (for classifications like AssetType, GameSessionStatus)
  - Record types (for complex value objects like Grid, Frame)
  - Value equality (automatic for records and enums)
  - No setters (immutable)
  - Validation attributes if applicable

- **STEP 3B**: Write value object files

## Phase 4: Generate Service Interface Contracts

- **STEP 4A**: For each entity, generate I{Entity}Service interface:
  - Operations from domain model
  - Method signatures (async, Result<T> pattern)
  - XML doc comments with pre/post-conditions
  - **Location**: Domain project (contracts, not implementation)

  Example:
  ```csharp
  /// <summary>Service contract for Asset operations</summary>
  public interface IAssetService {
      /// <summary>Creates new asset</summary>
      /// <remarks>Enforces: INV-01 (name length), INV-03 (published→public)</remarks>
      Task<Result<Asset>> CreateAssetAsync(Guid userId, CreateAssetData data, CancellationToken ct);

      Task<Result<Asset>> UpdateAssetAsync(Guid userId, Guid id, UpdateAssetData data, CancellationToken ct);
      // ... other operations
  }
  ```

- **STEP 4B**: Write service interface files (Domain project)

**NOTE**: Service **implementations** (AssetService.cs) will be generated in Phase 2B (/implement-use-case), not here.

## Phase 5: Generate Unit Tests (Minimal for Contracts)

- **STEP 5A**: Generate tests for value objects only:
  - Test enum values are correct
  - Test record equality and immutability
  - Test any value object validation (if present)
  - **Skip entity tests** (entities are just data, nothing to test)

- **STEP 5B**: Write test files (lightweight - mainly value object tests)

## Phase 6: Validate & Test

- **STEP 6A**: Run compiler/type checker
  <if (errors)>
  - Display errors
  - Refine code
  - Retry (max 3 attempts)
  </if>

- **STEP 6B**: Run unit tests
  <if (failures)>
  - Display failures
  - Analyze and fix
  - Retry (max 3 attempts)
  </if>

- **STEP 6C**: Check coverage (target: 90%+ for domain)
  <if (below target)>
  - Generate additional tests
  </if>

## Phase 7: User Approval & Completion

- **STEP 7A**: Display summary:
  ```
  ✓ DOMAIN LAYER GENERATED: {area_name}

  Files Created:
  - Entities: {count} files
  - Entity Records (Contracts): {count} files
  - Value Objects (Enums/Records): {count} files
  - Service Interfaces (Contracts): {count} files
  - Unit Tests (Value Objects only): {count} files

  Test Results:
  - Value Object Tests: {count}/{total} passing
  - Note: Entities are data contracts (nothing to unit test)

  Generated Files:
  Domain Contracts (Source/{area}/Domain/):
  {entity_files}
  {value_object_files}
  {interface_files}

  Tests (Source/{area}/Tests/Domain/):
  {test_files}

  Next Steps (INTERACTIVE mode):
  - Review generated domain contracts (entities, value objects, interfaces)
  - Review value object tests
  - If approved: /commit-changes "feat(domain-{area}): add domain contracts (entities, VOs, interfaces)"
  - Then: /implement-use-case {first_use_case} (will implement service logic)
  ```

- **STEP 7B**: Wait for user approval (if INTERACTIVE mode)
- **STEP 7C**: Use mcp__memory__create_entities for DomainImpl tracking:
  - name: "DomainImpl_{area_name}"
  - observations: ["status: COMPLETE", "pattern: anemic_entities", "files: {list}", "tests_passing: {count}"]

**IMPORTANT NOTES**:
- Implements domain **contracts** only (entities as data, service interfaces)
- **Anemic entities**: Records with properties, no methods - business logic in services
- **Service interfaces** generated here, **implementations** in /implement-use-case
- Minimal unit tests (value objects only - entities are untestable data contracts)
- Must compile before proceeding to use case implementation
- One-time per area (contract foundation for all use cases)
- User commits via /commit-changes: "feat(domain-{area}): add domain contracts"