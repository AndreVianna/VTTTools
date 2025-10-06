# {area_name} Domain Implementation Status

**Last Updated**: {last_updated}
**Status**: NOT_STARTED | IN_PROGRESS | COMPLETE | TESTED
**Overall Grade**: {overall_grade}

---

## Section 1: Scores & Grades

### Domain Contracts Implementation

| Component | Status | Files | Grade |
|-----------|--------|-------|-------|
| Entity Records | ✅/❌ | XX/XX | A-F |
| Value Objects | ✅/❌ | XX/XX | A-F |
| Service Interfaces | ✅/❌ | XX/XX | A-F |

**Entity Records**: {entity_list}
**Value Objects**: {vo_list}
**Service Interfaces**: {interface_list}

**Overall Implementation**: {percent}% complete

### Testing Status

| Test Category | Status | Pass | Coverage | Grade |
|---------------|--------|------|----------|-------|
| Value Object Tests | ✅/❌ | XX/XX | XX% | A-F |
| Entity Serialization | ✅/❌ | XX/XX | XX% | A-F |

**Note**: Domain contracts are data-only (anemic entities), minimal testing needed
**Test Coverage**: {percent}% (target: minimal for contracts)
**Tests Passing**: {count}/{total}
**Test Grade**: {A|B|C|D|F}

### Quality Metrics
- **Domain Model Quality**: {score}/100 (from /validate-domain-model)
- **Code Standards Compliance**: {score}/100 (from /review-code)
- **Architecture Compliance**: {score}/100 (DDD Contracts pattern)
- **Quality Grade**: {A|B|C|D|F}

---

## Section 2: Domain Roadmap

### ☐ Phase 2A: Domain Contracts Generation

**Entity Records** (Data contracts - anemic):
<foreach {entity} in {entities}>
- [ ] {entity.name}.cs
  - Properties from DOMAIN_MODEL.md
  - Validation attributes ([MaxLength], [Required])
  - Init-only setters (immutable record)
  - Guid.CreateVersion7() for Id
</foreach>

**Value Objects** (Enums and records):
<foreach {vo} in {value_objects}>
- [ ] {vo.name}.cs
  - Enum values OR record properties
  - Immutability (for records)
  - Value equality (automatic for records/enums)
</foreach>

**Service Interface Contracts**:
<foreach {interface} in {service_interfaces}>
- [ ] I{interface.name}.cs
  - Operation signatures from DOMAIN_MODEL.md
  - Result<T> return types
  - XML documentation with invariants
  - Pre/post-condition comments
</foreach>

**Value Object Tests** (Minimal):
<foreach {vo} in {value_objects}>
- [ ] {vo.name}Tests.cs
  - Test enum values correct
  - Test record equality and immutability
  - Test validation (if applicable)
</foreach>

### ☐ Commit Domain Contracts
- [ ] /commit-changes "feat(domain-{area}): add domain contracts (entities, VOs, interfaces)"
- [ ] Commit SHA: {sha}

---

## Implementation Files

**Domain Contract Files** (Source/{area}/Domain/Model/):
<foreach {file} in {entity_files}>
- {status} {file_path}
</foreach>

**Service Interface Files** (Source/{area}/Domain/Services/):
<foreach {file} in {interface_files}>
- {status} {file_path}
</foreach>

**Test Files** (Source/{area}/Tests/Domain/):
<foreach {file} in {test_files}>
- {status} {file_path}
</foreach>

---

## Specification References

- **Domain Model**: Documents/Areas/{area_name}/DOMAIN_MODEL.md (quality: {score}/100)
- **Project Specification**: Documents/PROJECT.md

---

## Next Action

**Current Status**: {current_status}

<case {current_status}>
<is NOT_STARTED>
**Action**: /implement-domain "{area_name}"
- Will generate all entity records, value objects, and service interfaces
- Will create minimal value object tests
- Estimated time: 30-60 minutes

<is IN_PROGRESS>
**Action**: Complete remaining items in roadmap
- Missing: {missing_items}
- Run /implement-domain again or complete manually

<is COMPLETE>
**Action**: Proceed to use case implementations
- Domain contracts ready
- Start with: /implement-use-case "{first_use_case}"

<is TESTED>
**Action**: ✅ Domain layer complete and tested
- All value object tests passing
- Ready for Phase 2B (use case implementations)
</case>

**Blockers**: {blockers_list}

---

**Assessment Date**: {assessment_date}
**Last Modified By**: {command_name}
