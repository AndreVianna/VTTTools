using Region = VttTools.Library.Scenes.Model.Region;

namespace VttTools.Library.Scenes.Services;

public interface IRegionService {
    Task<List<Region>> GetRegionsAsync(Guid ownerId, int page, int pageSize, CancellationToken ct = default);
    Task<Region?> GetRegionByIdAsync(Guid id, Guid ownerId, CancellationToken ct = default);
    Task<Result<Region>> CreateRegionAsync(CreateRegionData data, Guid ownerId, CancellationToken ct = default);
    Task<Result<Region>> UpdateRegionAsync(Guid id, UpdateRegionData data, Guid ownerId, CancellationToken ct = default);
    Task<Result> DeleteRegionAsync(Guid id, Guid ownerId, CancellationToken ct = default);
}