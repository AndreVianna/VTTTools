namespace VttTools.AI.Providers.RunwayML;

public sealed class RunwayVideoProvider : IVideoProvider {
    public AiProviderType ProviderType => AiProviderType.RunwayML;

    public Task<Result<byte[]>> GenerateAsync(VideoGenerationRequest request, CancellationToken ct = default)
        => throw new NotImplementedException("RunwayML video generation provider is not yet implemented.");
}
