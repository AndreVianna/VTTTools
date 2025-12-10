namespace VttTools.AI.Services;

public class TextGenerationService(
    IAiProviderFactory providerFactory,
    IPromptTemplateStorage templateStorage,
    IPromptTemplateService templateService)
    : ITextGenerationService {

    public async Task<Result<TextGenerationResponse>> GenerateAsync(
        TextGenerationData data,
        CancellationToken ct = default) {
        var validation = data.Validate();
        if (validation.HasErrors)
            return Result.Failure<TextGenerationResponse>(null!, validation.Errors);

        var resolvedData = data;

        if (!string.IsNullOrWhiteSpace(data.TemplateName)) {
            var templateResult = await ResolveTemplateAsync(data, ct);
            if (!templateResult.IsSuccessful)
                return Result.Failure<TextGenerationResponse>(null!, templateResult.Errors);
            resolvedData = templateResult.Value;
        }

        var provider = providerFactory.GetTextProvider(resolvedData.Provider);
        return await provider.GenerateAsync(resolvedData, ct);
    }

    public Task<IReadOnlyList<AiProviderType>> GetAvailableProvidersAsync(CancellationToken ct = default)
        => Task.FromResult(providerFactory.GetAvailableTextProviders());

    private async Task<Result<TextGenerationData>> ResolveTemplateAsync(
        TextGenerationData data,
        CancellationToken ct) {
        var template = await templateStorage.GetLatestByNameAsync(data.TemplateName!, includeDrafts: false, ct);
        if (template is null)
            return Result.Failure<TextGenerationData>(null!, $"Template '{data.TemplateName}' not found.");

        var context = data.TemplateContext ?? [];
        context["prompt"] = data.Prompt;

        var resolvedUserPrompt = templateService.ResolveTemplate(template.UserPromptTemplate, context);
        var resolvedSystemPrompt = !string.IsNullOrWhiteSpace(template.SystemPrompt)
            ? templateService.ResolveTemplate(template.SystemPrompt, context)
            : data.SystemPrompt;

        return Result.Success(data with {
            Prompt = resolvedUserPrompt,
            SystemPrompt = resolvedSystemPrompt,
            Category = data.Category ?? template.Category,
        });
    }
}
