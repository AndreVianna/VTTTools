var builder = WebApi.CreateBuilder<GameServiceDbContext>(args, (options, configuration) => {
    var connectionString = configuration.GetConnectionString("DefaultConnection")
                        ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is missing from the configuration.");
    options.UseSqlServer(connectionString);
});

var app = builder.Build();
app.MapGameSessionEndpoints();

app.Run();
