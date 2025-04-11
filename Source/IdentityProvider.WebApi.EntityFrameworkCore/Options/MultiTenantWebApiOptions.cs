namespace WebApi.Options;

public record EntityFrameworkIdentityProviderWebApiOptions
    : EntityFrameworkIdentityProviderWebApiOptions<EntityFrameworkIdentityProviderWebApiOptions>
    , IIdentityProviderWebApiOptions;

public record EntityFrameworkIdentityProviderWebApiOptions<TOptions>
    : IdentityProviderWebApiOptions<TOptions>
    , IEntityFrameworkIdentityProviderWebApiOptions<TOptions>
    where TOptions : EntityFrameworkIdentityProviderWebApiOptions<TOptions>, new();