
using JsonOptions = Microsoft.AspNetCore.Http.Json.JsonOptions;

namespace VttTools.Extensions;

public static class HostApplicationBuilderExtensions {
    public static void VerifyDependencies(this IHostBuilder builder)
        => builder.UseDefaultServiceProvider((ctx, o) => {
            var isDevelopment = ctx.HostingEnvironment.IsDevelopment();
            o.ValidateScopes = isDevelopment;
            o.ValidateOnBuild = isDevelopment;
        });

    public static void AddServiceDiscovery(this IHostApplicationBuilder builder) {
        builder.Services.AddServiceDiscovery();
        builder.Services.ConfigureHttpClientDefaults(http => {
            http.AddStandardResilienceHandler();
            http.AddServiceDiscovery();
        });
    }

    public static void AddRequiredServices(this IHostApplicationBuilder builder) {
        builder.Services.AddProblemDetails();
        builder.Services.AddExceptionHandler<LoggedExceptionHandler>();
        builder.Services.AddHttpContextAccessor();
        builder.Services.AddSingleton(TimeProvider.System);
        builder.Services.ConfigureHttpJsonOptions(ConfigureJsonOptions);
        builder.Services.AddDistributedMemoryCache();

        builder.Services.AddCors(options => options.AddPolicy("AllowAllOrigins", policy => {
            if (builder.Environment.IsDevelopment()) {
                policy.WithOrigins("http://localhost:5173", "http://localhost:5193")
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            }
            else {
                // Production: Get allowed origins from configuration
                var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                    ?? ["https://vtttools.com"];  // Fallback default

                policy.WithOrigins(allowedOrigins)
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            }
        }));

        //builder.Services.AddOpenApi();
        builder.AddDetailedHealthChecks();

        // REMOVED: Insecure x-user header authentication handler
        // JWT Bearer authentication is now the default (configured via AddJwtAuthentication)
        builder.Services.AddAuthorization();
    }

    /// <summary>
    /// Adds detailed health checks with comprehensive JSON response formatting.
    /// </summary>
    /// <param name="builder">The host application builder.</param>
    /// <returns>The health checks builder for chaining additional health checks.</returns>
    public static IHealthChecksBuilder AddDetailedHealthChecks(this IHostApplicationBuilder builder)
        => builder.Services.AddHealthChecks()
                  .AddCheck("self", () => HealthCheckResult.Healthy("Service is operational"), ["live"]);

    /// <summary>
    /// Adds a custom health check with the specified name, check function, and tags.
    /// </summary>
    /// <param name="healthChecksBuilder">The health checks builder.</param>
    /// <param name="name">The name of the health check.</param>
    /// <param name="healthCheck">The health check function.</param>
    /// <param name="tags">Optional tags for the health check.</param>
    /// <returns>The health checks builder for chaining additional health checks.</returns>
    public static IHealthChecksBuilder AddCustomHealthCheck(this IHealthChecksBuilder healthChecksBuilder,
                                                            string name,
                                                            Func<HealthCheckResult> healthCheck,
                                                            params string[] tags)
        => healthChecksBuilder.AddCheck(name, healthCheck, tags);

    /// <summary>
    /// Adds an async custom health check with the specified name, check function, and tags.
    /// </summary>
    /// <param name="healthChecksBuilder">The health checks builder.</param>
    /// <param name="name">The name of the health check.</param>
    /// <param name="healthCheck">The async health check function.</param>
    /// <param name="tags">Optional tags for the health check.</param>
    /// <returns>The health checks builder for chaining additional health checks.</returns>
    public static IHealthChecksBuilder AddAsyncCustomHealthCheck(this IHealthChecksBuilder healthChecksBuilder,
        string name, Func<CancellationToken, Task<HealthCheckResult>> healthCheck, params string[] tags) => healthChecksBuilder.AddAsyncCheck(name, healthCheck, tags);

    public static void AddJwtAuthentication(this IHostApplicationBuilder builder) {
        var jwtOptions = builder.Configuration.GetSection("Jwt").Get<JwtOptions>() ?? throw new InvalidOperationException("JWT configuration section 'Jwt' is missing from appsettings.json");

        if (builder.Environment.IsProduction())
            jwtOptions.ValidateForProduction();

        builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options => {
                var key = Encoding.UTF8.GetBytes(jwtOptions.SecretKey);
                options.TokenValidationParameters = new TokenValidationParameters {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = jwtOptions.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtOptions.Audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });
    }

    internal static void ConfigureJsonOptions(JsonOptions options) {
        options.SerializerOptions.PropertyNameCaseInsensitive = true;
        options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.SerializerOptions.Converters.Add(new OptionalConverterFactory());
    }

    public static IApplicationBuilder UseMaintenanceModeMiddleware(this IApplicationBuilder app)
        => app.UseMiddleware<MaintenanceModeMiddleware>();
}