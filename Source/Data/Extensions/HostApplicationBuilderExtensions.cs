namespace VttTools.Data.Extensions;

public static class HostApplicationBuilderExtensions {
    public static void AddDataStorage(this IHostApplicationBuilder builder) {
        builder.Services.AddScoped<IMediaStorage, MediaStorage>();
        builder.Services.AddScoped<IAssetStorage, AssetStorage>();
        builder.Services.AddScoped<IAdventureStorage, AdventureStorage>();
        builder.Services.AddScoped<ISceneStorage, SceneStorage>();
        builder.Services.AddScoped<IEpicStorage, EpicStorage>();
        builder.Services.AddScoped<ICampaignStorage, CampaignStorage>();
        builder.Services.AddScoped<IGameSessionStorage, GameSessionStorage>();
    }
}