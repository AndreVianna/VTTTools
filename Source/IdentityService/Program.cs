using HttpServices.Identity.Model;

var builder = IdentityProviderWebApi.CreateBuilder<ServiceDbContext, UserIdentity>(args, (options, configuration) => {
                                                                                             var connectionString = IsNotNull(configuration.GetConnectionString("DefaultConnection"));
                                                                                             options.UseSqlServer(connectionString);
                                                                                         });

var app = builder.Build();

app.MapHealthCheckEndpoints();
app.MapApiClientManagementEndpoints();

app.MapAuthenticationManagementEndpoints();
app.MapUserAccountManagementEndpoints();

app.Run();
