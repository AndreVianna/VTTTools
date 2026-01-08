
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
        builder.Services.ConfigureHttpClientDefaults(http => http.AddServiceDiscovery());
    }

    public static void AddRequiredServices(this IHostApplicationBuilder builder) {
        builder.Services.AddProblemDetails();
        builder.Services.AddExceptionHandler<LoggedExceptionHandler>();
        builder.Services.AddHttpContextAccessor();
        builder.Services.AddSingleton(TimeProvider.System);
        builder.Services.ConfigureHttpJsonOptions(ConfigureJsonOptions);
        builder.Services.AddDistributedMemoryCache();

        builder.Services.Configure<InternalApiOptions>(
            builder.Configuration.GetSection(InternalApiOptions.SectionName));

        builder.Services.AddCors(options => options.AddPolicy("AllowAllOrigins", policy => {
            if (builder.Environment.IsDevelopment()) {
                policy.WithOrigins("http://localhost:5173", "http://localhost:5193")
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            }
            else {
                var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["https://vtttools.com"];

                policy.WithOrigins(allowedOrigins)
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            }
        }));

        builder.AddDetailedHealthChecks();

        builder.Services.AddAuthorization();
    }

    public static IHealthChecksBuilder AddDetailedHealthChecks(this IHostApplicationBuilder builder)
        => builder.Services.AddHealthChecks()
                  .AddCheck("self", () => HealthCheckResult.Healthy("Service is operational"), ["live"]);

    public static IHealthChecksBuilder AddCustomHealthCheck(this IHealthChecksBuilder healthChecksBuilder,
                                                            string name,
                                                            Func<HealthCheckResult> healthCheck,
                                                            params string[] tags)
        => healthChecksBuilder.AddCheck(name, healthCheck, tags);

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

                options.Events = new JwtBearerEvents {
                    OnMessageReceived = context => {
                        if (!string.IsNullOrEmpty(context.Token))
                            return Task.CompletedTask;

                        var path = context.HttpContext.Request.Path;
                        if (path.StartsWithSegments("/hubs")) {
                            var accessToken = context.Request.Query["access_token"];
                            if (!string.IsNullOrEmpty(accessToken)) {
                                context.Token = accessToken;
                                return Task.CompletedTask;
                            }
                        }

                        if (context.Request.Cookies.TryGetValue(AuthCookieConstants.ClientCookieName, out var clientToken)) {
                            context.Token = clientToken;
                            return Task.CompletedTask;
                        }

                        if (context.Request.Cookies.TryGetValue(AuthCookieConstants.AdminCookieName, out var adminToken))
                            context.Token = adminToken;

                        return Task.CompletedTask;
                    }
                };
            });
    }

    internal static void ConfigureJsonOptions(JsonOptions options) {
        var defaults = JsonDefaults.Options;
        options.SerializerOptions.PropertyNameCaseInsensitive = defaults.PropertyNameCaseInsensitive;
        options.SerializerOptions.PropertyNamingPolicy = defaults.PropertyNamingPolicy;
        options.SerializerOptions.TypeInfoResolver = defaults.TypeInfoResolver;
        foreach (var converter in defaults.Converters)
            options.SerializerOptions.Converters.Add(converter);
    }

    public static IApplicationBuilder UseMaintenanceModeMiddleware(this IApplicationBuilder app)
        => app.UseMiddleware<MaintenanceModeMiddleware>();
}