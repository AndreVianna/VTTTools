---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Bash, TodoWrite]
description: Define coding standards for new project through guided Q&A (greenfield)
argument-hint:
---

# Define Coding Standards Command

Creates comprehensive coding standards through guided, technology-aware Q&A. Defines conventions, formatting, patterns, and quality requirements for Phase 2 code generation.

**Platform**: Cross-platform
**Supported Languages**: C#, C++, TypeScript/JavaScript, Java, Kotlin, Scala, Python, Go, Rust, Ruby, PHP, Visual Basic, Razor

## Validation & Technology Detection

**STEP 1**: Verify greenfield (no `Source/` or `CODING_STANDARDS.md` exist). If brownfield, use `/preparation:extract-coding-standards`.

**STEP 2**: Load solution specification from `Documents/SOLUTION.md`:
- Extract technology stack (Backend, Frontend, Databases)
- Extract architecture pattern
- Extract frameworks/libraries

## Guided Standards Definition

**STEP 3**: Use Task tool with solution-engineer agent for technology-aware Q&A session.

**Q&A Process**:
- Present ONE question at a time
- Provide RECOMMENDATIONS with rationale
- Allow accept or custom value
- Wait for answer before next question

### Question Categories

<foreach {language} in {detected_technologies}>

#### 1. Formatting Standards ({language})
- Indentation style (tabs/spaces, language-specific defaults)
- Brace placement (K&R vs Allman, if applicable)
- Line length limit (80/100/120/no limit)
- Quote style (single/double, language rules)
- Semicolons (JavaScript/TypeScript)
- Trailing commas (multi-line structures)
- Using/Import organization
- Spacing between class members
- Private field naming conventions
- var/let/const usage patterns
- Null checking style
- String operations (interpolation vs concatenation)
- Modern language features adoption

**Recommendations**: Reference language-specific industry standards (Microsoft for C#, PEP 8 for Python, Airbnb for JavaScript, etc.)

#### 2. Naming Conventions ({language})
- Class/Interface naming (PascalCase, snake_case, prefix rules)
- Method/Function naming (PascalCase, camelCase, snake_case)
- Variable/Parameter naming
- Constants naming (UPPER_SNAKE_CASE, PascalCase)

**Recommendations**: Follow language ecosystem standards (C# Microsoft, Python PEP 8, Java Oracle, Go official, etc.)

</foreach>

#### 3. Architecture & Patterns
- Error handling (exceptions, Result<T>, hybrid)
- Null handling (nullable types, strict checks)
- Dependency injection (constructor, property, method)
- Async patterns (naming, ConfigureAwait)

**Recommendations**: Based on architecture pattern from solution spec

#### 4. Testing Standards
- Test framework (xUnit, Jest, JUnit, pytest)
- Test file naming ({ClassName}Tests, {ClassName}.test)
- Test method naming (descriptive sentences)
- Code coverage target (70%, 80%, 90%)

#### 5. Code Quality
- Linter/Formatter (ESLint+Prettier, Roslyn, flake8+Black)
- Static analysis (strict, warnings, disabled)
- Complexity limits (cyclomatic, method length)

#### 6. Git Conventions
- Commit message format (Conventional Commits recommended)
- Branch naming ({type}/{ticket}-{description})

**STEP 4**: Confirm standards summary with user before generating documents.

## Document Generation

**STEP 5**: Create `Documents/Guides/CODING_STANDARDS.md` (overview):
- Quick Reference (one-page summary)
- Architecture Overview
- Links to focused guides below
- Configuration file templates (.editorconfig, language-specific)
- Next steps

**STEP 6**: For each detected technology, create focused style guide:

<if ({csharp_detected})>
- `Documents/Guides/CSHARP_STYLE_GUIDE.md`: Formatting, patterns, conventions, checklist. Reference CODE_EXAMPLES.md for patterns.
</if>

<if ({typescript_detected})>
- `Documents/Guides/TYPESCRIPT_STYLE_GUIDE.md`: Formatting, strictness, React/Redux patterns, checklist. Reference CODE_EXAMPLES.md for patterns.
</if>

<if ({java_detected})>
- `Documents/Guides/JAVA_STYLE_GUIDE.md`: Formatting, conventions, patterns, checklist
</if>

<if ({python_detected})>
- `Documents/Guides/PYTHON_STYLE_GUIDE.md`: PEP 8 compliance, type hints, patterns, checklist
</if>

{Similar for Kotlin, Scala, Go, Rust, Ruby, PHP, C++, Visual Basic}

**STEP 7**: Create universal guides:
- `Documents/Guides/TESTING_GUIDE.md`: Framework patterns, structure, coverage, checklists
- `Documents/Guides/CODE_QUALITY_GUIDE.md`: Code smells by language, anti-patterns, security, performance, metrics

**Guide Requirements**:
- Table of Contents with hyperlinks
- Examples for every convention (reference CODE_EXAMPLES.md where applicable)
- Rationale for each standard
- ✅ Correct and ❌ Incorrect examples
- MANDATORY/PREFERRED/AVOID markers
- Code Review Checklists

## Configuration Guidance

**STEP 8**: Display configuration file creation instructions:

<if ({csharp_detected} and {globalusings_enabled})>
**C#**: Create `GlobalUsings.cs` in each project root (template in CODING_STANDARDS.md)
</if>

<if ({typescript_detected})>
**TypeScript**: Create `.prettierrc.json`, `eslint.config.js`, update `tsconfig.json` (templates in guide)
</if>

{Similar for other languages}

**Universal**: Create `.editorconfig` in repository root (template in CODING_STANDARDS.md)

## Reporting

**STEP 9**: Display summary:

```
✓ CODING STANDARDS DEFINED

Created Guides:
- Documents/Guides/CODING_STANDARDS.md (overview + quick reference)
<foreach {language} in {detected_technologies}>
- Documents/Guides/{LANGUAGE}_STYLE_GUIDE.md
</foreach>
- Documents/Guides/TESTING_GUIDE.md
- Documents/Guides/CODE_QUALITY_GUIDE.md

Standards Defined For:
<foreach {language} in {detected_technologies}>
- {language}: {convention_count} conventions
</foreach>

Key Decisions:
- Indentation: {summary}
- Brace style: {summary}
- Naming: {summary}
- Architecture: {summary}
- Testing: {coverage}%

Configuration Files:
- Templates provided in guides
- Create before implementation

Next Steps:
1. Review Documents/Guides/CODING_STANDARDS.md
2. Review language-specific guides
3. Create configuration files
4. Commit guides to version control
5. Run /preparation:configure-implementation
6. Guidelines will drive Phase 2 code generation
```

**Memory Updates**:
- Create `coding_standards` entity with languages, key decisions, file paths
- Add relation to solution specification
- Record completion timestamp

---

## Important Notes

- **Greenfield only**: New projects without existing code
- **Brownfield**: Use `/preparation:extract-coding-standards` instead
- **Technology-aware**: Q&A adapts to detected tech stack
- **Industry standards**: Provides recommendations with rationale per language
- **Customizable**: User can accept or override recommendations
- **Focused output**: Multiple guides (overview + per-language + testing + quality)
- **Example references**: Guides reference `Documents/Guides/CODE_EXAMPLES.md` for standard patterns
- **Configuration templates**: Includes .editorconfig and language-specific configs
- **Output location**: `Documents/Guides/` folder
- **Updatable**: Via manual edits or `/update` commands
- **Critical prerequisite**: Required for Phase 2 implementation

## Quick Reference

- **Architecture**: `Documents/Guides/ARCHITECTURE_PATTERN.md`
- **Code Examples**: `Documents/Guides/CODE_EXAMPLES.md`
- **Templates**: Language-specific style guide templates
- **Related**: `/preparation:extract-coding-standards` (brownfield), `/preparation:configure-implementation`

## Related Documentation

- **Code Examples**: `Documents/Guides/CODE_EXAMPLES.md`
- **Implementation Guide**: `Documents/Guides/IMPLEMENTATION_GUIDE.md`
- **Architecture Pattern**: `Documents/Guides/ARCHITECTURE_PATTERN.md`
