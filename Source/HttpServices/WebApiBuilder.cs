// ReSharper disable once CheckNamespace
namespace Microsoft.AspNetCore.Abstractions;

public sealed class WebApiBuilder
    : IHostApplicationBuilder {
    private readonly WebApplicationBuilder _builder;
    private readonly WebApiOptions _options;

    public WebApiBuilder(WebApplicationBuilder builder, WebApiOptions options) {
        _builder = builder;
        _options = options;
        AddBasicComponents();
        if (_options.UsesAuthentication) AddAuthenticationComponents();
        if (_options.CanGrantAccess) AddAuthenticationManagementComponents();
    }
    public IServiceCollection Services => _builder.Services;
    public IConfigurationManager Configuration => _builder.Configuration;
    public IHostEnvironment Environment => _builder.Environment;
    public ILoggingBuilder Logging => _builder.Logging;
    public IMetricsBuilder Metrics => _builder.Metrics;

    void IHostApplicationBuilder.ConfigureContainer<TContainerBuilder>(IServiceProviderFactory<TContainerBuilder> factory, Action<TContainerBuilder>? configure)
        => ((IHostApplicationBuilder)_builder).ConfigureContainer(factory, configure);
    IDictionary<object, object> IHostApplicationBuilder.Properties => ((IHostApplicationBuilder)_builder).Properties;

    public WebApi Build() {
        var app = _builder.Build();

        ConfigureBasicComponents(app);
        if (_options.HasFlag(WebApiType.HasEndpointsWithBasicProtection)) ConfigureAuthenticationComponents(app);
        if (_options.HasFlag(WebApiType.HandlesClientManagement)) ConfigureClientManagementComponents(app);
        return new(app, _options);
    }

    private void AddBasicComponents() {
        _builder.AddServiceDefaults();
        _builder.Services.AddProblemDetails();
    }

    private void AddAuthenticationComponents() {
        _builder.AddRedisDistributedCache("cache");
        _builder.Services.AddSingleton<ICacheService, CacheService>();

        if (_options.UsesJwt) {
            var jwtSettings = _builder.Configuration.GetSection("Jwt").Get<JwtSettings>()
                           ?? throw new InvalidOperationException("Jwt settings are missing from the configuration.");
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key));
            var jwtOptions = _options.JwtOptions ?? new TokenValidationParameters {
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidateIssuer = true,
                ValidIssuer = jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = jwtSettings.Audience,
                IssuerSigningKey = securityKey,
            };
            _builder.Services.AddAuthentication(options => {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options => options.TokenValidationParameters = jwtOptions);
        }
    }

    private void AddAuthenticationManagementComponents() {}

    private static void ConfigureBasicComponents(WebApplication app) {
        app.UseExceptionHandler();
        app.UseHttpsRedirection();
        app.MapHealthCheckEndpoints();
    }

    private static void ConfigureAuthenticationComponents(IApplicationBuilder app)
        => app.UseAuthentication();

    private static void ConfigureClientManagementComponents(WebApplication app) { }
}