namespace VttTools.Library.Stages.Storage;

public interface IStageStorage {
    Task<(Stage[] Items, int TotalCount)> SearchAsync(Guid masterUserId, LibrarySearchFilter filter, CancellationToken ct = default);
    Task<Stage[]> GetAllAsync(CancellationToken ct = default);
    Task<Stage[]> GetManyAsync(string filterDefinition, CancellationToken ct = default);
    Task<Stage?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Stage stage, CancellationToken ct = default);
    Task<bool> UpdateAsync(Stage stage, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Check if a resource is used by any stage other than the specified one.
    /// Checks MainBackground, AlternateBackground, and AmbientSound settings.
    /// </summary>
    Task<bool> IsResourceInUseAsync(Guid resourceId, Guid excludeStageId, CancellationToken ct = default);
}