namespace VttTools.Game.Extensions;

internal static class HostApplicationBuilderExtensions {
    internal static void AddStorage(this IHostApplicationBuilder builder) {
        builder.AddSqlServerDbContext<ApplicationDbContext>(ApplicationDbContextOptions.ConnectionStringName);
        builder.AddAzureBlobClient(AzureStorageOptions.ConnectionStringName);
        builder.AddGameDataStorage();
    }

    internal static void AddServices(this IHostApplicationBuilder builder)
        => builder.Services.AddScoped<IGameSessionService, GameSessionService>();
}