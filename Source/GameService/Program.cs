using JsonOptions = Microsoft.AspNetCore.Http.Json.JsonOptions;

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

AddRequiredServices();

builder.AddSqlServerDbContext<ApplicationDbContext>(ApplicationDbContextOptions.ConnectionStringName);
builder.AddAzureBlobClient(AzureStorageOptions.ConnectionStringName);
builder.AddGameDataStorage();
builder.Services.AddScoped<IMeetingService, MeetingService>();

// Add Adventure & Episode services
builder.Services.AddScoped<IAdventureStorage, AdventureStorage>();
builder.Services.AddScoped<IEpisodeStorage, EpisodeStorage>();
builder.Services.AddScoped<IAdventureService, AdventureService>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
    app.UseExceptionHandler();

app.UseHttpsRedirection();
// serve uploaded files from 'uploads' folder
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(app.Environment.ContentRootPath, "uploads")),
    RequestPath = "/uploads"
});
app.UseRouting();
app.UseCors();
app.UseAuthentication();
app.UseMiddleware<MyAuthorizationMiddleware>();

MapHealthCheckEndpoints();
app.MapOpenApi();
app.MapGameMeetingManagementEndpoints();
// Map Adventure, Episode & Asset endpoints
app.MapAdventureManagementEndpoints();
app.MapAssetManagementEndpoints();

app.Run();
return;

void AddRequiredServices() {
    builder.Services.AddProblemDetails();
    builder.Services.AddHttpContextAccessor();
    builder.Services.AddSingleton(TimeProvider.System);
    builder.Services.Configure<JsonOptions>(o => o.SerializerOptions.Converters.Add(new OptionalConverterFactory()));
    builder.Services.AddDistributedMemoryCache();

    builder.Services.AddCors(options
        => options.AddDefaultPolicy(policy
            => policy.WithOrigins("https://localhost:5001", "https://localhost:7040")
                     .AllowAnyMethod()
                     .AllowAnyHeader()));

    builder.Services.AddAuthentication();
    builder.Services.AddAuthorization();
    // register storage service for file uploads
    builder.Services.AddScoped<IStorageService, BlobStorageService>();

    builder.Services.AddOpenApi();
    builder.Services.AddHealthChecks()
                    .AddCheck("self", () => HealthCheckResult.Healthy(), ["live"]);
}

void MapHealthCheckEndpoints() {
    app.MapHealthChecks("/health")
       .WithName("IsHealthy");
    app.MapHealthChecks("/alive", new() { Predicate = r => r.Tags.Contains("live") })
       .WithName("IsAlive");
}