using Microsoft.AspNetCore.Components.Authorization;

namespace VttTools.WebApp.Client;

[ExcludeFromCodeCoverage]
internal static class Program {
    public static Task Main(string[] args) {
        var builder = WebAssemblyHostBuilder.CreateDefault(args);
        builder.Services.AddServiceDiscovery();
        builder.Services.ConfigureHttpClientDefaults(http => {
            http.AddStandardResilienceHandler();
            http.AddServiceDiscovery();
        });

        builder.Services.AddAuthorizationCore();
        builder.Services.AddCascadingAuthenticationState();
        builder.Services.AddAuthenticationStateDeserialization();
        builder.Services.AddSingleton(new JsonSerializerOptions {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            Converters = {
                new JsonStringEnumConverter(),
                new OptionalConverterFactory(),
            },
        });

        builder.Services.AddScoped<ClientAuthenticationDelegatingHandler>();
        builder.Services.AddHttpClient<IAssetsClientHttpClient, AssetsClientHttpClient>(static (_, client)
            => client.BaseAddress = new("https://localhost:7171"));
        builder.Services.AddHttpClient<ILibraryClientHttpClient, LibraryClientHttpClient>(static (_, client)
            => client.BaseAddress = new("https://localhost:7172"));

        var app = builder.Build();
        return app.RunAsync();
    }
}