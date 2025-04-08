namespace WebApi.Builders;

public class MultiTenantWebApiBuilder(WebApplicationBuilder builder, MultiTenantWebApiOptions options)
    : MultiTenantWebApiBuilder<MultiTenantWebApiBuilder, MultiTenantWebApiOptions>(builder, options);

public class MultiTenantWebApiBuilder<TBuilder, TOptions>(WebApplicationBuilder builder, TOptions options)
    : BasicWebApiBuilder<TBuilder, TOptions>(builder, options)
    where TBuilder : MultiTenantWebApiBuilder<TBuilder, TOptions>
    where TOptions : MultiTenantWebApiOptions<TOptions>, new() {
    public override WebApplication Build(Action<WebApplication>? configure = null) {
        var app = base.Build(configure);
        app.UseTenantContext();
        return app;
    }
}