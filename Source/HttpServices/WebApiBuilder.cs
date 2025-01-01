// ReSharper disable once CheckNamespace
namespace Microsoft.AspNetCore.Abstractions;

public class WebApiBuilder(WebApplicationBuilder builder)
    : IHostApplicationBuilder {
    public IServiceCollection Services => builder.Services;

    IConfigurationManager IHostApplicationBuilder.Configuration => Configuration;
    public ConfigurationManager Configuration => builder.Configuration;
    IHostEnvironment IHostApplicationBuilder.Environment => Environment;
    public IHostEnvironment Environment => builder.Environment;

    public ILoggingBuilder Logging => builder.Logging;

    public IMetricsBuilder Metrics => builder.Metrics;

    void IHostApplicationBuilder.ConfigureContainer<TContainerBuilder>(IServiceProviderFactory<TContainerBuilder> factory, Action<TContainerBuilder>? configure)
        => ((IHostApplicationBuilder)builder).ConfigureContainer(factory, configure);
    IDictionary<Object, Object> IHostApplicationBuilder.Properties => ((IHostApplicationBuilder)builder).Properties;

    public WebApplication Build() {
        var app = builder.Build();
        app.UseAuthentication();
        app.UseExceptionHandler();
        if (app.Environment.IsDevelopment())
            app.MapOpenApi();
        app.UseHttpsRedirection();

        app.MapHealthCheckEndpoints();
        MapApiClientEndpoints(app);

        return app;
    }

    private static void MapApiClientEndpoints(IEndpointRouteBuilder app)
        => app.MapPost("/tokens", TokenEndpoints.GenerateAsync);
}
