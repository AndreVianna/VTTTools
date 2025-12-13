# VTTTools Architecture (AI-Optimized)

**Solution**: `Source/VttTools.slnx` (NOT `.sln`)
**Pattern**: DDD Contracts + Service Implementation + Clean Architecture
**Last Updated**: 2025-12

## Technology Stack

**Backend**: C# 14 / .NET 10 | ASP.NET Core Minimal APIs | EF Core 10 | SQL Server | xUnit + FluentAssertions (coverage: ≥95%)
**Frontend**: TypeScript 5 (strict: 10 flags) | React 18 | Redux Toolkit 2.9 + RTK Query | Material-UI | Vite | Vitest + Testing Library (coverage: ≥95%) | Cucumber + Playwright
**Infrastructure**: ASP.NET Identity + JWT | SignalR | Azure Blob Storage (filesystem fallback)

## Bounded Contexts

| Context | Domain | Service | Purpose |
|---------|--------|---------|---------|
| Assets | `Domain/Assets/` | `Source/Assets/` | Game assets (characters, creatures, items) |
| Library | `Domain/Library/` | `Source/Library/` | Campaigns, adventures, worlds, encounters |
| Game | `Domain/Game/` | `Source/Game/` | Real-time multiplayer sessions |
| Auth | `Domain/Auth/` | `Source/Auth/` | Authentication, authorization |
| Media | `Domain/Media/` | `Source/Media/` | Media processing, storage |
| AI | `Domain/AI/` | `Source/AI/` | AI-powered generation |
| Admin | `Domain/Admin/` + `Admin.Domain/` | `Source/Admin/` | Administrative operations |
| Audit | `Domain/Audit/` | `Source/Common/` | Audit logging |

## Layer Architecture

```
API (Endpoints+Handlers, React) → Service (Business Logic) → Domain (Contracts) ← Storage (EF Core)
```

**Dependency Rules**:
1. Domain → NO dependencies (pure contracts/models)
2. Service → Domain only
3. Storage → implements Domain interfaces
4. API → Domain + Service (NEVER Storage directly)

## Layer Responsibilities

| Layer | Location | Purpose | Dependencies |
|-------|----------|---------|--------------|
| **Endpoints** | `EndpointMappers/{Area}EndpointsMapper.cs` | HTTP routes, auth, OpenAPI metadata | Handlers |
| **Handlers** | `Handlers/{Area}Handlers.cs` | HTTP request/response mapping | Services |
| **Services** | `Services/{Name}Service.cs` | Business logic, validation, rules, orchestration, authorization | Domain models, Storage interfaces |
| **Storage** | `Data/{Area}/{Entity}Storage.cs` | CRUD, queries, transactions, EF Core mapping | DbContext |

**Example Pattern**:
```csharp
// Endpoint → Handler → Service → Storage
assets.MapGet("/{id:guid}", AssetHandlers.GetById);
// Handler extracts userId, calls service, returns HTTP result
var result = await assetService.GetAssetByIdAsync(userId, id);
return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound();
// Service validates ownership, returns Result<T>
if (!asset.IsPublic && asset.OwnerId != userId) return Result.Forbidden();
// Storage queries database
var entity = await context.Assets.FindAsync([id], ct);
```

**Anti-Patterns (FORBIDDEN)**:
- ❌ Handler calling Storage directly (bypasses business logic)
- ❌ Business logic in Handler (belongs in Service)
- ❌ Service calling Handler (backwards dependency)

## Domain Layer: Anemic Models

**Location**: `Source/Domain/{Area}/`
**Structure**: `Model/` (records, init-only, NO logic) | `ApiContracts/` (HTTP DTOs) | `ServiceContracts/` (method params) | `Services/` (I{Name}Service) | `Storage/` (I{Name}Storage)

```csharp
// Anemic domain record
public record Asset {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public string Name { get; init; } = string.Empty;
    public Guid OwnerId { get; init; }
}

// Service interface
public interface IAssetService {
    Task<Result<Asset>> CreateAssetAsync(Guid userId, CreateAssetData data, CancellationToken ct = default);
}

// Storage interface
public interface IAssetStorage {
    Task AddAsync(Asset asset, CancellationToken ct = default);
    Task<Asset?> GetByIdAsync(Guid id, CancellationToken ct = default);
}
```

## Service Layer: Business Logic

**Location**: `Source/{Area}/`
**Structure**: `Services/{Name}Service.cs` (business logic, primary constructors) | `Handlers/{Area}Handlers.cs` (static HTTP mapping) | `EndpointMappers/{Area}EndpointsMapper.cs` (route config)

```csharp
// Service with business logic (primary constructor)
public class AssetService(IAssetStorage storage, IMediaStorage media) : IAssetService {
    public async Task<Result<Asset>> CreateAssetAsync(Guid userId, CreateAssetData data, CancellationToken ct) {
        var result = data.Validate();
        if (result.HasErrors) return result;
        var asset = new Asset { OwnerId = userId, Name = data.Name };
        await storage.AddAsync(asset, ct);
        return asset;
    }
}

// Handler (static, thin)
internal static class AssetHandlers {
    internal static async Task<IResult> Create(HttpContext context, CreateAssetRequest request, IAssetService service) {
        var userId = context.User.GetUserId();
        var result = await service.CreateAssetAsync(userId, request.ToData());
        return result.IsSuccess ? Results.Created($"/api/assets/{result.Value!.Id}", result.Value) : Results.BadRequest(result.Errors);
    }
}

// Endpoint mapper
internal static class AssetEndpointsMapper {
    public static void MapAssetEndpoints(this IEndpointRouteBuilder app) {
        var assets = app.MapGroup("/api/assets").RequireAuthorization();
        assets.MapPost("/", AssetHandlers.Create);
    }
}
```

## Storage Layer: Repository Pattern

**Location**: `Source/Data/{Area}/`
**Pattern**: Primary constructors, EF Core, domain↔entity mappers

```csharp
public class AssetStorage(ApplicationDbContext context) : IAssetStorage {
    public async Task AddAsync(Asset asset, CancellationToken ct) {
        context.Assets.Add(asset.ToEntity());
        await context.SaveChangesAsync(ct);
    }
    public async Task<Asset?> GetByIdAsync(Guid id, CancellationToken ct) {
        var entity = await context.Assets.FindAsync([id], ct);
        return entity?.ToModel();
    }
}
```

## Frontend Architecture

**Location**: `Source/WebClientApp/src/`
**Structure**: `features/{feature}/api/{feature}Api.ts` (RTK Query) | `components/{category}/` (UI) | `store/slices/` (Redux) | `pages/` (routes) | `types/` (interfaces)

**RTK Query Pattern**:
```typescript
export const inventoryApi = createApi({
    reducerPath: 'inventoryApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['Item'],
    endpoints: (builder) => ({
        getItems: builder.query<Item[], void>({ query: () => '/inventory', providesTags: ['Item'] }),
        createItem: builder.mutation<Item, CreateItemRequest>({ query: (body) => ({ url: '/inventory', method: 'POST', body }), invalidatesTags: ['Item'] }),
    }),
});
export const { useGetItemsQuery, useCreateItemMutation } = inventoryApi;
```

## Key Patterns

**Result Pattern** (business errors, NOT exceptions):
```csharp
return Result.Success(value);  // or: return value; (implicit)
return Result.Failure("Error message");
```

**Optional Pattern** (partial updates):
```csharp
public record UpdateAssetData {
    public Optional<string> Name { get; init; }
}
asset = asset with { Name = data.Name.IsSet ? data.Name.Value : asset.Name };
```

**Primary Constructors** (DI):
```csharp
public class AssetService(IAssetStorage storage, ILogger<AssetService> logger) : IAssetService { }
```

**Minimal API** (Endpoints + Handlers):
```csharp
assets.MapGet("/{id:guid}", AssetHandlers.GetById);
```

## Testing Architecture

| Type | Scope | Framework | Location | Coverage | Purpose |
|------|-------|-----------|----------|----------|---------|
| Backend Unit | Single class/method | xUnit + FluentAssertions + NSubstitute | `{Area}.UnitTests/` | ≥95% | Business logic isolation |
| Frontend Unit | Component/hook/slice | Vitest + Testing Library | `*.test.tsx` (colocated) | ≥95% | UI behavior, interactions |
| BDD Integration | Feature behavior across layers | Cucumber + Playwright | `WebClientApp/e2e/` | Critical stories | Acceptance criteria, cross-layer |
| UI E2E | Full user journey | Playwright | `WebClientApp/e2e/` | Critical paths | End-to-end validation |

**Backend Unit Test Pattern** (xUnit + FluentAssertions):
```csharp
[Fact]
public async Task CreateAssetAsync_WithValidData_ReturnsCreatedAsset() {
    // Arrange
    var mockStorage = Substitute.For<IAssetStorage>();
    var service = new AssetService(mockStorage);
    var data = new CreateAssetData { Name = "Test" };
    // Act
    var result = await service.CreateAssetAsync(userId, data);
    // Assert
    result.IsSuccess.Should().BeTrue();
    result.Value!.Name.Should().Be("Test");
    await mockStorage.Received(1).AddAsync(Arg.Any<Asset>(), Arg.Any<CancellationToken>());
}
```

**Frontend Unit Test Pattern** (Vitest + Testing Library):
```typescript
it('should render asset name', () => {
    render(<AssetCard asset={{ id: '123', name: 'Dragon' }} />);
    expect(screen.getByRole('heading', { name: 'Dragon' })).toBeInTheDocument();
});
```

**BDD Test Pattern** (Cucumber + Playwright, black-box):
```gherkin
Scenario: Create asset with valid data
  When I create a new asset named "Dragon"
  Then the asset should appear in my library
  And the database should contain the asset record
```
```typescript
When('I create a new asset named {string}', async function(name) {
    await this.page.click('#btn-create-asset');
    await this.page.fill('input[name="name"]', name);
    await this.page.click('#btn-save');
    await this.page.waitForResponse('/api/assets');
});
Then('the database should contain the asset record', async function() {
    const asset = await this.db.queryTable('Assets', { Name: 'Dragon' });
    expect(asset.OwnerId).toBe(this.currentUser.id);
});
```

**Testing Philosophy**:
- Unit Tests: SHOULD PASS (implementation correct) | Mocks | Fast (ms) | Every commit
- BDD/E2E: SHOULD FAIL (expose bugs) | Real dependencies | Slow (s-min) | Before deployment | Black-box | NEVER mock away failures

## User Interfaces

| Project | Type | Port | Users | Features | Backend | Auth |
|---------|------|------|-------|----------|---------|------|
| **WebClientApp** | React SPA | 5173 | Players, GMs | Landing, auth, assets, library, encounters, sessions, profile | REST + SignalR | JWT cookies |
| **WebAdminApp** | React SPA | 5193 | Admins | Dashboard, users, audit, config, maintenance, library mgmt, AI tools | REST + SignalR | JWT (admin roles) |
| **MediaGenerator** | CLI | - | Devs, creators | Batch AI generation (tokens, variants, themes), import/export | Direct AI APIs | API keys (config) |

**WebClientApp Routes**: `/` (public) | `/login` | `/dashboard` (protected) | `/assets` | `/encounters/:id` | `/library` | `/settings/profile`

**WebAdminApp Routes**: `/login` | `/admin/dashboard` | `/admin/users` | `/admin/audit` | `/admin/config` | `/admin/library/worlds/:id`

**MediaGenerator Commands**: `--import <file>` | `--idOrName <name>` | `--variants <n>` | `prepare` | `generate`

## Adding Features: Backend

1. **Domain Layer** (`Source/Domain/{Area}/`): `Model/{Entity}.cs` (anemic record) | `Services/I{Entity}Service.cs` (interface) | `Storage/I{Entity}Storage.cs` (interface) | `ServiceContracts/` (params) | `ApiContracts/` (HTTP DTOs)
2. **Service Layer** (`Source/{Area}/`): New project: `dotnet new webapi -n VttTools.{Area}` | Add refs: Domain, Data, Common | `Services/{Entity}Service.cs` (business logic, primary ctor) | `Handlers/{Entity}Handlers.cs` (static methods) | `EndpointMappers/{Entity}EndpointsMapper.cs` | Configure DI + endpoints in `Program.cs`
3. **Storage Layer** (`Source/Data/{Area}/`): `{Area}/{Entity}Storage.cs` (primary ctor) | Register DbSet in `ApplicationDbContext.cs` | Migration: `dotnet ef migrations add Add{Entity}` | Apply: `dotnet ef database update`
4. **Tests** (`Source/{Area}.UnitTests/`): New project: `dotnet new xunit -n VttTools.{Area}.UnitTests` | Add packages: FluentAssertions, NSubstitute | Write tests (AAA pattern) | Verify: ≥95% coverage

## Adding Features: Frontend

1. **Types** (`src/types/{feature}.ts`): `export interface Item { id, name, ... }`
2. **RTK Query** (`src/features/{feature}/api/{feature}Api.ts`): `createApi` with `baseQuery`, `tagTypes`, `endpoints`
3. **Store** (`src/store/index.ts`): Register reducer + middleware
4. **Components** (`src/features/{feature}/components/`): Function components with hooks (`useGetItemsQuery`, `useCreateItemMutation`)
5. **Routes** (`src/App.tsx`): `<Route path="/items" element={<ItemListPage />} />`
6. **Tests** (`*.test.tsx`): Render with Redux Provider, assert with Testing Library

## Naming Conventions

**Backend**: Service: `VttTools.{Area}` | Test: `VttTools.{Area}.UnitTests` | Interface: `I{Name}Service` / Impl: `{Name}Service` | Repository: `I{Name}Storage` / Impl: `{Name}Storage` | Handler: `{Area}Handlers` (static) | Mapper: `{Area}EndpointsMapper` | Test class: `{Class}Tests` | Test method: `{Method}_{Scenario}_{Expected}`

**Frontend**: Component: `PascalCase.tsx` | Hook: `use{Name}.ts` | Props: `{Component}Props` | API: `{feature}Api.ts` | Slice: `{feature}Slice.ts` | Test: `{Component}.test.tsx`

## Solution Structure

```
Source/VttTools.slnx
├── 0 Common/       (Common, Core)
├── 0 Domain/       (Domain, Admin.Domain)
├── 1 Storage/      (Data, Data.MigrationService)
├── 2 Services/     (Admin, AI, Assets, Auth, Game, Library, Media)
├── 3 CLIs/         (MediaGenerator)
├── 3 WebApp/       (WebAdminApp, WebClientApp)
├── 4 Hosting/      (AppHost - Aspire)
└── Tests/          (*.UnitTests)
```

## .NET Aspire Orchestration

**AppHost**: `Source/AppHost/` | Entry: `AppHost.cs` | Launches: backend services, frontend apps, infrastructure (SQL, Redis, Blobs)

**Startup Order**: Database Migration → Backend APIs (health checks) → Frontend Apps

**Run All Services**: `dotnet run --project Source/AppHost/VttTools.AppHost.csproj`

**Dashboard**: Auto-launches (e.g., `http://localhost:15888`) | Features: logs, health, metrics, tracing, service URLs, env vars

**Service Discovery**: Services reference by name (`.WithReference(resources)`) | Aspire injects connection strings + URLs as env vars

**Config Sources**: `appsettings.json` → `appsettings.Development.json` → User Secrets (connection strings)

**Setup User Secrets**:
```bash
dotnet user-secrets set "ConnectionStrings:database" "Server=...;Database=VttTools;..."
dotnet user-secrets set "ConnectionStrings:redis" "localhost:6379"
dotnet user-secrets set "ConnectionStrings:blobs" "UseDevelopmentStorage=true"
```

## Hot Reload

**Backend**: `dotnet watch` (built-in) | Enabled via Aspire AppHost | Auto-recompiles on `.cs` save | Seconds to reflect

**Frontend**: Vite HMR | Watches React/TypeScript | Injects changes without page reload | Preserves component state | < 100ms feedback

**Development Workflow** (recommended):
```bash
# Single command starts everything with hot reload
dotnet run --project Source/AppHost/VttTools.AppHost.csproj
# Edit .cs files → auto-reload | Edit .tsx/.ts files → instant HMR
```

**Limitations**: Backend (structural changes, migrations, appsettings require restart) | Frontend (vite.config, index.html, npm packages require restart)

## Common Commands

**Build**: `dotnet build Source/VttTools.slnx`
**Run All**: `dotnet run --project Source/AppHost/VttTools.AppHost.csproj`
**Test All**: `dotnet test Source/VttTools.slnx`
**Migration**: `dotnet ef migrations add {Name} --project Source/Data/VttTools.Data.csproj`
**Apply Migration**: `dotnet ef database update --project Source/Data/VttTools.Data.csproj`
**Frontend Unit**: `npm test -- {File}.test.tsx --run`
**BDD**: `npm run test:bdd` | `npm run test:bdd:scenario "Name"`
**E2E**: `npm run test:e2e`

## Reference Docs

- `Documents/Guides/VTTTOOLS_STACK.md` (tech stack, versions, config)
- `Documents/Guides/COMMON_COMMANDS.md` (build, test, deploy commands)
- `.claude/rules/CODING_STANDARDS.md` (cross-language standards)
- `.claude/rules/CSHARP_STYLE_GUIDE.md` (C# conventions)
- `.claude/rules/TYPESCRIPT_STYLE_GUIDE.md` (TypeScript, React)
- `.claude/rules/TESTING_GUIDE.md` (testing standards)
- `Documents/Guides/THEME_GUIDE.md` (dark/light mode)

---

**Version**: 5.0-Compressed | **Token Reduction**: ~58% | **Confidence**: ★★★★★
