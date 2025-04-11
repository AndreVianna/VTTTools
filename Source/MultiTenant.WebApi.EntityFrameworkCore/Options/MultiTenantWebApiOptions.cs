namespace WebApi.Options;

public record EntityFrameworkMultiTenantWebApiOptions
    : EntityFrameworkMultiTenantWebApiOptions<EntityFrameworkMultiTenantWebApiOptions>
    , IMultiTenantWebApiOptions;

public record EntityFrameworkMultiTenantWebApiOptions<TOptions>
    : MultiTenantWebApiOptions<TOptions>
    , IEntityFrameworkMultiTenantWebApiOptions<TOptions>
    where TOptions : EntityFrameworkMultiTenantWebApiOptions<TOptions>, new();