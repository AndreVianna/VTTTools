var builder = DistributedApplication.CreateBuilder(args);

var cache = builder.AddRedis("cache");

var apiService = builder.AddProject<Projects.ApiService>("ApiService");
var authService = builder.AddProject<Projects.AuthService>("AuthService");

builder.AddProject<Projects.WebApp>("webapp")
    .WithExternalHttpEndpoints()
    .WithReference(cache)
    .WaitFor(cache)
    .WithReference(authService)
    .WaitFor(apiService)
    .WithReference(apiService)
    .WaitFor(apiService);

builder.Build().Run();
