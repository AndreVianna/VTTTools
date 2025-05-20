using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;

using VttTools.WebApp.Client.Extensions;

namespace VttTools.WebApp.Client;

[ExcludeFromCodeCoverage]
internal static class Program {
    public static Task Main(string[] args) {
        var builder = WebAssemblyHostBuilder.CreateDefault(args);

        builder.Services.AddAuthorizationCore();
        builder.Services.AddCascadingAuthenticationState();
        builder.Services.AddAuthenticationStateDeserialization();

        // Register HTTP client
        builder.Services.AddScoped(_ => new HttpClient { BaseAddress = new(builder.HostEnvironment.BaseAddress) });

        builder.Services.AddServiceDiscovery();
        builder.Services.ConfigureHttpClientDefaults(http => {
            http.AddStandardResilienceHandler();
            http.AddServiceDiscovery();
        });
        builder.Services.AddScoped<IAssetsClient, AssetsClient>();
        builder.Services.AddHttpClient<IAssetsClient, AssetsClient>(static (services, client) => {
            client.BaseAddress = new("https+http://assets-api");
            SetRequestUserId(services, client);
        });
        builder.Services.AddScoped<ILibraryClient, LibraryClient>();
        builder.Services.AddHttpClient<ILibraryClient, LibraryClient>(static (services, client) => {
            client.BaseAddress = new("https+http://library-api");
            SetRequestUserId(services, client);
        });

        var app = builder.Build();

        return app.RunAsync();
    }

    internal static void SetRequestUserId(IServiceProvider services, HttpClient client) {
        var httpContext = services.GetRequiredService<IHttpContextAccessor>().HttpContext!;
        var identity = (ClaimsIdentity)httpContext.User.Identity!;
        if (!identity.IsAuthenticated)
            return;
        var token = Base64UrlEncoder.Encode(httpContext.User.GetCurrentUserId().ToByteArray());
        client.DefaultRequestHeaders.Add("x-user", token);
    }
}