using static VttTools.Data.Options.ApplicationDbContextOptions;

using HttpJsonOptions = Microsoft.AspNetCore.Http.Json.JsonOptions;

namespace VttTools.WebApp;

[ExcludeFromCodeCoverage]
internal static class Program {
    public static void Main(string[] args) {
        var builder = WebApplication.CreateBuilder(args);
        builder.Host.VerifyDependencies();
        builder.Services.AddRazorComponents()
               .AddInteractiveServerComponents()
               .AddInteractiveWebAssemblyComponents()
               .AddAuthenticationStateSerialization();

        builder.Services.AddServiceDiscovery();
        builder.Services.ConfigureHttpClientDefaults(http => {
            http.AddStandardResilienceHandler();
            http.AddServiceDiscovery();
        });
        builder.Services.AddSingleton(new JsonSerializerOptions {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            Converters = {
                new JsonStringEnumConverter(),
                new OptionalConverterFactory(),
            },
        });
        builder.Services.ConfigureHttpJsonOptions(ConfigureHttpJsonOptions);

        builder.Services.AddHttpContextAccessor();
        builder.Services.AddScoped<AuthenticationStateProvider, PersistingAuthenticationStateProvider>();
        builder.Services.AddScoped<AuthenticationDelegatingHandler>();
        builder.Services.AddScoped<IHubConnectionBuilder, HubConnectionBuilder>();

        builder.Services.AddHttpClient<IAssetsHttpClient, AssetsHttpClient>(static client
            => client.BaseAddress = new("https+http://assets-api"))
            .AddHttpMessageHandler<AuthenticationDelegatingHandler>();
        builder.Services.AddHttpClient<IAdventuresHttpClient, AdventuresHttpClient>(static client
            => client.BaseAddress = new("https+http://library-api"))
            .AddHttpMessageHandler<AuthenticationDelegatingHandler>();
        builder.Services.AddHttpClient<IGameSessionsHttpClient, GameSessionsHttpClient>(static client
            => client.BaseAddress = new("https+http://game-api"))
            .AddHttpMessageHandler<AuthenticationDelegatingHandler>();
        builder.Services.AddHttpClient<IServerFileManagerHttpClient, ServerFileManagerHttpClient>(static client
            => client.BaseAddress = new("https+http://resources-api"))
            .AddHttpMessageHandler<AuthenticationDelegatingHandler>();
        builder.Services.AddHttpClient<ISceneBuilderHttpClient, SceneBuilderHttpClient>(static client
            => client.BaseAddress = new("https://localhost:7172"));
        builder.Services.AddHttpClient<IWebAssemblyFileManagerHttpClient, WebAssemblyFileManagerHttpClient>(static client
            => client.BaseAddress = new("https://localhost:7174"));

        // Add SceneBuilder services for both server and WebAssembly rendering
        builder.Services.AddScoped<SceneBuilderStorageService>();

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
            options.DefaultScheme = IdentityConstants.ApplicationScheme;
            options.DefaultSignInScheme = IdentityConstants.ExternalScheme;
        }).AddIdentityCookies();
        builder.Services.AddAuthorization();

        var app = builder.Build();

        if (app.Environment.IsDevelopment()) {
            app.UseWebAssemblyDebugging();
            app.UseDeveloperExceptionPage();
        }
        else {
            app.UseExceptionHandler("/error", createScopeForErrors: true);
            app.UseStatusCodePagesWithReExecute("/status/{0}");
            app.UseHsts();
        }

        app.UseHttpsRedirection();

        app.UseRouting();
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseAntiforgery();

        app.MapStaticAssets();
        app.MapRazorComponents<App>()
           .AddInteractiveServerRenderMode()
           .AddInteractiveWebAssemblyRenderMode()
           .AddAdditionalAssemblies(typeof(VttTools.WebApp.Server._Imports).Assembly)
           .AddAdditionalAssemblies(typeof(VttTools.WebApp.WebAssembly._Imports).Assembly);
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

    internal static void ConfigureHttpJsonOptions(HttpJsonOptions options) {
        options.SerializerOptions.PropertyNameCaseInsensitive = true;
        options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.SerializerOptions.Converters.Add(new OptionalConverterFactory());
    }
}