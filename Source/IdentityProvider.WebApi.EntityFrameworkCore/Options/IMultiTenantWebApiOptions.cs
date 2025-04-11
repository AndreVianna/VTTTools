namespace WebApi.Options;

public interface IEntityFrameworkIdentityProviderWebApiOptions
    : IEntityFrameworkIdentityProviderWebApiOptions<IEntityFrameworkIdentityProviderWebApiOptions>;

public interface IEntityFrameworkIdentityProviderWebApiOptions<out TOptions>
    : IIdentityProviderWebApiOptions<TOptions>
    where TOptions : IEntityFrameworkIdentityProviderWebApiOptions<TOptions>;
