var builder = DistributedApplication.CreateBuilder(args);

var cache = builder.AddRedis("redis")
                   .WithRedisInsight()
                   .WithLifetime(ContainerLifetime.Persistent);

var gameService = builder.AddProject<Projects.GameService>("gameapi")
    .WithReference(cache)
    .WaitFor(cache)
    .WithExternalHttpEndpoints()
    .WithHttpHealthCheck("health");

builder.AddProject<Projects.WebApp>("webapp")
    .WithReference(cache)
    .WaitFor(cache)
    .WithReference(gameService)
    .WaitFor(gameService)
    .WithExternalHttpEndpoints();

builder.Build().Run();
