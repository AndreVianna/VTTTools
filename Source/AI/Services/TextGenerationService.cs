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

        var resolvedData = ResolveProviderAndModel(data);

        if (!string.IsNullOrWhiteSpace(resolvedData.TemplateName)) {
            var templateResult = await ResolveTemplateAsync(resolvedData, ct);
            if (!templateResult.IsSuccessful)
                return Result.Failure<TextGenerationResponse>(null!, templateResult.Errors);
            resolvedData = templateResult.Value;
        }

        var provider = providerFactory.GetTextProvider(resolvedData.Provider);
        return await provider.GenerateAsync(resolvedData, ct);
    }

    public IReadOnlyList<string> GetAvailableProviders()
        => providerFactory.GetAvailableTextProviders();

    private TextGenerationData ResolveProviderAndModel(TextGenerationData data) {
        if (!string.IsNullOrEmpty(data.Provider) && !string.IsNullOrEmpty(data.Model))
            return data;

        (var provider, var model) = providerFactory.GetProviderAndModel(data.ContentType);
        return data with {
            Provider = data.Provider ?? provider,
            Model = data.Model ?? model,
        };
    }

    private async Task<Result<TextGenerationData>> ResolveTemplateAsync(
        TextGenerationData data,
        CancellationToken ct) {
        var template = await templateStorage.GetLatestByNameAsync(data.TemplateName!, includeDrafts: false, ct);
        if (template is null)
            return Result.Failure($"Template '{data.TemplateName}' not found.").WithNo<TextGenerationData>();

        var context = data.TemplateContext ?? [];
        context["prompt"] = data.Prompt;

        var resolvedUserPrompt = templateService.ResolveTemplate(template.UserPromptTemplate, context);
        var resolvedSystemPrompt = !string.IsNullOrWhiteSpace(template.SystemPrompt)
            ? templateService.ResolveTemplate(template.SystemPrompt, context)
            : data.SystemPrompt;

        return Result.Success(data with {
            Prompt = resolvedUserPrompt,
            SystemPrompt = resolvedSystemPrompt,
            ContentType = data.ContentType,
        });
    }
}
