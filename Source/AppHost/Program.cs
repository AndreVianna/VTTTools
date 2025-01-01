var builder = DistributedApplication.CreateBuilder(args);

var cache = builder.AddRedis("cache");

var authService = builder.AddProject<Projects.IdentityService>("IdentityService")
    .WithReference(cache);

var apiService = builder.AddProject<Projects.GameService>("GameService")
    .WithReference(cache);

builder.AddProject<Projects.WebApp>("webapp")
    .WithExternalHttpEndpoints()
    .WithReference(cache)
    .WithReference(authService)
    .WithReference(apiService);

builder.Build().Run();
