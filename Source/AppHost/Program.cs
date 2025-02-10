var builder = DistributedApplication.CreateBuilder(args);

var cache = builder.AddRedis("redis")
                   .WithRedisInsight()
                   .WithLifetime(ContainerLifetime.Persistent);

var authService = builder.AddProject<Projects.IdentityService>("auth")
    .WithReference(cache)
    .WaitFor(cache)
    .WithExternalHttpEndpoints()
    .WithHttpHealthCheck("health");

var gameService = builder.AddProject<Projects.GameService>("game")
    .WithReference(cache)
    .WaitFor(cache)
    .WithExternalHttpEndpoints()
    .WithHttpHealthCheck("health");

builder.AddProject<Projects.WebApp>("webapp")
    .WithReference(cache)
    .WaitFor(cache)
    .WithReference(authService)
    .WaitFor(authService)
    .WithReference(gameService)
    .WaitFor(gameService)
    .WithExternalHttpEndpoints();

builder.Build().Run();
