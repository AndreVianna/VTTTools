namespace WebApi.Tenants.EntityFrameworkCore.DataStores;

public interface ITenantMapper<TTenant, TTenantEntity>
    where TTenant : Tenant, new()
    where TTenantEntity : TenantEntity, new() {
    TTenant? ToModel(TTenantEntity? entity);
    TTenantEntity? ToEntity(TTenant? model);
    void UpdateEntity(TTenant model, TTenantEntity entity);

    OwnedAccessToken<TTenant>? ToModel(TenantTokenEntity? token, TTenantEntity? tenant);
    AccessToken? ToModel(TenantTokenEntity? entity);
    TenantTokenEntity? ToEntity(AccessToken? model, Guid tenantId);
}