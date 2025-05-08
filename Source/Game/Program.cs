namespace VttTools.Game;

[ExcludeFromCodeCoverage]
internal static class Program {
    public static void Main(string[] args) {
        var builder = WebApplication.CreateBuilder(args);
        builder.Host.UseDefaultServiceProvider((_, o) => {
            o.ValidateScopes = true;
            o.ValidateOnBuild = true;
        });
        builder.AddServiceDiscovery();
        builder.AddRequiredServices();
        builder.AddStorage();
        builder.AddServices();

        var app = builder.Build();
        app.ApplyRequiredConfiguration(app.Environment);
        app.MapApplicationEndpoints();

        app.Run();
    }

    internal static void MapApplicationEndpoints(this IEndpointRouteBuilder app) {
        app.MapOpenApi();
        app.MapHealthCheckEndpoints();
        app.MapGameSessionEndpoints();
    }

    internal static void AddStorage(this IHostApplicationBuilder builder) {
        builder.AddSqlServerDbContext<ApplicationDbContext>(ApplicationDbContextOptions.Name);
        builder.AddDataStorage();
    }

    internal static void AddServices(this IHostApplicationBuilder builder)
        => builder.Services.AddScoped<IGameSessionService, GameSessionService>();
}