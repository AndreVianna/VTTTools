namespace VttTools.AI;

[ExcludeFromCodeCoverage]
internal static class Program {
    public static void Main(string[] args) {
        var builder = WebApplication.CreateBuilder(args);
        builder.Host.VerifyDependencies();
        builder.AddServiceDiscovery();
        builder.AddRequiredServices();
        builder.AddStorage();
        builder.AddJwtAuthentication();
        builder.AddConfigurableRateLimiting("write");
        builder.AddServices();

        var app = builder.Build();
        app.ApplyRequiredConfiguration(app.Environment);
        app.UseRateLimiter();
        app.UseAuditLogging();
        app.MapDefaultEndpoints();
        app.MapApplicationEndpoints();

        app.Run();
    }

    internal static void AddStorage(this IHostApplicationBuilder builder) {
        builder.AddNpgsqlDbContext<ApplicationDbContext>(ApplicationDbContextOptions.ConnectionStringName);
        builder.AddDataStorage();
        // Note: Database health is monitored by Aspire at the infrastructure level
    }

    internal static void AddServices(this IHostApplicationBuilder builder) {
        builder.Services.Configure<AiOptions>(
            builder.Configuration.GetSection(AiOptions.SectionName));
        builder.AddAiServices();

        builder.Services.AddScoped<IPromptTemplateStorage, PromptTemplateStorage>();
        builder.Services.AddScoped<IPromptTemplateService, PromptTemplateService>();

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
    }

    internal static void MapApplicationEndpoints(this IEndpointRouteBuilder app) {
        app.MapAiEndpoints();
    }
}
