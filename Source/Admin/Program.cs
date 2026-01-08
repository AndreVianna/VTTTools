using VttTools.Utilities;

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
        builder.AddConfigurableRateLimiting("read", "write", "sensitive");
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

    extension(IHostApplicationBuilder builder) {
        internal void AddStorage() {
            builder.AddNpgsqlDbContext<ApplicationDbContext>(ApplicationDbContextOptions.ConnectionStringName);
            builder.AddDataStorage();
            builder.AddIdentityStorage();
            builder.AddInfrastructureHealthChecks();
        }

        internal void AddInfrastructureHealthChecks()
            => builder.Services.AddHealthChecks()
                      .AddCheck<DatabaseHealthCheck>("database", tags: ["database", "infrastructure"])
                      .AddCheck("redis", () =>
                                             HealthCheckResult.Healthy("Redis available via Aspire infrastructure"), ["redis", "infrastructure"])
                      .AddCheck("blob-storage", () =>
                                                    HealthCheckResult.Healthy("Blob storage accessed via resources-api"), ["blob", "infrastructure"]);

        internal void AddIdentity() {
            builder.AddIdentityInfrastructure(options => {
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
            });

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

        internal void AddCors()
            => builder.Services.AddCors(options
                => options.AddDefaultPolicy(policy
                    => policy.WithOrigins("http://localhost:5193")
                             .AllowAnyMethod()
                             .AllowAnyHeader()
                             .AllowCredentials()
                             .WithExposedHeaders("X-Refreshed-Token")));

        internal void AddServices() {
            builder.Services.AddScoped<ISignInService, SignInService>();
            builder.Services.AddScoped<IAdminAuthService, AdminAuthService>();
            builder.Services.AddScoped<IAuditLogService, AuditLogService>();
            builder.Services.AddScoped<IAuditLogStorage, AuditLogStorage>();
            builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
            builder.Services.AddScoped<IDashboardService, DashboardService>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<IMaintenanceModeStorage, MaintenanceModeStorage>();
            builder.Services.AddScoped<IMaintenanceModeService, MaintenanceModeService>();
            builder.Services.AddScoped<IConfigurationService, ConfigurationService>();
            builder.Services.AddScoped<ILibraryConfigService, LibraryConfigService>();
            builder.Services.AddScoped<IWorldAdminService, WorldAdminService>();
            builder.Services.AddScoped<ICampaignAdminService, CampaignAdminService>();
            builder.Services.AddScoped<IAdventureAdminService, AdventureAdminService>();
            builder.Services.AddScoped<IEncounterAdminService, EncounterAdminService>();
            builder.Services.AddScoped<IAssetAdminService, AssetAdminService>();

            builder.Services.AddScoped<IMediaServiceClient, MediaServiceClient>();
            builder.Services.AddScoped<IAssetsServiceClient, AssetsServiceClient>();
            builder.Services.AddScoped<IAiServiceClient, AiServiceClient>();
            builder.Services.AddScoped<IResourceApprovalService, ResourceApprovalService>();

            builder.Services.AddTransient<InternalApiKeyHandler>();

            builder.Services.AddHttpClient("MediaService", c => c.BaseAddress = new Uri("https+http://resources-api"))
                   .AddHttpMessageHandler<InternalApiKeyHandler>()
                   .AddStandardResilienceHandler();
            builder.Services.AddHttpClient("AssetsService", c => c.BaseAddress = new Uri("https+http://assets-api"))
                   .AddHttpMessageHandler<InternalApiKeyHandler>()
                   .AddStandardResilienceHandler();
            builder.Services.AddHttpClient("AiService", c => c.BaseAddress = new Uri("https+http://ai-api"))
                   .AddHttpMessageHandler<InternalApiKeyHandler>()
                   .AddStandardResilienceHandler();

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
    }

    internal static void MapApplicationEndpoints(this IEndpointRouteBuilder app) {
        app.MapAdminAuthEndpoints();
        app.MapAuditLogEndpoints();
        app.MapDashboardEndpoints();
        app.MapHealthCheckEndpoints();
        app.MapUserEndpoints();
        app.MapMaintenanceModeEndpoints();
        app.MapConfigurationEndpoints();
        app.MapLibraryAdminEndpoints();
        app.MapResourceApprovalEndpoints();
        app.MapHub<AuditLogHub>("/hubs/audit");
    }
}