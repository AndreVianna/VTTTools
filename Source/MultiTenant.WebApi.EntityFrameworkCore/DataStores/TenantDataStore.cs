using System.Linq.Expressions;

using Microsoft.EntityFrameworkCore.Query;

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
    public async ValueTask<TTenant?> FindByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Tenants
                                  .Include(t => t.Tokens)
                                  .AsNoTracking()
                                  .FirstOrDefaultAsync(e => e.Id == id, ct);
        return map.ToModel(entity);
    }

    /// <inheritdoc />
    public async ValueTask<TTenant?> FindByActiveAccessTokenAsync(Guid ownerId, Guid tokenId, CancellationToken ct) {
        var now = timeProvider.GetUtcNow();
        var entity = await context.Tenants
                                  .Include(t => t.Tokens)
                                  .Where(t => t.Id == ownerId
                                           && t.Tokens.Any(tt => tt.Id == tokenId
                                                              && tt.ValidUntil < now))
                                  .AsNoTracking()
                                  .FirstOrDefaultAsync(ct);
        return map.ToModel(entity);
    }

    /// <inheritdoc />
    public async Task<bool> AddOrUpdateAsync(TTenant tenant, CancellationToken ct = default) {
        Ensure.IsNotNull(tenant);
        var entity = await context.Tenants.FindAsync([tenant.Id], cancellationToken: ct);

        if (entity is null) {
            entity = map.ToEntity(tenant)!;
            await context.Tenants.AddAsync(entity, ct);
            tenant.Id = entity.Id;
            await context.SaveChangesAsync(ct);
            logger.LogInformation("Added new tenant with ID '{TenantId}'.", entity.Id);
            return true;
        }

        map.UpdateEntity(tenant, entity);
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
    public async ValueTask<IEnumerable<AccessToken>> GetTenantAccessTokensAsync(Guid tenantId, CancellationToken ct = default) {
        var now = timeProvider.GetUtcNow();
        return await context.Tokens
                            .AsNoTracking()
                            .Where(e => e.TenantId == tenantId && e.ValidUntil > now)
                            .Select(e => map.ToModel(e)!)
                            .ToArrayAsync(ct);
    }

    /// <inheritdoc />
    public async Task<bool> CreateAccessTokenAsync(Guid tenantId, AccessToken accessToken, CancellationToken ct = default) {
        Ensure.IsNotNull(accessToken);
        var entity = map.ToEntity(accessToken, tenantId)!;
        await context.Tokens.AddAsync(entity, ct);
        var changes = await context.SaveChangesAsync(ct);
        return changes > 0;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAccessTokenAsync(Guid id, CancellationToken ct = default) {
        var deletedRows = await context.Tokens
                                   .Where(e => e.Id == id)
                                   .ExecuteDeleteAsync(ct);
        if (deletedRows == 0) {
            logger.LogWarning("Attempted to remove non-existent access token with id: {TokenId}.", id);
            return false;
        }

        logger.LogInformation("Removed access token with id: {TokenId}.", id);
        return true;
    }

    /// <inheritdoc />
    public async Task<bool> CancelAccessTokenRenewalAsync(Guid id, CancellationToken ct = default) {
        var affectedRows = await context.Tokens
                                        .Where(t => t.Id == id)
                                        .ExecuteUpdateAsync(ClearRefreshUntilProperty(), ct);

        if (affectedRows == 0) {
            logger.LogWarning("Attempted to cancel renewal for non-existent token with id '{TokenId}'.", id);
            return false;
        }

        logger.LogInformation("Canceled renewal for token with id '{TokenId}'.", id);
        return true;
    }

    /// <inheritdoc />
    public async Task<int> CleanExpiredTokensAsync(CancellationToken ct = default) {
        var now = timeProvider.GetUtcNow();
        var deletedRows = await context.Tokens
                                      .Where(t => t.ValidUntil <= now && t.RenewableUntil <= now)
                                      .ExecuteDeleteAsync(ct);

        logger.LogInformation("Deleted {Count} fully expired tokens during cleanup.", deletedRows);
        return deletedRows;
    }

    private static Expression<Func<SetPropertyCalls<TenantTokenEntity>, SetPropertyCalls<TenantTokenEntity>>> ClearRefreshUntilProperty()
        => updates => updates.SetProperty(t => t.RenewableUntil, (DateTimeOffset?)null);
}
