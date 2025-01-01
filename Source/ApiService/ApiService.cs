
// ReSharper disable once CheckNamespace

using TokenHandler = ApiService.Handlers.Token.TokenHandler;

namespace Microsoft.Extensions.Hosting;

public static class ApiService {
    public static WebApplicationBuilder CreateBuilder<TDatabase>(string[] args, Action<DbContextOptionsBuilder, IConfiguration>? configure = null)
        where TDatabase : DbContext {
        var builder = WebApplication.CreateBuilder(args);

        builder.AddServiceDefaults();
        builder.AddRedisDistributedCache("cache");

        builder.Services.AddProblemDetails();
        builder.Services.AddOpenApi();

        builder.Services.AddSingleton<ICacheService, CacheService>();

        builder.Services.AddScoped<ITokenHandler, TokenHandler<TDatabase>>();

        var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()
                       ?? throw new InvalidOperationException("Jwt settings are missing from the configuration.");
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key));
        builder.Services.AddAuthentication(options => {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        }).AddJwtBearer(options => options.TokenValidationParameters = new() {
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = securityKey,
        });

        builder.Services.AddDbContext<TDatabase>(options => configure?.Invoke(options, builder.Configuration));
        return builder;
    }
}

public class ApiServiceBuilder(WebApplicationBuilder builder) {
    public WebApplication Build() {
        var app = builder.Build();
        app.UseAuthentication();
        app.UseExceptionHandler();
        if (app.Environment.IsDevelopment())
            app.MapOpenApi();
        app.UseHttpsRedirection();

        MapHealthCheckEndpoints(app);
        MapApiClientEndpoints(app);

        return app;
    }

    private static void MapHealthCheckEndpoints(WebApplication app) {
        if (!app.Environment.IsDevelopment())
            return;
        app.MapHealthChecks("/health");
        app.MapHealthChecks("/alive", new() { Predicate = r => r.Tags.Contains("live") });
    }

    private static void MapApiClientEndpoints(IEndpointRouteBuilder app)
        => app.MapPost("/tokens", TokenHandler.GenerateTokenAsync);
}