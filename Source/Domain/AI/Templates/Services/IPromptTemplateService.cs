namespace VttTools.AI.Templates.Services;

public interface IPromptTemplateService {
    Task<PromptTemplate?> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task<PromptTemplate?> GetLatestByNameAsync(string name, bool includeDrafts = false, CancellationToken ct = default);

    Task<(IReadOnlyList<PromptTemplate> Items, int TotalCount)> SearchAsync(PromptTemplateSearchFilters filters, CancellationToken ct = default);

    Task<Result<PromptTemplate>> CreateAsync(CreatePromptTemplateRequest request, CancellationToken ct = default);

    Task<Result<PromptTemplate>> UpdateAsync(Guid id, UpdatePromptTemplateRequest request, CancellationToken ct = default);

    Task<Result> DeleteAsync(Guid id, CancellationToken ct = default);

    string ResolveTemplate(string template, IReadOnlyDictionary<string, string> context);
}
