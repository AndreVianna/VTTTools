using VttTools.Media.Authorization;
using VttTools.Media.Ingest.Clients;
using VttTools.Media.Ingest.EndpointMappers;
using VttTools.Media.Ingest.Services;
using IAiGenerationClient = VttTools.Media.Ingest.Clients.IAiGenerationClient;
using AiGenerationClient = VttTools.Media.Ingest.Clients.AiGenerationClient;
using IJobsServiceClient = VttTools.Media.Ingest.Clients.IJobsServiceClient;
using JobsServiceClient = VttTools.Media.Ingest.Clients.JobsServiceClient;
using VttTools.Utilities;

namespace VttTools.Media;

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
        builder.AddNpgsqlDbContext<ApplicationDbContext>(ApplicationDbContextOptions.ConnectionStringName);
        builder.AddDataStorage();
        builder.AddAzureBlobServiceClient(AzureStorageOptions.ConnectionStringName);
        // Note: Database and Blob Storage health are monitored by Aspire at the infrastructure level
    }

    internal static void AddServices(this IHostApplicationBuilder builder) {
        builder.Services.AddSignalR();
        builder.Services.AddScoped<IAuthorizationHandler, ResourceOwnerAuthorizationHandler>();
        builder.Services.AddScoped<IBlobStorage, AzureBlobStorage>();
        builder.Services.AddScoped<IResourceService, ResourceService>();
        builder.Services.AddScoped<IMediaProcessorService, MediaProcessorService>();
        builder.Services.AddScoped<IMediaEventPublisher, MediaEventPublisher>();
        builder.Services.AddScoped<IAuditLogStorage, AuditLogStorage>();
        builder.Services.AddScoped<IAuditLogService, AuditLogService>();
        builder.Services.AddSingleton<MediaProcessingQueue>();
        builder.Services.AddHostedService<MediaProcessingWorker>();

        // Ingest services
        builder.Services.AddSingleton<IngestProcessingQueue>();
        builder.Services.AddHostedService<IngestProcessingWorker>();
        builder.Services.AddScoped<IIngestService, IngestService>();
        builder.Services.AddScoped<IAiGenerationClient, AiGenerationClient>();
        builder.Services.AddScoped<IJobsServiceClient, JobsServiceClient>();
        builder.Services.AddScoped<VttTools.Media.Ingest.Clients.IAssetsServiceClient, VttTools.Media.Ingest.Clients.AssetsServiceClient>();
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
        app.MapResourcesEndpoints();
        app.MapConfigurationEndpoints();
        app.MapIngestEndpoints();
        app.MapHub<MediaHub>("/hubs/media");
    }
}