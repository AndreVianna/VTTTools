# EPIC-008: Domain Layer Infrastructure Isolation

**Target Type**: Epic (Architecture Refactoring)
**Target Item**: EPIC-008
**Created**: 2025-12-30
**Status**: Planned
**Estimated Effort**: 16-24 hours (2-3 days)
**Priority**: High (Clean Architecture Compliance)

---

## Objective

Isolate the Domain layer from all infrastructure dependencies while preserving full functionality of:
- EF Core Identity for authentication/authorization
- Azure Blob Storage for media handling
- PostgreSQL for data persistence

**Principle**: Domain layer should depend on NOTHING except `DotNetToolbox.Core`.

---

## Problem Statement

### Current Violations Identified

#### 1. EF Core Identity in Domain Layer (CRITICAL)
**Location**: `Source/Domain/Identity/Model/*.cs`

```csharp
// Current - Domain depends on Infrastructure
public class User : IdentityUser<Guid> { ... }
public class UserClaim : IdentityUserClaim<Guid> { ... }
public class UserLogin : IdentityUserLogin<Guid> { ... }
public class UserRole : IdentityUserRole<Guid> { ... }
public class UserToken : IdentityUserToken<Guid> { ... }
public class Role : IdentityRole<Guid> { ... }
public class RoleClaim : IdentityRoleClaim<Guid> { ... }
```

**Package Reference**: `Source/Domain/VttTools.Domain.csproj:15`
```xml
<PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="10.0.1" />
```

**Impact**:
- Domain models tied to database implementation
- Cannot switch identity providers without domain changes
- Violates Dependency Inversion Principle

#### 2. Global EF Core Using in Library Layer (HIGH)
**Location**: `Source/Library/GlobalUsings.cs:7`

```csharp
global using Microsoft.EntityFrameworkCore;
```

**Impact**:
- Makes EF Core types available to ALL service files
- Creates risk of accidental direct DbContext usage
- Services should only see domain interfaces

#### 3. Infrastructure Packages in Library Project (HIGH)
**Location**: `Source/Library/VttTools.Library.csproj`

```xml
<PackageReference Include="Aspire.Azure.Storage.Blobs" Version="13.1.0" />
<PackageReference Include="Aspire.Npgsql.EntityFrameworkCore.PostgreSQL" Version="13.1.0" />
<PackageReference Include="Microsoft.Extensions.Azure" Version="1.13.1" />
```

**Note**: These are used in Program.cs (composition root) which is acceptable, but ideally should be in a separate Host project.

#### 4. Direct Azure SDK in Health Checks (MEDIUM)
**Location**: `Source/Common/HealthChecks/BlobStorageHealthCheck.cs:32-33`

```csharp
var blobServiceClient = new BlobServiceClient(_connectionString);
var containerClient = blobServiceClient.GetBlobContainerClient(_containerName);
```

**Impact**:
- Bypasses existing `IBlobStorage` abstraction
- Common project has cloud-specific dependency

---

## Solution Architecture

### Target Layer Dependencies

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
│   ServiceContracts/                                         │
│     IIdentityService.cs    (authentication operations)      │
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

### Domain Identity Models (Target)

```csharp
// Source/Domain/Identity/Model/DomainUser.cs
namespace VttTools.Identity.Model;

public record DomainUser {
    public Guid Id { get; init; }
    public required string Email { get; init; }
    public required string Name { get; init; }
    public required string DisplayName { get; init; }
    public Guid? AvatarId { get; init; }
    public UnitSystem UnitSystem { get; init; }
    public bool EmailConfirmed { get; init; }
    public bool TwoFactorEnabled { get; init; }
    public bool LockoutEnabled { get; init; }
    public DateTimeOffset? LockoutEnd { get; init; }
    public IReadOnlyList<string> Roles { get; init; } = [];
}

// Source/Domain/Identity/Model/DomainRole.cs
namespace VttTools.Identity.Model;

public record DomainRole {
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public IReadOnlyList<string> Claims { get; init; } = [];
}
```

### Storage Interfaces (Target)

```csharp
// Source/Domain/Identity/Storage/IUserStorage.cs
namespace VttTools.Identity.Storage;

public interface IUserStorage {
    Task<DomainUser?> FindByIdAsync(Guid id, CancellationToken ct = default);
    Task<DomainUser?> FindByEmailAsync(string email, CancellationToken ct = default);
    Task<IReadOnlyList<DomainUser>> GetUsersInRoleAsync(string roleName, CancellationToken ct = default);
    Task<Result<DomainUser>> CreateAsync(DomainUser user, string password, CancellationToken ct = default);
    Task<Result> UpdateAsync(DomainUser user, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken ct = default);
    Task<Result> AddToRoleAsync(Guid userId, string roleName, CancellationToken ct = default);
    Task<Result> RemoveFromRoleAsync(Guid userId, string roleName, CancellationToken ct = default);
}

// Source/Domain/Identity/Storage/IRoleStorage.cs
namespace VttTools.Identity.Storage;

public interface IRoleStorage {
    Task<DomainRole?> FindByIdAsync(Guid id, CancellationToken ct = default);
    Task<DomainRole?> FindByNameAsync(string name, CancellationToken ct = default);
    Task<IReadOnlyList<DomainRole>> GetAllAsync(CancellationToken ct = default);
    Task<Result<DomainRole>> CreateAsync(DomainRole role, CancellationToken ct = default);
    Task<Result> UpdateAsync(DomainRole role, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken ct = default);
}
```

### Data Layer Implementation (Target)

```csharp
// Source/Data/Identity/Storage/UserStorage.cs
namespace VttTools.Data.Identity.Storage;

public class UserStorage(UserManager<User> userManager) : IUserStorage {
    public async Task<DomainUser?> FindByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(id.ToString());
        return entity?.ToDomain(await userManager.GetRolesAsync(entity));
    }

    public async Task<Result<DomainUser>> CreateAsync(DomainUser user, string password, CancellationToken ct = default) {
        var entity = user.ToEntity();
        var result = await userManager.CreateAsync(entity, password);
        if (!result.Succeeded)
            return Result<DomainUser>.Failure(result.Errors.First().Description);
        return Result<DomainUser>.Success(entity.ToDomain([]));
    }
    // ... other methods
}

// Source/Data/Identity/Mappers/UserMapper.cs
namespace VttTools.Data.Identity.Mappers;

internal static class UserMapper {
    public static DomainUser ToDomain(this User entity, IList<string> roles) => new() {
        Id = entity.Id,
        Email = entity.Email!,
        Name = entity.Name,
        DisplayName = entity.DisplayName,
        AvatarId = entity.AvatarId,
        UnitSystem = entity.UnitSystem,
        EmailConfirmed = entity.EmailConfirmed,
        TwoFactorEnabled = entity.TwoFactorEnabled,
        LockoutEnabled = entity.LockoutEnabled,
        LockoutEnd = entity.LockoutEnd,
        Roles = roles.ToList()
    };

    public static User ToEntity(this DomainUser domain) => new() {
        Id = domain.Id,
        Email = domain.Email,
        UserName = domain.Email,
        NormalizedEmail = domain.Email.ToUpperInvariant(),
        NormalizedUserName = domain.Email.ToUpperInvariant(),
        Name = domain.Name,
        DisplayName = domain.DisplayName,
        AvatarId = domain.AvatarId,
        UnitSystem = domain.UnitSystem,
        EmailConfirmed = domain.EmailConfirmed,
        TwoFactorEnabled = domain.TwoFactorEnabled,
        LockoutEnabled = domain.LockoutEnabled,
        LockoutEnd = domain.LockoutEnd
    };
}
```

---

## Scope

### In Scope

1. **Domain Layer Cleanup**
   - Create pure POCO/Record identity models
   - Create `IUserStorage` and `IRoleStorage` interfaces
   - Remove `Microsoft.AspNetCore.Identity.EntityFrameworkCore` package reference
   - Remove any remaining EF Core references

2. **Data Layer Identity Implementation**
   - Move EF Core Identity entities to Data project
   - Create storage implementations using UserManager/RoleManager
   - Create entity-to-domain mappers
   - Update ApplicationDbContext configuration

3. **Library Layer Cleanup**
   - Remove `global using Microsoft.EntityFrameworkCore`
   - Verify all services use domain interfaces only
   - Update any direct identity usage to use new interfaces

4. **Health Check Abstraction**
   - Modify `BlobStorageHealthCheck` to use `IBlobStorage`
   - Remove direct Azure SDK dependency from Common

5. **Auth Service Updates**
   - Update authentication handlers to use `IUserStorage`
   - Ensure JWT token generation works with domain models

### Out of Scope

- Splitting Library into Services + Host projects (future improvement)
- Creating new identity features
- Changing authentication flow
- Performance optimization
- Frontend changes

---

## Acceptance Criteria

### Must Have

- [ ] Domain project has ZERO infrastructure package references
- [ ] Domain identity models are pure POCOs/Records
- [ ] `IUserStorage` and `IRoleStorage` interfaces in Domain
- [ ] EF Core Identity entities in Data project (internal)
- [ ] Storage implementations in Data project
- [ ] No `global using Microsoft.EntityFrameworkCore` in Library
- [ ] All existing authentication flows work
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Build succeeds with no warnings

### Should Have

- [ ] Health checks use `IBlobStorage` abstraction
- [ ] Clear separation documentation in code comments
- [ ] Mapper classes with full coverage

### Nice to Have

- [ ] Roslyn analyzer rule to prevent infrastructure refs in Domain
- [ ] Architecture decision record (ADR) documenting the pattern

---

## Risk Assessment

### Medium Risks

| Risk | Mitigation |
|------|------------|
| Breaking authentication | Keep EF Identity internally, just abstract it |
| UserManager dependency | Inject UserManager in storage, not services |
| Seed data migration | Update IdentitySchemaSeeder to use new entities |
| Token generation | Ensure claims mapping works correctly |

### Low Risks

| Risk | Mitigation |
|------|------------|
| Mapper bugs | Comprehensive unit tests for mappers |
| Missing properties | Review all identity model usages first |

---

## Dependencies

### Prerequisites
- EPIC-007 (PostgreSQL Migration) - Completed
- Existing storage interface pattern working

### Blocks
- None - this is internal refactoring

---

## Files to Modify

### Domain Project
| File | Action |
|------|--------|
| `VttTools.Domain.csproj` | Remove Identity.EntityFrameworkCore package |
| `Identity/Model/User.cs` | Replace with DomainUser record |
| `Identity/Model/Role.cs` | Replace with DomainRole record |
| `Identity/Model/UserClaim.cs` | Delete (move to Data) |
| `Identity/Model/UserLogin.cs` | Delete (move to Data) |
| `Identity/Model/UserRole.cs` | Delete (move to Data) |
| `Identity/Model/UserToken.cs` | Delete (move to Data) |
| `Identity/Model/RoleClaim.cs` | Delete (move to Data) |
| `Identity/Storage/IUserStorage.cs` | Create new |
| `Identity/Storage/IRoleStorage.cs` | Create new |

### Data Project
| File | Action |
|------|--------|
| `Identity/Entities/User.cs` | Create (from Domain, add IdentityUser) |
| `Identity/Entities/Role.cs` | Create (from Domain, add IdentityRole) |
| `Identity/Entities/*.cs` | Create other identity entities |
| `Identity/Mappers/UserMapper.cs` | Create new |
| `Identity/Mappers/RoleMapper.cs` | Create new |
| `Identity/Storage/UserStorage.cs` | Create new |
| `Identity/Storage/RoleStorage.cs` | Create new |
| `Builders/IdentitySchemaBuilder.cs` | Update entity references |
| `Builders/IdentitySchemaSeeder.cs` | Update entity references |
| `ApplicationDbContext.cs` | Update DbSet types |

### Library Project
| File | Action |
|------|--------|
| `GlobalUsings.cs` | Remove EF Core using |

### Common Project
| File | Action |
|------|--------|
| `HealthChecks/BlobStorageHealthCheck.cs` | Use IBlobStorage |

### Auth Project
| File | Action |
|------|--------|
| `Handlers/*.cs` | Update to use IUserStorage |
| `Program.cs` | Register new storage implementations |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Domain infrastructure packages | 0 |
| Build success | 100% |
| Unit tests passing | 100% |
| Integration tests passing | 100% |
| Authentication flow working | Verified |
| Authorization flow working | Verified |

---

## Related Documentation

- **EPIC-007**: PostgreSQL Migration (provides database infrastructure)
- **Clean Architecture**: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- **DDD Patterns**: Domain-Driven Design storage interface pattern

---

**Version**: 1.0
**Last Updated**: 2025-12-30
**Author**: Claude (via Infrastructure Isolation Analysis)
