---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Bash, TodoWrite]
description: Define coding standards for new project through guided Q&A (greenfield)
argument-hint:
---

# Define Coding Standards Command

Creates comprehensive coding standards document for new project through guided, technology-aware Q&A session. Defines conventions, formatting rules, patterns, and quality requirements that will guide all Phase 2 code generation.

**Platform**: Cross-platform (Windows/Linux/macOS)

**Supported Languages**: C#, C++, TypeScript/JavaScript, Java, Kotlin, Scala, Python, Go, Rust, Ruby, PHP, Visual Basic, Razor

## Phase 0: Validation & Technology Detection

- **STEP 0A**: Verify this is greenfield (no Source/ or CODING_STANDARDS.md already exist)

- **STEP 0B**: Load solution specification:
  - Read `Documents/SOLUTION.md`
  - Extract technology stack
  - Extract architecture pattern
  - Extract frameworks/libraries

- **STEP 0C**: Detect technologies from project spec:
  ```
  Backend: {C#, Java, Python, Go, Rust, Node.js, etc.}
  Frontend: {React, Angular, Vue, Blazor, etc.}
  Databases: {SQL Server, PostgreSQL, MongoDB, etc.}
  ```

## Phase 1: Technology-Aware Guided Standards Definition

- **STEP 1A**: Use Task tool with solution-engineer agent for Q&A:
  ```markdown
  ROLE: Coding Standards Definition Expert

  TASK: Guide user through defining comprehensive coding standards

  PROJECT_NAME: {from project spec}
  TECHNOLOGY_STACK: {detected_tech_stack}
  ARCHITECTURE_PATTERN: {from project spec}

  ## GUIDED Q&A PROCESS

  Present questions ONE AT A TIME, wait for answer, then next question.
  Provide RECOMMENDATIONS with rationale for each question.
  Allow user to accept recommendation or specify custom value.

  ---

  ### SECTION 1: General Conventions

  **Q1.1**: Do you want to follow industry-standard conventions for your stack?
  - Recommendation: YES (C#: Microsoft standards, Python: PEP 8, JavaScript: Airbnb/Standard, etc.)
  - If NO: Will ask detailed questions per category

  **Q1.2**: Project naming convention?
  - Recommendation: Based on tech stack (C#: PascalCase namespaces, Python: snake_case modules, etc.)

  ---

  <foreach {language} in {technology_stack}>

  ### SECTION 2: {language} Formatting Standards

  **Q2.1-{language}**: Indentation style?
  - Options:
    - **C#**: 4 spaces (Microsoft standard)
    - **C++**: 2 or 4 spaces (varies by team, Google uses 2, LLVM uses 2)
    - **TypeScript/JavaScript**: 2 spaces (industry standard)
    - **Java**: 4 spaces (Oracle standard)
    - **Kotlin**: 4 spaces (official style guide)
    - **Scala**: 2 spaces (Scala style guide)
    - **Python**: 4 spaces (PEP 8 REQUIRED)
    - **Go**: Tabs (go fmt standard - NOT configurable)
    - **Rust**: 4 spaces (rustfmt default)
    - **Ruby**: 2 spaces (community standard)
    - **PHP**: 4 spaces (PSR-12 standard)
    - **Visual Basic**: 4 spaces (Microsoft standard)
    - **Razor**: 4 spaces (inherits from C#)
  - Custom: Specify tabs or N spaces
  - Recommendation: [language default]
  - Rationale: {explain why this is standard}

  **Q2.2-{language}**: Brace placement? (if applicable)
  - Options:
    - **K&R style** (opening brace on same line): `if (x) {`
    - **Allman style** (opening brace on new line):
      ```
      if (x)
      {
      ```
  - Recommendation:
    - C#: Allman or K&R (both common, Allman traditional for .NET)
    - C++: K&R (most common, Google style, LLVM style)
    - Java: K&R (Oracle standard)
    - Kotlin: K&R (official style guide)
    - Scala: K&R (Scala style guide)
    - JavaScript/TypeScript: K&R (universal)
    - PHP: K&R (PSR-12 standard)
    - Visual Basic: N/A (no braces in VB)
    - Razor: Follows C# conventions
  - Rationale: {explain why this is preferred}

  **Q2.3-{language}**: Line length limit?
  - Options: 80, 100, 120, 140, No limit
  - Recommendations:
    - C#: 120 (modern IDEs)
    - C++: 100-120 (Google uses 80, LLVM uses 80)
    - TypeScript/JavaScript: 100-120
    - Java: 120
    - Kotlin: 120 (official style guide)
    - Scala: 100 (Scala style guide)
    - Python: 88 (Black formatter default) or 79 (PEP 8)
    - Go: 100 (community standard)
    - Rust: 100 (rustfmt default)
    - Ruby: 120
    - PHP: 120 (PSR-12 standard)
    - Visual Basic: 120
    - Razor: 120 (inherits from C#)
  - Rationale: {explain readability vs practicality}

  **Q2.4-{language}**: Quote style? (if applicable)
  - Options:
    - Single quotes `'`
    - Double quotes `"`
  - Recommendations:
    - C#: Double quotes (only option)
    - C++: Double quotes (single quotes are for chars)
    - JavaScript/TypeScript: Single quotes (industry standard)
    - Java: Double quotes (only option)
    - Kotlin: Double quotes (single quotes for chars)
    - Scala: Double quotes (single quotes for chars)
    - Python: Single or double (PEP 8 allows both, be consistent)
    - Go: Double quotes (single quotes for runes)
    - Rust: Double quotes (single quotes for chars)
    - Ruby: Single quotes (double when interpolation needed)
    - PHP: Single quotes (double when interpolation needed)
    - Visual Basic: Double quotes (only option)
    - Razor: Double quotes in C# sections
  - Rationale: Language-specific rules, consistency

  **Q2.5-{language}**: Semicolons? (JavaScript/TypeScript only)
  - Options: Required, Optional (ASI)
  - Recommendation: Required (safer, explicit)
  - Rationale: Prevents edge-case bugs with ASI

  **Q2.6-{language}**: Trailing commas? (multi-line structures)
  - Options: Required, Optional, Forbidden
  - Recommendation: Required
  - Rationale: Cleaner git diffs, easier to add items

  **Q2.7-{language}**: Using/Import organization?
  - **C#**:
    - Option A: GlobalUsings.cs per project (modern, clean files)
    - Option B: Per-file using directives
    - Option C: Hybrid (GlobalUsings + per-file for rare imports)
    - Recommendation: Option A (GlobalUsings.cs)
    - Rationale: Cleaner files, consistent imports, C# 10+ feature
  - **TypeScript/JavaScript**:
    - Import sorting: Alphabetical, Grouped (external/local), None
    - Recommendation: Grouped (external first, then local)
  - **Java**:
    - Import style: Grouped, Alphabetical, Wildcard allowed?
    - Recommendation: Grouped, no wildcards (except java.* in some cases)
  - **Python**:
    - Import style: PEP 8 (standard library, third-party, local)
    - Tool: isort, none
    - Recommendation: PEP 8 with isort

  **Q2.8-{language}**: Spacing between class members?
  - Recommendation:
    - Properties/fields: No blank lines
    - Methods: One blank line between

  **Q2.9-{language}**: Private field naming? (if applicable)
  - Options:
    - **C#**: `_camelCase` (Microsoft standard)
    - **Java**: `camelCase` or `mCamelCase`
    - **Python**: `_snake_case` (protected) or `__snake_case` (private)
  - Recommendation: [language standard]

  **Q2.10-{language}**: var/let/const usage?
  - **C#**:
    - Options: `var` preferred, Explicit types preferred, Context-dependent
    - Recommendation: `var` for local variables (cleaner, modern)
  - **JavaScript/TypeScript**:
    - Options: `const` by default, `let` when needed, `var` forbidden
    - Recommendation: `const` by default, `let` when reassigning
    - Rationale: Immutability by default

  **Q2.11-{language}**: Null checking style?
  - **C#**:
    - Options: `is null`, `== null`, `is not null`
    - Recommendation: `is null` / `is not null` (modern, pattern matching)
  - **TypeScript**:
    - Options: Optional chaining `?.`, explicit checks
    - Recommendation: Optional chaining (safer, concise)

  **Q2.12-{language}**: String operations?
  - **C#**:
    - Options: String interpolation `$""`, `string.Format()`, Concatenation `+`
    - Recommendation: String interpolation (readable, modern)
  - **JavaScript/TypeScript**:
    - Options: Template literals `` `${x}` ``, Concatenation
    - Recommendation: Template literals (readable, supports multi-line)

  **Q2.13-{language}**: Modern language features usage?
  - **C#**:
    - Primary constructors? (C# 12+) → Recommendation: YES (cleaner DI)
    - Collection expressions `[]`? (C# 12+) → Recommendation: YES (modern)
    - File-scoped namespaces? (C# 10+) → Recommendation: YES (less indentation)
    - Expression-bodied members `=>`? → Recommendation: YES for single-line
    - GlobalUsings.cs pattern? (C# 10+) → Recommendation: YES (cleaner files)
  - **C++**:
    - Auto keyword? (C++11+) → Recommendation: YES when type is obvious
    - Range-based for loops? (C++11+) → Recommendation: YES (cleaner)
    - Smart pointers? (C++11+) → Recommendation: YES (safer memory)
    - nullptr vs NULL? → Recommendation: nullptr (type-safe)
  - **TypeScript**:
    - Arrow functions always with parentheses? → Recommendation: YES (consistency)
    - Nullish coalescing `??`? → Recommendation: YES (precise null handling)
    - Optional chaining `?.`? → Recommendation: YES (safer)
  - **Java**:
    - var keyword? (Java 10+) → Recommendation: YES when type is obvious
    - Records? (Java 14+) → Recommendation: YES for immutable data
    - Text blocks? (Java 15+) → Recommendation: YES for multi-line strings
  - **Kotlin**:
    - Data classes for DTOs? → Recommendation: YES (concise)
    - Null safety operators? → Recommendation: YES (safer)
    - Extension functions? → Recommendation: YES (readability)
  - **Scala**:
    - Case classes for immutables? → Recommendation: YES (functional style)
    - Pattern matching? → Recommendation: YES (expressive)
    - For comprehensions? → Recommendation: YES (readable)
  - **Python**:
    - Type hints? (Python 3.5+) → Recommendation: YES (better IDE support)
    - f-strings? (Python 3.6+) → Recommendation: YES (readable)
    - Dataclasses? (Python 3.7+) → Recommendation: YES (less boilerplate)
  - **Go**:
    - Short variable declaration `:=`? → Recommendation: YES (idiomatic)
    - Defer for cleanup? → Recommendation: YES (safer)
  - **Rust**:
    - Pattern matching? → Recommendation: YES (idiomatic)
    - Ownership rules? → Recommendation: FOLLOW (required)
    - Result<T, E> for errors? → Recommendation: YES (no exceptions)
  - **PHP**:
    - Type declarations? (PHP 7+) → Recommendation: YES (safer)
    - Null coalescing `??`? (PHP 7+) → Recommendation: YES
    - Arrow functions? (PHP 7.4+) → Recommendation: YES for short callbacks
  - **Visual Basic**:
    - Option Explicit On? → Recommendation: YES (prevent typos)
    - Option Strict On? → Recommendation: YES (type safety)

  </foreach>

  ---

  ### SECTION 3: Naming Conventions

  <foreach {language} in {technology_stack}>

  **Q3.1-{language}**: Class/Interface naming?
  - Recommendation:
    - C#: PascalCase, interfaces with `I` prefix
    - C++: PascalCase or snake_case (varies: Google uses PascalCase, LLVM uses snake_case)
    - Java: PascalCase, interfaces no prefix
    - Kotlin: PascalCase, interfaces no prefix
    - Scala: PascalCase
    - Python: PascalCase for classes
    - JavaScript/TypeScript: PascalCase
    - Go: PascalCase for exported, camelCase for private
    - Rust: PascalCase for types, snake_case for modules
    - Ruby: PascalCase
    - PHP: PascalCase (PSR-1 standard)
    - Visual Basic: PascalCase
    - Razor: Follows C# conventions
  - Custom: Specify pattern

  **Q3.2-{language}**: Method/Function naming?
  - Recommendation:
    - C#: PascalCase, async methods with `Async` suffix
    - C++: camelCase or snake_case (Google uses camelCase, LLVM uses snake_case)
    - Java: camelCase
    - Kotlin: camelCase
    - Scala: camelCase
    - Python: snake_case
    - JavaScript/TypeScript: camelCase
    - Go: camelCase for exported, mixedCaps (no underscores)
    - Rust: snake_case
    - Ruby: snake_case
    - PHP: camelCase (PSR-1 standard)
    - Visual Basic: PascalCase
    - Razor: PascalCase (C# methods)

  **Q3.3-{language}**: Variable/Parameter naming?
  - Recommendation:
    - C#: camelCase
    - C++: snake_case or camelCase (team-dependent)
    - Java: camelCase
    - Kotlin: camelCase
    - Scala: camelCase
    - Python: snake_case
    - JavaScript/TypeScript: camelCase
    - Go: camelCase (mixedCaps)
    - Rust: snake_case
    - Ruby: snake_case
    - PHP: camelCase (PSR-1 standard) or snake_case
    - Visual Basic: camelCase
    - Razor: camelCase (C# code)

  **Q3.4-{language}**: Constants naming?
  - Recommendation:
    - C#: PascalCase (like properties)
    - C++: UPPER_SNAKE_CASE or kConstantName (Google style)
    - Java: UPPER_SNAKE_CASE
    - Kotlin: UPPER_SNAKE_CASE
    - Scala: camelCase (like vals)
    - Python: UPPER_SNAKE_CASE
    - JavaScript/TypeScript: UPPER_SNAKE_CASE or camelCase with const
    - Go: PascalCase for exported, camelCase for private
    - Rust: UPPER_SNAKE_CASE
    - Ruby: UPPER_SNAKE_CASE
    - PHP: UPPER_SNAKE_CASE
    - Visual Basic: PascalCase
    - Razor: PascalCase (C# constants)

  </foreach>

  ---

  ### SECTION 4: Architecture & Patterns

  **Q4.1**: Error handling approach?
  - Options:
    - Exceptions for exceptional cases
    - Result<T> pattern (railway-oriented)
    - Hybrid approach
  - Recommendation: Based on {architecture_pattern} from project spec
  - Rationale: {explain based on architecture}

  **Q4.2**: Null handling?
  - Options:
    - Nullable reference types enabled (C#)
    - Optional types (Java, Kotlin)
    - Strict null checks (TypeScript)
  - Recommendation: Enable strictest checking available
  - Rationale: Prevents null reference errors at compile time

  **Q4.3**: Dependency injection?
  - Options:
    - Constructor injection (primary)
    - Property injection (rare cases)
    - Method injection (rare cases)
  - Recommendation: Constructor injection with primary constructors (C# 12) or standard constructor
  - Rationale: Explicit dependencies, testability

  **Q4.4**: Async patterns?
  - Options:
    - Async suffix on method names
    - ConfigureAwait(false) in libraries
  - Recommendation:
    - Async suffix: ALWAYS
    - ConfigureAwait: Not needed in ASP.NET Core, use in libraries
  - Rationale: Clear async intent, proper context handling

  ---

  ### SECTION 5: Testing Standards

  **Q5.1**: Test framework?
  - Extract from project spec or ask:
    - C#: xUnit (recommended), NUnit, MSTest
    - JavaScript/TypeScript: Jest, Vitest, Mocha
    - Java: JUnit 5
    - Python: pytest
  - Recommendation: [Most popular for stack]

  **Q5.2**: Test file naming?
  - Options:
    - `{ClassName}.test.{ext}` or `{ClassName}Tests.{ext}` or `{ClassName}Spec.{ext}`
  - Recommendation: Based on test framework convention

  **Q5.3**: Test method naming?
  - Options:
    - `MethodName_Scenario_ExpectedResult`
    - `Test_MethodName_Scenario`
    - Descriptive sentence
  - Recommendation: Descriptive sentence (readable)

  **Q5.4**: Code coverage target?
  - Options: 70%, 80%, 90%, 100%
  - Recommendation: 80% (pragmatic balance)
  - Rationale: High coverage without diminishing returns

  ---

  ### SECTION 6: Code Quality

  **Q6.1**: Linter/Formatter?
  - Recommendations:
    - C#: Roslyn analyzers, EditorConfig
    - TypeScript/JavaScript: ESLint + Prettier
    - Java: Checkstyle, SpotBugs
    - Python: flake8 + Black (or ruff)
    - Go: go fmt + golangci-lint
    - Rust: rustfmt + clippy
  - Accept recommendation or customize

  **Q6.2**: Static analysis?
  - Options: Enabled (strict), Enabled (warnings), Disabled
  - Recommendation: Enabled (strict)
  - Rationale: Catch issues early

  **Q6.3**: Complexity limits?
  - Options:
    - Cyclomatic complexity: 10, 15, 20
    - Method length: 20, 50, 100 lines
  - Recommendation: Complexity 10, Length 50
  - Rationale: Maintainable, testable code

  ---

  ### SECTION 7: Git Conventions

  **Q7.1**: Commit message format?
  - Options:
    - Conventional Commits (type(scope): description)
    - Sentence case
    - Custom format
  - Recommendation: Conventional Commits
  - Rationale: Automated changelog generation, semantic versioning

  **Q7.2**: Branch naming?
  - Options:
    - feature/description
    - {type}/{ticket-number}-{description}
    - {name}/{description}
  - Recommendation: {type}/{ticket-number}-{description}
  - Rationale: Clear, traceable

  ---

  ## OUTPUT

  Generate complete standards specification from answers.
  ```

- **STEP 1B**: Collect all answers through Q&A dialogue

- **STEP 1C**: Confirm with user:
  ```
  Review Standards Summary:
  - Technologies: {list}
  - Formatting: {key decisions}
  - Naming: {key decisions}
  - Architecture: {key decisions}
  - Testing: {key decisions}
  - Git: {key decisions}

  Proceed with these standards? [Y/N]
  ```

## Phase 2: Generate Focused Guide Documents

- **STEP 2A**: Create overview document `Documents/Guides/CODING_STANDARDS.md` with:
  - Quick Reference (one-page summary)
  - Architecture Overview (from project spec)
  - Links to focused guides
  - Configuration files to create
  - Summary and next steps

- **STEP 2B**: For each detected technology, create focused style guide:

  <if ({csharp_detected})>
  - Create `Documents/Guides/CSHARP_STYLE_GUIDE.md`:
    - Table of Contents (hyperlinked)
    - Code Formatting (all Q&A answers from Section 2)
    - Language Features & Modern C# Patterns (Q2.13 answers)
    - Naming Conventions (Section 3 answers)
    - Domain model patterns, Contract separation, Error handling
    - API patterns, Storage patterns, File organization
    - Code Review Checklist (comprehensive)
  </if>

  <if ({typescript_detected})>
  - Create `Documents/Guides/TYPESCRIPT_STYLE_GUIDE.md`:
    - Table of Contents
    - Code Formatting (Q&A answers)
    - TypeScript Strictness
    - Component structure, State management, API integration
    - Code Review Checklist
  </if>

  {Similar for Java, Kotlin, Scala, Python, Go, Rust, Ruby, PHP, C++, Visual Basic}

- **STEP 2C**: Create `Documents/Guides/TESTING_GUIDE.md`:
  - Testing frameworks (from Section 5)
  - Test file naming and organization
  - Test structure patterns
  - Coverage targets and best practices
  - Testing checklists

- **STEP 2D**: Create `Documents/Guides/CODE_QUALITY_GUIDE.md`:
  - Code smells by language
  - Anti-patterns to avoid
  - Security patterns (from architecture understanding)
  - Performance optimization patterns
  - Complexity metrics (Section 6)
  - Code quality checklist

- **STEP 2E**: Include in each guide:
  - Examples for every convention
  - Rationale for why each standard was chosen
  - ✅ Correct and ❌ Incorrect examples
  - MANDATORY/PREFERRED/AVOID markers

## Phase 3: Configuration File Generation Guidance

- **STEP 3A**: Display guidance for creating config files:
  ```
  Configuration Files to Create:

  <if ({csharp_detected} and {globalusings_selected})>
  For C#:
  1. Create GlobalUsings.cs in each project root:
     - Core/GlobalUsings.cs
     - Domain/GlobalUsings.cs
     - Application/GlobalUsings.cs
     - Infrastructure/GlobalUsings.cs
     Template provided in CODING_STANDARDS.md
  </if>

  <if ({typescript_detected})>
  For TypeScript:
  1. Create .prettierrc.json (template in CODING_STANDARDS.md)
  2. Create/update eslint.config.js (template in CODING_STANDARDS.md)
  3. Update tsconfig.json with strict flags
  </if>

  {similar for each language}

  Universal:
  - Create .editorconfig in repository root (template in CODING_STANDARDS.md)
  ```

## Phase 4: Reporting

- **STEP 4A**: Display summary:
  ```
  ✓ CODING STANDARDS DEFINED

  Created Guides:
  - Documents/Guides/CODING_STANDARDS.md (overview + quick reference + navigation)
  <if ({csharp_detected})>
  - Documents/Guides/CSHARP_STYLE_GUIDE.md (C# formatting, patterns, checklist)
  </if>
  <if ({typescript_detected})>
  - Documents/Guides/TYPESCRIPT_STYLE_GUIDE.md (TypeScript/React patterns, checklist)
  </if>
  {similar for other languages}
  - Documents/Guides/TESTING_GUIDE.md (test frameworks, patterns, checklists)
  - Documents/Guides/CODE_QUALITY_GUIDE.md (code smells, anti-patterns, security)

  Standards Defined For:
  - {language 1}: {convention_count} conventions
  - {language 2}: {convention_count} conventions

  Key Decisions:
  - Indentation: {summary}
  - Brace style: {summary}
  - Naming: {summary}
  - Architecture: {summary}
  - Testing: {coverage}%

  Configuration Files:
  - Templates provided in each guide
  - Create config files before starting implementation

  Next Steps:
  1. Review Documents/Guides/CODING_STANDARDS.md (overview + navigation)
  2. Review language-specific guides (CSHARP_STYLE_GUIDE.md, etc.)
  3. Create configuration files (guidance in guides)
  4. Commit all guides to version control
  5. Run /preparation:configure-implementation to set preferences
  6. All guides will guide Phase 2 code generation
  ```

**IMPORTANT NOTES**:
- **For greenfield only**: New projects without existing code
- **Brownfield**: Use /extract-coding-standards instead
- **Technology-aware**: Q&A adapts to project tech stack
- **Industry recommendations**: Provides standards with rationale for each language
- **Customizable**: User can accept or override any recommendation
- **Split output**: Creates focused guides (overview + language guides + testing + quality)
- **Configuration templates**: Includes .editorconfig, language-specific configs
- **Output location**: `Documents/Guides/` folder with multiple focused documents:
  - CODING_STANDARDS.md (overview + TOC + navigation)
  - CSHARP_STYLE_GUIDE.md (if C# in stack)
  - TYPESCRIPT_STYLE_GUIDE.md (if TypeScript in stack)
  - TESTING_GUIDE.md
  - CODE_QUALITY_GUIDE.md
  - {LANGUAGE}_STYLE_GUIDE.md (for other languages)
- **Updatable**: Can be modified manually or via `/update` commands
- **Critical prerequisite**: For Phase 2 implementation
