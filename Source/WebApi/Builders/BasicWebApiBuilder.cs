namespace WebApi.Builders;

public class BasicWebApiBuilder(WebApplicationBuilder builder, BasicWebApiOptions options)
    : BasicWebApiBuilder<BasicWebApiBuilder, BasicWebApiOptions>(builder, options)
    , IBasicWebApiBuilder;

public class BasicWebApiBuilder<TBuilder, TOptions>(WebApplicationBuilder builder, TOptions options)
    : IBasicWebApiBuilder<TOptions>
    where TBuilder : BasicWebApiBuilder<TBuilder, TOptions>
    where TOptions : WebApiOptions<TOptions>, new() {
    public IServiceCollection Services => builder.Services;
    public IConfigurationManager Configuration => builder.Configuration;
    public TOptions Options => options;
    public IHostEnvironment Environment => builder.Environment;
    public ILoggingBuilder Logging => builder.Logging;
    public IMetricsBuilder Metrics => builder.Metrics;

    public virtual WebApplication Build(Action<WebApplication>? configure = null) {
        var app = builder.Build();
        if (!app.Environment.IsDevelopment())
            app.UseExceptionHandler();
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseHttpsRedirection();
        app.MapHealthCheckEndpoints();
        if (AllowOpenApi())
            app.MapOpenApi();
        configure?.Invoke(app);
        return app;

        bool AllowOpenApi() => Options.ShowOpenApi == ShowOpenApi.Yes
                            || (Options.ShowOpenApi == ShowOpenApi.OnlyInDevelopment && app.Environment.IsDevelopment());
    }

    IConfigurationManager IHostApplicationBuilder.Configuration => builder.Configuration;
    IHostEnvironment IHostApplicationBuilder.Environment => Environment;
    void IHostApplicationBuilder.ConfigureContainer<TContainerBuilder>(IServiceProviderFactory<TContainerBuilder> factory, Action<TContainerBuilder>? configure)
        => ((IHostApplicationBuilder)builder).ConfigureContainer(factory, configure);
    IDictionary<object, object> IHostApplicationBuilder.Properties => ((IHostApplicationBuilder)builder).Properties;
}