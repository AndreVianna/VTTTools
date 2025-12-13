namespace VttTools.Media.Services;

public interface IMediaProcessorService {
    Task<Result<ProcessedMedia>> ProcessAsync(
        ResourceType resourceType,
        string contentType,
        string fileName,
        Stream stream,
        CancellationToken ct = default);

    Task<byte[]?> GenerateThumbnailAsync(
        string contentType,
        Stream stream,
        int maxSize = 256,
        CancellationToken ct = default);
}