namespace VttTools.AI.PromptEnhancement;

public interface IPromptEnhancementService {
    Task<Result<PromptEnhancementResponse>> EnhanceAsync(
        PromptEnhancementRequest request,
        CancellationToken ct = default);
}
