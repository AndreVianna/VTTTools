using IdentityService.Data.Clients;
using IdentityService.Data.Users;

var builder = IdentityProviderWebApi.CreateBuilder<MultiTenantDataContext, UsersDataContext, User>(args, (options, configuration) => {
                                                                                                      var connectionString = IsNotNull(configuration.GetConnectionString("DefaultConnection"));
                                                                                                      options.UseSqlServer(connectionString);
                                                                                                  });

var app = builder.Build();

app.MapHealthCheckEndpoints();
app.MapApiClientManagementEndpoints();

app.MapAuthenticationManagementEndpoints();
//app.MapUserAccountManagementEndpoints();

app.Run();
