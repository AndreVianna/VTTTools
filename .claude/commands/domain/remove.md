---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, Write, Edit, Glob, Bash, TodoWrite
description: Remove domain model from bounded context with dependency validation
argument-hint: {area_name:string} {force:flag:optional(false)}
---

# Remove Domain

Safely remove domain model specification from bounded context with validation.

## 1. Validation
- Validate area_name non-empty
- Find domain model: Documents/Areas/{area_name}/DOMAIN_MODEL.md
- Verify domain exists
- Set force default to false

## 2. Dependency Check
- Use Glob to find features in this area: Documents/Areas/{area_name}/Features/*.md
- Count features referencing this domain
- Use Grep to search for area_name in SOLUTION.md and other specs

<if (dependencies found AND not force)>
Display warning:
```
⚠️  Domain "{area_name}" has dependencies:

Features: {feature_count}
{foreach: - {feature.name}}

References in: {reference_count} files

Cannot remove domain with dependencies.

Options:
1. Remove dependent features first: /feature:remove {feature_name}
2. Force removal (breaks references): /domain:remove {area_name} force
3. Cancel removal
```

Wait for user confirmation
</if>

## 3. Memory Cleanup
- Search memory for domain entity
- Delete all relationships involving domain
- Delete domain entity from memory
- Update solution entity (remove from bounded contexts list)

## 4. Document Cleanup
- Delete domain model: Documents/Areas/{area_name}/DOMAIN_MODEL.md
- Update SOLUTION.md (remove from bounded contexts section)
- Delete area folder if empty

## 5. Completion
Report:
```
✓ DOMAIN REMOVED: {area_name}

Deleted:
- Domain model specification
- Memory entity and relationships
<if (features removed)>
- {feature_count} dependent features
</if>

Updated:
- Documents/SOLUTION.md

<if (warnings)>
⚠️  Warnings:
{foreach warning: - {warning.message}}
</if>

Recovery:
- Restore via git: git restore Documents/Areas/{area_name}/
- Or recreate: /domain:add {area_name}
```

**Note**: Destructive operation. Validates dependencies before removal. Use force flag with caution.
