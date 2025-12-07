namespace VttTools.AI.Providers;

public interface IAudioProvider {
    AiProviderType ProviderType { get; }
    Task<Result<byte[]>> GenerateAsync(AudioGenerationRequest request, CancellationToken ct = default);
}
