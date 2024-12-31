var builder = DistributedApplication.CreateBuilder(args);

var cache = builder.AddRedis("cache");

var authService = builder.AddProject<Projects.AuthService>("AuthService")
    .WithReference(cache);

var apiService = builder.AddProject<Projects.ApiService>("ApiService")
    .WithReference(cache);

builder.AddProject<Projects.WebApp>("webapp")
    .WithExternalHttpEndpoints()
    .WithReference(cache)
    .WithReference(authService)
    .WithReference(apiService);

builder.Build().Run();
