using System.Text.RegularExpressions;

using VttTools.Media.Storage;

namespace VttTools.AI.Services;

public partial class PromptTemplateService(IPromptTemplateStorage storage, IMediaStorage mediaStorage)
    : IPromptTemplateService {

    public Task<PromptTemplate?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => storage.GetByIdAsync(id, ct);

    public Task<PromptTemplate?> GetLatestByNameAsync(string name, bool includeDrafts = false, CancellationToken ct = default)
        => storage.GetLatestByNameAsync(name, includeDrafts, ct);

    public Task<(IReadOnlyList<PromptTemplate> Items, int TotalCount)> SearchAsync(PromptTemplateSearchFilters filters, CancellationToken ct = default)
        => storage.SearchAsync(filters, ct);

    public async Task<Result<PromptTemplate>> CreateAsync(CreatePromptTemplateData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors)
            return result;

        var version = data.Version ?? "1.0-draft";
        if (await storage.ExistsAsync(data.Name, version, ct))
            return Result.Failure<PromptTemplate>(null!, $"A template with name '{data.Name}' and version '{version}' already exists.");

        var referenceImage = data.ReferenceImageId.HasValue
            ? await mediaStorage.FindByIdAsync(data.ReferenceImageId.Value, ct)
            : null;

        var template = new PromptTemplate {
            Name = data.Name,
            Category = data.Category,
            Version = version,
            SystemPrompt = data.SystemPrompt,
            UserPromptTemplate = data.UserPromptTemplate,
            NegativePromptTemplate = data.NegativePromptTemplate,
            ReferenceImage = referenceImage,
        };

        await storage.AddAsync(template, ct);
        return Result.Success(template);
    }

    public async Task<Result<PromptTemplate>> UpdateAsync(Guid id, UpdatePromptTemplateData data, CancellationToken ct = default) {
        var existing = await storage.GetByIdAsync(id, ct);
        if (existing is null)
            return Result.Failure<PromptTemplate>(null!, $"Template with ID {id} not found.");

        var result = data.Validate();
        if (result.HasErrors)
            return result;

        if (data.Version.IsSet && data.Version.Value != existing.Version) {
            if (await storage.ExistsAsync(existing.Name, data.Version.Value, ct))
                return Result.Failure<PromptTemplate>(null!, $"A template with name '{existing.Name}' and version '{data.Version.Value}' already exists.");
        }

        var referenceImage = data.ReferenceImageId.IsSet
            ? data.ReferenceImageId.Value.HasValue
                ? await mediaStorage.FindByIdAsync(data.ReferenceImageId.Value.Value, ct)
                : null
            : existing.ReferenceImage;

        var updated = existing with {
            Version = data.Version.IsSet ? data.Version.Value : existing.Version,
            SystemPrompt = data.SystemPrompt.IsSet ? data.SystemPrompt.Value : existing.SystemPrompt,
            UserPromptTemplate = data.UserPromptTemplate.IsSet ? data.UserPromptTemplate.Value : existing.UserPromptTemplate,
            NegativePromptTemplate = data.NegativePromptTemplate.IsSet ? data.NegativePromptTemplate.Value : existing.NegativePromptTemplate,
            ReferenceImage = referenceImage,
        };

        await storage.UpdateAsync(updated, ct);
        return Result.Success(updated);
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken ct = default) {
        var existing = await storage.GetByIdAsync(id, ct);
        if (existing is null)
            return Result.Failure($"Template with ID {id} not found.");

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
