namespace VttTools.AppHost;

[ExcludeFromCodeCoverage]
internal static class AppHost {
    private static readonly bool _isWindows = RuntimeInformation.IsOSPlatform(OSPlatform.Windows);

    public static async Task Main(string[] args) {
        var builder = DistributedApplication.CreateBuilder(args);

        var isDevelopment = builder.Environment.IsDevelopment();

        // Create a temporary logger for configuration decisions
        var serviceProvider = builder.Services.BuildServiceProvider();
        var loggerFactory = serviceProvider.GetRequiredService<ILoggerFactory>();
        var logger = loggerFactory.CreateLogger("AppHost");

        logger.LogInformation("Environment Detection: OS={OS}, Development={IsDevelopment}",
            _isWindows ? "Windows" : "Linux", isDevelopment);

        // Configure infrastructure with auto-detection (using connection strings from user secrets)
        logger.LogInformation("Configuring infrastructure from user secrets");

        var cache = builder.AddConnectionString("redis");
        var blobs = builder.AddConnectionString("blobs");
        var database = builder.AddConnectionString("database");

        var migration = builder.AddProject<Projects.VttTools_Data_MigrationService>("db-migration")
                                      .WithReference(database);

        var auth = builder.AddProject<Projects.VttTools_Auth>("auth-api")
                          .WithReference(cache)
                          .WithReference(database)
                          .WithHttpHealthCheck("health")
                          .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

        var resources = builder.AddProject<Projects.VttTools_Media>("resources-api")
                               .WithReference(cache)
                               .WithReference(database)
                               .WithReference(blobs)
                               .WithHttpHealthCheck("health")
                               .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

        var assets = builder.AddProject<Projects.VttTools_Assets>("assets-api")
                            .WithReference(cache)
                            .WithReference(database)
                            .WithReference(resources)
                            .WithHttpHealthCheck("health")
                            .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

        var library = builder.AddProject<Projects.VttTools_Library>("library-api")
                             .WithReference(cache)
                             .WithReference(database)
                             .WithReference(resources)
                             .WithReference(assets)
                             .WithHttpHealthCheck("health")
                             .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

        var game = builder.AddProject<Projects.VttTools_Game>("game-api")
                          .WithReference(cache)
                          .WithReference(database)
                          .WithReference(library)
                          .WithHttpHealthCheck("health")
                          .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

        //var webApp = builder.AddProject<Projects.VttTools_WebApp>("webapp")
        //                   .WithReference(cache)
        //                   .WithReference(database)
        //                   .WithReference(blobs)
        //                   .WithReference(auth).WaitFor(auth)
        //                   .WithReference(resources).WaitFor(resources)
        //                   .WithReference(assets).WaitFor(assets)
        //                   .WithReference(library).WaitFor(library)
        //                   .WithReference(game).WaitFor(game)
        //                   .WaitFor(migration)
        //                   .WithHttpHealthCheck("health")
        //                   .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

        // Register React SPA with .NET Aspire
        builder.AddNpmApp("webapp", "../WebClientApp", "dev")
                                 .WithReference(cache)
                                 .WithReference(database)
                                 .WithReference(blobs)
                                 .WithReference(auth).WaitFor(auth)
                                 .WithReference(resources).WaitFor(resources)
                                 .WithReference(assets).WaitFor(assets)
                                 .WithReference(library).WaitFor(library)
                                 .WithReference(game).WaitFor(game)
                                 .WithEnvironment("NODE_ENV", isDevelopment ? "development" : "production")
                                 .WithEndpoint("https", endpoint => {
                                     endpoint.Port = isDevelopment ? 5173 : null; // Vite default port in dev
                                     endpoint.IsProxied = !isDevelopment;
                                 });

        var app = builder.Build();
        await app.RunAsync();
    }
}