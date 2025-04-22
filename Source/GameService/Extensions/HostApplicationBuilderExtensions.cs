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
        builder.Services.AddExceptionHandler<LoggedExceptionHandler>();
        builder.Services.AddHttpContextAccessor();
        builder.Services.AddSingleton(TimeProvider.System);
        builder.Services.Configure<JsonOptions>(ConfigureJsonOptions);
        builder.Services.AddDistributedMemoryCache();

        builder.Services.AddCors(ConfigureCorsOptions);
        builder.Services.AddOpenApi();
        builder.Services.AddHealthChecks();

        builder.Services.AddAuthentication();
        builder.Services.AddAuthorization();
    }

    internal static void ConfigureCorsOptions(CorsOptions options)
        => options.AddDefaultPolicy(ConfigureCorsPolicy);

    internal static void ConfigureCorsPolicy(CorsPolicyBuilder builder)
        => builder.WithOrigins("https://localhost:5001", "https://localhost:7040")
                 .AllowAnyMethod()
                 .AllowAnyHeader();

    internal static void ConfigureJsonOptions(JsonOptions options) {
        options.SerializerOptions.PropertyNameCaseInsensitive = true;
        options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.SerializerOptions.Converters.Add(new OptionalConverterFactory());
    }

    internal static void AddDataStorage(this IHostApplicationBuilder builder) {
        builder.AddSqlServerDbContext<ApplicationDbContext>(ApplicationDbContextOptions.ConnectionStringName);
        builder.AddAzureBlobClient(AzureStorageOptions.ConnectionStringName);
        builder.AddGameDataStorage();
        builder.Services.AddScoped<IMeetingService, MeetingService>();
        builder.Services.AddScoped<IAdventureStorage, AdventureStorage>();
        builder.Services.AddScoped<IEpisodeStorage, EpisodeStorage>();
        builder.Services.AddScoped<IAdventureService, AdventureService>();
        builder.Services.AddScoped<IStorageService, BlobStorageService>();
    }
}