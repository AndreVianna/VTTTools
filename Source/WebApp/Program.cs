using Microsoft.Extensions.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseDefaultServiceProvider((_, o) => {
    o.ValidateScopes = true;
    o.ValidateOnBuild = true;
});

AddDefaultHealthChecks();
builder.AddRedisOutputCache("redis");
builder.AddSqlServerDataProvider();
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddCascadingAuthenticationState();
builder.Services.AddScoped<IdentityUserAccessor>();
builder.Services.AddScoped<IdentityRedirectManager>();
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

builder.Services.AddHttpClient("game", static client => client.BaseAddress = new("https://localhost:7465"));

var app = builder.Build();

if (app.Environment.IsDevelopment()) {
    app.UseWebAssemblyDebugging();
    app.UseMigrationsEndPoint();
}
else {
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode()
    .AddInteractiveWebAssemblyRenderMode();
MapDefaultEndpoints();
app.MapAdditionalIdentityEndpoints();
app.MapApiEndpoints();

app.Run();
return;

void AddDefaultHealthChecks()
    => builder.Services.AddHealthChecks()
                       .AddCheck("self", () => HealthCheckResult.Healthy(), ["live"]);

void MapDefaultEndpoints() {
    if (!app.Environment.IsDevelopment())
        return;
    app.MapHealthChecks("/health");
    app.MapHealthChecks("/alive", new() {
        Predicate = r => r.Tags.Contains("live"),
    });
}
