var builder = DistributedApplication.CreateBuilder(args);

var cache = builder.AddRedis("redis")
                   .WithRedisInsight()
                   .WithLifetime(ContainerLifetime.Persistent);

var storage = builder.ExecutionContext.IsPublishMode
                  ? builder.AddAzureStorage("storage")
                           .AddBlobs("blobs")
                  : builder.AddAzureStorage("storage")
                           .RunAsEmulator(e => {
                               e.WithDataVolume();
                               e.WithLifetime(ContainerLifetime.Persistent);
                           })
                           .AddBlobs("blobs");

var database = builder.ExecutionContext.IsPublishMode
    ? builder.AddSqlServer("sql")
             .WithDataVolume()
             .WithLifetime(ContainerLifetime.Persistent)
             .AddDatabase("database")
             .WithHealthCheck("database_health")
    : builder.AddConnectionString("database");

var assets = builder.AddProject<Projects.VttTools_Assets>("assetsapi")
    .WithReference(cache).WaitFor(cache)
    .WithReference(database).WaitFor(database)
    .WithReference(storage).WaitFor(storage)
    .WithExternalHttpEndpoints()
    .WithHttpHealthCheck("health");

var library = builder.AddProject<Projects.VttTools_Library>("libraryapi")
    .WithReference(cache).WaitFor(cache)
    .WithReference(database).WaitFor(database)
    .WithReference(storage).WaitFor(storage)
    .WithReference(database).WaitFor(assets)
    .WithExternalHttpEndpoints()
    .WithHttpHealthCheck("health");

var game = builder.AddProject<Projects.VttTools_Game>("gameapi")
    .WithReference(cache).WaitFor(cache)
    .WithReference(database).WaitFor(database)
    .WithReference(storage).WaitFor(storage)
    .WithReference(storage).WaitFor(library)
    .WithExternalHttpEndpoints()
    .WithHttpHealthCheck("health");

builder.AddProject<Projects.VttTools_WebApp>("webapp")
    .WithReference(cache).WaitFor(cache)
    .WithReference(database).WaitFor(database)
    .WithReference(game).WaitFor(game)
    .WithExternalHttpEndpoints()
    .WithHttpHealthCheck("health");

builder.Build().Run();