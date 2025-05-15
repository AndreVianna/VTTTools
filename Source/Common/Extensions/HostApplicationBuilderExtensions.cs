using static VttTools.Middlewares.UserIdentificationOptions;

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
        builder.Services.Configure<JsonOptions>(ConfigureJsonOptions);
        builder.Services.AddDistributedMemoryCache();

        //builder.Services.AddOpenApi();
        builder.Services.AddHealthChecks();

        builder.Services.AddAuthentication(Scheme)
            .AddScheme<UserIdentificationOptions, UserIdentificationHandler>(Scheme, _ => { });
        builder.Services.AddAuthorization();
    }

    internal static void ConfigureJsonOptions(JsonOptions options) {
        options.SerializerOptions.PropertyNameCaseInsensitive = true;
        options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.SerializerOptions.Converters.Add(new OptionalConverterFactory());
    }
}