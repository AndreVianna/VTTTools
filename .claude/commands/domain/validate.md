---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, Edit, Glob
description: Validate domain model against DDD principles and completeness standards
argument-hint: {area_name:string:optional(all)}
---

# Validate Domain Model

Validates domain model specifications against DDD principles, completeness standards, and implementation readiness with auto-fix capability.

## 1. Determine Scope

<case {area_name}>
<is empty or "all">
  - Use Glob: "Documents/Areas/*/DOMAIN_MODEL.md"
<otherwise>
  - Use Glob: "Documents/Areas/{area_name}/DOMAIN_MODEL.md"
  - Abort if not found
</case>

- Check memory for iteration count

## 2. Score Quality

- For each domain model file:
  - Use Task with code-reviewer agent:
    ```markdown
    ROLE: Domain Model Quality Reviewer

    TASK: Score domain model against DDD principles and DOMAIN_MODEL_TEMPLATE checklist

    FILE: {file_path}

    SCORING (100 points):
    - Entities (30pts): Complete attributes with types/constraints, invariants defined, operations documented, aggregate roots identified
    - Value Objects (20pts): Properties with validation, immutability documented, factory methods defined
    - Aggregates (25pts): Boundaries defined, invariants across entities, lifecycle management
    - Application Services (15pts): Service interface contracts in domain project (I{Entity}Service), operations with pre/post-conditions
    - Ubiquitous Language (10pts): 10+ terms minimum with definitions

    ARCHITECTURE: DDD Contracts + Service Implementation
    - Domain entities are data contracts (anemic acceptable)
    - Business logic in application services
    - Service interfaces must be in domain project
    - Invariants documented (enforcement in services acceptable)

    TARGET: 80/100 minimum

    OUTPUT: Scores and prioritized improvements
    ```
  - Parse and store scores

## 3. Display Results

```
═══════════════════════════════════════════
DOMAIN MODEL VALIDATION
═══════════════════════════════════════════
{Area: {name} | Areas: {count}}
Score: {score}/100 ({PASS ✅ | FAIL ❌})
Iteration: {iteration}

┌──────────────────────┬────────┬────────┬────────┐
│ Dimension            │ Score  │ Target │ Status │
├──────────────────────┼────────┼────────┼────────┤
│ Entities             │ XX/30  │ 24/30  │ ✅/⚠️  │
│ Value Objects        │ XX/20  │ 16/20  │ ✅/⚠️  │
│ Aggregates           │ XX/25  │ 20/25  │ ✅/⚠️  │
│ Domain Services      │ XX/15  │ 12/15  │ ✅/⚠️  │
│ Ubiquitous Language  │ XX/10  │  8/10  │ ✅/⚠️  │
├──────────────────────┼────────┼────────┼────────┤
│ TOTAL                │ XX/100 │ 80/100 │ ✅/⚠️  │
└──────────────────────┴────────┴────────┴────────┘

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

## 4. Auto-Fix Options

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

## 5. Apply & Re-validate

- Execute selected improvements using Edit tool
- Store improvements in memory
- Recursively re-run validation
- Display iteration comparison and next steps

**IMPORTANT**: Validates against DOMAIN_MODEL_TEMPLATE. Ensures DDD principles (domain purity, clear aggregates). Console-only output with iterative improvement.
