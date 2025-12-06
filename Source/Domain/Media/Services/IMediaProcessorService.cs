namespace VttTools.Media.Services;

public interface IMediaProcessorService {
    Task<Result<ProcessedMedia>> ProcessAsync(
        ResourceType type,
        Stream input,
        string contentType,
        string fileName,
        CancellationToken ct = default);

    Task<byte[]?> GenerateThumbnailAsync(
        Stream input,
        string contentType,
        int maxSize = 256,
        CancellationToken ct = default);
}