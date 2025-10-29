using Source = VttTools.Library.Scenes.Model.Source;

namespace VttTools.Library.Scenes.Storage;

public interface ISourceStorage {
    Task<List<Source>> GetByOwnerAsync(Guid ownerId, int page, int pageSize, CancellationToken ct = default);
    Task<Source?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Source source, CancellationToken ct = default);
    Task<bool> UpdateAsync(Source source, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}
