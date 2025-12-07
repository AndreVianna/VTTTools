namespace VttTools.AI.Providers;

public interface IVideoProvider {
    AiProviderType ProviderType { get; }
    Task<Result<byte[]>> GenerateAsync(VideoGenerationRequest request, CancellationToken ct = default);
}
