namespace WebApi.Tenants.EntityFrameworkCore.Builders;

public class EntityFrameworkMultiTenantWebApiBuilder(string[] args)
    : EntityFrameworkMultiTenantWebApiBuilder<EntityFrameworkMultiTenantWebApiBuilder,
                                              EntityFrameworkMultiTenantWebApiOptions,
                                              TenantDataStore,
                                              Tenant,
                                              TenantEntity>(args);

public class EntityFrameworkMultiTenantWebApiBuilder<TBuilder, TOptions, TTenantDataStore, TTenant, TTenantEntity>
    : MultiTenantWebApiBuilder<TBuilder, TOptions, TTenantDataStore, TTenant>
    where TBuilder : EntityFrameworkMultiTenantWebApiBuilder<TBuilder, TOptions, TTenantDataStore, TTenant, TTenantEntity>
    where TOptions : EntityFrameworkMultiTenantWebApiOptions<TOptions>, new()
    where TTenantDataStore : TenantDataStore<TTenantDataStore, TTenant, TTenantEntity>
    where TTenant : Tenant, new()
    where TTenantEntity : TenantEntity, new() {
    public EntityFrameworkMultiTenantWebApiBuilder(string[] args)
        : base(args) {
        Services.AddSingleton<ITenantMapper<TTenant, TTenantEntity>, TenantMapper<TTenant, TTenantEntity>>();
    }
}
