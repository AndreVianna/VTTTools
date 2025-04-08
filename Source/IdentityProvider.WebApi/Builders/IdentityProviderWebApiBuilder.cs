namespace WebApi.Builders;

public class IdentityProviderWebApiBuilder(WebApplicationBuilder builder, IdentityProviderWebApiOptions options)
    : IdentityProviderWebApiBuilder<IdentityProviderWebApiBuilder, IdentityProviderWebApiOptions>(builder, options);

public class IdentityProviderWebApiBuilder<TBuilder, TOptions>(WebApplicationBuilder builder, TOptions options)
    : BasicWebApiBuilder<TBuilder, TOptions>(builder, options)
    where TBuilder : IdentityProviderWebApiBuilder<TBuilder, TOptions>
    where TOptions : IdentityProviderWebApiOptions<TOptions>, new();
