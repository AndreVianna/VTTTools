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
var database = !isDevelopment
    ? builder.AddSqlServer("sql")
             .WithDataVolume()
             .WithLifetime(ContainerLifetime.Persistent)
             .AddDatabase("database")
    : builder.AddConnectionString("database");

var resources = builder.AddProject<Projects.VttTools_Media>("resources-api")
    .WithReference(cache).WaitFor(cache)
    .WithReference(blobs).WaitFor(blobs)
    .WithHttpHealthCheck("health")
    .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

var assets = builder.AddProject<Projects.VttTools_Assets>("assets-api")
    .WithReference(cache).WaitFor(cache)
    .WithReference(database).WaitFor(database)
    .WithReference(resources).WaitFor(resources)
    .WithHttpHealthCheck("health")
    .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

var library = builder.AddProject<Projects.VttTools_Library>("library-api")
    .WithReference(cache).WaitFor(cache)
    .WithReference(database).WaitFor(database)
    .WithReference(resources).WaitFor(resources)
    .WithReference(assets).WaitFor(assets)
    .WithHttpHealthCheck("health")
    .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

var game = builder.AddProject<Projects.VttTools_Game>("game-api")
    .WithReference(cache).WaitFor(cache)
    .WithReference(database).WaitFor(database)
    .WithReference(library).WaitFor(library)
    .WithHttpHealthCheck("health")
    .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

builder.AddProject<Projects.VttTools_WebApp>("webapp")
    .WithReference(cache).WaitFor(cache)
    .WithReference(database).WaitFor(database)
    .WithReference(blobs).WaitFor(blobs)
    .WithReference(resources).WaitFor(resources)
    .WithReference(assets).WaitFor(assets)
    .WithReference(library).WaitFor(library)
    .WithReference(game).WaitFor(game)
    .WithHttpHealthCheck("health")
    .WithEndpoint("https", endpoint => endpoint.IsProxied = !isDevelopment);

builder.Build().Run();
