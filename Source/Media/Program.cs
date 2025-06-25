namespace VttTools.Media;

[ExcludeFromCodeCoverage]
internal static class Program {
    public static void Main(string[] args) {
        var builder = WebApplication.CreateBuilder(args);
        builder.Host.VerifyDependencies();
        builder.AddServiceDiscovery();
        builder.AddRequiredServices();
        builder.AddStorage();
        builder.AddServices();

        var app = builder.Build();
        app.ApplyRequiredConfiguration(app.Environment);
        app.MapDefaultEndpoints();
        app.MapApplicationEndpoints();

        app.Run();
    }

    internal static void AddStorage(this IHostApplicationBuilder builder) {
        builder.AddSqlServerDbContext<ApplicationDbContext>(ApplicationDbContextOptions.ConnectionStringName);
        builder.AddDataStorage();
        builder.AddAzureBlobClient(AzureStorageOptions.ConnectionStringName);
        var configuration = builder.Configuration;
        var healthChecksBuilder = builder.Services.AddHealthChecks();
        var dbConnectionString = configuration.GetConnectionString(ApplicationDbContextOptions.ConnectionStringName);
        if (!string.IsNullOrEmpty(dbConnectionString)) {
            builder.Services.AddSingleton(sp =>
                new DatabaseHealthCheck(sp.GetRequiredService<IConfiguration>(), ApplicationDbContextOptions.ConnectionStringName));
            healthChecksBuilder.AddCheck<DatabaseHealthCheck>("Database", tags: ["database"]);
        }
        var blobConnectionString = configuration.GetConnectionString(AzureStorageOptions.ConnectionStringName);
        if (!string.IsNullOrEmpty(blobConnectionString)) {
            builder.Services.AddSingleton(sp =>
                new BlobStorageHealthCheck(sp.GetRequiredService<IConfiguration>(), AzureStorageOptions.ConnectionStringName, "media"));
            healthChecksBuilder.AddCheck<BlobStorageHealthCheck>("BlobStorage", tags: ["storage", "blob"]);
        }
    }

    internal static void AddServices(this IHostApplicationBuilder builder)
        => builder.Services.AddScoped<IResourceService, AzureResourceService>();

    internal static void MapApplicationEndpoints(this IEndpointRouteBuilder app)
        => app.MapResourcesEndpoints();
}