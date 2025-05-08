var builder = DistributedApplication.CreateBuilder(args);

var cache = builder.AddRedis("redis")
                   .WithRedisInsight()
                   .WithLifetime(ContainerLifetime.Persistent);

var blobs = builder.ExecutionContext.IsPublishMode
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
    : builder.AddConnectionString("database");

var assets = builder.AddProject<Projects.VttTools_Assets>("assets-api")
    .WithReference(cache).WaitFor(cache)
    .WithReference(database).WaitFor(database)
    .WithReference(blobs).WaitFor(blobs)
    .WithExternalHttpEndpoints()
    .WithHttpHealthCheck("health");

var library = builder.AddProject<Projects.VttTools_Library>("library-api")
    .WithReference(cache).WaitFor(cache)
    .WithReference(database).WaitFor(database)
    .WithReference(assets).WaitFor(assets)
    .WithExternalHttpEndpoints()
    .WithHttpHealthCheck("health");

var game = builder.AddProject<Projects.VttTools_Game>("game-api")
    .WithReference(cache).WaitFor(cache)
    .WithReference(database).WaitFor(database)
    .WithReference(library).WaitFor(library)
    .WithExternalHttpEndpoints()
    .WithHttpHealthCheck("health");

builder.AddProject<Projects.VttTools_WebApp>("webapp")
    .WithReference(cache).WaitFor(cache)
    .WithReference(database).WaitFor(database)
    .WithReference(game).WaitFor(game)
    .WithReference(library).WaitFor(library)
    .WithReference(assets).WaitFor(assets)
    .WithExternalHttpEndpoints()
    .WithHttpHealthCheck("health");

builder.Build().Run();
