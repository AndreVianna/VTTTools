---
allowed-tools: Task, Read, Write, Edit, Glob, Bash, TodoWrite
description: Implement domain layer (entities, value objects, domain services) for bounded context
argument-hint: {area_name:string}
---

# Implement Domain

Generate domain layer for bounded context: entities, value objects, service interfaces.

## 1. Validation
- Verify Documents/Areas/{area_name}/DOMAIN_MODEL.md exists
- Check ImplementationConfig in memory
- Check if already implemented (offer regenerate)
- Look for ROADMAP.md (optional sequence guidance)

## 2. Load Context
- Read DOMAIN_MODEL.md, CODING_STANDARDS.md, SOLUTION.md
- Load implementation configuration

## 3. Generate Domain Entities
Delegate to backend-developer:
```
Generate domain entities as Hibernate data contracts for "{area_name}"

ARCHITECTURE: DDD Contracts Pattern
- Entities are anemic (getters/setters only, NO behavior)
- Business logic in Application Services

TARGET: ProjectRoot/plugins/com.rossvideo.mam.{module}/src/.../model/

GENERATE for each entity in DOMAIN_MODEL.md:
- @Entity class extending Hibernate Object
- All properties with JPA annotations (@Column, @ManyToOne, etc.)
- Standard getters/setters
- checkDirty() calls in setters (change tracking)
- Service interface contract in app/interfaces/

DOMAIN PURITY:
- NO implementation logic in entities
- NO infrastructure types except JPA annotations
- NO OSGi annotations in entity classes

Follow JAVA_STYLE_GUIDE.md (4 spaces, K&R braces, camelCase fields, NO "I" prefix)
```

- Write entity files
- Validate syntax (compile check)

## 4. Generate Value Objects
- Enum types (for classifications: AssetStatus, MaterialType)
- Immutable value classes
- Ensure proper equals/hashCode

## 5. Generate Service Interfaces
- For each entity: {Entity}Service interface (NOT I{Entity}Service - Java has no "I" prefix)
- Method signatures with domain operations
- JavaDoc with pre/post-conditions
- Location: app/interfaces/ (contracts, implementations come later in /implement-use-case)

## 6. Generate Tests (Minimal)
- Test value objects only (enums, immutability)
- Skip entity tests (just data contracts, nothing to unit test)
- Run tests, check coverage

## 7. Completion
Display summary:
```
Domain Layer: {area_name}
- Entities: {count}
- Value Objects: {count}
- Service Interfaces: {count}
- Tests: {count} (value objects only)

Location: ProjectRoot/plugins/com.rossvideo.mam.{module}/src/.../model/

Next: /implementation:implement-use-case {first_use_case} (implements service logic)
Commit: "feat(domain-{area}): add domain contracts"
```

- Create DomainImpl_{area_name} entity in memory with status: COMPLETE

**Note**: Service implementations (ServiceImpl classes) generated in /implement-use-case, not here.
