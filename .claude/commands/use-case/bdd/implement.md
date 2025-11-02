---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, Write, Glob, Bash, TodoWrite
description: Generate step definition stubs from BDD scenarios
argument-hint: {use_case_name:string}
---

# Implement BDD

Generate step definition implementation stubs from BDD feature file scenarios.

## 1. Validation
- Validate use_case_name non-empty
- Find BDD feature file: Documents/Areas/*/Features/*/UseCases/{use_case_name}/BDD/*.feature
- Verify feature file exists (must run /use-case:bdd:prepare first)
- Read feature file content
- Determine implementation platform (Java/TypeScript from SOLUTION.md)

## 2. Parse BDD Scenarios
- Extract all Given/When/Then steps from scenarios
- Group unique steps (remove duplicates)
- Identify step patterns (parameters, tables, doc strings)
- Count: total scenarios, unique steps, parameterized steps

## 3. Generate Step Definitions
Delegate to test-automation-developer:
```
ROLE: BDD Step Definition Generator

TASK: Generate step definition stubs for use case "{use_case_name}"

BDD FEATURE FILE: {feature_file_content}
UNIQUE STEPS: {unique_steps_list}
TARGET PLATFORM: {java | typescript}

GENERATE:
- Step definition class/file structure
- Method stub for each unique step
- Parameter extraction annotations (@Given, @When, @Then)
- TODO comments for implementation
- Proper imports and framework setup (Cucumber JVM or Cucumber.js)

FOLLOW:
- JAVA_STYLE_GUIDE.md (if Java/JUnit)
- TYPESCRIPT_STYLE_GUIDE.md (if TypeScript/Vitest)
- BDD_CUCUMBER_GUIDE.md best practices

OUTPUT: Complete step definition file(s) with stubs
```

## 4. Write Step Definition Files
Determine target location based on platform:
- **Java**: ProjectRoot/plugins/com.rossvideo.mam.{module}/test/.../bdd/{UseCaseName}StepDefinitions.java
- **TypeScript**: ProjectRoot/plugins/com.rossvideo.mam.{module}/aura/src/__tests__/bdd/{UseCaseName}.steps.ts

Write generated step definition files

## 5. Generate Helper/Support Files
If needed:
- World/context objects (shared state between steps)
- Hooks (before/after scenario setup)
- Custom parameter types
- Test data builders

## 6. Completion
Report:
```
✓ BDD STEP DEFINITIONS GENERATED: {use_case_name}

Platform: {platform}
Scenarios: {scenario_count}
Unique Steps: {step_count}

Generated Files:
- {step_definition_file_path}
<if (support_files)>
- {support_file_list}
</if>

Next Steps:
1. Review step definitions: {file_path}
2. Implement step logic (replace TODO comments)
3. Run BDD tests
4. Fix failures and iterate
5. Once passing: /use-case:approve {use_case_name}

Implementation Guide:
- Each step should call application service or UI component
- Use test doubles (mocks/stubs) for external dependencies
- Keep steps declarative (what, not how)
- Share state via World object (not global variables)
```

**Note**: Generates implementation stubs only. Developers implement actual step logic following generated patterns.
