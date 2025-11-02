---
allowed-tools: Read
description: Interactive workflow guide and command reference for specification-driven development
argument-hint:
---

# Workflow Help

Specification-driven agentic coding workflow with entity-based command organization.

## Execution

Display formatted help:

```
═══════════════════════════════════════════════════════════════
SPECIFICATION-DRIVEN AGENTIC CODING WORKFLOW
═══════════════════════════════════════════════════════════════

Entity-based command organization: All lifecycle phases for each entity
in one place.

## 🎯 QUICK START WORKFLOWS

### Greenfield (New Project)
1. /solution:create                    → Define architecture & domains
2. /domain:add {area}                  → Create domain model (DDD)
3. /feature:add {name}                 → Add business capabilities
4. /use-case:add {feature} {name}      → Detail atomic operations
5. /use-case:validate {name}           → Ensure quality (80/100+)
6. /use-case:coding:prepare {name}     → Generate implementation todo
7. /use-case:coding:generate {name}    → Implement code
8. /use-case:bdd:prepare {name}        → Generate BDD scenarios
9. /use-case:approve {name}            → Final validation
10. /feature:approve {name}            → Approve feature for production

### Brownfield (Existing Code)
1. /system:init                        → Initialize project
2. Extract domain and features (manual or via custom extraction)
3. /domain:validate {area}             → Validate domain models
4. /feature:validate {name}            → Validate feature specs
5. Continue with implementation phases above

═══════════════════════════════════════════════════════════════
## 📋 ENTITY LIFECYCLES
═══════════════════════════════════════════════════════════════

### SOLUTION (Macro Entity - Project Level)
┌──────────────────────────────────────────────────────────────┐
│ /solution:create                     │ Create via Q&A          │
│ /solution:validate                   │ Validate architecture   │
│ /solution:update "{details}"         │ Modify specification    │
│ /solution:display                    │ Show status & metrics   │
│ /solution:structure:update "{...}"   │ Update technical struct │
│ /solution:structure:validate         │ Validate structure      │
└──────────────────────────────────────────────────────────────┘

### DOMAIN (DDD Bounded Context)
┌──────────────────────────────────────────────────────────────┐
│ /domain:add {area} "{desc}"          │ Create domain model     │
│ /domain:validate {area}              │ Validate DDD quality    │
│ /domain:implement {area}             │ Generate domain layer   │
│ /domain:update {area} "{details}"    │ Modify domain model     │
│ /domain:explain {area}               │ Show entities & VOs     │
│ /domain:remove {area}                │ Delete domain model     │
└──────────────────────────────────────────────────────────────┘

### FEATURE (Business Capability)
┌──────────────────────────────────────────────────────────────┐
│ /feature:add {name} "{desc}"         │ Create feature spec     │
│ /feature:validate {name}             │ Validate quality        │
│ /feature:implement {name}            │ Orchestrate use cases   │
│ /feature:approve {name}              │ Final approval gate     │
│ /feature:display {name}              │ Show status & progress  │
│ /feature:update {name} "{details}"   │ Modify feature spec     │
│ /feature:remove {name}               │ Delete feature          │
└──────────────────────────────────────────────────────────────┘

### USE CASE (Atomic Functionality - Complete Lifecycle)
┌──────────────────────────────────────────────────────────────┐
│ Specification                                                 │
│ /use-case:add {feat} {name} "{...}"  │ Create use case spec    │
│ /use-case:validate {name}            │ Validate spec quality   │
│ /use-case:update {name} "{details}"  │ Modify specification    │
│                                                                │
│ Coding Phase                                                  │
│ /use-case:coding:prepare {name}      │ Generate impl todo      │
│ /use-case:coding:generate {name}     │ Implement code (Phase 4)│
│ /use-case:coding:review {name}       │ Code review (Phase 5)   │
│                                                                │
│ Testing Phase                                                 │
│ /use-case:testing:improve {name}     │ Unit tests (Phase 6)    │
│                                                                │
│ BDD Phase                                                     │
│ /use-case:bdd:prepare {name}         │ Generate BDD (Phase 7)  │
│ /use-case:bdd:validate {name}        │ Validate BDD (Phase 8)  │
│ /use-case:bdd:implement {name}       │ Step defs (Phase 9)     │
│                                                                │
│ Completion                                                    │
│ /use-case:approve {name}             │ Final approval (Phase10)│
│ /use-case:display {name}             │ Show lifecycle status   │
│ /use-case:remove {name}              │ Delete use case         │
└──────────────────────────────────────────────────────────────┘

### TASK (Cross-Cutting Activity - Same Lifecycle as Use Case)
┌──────────────────────────────────────────────────────────────┐
│ Specification                                                 │
│ /task:create {type} {title} "{...}"  │ Create task spec        │
│ /task:validate {id}                  │ Validate spec quality   │
│ /task:update {id} "{details}"        │ Modify specification    │
│ /task:list                           │ List all tasks          │
│ /task:show-impact {id}               │ Analyze dependencies    │
│                                                                │
│ Coding Phase                                                  │
│ /task:coding:prepare {id}            │ Generate impl todo      │
│ /task:coding:generate {id}           │ Implement code (Phase 4)│
│ /task:coding:review {id}             │ Code review (Phase 5)   │
│                                                                │
│ Testing Phase                                                 │
│ /task:testing:improve {id}           │ Unit tests (Phase 6)    │
│                                                                │
│ BDD Phase                                                     │
│ /task:bdd:prepare {id}               │ Generate BDD (Phase 7)  │
│ /task:bdd:validate {id}              │ Validate BDD (Phase 8)  │
│                                                                │
│ Completion                                                    │
│ /task:approve {id}                   │ Final approval (Phase10)│
│ /task:display {id}                   │ Show task status        │
└──────────────────────────────────────────────────────────────┘

### GIT (Version Control)
┌──────────────────────────────────────────────────────────────┐
│ /git:commit "{message}"              │ Commit changes          │
│ /git:pr "{description}"              │ Create pull request     │
│ /git:discard                         │ Discard uncommitted     │
└──────────────────────────────────────────────────────────────┘

### SYSTEM (Utilities)
┌──────────────────────────────────────────────────────────────┐
│ /system:init                         │ Initialize project      │
│ /system:help                         │ Show this help          │
│ /system:cleanup                      │ Clean memory entities   │
└──────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════
## 💡 COMPLETE USE CASE LIFECYCLE EXAMPLE
═══════════════════════════════════════════════════════════════

Implementing CreateAsset use case end-to-end:

# Phase 1-2: Specification
/use-case:add AssetManagement CreateAsset "Create new asset entity"
/use-case:validate CreateAsset

# Phase 3: Preparation
/use-case:coding:prepare CreateAsset

# Phase 4: Implementation
/use-case:coding:generate CreateAsset

# Phase 5: Code Review
/use-case:coding:review CreateAsset

# Phase 6: Unit Testing
/use-case:testing:improve CreateAsset

# Phase 7-8: BDD
/use-case:bdd:prepare CreateAsset
/use-case:bdd:validate CreateAsset

# Phase 9: BDD Implementation
/use-case:bdd:implement CreateAsset

# Phase 10: Final Approval
/use-case:approve CreateAsset

# Ship It!
/git:commit "feat(asset): implement CreateAsset use case"

═══════════════════════════════════════════════════════════════
## 📊 COMMAND ORGANIZATION PRINCIPLES
═══════════════════════════════════════════════════════════════

Entity-Based Structure:
- All commands for an entity live in that entity's folder
- Tab completion shows all entity operations: /feature:[tab]
- Lifecycle phases grouped in subfolders (coding/, testing/, bdd/)

Invocation Pattern:
- Entity commands: /entity:verb {name}
- Lifecycle phases: /entity:phase:verb {name}
- Examples:
  /feature:add AssetManagement
  /use-case:coding:prepare CreateAsset
  /task:bdd:validate TASK-042

═══════════════════════════════════════════════════════════════
## 📖 FULL DOCUMENTATION
═══════════════════════════════════════════════════════════════

Comprehensive guides:
- .claude/guides/WORKFLOW_GUIDE.md - Complete workflow documentation
- .claude/guides/COMMAND_SYNTAX.md - DSL syntax reference
- .claude/guides/BDD_CUCUMBER_GUIDE.md - BDD best practices

Templates:
- .claude/templates/SOLUTION_TEMPLATE.md
- .claude/templates/DOMAIN_MODEL_TEMPLATE.md
- .claude/templates/FEATURE_TEMPLATE.md
- .claude/templates/USE_CASE_TEMPLATE.md
- .claude/templates/TASK_TEMPLATE.md
- .claude/templates/BDD_FEATURE_TEMPLATE.md

═══════════════════════════════════════════════════════════════

Ready to start? Run /system:init or /solution:create!

═══════════════════════════════════════════════════════════════
```

**NOTES**:
- Updated for entity-based organization
- Shows complete use case lifecycle (10 phases)
- Organized by entity with subfolder phases
- Tab completion friendly
