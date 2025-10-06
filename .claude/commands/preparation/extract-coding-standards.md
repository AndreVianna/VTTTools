---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Extract coding standards and conventions from existing codebase (brownfield)
argument-hint:
---

# Extract Coding Standards Command

Analyzes existing codebase to reverse-engineer coding standards, conventions, patterns, and architectural approaches. Creates comprehensive `Documents/Guides/CODING_STANDARDS.md` with detailed formatting rules, naming conventions, and language-specific patterns.

**Platform**: Cross-platform (Windows/Linux/macOS)

**Supported Languages**: C#, C++, TypeScript/JavaScript, Java, Kotlin, Scala, Python, Go, Rust, Ruby, PHP, Visual Basic, Razor

## Phase 0: Validation

- **STEP 0A**: Verify Source/ directory exists
  <if (not found)>
  - Error: "No Source/ directory found. For greenfield projects, use /define-coding-standards instead."
  </if>

- **STEP 0B**: Check if Documents/Guides/CODING_STANDARDS.md already exists
  <if (exists)>
  - Warning: "Documents/Guides/CODING_STANDARDS.md exists. Overwrite? [Y/N]"
  </if>

## Phase 0.5: Technology Stack Detection

- **STEP 0.5A**: Detect technologies by scanning for project files:
  ```
  C#: *.csproj, *.sln, *.cs files → {csharp_detected}
  C++: CMakeLists.txt, *.vcxproj, *.cpp/*.hpp/*.h files → {cpp_detected}
  TypeScript/JavaScript: package.json, tsconfig.json, *.ts/*.tsx/*.js/*.jsx → {typescript_detected}
  Java: pom.xml, build.gradle, *.java → {java_detected}
  Kotlin: build.gradle.kts, *.kt/*.kts → {kotlin_detected}
  Scala: build.sbt, *.scala → {scala_detected}
  Python: requirements.txt, setup.py, pyproject.toml, *.py → {python_detected}
  Go: go.mod, go.sum, *.go → {go_detected}
  Rust: Cargo.toml, *.rs → {rust_detected}
  Ruby: Gemfile, *.rb → {ruby_detected}
  PHP: composer.json, *.php → {php_detected}
  Visual Basic: *.vbproj, *.vb → {vb_detected}
  Razor: *.cshtml, *.razor → {razor_detected}
  ```

- **STEP 0.5B**: Log detected technologies:
  ```
  Detected Technologies:
  - C#: {yes/no}
  - C++: {yes/no}
  - TypeScript/JavaScript: {yes/no}
  - Java: {yes/no}
  - Kotlin: {yes/no}
  - Scala: {yes/no}
  - Python: {yes/no}
  - Go: {yes/no}
  - Rust: {yes/no}
  - Ruby: {yes/no}
  - PHP: {yes/no}
  - Visual Basic: {yes/no}
  - Razor: {yes/no}
  ```

## Phase 1: Configuration File Discovery

- **STEP 1A**: Search for configuration files based on detected technologies:

  **Universal** (all languages):
  - `.editorconfig` (formatting rules)

  **C#**:
  - `GlobalUsings.cs` (search ALL *.csproj directories - one per project)
  - `Directory.Build.props` (shared project settings)
  - `*.csproj` files (analyzer/ruleset settings)
  - `.editorconfig` (formatting rules)

  **C++**:
  - `.clang-format` (formatting rules)
  - `.clang-tidy` (static analysis)
  - `CMakeLists.txt` (build configuration)
  - `.editorconfig`

  **TypeScript/JavaScript**:
  - `eslint.config.js`, `.eslintrc*` (linting)
  - `.prettierrc*`, `prettier.config.js` (formatting)
  - `tsconfig.json` (TypeScript compiler options)

  **Java**:
  - `checkstyle.xml` (code style)
  - `spotless.xml`, `spotless.gradle` (formatting)
  - `.editorconfig`

  **Kotlin**:
  - `.editorconfig` (with Kotlin-specific settings)
  - `ktlint.gradle` (linting)
  - `detekt.yml` (static analysis)

  **Scala**:
  - `.scalafmt.conf` (formatting)
  - `scalastyle-config.xml` (style checking)
  - `.editorconfig`

  **Python**:
  - `.flake8` (linting)
  - `pyproject.toml` (Black, isort, mypy config)
  - `setup.cfg` (flake8, pylint)
  - `.pylintrc` (pylint config)

  **Go**:
  - `.editorconfig` (go fmt is standard, minimal config)
  - `.golangci.yml` (linter config)

  **Rust**:
  - `rustfmt.toml` (formatting)
  - `clippy.toml` (linting)

  **Ruby**:
  - `.rubocop.yml` (linting/formatting)

  **PHP**:
  - `.php-cs-fixer.php` (formatting)
  - `phpcs.xml` (code sniffer)
  - `phpstan.neon` (static analysis)

  **Visual Basic**:
  - `*.vbproj` files (analyzer/ruleset settings)
  - `.editorconfig`
  - Same conventions as C# (shared .NET ecosystem)

  **Razor**:
  - Inherits from C# conventions
  - `.editorconfig` (Razor-specific sections)
  - Part of ASP.NET Core projects (*.csproj)

- **STEP 1B**: Read all found configuration files

- **STEP 1C**: Log configuration files found:
  ```
  Configuration Files Found:
  - .editorconfig: {path or "not found"}
  - {language-specific files}: {paths or "not found"}
  ```

## Phase 2: Detailed Code Analysis

- **STEP 2A**: Use Task tool with code-reviewer agent for DETAILED analysis:
  ```markdown
  ROLE: Coding Standards Extraction Specialist

  TASK: Extract comprehensive coding standards with DETAILED formatting analysis

  DETECTED_TECHNOLOGIES: {tech_list}
  CONFIGURATION_FILES: {config_files_found}

  ## CRITICAL: Configuration File Analysis

  **STEP 1**: For each configuration file found, extract settings:
  - .editorconfig: indentation, line endings, charset
  - tsconfig.json: strict mode flags
  - eslint config: rules enabled
  - C# *.csproj: WarningsAsErrors, Nullable, LangVersion
  - etc.

  **STEP 2**: For C# specifically:
  - Scan ALL *.csproj directories for GlobalUsings.cs files
  - If found, list file paths and contents
  - Determine pattern: GlobalUsings per project or per-file usings?
  - Evidence: Count files WITH using directives vs WITHOUT

  ## DETAILED FORMATTING ANALYSIS

  **CRITICAL INSTRUCTIONS**:
  1. **DO NOT ASSUME** language defaults - VERIFY by examining actual code
  2. **READ ACTUAL FILES** - Don't rely on documentation or conventions
  3. **COUNT OCCURRENCES** - For each pattern, count actual usage across 10-15 files
  4. **CALCULATE PERCENTAGES** - Report confidence based on consistency (>90% = HIGH, 70-90% = MEDIUM, <70% = LOW)
  5. **SHOW EVIDENCE** - Every pattern MUST include file paths + line numbers + actual code quotes
  6. **VERIFY WHITESPACE** - Check actual whitespace characters (tabs vs spaces, count spaces)
  7. **SANITY CHECK** - If pattern seems unusual, verify against 5+ more files

  Analyze 10-15 actual code files per language. Check ACTUAL WHITESPACE CHARACTERS.

  <foreach {language} in {detected_technologies}>

  ### {language} Formatting Conventions

  **1. Indentation**:
  - Pattern: Tabs or spaces? How many spaces?
  - Evidence: Check whitespace at start of lines in 10+ files
  - Confidence: HIGH/MEDIUM/LOW
  - Examples: File paths with line numbers

  **2. Brace Placement**:
  - **CRITICAL**: DO NOT assume - VERIFY by examining actual code
  - Pattern: K&R (brace on same line as declaration) or Allman (brace on new line)?
  - **Verification Method**:
    1. Read 10-15 .cs files
    2. Count class declarations: `class Foo {` (K&R) vs `class Foo\n{` (Allman)
    3. Count method declarations: `void Bar() {` (K&R) vs `void Bar()\n{` (Allman)
    4. Calculate percentage: K&R vs Allman
  - Evidence: Show file paths with line numbers and actual brace positions
  - Pattern: Whichever style is >90% is the standard
  - Confidence: HIGH if >90% consistent, MEDIUM if 70-90%, LOW if <70%
  - Examples: Quote actual lines from files showing brace positions

  **3. Line Length**:
  - Pattern: Typical max length observed
  - Evidence: Analyze line lengths in files
  - Confidence: HIGH/MEDIUM/LOW

  **4. Quote Style** (if applicable):
  - Pattern: Single quotes or double quotes?
  - Evidence: Count quote usage across files
  - Confidence: HIGH/MEDIUM/LOW

  **5. Semicolons** (JavaScript/TypeScript):
  - Pattern: Required or optional?
  - Evidence: Count files with/without semicolons
  - Confidence: HIGH/MEDIUM/LOW

  **6. Trailing Commas**:
  - Pattern: Used in multi-line objects/arrays?
  - Evidence: Count trailing comma usage
  - Confidence: HIGH/MEDIUM/LOW

  **7. Using/Import Organization**:
  - **C#**: GlobalUsings.cs pattern? Per-file? Static usings?
    - Scan ALL *.csproj folders for GlobalUsings.cs
    - Count files WITH using directives
    - Count files WITHOUT using directives
    - Determine if GlobalUsings is standard pattern
  - **TypeScript/JavaScript**: Import sorting pattern?
  - **Java**: Import organization (grouped/alphabetical)?
  - **Python**: Import order (isort style)?
  - Evidence: File examples
  - Confidence: HIGH/MEDIUM/LOW

  **8. Spacing Rules**:
  - Between members/functions
  - Around operators
  - Before/after braces `{ x }` vs `{x}`
  - Type annotations `x: string` vs `x:string`
  - Evidence: Code examples
  - Confidence: HIGH/MEDIUM/LOW

  **9. Private Field Naming** (if applicable):
  - Pattern: _camelCase, camelCase, m_camelCase, mCamelCase?
  - Evidence: Count field naming patterns
  - Confidence: HIGH/MEDIUM/LOW

  **10. var/let/const Usage**:
  - **C#**: var vs explicit types?
  - **JavaScript/TypeScript**: let vs const preference?
  - Evidence: Count usage patterns
  - Confidence: HIGH/MEDIUM/LOW

  **11. Null Checks**:
  - **C#**: `is null` vs `== null` vs `is not null`?
  - **TypeScript**: Optional chaining usage?
  - Evidence: Code examples
  - Confidence: HIGH/MEDIUM/LOW

  **12. String Operations**:
  - **C#**: String interpolation `$""` vs concatenation?
  - **JavaScript/TypeScript**: Template literals vs string concatenation?
  - Evidence: Count usage
  - Confidence: HIGH/MEDIUM/LOW

  **13. Modern Language Features**:
  - **C#**: Primary constructors, collection expressions `[]`, expression-bodied members `=>`, file-scoped namespaces?
  - **TypeScript**: Arrow functions with parentheses, optional chaining, nullish coalescing?
  - Evidence: Count usage
  - Confidence: HIGH/MEDIUM/LOW

  </foreach>

  ## HIGH-LEVEL CONVENTIONS (Existing Analysis)

  **Naming Conventions**:
  - Classes, interfaces, methods, properties, parameters
  - Casing styles (PascalCase, camelCase, snake_case)
  - Prefixes/suffixes (I for interfaces, Async for async methods)

  **File Organization**:
  - One type per file?
  - Namespace/package structure
  - Folder organization patterns

  **Architecture Patterns**:
  - Null handling (nullable reference types?)
  - Error handling (exceptions vs Result<T>?)
  - Async patterns (Async suffix? ConfigureAwait?)
  - Dependency injection approach
  - API patterns (controllers? minimal APIs? EndpointMappers?)
  - Repository/Storage patterns
  - Domain model pattern (anemic vs rich?)

  **Testing Patterns**:
  - Test frameworks
  - Test file naming and location
  - Test naming conventions
  - Mocking approach
  - Coverage expectations

  **Git Conventions**:
  - Recent commit message format
  - Branch naming patterns (if .git/refs visible)
  - PR templates (if .github/ exists)

  **Project Structure**:
  - Monorepo or multi-repo?
  - Folder organization
  - Shared code location
  - Configuration approach

  ## OUTPUT FORMAT

  For EACH convention, provide:
  1. **Pattern**: Clear description
  2. **Confidence**: HIGH/MEDIUM/LOW (based on consistency)
  3. **Evidence**: 2-3 file paths + line numbers showing pattern
  4. **Example**: Actual code snippet from codebase

  ## DELIVERABLE

  Complete coding standards report with:
  - Quick Reference section (one-page summary)
  - Detailed Formatting section per language
  - High-level conventions
  - Configuration files found and their settings
  - Confidence levels for all patterns
  ```

- **STEP 2B**: Parse analysis results

## Phase 3: Generate Focused Guide Documents

- **STEP 3A**: Create overview document `Documents/Guides/CODING_STANDARDS.md`:
  - Quick Reference section
  - Architecture Overview
  - Links to focused guides (CSHARP_STYLE_GUIDE.md, TYPESCRIPT_STYLE_GUIDE.md, etc.)
  - Configuration files found
  - Summary statistics

- **STEP 3B**: For each detected language, create focused style guide:

  <if ({csharp_detected})>
  - Create `Documents/Guides/CSHARP_STYLE_GUIDE.md` with:
    - Table of Contents (hyperlinked)
    - Code Formatting (all sections from analysis)
    - Language Features & Modern C# Patterns
    - Naming Conventions
    - Domain Model Patterns
    - Contract Separation
    - Error Handling
    - API Patterns
    - Storage Patterns
    - Code Review Checklist (23+ items)
  </if>

  <if ({typescript_detected})>
  - Create `Documents/Guides/TYPESCRIPT_STYLE_GUIDE.md` with:
    - Table of Contents (hyperlinked)
    - Code Formatting
    - TypeScript Strictness
    - Component Structure
    - State Management
    - API Integration
    - Code Review Checklist (23+ items)
  </if>

  <if ({java_detected})>
  - Create `Documents/Guides/JAVA_STYLE_GUIDE.md`
  </if>

  <if ({cpp_detected})>
  - Create `Documents/Guides/CPP_STYLE_GUIDE.md`
  </if>

  {similar for other languages}

- **STEP 3C**: Create `Documents/Guides/TESTING_GUIDE.md`:
  - Testing frameworks (from analysis)
  - Test file naming and organization
  - Test structure patterns
  - Test data attributes
  - Mocking strategies
  - Coverage targets
  - Testing checklists

- **STEP 3D**: Create `Documents/Guides/CODE_QUALITY_GUIDE.md`:
  - Code smells by language
  - Anti-patterns to avoid
  - Security patterns
  - Performance optimization patterns
  - Complexity metrics
  - Code quality checklist

- **STEP 3E**: Legacy single-file format (optional):
  Create comprehensive single document if needed for compatibility
  ```markdown
  # Coding Standards (Extracted from Codebase)

  **Project**: {project_name}
  **Last Updated**: {date}
  **Source**: Analyzed Source/ codebase ({file_count} files)

  ---

  ## Quick Reference

  {one-page summary of critical conventions per language}

  ---

  ## Architecture Overview

  {project architecture, layer structure, domain pattern}

  ---

  <foreach {language} in {detected_technologies}>

  ## {language} Standards

  ### 1. Code Formatting

  #### 1.1 Indentation
  [Pattern, confidence, evidence, examples]

  #### 1.2 Brace Placement
  [Pattern, confidence, evidence, examples]

  #### 1.3 Using/Import Organization
  [Pattern, confidence, evidence, examples]
  [For C#: Document GlobalUsings.cs pattern if found]

  #### 1.4 Line Length
  [Pattern, confidence, evidence, examples]

  #### 1.5 Spacing Rules
  [Pattern, confidence, evidence, examples]

  ... {all formatting conventions}

  ### 2. Naming Conventions

  [Classes, methods, fields, parameters, etc.]

  ### 3. Language Features & Modern Patterns

  [var usage, null checks, string operations, modern features]

  ### 4. File Organization

  [One type per file, namespace structure, folder patterns]

  ... {all high-level conventions}

  </foreach>

  ---

  ## Testing Standards

  [Test frameworks, naming, location, patterns]

  ---

  ## Git Conventions

  [Commit messages, branch naming]

  ---

  ## Configuration Files Found

  [List of config files and their key settings]

  ---

  ## Code Quality Checklist

  ### {language} Code Review Checklist
  - [ ] Convention 1
  - [ ] Convention 2
  ...

  ---

  ## Summary

  **Extraction Quality**: {score}/100
  **Confidence**: {HIGH percentage}% HIGH, {MEDIUM percentage}% MEDIUM, {LOW percentage}% LOW

  **Critical Patterns**:
  1. {most important pattern 1}
  2. {most important pattern 2}
  ...

  **Low-Confidence Items** (review recommended):
  - {item 1}
  - {item 2}
  ```

- **STEP 3B**: Mark low-confidence items with: `[EXTRACTED - Verify if this is standard]`

## Phase 4: Reporting

- **STEP 4A**: Display summary:
  ```
  ✓ CODING STANDARDS EXTRACTED

  Analyzed: Source/ codebase

  Created Guides:
  - Documents/Guides/CODING_STANDARDS.md (overview + quick reference)
  <if ({csharp_detected})>
  - Documents/Guides/CSHARP_STYLE_GUIDE.md (C# formatting, patterns, checklist)
  </if>
  <if ({typescript_detected})>
  - Documents/Guides/TYPESCRIPT_STYLE_GUIDE.md (TypeScript/React patterns, checklist)
  </if>
  {similar for other languages}
  - Documents/Guides/TESTING_GUIDE.md (test frameworks, patterns, checklists)
  - Documents/Guides/CODE_QUALITY_GUIDE.md (code smells, anti-patterns, security)

  Technologies Detected:
  - {language 1}: {file_count} files
  - {language 2}: {file_count} files

  Configuration Files Found:
  - {config_file 1}: {path}
  - {config_file 2}: {path}
  <if ({csharp_detected} and {globalusings_found})>
  - GlobalUsings.cs: {count} files (C# global using pattern DETECTED)
  </if>

  Extracted Patterns:
  - Formatting conventions: {count}
  - Naming conventions: {count}
  - Architecture patterns: {count}
  - Testing patterns: {count}

  Confidence Distribution:
  - High: {percentage}% (patterns verified across 10+ files)
  - Medium: {percentage}% (patterns seen but variations exist)
  - Low: {percentage}% (limited examples, marked for review)

  Verification Quality:
  - Brace style: VERIFIED by counting across {N} files
  - Indentation: VERIFIED by checking actual whitespace
  - Naming: VERIFIED across {N} occurrences
  - All patterns include file path evidence

  Next Steps:
  - Review Documents/Guides/CODING_STANDARDS.md (overview)
  - Review language-specific guides (CSHARP_STYLE_GUIDE.md, etc.)
  - Verify low-confidence items (marked with [EXTRACTED - Verify])
  - Customize as needed
  - Run /preparation:configure-implementation to set preferences
  - All guides will guide Phase 2 code generation
  ```

**IMPORTANT NOTES**:
- **Platform-agnostic**: Detects and extracts standards for 13+ languages
- **For brownfield only**: Requires existing Source/ code
- **Greenfield**: Use /define-coding-standards instead
- **Verification-based**: Counts actual occurrences, doesn't assume language defaults
- **Evidence-required**: Every pattern includes file paths + line numbers + code quotes
- **Split output**: Creates focused guides (overview + language guides + testing + quality)
- **Critical patterns**: GlobalUsings.cs (C#), strict mode (TypeScript), etc.
- **Output location**: `Documents/Guides/` folder with multiple focused documents:
  - CODING_STANDARDS.md (overview + TOC)
  - CSHARP_STYLE_GUIDE.md (if C# detected)
  - TYPESCRIPT_STYLE_GUIDE.md (if TypeScript detected)
  - TESTING_GUIDE.md
  - CODE_QUALITY_GUIDE.md
  - {LANGUAGE}_STYLE_GUIDE.md (for other detected languages)
- **Critical prerequisite**: For Phase 2 implementation
