---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Bash, TodoWrite]
description: Validate domain model against DDD principles and completeness standards
argument-hint: {area_name:string:optional(all)}
---

# Validate Domain Model Command

Validates domain model specifications against DDD principles, completeness standards, and implementation readiness. Provides scoring, prioritized improvements, and auto-fix capability with standardized 3-section output.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Phase 0: Scope Determination

- **STEP 0A**: Parse {area_name} parameter:
  <case {area_name}>
  <is empty or "all">
    - Set {validation_scope} = "all_areas"
    - Use Glob: "Documents/Areas/*/DOMAIN_MODEL.md"
  <otherwise>
    - Set {validation_scope} = "single_area"
    - Use Glob: "Documents/Areas/{area_name}/DOMAIN_MODEL.md"
    - <if (not found)>
      - Error with available areas, abort
    </if>
  </case>

- **STEP 0B**: Initialize iteration tracking

## Phase 1: Quality Scoring

<foreach {domain_model_file} in {domain_model_files}>

- **STEP 1A**: Use Task tool with code-reviewer agent:
  ```markdown
  ROLE: Domain Model Quality Reviewer

  TASK: Score domain model against DDD principles and DOMAIN_MODEL_TEMPLATE checklist

  DOMAIN MODEL FILE: {file_path}

  SCORING RUBRIC (100 points):

  **Entities (30 points)**:
  - 10pts: All entities have complete attribute lists with types and constraints
  - 10pts: All entities have invariants clearly defined (enforced in services is acceptable)
  - 5pts: All entity operations documented (even if implemented in services)
  - 5pts: Aggregate roots clearly identified

  **Value Objects (20 points)**:
  - 10pts: All value objects have properties and validation rules
  - 5pts: Immutability and value equality documented
  - 5pts: Factory methods for creation defined (or direct enum usage)

  **Aggregates (25 points)**:
  - 10pts: Aggregate boundaries clearly defined (what's in, what's out)
  - 10pts: Aggregate invariants across entities specified
  - 5pts: Lifecycle management rules documented

  **Application Services (15 points)**:
  - 10pts: Service interface contracts defined (I{Entity}Service in domain project)
  - 5pts: Operations documented with pre/post-conditions and invariants to be enforced

  **Ubiquitous Language (10 points)**:
  - 10pts: Complete domain terminology with definitions (10+ terms minimum)

  ARCHITECTURE PATTERN: DDD Contracts + Service Implementation
  - Domain entities are **data contracts** (anemic entities are ACCEPTABLE and expected)
  - Business logic implemented in **application services** (not in entities)
  - Service interfaces must be in domain project (contracts)

  CRITICAL CHECKS:
  - No infrastructure dependencies in domain contracts
  - Service interfaces defined in domain project
  - Aggregates have clear boundaries
  - Value objects are immutable
  - 10+ ubiquitous language terms defined
  - Invariants documented (enforcement in services is acceptable)

  Identify issues by priority (Critical, High, Medium, Low).

  OUTPUT: Scores and prioritized improvements.
  ```

- **STEP 1B**: Parse scores and store

</foreach>

## Phase 2: Display Results

### Section 1: Grade Table
```
═══════════════════════════════════════════
DOMAIN MODEL VALIDATION
═══════════════════════════════════════════
<if (scope is all)>
Areas Validated: {count}
Average Score: {avg}/100
</if>
<if (scope is single)>
Area: {area_name}
</if>
Iteration: {iteration}
Overall: {score}/100 ({PASS ✅ | FAIL ❌})

┌──────────────────────────────┬────────┬────────┬────────┐
│ Dimension                    │ Score  │ Target │ Status │
├──────────────────────────────┼────────┼────────┼────────┤
│ Entities                     │ XX/30  │ 24/30  │ ✅/⚠️  │
│ Value Objects                │ XX/20  │ 16/20  │ ✅/⚠️  │
│ Aggregates                   │ XX/25  │ 20/25  │ ✅/⚠️  │
│ Domain Services              │ XX/15  │ 12/15  │ ✅/⚠️  │
│ Ubiquitous Language          │ XX/10  │  8/10  │ ✅/⚠️  │
├──────────────────────────────┼────────┼────────┼────────┤
│ TOTAL                        │ XX/100 │ 80/100 │ ✅/⚠️  │
└──────────────────────────────┴────────┴────────┴────────┘
```

### Section 2: Proposed Improvements
```
═══════════════════════════════════════════
PROPOSED IMPROVEMENTS
═══════════════════════════════════════════

🔴 CRITICAL ({count})
1. [Asset Entity] Missing invariants
   Current: No invariants documented
   Required: Define business rules (e.g., Name not empty, Type valid)
   Impact: +10 pts | Effort: Low

🟡 HIGH ({count})
{improvements}

🟢 MEDIUM ({count})
{improvements}

🔵 LOW ({count})
{improvements}
```

### Section 3: Apply Changes
```
═══════════════════════════════════════════
APPLY IMPROVEMENTS?
═══════════════════════════════════════════
Total: {count} | Impact: {current}→{projected}

Options:
1. Apply CRITICAL only
2. Apply CRITICAL + HIGH
3. Apply CRITICAL + HIGH + MEDIUM (ALL except LOW)
4. Apply ALL
5. Interactive review
6. Skip

[Enter 1-6]:
```

## Phase 3: Auto-Fix Implementation

- **STEP 3A**: Execute selected improvements
- **STEP 3B**: Store improvements in memory
- **STEP 3C**: Recursively re-run validation
- **STEP 3D**: Display iteration comparison

**IMPORTANT NOTES**:
- Validates against DOMAIN_MODEL_TEMPLATE embedded checklist
- Ensures DDD principles (domain purity, rich entities, clear aggregates)
- Supports scope: specific area or all areas
- Iterative improvement with auto-fix
- Console-only output with standardized 3-section format
- Critical for ensuring domain models are implementation-ready