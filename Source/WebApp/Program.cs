using static VttTools.Data.Options.ApplicationDbContextOptions;
using static VttTools.Middlewares.UserIdentificationOptions;

using MvcJsonOptions = Microsoft.AspNetCore.Mvc.JsonOptions;
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
        builder.Services.Configure<MvcJsonOptions>(ConfigureMvcJsonOptions);
        builder.Services.ConfigureHttpJsonOptions(ConfigureHttpJsonOptions);

        builder.Services.AddHttpContextAccessor();
        builder.Services.AddScoped<IHubConnectionBuilder, HubConnectionBuilder>();
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
        builder.Services.AddScoped<IGameClient, GameClient>();
        builder.Services.AddHttpClient<IGameClient, GameClient>(static (services, client) => {
            client.BaseAddress = new("https+http://game-api");
            SetRequestUserId(services, client);
        });

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
           .AddAdditionalAssemblies(typeof(VttTools.WebApp.Client._Imports).Assembly);
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

    internal static void ConfigureHttpJsonOptions(HttpJsonOptions options) {
        options.SerializerOptions.PropertyNameCaseInsensitive = true;
        options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.SerializerOptions.Converters.Add(new OptionalConverterFactory());
    }

    internal static void ConfigureMvcJsonOptions(MvcJsonOptions options) {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.Converters.Add(new OptionalConverterFactory());
    }
}