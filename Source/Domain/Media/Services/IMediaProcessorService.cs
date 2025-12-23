namespace VttTools.Media.Services;

public interface IMediaProcessorService {
    Task<Result<ProcessedMedia>> ProcessAsync(
        ResourceRole role,
        string contentType,
        string fileName,
        Stream stream,
        CancellationToken ct = default);
}