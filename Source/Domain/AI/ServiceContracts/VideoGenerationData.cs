namespace VttTools.AI.ServiceContracts;

public sealed record VideoGenerationData
    : Data {
    public required string Provider { get; init; }
    public required string Model { get; init; }
    public required string Prompt { get; init; }
    public TimeSpan? Duration { get; init; }
    public string AspectRatio { get; init; } = "16:9";
    public byte[]? ReferenceImage { get; init; }
}
