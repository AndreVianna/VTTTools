# C# Style

.editorconfig enforced | Coverage ≥95%

## Rules
| Rule | Standard |
|------|----------|
| Indent | 4 spaces |
| Braces | K&R (same line) |
| Namespaces | File-scoped |
| var | Always |
| Private fields | `_camelCase` |
| Async | `{Name}Async` suffix |
| Collections | `[]` expressions |
| Null | `is null`/`is not null` |
| Models | Records, init-only |
| DI | Primary constructors |

## Naming
| Element | Casing |
|---------|--------|
| Class/Interface/Method/Property | PascalCase |
| Private field | _camelCase |
| Parameter/Local | camelCase |
| Public const | PascalCase |
Interface: `I{Name}` | Async: `{Name}Async` | Bool: `Is/Has/Can{Name}`

## Features
```csharp
// File structure
namespace VttTools.Game.Services;
public class GameSessionService(IGameSessionStorage storage) : IGameSessionService { }

// Collections & patterns
List<Item> items = [];
var all = [.. existing, newItem];
if (session is { Status: InProgress, Players.Count: > 0 }) { }
var status = code switch { OK => "Success", _ => "Unknown" };
var last = items[^1];

// Null
var title = session.Title ?? "Untitled";
_cache ??= new Dictionary<Guid, GameSession>();

// Async - always pass CancellationToken
public async Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default) => await _storage.GetByIdAsync(id, ct);
```
❌ `.Result`/`.Wait()` | ❌ `async void`

## Result Pattern
```csharp
// Business errors → Result<T>, NOT exceptions
public async Task<TypedResult<HttpStatusCode, Asset>> UpdateAsync(...) {
    if (asset is null) return TypedResult.As(HttpStatusCode.NotFound).WithNo<Asset>();
    if (asset.OwnerId != userId) return TypedResult.As(HttpStatusCode.Forbidden).WithNo<Asset>();
    return TypedResult.As(HttpStatusCode.OK, asset);
}
```
`Result<T>` internal | `TypedResult<HttpStatusCode,T>` handlers | Exceptions: infra only

## DI
```csharp
public static IHostApplicationBuilder AddGameServices(this IHostApplicationBuilder b) {
    b.Services.AddScoped<IGameSessionService, GameSessionService>();
    return b;
}
```

## Minimal API
```csharp
// Endpoints
group.MapGet("/{id:guid}", AssetHandlers.GetById).RequireAuthorization().WithOpenApi();
// Handlers
public static async Task<Results<Ok<Asset>, NotFound>> GetById(Guid id, IAssetService svc, CancellationToken ct) {
    var asset = await svc.GetByIdAsync(id, ct);
    return asset is null ? TypedResults.NotFound() : TypedResults.Ok(asset);
}
```

## LINQ
```csharp
var summaries = await _db.Assets.Select(a => new { a.Id, a.Title }).ToListAsync(ct); // Projection
await foreach (var item in query.AsAsyncEnumerable().WithCancellation(ct)) { }
```
❌ Load full entities then project in memory

## Exceptions
```csharp
try { return await _storage.GetByIdAsync(id, ct); }
catch (OperationCanceledException) { throw; }
catch (DbUpdateException ex) { _logger.LogError(ex, "DB error {Id}", id); throw new StorageException("Failed", ex); }
```
❌ `catch (Exception)` | ❌ Silent swallow

## Resources
```csharp
using var stream = File.OpenRead(path);
using (var tx = await _db.Database.BeginTransactionAsync(ct)) { await tx.CommitAsync(ct); }
```

## Review
Style: .editorconfig | File-scoped | K&R | var | _camelCase | Async suffix
Features: Primary ctors | Expression-bodied | [] collections | Pattern matching | Records
Quality: No warnings | Null handled | CancellationToken | DI | No magic numbers
