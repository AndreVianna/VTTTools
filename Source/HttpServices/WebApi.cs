// ReSharper disable once CheckNamespace
namespace Microsoft.Extensions.Hosting;

public static class WebApi {
    public static WebApiBuilder CreateBuilder<TDatabase>(string[] args, Action<DbContextOptionsBuilder, IConfiguration>? configure = null)
        where TDatabase : DbContext {
        var builder = WebApplication.CreateBuilder(args);

        builder.AddServiceDefaults();
        builder.AddRedisDistributedCache("redis");
        builder.Services.AddProblemDetails();
        builder.Services.AddOpenApi();

        builder.Services.AddScoped<IClientService, ClientService<TDatabase>>();

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
        return new(builder);
    }
}