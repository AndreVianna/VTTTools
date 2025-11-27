namespace VttTools.Admin;

[ExcludeFromCodeCoverage]
internal static class Program {
    public static void Main(string[] args) {
        var builder = WebApplication.CreateBuilder(args);
        builder.Host.VerifyDependencies();
        builder.AddServiceDiscovery();
        builder.AddRequiredServices();
        builder.AddStorage();
        builder.AddIdentity();
        builder.AddCors();
        builder.AddRateLimiting();
        builder.AddServices();
        builder.AddAuditLogging();
        builder.AddPublicLibrary();

        var app = builder.Build();
        app.ApplyRequiredConfiguration(app.Environment);
        app.UseCors();
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseTokenRefresh();
        app.UseRateLimiter();
        app.UseAuditLogging();
        app.MapDefaultEndpoints();
        app.MapApplicationEndpoints();

        app.Run();
    }

    internal static void AddStorage(this IHostApplicationBuilder builder) {
        builder.AddSqlServerDbContext<ApplicationDbContext>(ApplicationDbContextOptions.ConnectionStringName);
        builder.AddDataStorage();
        var configuration = builder.Configuration;
        var healthChecksBuilder = builder.Services.AddHealthChecks();

        var dbConnectionString = configuration.GetConnectionString(ApplicationDbContextOptions.ConnectionStringName);
        if (!string.IsNullOrEmpty(dbConnectionString)) {
            builder.Services.AddSingleton(sp =>
                new DatabaseHealthCheck(sp.GetRequiredService<IConfiguration>(), ApplicationDbContextOptions.ConnectionStringName));
            healthChecksBuilder.AddCheck<DatabaseHealthCheck>("Database", tags: ["database"]);
        }

        var redisConnectionString = configuration.GetConnectionString("redis");
        if (!string.IsNullOrEmpty(redisConnectionString)) {
            healthChecksBuilder.AddCheck("Redis", () => {
                try {
                    return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy("Redis cache is accessible");
                } catch {
                    return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Unhealthy("Redis cache is not accessible");
                }
            }, ["redis", "cache"]);
        }

        var blobConnectionString = configuration.GetConnectionString("blobs");
        healthChecksBuilder.AddCheck("BlobStorage", () => {
            if (string.IsNullOrEmpty(blobConnectionString)) {
                return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Degraded("Blob storage connection string not configured");
            }
            try {
                return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy("Blob storage is accessible");
            } catch {
                return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Unhealthy("Blob storage is not accessible");
            }
        }, ["blob", "storage"]);
    }

    internal static void AddIdentity(this IHostApplicationBuilder builder) {
        builder.Services.AddIdentity<User, Role>(options => {
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireNonAlphanumeric = true;
            options.Password.RequireUppercase = true;
            options.Password.RequiredLength = 12;
            options.Password.RequiredUniqueChars = 3;

            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.AllowedForNewUsers = true;

            options.User.AllowedUserNameCharacters =
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
            options.User.RequireUniqueEmail = true;

            options.SignIn.RequireConfirmedEmail = true;
            options.SignIn.RequireConfirmedPhoneNumber = false;
        })
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

        builder.AddJwtAuthentication();

        builder.Services.ConfigureApplicationCookie(options => {
            options.Cookie.Name = ".VttTools.Admin";
            options.Cookie.HttpOnly = true;
            options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
            options.Cookie.SameSite = SameSiteMode.Lax;
            options.ExpireTimeSpan = TimeSpan.FromHours(1);
            options.SlidingExpiration = true;
            options.LoginPath = "/api/admin/auth/login";
            options.LogoutPath = "/api/admin/auth/logout";
            options.AccessDeniedPath = "/api/admin/auth/access-denied";

            options.Events.OnRedirectToLogin = context => {
                context.Response.StatusCode = 401;
                return Task.CompletedTask;
            };
            options.Events.OnRedirectToAccessDenied = context => {
                context.Response.StatusCode = 403;
                return Task.CompletedTask;
            };
        });
    }

    internal static void AddRateLimiting(this IHostApplicationBuilder builder)
        => builder.Services.AddRateLimiter(options => {
            options.AddSlidingWindowLimiter("admin", rateLimiterOptions => {
                rateLimiterOptions.PermitLimit = 30;
                rateLimiterOptions.Window = TimeSpan.FromMinutes(1);
                rateLimiterOptions.SegmentsPerWindow = 6;
                rateLimiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                rateLimiterOptions.QueueLimit = 5;
            });

            options.AddSlidingWindowLimiter("reveal", rateLimiterOptions => {
                rateLimiterOptions.PermitLimit = 5;
                rateLimiterOptions.Window = TimeSpan.FromMinutes(1);
                rateLimiterOptions.SegmentsPerWindow = 2;
                rateLimiterOptions.QueueLimit = 0;
            });

            options.AddSlidingWindowLimiter("audit", rateLimiterOptions => {
                rateLimiterOptions.PermitLimit = 200;
                rateLimiterOptions.Window = TimeSpan.FromMinutes(1);
                rateLimiterOptions.SegmentsPerWindow = 6;
                rateLimiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                rateLimiterOptions.QueueLimit = 10;
            });

            options.AddSlidingWindowLimiter("dashboard", rateLimiterOptions => {
                rateLimiterOptions.PermitLimit = 100;
                rateLimiterOptions.Window = TimeSpan.FromMinutes(1);
                rateLimiterOptions.SegmentsPerWindow = 6;
                rateLimiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                rateLimiterOptions.QueueLimit = 5;
            });

            options.OnRejected = async (context, cancellationToken) => {
                context.HttpContext.Response.StatusCode = 429;
                await context.HttpContext.Response.WriteAsync("Rate limit exceeded. Please try again later.", cancellationToken);
            };
        });

    internal static void AddCors(this IHostApplicationBuilder builder)
     => builder.Services.AddCors(options
         => options.AddDefaultPolicy(policy
            => policy.WithOrigins("http://localhost:5193")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials()
                  .WithExposedHeaders("X-Refreshed-Token")));

    internal static void AddServices(this IHostApplicationBuilder builder) {
        builder.Services.AddScoped<IAdminAuthService, AdminAuthService>();
        builder.Services.AddScoped<IAuditLogService, AuditLogService>();
        builder.Services.AddScoped<IAuditLogStorage, AuditLogStorage>();
        builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
        builder.Services.AddScoped<IDashboardService, DashboardService>();
        builder.Services.AddScoped<IUserAdminService, UserAdminService>();
        builder.Services.AddScoped<IMaintenanceModeStorage, MaintenanceModeStorage>();
        builder.Services.AddScoped<IMaintenanceModeService, MaintenanceModeService>();
        builder.Services.AddScoped<IConfigurationService, ConfigurationService>();
        builder.Services.AddScoped<ILibraryAdminService, LibraryAdminService>();
        builder.Services.AddSingleton(sp => {
            var config = sp.GetRequiredService<IConfiguration>();
            return config is not IConfigurationRoot root
                ? throw new InvalidOperationException("Configuration root not available for source detection")
                : new ConfigurationSourceDetector(root);
        });
        builder.Services.AddSingleton<InternalConfigurationService>();
        builder.Services.AddSingleton(sp =>
            new FrontendConfigurationService(sp.GetRequiredService<ILogger<FrontendConfigurationService>>()));

        builder.Services.AddSignalR();
    }

    internal static void MapApplicationEndpoints(this IEndpointRouteBuilder app) {
        app.MapAdminAuthEndpoints();
        app.MapAuditLogEndpoints();
        app.MapDashboardEndpoints();
        app.MapHealthCheckEndpoints();
        app.MapUserAdminEndpoints();
        app.MapMaintenanceModeEndpoints();
        app.MapConfigurationEndpoints();
        app.MapLibraryAdminEndpoints();
        app.MapHub<VttTools.Admin.Hubs.AuditLogHub>("/hubs/audit");
    }
}
