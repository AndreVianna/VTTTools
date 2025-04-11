namespace WebApi.Options;

public interface IEntityFrameworkMultiTenantWebApiOptions
    : IEntityFrameworkMultiTenantWebApiOptions<IEntityFrameworkMultiTenantWebApiOptions>;

public interface IEntityFrameworkMultiTenantWebApiOptions<out TOptions>
    : IMultiTenantWebApiOptions<TOptions>
    where TOptions : IEntityFrameworkMultiTenantWebApiOptions<TOptions>;
