---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, Edit
description: Validate solution specification against architectural patterns and engineering principles
argument-hint:
---

# Solution Specification Validation

Comprehensive architectural validation of solution specification against DDD, Clean Architecture, Hexagonal Architecture patterns, and software engineering principles.

## 1. Load & Initialize

- Read "Documents/SOLUTION.md" - abort if missing
- Extract solution name from first # heading
- Check memory for iteration count

## 2. Score Quality

- Use Task with code-reviewer agent:
  ```markdown
  ROLE: Solution Specification Quality Reviewer

  TASK: Score solution against quality checklist from SOLUTION_TEMPLATE.md

  FILE: Documents/SOLUTION.md

  SCORING (100 points):
  - Solution Identity & Value (15pts): Product type, target user/workflow, interface/interaction method
  - Domain Architecture (DDD) (30pts): Bounded contexts (min 3), domain interactions, ubiquitous language (10+ terms), domain entities/value objects/services, domain events
  - Clean Architecture (25pts): Domain layer complete, application layer defined, infrastructure layer, dependency rule compliance
  - Hexagonal (Ports & Adapters) (15pts): Primary ports, secondary ports, primary adapters, secondary adapters
  - Implementation Guidance (15pts): Tech stack with versions, architecture-first priority, development phases

  TARGET: 80/100 minimum

  OUTPUT: Scores and prioritized improvements
  ```

## 3. Display Results

```
═══════════════════════════════════════════
SOLUTION SPECIFICATION VALIDATION
═══════════════════════════════════════════
Solution: {name}
Score: {score}/100 ({PASS ✅ | FAIL ❌})
Iteration: {iteration}

┌──────────────────────────────┬────────┬────────┬────────┐
│ Dimension                    │ Score  │ Target │ Status │
├──────────────────────────────┼────────┼────────┼────────┤
│ Solution Identity & Value    │ XX/15  │ 12/15  │ ✅/⚠️  │
│ Domain Architecture (DDD)    │ XX/30  │ 24/30  │ ✅/⚠️  │
│ Clean Architecture           │ XX/25  │ 20/25  │ ✅/⚠️  │
│ Hexagonal (Ports & Adapters) │ XX/15  │ 12/15  │ ✅/⚠️  │
│ Implementation Guidance      │ XX/15  │ 12/15  │ ✅/⚠️  │
├──────────────────────────────┼────────┼────────┼────────┤
│ TOTAL                        │ XX/100 │ 80/100 │ ✅/⚠️  │
└──────────────────────────────┴────────┴────────┴────────┘

═══════════════════════════════════════════
PROPOSED IMPROVEMENTS
═══════════════════════════════════════════

🔴 CRITICAL ({count})
🟡 HIGH ({count})
🟢 MEDIUM ({count})
🔵 LOW ({count})
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

- Apply selected improvements using Edit tool
- Store improvements in memory
- Recursively re-run validation
- Display iteration comparison and next steps

**IMPORTANT**: Validates against embedded quality checklist. Supports iterative re-evaluation with automatic improvement tracking. Auto-fix applies improvements directly to specification. Console-only output.
