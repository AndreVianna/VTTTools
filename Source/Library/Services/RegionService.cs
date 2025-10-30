using Region = VttTools.Library.Scenes.Model.Region;

namespace VttTools.Library.Services;

public class RegionService(IRegionStorage storage)
    : IRegionService {
    public Task<List<Region>> GetRegionsAsync(Guid ownerId, int page, int pageSize, CancellationToken ct = default)
        => storage.GetByOwnerAsync(ownerId, page, pageSize, ct);

    public async Task<Region?> GetRegionByIdAsync(Guid id, Guid ownerId, CancellationToken ct = default) {
        var region = await storage.GetByIdAsync(id, ct);
        return region is null || region.OwnerId != ownerId ? null : region;
    }

    public async Task<Result<Region>> CreateRegionAsync(CreateRegionData data, Guid ownerId, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors)
            return result;

        var region = new Region {
            Id = Guid.CreateVersion7(),
            OwnerId = ownerId,
            Name = data.Name,
            Description = data.Description,
            RegionType = data.RegionType,
            LabelMap = data.LabelMap.AsReadOnly(),
            CreatedAt = DateTime.UtcNow,
        };

        await storage.AddAsync(region, ct);
        return region;
    }

    public async Task<Result<Region>> UpdateRegionAsync(Guid id, UpdateRegionData data, Guid ownerId, CancellationToken ct = default) {
        var region = await storage.GetByIdAsync(id, ct);
        if (region is null)
            return Result.Failure("NotFound");
        if (region.OwnerId != ownerId)
            return Result.Failure("NotAllowed");

        var result = data.Validate();
        if (result.HasErrors)
            return result;

        region = region with {
            Name = data.Name,
            Description = data.Description,
            RegionType = data.RegionType,
            LabelMap = data.LabelMap.AsReadOnly(),
        };

        await storage.UpdateAsync(region, ct);
        return region;
    }

    public async Task<Result> DeleteRegionAsync(Guid id, Guid ownerId, CancellationToken ct = default) {
        var region = await storage.GetByIdAsync(id, ct);
        if (region is null)
            return Result.Failure("NotFound");
        if (region.OwnerId != ownerId)
            return Result.Failure("NotAllowed");

        await storage.DeleteAsync(id, ct);
        return Result.Success();
    }
}