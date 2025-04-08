namespace WebApi.Tenants.EntityFrameworkCore.DataStores;

public sealed class TenantDataStore(TenantDataContext context,
                                    ITenantMapper<Tenant, TenantEntity> map,
                                    TimeProvider timeProvider,
                                    ILogger<TenantDataStore> logger)
    : TenantDataStore<TenantDataStore, Tenant, TenantEntity>(context, map, timeProvider, logger);

public class TenantDataStore<TStore, TTenant, TTenantEntity>(TenantDataContext<TTenantEntity> context,
                                                             ITenantMapper<TTenant, TTenantEntity> map,
                                                             TimeProvider timeProvider,
                                                             ILogger<TStore> logger)
    : ITenantDataStore<TTenant>
    where TStore : TenantDataStore<TStore, TTenant, TTenantEntity>
    where TTenant : Tenant, new()
    where TTenantEntity : TenantEntity, new() {
    /// <inheritdoc />
    public Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        => context.Tenants.AnyAsync(e => e.Id == id, ct);

    /// <inheritdoc />
    public async ValueTask<TTenant?> FindByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Tenants
                                  .AsNoTracking()
                                  .FirstOrDefaultAsync(e => e.Id == id, ct);
        return map.ToDomainModel(entity);
    }

    /// <inheritdoc />
    public async ValueTask<TTenant?> FindByTokenIdAsync(Guid id, CancellationToken ct) {
        var now = timeProvider.GetUtcNow();
        var entity = await context.Tokens
                                  .Include(t => t.Tenant)
                                  .AsNoTracking()
                                  .Where(t => t.Id == id && t.ValidUntil < now)
                                  .FirstOrDefaultAsync(ct);
        return map.ToDomainModel((TTenantEntity?)entity?.Tenant);
    }

    /// <inheritdoc />
    public async Task<bool> AddOrUpdateAsync(TTenant tenant, CancellationToken ct = default) {
        Ensure.IsNotNull(tenant);
        var entity = await context.Tenants.FindAsync([tenant.Id], cancellationToken: ct); // Use FindAsync with key array

        if (entity is null) {
            entity = map.ToEntity(tenant)!;
            await context.Tenants.AddAsync(entity, ct);
            tenant.Id = entity.Id;
            await context.SaveChangesAsync(ct);
            logger.LogInformation("Added new tenant with ID '{TenantId}'.", entity.Id);
            return true;
        }

        entity.Name = tenant.Name;
        entity.Secret = tenant.Secret;
        context.Tenants.Update(entity);
        await context.SaveChangesAsync(ct);
        logger.LogInformation("Updated tenant with ID '{TenantId}'.", entity.Id);
        return false;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var changes = await context.Tenants.Where(e => e.Id == id).ExecuteDeleteAsync(ct);
        if (changes == 0) {
            logger.LogWarning("Attempted to delete non-existent tenant with ID '{TenantId}'.", id);
            return false;
        }

        logger.LogInformation("Deleted tenant with ID '{TenantId}'.", id);
        return changes > 0;
    }

    /// <inheritdoc />
    public async ValueTask<IEnumerable<AccessToken>> GetAccessTokensAsync(Guid tenantId, CancellationToken ct = default) {
        var now = timeProvider.GetUtcNow();
        return await context.Tokens
                            .AsNoTracking()
                            .Where(e => e.TenantId == tenantId && e.ValidUntil > now)
                            .Select(e => map.ToDomainModel(e)!)
                            .ToArrayAsync(ct);
    }

    /// <inheritdoc />
    public async Task<bool> AddAccessTokenAsync(Guid tenantId, AccessToken accessToken, CancellationToken ct = default) {
        Ensure.IsNotNull(accessToken);
        if (accessToken.Type != AuthTokenType.Access)
            throw new ArgumentException("Invalid access token type provided.");
        var entity = map.ToEntity(accessToken, tenantId)!;
        await context.Tokens.AddAsync(entity, ct);
        var changes = await context.SaveChangesAsync(ct);
        return changes > 0;
    }

    /// <inheritdoc />
    public async Task<bool> RemoveAccessTokenAsync(Guid id, CancellationToken ct = default) {
        var changes = await context.Tokens
                      .Where(e => e.Id == id)
                      .ExecuteDeleteAsync(ct);
        if (changes == 0) {
            logger.LogWarning("Attempted to remove non-existent access token  id: {TokenId}.", id);
            return false;
        }

        logger.LogInformation("Removed access token with id: {TokenId}.", id);
        return true;
    }

    /// <inheritdoc />
    public async ValueTask<AccessToken?> FindTokenByIdAsync(Guid id, CancellationToken ct) {
        var now = timeProvider.GetUtcNow();
        var entity = await context.Tokens
                                  .AsNoTracking()
                                  .Where(t => t.Id == id && t.ValidUntil < now)
                                  .FirstOrDefaultAsync(ct);
        return map.ToDomainModel(entity);
    }

    /// <inheritdoc />
    public async Task<bool> InvalidateTokenAsync(Guid id, CancellationToken ct = default) {
        var affectedRows = await context.Tokens
                                        .Where(t => t.Id == id)
                                        .ExecuteUpdateAsync(updates => updates.SetProperty(t => t.CanRefreshUntil, (DateTimeOffset?)null),
                                                            ct);

        if (affectedRows == 0) {
            logger.LogWarning("Attempted to invalidate non-existent token with id '{TokenId}'.", id);
            return false;
        }

        logger.LogInformation("Invalidated token with id '{TokenId}'.", id);
        return true;
    }

    /// <inheritdoc />
    public async Task<int> CleanExpiredTokensAsync(CancellationToken ct = default) {
        var now = timeProvider.GetUtcNow();
        var affectedRows = await context.Tokens
                                      .Where(t => t.CanRefreshUntil <= now)
                                      .ExecuteUpdateAsync(updates => updates.SetProperty(t => t.CanRefreshUntil, (DateTimeOffset?)null), ct);

        logger.LogInformation("Invalidated {Count} expired refresh tokens during cleanup.", affectedRows);

        var deletedRows = await context.Tokens
                                      .Where(t => t.ValidUntil <= now && t.CanRefreshUntil <= now)
                                      .ExecuteDeleteAsync(ct);
        logger.LogInformation("Deleted {Count} fully expired token records during cleanup.", deletedRows);
        return affectedRows;
    }
}
