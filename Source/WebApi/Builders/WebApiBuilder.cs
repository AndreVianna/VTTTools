namespace WebApi.Builders;

public class WebApiBuilder<TBuilder, TOptions>
    : IWebApiBuilder<TOptions>
    where TBuilder : WebApiBuilder<TBuilder, TOptions>
    where TOptions : WebApiOptions<TOptions>, new() {
    private readonly WebApplicationBuilder _builder;

    public WebApiBuilder(string[] args) {
        _builder = WebApplication.CreateSlimBuilder(args);
        _builder.Services.AddOptions<TOptions>()
                .Bind(_builder.Configuration)
                .ValidateDataAnnotations();
        _builder.Configuration.Bind(Options);

        _builder.AddServiceDefaults();
        if (Options.UseRedisCache) {
            _builder.AddRedisDistributedCache("redis");
            _builder.Services.AddScoped<ICacheService, CacheService>();
        }

        _builder.Services.AddProblemDetails();
        if (Options.ShowOpenApi != ShowOpenApi.No)
            _builder.Services.AddOpenApi();

        _builder.Services.AddHttpContextAccessor();

        _builder.Services.AddSingleton(TimeProvider.System);
        _builder.Services.Configure<JsonOptions>(o => o.SerializerOptions.Converters.Add(new OptionalConverterFactory()));
    }

    public TOptions Options { get; } = new();
    public IServiceCollection Services => _builder.Services;
    public IConfigurationManager Configuration => _builder.Configuration;
    public IHostEnvironment Environment => _builder.Environment;
    public ILoggingBuilder Logging => _builder.Logging;
    public IMetricsBuilder Metrics => _builder.Metrics;

    public virtual WebApplication Build(Action<WebApplication>? configure = null) {
        var app = _builder.Build();
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

    IConfigurationManager IHostApplicationBuilder.Configuration => _builder.Configuration;
    IHostEnvironment IHostApplicationBuilder.Environment => Environment;
    void IHostApplicationBuilder.ConfigureContainer<TContainerBuilder>(IServiceProviderFactory<TContainerBuilder> factory, Action<TContainerBuilder>? configure)
        => ((IHostApplicationBuilder)_builder).ConfigureContainer(factory, configure);
    IDictionary<object, object> IHostApplicationBuilder.Properties => ((IHostApplicationBuilder)_builder).Properties;
}
