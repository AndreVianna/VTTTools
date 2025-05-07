using static VttTools.Middlewares.BasicUserAuthenticationOptions;

using JsonOptions = Microsoft.AspNetCore.Http.Json.JsonOptions;

namespace VttTools.Extensions;

public static class HostApplicationBuilderExtensions {
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
        builder.Services.Configure<JsonOptions>(ConfigureJsonOptions);
        builder.Services.AddDistributedMemoryCache();

        builder.Services.AddCors(ConfigureCorsOptions);
        builder.Services.AddOpenApi();
        builder.Services.AddHealthChecks();

        builder.Services.AddAuthentication(DefaultScheme)
            .AddScheme<BasicUserAuthenticationOptions, BasicUserAuthenticationHandler>(DefaultScheme, _ => { });
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
}