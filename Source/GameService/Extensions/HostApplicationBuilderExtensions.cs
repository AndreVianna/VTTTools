using JsonOptions = Microsoft.AspNetCore.Http.Json.JsonOptions;

namespace VttTools.GameService.Extensions;

internal static class HostApplicationBuilderExtensions {
    internal static void AddServiceDiscovery(this IHostApplicationBuilder builder) {
        builder.Services.AddServiceDiscovery();
        builder.Services.ConfigureHttpClientDefaults(http => {
            http.AddStandardResilienceHandler();
            http.AddServiceDiscovery();
        });
    }

    internal static void AddRequiredServices(this IHostApplicationBuilder builder) {
        builder.Services.AddProblemDetails();
        builder.Services.AddHttpContextAccessor();
        builder.Services.AddSingleton(TimeProvider.System);
        builder.Services.Configure<JsonOptions>(o => {
            o.SerializerOptions.PropertyNameCaseInsensitive = true;
            o.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            o.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
            o.SerializerOptions.Converters.Add(new OptionalConverterFactory());
        });
        builder.Services.AddDistributedMemoryCache();

        builder.Services.AddCors(options
            => options.AddDefaultPolicy(policy
                => policy.WithOrigins("https://localhost:5001", "https://localhost:7040")
                         .AllowAnyMethod()
                         .AllowAnyHeader()));

        builder.Services.AddAuthentication();
        builder.Services.AddAuthorization();
        // register storage service for file uploads
        builder.Services.AddScoped<IStorageService, BlobStorageService>();

        builder.Services.AddOpenApi();
        builder.Services.AddHealthChecks()
               .AddCheck("self", () => HealthCheckResult.Healthy(), ["live"]);
    }

    internal static void AddDataStorage(this IHostApplicationBuilder builder) {
        builder.AddSqlServerDbContext<ApplicationDbContext>(ApplicationDbContextOptions.ConnectionStringName);
        builder.AddAzureBlobClient(AzureStorageOptions.ConnectionStringName);
        builder.AddGameDataStorage();
        builder.Services.AddScoped<IMeetingService, MeetingService>();
    }

    internal static void AddApplicationServices(this IHostApplicationBuilder builder) {
        builder.Services.AddScoped<IAdventureStorage, AdventureStorage>();
        builder.Services.AddScoped<IEpisodeStorage, EpisodeStorage>();
        builder.Services.AddScoped<IAdventureService, AdventureService>();
    }
}