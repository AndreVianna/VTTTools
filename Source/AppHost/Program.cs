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

var gameService = builder.AddProject<Projects.VttTools_GameService>("gameapi")
    .WithReference(cache).WaitFor(cache)
    .WithReference(database).WaitFor(database)
    .WithReference(storage).WaitFor(storage)
    .WithExternalHttpEndpoints()
    .WithHttpHealthCheck("health");

builder.AddProject<Projects.VttTools_WebApp>("webapp")
    .WithReference(cache).WaitFor(cache)
    .WithReference(gameService).WaitFor(gameService)
    .WithReference(database).WaitFor(database)
    .WithExternalHttpEndpoints()
    .WithHttpHealthCheck("health");

builder.Build().Run();