namespace VttTools.Media.Ingest;

/// <summary>
/// Service for coordinating AI image generation ingest for assets.
/// </summary>
public interface IIngestService {
    /// <summary>
    /// Start an ingest job to generate images for assets.
    /// </summary>
    /// <param name="data">The ingest data containing items to process.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>Result with job information.</returns>
    Task<Result<IngestJobResponse>> StartIngestAsync(StartIngestData data, CancellationToken ct = default);
}
