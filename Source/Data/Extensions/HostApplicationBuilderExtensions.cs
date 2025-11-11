namespace VttTools.Data.Extensions;

public static class HostApplicationBuilderExtensions {
    public static void AddDataStorage(this IHostApplicationBuilder builder) {
        builder.Services.AddScoped<IMediaStorage, MediaStorage>();
        builder.Services.AddScoped<IAssetStorage, AssetStorage>();
        builder.Services.AddScoped<IAdventureStorage, AdventureStorage>();
        builder.Services.AddScoped<IEncounterStorage, EncounterStorage>();
        builder.Services.AddScoped<IWorldStorage, WorldStorage>();
        builder.Services.AddScoped<ICampaignStorage, CampaignStorage>();
        builder.Services.AddScoped<IGameSessionStorage, GameSessionStorage>();
    }
}