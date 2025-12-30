using VttTools.Data.Library.Encounters;
using VttTools.Data.Library.Stages;
using VttTools.Data.Library.Worlds;

namespace VttTools.Data.Extensions;

public static class HostApplicationBuilderExtensions {
    public static void AddDataStorage(this IHostApplicationBuilder builder) {
        builder.Services.AddScoped<IMediaStorage, MediaStorage>();
        builder.Services.AddScoped<IAssetStorage, AssetStorage>();
        builder.Services.AddScoped<IAdventureStorage, AdventureStorage>();
        builder.Services.AddScoped<IEncounterStorage, EncounterStorage>();
        builder.Services.AddScoped<IStageStorage, StageStorage>();
        builder.Services.AddScoped<IWorldStorage, WorldStorage>();
        builder.Services.AddScoped<ICampaignStorage, CampaignStorage>();
        builder.Services.AddScoped<IGameSessionStorage, GameSessionStorage>();
        builder.Services.AddScoped<IContentQueryStorage, ContentQueryStorage>();
    }
}