namespace VttTools.AI.ServiceContracts;

public record MediaAnalysisRequest {
    public required string MediaType { get; init; }
    public List<byte[]>? Frames { get; init; }
    public byte[]? AudioData { get; init; }
    public required string FileName { get; init; }
}

public record MediaAnalysisResult {
    public string? SuggestedName { get; init; }
    public string? Description { get; init; }
    public string[]? Tags { get; init; }
}