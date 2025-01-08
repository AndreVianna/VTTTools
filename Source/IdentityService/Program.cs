var builder = IdentityProviderWebApi.CreateBuilder<IdentityServiceDbContext>(args, (options, configuration) => {
    var connectionString = IsNotNull(configuration.GetConnectionString("DefaultConnection"));
    options.UseSqlServer(connectionString);
});

var app = builder.Build();

app.MapHealthCheckEndpoints();
app.MapApiAuthEndpoints();
app.MapAuthenticationManagementEndpoints();
app.MapUserAccountManagementEndpoints();

app.Run();
