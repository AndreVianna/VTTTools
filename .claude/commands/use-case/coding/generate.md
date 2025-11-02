---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, Write, Edit, Glob, Bash, TodoWrite
description: Implement use case as vertical slice (Application + Infrastructure + UI) with unit tests
argument-hint: {use_case_name:string}
---

# Implement Use Case

Generate complete vertical slice for use case: Application service, Infrastructure adapters, UI components, and comprehensive tests.

## 1. Validation
- Find use case spec: Documents/Areas/*/Features/*/UseCases/{use_case_name}.md
- Verify prerequisites: DOMAIN_MODEL.md, CODING_STANDARDS.md, ImplementationConfig
- Check if already implemented (offer regenerate)
- Look for ROADMAP.md (optional layer sequence guidance)

## 2. Load Context
- Read use case spec, domain model, implementation config
- Extract: owning area, ui_type, business rules, error scenarios, acceptance criteria

## 3. Generate Application Layer
Delegate to backend-developer:
```
Generate Application service for "{use_case_name}"

ARCHITECTURE: DDD Contracts + OSGi Service Implementation
- Entities are anemic (data contracts)
- ALL business logic in this service

TARGET: ProjectRoot/plugins/com.rossvideo.mam.{module}/src/.../app/service/

GENERATE:
- ServiceImpl class (@Component annotation)
- Validate inputs, enforce invariants, apply business rules
- Handle all error scenarios from spec
- Unit tests (JUnit 5 + Mockito, ≥95% coverage)

Follow JAVA_STYLE_GUIDE.md, OSGi Declarative Services patterns
```

- Write service + test files
- Run tests (fix if failures, max 3 retries)
- Update USE_CASE_STATUS.md: Application layer ✅
- User approval checkpoint (if INTERACTIVE mode)

## 4. Generate Infrastructure Layer
Determine needs based on use case:
- Repository impl (Hibernate/JPA if data access)
- REST action (OSGi service if API endpoint)
- External adapters (if external dependencies)

Delegate to backend-developer:
```
Generate Infrastructure for "{use_case_name}"

COMPONENTS NEEDED: {repository, action, adapters}

TARGET: ProjectRoot/plugins/com.rossvideo.mam.{module}/src/.../infrastructure/

GENERATE:
- DAO + DMO (co-located per plugin.xml requirement)
- Repository implementation
- REST Action (@Component)
- Unit tests (mocking service layer)

Follow DMO/DAO co-location rules from PHYSICAL_DESIGN.md
```

- Write infrastructure files
- Run tests, update status
- User approval checkpoint

## 5. Generate UI Layer (if applicable)
<case {ui_type}>
<is NO_UI or API_ENDPOINT>
- Skip UI generation
</is>
<is FULL_PAGE or FORM or WIDGET>
Delegate to frontend-developer:
```
Generate React component for "{use_case_name}"

UI_TYPE: {ui_type}
TARGET: ProjectRoot/plugins/com.rossvideo.mam.{module}/aura/src/presentation/

GENERATE:
- Component (container or element)
- State management (Zustand, TanStack Query)
- Unit tests (Vitest + Testing Library)

Follow TYPESCRIPT_STYLE_GUIDE.md, @rv/aura-components design system
```
- Write UI files, run tests
- User approval checkpoint
</is>
</case>

## 6. Comprehensive Validation
- Run ALL tests (Domain, Application, Infrastructure, UI)
- Calculate coverage (validate meets ≥95% backend, ≥85% frontend)
- Display summary: files generated, test results, coverage

## 7. Update Tracking
- Create Impl_{use_case_name} entity in memory
- Update USE_CASE_STATUS.md, FEATURE_STATUS.md, SOLUTION_STATUS.md
- Mark review_status: NOT_REVIEWED
- Report: READY TO COMMIT

**Next Steps**: /quality:review-code then /git:commit-changes "feat({area}): implement {use_case_name}"
