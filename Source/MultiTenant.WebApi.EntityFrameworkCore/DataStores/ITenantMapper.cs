namespace WebApi.Tenants.EntityFrameworkCore.DataStores;

public interface ITenantMapper<TTenant, TTenantEntity>
    where TTenant : Tenant, new()
    where TTenantEntity : TenantEntity, new() {
    TTenant? ToDomainModel(TTenantEntity? entity);
    TTenantEntity? ToEntity(TTenant? model);

    AccessToken? ToDomainModel(TenantTokenEntity? entity);
    TenantTokenEntity? ToEntity(AccessToken? model, Guid tenantId);
}