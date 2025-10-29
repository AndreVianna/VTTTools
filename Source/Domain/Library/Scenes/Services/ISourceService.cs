using Source = VttTools.Library.Scenes.Model.Source;

namespace VttTools.Library.Scenes.Services;

public interface ISourceService {
    Task<List<Source>> GetSourcesAsync(Guid ownerId, int page, int pageSize, CancellationToken ct = default);
    Task<Source?> GetSourceByIdAsync(Guid id, Guid ownerId, CancellationToken ct = default);
    Task<Result<Source>> CreateSourceAsync(CreateSourceData data, Guid ownerId, CancellationToken ct = default);
    Task<Result<Source>> UpdateSourceAsync(Guid id, UpdateSourceData data, Guid ownerId, CancellationToken ct = default);
    Task<Result> DeleteSourceAsync(Guid id, Guid ownerId, CancellationToken ct = default);
}
