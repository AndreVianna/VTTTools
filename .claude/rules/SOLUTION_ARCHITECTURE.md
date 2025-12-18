# Architecture

Solution: `Source/VttTools.slnx` | Pattern: DDD Contracts + Service Implementation + Clean Architecture

## Stack
Backend: C# 14/.NET 10 | Minimal APIs | EF Core 10 | SQL Server | xUnit+FluentAssertions+NSubstitute
Frontend: TS 5 strict | React 18 | Redux Toolkit 2.9+RTK Query | MUI | Vite | Vitest+Testing Library | Cucumber+Playwright
Infra: Identity+JWT | SignalR | Azure Blob (filesystem fallback)

## Contexts
| Context | Domain | Service | Purpose |
|---------|--------|---------|---------|
| Assets | Domain/Assets/ | Assets/ | Characters, creatures, items |
| Library | Domain/Library/ | Library/ | Campaigns, adventures, worlds, encounters |
| Game | Domain/Game/ | Game/ | Real-time sessions |
| Auth | Domain/Auth/ | Auth/ | Authentication |
| Media | Domain/Media/ | Media/ | Media processing |
| AI | Domain/AI/ | AI/ | AI generation |
| Admin | Domain/Admin/+Admin.Domain/ | Admin/ | Admin ops |

## Layers
```
API (Endpoints+Handlers) → Service (Business Logic) → Domain (Contracts) ← Storage (EF Core)
```
1. Domain → NO deps (pure contracts/models)
2. Service → Domain only
3. Storage → implements Domain interfaces
4. API → Domain+Service (NEVER Storage)

| Layer | Location | Purpose |
|-------|----------|---------|
| Endpoints | `EndpointMappers/{Area}EndpointsMapper.cs` | Routes, auth |
| Handlers | `Handlers/{Area}Handlers.cs` | HTTP mapping |
| Services | `Services/{Name}Service.cs` | Business logic, validation |
| Storage | `Data/{Area}/{Entity}Storage.cs` | CRUD, EF Core |

❌ Handler→Storage | ❌ Logic in Handler | ❌ Service→Handler

## Domain Layer
Location: `Source/Domain/{Area}/`
Structure: Model/ (records, init-only) | ApiContracts/ (HTTP DTOs) | ServiceContracts/ (params) | Services/ (I{Name}Service) | Storage/ (I{Name}Storage)
```csharp
public record Asset { public Guid Id { get; init; } public string Name { get; init; } = ""; public Guid OwnerId { get; init; } }
public interface IAssetService { Task<Result<Asset>> CreateAsync(Guid userId, CreateAssetData data, CancellationToken ct = default); }
public interface IAssetStorage { Task AddAsync(Asset asset, CancellationToken ct = default); Task<Asset?> GetByIdAsync(Guid id, CancellationToken ct = default); }
```

## Service Layer
Location: `Source/{Area}/` | Structure: Services/ | Handlers/ | EndpointMappers/
```csharp
public class AssetService(IAssetStorage storage) : IAssetService {
    public async Task<Result<Asset>> CreateAsync(Guid userId, CreateAssetData data, CancellationToken ct) {
        if (data.Validate() is { HasErrors: true } r) return r;
        var asset = new Asset { OwnerId = userId, Name = data.Name };
        await storage.AddAsync(asset, ct); return asset;
    }
}
internal static class AssetHandlers {
    internal static async Task<IResult> Create(HttpContext ctx, CreateAssetRequest req, IAssetService svc) {
        var result = await svc.CreateAsync(ctx.User.GetUserId(), req.ToData());
        return result.IsSuccess ? Results.Created($"/api/assets/{result.Value!.Id}", result.Value) : Results.BadRequest(result.Errors);
    }
}
internal static class AssetEndpointsMapper {
    public static void MapAssetEndpoints(this IEndpointRouteBuilder app) => app.MapGroup("/api/assets").RequireAuthorization().MapPost("/", AssetHandlers.Create);
}
```

## Storage Layer
Location: `Source/Data/{Area}/` | Pattern: Primary ctors, EF Core, domain↔entity mappers
```csharp
public class AssetStorage(ApplicationDbContext ctx) : IAssetStorage {
    public async Task AddAsync(Asset a, CancellationToken ct) { ctx.Assets.Add(a.ToEntity()); await ctx.SaveChangesAsync(ct); }
    public async Task<Asset?> GetByIdAsync(Guid id, CancellationToken ct) => (await ctx.Assets.FindAsync([id], ct))?.ToModel();
}
```

## Frontend
Location: `Source/WebClientApp/src/`
Structure: features/{f}/api/{f}Api.ts (RTK Query) | components/{cat}/ | store/slices/ | pages/ | types/
```typescript
export const assetApi = createApi({
    reducerPath: 'assetApi', baseQuery: fetchBaseQuery({ baseUrl: '/api' }), tagTypes: ['Asset'],
    endpoints: (b) => ({
        getAssets: b.query<Asset[], void>({ query: () => '/assets', providesTags: ['Asset'] }),
        createAsset: b.mutation<Asset, CreateReq>({ query: (body) => ({ url: '/assets', method: 'POST', body }), invalidatesTags: ['Asset'] }),
    }),
});
```

## Patterns
Result: `Result.Success(v)` / `Result.Failure("msg")` | TypedResult for handlers
Optional: `Optional<string> Name` → `data.Name.IsSet ? data.Name.Value : existing`
Primary Ctors: `public class Svc(IStorage s) : ISvc { }`

## SignalR Real-Time Events
Full guide: `Documents/Guides/SIGNALR_HUB_PATTERN.md`

| Component | Location | Purpose |
|-----------|----------|---------|
| Hub | `{Area}/Hubs/{Area}Hub.cs` | Client subscriptions, authorization |
| Hub Client | `Domain/{Area}/Hubs/I{Area}HubClient.cs` | Event contract |
| EventPublisher | `{Area}/Services/{Area}EventPublisher.cs` | Push via HubContext |
| EventCollector | `{Area}/Services/{Area}EventCollector.cs` | Transaction-safe batching |
| useSignalRHub | `WebComponents/src/hooks/` | Generic React hook |
| use{Area}Hub | `Web{App}/src/hooks/` | Domain-specific wrapper |

Key rules:
- Use `EventCollector` → publish events AFTER all DB commits (transaction safety)
- Use policy-based authorization in hub (`IAuthorizationService`)
- Use httpOnly cookies for auth (not localStorage tokens)
- Frontend: `useSignalRHub` with `withCredentials: true` for cookie auth

## Design Decisions
| Rule | Rationale |
|------|-----------|
| ❌ `CreatedBy`/`ModifiedBy` in models | Use AuditLogs for tracking who did what |
| ❌ Type enums for extensible categories | Use strings (e.g., `JobType` is string, not enum) |
| ❌ Redundant type discriminators | Use pattern matching on concrete types instead |
| ✅ Content-agnostic services | Jobs service stores opaque JSON, doesn't parse job-specific data |

## Testing
| Type | Framework | Location | Coverage |
|------|-----------|----------|----------|
| Backend Unit | xUnit+FluentAssertions+NSubstitute | {Area}.UnitTests/ | ≥95% |
| Frontend Unit | Vitest+Testing Library | *.test.tsx | ≥95% |
| BDD | Cucumber+Playwright | WebClientApp/e2e/ | Critical |
Unit: SHOULD PASS | Mocks | Fast | BDD: SHOULD FAIL | Real deps | Slow | Black-box

## UIs
| Project | Port | Users |
|---------|------|-------|
| WebClientApp | 5173 | Players, GMs |
| WebAdminApp | 5193 | Admins |
| MediaGenerator | CLI | Devs |

## Adding Features
**Backend**: Domain/ (Model+I{Name}Service+I{Name}Storage) → Service/ (Service+Handlers+Endpoints) → Data/ (Storage+DbSet+Migration) → Tests/
**Frontend**: types/ → features/api/ → store/ → components/ → routes → tests

## Naming
Backend: `VttTools.{Area}` | `I{Name}Service/{Name}Service` | `I{Name}Storage/{Name}Storage` | `{Area}Handlers` | `{Class}Tests` | `{Method}_{Scenario}_{Expected}`
Frontend: `PascalCase.tsx` | `use{Name}.ts` | `{Component}Props` | `{feature}Api.ts` | `{Name}.test.tsx`

## Structure
```
Source/VttTools.slnx
├── 0 Common/Domain  ├── 1 Storage/Data  ├── 2 Services/(Admin,AI,Assets,Auth,Game,Library,Media)
├── 3 CLIs,WebApps   ├── 4 Hosting/AppHost  └── Tests/*.UnitTests
```

## Aspire
Run: `dotnet run --project Source/AppHost/VttTools.AppHost.csproj`
Order: Migration → APIs (health) → Frontend | Dashboard auto-launches | Hot reload enabled
