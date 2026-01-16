namespace VttTools.Media.ServiceContracts;

public sealed record ResourceFilterResponse {
    public required ResourceMetadata[] Items { get; init; }
    public required int TotalCount { get; init; }
    public int? MaxVideoDurationMs { get; init; }
    public int? MaxAudioDurationMs { get; init; }
}
