var builder = WebApi.CreateBuilder<GameServiceDbContext>(args, (options, configuration) => {
    var connectionString = IsNotNull(configuration.GetConnectionString("DefaultConnection"));
    options.UseSqlServer(connectionString);
});

builder.Services.AddOpenApiDocument();

var app = builder.Build();

app.MapGameSessionManagementEndpoints();

if (app.Environment.IsDevelopment()) {
    app.UseOpenApi();
    app.UseSwaggerUi();
}

app.Run();
