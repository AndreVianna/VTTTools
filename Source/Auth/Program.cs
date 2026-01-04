using VttTools.Utilities;

namespace VttTools.Auth;

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

        var app = builder.Build();
        app.ApplyRequiredConfiguration(app.Environment);
        app.UseCors();
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseRateLimiter();
        app.UseAuditLogging();
        app.MapDefaultEndpoints();
        app.MapApplicationEndpoints();

        app.Run();
    }

    internal static void AddStorage(this IHostApplicationBuilder builder) {
        builder.AddNpgsqlDbContext<ApplicationDbContext>(ApplicationDbContextOptions.ConnectionStringName);
        builder.AddDataStorage();
        builder.AddIdentityStorage();
        // Note: Database health is monitored by Aspire at the infrastructure level
    }

    internal static void AddIdentity(this IHostApplicationBuilder builder) {
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

        var jwtOptions = builder.Configuration.GetSection("Jwt").Get<JwtOptions>() ?? throw new InvalidOperationException("JWT configuration section 'Jwt' is missing from appsettings.json");

        if (builder.Environment.IsProduction())
            jwtOptions.ValidateForProduction();

        builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options => {
                var key = Encoding.UTF8.GetBytes(jwtOptions.SecretKey);
                options.TokenValidationParameters = new() {
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

        builder.Services.ConfigureApplicationCookie(options => {
            options.Cookie.Name = ".VttTools.Auth";
            options.Cookie.HttpOnly = true;
            options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
                ? CookieSecurePolicy.SameAsRequest
                : CookieSecurePolicy.Always;
            options.Cookie.SameSite = SameSiteMode.Lax;
            options.ExpireTimeSpan = TimeSpan.FromDays(30);
            options.SlidingExpiration = true;
            options.LoginPath = "/api/auth/login";
            options.LogoutPath = "/api/auth/logout";
            options.AccessDeniedPath = "/api/auth/access-denied";

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
            options.AddSlidingWindowLimiter("auth", rateLimiterOptions => {
                rateLimiterOptions.PermitLimit = 10; // 10 attempts per window
                rateLimiterOptions.Window = TimeSpan.FromMinutes(1); // 1 minute window
                rateLimiterOptions.SegmentsPerWindow = 2;
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
            => policy.WithOrigins("http://localhost:5173", "http://localhost:5193")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials()
                  .WithExposedHeaders("X-Refreshed-Token")));

    internal static void AddServices(this IHostApplicationBuilder builder) {
        builder.Services.Configure<FrontendOptions>(builder.Configuration.GetSection(FrontendOptions.SectionName));
        builder.Services.AddScoped<ISignInService, SignInService>();
        builder.Services.AddScoped<IAuthService, AuthService>();
        builder.Services.AddScoped<IProfileService, ProfileService>();
        builder.Services.AddScoped<ISecurityService, SecurityService>();
        builder.Services.AddScoped<ITwoFactorService, TwoFactorAuthenticationService>();
        builder.Services.AddScoped<IRecoveryCodeService, RecoveryCodeService>();
        builder.Services.AddScoped<IEmailService, ConsoleEmailService>();
        builder.Services.AddScoped<IAuditLogStorage, AuditLogStorage>();
        builder.Services.AddScoped<IAuditLogService, AuditLogService>();
        builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
        builder.Services.AddSingleton(sp => {
            var config = sp.GetRequiredService<IConfiguration>();
            return config is not IConfigurationRoot root
                ? throw new InvalidOperationException("Configuration root not available for source detection")
                : new ConfigurationSourceDetector(root);
        });
        builder.Services.AddSingleton<InternalConfigurationService>();
        builder.AddAuditLogging();
    }

    internal static void MapApplicationEndpoints(this IEndpointRouteBuilder app) {
        app.MapAuthEndpoints();
        app.MapProfileEndpoints();
        app.MapSecurityEndpoints();
        app.MapTwoFactorEndpoints();
        app.MapRecoveryCodeEndpoints();
        app.MapConfigurationEndpoints();
    }
}