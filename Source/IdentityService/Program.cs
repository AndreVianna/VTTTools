var builder = IdentityProviderWebApi.CreateBuilder<IdentityServiceDbContext>(args, (options, configuration) => {
    var connectionString = IsNotNull(configuration.GetConnectionString("DefaultConnection"));
    options.UseSqlServer(connectionString);
});

var app = builder.Build();

app.MapHealthCheckEndpoints();
app.MapApiClientManagementEndpoints();

app.MapAuthenticationManagementEndpoints();
app.MapUserAccountManagementEndpoints();

app.Run();
