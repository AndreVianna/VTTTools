namespace VttTools.AI.Services;

public interface IPromptEnhancementService {
    Task<Result<PromptEnhancementResponse>> EnhanceAsync(PromptEnhancementData data, CancellationToken ct = default);
}
