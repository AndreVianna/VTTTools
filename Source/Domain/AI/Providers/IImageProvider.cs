namespace VttTools.AI.Providers;

public interface IImageProvider {
    AiProviderType ProviderType { get; }
    Task<Result<byte[]>> GenerateAsync(ImageGenerationRequest request, CancellationToken ct = default);
}
