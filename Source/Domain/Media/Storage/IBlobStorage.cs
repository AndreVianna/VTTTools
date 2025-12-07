namespace VttTools.Media.Storage;

public interface IBlobStorage {
    Task<Result<string>> SaveAsync(string path, Stream content, ResourceMetadata metadata, CancellationToken ct = default);
    Task<Result<string>> SaveThumbnailAsync(string path, byte[] thumbnail, CancellationToken ct = default);
    Task<ResourceDownloadResult?> GetAsync(string path, CancellationToken ct = default);
    Task<Result> RemoveAsync(string path, CancellationToken ct = default);
}