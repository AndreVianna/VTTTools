var builder = WebApi.CreateBuilder<GameServiceDbContext>(args, (options, configuration) => {
    var connectionString = IsNotNull(configuration.GetConnectionString("DefaultConnection"));
    options.UseSqlServer(connectionString);
});

var app = builder.Build();

app.MapHealthCheckEndpoints();
app.MapApiClientManagementEndpoints();

app.MapGameSessionManagementEndpoints();

app.Run();
