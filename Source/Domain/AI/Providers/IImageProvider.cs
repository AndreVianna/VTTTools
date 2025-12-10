namespace VttTools.AI.Providers;

public interface IImageProvider {
    AiProviderType ProviderType { get; }
    Task<Result<byte[]>> GenerateAsync(ImageGenerationData data, CancellationToken ct = default);
}
