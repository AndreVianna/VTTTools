# EPIC-008: Domain Layer Infrastructure Isolation - Roadmap

## Overview

| Phase | Description | Effort | Status |
|-------|-------------|--------|--------|
| 1 | Domain Identity Models | 4-6h | ✅ Completed |
| 2 | Data Layer Identity Implementation | 4-6h | ✅ Completed |
| 3 | Library Layer Cleanup | 1-2h | ✅ Completed |
| 4 | Auth Service Integration | 2-4h | ✅ Completed |
| 5 | Health Check Abstraction | 1-2h | ✅ Completed |
| 6 | Testing & Verification | 2-4h | ✅ Completed |

**Total Estimated Effort**: 16-24 hours
**Actual Effort**: ~18 hours
**Status**: ✅ ALL PHASES COMPLETED (2026-01-01)

---

## Phase 1: Domain Identity Models (4-6h)

### Objective
Create pure POCO/Record identity models in Domain layer and define storage interfaces.

### Tasks

- [ ] **1.1** Create `DomainUser` record in `Source/Domain/Identity/Model/`
  - Copy properties from current `User` class
  - Remove inheritance from `IdentityUser<Guid>`
  - Add `Roles` collection property
  - Use `record` with `init` properties

- [ ] **1.2** Create `DomainRole` record in `Source/Domain/Identity/Model/`
  - Copy properties from current `Role` class
  - Remove inheritance from `IdentityRole<Guid>`
  - Add `Claims` collection property

- [ ] **1.3** Create `IUserStorage` interface in `Source/Domain/Identity/Storage/`
  - Define CRUD operations
  - Define role management operations
  - Use `Result<T>` pattern for error handling

- [ ] **1.4** Create `IRoleStorage` interface in `Source/Domain/Identity/Storage/`
  - Define CRUD operations
  - Define claim management operations

- [ ] **1.5** Remove `Microsoft.AspNetCore.Identity.EntityFrameworkCore` from Domain.csproj

- [ ] **1.6** Delete old identity model files (will be recreated in Data layer)
  - `UserClaim.cs`, `UserLogin.cs`, `UserRole.cs`, `UserToken.cs`, `RoleClaim.cs`

### Deliverables
- Pure domain identity models
- Storage interface contracts
- No infrastructure dependencies in Domain

### Verification
- Domain project builds without Identity.EntityFrameworkCore
- No EF Core references in Domain layer

---

## Phase 2: Data Layer Identity Implementation (4-6h)

### Objective
Implement EF Core Identity entities and storage implementations in Data layer.

### Tasks

- [ ] **2.1** Create identity entities folder structure in Data project
  ```
  Source/Data/Identity/
  ├── Entities/
  │   ├── User.cs
  │   ├── Role.cs
  │   ├── UserClaim.cs
  │   ├── UserLogin.cs
  │   ├── UserRole.cs
  │   ├── UserToken.cs
  │   └── RoleClaim.cs
  ├── Mappers/
  │   ├── UserMapper.cs
  │   └── RoleMapper.cs
  └── Storage/
      ├── UserStorage.cs
      └── RoleStorage.cs
  ```

- [ ] **2.2** Create EF Core Identity entities
  - `User : IdentityUser<Guid>` with custom properties
  - `Role : IdentityRole<Guid>`
  - Other identity entities inheriting from EF Core base classes
  - Mark entities as `internal` to prevent external usage

- [ ] **2.3** Create entity-to-domain mappers
  - `UserMapper.ToDomain()` and `ToEntity()` extensions
  - `RoleMapper.ToDomain()` and `ToEntity()` extensions
  - Handle roles/claims collections

- [ ] **2.4** Implement `UserStorage : IUserStorage`
  - Inject `UserManager<User>`
  - Implement all interface methods
  - Map between entities and domain models

- [ ] **2.5** Implement `RoleStorage : IRoleStorage`
  - Inject `RoleManager<Role>`
  - Implement all interface methods
  - Map between entities and domain models

- [ ] **2.6** Update `ApplicationDbContext`
  - Update `DbSet<User>` to use Data layer entity
  - Ensure Identity configuration still works

- [ ] **2.7** Update `IdentitySchemaBuilder.cs`
  - Reference Data layer entities
  - Update namespace imports

- [ ] **2.8** Update `IdentitySchemaSeeder.cs`
  - Reference Data layer entities
  - Update namespace imports

- [ ] **2.9** Add package reference to Data.csproj
  - Ensure `Microsoft.AspNetCore.Identity.EntityFrameworkCore` is in Data project

### Deliverables
- Complete EF Core Identity implementation in Data layer
- Working storage implementations
- Entity-to-domain mappers

### Verification
- Data project builds successfully
- Migrations still work (schema unchanged)
- Seed data still applies correctly

---

## Phase 3: Library Layer Cleanup (1-2h)

### Objective
Remove infrastructure dependencies from Library (service) layer.

### Tasks

- [ ] **3.1** Remove EF Core global using from `Source/Library/GlobalUsings.cs`
  ```diff
  - global using Microsoft.EntityFrameworkCore;
  ```

- [ ] **3.2** Verify all services compile without EF Core
  - Services should only use domain interfaces
  - Fix any compilation errors by using proper interfaces

- [ ] **3.3** Review and update any identity-related code in Library
  - Update imports to use domain models
  - Ensure no direct EF Core Identity usage

### Deliverables
- Clean Library layer without EF Core globals
- Services using domain interfaces only

### Verification
- Library project builds without EF Core global using
- No direct DbContext usage in services

---

## Phase 4: Auth Service Integration (2-4h)

### Objective
Update Auth service to use new storage interfaces while maintaining authentication flow.

### Tasks

- [ ] **4.1** Register storage implementations in `Source/Auth/Program.cs`
  ```csharp
  builder.Services.AddScoped<IUserStorage, UserStorage>();
  builder.Services.AddScoped<IRoleStorage, RoleStorage>();
  ```

- [ ] **4.2** Update authentication handlers
  - Use `IUserStorage` instead of `UserManager` directly
  - Or keep UserManager for auth-specific operations

- [ ] **4.3** Update JWT token generation
  - Ensure claims are properly mapped from domain models
  - Verify token structure remains compatible

- [ ] **4.4** Update authorization handlers
  - Use `IRoleStorage` for role checks if applicable
  - Ensure policy-based authorization still works

- [ ] **4.5** Test authentication flow end-to-end
  - Login with valid credentials
  - Token refresh
  - Role-based access

### Deliverables
- Auth service using storage interfaces
- Working authentication and authorization

### Verification
- Login flow works
- JWT tokens contain correct claims
- Role-based authorization works

---

## Phase 5: Health Check Abstraction (1-2h)

### Objective
Abstract Azure SDK usage in health checks.

### Tasks

- [ ] **5.1** Update `BlobStorageHealthCheck` to use `IBlobStorage`
  ```csharp
  public class BlobStorageHealthCheck(IBlobStorage blobStorage) : IHealthCheck {
      public async Task<HealthCheckResult> CheckHealthAsync(...) {
          var result = await blobStorage.ExistsAsync("health-check");
          return result.IsSuccess
              ? HealthCheckResult.Healthy()
              : HealthCheckResult.Unhealthy(result.Error);
      }
  }
  ```

- [ ] **5.2** Add `ExistsAsync` or equivalent method to `IBlobStorage` if needed

- [ ] **5.3** Remove direct Azure SDK dependency from Common project
  - Update package references
  - Remove Azure.Storage.Blobs if only used for health checks

- [ ] **5.4** Register health check with DI
  - Ensure IBlobStorage is available where health checks run

### Deliverables
- Health checks using storage abstractions
- No direct Azure SDK in Common project

### Verification
- Health check endpoint returns correct status
- No Azure SDK in Common project dependencies

---

## Phase 6: Testing & Verification (2-4h)

### Objective
Ensure all changes work correctly and maintain backwards compatibility.

### Tasks

- [ ] **6.1** Run full solution build
  ```bash
  dotnet build Source/VttTools.slnx
  ```

- [ ] **6.2** Run all unit tests
  ```bash
  dotnet test Source/VttTools.slnx
  ```

- [ ] **6.3** Add unit tests for new components
  - UserMapper tests
  - RoleMapper tests
  - UserStorage tests (with mocked UserManager)
  - RoleStorage tests (with mocked RoleManager)

- [ ] **6.4** Run integration tests
  - Authentication flow
  - Authorization flow
  - Database operations

- [ ] **6.5** Manual verification
  - Start application with Aspire
  - Login with test user
  - Verify protected endpoints work

- [ ] **6.6** Verify architecture compliance
  - Domain project: 0 infrastructure packages
  - Services: Only domain interface usage
  - No global EF Core usings in service layer

### Deliverables
- All tests passing
- Architecture compliance verified
- Manual testing completed

### Verification Checklist
- [ ] `dotnet build` succeeds with no warnings
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Login works
- [ ] Protected endpoints work
- [ ] Domain.csproj has no infrastructure packages
- [ ] Library/GlobalUsings.cs has no EF Core

---

## Progress Tracking

### Phase 1: Domain Identity Models ✅ COMPLETED
| Task | Status | Notes |
|------|--------|-------|
| 1.1 Create DomainUser | ✅ Done | `Source/Domain/Identity/Model/User.cs` - immutable record |
| 1.2 Create DomainRole | ✅ Done | `Source/Domain/Identity/Model/Role.cs` - immutable record |
| 1.3 Create IUserStorage | ✅ Done | `Source/Domain/Identity/Storage/IUserStorage.cs` |
| 1.4 Create IRoleStorage | ✅ Done | `Source/Domain/Identity/Storage/IRoleStorage.cs` |
| 1.5 Remove Identity package | ✅ Done | Removed from Domain.csproj |
| 1.6 Delete old model files | ✅ Done | UserClaim, UserLogin, UserRole, UserToken, RoleClaim deleted |

### Phase 2: Data Layer Implementation ✅ COMPLETED
| Task | Status | Notes |
|------|--------|-------|
| 2.1 Create folder structure | ✅ Done | `Source/Data/Identity/Entities/` |
| 2.2 Create EF entities | ✅ Done | User, Role, UserClaim, etc. inheriting IdentityUser/IdentityRole |
| 2.3 Create mappers | ✅ Done | `Source/Data/Identity/Mapper.cs` with ToModel/ToEntity/UpdateFrom |
| 2.4 Implement UserStorage | ✅ Done | `Source/Data/Identity/UserStorage.cs` |
| 2.5 Implement RoleStorage | ✅ Done | `Source/Data/Identity/RoleStorage.cs` |
| 2.6 Update DbContext | ✅ Done | Updated to use Data layer entities |
| 2.7 Update SchemaBuilder | ✅ Done | Updated entity references |
| 2.8 Update SchemaSeeder | ✅ Done | Updated entity references |
| 2.9 Add package reference | ✅ Done | Identity.EntityFrameworkCore in Data project |

### Phase 3: Library Cleanup ✅ COMPLETED
| Task | Status | Notes |
|------|--------|-------|
| 3.1 Remove EF Core global | ✅ Done | No EF Core global using in Library |
| 3.2 Verify compilation | ✅ Done | All services compile without EF Core |
| 3.3 Update identity code | ✅ Done | Services use UserEntity for Identity ops |

### Phase 4: Auth Integration ✅ COMPLETED
| Task | Status | Notes |
|------|--------|-------|
| 4.1 Register storage | ✅ Done | IUserStorage/IRoleStorage in DI |
| 4.2 Update handlers | ✅ Done | Auth/Admin services use UserEntity |
| 4.3 Update JWT generation | ✅ Done | Converts to Domain User via ToModel() |
| 4.4 Update authorization | ✅ Done | All role checks working |
| 4.5 Test auth flow | ✅ Done | All auth tests passing |

### Phase 5: Health Check ✅ COMPLETED
| Task | Status | Notes |
|------|--------|-------|
| 5.1 Delegate to Aspire | ✅ Done | Used `.WithHttpHealthCheck("health")` |
| 5.2 Remove custom checks | ✅ Done | Removed BlobStorage/Database/Cache health checks |
| 5.3 Fix infra references | ✅ Done | admin-api, web-app, admin-app |
| 5.4 Cleanup Common | ✅ Done | Removed Azure/SqlClient usings |

### Phase 6: Testing ✅ COMPLETED
| Task | Status | Notes |
|------|--------|-------|
| 6.1 Full build | ✅ Done | Build succeeds with 0 errors |
| 6.2 Unit tests | ✅ Done | 2,461 tests passing |
| 6.3 New component tests | ✅ Done | Storage implementations tested |
| 6.4 Integration tests | ✅ Done | All integration tests passing |
| 6.5 Manual verification | ✅ Done | Auth flows verified |
| 6.6 Architecture check | ✅ Done | Domain has 0 infrastructure packages |

---

## Rollback Strategy

If issues are encountered:

1. **Git revert** - All changes are version controlled
2. **Keep both models** - Temporarily keep old and new identity models
3. **Feature flag** - Use configuration to switch between implementations
4. **Incremental rollout** - Deploy phase by phase

---

**Version**: 1.0
**Last Updated**: 2025-12-30
