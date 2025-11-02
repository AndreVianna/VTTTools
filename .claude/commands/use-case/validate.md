---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, Edit, Glob
description: Validate use case specification against quality standards and architecture integration
argument-hint: {use_case_name:string:optional(all)}
---

# Use Case Specification Validation

Validates use case specifications against USE_CASE_TEMPLATE.md quality checklist, architecture integration, and implementation readiness with auto-fix.

## 1. Determine Scope

<case {use_case_name}>
<is empty or "all">
  - Use Glob: "Documents/Areas/*/Features/*/UseCases/*.md" for all use cases
<otherwise>
  - Use Glob: "Documents/Areas/*/Features/*/UseCases/{use_case_name}.md"
  - Abort if not found
</case>

- Check memory for iteration count

## 2. Score Quality

- For each use case:
  - Use Task with code-reviewer agent:
    ```markdown
    ROLE: Use Case Specification Quality Reviewer

    TASK: Score use case against USE_CASE_TEMPLATE.md checklist

    FILE: {file_path}

    SCORING (100 points):
    - Business Context (20pts): Parent feature, owning area, business value, primary actor/scope
    - Architecture Integration (30pts): Clean Architecture mapping (service/entities/domain services), Hexagonal elements (ports/adapters), DDD alignment (bounded context/domain events), infrastructure dependencies
      - UI Presentation: UI type (NO_UI/API_ENDPOINT/FULL_PAGE/MODAL/FORM/WIDGET/BUTTON/MENU_ITEM/PANEL), location/route if user-facing, key UI elements if FORM/PAGE/MODAL
    - Functional Specification (30pts): Input requirements with validation, business rules, processing steps, output spec, error scenarios (4+ REQUIRED), pre/postconditions
    - Implementation Guidance (20pts): Interface contract, testing strategy (unit/integration/acceptance), acceptance criteria in Given/When/Then (3+ REQUIRED), architecture compliance

    CRITICAL CHECKS:
    - Must have 4+ error scenarios
    - Must have 3+ acceptance criteria
    - All architecture sections populated
    - UI type specified

    TARGET: 80/100 minimum

    OUTPUT: Scores and prioritized improvements
    ```
  - Parse and store scores

## 3. Display Results

```
═══════════════════════════════════════════
USE CASE SPECIFICATION VALIDATION
═══════════════════════════════════════════
{Use Case: {name} | Use Cases: {count}}
Score: {score}/100 ({PASS ✅ | FAIL ❌})
Iteration: {iteration}

┌──────────────────────────────┬────────┬────────┬────────┐
│ Dimension                    │ Score  │ Target │ Status │
├──────────────────────────────┼────────┼────────┼────────┤
│ Business Context             │ XX/20  │ 16/20  │ ✅/⚠️  │
│ Architecture Integration     │ XX/30  │ 24/30  │ ✅/⚠️  │
│ Functional Specification     │ XX/30  │ 24/30  │ ✅/⚠️  │
│ Implementation Guidance      │ XX/20  │ 16/20  │ ✅/⚠️  │
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

**IMPORTANT**: Validates against USE_CASE_TEMPLATE.md. Enforces minimums: 4+ error scenarios, 3+ acceptance criteria. Auto-fix for missing error scenarios, missing ACs, architecture mappings. Console-only output.
