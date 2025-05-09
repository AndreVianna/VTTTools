using static VttTools.Data.Options.ApplicationDbContextOptions;
using static VttTools.Middlewares.UserIdentificationOptions;

namespace VttTools.WebApp;

[ExcludeFromCodeCoverage]
internal static class Program {
    public static void Main(string[] args) {
        var builder = WebApplication.CreateBuilder(args);
        builder.Host.UseDefaultServiceProvider((_, o) => {
            o.ValidateScopes = true;
            o.ValidateOnBuild = true;
        });

        builder.Services.AddServiceDiscovery();
        builder.Services.ConfigureHttpClientDefaults(http => {
            http.AddStandardResilienceHandler();
            http.AddServiceDiscovery();
        });

        builder.Services.AddCors();
        builder.Services.AddHttpContextAccessor();
        builder.Services.AddScoped<IGameClient, GameClient>();
        builder.Services.AddScoped<IHubConnectionBuilder, HubConnectionBuilder>();

        AddDefaultHealthChecks(builder);
        builder.AddRedisOutputCache("redis");
        builder.AddSqlServerDbContext<ApplicationDbContext>(ConnectionStringName);
        builder.Services.AddDatabaseDeveloperPageExceptionFilter();

        builder.Services.AddCascadingAuthenticationState();
        builder.Services.AddScoped<IIdentityUserAccessor, IdentityUserAccessor>();
        builder.Services.AddScoped<AuthenticationStateProvider, IdentityRevalidatingAuthenticationStateProvider>();

        builder.Services.AddIdentityCore<User>(opt => {
            opt.SignIn.RequireConfirmedAccount = true;
            opt.SignIn.RequireConfirmedEmail = true;
            opt.SignIn.RequireConfirmedPhoneNumber = false;
            opt.User.RequireUniqueEmail = true;
            opt.Password.RequiredLength = 8;
            opt.Stores.SchemaVersion = IdentitySchemaVersions.Version2;
        }).AddEntityFrameworkStores<ApplicationDbContext>()
               .AddSignInManager()
               .AddDefaultTokenProviders();

        builder.Services.AddSingleton<IEmailSender<User>, IdentityNoOpEmailSender>();

        builder.Services.AddAuthentication(options => {
            options.DefaultScheme = IdentityConstants.ExternalScheme;
            options.DefaultSignInScheme = IdentityConstants.ExternalScheme;
        }).AddIdentityCookies();
        builder.Services.AddAuthorization();

        builder.Services.AddRazorComponents()
               .AddInteractiveServerComponents()
               .AddInteractiveWebAssemblyComponents()
               .AddAuthenticationStateSerialization();

        builder.Services.AddHttpClient<IAssetsClient, AssetsClient>(static (services, client) => {
            client.BaseAddress = new("https+http://assets-api");
            SetRequestUserId(services, client);
        });
        builder.Services.AddHttpClient<ILibraryClient, LibraryClient>(static (services, client) => {
            client.BaseAddress = new("https+http://library-api");
            SetRequestUserId(services, client);
        });
        builder.Services.AddHttpClient<IGameClient, GameClient>(static (services, client) => {
            client.BaseAddress = new("https+http://game-api");
            SetRequestUserId(services, client);
        });

        var app = builder.Build();

        if (!app.Environment.IsProduction()) {
            app.UseWebAssemblyDebugging();
        }
        if (!app.Environment.IsDevelopment()) {
            app.UseExceptionHandler("/error", createScopeForErrors: true);
            app.UseStatusCodePagesWithReExecute("/error/{0}");
            app.UseHsts();
        }

        app.UseHttpsRedirection();
        app.MapStaticAssets();

        app.UseRouting();
        app.UseCors();
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseAntiforgery();

        app.MapRazorComponents<App>()
           .AddInteractiveServerRenderMode()
           .AddInteractiveWebAssemblyRenderMode();
        MapEndpoints(app);

        app.Run();
    }

    internal static void AddDefaultHealthChecks(WebApplicationBuilder builder)
        => builder.Services.AddHealthChecks()
                  .AddCheck("self", () => HealthCheckResult.Healthy(), ["live"]);

    internal static void MapEndpoints(WebApplication app) {
        app.MapHealthChecks("/health");
        app.MapHealthChecks("/alive", new() {
            Predicate = r => r.Tags.Contains("live"),
        });
        app.MapAdditionalIdentityEndpoints();
    }

    internal static void SetRequestUserId(IServiceProvider services, HttpClient client) {
        var httpContext = services.GetRequiredService<IHttpContextAccessor>().HttpContext!;
        var identity = (ClaimsIdentity)httpContext.User.Identity!;
        if (!identity.IsAuthenticated)
            return;
        var token = Base64UrlEncoder.Encode(httpContext.User.GetUserId().ToByteArray());
        client.DefaultRequestHeaders.Add(UserHeader, token);
    }
}