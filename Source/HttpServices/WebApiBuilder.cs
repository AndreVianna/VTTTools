// ReSharper disable once CheckNamespace
namespace Microsoft.AspNetCore.Abstractions;

public sealed class WebApiBuilder(WebApplicationBuilder builder)
    : IHostApplicationBuilder {
    public IServiceCollection Services => builder.Services;
    public IConfigurationManager Configuration => builder.Configuration;
    public IHostEnvironment Environment => builder.Environment;
    public ILoggingBuilder Logging => builder.Logging;
    public IMetricsBuilder Metrics => builder.Metrics;

    void IHostApplicationBuilder.ConfigureContainer<TContainerBuilder>(IServiceProviderFactory<TContainerBuilder> factory, Action<TContainerBuilder>? configure)
        => ((IHostApplicationBuilder)builder).ConfigureContainer(factory, configure);
    IDictionary<object, object> IHostApplicationBuilder.Properties => ((IHostApplicationBuilder)builder).Properties;

    public WebApi Build() {
        var app = builder.Build();

        app.UseAuthentication();
        app.UseExceptionHandler();
        app.UseHttpsRedirection();

        app.MapHealthCheckEndpoints();
        app.MapApiAuthenticationManagementEndpoints();

        return new WebApi(app);
    }
}