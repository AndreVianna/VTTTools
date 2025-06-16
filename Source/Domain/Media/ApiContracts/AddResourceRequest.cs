namespace VttTools.Media.ApiContracts;

public record AddResourceRequest {
    public string Path { get; init; } = string.Empty;
    public Stream Stream { get; init; } = null!;
    public ResourceMetadata Content { get; init; } = new();
    public string[] Tags { get; init; } = [];
}