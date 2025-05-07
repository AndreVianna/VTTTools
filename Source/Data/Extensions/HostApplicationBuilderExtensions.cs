namespace VttTools.Data.Extensions;

public static class HostApplicationBuilderExtensions {
    public static void AddGameDataStorage(this IHostApplicationBuilder builder) {
        builder.Services.AddScoped<IAssetStorage, AssetStorage>();
        builder.Services.AddScoped<IAdventureStorage, AdventureStorage>();
        builder.Services.AddScoped<ISceneStorage, SceneStorage>();
        builder.Services.AddScoped<IGameSessionStorage, GameSessionStorage>();
    }
}