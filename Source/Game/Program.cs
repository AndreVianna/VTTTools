namespace VttTools.Game;

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
        
        // Add database health check
        builder.Services.AddHealthChecks()
            .AddCheck<DatabaseHealthCheck>("Database", tags: ["database", "sql"]);
        
        builder.Services.AddSingleton<DatabaseHealthCheck>(provider =>
            new DatabaseHealthCheck(provider.GetRequiredService<IConfiguration>(), ApplicationDbContextOptions.ConnectionStringName));
    }

    internal static void AddServices(this IHostApplicationBuilder builder)
        => builder.Services.AddScoped<IGameSessionService, GameSessionService>();

    internal static void MapApplicationEndpoints(this IEndpointRouteBuilder app)
        => app.MapGameSessionEndpoints();
}