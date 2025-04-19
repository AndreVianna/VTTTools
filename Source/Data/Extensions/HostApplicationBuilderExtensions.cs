namespace VttTools.Data.Extensions;

public static class HostApplicationBuilderExtensions {
    public static void AddGameDataStorage(this IHostApplicationBuilder builder) {
        builder.Services.AddScoped<IAdventureStorage, AdventureStorage>();
        builder.Services.AddScoped<IEpisodeStorage, EpisodeStorage>();
        builder.Services.AddScoped<IMeetingStorage, MeetingStorage>();
    }
}