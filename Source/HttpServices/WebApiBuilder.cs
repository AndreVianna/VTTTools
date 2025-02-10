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
    IDictionary<object, object> IHostApplicationBuilder.Properties => ((IHostApplicationBuilder)builder).Properties;

    public WebApplication Build() {
        var app = builder.Build();
        if (!app.Environment.IsDevelopment())
            app.UseExceptionHandler();
        app.UseAuthentication();
        if (app.Environment.IsDevelopment())
            app.MapOpenApi();
        app.UseHttpsRedirection();

        return app;
    }
}