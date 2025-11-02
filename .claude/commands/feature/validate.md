---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, Edit, Glob
description: Validate feature specification against quality standards and architecture alignment
argument-hint: {feature_name:string:optional(all)}
---

# Feature Specification Validation

Validates feature specifications against FEATURE_TEMPLATE.md quality checklist, architecture alignment, and implementation readiness with auto-fix.

## 1. Determine Scope

<case {feature_name}>
<is empty or "all">
  - Use Glob: "Documents/Areas/*/Features/*.md" for all features
<otherwise>
  - Use Glob: "Documents/Areas/*/Features/{feature_name}.md"
  - Abort if not found
</case>

- Check memory for iteration count

## 2. Score Quality

- For each feature file:
  - Use Task with code-reviewer agent:
    ```markdown
    ROLE: Feature Specification Quality Reviewer

    TASK: Score feature against FEATURE_TEMPLATE.md checklist

    FILE: {file_path}

    SCORING (100 points):
    - Business Clarity (25pts): User benefit, measurable objective, testable success criteria, target users, value statement
    - Architecture Alignment (30pts): Primary area assignment, secondary areas, area impact assessment, interactions documented, no circular dependencies
    - Use Case Coverage (25pts): All use cases identified, area assignment, purposes stated, implementation phases ordered
    - Implementation Guidance (20pts): New interfaces, external dependencies, priority, technical considerations

    TARGET: 80/100 minimum

    OUTPUT: Scores and prioritized improvements
    ```
  - Parse and store scores

## 3. Display Results

```
═══════════════════════════════════════════
FEATURE SPECIFICATION VALIDATION
═══════════════════════════════════════════
{Feature: {name} | Features: {count}}
Score: {score}/100 ({PASS ✅ | FAIL ❌})
Iteration: {iteration}

┌─────────────────────────┬────────┬────────┬────────┐
│ Dimension               │ Score  │ Target │ Status │
├─────────────────────────┼────────┼────────┼────────┤
│ Business Clarity        │ XX/25  │ 20/25  │ ✅/⚠️  │
│ Architecture Alignment  │ XX/30  │ 24/30  │ ✅/⚠️  │
│ Use Case Coverage       │ XX/25  │ 20/25  │ ✅/⚠️  │
│ Implementation Guidance │ XX/20  │ 16/20  │ ✅/⚠️  │
├─────────────────────────┼────────┼────────┼────────┤
│ TOTAL                   │ XX/100 │ 80/100 │ ✅/⚠️  │
└─────────────────────────┴────────┴────────┴────────┘

═══════════════════════════════════════════
PROPOSED IMPROVEMENTS
═══════════════════════════════════════════

🔴 CRITICAL ({count})
1. [{FEATURE}] {Issue}
   Current: {problem}
   Required: {fix}
   Impact: +{X} pts | Effort: {Low/Med/High}

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

- Apply selected improvements using Edit tool
- Store improvements in memory
- Recursively re-run validation
- Display iteration comparison and next steps

**IMPORTANT**: Validates against FEATURE_TEMPLATE.md. Supports scope: specific feature or all features. Auto-fix for missing use cases, area assignments, architecture violations.
