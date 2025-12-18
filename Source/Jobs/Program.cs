namespace VttTools.Jobs;

[ExcludeFromCodeCoverage]
internal static class Program {
    public static void Main(string[] args) {
        var builder = WebApplication.CreateBuilder(args);
        builder.Host.VerifyDependencies();
        builder.AddServiceDiscovery();
        builder.AddRequiredServices();
        builder.AddStorage();
        builder.AddJwtAuthentication();
        builder.AddServices();

        var app = builder.Build();
        app.ApplyRequiredConfiguration(app.Environment);
        app.UseAuditLogging();
        app.MapDefaultEndpoints();
        app.MapApplicationEndpoints();

        app.Run();
    }

    internal static void AddStorage(this IHostApplicationBuilder builder) {
        builder.AddSqlServerDbContext<ApplicationDbContext>(ApplicationDbContextOptions.ConnectionStringName);
        builder.AddDataStorage();
        var configuration = builder.Configuration;
        var healthChecksBuilder = builder.Services.AddHealthChecks();
        var dbConnectionString = configuration.GetConnectionString(ApplicationDbContextOptions.ConnectionStringName);
        if (!string.IsNullOrEmpty(dbConnectionString)) {
            builder.Services.AddSingleton(sp =>
                new DatabaseHealthCheck(sp.GetRequiredService<IConfiguration>(), ApplicationDbContextOptions.ConnectionStringName));
            healthChecksBuilder.AddCheck<DatabaseHealthCheck>("Database", tags: ["database"]);
        }
    }

    internal static void AddServices(this IHostApplicationBuilder builder) {
        builder.Services.AddScoped<IJobService, JobService>();
        builder.Services.AddScoped<IJobStorage, JobStorage>();
        builder.Services.AddScoped<IJobEventPublisher, JobEventPublisher>();

        builder.Services.AddScoped<IAuditLogStorage, AuditLogStorage>();
        builder.Services.AddScoped<IAuditLogService, AuditLogService>();
        builder.Services.AddSingleton(sp => {
            var config = sp.GetRequiredService<IConfiguration>();
            return config is not IConfigurationRoot root
                ? throw new InvalidOperationException("Configuration root not available for source detection")
                : new ConfigurationSourceDetector(root);
        });
        builder.Services.AddSingleton<InternalConfigurationService>();
        builder.AddAuditLogging();

        builder.Services.AddAuthorizationBuilder()
            .AddPolicy("JobOwner", policy => policy.Requirements.Add(new JobOwnerRequirement()));
        builder.Services.AddScoped<IAuthorizationHandler, JobOwnerAuthorizationHandler>();

        builder.Services.AddSignalR();
    }

    internal static void MapApplicationEndpoints(this IEndpointRouteBuilder app) {
        app.MapJobEndpoints();
        app.MapConfigurationEndpoints();
        app.MapHub<JobHub>("/hubs/jobs");
    }
}
