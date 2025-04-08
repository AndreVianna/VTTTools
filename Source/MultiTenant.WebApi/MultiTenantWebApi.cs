// ReSharper disable once CheckNamespace
namespace Microsoft.Extensions.Hosting;

/// <summary>
/// Provides static factory methods for creating and configuring a Multi-Tenant Web API application builder (<see cref="MultiTenantWebApiBuilder"/>).
/// Includes setup for tenant management, tenant-specific data stores, tenant context resolution, and JWT Bearer authentication based on tenant tokens.
/// </summary>
public static class MultiTenantWebApi {
    /// <summary>
    /// Creates a new instance of <see cref="MultiTenantWebApiBuilder"/> using specified data store and tenant types,
    /// and default options (<see cref="MultiTenantWebApiOptions"/>).
    /// </summary>
    /// <typeparam name="TTenantDataStore">The type of the tenant data store implementation.</typeparam>
    /// <typeparam name="TTenant">The type of the tenant model.</typeparam>
    /// <param name="args">Command line arguments passed to the application.</param>
    /// <param name="setup">An optional action to further configure the builder after initial setup.</param>
    /// <returns>A configured <see cref="MultiTenantWebApiBuilder"/> instance.</returns>
    public static MultiTenantWebApiBuilder CreateBuilder<TTenantDataStore, TTenant>(string[] args, Action<MultiTenantWebApiBuilder>? setup = null)
        where TTenantDataStore : class, ITenantDataStore<TTenant>
        where TTenant : Tenant, new()
        => CreateBuilder<MultiTenantWebApiBuilder, MultiTenantWebApiOptions, TTenantDataStore, TTenant>(args, setup);

    /// <summary>
    /// Creates a new instance of a specific builder type <typeparamref name="TBuilder"/> with specific options <typeparamref name="TOptions"/>
    /// and specified data store and tenant types. This is the core factory method.
    /// </summary>
    /// <typeparam name="TBuilder">The type of the builder, inheriting from <see cref="MultiTenantWebApiBuilder{TBuilder, TOptions}"/>.</typeparam>
    /// <typeparam name="TOptions">The type of the options record.</typeparam>
    /// <typeparam name="TTenantDataStore">The type of the tenant data store implementation.</typeparam>
    /// <typeparam name="TTenant">The type of the tenant model.</typeparam>
    /// <param name="args">Command line arguments passed to the application.</param>
    /// <param name="setup">An optional action to further configure the builder after initial setup.</param>
    /// <returns>A configured <typeparamref name="TBuilder"/> instance.</returns>
    public static TBuilder CreateBuilder<TBuilder, TOptions, TTenantDataStore, TTenant>(string[] args, Action<TBuilder>? setup = null)
        where TBuilder : MultiTenantWebApiBuilder<TBuilder, TOptions>
        where TOptions : MultiTenantWebApiOptions<TOptions>, new()
        where TTenantDataStore : class, ITenantDataStore<TTenant>
        where TTenant : Tenant, new() {
        var builder = BasicWebApi.CreateBuilder<TBuilder, TOptions>(args);
        ApplyAdditionalSetup<TOptions, TTenantDataStore, TTenant>(builder);
        setup?.Invoke(builder);
        return builder;
    }

    private static void ApplyAdditionalSetup<TOptions, TTenantDataStore, TTenant>(IHostApplicationBuilder builder)
        where TOptions : MultiTenantWebApiOptions<TOptions>, new()
        where TTenantDataStore : class, ITenantDataStore<TTenant>
        where TTenant : Tenant, new() {
        builder.Services.AddScoped<ITenantDataStore<TTenant>, TTenantDataStore>();
        builder.Services.AddScoped<ICurrentTenantAccessor, CurrentTenantAccessor>();
        builder.Services.AddScoped<ITenantManagementService, TenantManagementService>();

        builder.Services.AddAuthentication(o => {
            o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            o.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        }).AddJwtBearer(options => {
            var serviceProvider = builder.Services.BuildServiceProvider();
            var tenantOptions = serviceProvider.GetRequiredService<IOptions<MultiTenantWebApiOptions>>().Value;
            var result = tenantOptions.Validate();
            if (result.HasErrors) {
                var errorMessages = string.Join("", $"{Environment.NewLine} - ${result.Errors.Select(e => e.ToString())}");
                throw new InvalidOperationException($"Invalid TenantOptions configuration:{errorMessages}");
            }

            var accessTokenOptions = tenantOptions.TenantAccessToken;
            var keyBytes = Convert.FromBase64String(accessTokenOptions.Key);
            var securityKey = new SymmetricSecurityKey(keyBytes);
            options.TokenValidationParameters = new() {
                ValidateIssuer = true,
                ValidIssuer = accessTokenOptions.Issuer,
                ValidateAudience = true,
                ValidAudience = accessTokenOptions.Audience,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = securityKey,
                ClockSkew = TimeSpan.FromSeconds(30),
            };
            options.Events = new() {
                OnAuthenticationFailed = context => {
                    var loggerFactory = context.HttpContext.RequestServices.GetRequiredService<ILoggerFactory>();
                    var logger = loggerFactory.CreateLogger($"{nameof(MultiTenantWebApi)}.{nameof(ApplyAdditionalSetup)}.{nameof(JwtBearerEvents.OnAuthenticationFailed)}");
                    logger.LogError(context.Exception, "JWT Authentication Failed.");
                    return Task.CompletedTask;
                },
                OnTokenValidated = _ => Task.CompletedTask,
            };
        });
        builder.Services.AddAuthorization();
    }

    /// <summary>
    /// Creates, configures, and builds the <see cref="WebApplication"/> using the default builder and options.
    /// </summary>
    /// <typeparam name="TTenantDataStore">The type of the tenant data store implementation.</typeparam>
    /// <typeparam name="TTenant">The type of the tenant model.</typeparam>
    /// <param name="args">Command line arguments.</param>
    /// <param name="setup">Optional action to configure the builder.</param>
    /// <param name="configure">Optional action to configure the built application pipeline.</param>
    /// <returns>The configured <see cref="WebApplication"/>.</returns>
    public static WebApplication Build<TTenantDataStore, TTenant>(string[] args, Action<MultiTenantWebApiBuilder>? setup = null, Action<WebApplication>? configure = null)
        where TTenantDataStore : class, ITenantDataStore<TTenant>
        where TTenant : Tenant, new()
        => Build<MultiTenantWebApiBuilder, MultiTenantWebApiOptions, TTenantDataStore, TTenant>(args, setup, configure);

    /// <summary>
    /// Creates and configures a web application for multi-tenant scenarios using specified builder and options.
    /// </summary>
    /// <typeparam name="TBuilder">Specifies the type of builder used to create the web application.</typeparam>
    /// <typeparam name="TOptions">Defines the options that configure the behavior of the multi-tenant web application.</typeparam>
    /// <typeparam name="TTenantDataStore">Represents the data store that manages tenant-specific data.</typeparam>
    /// <typeparam name="TTenant">Indicates the type of tenant being managed within the application.</typeparam>
    /// <param name="args">Contains command-line arguments for configuring the application at startup.</param>
    /// <param name="setup">Allows for additional setup actions to be performed on the builder before the application is built.</param>
    /// <param name="configure">Enables further configuration of the web application after it has been built.</param>
    /// <returns>Returns the configured web application instance ready for use.</returns>
    public static WebApplication Build<TBuilder, TOptions, TTenantDataStore, TTenant>(string[] args, Action<TBuilder>? setup = null, Action<WebApplication>? configure = null)
        where TBuilder : MultiTenantWebApiBuilder<TBuilder, TOptions>
        where TOptions : MultiTenantWebApiOptions<TOptions>, new()
        where TTenantDataStore : class, ITenantDataStore<TTenant>
        where TTenant : Tenant, new() {
        var builder = CreateBuilder<TBuilder, TOptions, TTenantDataStore, TTenant>(args, setup);
        return builder.Build(configure);
    }

    /// <summary>
    /// Creates, configures, builds, and runs the <see cref="WebApplication"/> using the default builder and options.
    /// </summary>
    /// <typeparam name="TTenantDataStore">The type of the tenant data store implementation.</typeparam>
    /// <typeparam name="TTenant">The type of the tenant model.</typeparam>
    /// <param name="args">Command line arguments.</param>
    /// <param name="setup">Optional action to configure the builder.</param>
    /// <param name="configure">Optional action to configure the built application pipeline.</param>
    public static void Run<TTenantDataStore, TTenant>(string[] args, Action<MultiTenantWebApiBuilder>? setup = null, Action<WebApplication>? configure = null)
        where TTenantDataStore : class, ITenantDataStore<TTenant>
        where TTenant : Tenant, new()
        => Build<TTenantDataStore, TTenant>(args, setup, configure).Run();

    /// <summary>
    /// Executes the application with specified tenant configurations and optional setup or configuration actions.
    /// </summary>
    /// <typeparam name="TBuilder">Defines the type responsible for building the multi-tenant web API.</typeparam>
    /// <typeparam name="TOptions">Specifies the options that configure the multi-tenant behavior of the web API.</typeparam>
    /// <typeparam name="TTenantDataStore">Represents the data store used to manage tenant-specific data.</typeparam>
    /// <typeparam name="TTenant">Denotes the type that represents a tenant in the application.</typeparam>
    /// <param name="args">Contains the command-line arguments passed to the application.</param>
    /// <param name="setup">Allows for custom setup actions to be performed on the builder before running the application.</param>
    /// <param name="configure">Enables additional configuration of the web application before it starts.</param>
    public static void Run<TBuilder, TOptions, TTenantDataStore, TTenant>(string[] args, Action<TBuilder>? setup = null, Action<WebApplication>? configure = null)
        where TBuilder : MultiTenantWebApiBuilder<TBuilder, TOptions>
        where TOptions : MultiTenantWebApiOptions<TOptions>, new()
        where TTenantDataStore : class, ITenantDataStore<TTenant>
        where TTenant : Tenant, new()
        => Build<TBuilder, TOptions, TTenantDataStore, TTenant>(args, setup, configure).Run();
}
