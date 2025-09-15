using VttTools.Media.Contracts;

namespace VttTools.Media.ApiContracts;

public record UploadRequest {
    public Guid Id { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Resource { get; init; } = string.Empty;

    public IFileData File { get; init; } = null!;
}