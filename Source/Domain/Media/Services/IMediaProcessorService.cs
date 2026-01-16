using VttTools.AI.ServiceContracts;
using VttTools.Common.Model;

namespace VttTools.Media.Services;

public interface IMediaProcessorService {
    Task<byte[]?> GenerateThumbnailAsync(
        string contentType,
        Stream stream,
        int maxSize = 256,
        CancellationToken ct = default);

    Task<byte[]> ExtractPlaceholderAsync(
        string contentType,
        Stream stream,
        CancellationToken ct = default);

    Task<Stream> ConvertVideoAsync(
        Stream stream,
        CancellationToken ct = default);

    Task<(Size Dimensions, TimeSpan Duration)> ExtractMediaInfoAsync(
        string contentType,
        Stream stream,
        CancellationToken ct = default);

    Task<Stream> ConvertImageAsync(
        Stream stream,
        CancellationToken ct = default);

    Task<MediaAnalysisResult?> AnalyzeContentAsync(
        string contentType,
        Stream stream,
        string fileName,
        CancellationToken ct = default);
}
