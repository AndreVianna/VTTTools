# EPIC-008: Domain Layer Infrastructure Isolation

## Quick Overview

| Property | Value |
|----------|-------|
| **Type** | Epic (Architecture Refactoring) |
| **Status** | In Progress |
| **Priority** | High |
| **Effort** | 16-24 hours (estimated) |
| **Created** | 2025-12-30 |

## Purpose

Isolate the Domain layer from infrastructure dependencies while maintaining full functionality of EF Core Identity and Azure Cloud services. This follows Clean Architecture principles where the Domain layer should have zero infrastructure dependencies.

## Current Progress

### Phase 5: Aspire Infrastructure ✅ COMPLETED
- [x] Health checks delegated to Aspire (`.WithHttpHealthCheck("health")`)
- [x] Removed custom BlobStorageHealthCheck, DatabaseHealthCheck, CacheHealthCheck
- [x] Fixed Aspire infrastructure references (admin-api, web-app, admin-app)
- [x] Removed Azure/SqlClient usings from Common.UnitTests

### Phases 1-4: Identity Layer Isolation ❌ PENDING

#### Domain Layer Issues (CRITICAL)
| Issue | Current State | Target |
|-------|---------------|--------|
| Identity package in Domain.csproj | `Microsoft.AspNetCore.Identity.EntityFrameworkCore` | Remove entirely |
| User.cs | `class User : IdentityUser<Guid>` | `record DomainUser` (pure POCO) |
| Role.cs | `class Role : IdentityRole<Guid>` | `record DomainRole` (pure POCO) |
| UserClaim, UserLogin, UserRole, UserToken, RoleClaim | In Domain layer | Move to Data layer |
| IUserStorage interface | Does not exist | Create in Domain |
| IRoleStorage interface | Does not exist | Create in Domain |

#### Library Layer Issues (HIGH)
| Issue | Current State | Target |
|-------|---------------|--------|
| GlobalUsings.cs:7 | `global using Microsoft.EntityFrameworkCore;` | Remove |

## Remaining Work

### Phase 1: Domain Identity Models (4-6h)
- [ ] Create `DomainUser` record (pure POCO)
- [ ] Create `DomainRole` record (pure POCO)
- [ ] Create `IUserStorage` interface
- [ ] Create `IRoleStorage` interface
- [ ] Remove `Microsoft.AspNetCore.Identity.EntityFrameworkCore` from Domain.csproj
- [ ] Delete identity model files that move to Data layer

### Phase 2: Data Layer Identity Implementation (4-6h)
- [ ] Create `Source/Data/Identity/Entities/` folder with EF Identity entities
- [ ] Create `UserMapper.cs` and `RoleMapper.cs`
- [ ] Implement `UserStorage : IUserStorage`
- [ ] Implement `RoleStorage : IRoleStorage`
- [ ] Update `ApplicationDbContext` references
- [ ] Update `IdentitySchemaBuilder.cs`
- [ ] Update `IdentitySchemaSeeder.cs`

### Phase 3: Library Layer Cleanup (1-2h)
- [ ] Remove `global using Microsoft.EntityFrameworkCore` from GlobalUsings.cs
- [ ] Verify all services compile without EF Core types
- [ ] Update any identity-related code to use domain models

### Phase 4: Auth Service Integration (2-4h)
- [ ] Register storage implementations in Auth/Program.cs
- [ ] Update authentication handlers if needed
- [ ] Test authentication flow end-to-end

### Phase 6: Testing & Verification (2-4h)
- [ ] Add unit tests for mappers and storage implementations
- [ ] Run full test suite
- [ ] Manual verification of auth flows

## Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ VttTools.Domain (ZERO Infrastructure Dependencies)          │
├─────────────────────────────────────────────────────────────┤
│ Dependencies: DotNetToolbox.Core ONLY                       │
│                                                             │
│ Identity/                                                   │
│   Model/                                                    │
│     DomainUser.cs          (record - pure POCO)            │
│     DomainRole.cs          (record - pure POCO)            │
│   Storage/                                                  │
│     IUserStorage.cs        (user persistence contract)      │
│     IRoleStorage.cs        (role persistence contract)      │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ implements
┌─────────────────────────────────────────────────────────────┐
│ VttTools.Data (EF Core Implementation)                      │
├─────────────────────────────────────────────────────────────┤
│ Dependencies: EF Core, Npgsql, Microsoft.AspNetCore.Identity│
│                                                             │
│ Identity/                                                   │
│   Entities/                                                 │
│     User.cs                (: IdentityUser<Guid>)          │
│     Role.cs                (: IdentityRole<Guid>)          │
│     UserClaim.cs, etc.     (EF Identity entities)          │
│   Mappers/                                                  │
│     UserMapper.cs          (Entity <-> Domain mapping)      │
│   Storage/                                                  │
│     UserStorage.cs         (: IUserStorage)                │
│     RoleStorage.cs         (: IRoleStorage)                │
└─────────────────────────────────────────────────────────────┘
```

## Documentation

- [TASK.md](./TASK.md) - Detailed specification and acceptance criteria
- [ROADMAP.md](./ROADMAP.md) - Implementation phases and progress tracking

## Dependencies

- **EPIC-007** (PostgreSQL Migration) - Completed, prerequisite
