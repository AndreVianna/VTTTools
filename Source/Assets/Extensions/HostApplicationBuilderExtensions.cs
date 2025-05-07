namespace VttTools.Assets.Extensions;

internal static class HostApplicationBuilderExtensions {
    internal static void AddStorage(this IHostApplicationBuilder builder) {
        builder.AddSqlServerDbContext<ApplicationDbContext>(ApplicationDbContextOptions.ConnectionStringName);
        builder.AddGameDataStorage();
    }

    internal static void AddServices(this IHostApplicationBuilder builder) {
        builder.Services.AddScoped<IAssetService, AssetService>();
        builder.Services.AddScoped<IMediaService, MediaService>();
    }
}