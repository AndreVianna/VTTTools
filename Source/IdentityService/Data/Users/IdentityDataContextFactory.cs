namespace IdentityService.Data.Users;

public class IdentityDataContextFactory : IDesignTimeDbContextFactory<UsersDataContext> {
    public UsersDataContext CreateDbContext(string[] args) {
        var configuration = new ConfigurationBuilder()
                           .SetBasePath(Directory.GetCurrentDirectory())
                           .AddJsonFile("appsettings.Development.json")
                           .AddUserSecrets<Program>() // This will include your user secrets
                           .Build();

        var optionsBuilder = new DbContextOptionsBuilder<UsersDataContext>();
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        optionsBuilder.UseSqlServer(connectionString);

        // Create a service provider with the necessary services for design time
        var serviceProvider = new ServiceCollection()
            .AddSingleton<IPersonalDataProtector, NullPersonalDataProtector>()
            .AddSingleton<ILookupProtectorKeyRing, NullLookupProtectorKeyRing>()
            .AddSingleton<ILookupProtector, NullLookupProtector>()
            .BuildServiceProvider();

        return new(optionsBuilder.UseApplicationServiceProvider(serviceProvider).Options);
    }
}