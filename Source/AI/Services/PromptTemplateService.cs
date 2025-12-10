using System.Text.RegularExpressions;

namespace VttTools.AI.Services;

public partial class PromptTemplateService(IPromptTemplateStorage storage)
    : IPromptTemplateService {

    public Task<PromptTemplate?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => storage.GetByIdAsync(id, ct);

    public Task<PromptTemplate?> GetLatestByNameAsync(string name, bool includeDrafts = false, CancellationToken ct = default)
        => storage.GetLatestByNameAsync(name, includeDrafts, ct);

    public Task<(IReadOnlyList<PromptTemplate> Items, int TotalCount)> SearchAsync(PromptTemplateSearchFilters filters, CancellationToken ct = default)
        => storage.SearchAsync(filters, ct);

    public async Task<Result<PromptTemplate>> CreateAsync(CreatePromptTemplateRequest request, CancellationToken ct = default) {
        var version = request.Version ?? "1.0-draft";
        if (await storage.ExistsAsync(request.Name, version, ct)) {
            return Result.Failure<PromptTemplate>(null!, $"A template with name '{request.Name}' and version '{version}' already exists.");
        }

        var template = new PromptTemplate {
            Name = request.Name,
            Category = request.Category,
            Version = version,
            SystemPrompt = request.SystemPrompt,
            UserPromptTemplate = request.UserPromptTemplate,
            NegativePromptTemplate = request.NegativePromptTemplate,
            ReferenceImageId = request.ReferenceImageId,
        };

        await storage.AddAsync(template, ct);
        return Result.Success(template);
    }

    public async Task<Result<PromptTemplate>> UpdateAsync(Guid id, UpdatePromptTemplateRequest request, CancellationToken ct = default) {
        var existing = await storage.GetByIdAsync(id, ct);
        if (existing is null) {
            return Result.Failure<PromptTemplate>(null!, $"Template with ID {id} not found.");
        }

        if (request.Version is not null && request.Version != existing.Version) {
            if (await storage.ExistsAsync(existing.Name, request.Version, ct)) {
                return Result.Failure<PromptTemplate>(null!, $"A template with name '{existing.Name}' and version '{request.Version}' already exists.");
            }
        }

        var updated = existing with {
            Version = request.Version ?? existing.Version,
            SystemPrompt = request.SystemPrompt ?? existing.SystemPrompt,
            UserPromptTemplate = request.UserPromptTemplate ?? existing.UserPromptTemplate,
            NegativePromptTemplate = request.NegativePromptTemplate ?? existing.NegativePromptTemplate,
            ReferenceImageId = request.ReferenceImageId ?? existing.ReferenceImageId,
        };

        await storage.UpdateAsync(updated, ct);
        return Result.Success(updated);
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken ct = default) {
        var existing = await storage.GetByIdAsync(id, ct);
        if (existing is null) {
            return Result.Failure($"Template with ID {id} not found.");
        }

        await storage.DeleteAsync(id, ct);
        return Result.Success();
    }

    public string ResolveTemplate(string template, IReadOnlyDictionary<string, string> context)
        => string.IsNullOrWhiteSpace(template)
            ? template
            : TemplateVariableRegex().Replace(template, match => {
                var variableName = match.Groups[1].Value;
                var defaultValue = match.Groups[3].Value;

                return context.TryGetValue(variableName, out var value) && !string.IsNullOrEmpty(value)
                    ? value
                    : !string.IsNullOrEmpty(defaultValue) ? defaultValue : match.Value;
            });

    [GeneratedRegex(@"\{(\w+)(:([^}]*))?\}", RegexOptions.Compiled)]
    private static partial Regex TemplateVariableRegex();
}
