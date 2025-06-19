namespace VttTools.Media.ApiContracts;

public record UploadRequest {
    public Guid Id { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Resource { get; init; } = string.Empty;
    public IFormFile File { get; init; } = null!;
}
