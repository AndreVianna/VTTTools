namespace VttTools.AI.Providers;

public interface IVideoProvider {
    AiProviderType ProviderType { get; }
    Task<Result<byte[]>> GenerateAsync(VideoGenerationData data, CancellationToken ct = default);
}
