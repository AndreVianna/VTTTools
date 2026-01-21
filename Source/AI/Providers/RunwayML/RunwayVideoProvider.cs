namespace VttTools.AI.Providers.RunwayML;

public sealed class RunwayVideoProvider : IVideoProvider {
    public string Name => "RunwayML";

    public Task<Result<byte[]>> GenerateAsync(VideoGenerationData data, CancellationToken ct = default)
        => throw new NotImplementedException("RunwayML video generation provider is not yet implemented.");
}