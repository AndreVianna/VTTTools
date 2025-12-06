namespace VttTools.Media.Storage;

public interface IBlobStorage {
    Task<Result<string>> UploadAsync(string path, Stream content, BlobMetadata metadata, CancellationToken ct = default);
    Task<Result<string>> UploadThumbnailAsync(string path, byte[] thumbnail, CancellationToken ct = default);
    Task<BlobDownloadResult?> DownloadAsync(string path, CancellationToken ct = default);
    Task<Result> DeleteAsync(string path, CancellationToken ct = default);
}

public record BlobMetadata {
    public string ContentType { get; init; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
    public long FileLength { get; init; }
    public int Width { get; init; }
    public int Height { get; init; }
    public TimeSpan Duration { get; init; }
    public Guid OwnerId { get; init; }
}

public record BlobDownloadResult {
    public required Stream Content { get; init; }
    public string ContentType { get; init; } = string.Empty;
    public IDictionary<string, string>? Metadata { get; init; }
}
