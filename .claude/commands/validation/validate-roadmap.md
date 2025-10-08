---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Validate roadmap against quality standards, architecture, and feasibility with detailed reporting
argument-hint: {item_type:string:optional} {item_name:string:optional}
---

# Validate Roadmap

Validates roadmap specifications against quality standards, architecture alignment, feasibility, and implementation readiness with comprehensive scoring.

**Supports**: Context-bound roadmaps (feature/use-case/task/domain) and standalone roadmap files

## Parameters

- `{item_type}` - Roadmap type: feature, use-case, task, domain (or standalone filename)
- `{item_name}` - Name of item with roadmap

**Usage Examples**:
```bash
/validation:validate-roadmap feature "Asset Management"
/validation:validate-roadmap use-case "CreateAsset"
/validation:validate-roadmap task "TASK-001"
/validation:validate-roadmap                # Prompts for selection
```

## Process

### Roadmap Location

**Context-Bound Roadmaps**:
- Feature: `Documents/Areas/{area}/Features/{feature}/ROADMAP.md`
- Use Case: `Documents/Areas/{area}/Features/{feature}/UseCases/{use_case}/ROADMAP.md`
- Task: `Documents/Tasks/{task}/ROADMAP.md`
- Domain: `Documents/Areas/{area}/Domain/ROADMAP.md`

**Standalone** (backward compatible):
- Search `Documents/*ROADMAP*.md`
- Prompt user to select if multiple found

### Roadmap Parsing

**Extract Structure** (using solution-engineer agent):
- Phases and their deliverables
- Use cases referenced
- Tasks identified
- Dependencies mapped
- Component mappings
- Cross-area interactions

### Validation Checks

**Quality Standards Validation**:
- Comprehensive deliverable documentation
- Clear acceptance criteria
- Realistic complexity estimates
- Well-defined testing requirements
- Complete risk analysis

**Architecture Validation**:
- Proper area boundary respect
- Cross-area interaction management
- DDD principles compliance
- Clean Architecture alignment
- Interface definitions complete

**Feasibility Validation**:
- Dependencies exist and are implementable
- Technical prerequisites identified
- External system availability
- Team capability alignment
- No circular dependencies

**Implementation Readiness**:
- All use cases have specifications
- Required components identified
- Test strategy defined
- Integration points documented

### Validation Scoring

**Score Categories** (100 points total):
- Quality Standards (25pts)
- Architecture Alignment (25pts)
- Feasibility (25pts)
- Implementation Readiness (25pts)

**Grading**:
- A (90-100): Excellent, ready to implement
- B (80-89): Good, minor improvements
- C (70-79): Acceptable, moderate improvements needed
- D (60-69): Poor, significant rework required
- F (<60): Fails standards, must revise

### Issue Classification

**Critical Issues** (Must fix before implementation):
- Missing use case specifications
- Circular dependencies
- Area boundary violations
- Undefined interfaces

**High Priority** (Should fix soon):
- Incomplete acceptance criteria
- Missing test strategies
- Unclear deliverables
- Weak risk analysis

**Medium Priority** (Consider addressing):
- Optimization opportunities
- Documentation gaps
- Minor architectural improvements

### Validation Report

**Console Output Format**:
```
## ROADMAP VALIDATION: {roadmap_name}
───────────────────────────────────────────

Overall Grade: {letter_grade} ({score}/100)

Quality Standards: {score}/25
Architecture: {score}/25
Feasibility: {score}/25
Implementation Readiness: {score}/25

CRITICAL Issues: {count}
[List critical issues with specific recommendations]

HIGH Priority Issues: {count}
[List high priority issues]

MEDIUM Priority Issues: {count}
[List medium issues]

Positive Observations:
[List strengths]

───────────────────────────────────────────
RECOMMENDATION: {Ready to Implement | Needs Revision | Major Rework Required}
───────────────────────────────────────────
```

### Memory Updates

**Track Validation**:
- Create or update RoadmapValidation entity
- Record iteration count
- Store validation score
- Link issues found
- Timestamp validation

## Important Notes

- Console-based reporting (no file output)
- Validates against established architecture patterns
- Identifies blocking issues before implementation
- Supports iterative improvement workflow
- Compatible with both new and legacy roadmap formats

## Quick Reference

- **Architecture**: `Documents/Guides/VTTTOOLS_STACK.md`
- **Generate Roadmap**: `/creation:generate-roadmap {type} {name}`
- **Next**: Address critical issues, then `/implementation:implement-*`

---

**CRITICAL**: Roadmaps must score ≥70/100 to be considered implementation-ready. Address all critical issues before proceeding.
