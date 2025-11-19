namespace VttTools.AssetImageManager.Domain.Prompts.Contracts;

public interface IPromptEnhancer {
    Task<PromptEnhancerResponse> EnhancePromptAsync(
        EntityDefinition entity,
        StructuralVariant variant,
        string imageType,
        CancellationToken ct = default);
}
