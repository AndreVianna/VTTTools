namespace VttTools.AppHost;

[ExcludeFromCodeCoverage]
internal static class AppHost {
    private static readonly bool _isWindows = RuntimeInformation.IsOSPlatform(OSPlatform.Windows);

    public static Task Main(string[] args) {
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

        // Start Azurite storage emulator in development mode (skips if already running)
        IResourceBuilder<ExecutableResource>? azurite = null;
        if (isDevelopment) {
            azurite = builder.AddExecutable("azurite", "pwsh", ".")
                             .WithArgs("-NoProfile",
                                       "-ExecutionPolicy", "Bypass",
                                       "-File", "Scripts/Start-Azurite.ps1",
                                       "-Location", "../../.azurite");
        }

        var migration = builder.AddProject<Projects.VttTools_Data_MigrationService>("db-migration")
                               .WithReference(database);

        var auth = builder.AddProject<Projects.VttTools_Auth>("auth-api")
                          .WithReference(cache)
                          .WithReference(database)
                          .WithHttpHealthCheck("health")
                          .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

        var media = builder.AddProject<Projects.VttTools_Media>("media-api")
                               .WithReference(cache)
                               .WithReference(database)
                               .WithReference(blobs)
                               .WithHttpHealthCheck("health")
                               .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

        if (azurite is not null)
            media.WaitFor(azurite);

        var assets = builder.AddProject<Projects.VttTools_Assets>("assets-api")
                            .WithReference(cache)
                            .WithReference(database)
                            .WithReference(media)
                            .WithHttpHealthCheck("health")
                            .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

        var jobs = builder.AddProject<Projects.VttTools_Jobs>("jobs-api")
                          .WithReference(cache)
                          .WithReference(database)
                          .WithHttpHealthCheck("health")
                          .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

        var ai = builder.AddProject<Projects.VttTools_AI>("ai-api")
                        .WithReference(cache)
                        .WithReference(database)
                        .WithReference(media)
                        .WithReference(assets)
                        .WithReference(jobs)
                        .WithHttpHealthCheck("health")
                        .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

        var library = builder.AddProject<Projects.VttTools_Library>("library-api")
                             .WithReference(cache)
                             .WithReference(database)
                             .WithReference(media)
                             .WithReference(assets)
                             .WithHttpHealthCheck("health")
                             .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

        var game = builder.AddProject<Projects.VttTools_Game>("game-api")
                          .WithReference(cache)
                          .WithReference(database)
                          .WithReference(library)
                          .WithHttpHealthCheck("health")
                          .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

        var admin = builder.AddProject<Projects.VttTools_Admin>("admin-api")
                           .WithReference(cache)
                           .WithReference(database)
                           .WithReference(media)
                           .WithReference(assets)
                           .WithReference(ai)
                           .WithHttpHealthCheck("health")
                           .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

        var webComponents = builder.AddJavaScriptApp("web-components", "../WebComponents", "build");

        builder.AddJavaScriptApp("web-app", "../WebClientApp", "dev")
                                 .WaitFor(webComponents)
                                 .WithReference(auth).WaitFor(auth)
                                 .WithReference(media).WaitFor(media)
                                 .WithReference(assets).WaitFor(assets)
                                 .WithReference(library).WaitFor(library)
                                 .WithReference(game).WaitFor(game)
                                 .WithEnvironment("NODE_ENV", isDevelopment ? "development" : "production")
                                 .WithEndpoint("https", endpoint => {
                                     endpoint.Port = isDevelopment ? 5173 : null; // Vite default port in dev
                                     endpoint.IsProxied = !isDevelopment;
                                 });

        builder.AddJavaScriptApp("admin-app", "../WebAdminApp", "dev")
                                 .WaitFor(webComponents)
                                 .WithReference(admin).WaitFor(admin)
                                 .WithReference(ai).WaitFor(ai)
                                 .WithReference(jobs).WaitFor(jobs)
                                 .WithEnvironment("NODE_ENV", isDevelopment ? "development" : "production")
                                 .WithEndpoint("https", endpoint => {
                                     endpoint.Port = isDevelopment ? 5193 : null; // Admin app port
                                     endpoint.IsProxied = !isDevelopment;
                                 });

        var app = builder.Build();
        return app.RunAsync();
    }
}