namespace VttTools.WebApp.Client;

[ExcludeFromCodeCoverage]
internal static class Program {
    public static Task Main(string[] args) {
        var builder = WebAssemblyHostBuilder.CreateDefault(args);

        builder.Services.AddAuthorizationCore();
        builder.Services.AddCascadingAuthenticationState();
        builder.Services.AddAuthenticationStateDeserialization();

        builder.Services.AddHttpContextAccessor();
        builder.Services.AddHttpClient<IAssetsClientHttpClient, AssetsClientHttpClient>(static (services, client) => {
            client.BaseAddress = new("https+http://assets-api");
            SetRequestUserId(services, client);
        });
        builder.Services.AddHttpClient<ILibraryClientHttpClient, LibraryClientHttpClient>(static (services, client) => {
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