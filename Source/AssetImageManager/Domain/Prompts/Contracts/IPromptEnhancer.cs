namespace VttTools.AssetImageManager.Domain.Prompts.Contracts;

public interface IPromptEnhancer {
    Task<PromptEnhancerResponse> EnhancePromptAsync(
        string imageType,
        Asset entity,
        int tokenIndex = 0,
        CancellationToken ct = default);
}
