var builder = WebApplication.CreateBuilder(args);
builder.Host.UseDefaultServiceProvider((_, o) => {
    o.ValidateScopes = true;
    o.ValidateOnBuild = true;
});
AddRequiredServices();

builder.Services.AddDbContext<ApplicationDbContext>(options => {
    var connectionString = IsNotNull(builder.Configuration.GetConnectionString("DefaultConnection"));
    options.UseSqlServer(connectionString);
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
    app.UseExceptionHandler();

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors();

app.UseAuthentication();
app.UseAuthorization();
MapHealthCheckEndpoints();
app.MapOpenApi();

app.Run();
return;

void AddRequiredServices() {
    builder.Services.AddServiceDiscovery();
    builder.Services.ConfigureHttpClientDefaults(http => {
        http.AddStandardResilienceHandler();
        http.AddServiceDiscovery();
    });
    builder.Services.AddProblemDetails();
    builder.Services.AddHttpContextAccessor();
    builder.Services.AddSingleton(TimeProvider.System);
    builder.Services.Configure<JsonOptions>(o => o.SerializerOptions.Converters.Add(new OptionalConverterFactory()));
    builder.Services.AddDistributedMemoryCache();
    builder.Services.AddCors();
    builder.Services.AddOpenApi();
    builder.Services
                .AddHealthChecks()
                .AddCheck("self", () => HealthCheckResult.Healthy(), ["live"]);
}

void MapHealthCheckEndpoints() {
    app.MapHealthChecks("/health")
       .WithName("IsHealthy");
    app.MapHealthChecks("/alive", new() { Predicate = r => r.Tags.Contains("live") })
       .WithName("IsAlive");
}
