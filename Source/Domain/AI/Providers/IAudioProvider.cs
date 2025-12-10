namespace VttTools.AI.Providers;

public interface IAudioProvider {
    AiProviderType ProviderType { get; }
    Task<Result<byte[]>> GenerateAsync(AudioGenerationData data, CancellationToken ct = default);
}
