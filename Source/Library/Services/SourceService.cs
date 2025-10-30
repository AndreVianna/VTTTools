using Source = VttTools.Library.Scenes.Model.Source;

namespace VttTools.Library.Services;

public class SourceService(ISourceStorage storage)
    : ISourceService {
    public Task<List<Source>> GetSourcesAsync(Guid ownerId, int page, int pageSize, CancellationToken ct = default)
        => storage.GetByOwnerAsync(ownerId, page, pageSize, ct);

    public async Task<Source?> GetSourceByIdAsync(Guid id, Guid ownerId, CancellationToken ct = default) {
        var source = await storage.GetByIdAsync(id, ct);
        return source is null || source.OwnerId != ownerId ? null : source;
    }

    public async Task<Result<Source>> CreateSourceAsync(CreateSourceData data, Guid ownerId, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors)
            return result;

        var source = new Source {
            Id = Guid.CreateVersion7(),
            OwnerId = ownerId,
            Name = data.Name,
            Description = data.Description,
            SourceType = data.SourceType,
            DefaultRange = data.DefaultRange,
            DefaultIntensity = data.DefaultIntensity,
            DefaultIsGradient = data.DefaultIsGradient,
            CreatedAt = DateTime.UtcNow,
        };

        await storage.AddAsync(source, ct);
        return source;
    }

    public async Task<Result<Source>> UpdateSourceAsync(Guid id, UpdateSourceData data, Guid ownerId, CancellationToken ct = default) {
        var source = await storage.GetByIdAsync(id, ct);
        if (source is null)
            return Result.Failure("NotFound");
        if (source.OwnerId != ownerId)
            return Result.Failure("NotAllowed");

        var result = data.Validate();
        if (result.HasErrors)
            return result;

        source = source with {
            Name = data.Name,
            Description = data.Description,
            SourceType = data.SourceType,
            DefaultRange = data.DefaultRange,
            DefaultIntensity = data.DefaultIntensity,
            DefaultIsGradient = data.DefaultIsGradient,
        };

        await storage.UpdateAsync(source, ct);
        return source;
    }

    public async Task<Result> DeleteSourceAsync(Guid id, Guid ownerId, CancellationToken ct = default) {
        var source = await storage.GetByIdAsync(id, ct);
        if (source is null)
            return Result.Failure("NotFound");
        if (source.OwnerId != ownerId)
            return Result.Failure("NotAllowed");

        await storage.DeleteAsync(id, ct);
        return Result.Success();
    }
}