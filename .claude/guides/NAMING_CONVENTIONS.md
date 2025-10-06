# Naming Conventions Reference Guide

This document defines the standard naming conventions for all elements in the workflow system. **All commands must enforce these conventions** to ensure consistency and cross-referencing integrity.

---

## Quick Reference Table

| Element | Convention | Example | Validation Rule |
|---------|------------|---------|-----------------|
| **Folders** | PascalCase | Areas/, Features/, UseCases/, Tasks/ | No spaces, dashes, or underscores |
| **Template Files** | UPPER_SNAKE_CASE | SOLUTION_TEMPLATE.md, USE_CASE_TEMPLATE.md | Always _TEMPLATE.md suffix |
| **DSL Variables** | snake_case | {solution_name}, {feature_name}, {task_id} | Always lowercase with underscores |
| **Special Docs** | UPPER_SNAKE_CASE | SOLUTION.md, DOMAIN_MODEL.md, ROADMAP.md | Generated/system files |
| **Item Docs** | UPPER_CASE | FEATURE.md, USE_CASE.md, TASK.md | Describes folder contents |
| **Status Files** | UPPER_SNAKE_CASE | FEATURE_STATUS.md, USECASE_STATUS.md | System-generated files |
| **Command Files** | kebab-case | create-solution.md, add-feature.md | All commands lowercase-hyphen |
| **Task IDs** | TYPE-NUMBER | TASK-001, BUG-042, REFACTOR-007 | Type prefix + sequential number |
| **Content Names** | PascalCase | UserManagement, SetTaskPriority | Feature/UseCase/Area names |
| **Platform Types** | lowercase | dotnet, java, python, typescript | Platform identifiers |
| **Enum Values** | lowercase | feature, bug, refactor, planned | Status/type values |

---

## Detailed Conventions by Category

### 1. Folder Names

**Convention:** PascalCase (no separators)

**Standard Folders:**
- `Documents/` - Root documentation folder
- `Areas/` - Bounded context areas
- `Features/` - Business features
- `UseCases/` - Use case specifications
- `Tasks/` - Work item tasks
- `Structure/` - Technical architecture
- `Domain/` - Domain models
- `Guides/` - Workflow guides
- `BDD/` - BDD feature files (optional location)

**Examples:**
```
✅ Documents/Areas/TaskManagement/Features/PriorityManagement/
✅ Documents/Tasks/TASK-001/
✅ Documents/Structure/Projects/

❌ Documents/areas/  (lowercase)
❌ Documents/task-management/  (kebab-case)
❌ Documents/use_cases/  (snake_case)
```

**Validation:** Reject folder names with spaces, hyphens, underscores, or lowercase

---

### 2. Template Files

**Convention:** UPPER_SNAKE_CASE with _TEMPLATE.md suffix

**All Templates:**
- `SOLUTION_TEMPLATE.md` - Solution specification
- `FEATURE_TEMPLATE.md` - Feature specification
- `USE_CASE_TEMPLATE.md` - Use case specification
- `DOMAIN_MODEL_TEMPLATE.md` - Domain model
- `STRUCTURE_TEMPLATE.md` - Technical structure
- `TASK_TEMPLATE.md` - Work item task
- `BACKLOG_TEMPLATE.md` - Sprint backlog
- `COMPONENT_TEMPLATE.md` - Component documentation
- `ROADMAP_TEMPLATE.md` - Implementation roadmap
- `BDD_FEATURE_TEMPLATE.md` - BDD feature file
- `SOLUTION_STATUS_TEMPLATE.md` - Solution status
- `FEATURE_STATUS_TEMPLATE.md` - Feature status
- `USECASE_STATUS_TEMPLATE.md` - Use case status
- `DOMAIN_STATUS_TEMPLATE.md` - Domain status

**Examples:**
```
✅ .claude/templates/SOLUTION_TEMPLATE.md
✅ .claude/templates/USE_CASE_TEMPLATE.md

❌ .claude/templates/solution-template.md  (kebab-case)
❌ .claude/templates/UseCaseTemplate.md  (PascalCase)
```

**Rationale:** Uppercase indicates "special system file", distinguishes from content

---

### 3. DSL Variable Names

**Convention:** snake_case (lowercase with underscores)

**Naming Pattern:**
- Descriptive, lowercase only
- Underscores for word separation
- Type hints optional: {variable_name:type}
- No abbreviations unless standard

**Common Variables:**
- `{solution_name}` - Solution identifier
- `{feature_name}` - Feature identifier
- `{use_case_name}` - Use case identifier
- `{task_id}` - Task identifier (includes type prefix)
- `{area_name}` - Area/bounded context name
- `{component_name}` - Component identifier
- `{platform_type}` - Platform (dotnet, java, python)
- `{task_type}` - Task type (feature, bug, refactor)
- `{task_status}` - Task status (planned, in-progress, completed)

**Examples:**
```
✅ {solution_name}
✅ {implementation_strategy}
✅ {affected_features}
✅ {has_roadmap}

❌ {SolutionName}  (PascalCase)
❌ {solution-name}  (kebab-case)
❌ {SOLUTION_NAME}  (UPPER_CASE for variables, only templates)
```

**Rationale:** DSL standard from COMMAND_SYNTAX.md

---

### 4. Special Document Files

**Convention:** UPPER_SNAKE_CASE or UPPER_CASE (indicates generated/system file)

**Standard Documents:**
- `SOLUTION.md` - Solution specification
- `FEATURE.md` - Feature specification (in feature folder)
- `USE_CASE.md` - Use case specification (in use case folder)
- `TASK.md` - Task specification (in task folder)
- `ROADMAP.md` - Implementation roadmap (in item folder)
- `DOMAIN_MODEL.md` - Domain model specification
- `STRUCTURE.md` - Technical structure specification
- `BACKLOG.md` - Sprint backlog
- `FEATURE_STATUS.md` - Feature implementation status
- `USECASE_STATUS.md` - Use case implementation status
- `DOMAIN_STATUS.md` - Domain implementation status
- `SOLUTION_STATUS.md` - Overall solution status
- `Notes.md` - Optional notes (in item folder)

**Examples:**
```
✅ Documents/SOLUTION.md
✅ Documents/Areas/TaskManagement/Features/UserManagement/FEATURE.md
✅ Documents/Tasks/TASK-001/TASK.md
✅ Documents/Areas/TaskManagement/Features/UserManagement/ROADMAP.md

❌ Documents/solution.md  (lowercase)
❌ Documents/Areas/TaskManagement/Features/user-management.md  (kebab-case)
```

**Rationale:** Uppercase distinguishes generated/system files from user content

---

### 5. Content Names (Features, Use Cases, Areas)

**Convention:** PascalCase (no spaces, hyphens, or underscores)

**Used For:**
- Feature names: UserManagement, PriorityManagement, CategoryManagement
- Use case names: SetTaskPriority, CreateTask, UpdateUserProfile
- Area names: TaskManagement, Authentication, ReportGeneration
- Domain entity names: Task, Category, Priority
- Component names: VttTools.Domain, API.Features.Tasks

**Input Handling:**
User can type with spaces, command converts:
- User types: "User Management"
- System converts: "UserManagement"
- Stored as: PascalCase

**Examples:**
```
✅ UserManagement
✅ SetTaskPriority
✅ CategoryManagement

❌ user management  (spaces not allowed in storage)
❌ user-management  (kebab-case)
❌ user_management  (snake_case)
❌ USERMANAGEMENT  (all caps)
```

**Validation Rules:**
- Must start with uppercase letter
- Each word starts with uppercase
- No spaces, hyphens, underscores
- Only alphanumeric characters

**Commands Must:**
- Accept user input with spaces: "User Management"
- Convert to PascalCase: "UserManagement"
- Validate result matches PascalCase pattern
- Reject if contains invalid characters

**Rationale:**
- Matches folder naming (PascalCase)
- Cross-platform safe
- No special character issues
- Professional appearance

---

### 6. Task IDs

**Convention:** TYPE-NUMBER (UPPER-KEBAB-NUMBER)

**Format:** `{TYPE_PREFIX}-{SEQUENTIAL_NUMBER}`

**Type Prefixes:**
- `TASK-` - Feature development tasks (TASK-001, TASK-042)
- `BUG-` - Bug fixes (BUG-001, BUG-023)
- `REFACTOR-` - Refactoring work (REFACTOR-001, REFACTOR-007)
- `DEBT-` - Technical debt (DEBT-001, DEBT-015)
- `INFRA-` - Infrastructure work (INFRA-001, INFRA-003)
- `DOCS-` - Documentation tasks (DOCS-001, DOCS-008)

**Number Format:**
- Zero-padded to 3 digits (001, 042, 123)
- Sequential within type
- Never reuse IDs

**Examples:**
```
✅ TASK-001
✅ BUG-042
✅ REFACTOR-007

❌ task-001  (lowercase)
❌ TASK_001  (underscore instead of hyphen)
❌ TASK1  (no separator or padding)
❌ Task-42  (mixed case, no zero padding)
```

**Rationale:**
- Type prefix enables quick identification
- Hyphen is readable and standard (Jira, GitHub use this)
- Zero-padding maintains sort order

---

### 7. Command Files

**Convention:** kebab-case with .md extension

**Pattern:** `{verb}-{noun}.md` or `{category}_{action}.md` for namespaced commands

**Examples:**
```
✅ create-solution.md
✅ add-feature.md
✅ validate-structure.md
✅ implement-task.md

❌ CreateSolution.md  (PascalCase)
❌ create_solution.md  (snake_case)
❌ CREATESOLUTION.md  (uppercase)
```

**Rationale:** Unix/Linux standard, cross-platform, readable

---

### 8. Platform and Enum Values

**Convention:** lowercase (no separators)

**Platform Types:**
- `dotnet`, `java`, `python`, `typescript`, `go`, `rust`, `ruby`, `php`

**Task Types:**
- `feature`, `bug`, `refactor`, `tech-debt`, `infrastructure`, `documentation`

**Task Status:**
- `planned`, `in-progress`, `completed`, `blocked`

**Priority Levels:**
- `critical`, `high`, `medium`, `low`

**Roadmap Types:**
- `feature`, `use-case`, `task`, `domain`

**Examples:**
```
✅ dotnet, python, typescript
✅ feature, bug, refactor
✅ planned, in-progress, completed

❌ DotNet  (PascalCase)
❌ PYTHON  (uppercase)
❌ tech_debt  (underscore)
❌ In-Progress  (mixed case)
```

**Rationale:** Simple, consistent, easy to type, no parsing issues

---

## Folder Structure Standards

### Current Recommended Structure

```
Documents/
├── SOLUTION.md                          (UPPER_CASE - generated doc)
├── SOLUTION_STATUS.md                   (UPPER_SNAKE - status file)
│
├── Structure/                           (PascalCase folder)
│   ├── STRUCTURE.md                     (UPPER_CASE - generated doc)
│   ├── Projects/                        (PascalCase - dotnet specific)
│   ├── Modules/                         (PascalCase - java specific)
│   └── Packages/                        (PascalCase - python/typescript specific)
│
├── Tasks/                               (PascalCase folder)
│   ├── TASK-001/                        (TYPE-NUMBER folder)
│   │   ├── TASK.md                      (UPPER_CASE - generated doc)
│   │   ├── ROADMAP.md                   (UPPER_CASE - optional)
│   │   └── Notes.md                     (PascalCase - user notes)
│   ├── BUG-042/
│   │   ├── TASK.md
│   │   └── ROADMAP.md
│   └── BACKLOG.md                       (UPPER_CASE - system file)
│
└── Areas/                               (PascalCase folder)
    └── {AreaName}/                      (PascalCase - e.g., TaskManagement)
        ├── Domain/                      (PascalCase folder)
        │   ├── DOMAIN_MODEL.md          (UPPER_SNAKE - spec)
        │   ├── DOMAIN_STATUS.md         (UPPER_SNAKE - status)
        │   └── ROADMAP.md               (UPPER_CASE - optional)
        │
        └── Features/                    (PascalCase folder)
            └── {FeatureName}/           (PascalCase - e.g., UserManagement)
                ├── FEATURE.md           (UPPER_CASE - spec)
                ├── FEATURE_STATUS.md    (UPPER_SNAKE - status)
                ├── ROADMAP.md           (UPPER_CASE - optional)
                ├── Notes.md             (PascalCase - optional user notes)
                │
                ├── BDD/                 (PascalCase folder - optional)
                │   └── {FeatureName}.feature
                │
                └── UseCases/            (PascalCase folder)
                    └── {UseCaseName}/   (PascalCase - e.g., SetTaskPriority)
                        ├── USE_CASE.md          (UPPER_SNAKE - spec)
                        ├── USECASE_STATUS.md    (UPPER_SNAKE - status)
                        ├── ROADMAP.md           (UPPER_CASE - optional)
                        └── BDD/                 (PascalCase - optional)
                            └── {UseCaseName}.feature
```

---

## File Naming Patterns

### Template Files (System)
- **Pattern:** `{PURPOSE}_TEMPLATE.md`
- **Case:** UPPER_SNAKE_CASE
- **Location:** `.claude/templates/`
- **Examples:** SOLUTION_TEMPLATE.md, FEATURE_TEMPLATE.md
- **Rule:** Always end with _TEMPLATE.md

### Specification Files (Generated)
- **Pattern:** `{TYPE}.md` or `{TYPE}_MODEL.md`
- **Case:** UPPER_SNAKE_CASE or UPPER_CASE
- **Location:** In item folder or root
- **Examples:**
  - `SOLUTION.md` (solution root)
  - `FEATURE.md` (in feature folder)
  - `USE_CASE.md` (in use case folder)
  - `TASK.md` (in task folder)
  - `DOMAIN_MODEL.md` (in domain folder)
  - `STRUCTURE.md` (in structure root)

### Status Files (System-Generated)
- **Pattern:** `{TYPE}_STATUS.md`
- **Case:** UPPER_SNAKE_CASE
- **Location:** Same location as specification
- **Examples:**
  - `SOLUTION_STATUS.md`
  - `FEATURE_STATUS.md`
  - `USECASE_STATUS.md`
  - `DOMAIN_STATUS.md`

### Roadmap Files (Optional Planning)
- **Pattern:** `ROADMAP.md` (simple, always same name)
- **Case:** UPPER_CASE
- **Location:** In item folder
- **Examples:**
  - `Documents/Areas/TaskManagement/Features/UserManagement/ROADMAP.md`
  - `Documents/Tasks/TASK-042/ROADMAP.md`
  - `Documents/Areas/TaskManagement/Domain/ROADMAP.md`
- **NOT:** {name}_ROADMAP.md or IMPLEMENTATION_ROADMAP.md

### BDD Feature Files
- **Pattern:** `{FeatureName}.feature` or `{UseCaseName}.feature`
- **Case:** PascalCase with .feature extension
- **Location:**
  - Feature-level: `Documents/Areas/{area}/Features/{feature}/BDD/{feature}.feature`
  - UseCase-level: `Documents/Areas/{area}/Features/{feature}/UseCases/{usecase}/BDD/{usecase}.feature`
- **Examples:**
  - `UserManagement.feature`
  - `SetTaskPriority.feature`

### Notes Files (User-Created)
- **Pattern:** `Notes.md`
- **Case:** PascalCase
- **Location:** In item folder
- **Purpose:** User's implementation notes, observations
- **Not system-generated:** User manually creates/edits

---

## Content Name Conventions

### Feature Names

**Convention:** PascalCase

**Rules:**
- Each word capitalized
- No spaces in storage (folders/variables)
- No hyphens or underscores
- Descriptive noun phrase

**User Input Handling:**
- User can type: "User Management" or "user management"
- Command converts to: "UserManagement"
- Validates: Must be valid PascalCase after conversion

**Examples:**
```
✅ UserManagement
✅ PriorityManagement
✅ CategoryFiltering
✅ ReportGeneration

❌ user management  (spaces - must be converted)
❌ user-management  (hyphens)
❌ user_management  (underscores)
❌ Usermanagement  (not clear word boundaries)
```

**Folder Example:**
```
Documents/Areas/TaskManagement/Features/UserManagement/
                                         ^^^^^^^^^^^^^^
                                         PascalCase
```

### Use Case Names

**Convention:** PascalCase (verb-noun pattern preferred)

**Rules:**
- Same as feature names
- Prefer action verb: SetTaskPriority, CreateUser, UpdateProfile
- Each word capitalized

**User Input Handling:**
- User types: "Set Task Priority"
- System converts: "SetTaskPriority"

**Examples:**
```
✅ SetTaskPriority
✅ CreateTask
✅ UpdateUserProfile
✅ DeleteCategory
✅ ViewTasksByPriority

❌ set task priority  (spaces)
❌ set-task-priority  (kebab-case)
❌ settaskpriority  (no word boundaries)
```

### Area Names (Bounded Contexts)

**Convention:** PascalCase

**Rules:**
- Domain-meaningful name
- Represents bounded context
- No spaces, hyphens, underscores

**Examples:**
```
✅ TaskManagement
✅ Authentication
✅ ReportGeneration
✅ UserInterface
✅ DataPersistence

❌ task_management  (snake_case)
❌ Task-Management  (kebab-case)
```

---

## Task ID Format

### Structure: TYPE-NUMBER

**Type Prefixes (UPPER):**
- `TASK-` - Feature development
- `BUG-` - Bug fixes
- `REFACTOR-` - Code refactoring
- `DEBT-` - Technical debt
- `INFRA-` - Infrastructure
- `DOCS-` - Documentation

**Number Format:**
- Zero-padded to 3 digits: 001, 042, 123
- Sequential per type
- Never reused

**Generation Logic:**
1. Find all existing tasks of type
2. Extract highest number
3. Increment by 1
4. Zero-pad to 3 digits
5. Prefix with type

**Examples:**
```
✅ TASK-001 (first feature task)
✅ BUG-042 (42nd bug)
✅ REFACTOR-007 (7th refactoring)

❌ task-1  (lowercase, no padding)
❌ TASK_001  (underscore)
❌ T-001  (abbreviated type)
```

**Folder Path:** `Documents/Tasks/TASK-001/`

---

## Command Argument Validation

### Commands Must Validate and Convert:

**Feature/Use Case/Area Names:**
```python
# Pseudo-code for validation
input = user_input.strip()

# Allow spaces during input
if contains_spaces(input):
    input = to_pascal_case(input)  # "User Management" → "UserManagement"

# Validate result
if not is_pascal_case(input):
    abort("Invalid name. Must be PascalCase (e.g., UserManagement)")

# Validate characters
if contains_special_chars(input):
    abort("Name must contain only letters and numbers")

feature_name = input  # Now guaranteed PascalCase
```

**Task Types:**
```python
valid_types = ["feature", "bug", "refactor", "tech-debt", "infrastructure", "documentation"]

if task_type not in valid_types:
    abort(f"Invalid type. Must be one of: {valid_types}")
```

**Platform Types:**
```python
valid_platforms = ["dotnet", "java", "python", "typescript", "go", "rust", "ruby", "php"]

if platform_type not in valid_platforms:
    abort(f"Invalid platform. Must be one of: {valid_platforms}")
```

---

## Variable Type Conventions

### Boolean Flags
- **Pattern:** `{has_*}`, `{is_*}`, `{needs_*}`
- **Values:** `true` or `false` (lowercase)
- **Examples:** `{has_frontend}`, `{is_enabled}`, `{needs_auth}`

### Lists/Arrays
- **Pattern:** Plural noun
- **Examples:** `{features}`, `{components}`, `{use_cases}`
- **Format:** `[item1, item2, item3]`

### Counts
- **Pattern:** `{*_count}` or `{total_*}`
- **Examples:** `{feature_count}`, `{total_tasks}`
- **Type:** number

### Dates
- **Pattern:** `{*_date}` or `{last_*}`, `{created_*}`
- **Examples:** `{created_date}`, `{last_updated}`
- **Format:** ISO date (YYYY-MM-DD) or full timestamp

---

## Cross-Platform Considerations

### File Paths in Commands

**Always Use Forward Slashes:**
```
✅ Documents/Areas/TaskManagement/Features/UserManagement/FEATURE.md
❌ Documents\Areas\TaskManagement\Features\UserManagement\FEATURE.md
```

**Rationale:** Forward slashes work on all platforms (Windows converts automatically)

### Case Sensitivity

**Assume Case-Sensitive:**
- Even on Windows (which is case-insensitive), treat paths as case-sensitive
- This ensures cross-platform compatibility
- `features/` ≠ `Features/` in commands

---

## Migration Rules for Existing Projects

### If Project Uses Different Conventions:

**Option 1: Strict (Recommended)**
- Abort with clear error
- Show expected vs. actual
- Guide user to fix

**Option 2: Lenient (Migrate)**
- Accept old format
- Convert to new format automatically
- Log warning

**Option 3: Dual Support**
- Check both old and new locations
- Prefer new format
- Deprecated warning for old format

---

## Enforcement in Commands

### All Creation Commands Must:

1. **Validate Input:**
   ```
   - Check {feature_name} matches PascalCase or can be converted
   - Reject if contains invalid characters
   - Convert "User Management" → "UserManagement"
   ```

2. **Create Folders:**
   ```
   mkdir -p Documents/Areas/{area}/Features/{feature_name}
                    ^^^^^^^^         ^^^^^^^^  ^^^^^^^^^^^^
                    PascalCase       PascalCase PascalCase
   ```

3. **Write Files:**
   ```
   Documents/Areas/{area}/Features/{feature_name}/FEATURE.md
                                                   ^^^^^^^^^^
                                                   UPPER_CASE
   ```

4. **Store Variables:**
   ```
   - name: "{feature_name}"      (PascalCase value)
   - entityType: "feature"       (lowercase type)
   - observations: ["feature_type: {value}"]  (snake_case variables)
   ```

---

## Quick Validation Checklist

**Before Creating Any File, Verify:**
- [ ] Folder names are PascalCase (no spaces/hyphens/underscores)
- [ ] Template files are UPPER_SNAKE_CASE with _TEMPLATE.md
- [ ] Generated docs are UPPER_CASE or UPPER_SNAKE_CASE
- [ ] Variables in memory are snake_case
- [ ] Content names (features/use cases) are PascalCase
- [ ] Task IDs are TYPE-NUMBER format
- [ ] Command files are kebab-case
- [ ] Enum values (types, statuses) are lowercase
- [ ] File paths use forward slashes
- [ ] All names validated before use

---

## Common Mistakes to Avoid

❌ **Mixing conventions:**
```
Documents/areas/task_management/features/user-management.md
          ^^^^^ ^^^^^^^^^^^^^^^ ^^^^^^^^ ^^^^^^^^^^^^^^^
          Wrong: lowercase, snake_case, kebab-case
```

✅ **Correct:**
```
Documents/Areas/TaskManagement/Features/UserManagement/FEATURE.md
          ^^^^^ ^^^^^^^^^^^^^^ ^^^^^^^^ ^^^^^^^^^^^^^^ ^^^^^^^^^^
          Right: PascalCase folders, UPPER_CASE file
```

❌ **Using spaces in stored names:**
```
feature_name = "User Management"  # Will break paths
```

✅ **Convert spaces:**
```
user_input = "User Management"
feature_name = toPascalCase(user_input)  # "UserManagement"
```

❌ **Inconsistent file naming:**
```
Documents/Tasks/TASK-001/task.md              # lowercase
Documents/Tasks/TASK-001/Task-Roadmap.md      # mixed case
```

✅ **Consistent:**
```
Documents/Tasks/TASK-001/TASK.md              # UPPER
Documents/Tasks/TASK-001/ROADMAP.md           # UPPER
```

---

## Reference Files

**See Also:**
- **DSL Syntax:** `.claude/guides/COMMAND_SYNTAX.md` - Variable syntax rules
- **Workflow Guide:** `.claude/guides/WORKFLOW_GUIDE.md` - Usage examples
- **Main Config:** `CLAUDE.md` - Quick reference link

**This Document Location:** `.claude/guides/NAMING_CONVENTIONS.md`

**Always consult this guide before:**
- Creating new templates
- Writing new commands
- Adding validation logic
- Generating file paths
- Creating folder structures

---

**Last Updated:** 2025-10-03
**Version:** 1.0.0
**Status:** Production Standard
