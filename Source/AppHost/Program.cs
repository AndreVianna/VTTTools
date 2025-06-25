namespace VttTools.AppHost;

[ExcludeFromCodeCoverage]
internal static class Program {
    public static Task Main(string[] args) {
        var builder = DistributedApplication.CreateBuilder(args);

        var isDevelopment = builder.Environment.IsDevelopment();

        var cache = builder.AddRedis("redis")
                           .WithLifetime(ContainerLifetime.Persistent);

        var blobs = !isDevelopment
                        ? builder.AddAzureStorage("storage")
                                 .AddBlobs("blobs")
                        : builder.AddAzureStorage("storage")
                                 .RunAsEmulator(e => {
                                     e.WithDataVolume();
                                     e.WithLifetime(ContainerLifetime.Persistent);
                                 })
                                 .AddBlobs("blobs");

        var database = builder.AddSqlServer("sql")
                              .WithDataVolume()
                              .WithLifetime(ContainerLifetime.Persistent)
                              .AddDatabase("database");

        var migrationService = builder.AddProject<Projects.VttTools_Data_MigrationService>("migration-service")
                                      .WithReference(database);

        var resources = builder.AddProject<Projects.VttTools_Media>("resources-api")
                               .WithReference(cache)
                               .WithReference(database)
                               .WithReference(blobs)
                               .WaitFor(migrationService)
                               .WithHttpHealthCheck("health")
                               .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

        var assets = builder.AddProject<Projects.VttTools_Assets>("assets-api")
                            .WithReference(cache)
                            .WithReference(database)
                            .WithReference(resources)
                            .WaitFor(migrationService)
                            .WithHttpHealthCheck("health")
                            .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

        var library = builder.AddProject<Projects.VttTools_Library>("library-api")
                             .WithReference(cache)
                             .WithReference(database)
                             .WithReference(resources)
                             .WithReference(assets)
                             .WaitFor(migrationService)
                             .WithHttpHealthCheck("health")
                             .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

        var game = builder.AddProject<Projects.VttTools_Game>("game-api")
                          .WithReference(cache)
                          .WithReference(database)
                          .WithReference(library)
                          .WaitFor(migrationService)
                          .WithHttpHealthCheck("health")
                          .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

        builder.AddProject<Projects.VttTools_WebApp>("webapp")
               .WithReference(cache)
               .WithReference(database)
               .WithReference(blobs)
               .WithReference(resources).WaitFor(resources)
               .WithReference(assets).WaitFor(assets)
               .WithReference(library).WaitFor(library)
               .WithReference(game).WaitFor(game)
               .WaitFor(migrationService)
               .WithHttpHealthCheck("health")
               .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

        var app = builder.Build();
        return app.RunAsync();
    }
}