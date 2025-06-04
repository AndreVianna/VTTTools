namespace VttTools.WebApp.WebAssembly;

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
        builder.Services.AddSingleton<AuthenticationStateProvider, PersistentAuthenticationStateProvider>();
        builder.Services.AddAuthenticationStateDeserialization();
        builder.Services.AddSingleton(new JsonSerializerOptions {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            Converters = {
                new JsonStringEnumConverter(),
                new OptionalConverterFactory(),
            },
        });

        builder.Services.AddHttpClient<ISceneBuilderHttpClient, SceneBuilderHttpClient>(static (_, client)
            => client.BaseAddress = new("https://localhost:7171"));
        builder.Services.AddHttpClient<IWebAssemblyFileManagerHttpClient, WebAssemblyFileManagerHttpClient>(static (_, client)
            => client.BaseAddress = new("https://localhost:7174"));

        builder.Services.AddScoped<SceneBuilderStorageService>();

        var app = builder.Build();
        return app.RunAsync();
    }
}