namespace VttTools.AI.Mocks;

public class MockVideoProvider : IVideoProvider {
    public string Name { get; set; } = "RunwayML";
    public byte[] VideoDataToReturn { get; set; } = [0x00, 0x00, 0x00, 0x18];
    public string? ErrorToReturn { get; set; }
    public VideoGenerationData? LastRequest { get; private set; }

    public Task<Result<byte[]>> GenerateAsync(VideoGenerationData data, CancellationToken ct = default) {
        LastRequest = data;
        return Task.FromResult(ErrorToReturn != null
            ? Result.Failure<byte[]>(null!, ErrorToReturn)
            : Result.Success(VideoDataToReturn));
    }
}