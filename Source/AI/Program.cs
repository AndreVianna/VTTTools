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
        builder.AddRateLimiting();
        builder.AddServices();

        var app = builder.Build();
        app.ApplyRequiredConfiguration(app.Environment);
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseRateLimiter();
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

        builder.Services.AddScoped<IAiProviderConfigStorage, ProviderStorage>();
        builder.Services.AddMemoryCache();

        builder.Services.Configure<JobProcessingOptions>(
            builder.Configuration.GetSection(JobProcessingOptions.SectionName));
        builder.Services.AddSingleton(Channel.CreateUnbounded<Guid>());
        builder.Services.AddScoped<IAiJobOrchestrationService, AiJobOrchestrationService>();
        builder.Services.AddSingleton<BulkAssetGenerationHandler>();
        builder.Services.AddHostedService<AiJobProcessingService>();

        builder.Services.AddHttpClient<JobsServiceClient>(c => c.BaseAddress = new Uri("https+http://jobs-api"));
        builder.Services.AddHttpClient<ResourceServiceClient>(c => c.BaseAddress = new Uri("https+http://resources-api"));
        builder.Services.AddHttpClient<AssetServiceClient>(c => c.BaseAddress = new Uri("https+http://assets-api"));
    }

    internal static void AddRateLimiting(this IHostApplicationBuilder builder)
        => builder.Services.AddRateLimiter(options => {
            options.AddSlidingWindowLimiter("admin", rateLimiterOptions => {
                rateLimiterOptions.PermitLimit = 30;
                rateLimiterOptions.Window = TimeSpan.FromMinutes(1);
                rateLimiterOptions.SegmentsPerWindow = 6;
                rateLimiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                rateLimiterOptions.QueueLimit = 5;
            });

            options.OnRejected = async (context, cancellationToken) => {
                context.HttpContext.Response.StatusCode = 429;
                await context.HttpContext.Response.WriteAsync("Rate limit exceeded. Please try again later.", cancellationToken);
            };
        });

    internal static void MapApplicationEndpoints(this IEndpointRouteBuilder app) {
        app.MapAiEndpoints();
        app.MapAiJobEndpoints();
    }
}
