---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Bash, TodoWrite]
description: Interactive workflow guide and command reference for specification-driven development
argument-hint:
---

# Workflow Help Command

Provides interactive guidance for the specification-driven agentic coding workflow. Displays command categories, common workflows, and helpful examples.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Process

### Display Workflow Guide

- **STEP 1**: Use Read tool to load ".claude/guides/WORKFLOW_GUIDE.md"

- **STEP 2**: Display formatted, user-friendly presentation:

```
SPECIFICATION-DRIVEN AGENTIC CODING WORKFLOW

Welcome! This system helps you create comprehensive software specifications
that AI agents can consume to implement any software system.

## 🎯 WORKFLOW PATHS

### Greenfield (New Project)
1. /create-solution          → Define architecture
2. /add-feature {name}            → Add business capabilities
3. /add-use-case {feature} {name} → Detail operations
4. /generate-bdd all              → Create executable tests
5. /validate-* all                → Ensure quality (80/100+)

### Brownfield (Existing Code)
1. /extract-solution          → Discover architecture
2. /extract-features              → Find features/use cases
3. /update-* {name} "{enrich}"    → Add business context
4. /generate-bdd all              → Create tests
5. /validate-* all                → Ensure quality

═══════════════════════════════════════════════════════════════
## 📋 COMMANDS BY CATEGORY
═══════════════════════════════════════════════════════════════

### CREATION (Build Specs from Scratch)
┌────────────────────────────────────────────────────────────┐
│ /init                          │ Initialize project        │
│ /create-solution           │ Create via Q&A            │
│ /add-feature {name}            │ Add feature spec          │
│ /add-use-case {feat} {name}    │ Add use case spec         │
│ /generate-bdd {scope}          │ Generate BDD tests        │
└────────────────────────────────────────────────────────────┘

### EXTRACTION (From Existing Code)
┌────────────────────────────────────────────────────────────┐
│ /extract-solution         │ Extract architecture       │
│ /extract-features             │ Extract features/use cases │
└────────────────────────────────────────────────────────────┘

### UPDATE (Modify Existing Specs)
┌────────────────────────────────────────────────────────────┐
│ /update-solution "{details}"        │ Update project   │
│ /update-feature {name} "{details}"      │ Update feature   │
│ /update-use-case {name} "{details}"     │ Update use case  │
│ /update-bdd {name} "{details}"          │ Update BDD file  │
└────────────────────────────────────────────────────────────┘

Examples:
- /update-solution "add bounded context Reporting"
- /update-feature Login "change primary area to Security"
- /update-use-case Login "add error scenario for account locked"
- /update-bdd Login "add integration scenario for session timeout"

### VALIDATION (Quality Assurance)
┌────────────────────────────────────────────────────────────┐
│ /validate-solution         │ Score project (80/100+)   │
│ /validate-feature {name|all}   │ Score feature(s)          │
│ /validate-use-case {name|all}  │ Score use case(s)         │
│ /validate-bdd {scope|all}      │ Score BDD files           │
└────────────────────────────────────────────────────────────┘

All show: Grade Table → Improvements → Apply Options (1-6)

### MAINTENANCE (Cleanup)
┌────────────────────────────────────────────────────────────┐
│ /remove-feature {name}         │ Remove feature spec       │
│ /remove-use-case {feat} {name} │ Remove use case spec      │
└────────────────────────────────────────────────────────────┘

## 💡 COMMON PATTERNS

### Quick Start (Prove the Workflow)
  /create-solution
  /add-feature TestFeature
  /add-use-case TestFeature TestOperation
  /generate-bdd TestFeature
  /validate-use-case TestOperation
  → If validation passes, expand to full project!

### Feature Sprint
  /add-feature {sprint-feature}
  /add-use-case {feature} {uc-1}
  /add-use-case {feature} {uc-2}
  /generate-bdd {feature}
  /validate-feature {feature}
  → Ready for Phase 2 implementation

### Enrich Extracted Specs
  /extract-features
  /update-feature {name} "add business value: enables users to X"
  /update-use-case {name} "add acceptance criterion: user sees confirmation"
  /validate-use-case {name}
  → Complete specifications from incomplete extraction

### Quality Improvement Cycle
  /validate-bdd all
  → See issues in Proposed Improvements
  → Choose option 3 (Apply CRITICAL + HIGH + MEDIUM)
  → Auto re-validates and shows new score
  → Iterate until 80/100+ achieved

## 📖 FULL DOCUMENTATION

Read complete guide: .claude/guides/WORKFLOW_GUIDE.md

Templates & Checklists:
  .claude/templates/SOLUTION_TEMPLATE.md
  .claude/templates/FEATURE_TEMPLATE.md
  .claude/templates/USE_CASE_TEMPLATE.md
  .claude/templates/BDD_FEATURE_TEMPLATE.md

Syntax & Best Practices:
  .claude/guides/COMMAND_SYNTAX.md (DSL syntax)
  .claude/guides/BDD_CUCUMBER_GUIDE.md (BDD patterns)

Questions? Run commands above or review documentation files.
Ready to start? Run /init or /create-solution!
```

## Quick Reference
- WORKFLOW_GUIDE.md: Complete workflow documentation
- COMMAND_SYNTAX.md: DSL syntax reference

**IMPORTANT NOTES**:
- Displays workflow guide content in user-friendly format
- Categorizes all commands with descriptions
- Shows common patterns with examples
- Provides quick reference for daily use
- No arguments needed - just run /workflow-help