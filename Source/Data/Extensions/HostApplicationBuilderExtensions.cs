namespace VttTools.Data.Extensions;

public static class HostApplicationBuilderExtensions {
    public static void AddDataStorage(this IHostApplicationBuilder builder) {
        builder.Services.AddScoped<IMediaStorage, MediaStorage>();
        builder.Services.AddScoped<IAssetStorage, AssetStorage>();
        builder.Services.AddScoped<IBarrierStorage, BarrierStorage>();
        builder.Services.AddScoped<IRegionStorage, RegionStorage>();
        builder.Services.AddScoped<ISourceStorage, SourceStorage>();
        builder.Services.AddScoped<IAdventureStorage, AdventureStorage>();
        builder.Services.AddScoped<ISceneStorage, SceneStorage>();
        builder.Services.AddScoped<IGameSessionStorage, GameSessionStorage>();
    }
}