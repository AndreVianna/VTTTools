# Specification-Driven Agentic Coding Workflow Guide

## Overview

This workflow system enables **comprehensive software specification generation** that AI agents can consume to implement any software system. The process follows a structured approach from high-level project definition down to executable acceptance tests.

### System Philosophy

**Specification-First Development**: Create detailed, machine-readable specifications before implementation. These specifications guide AI agents to write correct, well-architected code.

**Architecture-First Approach**: Enforce DDD, Clean Architecture, and Hexagonal Architecture patterns from the start to prevent technical debt.

**Quality Assurance Built-In**: Embedded checklists, quality gates, and validation commands ensure specifications are complete and trustworthy.

---

## The Specification Pyramid

```
┌─────────────────────────────────────┐
│   SOLUTION SPECIFICATION            │  What: System architecture
│   (DDD + Clean + Hexagonal)         │  Creates: Documents/SOLUTION.md
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│   FEATURE SPECIFICATIONS            │  What: Business capabilities
│   (Business + Area + Use Cases)     │  Creates: Documents/Areas/{Area}/Features/{Feature}.md
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│   USE CASE SPECIFICATIONS           │  What: Detailed operations
│   (Architecture + Contracts + ACs)  │  Creates: Documents/Areas/{Area}/Features/{Feature}/UseCases/{UseCase}.md
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│   BDD FEATURE FILES                 │  What: Executable tests
│   (Gherkin + Scenarios + Rules)     │  Creates: Documents/Areas/{Area}/**/*.feature
└─────────────────────────────────────┘
```

Each level adds detail. Together they provide everything agents need to implement.

---

## Workflow Paths

### Path 1: Greenfield (New Project from Scratch)

**When to use**: Starting a brand new software project

**Steps**:

1. **Initialize Project**
   ```
   /init
   ```
   Creates directory structure and templates

2. **Create Solution Specification**
   ```
   /create-solution
   ```
   - Guided Q&A to gather requirements
   - Defines architecture (DDD bounded contexts, Clean layers, Hexagonal ports)
   - Specifies tech stack
   - **Output**: Documents/SOLUTION.md

3. **Add Features** (Repeat for each feature)
   ```
   /add-feature {feature-name}
   ```
   - Analyzes feature against project architecture
   - Breaks down into area-aligned use cases
   - **Output**: Documents/Areas/{Area}/Features/{Feature}.md

3a. **Refine Features** (Optional - enhance after creation)
   ```
   /update-feature {feature-name} "add use case ExportReport"
   /update-feature {feature-name} "clarify business objective: reduce reporting time by 80%"
   ```
   - Add use cases discovered after initial analysis
   - Enhance business value descriptions
   - Clarify success criteria
   - Update after stakeholder feedback

4. **Add Use Cases** (Repeat for each use case)
   ```
   /add-use-case {feature-name} {use-case-name}
   ```
   - Creates detailed specification
   - Maps to architecture layers
   - Defines acceptance criteria
   - **Output**: Documents/Areas/{Area}/Features/{Feature}/UseCases/{UseCase}.md

4a. **Refine Use Cases** (Optional - enhance after creation)
   ```
   /update-use-case {use-case-name} "add error scenario for network timeout"
   /update-use-case {use-case-name} "add acceptance criterion AC-05: retry succeeds after failure"
   ```
   - Add missing error scenarios (ensure 4+ total)
   - Add acceptance criteria discovered during design (ensure 3+ total)
   - Clarify business rules
   - Update based on technical review

5. **Generate BDD Tests**
   ```
   /generate-bdd all
   ```
   - Converts specifications to Gherkin
   - Creates feature-level and use-case-level BDD files
   - Includes quality gates (Phase 2D, 5.5)
   - **Output**: Documents/Areas/{Area}/**/*.feature files

6. **Validate Quality**
   ```
   /validate-solution
   /validate-feature all
   /validate-use-case all
   /validate-bdd all
   ```
   - Scores against quality checklists
   - Identifies improvements
   - Offers auto-fix options
   - Iterate until quality targets met (80/100)

**Result**: Complete specification tree ready for agentic implementation (Phase 2)

---

### Path 2: Brownfield (Existing Codebase)

**When to use**: Documenting/improving existing software (even poorly documented)

**Steps**:

1. **Extract Solution Architecture**
   ```
   /extract-solution
   ```
   - Analyzes codebase structure
   - Infers architecture patterns
   - Discovers bounded contexts
   - **Output**: Documents/SOLUTION.md (technical details extracted)

2. **Enrich with Business Context**
   ```
   /update-solution "add business value: enables X for users Y"
   /update-solution "clarify target users as enterprise administrators"
   ```
   - Adds missing business context
   - Enhances extracted specs with user stories
   - Completes solution specification

3. **Extract Features and Use Cases**
   ```
   /extract-features
   ```
   - Discovers areas, features, use cases from code structure
   - Infers technical details from implementation
   - **Output**: Documents/Areas/{Area}/Features/{Feature}.md and UseCases/{UseCase}.md

4. **Enrich Features and Use Cases**
   ```
   /update-feature {name} "add business objective: reduce manual reporting by 50%"
   /update-use-case {name} "add error scenario for database timeout"
   /update-use-case {name} "add acceptance criterion: user receives confirmation email"
   ```
   - Adds missing business value
   - Adds error scenarios (ensure 4+ minimum)
   - Adds acceptance criteria (ensure 3+ minimum)
   - Completes specifications

5. **Generate BDD Tests**
   ```
   /generate-bdd all
   ```
   - Same as greenfield path

6. **Validate Quality**
   ```
   /validate-* all
   ```
   - Same as greenfield path
   - Fix any gaps from extraction
   - Iterate until quality targets met

**Result**: Fully documented existing codebase with specifications ready for refactoring or enhancement

---

### Path 3: Hybrid (Mix Both Approaches)

**When to use**: Existing codebase + new features

**Steps**:

1. **Extract Existing**
   ```
   /extract-solution
   /extract-features
   ```
   - Document what exists

2. **Enrich Extracted**
   ```
   /update-solution {details}
   /update-feature {name} {details}
   ```
   - Add missing context

3. **Add New Features**
   ```
   /add-feature {new-feature-name}
   /add-use-case {feature-name} {new-use-case-name}
   ```
   - Extend system with new capabilities

4. **Generate & Validate**
   ```
   /generate-bdd all
   /validate-* all
   ```
   - Unified specifications for old + new

**Result**: Complete specifications covering existing and planned features

---

### Path 4: Structure-First Development

**When to use**: Multi-platform solutions, complex technical architecture, or when technical structure needs explicit documentation

**Steps**:

1. **Create Solution Specification**
   ```
   /create-solution
   ```
   - Define business architecture first

2. **Define Technical Structure**
   ```
   /define-structure {platform}
   ```
   - Platform: dotnet, java, python, typescript, go, rust
   - Define projects/modules/packages organization
   - Map components to layers (Domain, Application, Infrastructure, UI)
   - **Create bidirectional feature-component mappings**

3. **Add Features (now with structure awareness)**
   ```
   /add-feature {feature-name}
   ```
   - System asks: "Which components will implement this feature?"
   - Auto-updates STRUCTURE.md with feature mapping
   - Creates bidirectional traceability

4. **Extract Existing Code (for brownfield)**
   ```
   /extract-structure
   ```
   - Auto-detects platform (.sln, pom.xml, package.json)
   - Discovers components and dependencies
   - Maps components to features
   - Updates all feature specs

5. **Validate Architecture**
   ```
   /validate-structure
   ```
   - Check layer dependency violations
   - Verify feature-component mappings (bidirectional)
   - Find orphaned features/components
   - Detect circular dependencies

**Result**: Complete business + technical documentation with full traceability

**Use Cases:**
- .NET solutions with multiple projects
- Java applications with Maven/Gradle modules
- Python packages with complex dependencies
- TypeScript monorepos with workspaces
- When architecture needs explicit documentation

---

### Path 5: Task-Driven Development

**When to use**: Sprint planning, cross-cutting work (bugs, refactoring), technical debt tracking, or Agile/Scrum workflows

**Steps**:

1. **Create Solution + Structure** (Prerequisites)
   ```
   /create-solution
   /define-structure {platform}  # or /extract-structure for existing
   /add-feature {features}
   ```
   - Establish business and technical foundation

2. **Create Work Items**
   ```
   /creation:create-task feature "Implement user authentication"
   /creation:create-task bug "Fix login redirect issue"
   /creation:create-task refactor "Simplify database layer"
   /creation:create-task tech-debt "Remove deprecated API calls"
   ```
   - Task types: feature, bug, refactor, tech-debt, infrastructure, documentation
   - System asks: Which features/components/use cases affected?
   - Auto-generates task IDs: TASK-001, BUG-042, REFACTOR-007, DEBT-013
   - Creates multi-directional cross-references

3. **Plan Sprints**
   ```
   /task:list-tasks
   /task:list-tasks priority:high
   /task:show-impact TASK-042  # Analyze before starting
   ```
   - View backlog by status/type/priority
   - Analyze blast radius and dependencies
   - Prioritize work

4. **Implement Tasks**
   ```
   /implement-task TASK-042
   ```
   - Orchestrates implementation across all layers
   - Delegates to: /implement-domain, /implement-use-case
   - Runs tests, validates acceptance criteria
   - Updates task status automatically

5. **Track Progress**
   ```
   /solution-status  # Shows 3 views: Business, Technical, Work
   /task:list-tasks status:in-progress
   ```

**Result**: Organized work tracking with complete traceability to business and technical layers

**Use Cases:**
- Sprint planning and execution
- Bug tracking across multiple features
- Refactoring work that spans components
- Technical debt management
- Infrastructure improvements
- Work that doesn't fit into feature boundaries

---

### Decision Trees

#### When to Use Structure Layer?

**Use Structure Layer IF:**
- Solution has multiple projects/modules/packages
- Need to document technical dependencies explicitly
- Working with .NET, Java, Python, TypeScript, or other platforms
- Team needs clear component-to-feature mappings
- Planning deployment architecture

**Skip Structure Layer IF:**
- Single-file scripts or utilities
- Prototype/MVP with no complex architecture
- All logic in one component

**Commands:** `/define-structure` or `/extract-structure`

---

#### When to Use Task Layer?

**Use Task Layer IF:**
- Following Agile/Scrum with sprints
- Need to track bugs, tech debt, refactoring separately
- Work crosses multiple features
- Need impact analysis before changes
- Want sprint velocity tracking
- Using Jira/Azure DevOps/GitHub Issues workflow

**Skip Task Layer IF:**
- Just implementing one feature at a time
- No sprint planning needed
- Direct feature implementation sufficient

**Commands:** `/create-task`, `/implement-task`, `/task:list-tasks`

---

#### Feature-Driven vs Task-Driven?

**Feature-Driven (Classic):**
```
/add-feature UserManagement
/add-use-case UserManagement Login
/implement-use-case Login
```
- Direct: spec → implementation
- No intermediate work tracking
- Good for: straightforward development

**Task-Driven (Agile):**
```
/add-feature UserManagement  # Spec only
/create-task feature "Implement Login use case"  # Plan work
/implement-task TASK-042  # Execute with tracking
```
- Indirect: spec → task → implementation
- Full work tracking and impact analysis
- Good for: team workflows, complex changes

**Both can coexist** - use what fits your workflow!

---

### Path 6: Roadmap-Driven Implementation

**When to use**: Complex features/domains requiring careful phase planning, dependency management, or when you want to plan before executing

**Steps**:

1. **Create Specifications First**
   ```
   /create-solution
   /add-feature UserManagement  # Creates feature with 5 use cases
   /add-use-case UserManagement Login
   ```
   - Establish complete specifications

2. **Generate Context-Aware Roadmap**
   ```
   /creation:generate-roadmap feature UserManagement
   ```
   - Analyzes feature specification
   - Extracts use cases, components, dependencies
   - Creates dependency-based phase sequencing
   - Generates quality gates per phase
   - **Stores roadmap with feature**: `Documents/Areas/.../Features/UserManagement_ROADMAP.md`

   **Also works for:**
   ```
   /creation:generate-roadmap use-case Login
   /creation:generate-roadmap task TASK-042
   /creation:generate-roadmap domain TaskManagement
   ```

3. **Validate Roadmap**
   ```
   /validation:validate-roadmap feature UserManagement
   ```
   - Validates dependency order
   - Checks phase logic
   - Verifies quality gates
   - Target: 80/100 minimum

4. **Implement Using Roadmap**
   ```
   /implementation:implement-feature UserManagement
   ```
   - **Automatically finds** `UserManagement_ROADMAP.md`
   - Follows planned phases
   - Executes quality gates
   - Tracks progress in roadmap file

   **The implement-* commands now auto-load roadmaps:**
   - `/implement-feature` → looks for `{feature}_ROADMAP.md`
   - `/implement-use-case` → looks for `{usecase}_ROADMAP.md`
   - `/implement-task` → looks for `Tasks/{id}/ROADMAP.md`
   - `/implement-domain` → looks for `Domain/IMPLEMENTATION_ROADMAP.md`

**Result**: Planned, validated implementation with progress tracking

**Key Benefits:**
- Dependency-aware sequencing (no implementation order mistakes)
- Quality gates prevent rushing ahead
- Progress tracking across multi-day work
- Risk assessment built-in
- Pause/resume capability

**When to Skip Roadmaps:**
- Simple features (1-2 use cases)
- Straightforward use cases (no complex dependencies)
- Quick fixes or small changes

**Roadmaps are Optional**: All `implement-*` commands work with or without roadmaps!

---

## Command Reference by Category

### 📝 CREATION Commands (New Specifications)

| Command | Arguments | Purpose |
|---------|-----------|---------|
| /creation:create-solution | - | Create solution via guided Q&A |
| /creation:add-feature | {feature-name} | Analyze and create feature spec |
| /creation:add-use-case | {feature-name} {use-case-name} | Create detailed use case spec |
| /creation:generate-bdd | {scope:optional(all)} | Generate BDD test files |
| /creation:define-structure | {platform} | Define technical structure (NEW) |
| /creation:create-task | {type} {title} | Create work item task (NEW) |
| /creation:generate-roadmap | {type} {name} | Generate implementation roadmap (NEW) |

### 🔍 EXTRACTION Commands (From Existing Code)

| Command | Arguments | Purpose |
|---------|-----------|---------|
| /extraction:extract-solution | - | Extract solution architecture from code |
| /extraction:extract-features | {area-filter:optional} {feature-filter:optional} | Extract features/use cases from code |
| /extraction:extract-structure | - | Extract technical structure (NEW) |

### ✏️ UPDATE Commands (Modify Existing Specs)

| Command | Arguments | Purpose |
|---------|-----------|---------|
| /update:update-solution | {update-details} | Update solution via natural language |
| /update:update-structure | {update-details} | Update structure via natural language (NEW) |
| /update:update-task | {task-id} {update-details} | Update task via natural language (NEW) |
| /update:update-feature | {feature-name} {update-details} | Update feature spec |
| /update:update-use-case | {use-case-name} {update-details} | Update use case spec |
| /update:update-bdd | {bdd-name} {update-details} | Update BDD feature file |

### ✅ VALIDATION Commands (Quality Assurance)

| Command | Arguments | Purpose |
|---------|-----------|---------|
| /validation:validate-solution | - | Score solution against checklist |
| /validation:validate-feature | {feature-name:optional(all)} | Score feature(s) against checklist |
| /validation:validate-use-case | {use-case-name:optional(all)} | Score use case(s) against checklist |
| /validation:validate-bdd | {scope:optional(all)} | Score BDD files against best practices |
| /validation:validate-structure | - | Validate technical structure (NEW) |
| /validation:validate-task | {task-id:optional(all)} | Validate task cross-references (NEW) |
| /validation:validate-roadmap | {type} {name} | Validate implementation roadmap (NEW) |

**All validation commands**:
- Display 5-section output (Scores, Cross-Refs, Violations, Improvements, Auto-Fix)
- Support auto-fix with 6 options
- Enable iterative re-validation
- Console-only output
- Target: 80/100 minimum

### 📋 TASK MANAGEMENT Commands (NEW)

| Command | Arguments | Purpose |
|---------|-----------|---------|
| /creation:create-task | {type} {title} {description:opt} | Create work item with cross-refs |
| /validation:validate-task | {task-id:optional(all)} | Validate task quality and references |
| /implementation:implement-task | {task-id} | Orchestrate task implementation |
| /update:update-task | {task-id} {update-details} | Update task specification |
| /task:list-tasks | {filter:optional} | List/filter tasks by status/type/priority |
| /task:show-impact | {task-id} | Analyze complete task impact |

**Task types**: feature, bug, refactor, tech-debt, infrastructure, documentation
**Filters**: status:X, type:X, priority:X, sprint:X, feature:X

### 🗑️ MAINTENANCE Commands

| Command | Arguments | Purpose |
|---------|-----------|---------|
| /maintenance:remove-feature | {feature-name} | Remove feature and related specs |
| /maintenance:remove-use-case | {feature-name} {use-case-name} | Remove use case spec |

### 📚 WORKFLOW Commands

| Command | Arguments | Purpose |
|---------|-----------|---------|
| /show-structure | - | display information about the project structure |
| /workflow-help | - | Interactive workflow guide and command reference |

---

## Common Usage Patterns

### Pattern 1: Quick Start (Minimal Viable Specs)

```bash
# 1. Create project
/create-solution

# 2. Add ONE feature to start
/add-feature UserAuthentication

# 3. Add ONE use case to prove workflow
/add-use-case UserAuthentication Login

# 4. Generate BDD for that use case
/generate-bdd UserAuthentication Login

# 5. Validate
/validate-use-case Login

# 6. Fix issues and proceed
# Now expand with more features...
```

### Pattern 2: Feature-Driven Development

```bash
# For each feature sprint:
/add-feature {sprint-feature}
/add-use-case {feature} {use-case-1}
/add-use-case {feature} {use-case-2}
/generate-bdd {feature}
/validate-feature {feature}
# Fix issues, then implement
```

### Pattern 3: Brownfield Documentation Sprint

```bash
# 1. Extract everything
/extract-solution
/extract-features

# 2. Batch enrich critical areas
/update-feature {name} "add business value: ..."
/update-use-case {name} "add error scenarios: timeout, validation failure, ..."

# 3. Generate tests
/generate-bdd all

# 4. Validate and fix
/validate-bdd all
# Apply improvements option 3 (critical + high + medium)
```

### Pattern 4: Incremental Specification Enhancement

```bash
# Start with minimal spec
/create-solution  # Answer basic questions

# Add detail over time
/update-solution "add bounded context Notifications with purpose: async messaging"
/update-solution "add ubiquitous language terms: Event, Subscriber, Publisher"

# Validate when ready
/validate-solution
```

### Pattern 5: Greenfield with Iterative Refinement

```bash
# Create initial feature
/add-feature UserManagement

# Review generated spec, realize more use cases needed
/update-feature UserManagement "add use case ResetPassword"
/update-feature UserManagement "add use case DisableAccount"

# Create the new use cases
/add-use-case UserManagement ResetPassword
/add-use-case UserManagement DisableAccount

# After design review, add missing details
/update-use-case Login "add error scenario for account locked after 5 failed attempts"
/update-use-case Login "add acceptance criterion AC-06: user receives lockout notification email"

# Validate quality
/validate-feature UserManagement
/validate-use-case Login

# Generate tests
/generate-bdd UserManagement
```

---

## Quality Assurance Workflow

### Embedded Checklists (Preventive)
All templates include quality checklists at the end (as HTML comments):
- PROJECT_TEMPLATE.md: 100-point checklist
- FEATURE_TEMPLATE.md: 100-point checklist
- USE_CASE_TEMPLATE.md: 100-point checklist
- BDD_FEATURE_TEMPLATE.md: 100-point checklist

Review these during creation to ensure completeness.

### Quality Gates in /generate-bdd (Preventive)
- **Phase 2D**: Cross-area consistency validation (baseline from Area 1)
- **Phase 5.5**: Area completion quality gate (pause between areas for review)

These prevent quality degradation during bulk generation.

### Validation Commands (Detective)
Run after creation to score and improve:
- Automatic scoring against checklist criteria
- Prioritized improvement recommendations
- Auto-fix with user control (6 options)
- Iterative re-validation until targets met

**Target Score**: 80/100 minimum across all dimensions

---

## Troubleshooting

### "Feature not found" Error
- Check feature name matches exactly (case-sensitive)
- List available: `ls Documents/Areas/*/Features/*.md`
- Verify feature was created or extracted

### Validation Shows Low Score
- Review specific issues in "Proposed Improvements" section
- Apply option 3 (Critical + High + Medium) for best results
- Re-validate to see progress
- Iterate until 80/100 reached

### Update Command Not Working
- Verify specification file exists
- Check update-details are clear and specific
- Agent may ask clarifying questions - answer them
- If unclear, break into smaller update requests

### Memory Out of Sync with Files
- Not critical - commands fallback to file search
- Memory enhances workflow but isn't required
- Manual file edits bypass memory (acceptable)

---

## Phase 1 → Phase 2 Bridge

### What Phase 1 Delivers

**Complete Specifications** including:
- ✅ WHAT to build (features, use cases, behavior)
- ✅ WHERE to build (architecture, bounded contexts, layers)
- ✅ HOW to build (tech stack, interfaces, contracts)
- ✅ WHY building (business value, user stories)
- ✅ ACCEPTANCE criteria (Given/When/Then, executable BDD)

### What Phase 2 Agents Need

Implementation agents consume specifications to generate code:
- Read PROJECT spec → understand architecture
- Read USE_CASE spec → know what to implement
- Read BDD files → understand acceptance criteria
- Generate code following architectural patterns
- Run BDD tests to validate correctness

**Phase 2 Commands** (Future):
- /implement-use-case {name}
- /implement-feature {name}
- /test-implementation {name}

---

## Best Practices

### 1. Start Small, Expand Gradually
- Create project + 1 feature + 1 use case first
- Validate the workflow
- Then scale to all features

### 2. Validate Early and Often
- Run /validate-* after each significant addition
- Fix issues immediately (easier than batch fixing)
- Maintain 80/100+ throughout

### 3. Use Update Commands for Enrichment
- After /extract-*, use /update-* to add business context
- Don't manually edit specs - use update commands
- Maintains memory sync and traceability

### 4. Leverage Quality Gates
- Review /generate-bdd Phase 5.5 prompts (area completion)
- Don't skip quality checks to "save time"
- Quality degradation compounds quickly

### 5. Iterate on Validation Feedback
- Don't fix all issues manually
- Use validation auto-fix options 1-3
- Let agents apply improvements
- Re-validate to confirm

---

## Quick Reference

### Greenfield: Create → Add → Generate → Validate
```
/create-solution
/add-feature {name}
/add-use-case {feature} {use-case}
/generate-bdd all
/validate-* all
```

### Brownfield: Extract → Enrich → Generate → Validate
```
/extract-solution
/extract-features
/update-solution "{enrichment}"
/update-feature {name} "{enrichment}"
/generate-bdd all
/validate-* all
```

### Maintenance: Update → Validate
```
/update-feature {name} "{changes}"
/validate-feature {name}
/update-bdd {name} "add scenario for new error condition"
/validate-bdd {name}
```

---

## Getting Help

- **This guide**: .claude/guides/WORKFLOW_GUIDE.md
- **Interactive help**: Run `/workflow-help`
- **Command syntax**: .claude/guides/COMMAND_SYNTAX.md
- **Naming conventions**: .claude/guides/NAMING_CONVENTIONS.md (folders, files, variables)
- **BDD best practices**: .claude/guides/BDD_CUCUMBER_GUIDE.md
- **Templates**: .claude/templates/*.md

---

**Ready to start?** Run `/workflow-help` for interactive guidance, or `/init` to begin a new prime the context!