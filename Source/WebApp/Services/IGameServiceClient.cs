namespace VttTools.WebApp.Services;

public interface IGameServiceClient {
    Task<Adventure[]> GetAdventuresAsync();
    Task<Result<Adventure>> CreateAdventureAsync(CreateAdventureRequest request);
    Task<Result<Adventure>> CloneAdventureAsync(Guid id, CloneAdventureRequest request);
    Task<Result> UpdateAdventureAsync(Guid id, UpdateAdventureRequest request);
    Task<bool> DeleteAdventureAsync(Guid id);

    Task<Episode[]> GetEpisodesAsync(Guid adventureId);
    Task<Result<Episode>> CreateEpisodeAsync(CreateEpisodeRequest request);
    Task<Result<Episode>> CloneEpisodeAsync(Guid id, CloneEpisodeRequest request);
    Task<Result> UpdateEpisodeAsync(Guid id, UpdateEpisodeRequest request);
    Task<bool> DeleteEpisodeAsync(Guid id);

    Task<Asset[]> GetAssetsAsync();
    Task<Result<Asset>> CreateAssetAsync(CreateAssetRequest request);
    Task<Result> UpdateAssetAsync(Guid id, UpdateAssetRequest request);
    Task<bool> DeleteAssetAsync(Guid id);

    Task<Meeting[]> GetMeetingsAsync();
    Task<Meeting?> GetMeetingByIdAsync(Guid id);
    Task<Result<Meeting>> CreateMeetingAsync(CreateMeetingRequest request);
    Task<bool> UpdateMeetingAsync(Guid id, UpdateMeetingRequest request);
    Task<bool> DeleteMeetingAsync(Guid id);
    Task<bool> JoinMeetingAsync(Guid id);
    Task<bool> StartMeetingAsync(Guid id);
}