namespace VttTools.AI.Storage;

public interface IPromptTemplateStorage {
    Task<PromptTemplate?> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task<PromptTemplate?> GetLatestByNameAsync(string name, bool includeDrafts = false, CancellationToken ct = default);

    Task<(IReadOnlyList<PromptTemplate> Items, int TotalCount)> SearchAsync(PromptTemplateSearchFilters filters, CancellationToken ct = default);

    Task<PromptTemplate> AddAsync(PromptTemplate template, CancellationToken ct = default);

    Task<PromptTemplate> UpdateAsync(PromptTemplate template, CancellationToken ct = default);

    Task DeleteAsync(Guid id, CancellationToken ct = default);

    Task<bool> ExistsAsync(string name, string version, CancellationToken ct = default);
}
