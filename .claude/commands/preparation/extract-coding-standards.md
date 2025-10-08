---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Extract coding standards and conventions from existing codebase (brownfield)
argument-hint:
---

# Extract Coding Standards Command

Analyzes existing codebase to reverse-engineer coding standards, conventions, patterns, and architectural approaches. Creates comprehensive coding guides in `Documents/Guides/`.

**Platform**: Cross-platform (Windows/Linux/macOS)
**Supported Languages**: C#, C++, TypeScript/JavaScript, Java, Kotlin, Scala, Python, Go, Rust, Ruby, PHP, Visual Basic, Razor

**References**:
- Command Syntax: @.claude/guides/COMMAND_SYNTAX.md
- Agent Usage: @.claude/guides/AGENT_USAGE_GUIDE.md

## 1. Validation

- **STEP 1A**: Verify Source/ directory exists
  <if (not found)>
  - Error: "No Source/ directory found. For greenfield projects, use /define-coding-standards instead."
  </if>

- **STEP 1B**: Check if Documents/Guides/CODING_STANDARDS.md already exists
  <if (exists)>
  - Warning: "Documents/Guides/CODING_STANDARDS.md exists. Overwrite? [Y/N]"
  </if>

- **STEP 1C**: Detect technologies by scanning for project files:
  ```
  C#: *.csproj, *.sln → {csharp_detected}
  C++: CMakeLists.txt, *.vcxproj → {cpp_detected}
  TypeScript/JavaScript: package.json, tsconfig.json → {typescript_detected}
  Java: pom.xml, build.gradle → {java_detected}
  Kotlin: build.gradle.kts, *.kt → {kotlin_detected}
  Scala: build.sbt, *.scala → {scala_detected}
  Python: requirements.txt, pyproject.toml → {python_detected}
  Go: go.mod → {go_detected}
  Rust: Cargo.toml → {rust_detected}
  Ruby: Gemfile → {ruby_detected}
  PHP: composer.json → {php_detected}
  Visual Basic: *.vbproj → {vb_detected}
  Razor: *.cshtml, *.razor → {razor_detected}
  ```

- **STEP 1D**: Search for configuration files:
  - Universal: `.editorconfig`
  - C#: `GlobalUsings.cs`, `Directory.Build.props`, `.editorconfig`
  - C++: `.clang-format`, `.clang-tidy`
  - TypeScript: `eslint.config.js`, `.prettierrc*`, `tsconfig.json`
  - Java: `checkstyle.xml`, `spotless.xml`
  - Kotlin: `ktlint.gradle`, `detekt.yml`
  - Python: `.flake8`, `pyproject.toml`, `.pylintrc`
  - Go: `.golangci.yml`
  - Rust: `rustfmt.toml`, `clippy.toml`
  - Ruby: `.rubocop.yml`
  - PHP: `.php-cs-fixer.php`, `phpcs.xml`

## 2. Analysis

- **STEP 2A**: Use Task tool with code-reviewer agent for extraction:
  ```markdown
  ROLE: Coding Standards Extraction Specialist

  TASK: Extract comprehensive coding standards with DETAILED formatting analysis

  DETECTED_TECHNOLOGIES: {tech_list}
  CONFIGURATION_FILES: {config_files_found}

  ## Configuration File Analysis
  Extract settings from each configuration file found:
  - .editorconfig: indentation, line endings, charset
  - tsconfig.json: strict mode flags
  - eslint config: enabled rules
  - C# *.csproj: WarningsAsErrors, Nullable, LangVersion
  - For C#: Scan ALL *.csproj directories for GlobalUsings.cs files

  ## Formatting Analysis (Per Language)

  **CRITICAL**: DO NOT ASSUME defaults - VERIFY by examining actual code.
  Analyze 10-15 files per language. Check ACTUAL WHITESPACE.

  <foreach {language} in {detected_technologies}>

  ### {language} Analysis

  For EACH pattern below, provide:
  1. **Pattern**: Clear description
  2. **Confidence**: HIGH/MEDIUM/LOW (based on consistency >90%, 70-90%, <70%)
  3. **Evidence**: 2-3 file paths + line numbers
  4. **Example**: Actual code snippet

  **Patterns to Extract**:
  1. Indentation (tabs/spaces, count)
  2. Brace placement (K&R vs Allman - COUNT actual occurrences)
  3. Line length (typical max)
  4. Quote style (single/double)
  5. Semicolons (JS/TS - required/optional)
  6. Trailing commas
  7. Using/Import organization (C#: GlobalUsings pattern?)
  8. Spacing rules (members, operators, braces, type annotations)
  9. Private field naming (_camelCase, camelCase, m_camelCase)
  10. var/let/const usage
  11. Null checks (is null vs == null vs is not null)
  12. String operations (interpolation vs concatenation)
  13. Modern language features (C#: primary constructors, collection expressions [], file-scoped namespaces; TS: arrow functions, optional chaining)

  **Naming Conventions**:
  - Classes, interfaces, methods, properties, parameters
  - Casing styles (PascalCase, camelCase, snake_case)
  - Prefixes/suffixes (I for interfaces, Async for async methods)

  **File Organization**:
  - One type per file?
  - Namespace/package structure
  - Folder organization

  **Architecture Patterns**:
  - Null handling (nullable reference types?)
  - Error handling (exceptions vs Result<T>?)
  - Async patterns (Async suffix? ConfigureAwait?)
  - Dependency injection
  - API patterns (controllers? minimal APIs? EndpointMappers?)
  - Repository/Storage patterns
  - Domain model pattern

  **Testing Patterns**:
  - Frameworks, naming, location, mocking, coverage

  **Git Conventions**:
  - Commit message format (analyze recent commits)
  - Branch naming (if .git/refs visible)

  </foreach>

  ## Output Requirements
  - Quick Reference section (one-page summary)
  - Per-language detailed formatting
  - Configuration files found and settings
  - Confidence levels for all patterns
  - Mark low-confidence with: [EXTRACTED - Verify if this is standard]
  ```

- **STEP 2B**: Parse analysis results into structured data

## 3. Generation

- **STEP 3A**: Create overview `Documents/Guides/CODING_STANDARDS.md`:
  - Quick Reference (one-page summary per language)
  - Architecture Overview
  - Links to focused guides
  - Configuration files found
  - Summary statistics

- **STEP 3B**: Create language-specific guides:

  <if ({csharp_detected})>
  - `Documents/Guides/CSHARP_STYLE_GUIDE.md`:
    - TOC (hyperlinked)
    - Code Formatting (all 13 patterns)
    - Language Features & Modern C# Patterns
    - Naming Conventions
    - Domain Model Patterns
    - Contract Separation
    - Error Handling
    - API/Storage Patterns
    - Code Review Checklist (23+ items)
  </if>

  <if ({typescript_detected})>
  - `Documents/Guides/TYPESCRIPT_STYLE_GUIDE.md`:
    - TOC (hyperlinked)
    - Code Formatting
    - TypeScript Strictness
    - Component Structure
    - State Management
    - API Integration
    - Code Review Checklist (23+ items)
  </if>

  <if ({java_detected})>
  - `Documents/Guides/JAVA_STYLE_GUIDE.md`
  </if>

  <if ({cpp_detected})>
  - `Documents/Guides/CPP_STYLE_GUIDE.md`
  </if>

  <if ({python_detected})>
  - `Documents/Guides/PYTHON_STYLE_GUIDE.md`
  </if>

  <if ({go_detected})>
  - `Documents/Guides/GO_STYLE_GUIDE.md`
  </if>

  <if ({rust_detected})>
  - `Documents/Guides/RUST_STYLE_GUIDE.md`
  </if>

  {similar for other detected languages}

- **STEP 3C**: Create `Documents/Guides/TESTING_GUIDE.md`:
  - Testing frameworks
  - Test file naming/organization
  - Test structure patterns
  - Test data attributes
  - Mocking strategies
  - Coverage targets
  - Testing checklists

- **STEP 3D**: Create `Documents/Guides/CODE_QUALITY_GUIDE.md`:
  - Code smells by language
  - Anti-patterns to avoid
  - Security patterns
  - Performance patterns
  - Complexity metrics
  - Code quality checklist

## 4. Reporting

- **STEP 4A**: Display summary:
  ```
  ✓ CODING STANDARDS EXTRACTED

  Analyzed: Source/ codebase

  Created Guides:
  - Documents/Guides/CODING_STANDARDS.md (overview + quick reference)
  <if ({csharp_detected})>
  - Documents/Guides/CSHARP_STYLE_GUIDE.md
  </if>
  <if ({typescript_detected})>
  - Documents/Guides/TYPESCRIPT_STYLE_GUIDE.md
  </if>
  {similar for other languages}
  - Documents/Guides/TESTING_GUIDE.md
  - Documents/Guides/CODE_QUALITY_GUIDE.md

  Technologies Detected:
  - {language 1}: {file_count} files
  - {language 2}: {file_count} files

  Configuration Files Found:
  - {config_file 1}: {path}
  <if ({csharp_detected} and {globalusings_found})>
  - GlobalUsings.cs: {count} files (C# global using pattern DETECTED)
  </if>

  Extracted Patterns:
  - Formatting: {count}
  - Naming: {count}
  - Architecture: {count}
  - Testing: {count}

  Confidence Distribution:
  - High: {percentage}% (verified 10+ files)
  - Medium: {percentage}% (variations exist)
  - Low: {percentage}% (marked for review)

  Verification Quality:
  - Brace style: VERIFIED by counting across {N} files
  - Indentation: VERIFIED by checking actual whitespace
  - All patterns include file path evidence

  Next Steps:
  - Review Documents/Guides/CODING_STANDARDS.md (overview)
  - Review language-specific guides
  - Verify low-confidence items [EXTRACTED - Verify]
  - Run /preparation:configure-implementation
  - Guides will direct Phase 2 code generation
  ```

## Quick Reference

- **Architecture**: `Documents/Guides/ARCHITECTURE_PATTERN.md`
- **Code Examples**: `Documents/Guides/CODE_EXAMPLES.md`
- **Commands**: `Documents/Guides/COMMON_COMMANDS.md`
- **Output**: `Documents/Guides/CODING_STANDARDS.md`, language-specific guides
- **Related**: `/preparation:define-coding-standards` (greenfield), `/preparation:configure-implementation`

**IMPORTANT NOTES**:
- **For brownfield only**: Requires existing Source/ code
- **Greenfield**: Use /define-coding-standards instead
- **Verification-based**: Counts actual occurrences, doesn't assume defaults
- **Evidence-required**: Every pattern includes file paths + line numbers + code quotes
- **Split output**: Creates focused guides per language + testing + quality
- **Critical patterns**: GlobalUsings.cs (C#), strict mode (TypeScript)
- **Output location**: `Documents/Guides/` folder
- **Critical prerequisite**: For Phase 2 implementation
