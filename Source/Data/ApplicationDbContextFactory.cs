﻿namespace VttTools.Data;

[ExcludeFromCodeCoverage]
public class ApplicationDbContextFactory
    : IDesignTimeDbContextFactory<ApplicationDbContext> {
    public ApplicationDbContext CreateDbContext(string[] args) {
        var builder = new ConfigurationBuilder()
                     .SetBasePath(Directory.GetCurrentDirectory())
                     .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                     .AddUserSecrets<ApplicationDbContextFactory>();
        var config = builder.Build();

        var connectionString = config.GetConnectionString("Application")
                            ?? throw new InvalidOperationException("Connection string 'Application' not found.");

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseSqlServer(connectionString, _ => _.MigrationsAssembly("Data"));
        optionsBuilder.EnableSensitiveDataLogging();
        optionsBuilder.EnableDetailedErrors();
        optionsBuilder.LogTo(Console.WriteLine, LogLevel.Information);
        return new(optionsBuilder.Options);
    }
}
