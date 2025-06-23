namespace VttTools.Library;

[ExcludeFromCodeCoverage]
internal static class Program {
    public static void Main(string[] args) {
        var builder = WebApplication.CreateBuilder(args);
        builder.Host.VerifyDependencies();
        builder.AddServiceDiscovery();
        builder.AddRequiredServices();
        builder.AddStorage();
        builder.AddServices();

        var app = builder.Build();
        app.ApplyRequiredConfiguration(app.Environment);
        app.MapDefaultEndpoints();
        app.MapApplicationEndpoints();

        app.Run();
    }

    internal static void AddStorage(this IHostApplicationBuilder builder) {
        builder.AddSqlServerDbContext<ApplicationDbContext>(ApplicationDbContextOptions.ConnectionStringName);
        builder.AddDataStorage();
        
        // Register health checks
        builder.Services.AddSingleton<DatabaseHealthCheck>(sp => 
            new DatabaseHealthCheck(sp.GetRequiredService<IConfiguration>(), ApplicationDbContextOptions.ConnectionStringName));
        
        builder.AddDetailedHealthChecks()
            .AddCheck<DatabaseHealthCheck>("Database", tags: ["database"]);
    }

    internal static void AddServices(this IHostApplicationBuilder builder) {
        builder.Services.AddScoped<IAdventureService, AdventureService>();
        builder.Services.AddScoped<ISceneService, SceneService>();
    }

    internal static void MapApplicationEndpoints(this IEndpointRouteBuilder app) {
        app.MapAdventureEndpoints();
        app.MapSceneEndpoints();
    }
}