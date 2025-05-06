namespace VttTools.WebApp.Services;

public interface IGameService {
    Task<Adventure[]> GetAdventuresAsync();
    Task<Result<Adventure>> CreateAdventureAsync(CreateAdventureRequest request);
    Task<Result<Adventure>> CloneAdventureAsync(Guid id, CloneAdventureRequest request);
    Task<Result> UpdateAdventureAsync(Guid id, UpdateAdventureRequest request);
    Task<bool> DeleteAdventureAsync(Guid id);
    Task<Result<Episode>> CreateEpisodeAsync(Guid id, CreateEpisodeRequest request);
    Task<Result<Episode>> CloneEpisodeAsync(Guid id, AddClonedEpisodeRequest request);
    Task<bool> RemoveEpisodeAsync(Guid id, Guid episodeId);

    Task<Episode[]> GetEpisodesAsync(Guid id);
    Task<Result> UpdateEpisodeAsync(Guid id, UpdateEpisodeRequest request);

    Task<Asset[]> GetAssetsAsync();
    Task<Result<Asset>> CreateAssetAsync(CreateAssetRequest request);
    Task<Result> UpdateAssetAsync(Guid id, UpdateAssetRequest request);
    Task<bool> DeleteAssetAsync(Guid id);

    Task<MeetingModel[]> GetMeetingsAsync();
    Task<MeetingModel?> GetMeetingByIdAsync(Guid id);
    Task<Result<MeetingModel>> CreateMeetingAsync(CreateMeetingRequest request);
    Task<Result<MeetingModel>> UpdateMeetingAsync(Guid id, UpdateMeetingRequest request);
    Task<bool> DeleteMeetingAsync(Guid id);
    Task<bool> JoinMeetingAsync(Guid id);
    Task<bool> StartMeetingAsync(Guid id);
}