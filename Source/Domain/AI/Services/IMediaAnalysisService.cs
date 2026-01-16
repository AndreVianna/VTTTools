namespace VttTools.AI.Services;

public interface IMediaAnalysisService {
    Task<Result<MediaAnalysisResult>> AnalyzeAsync(MediaAnalysisRequest request, CancellationToken ct = default);
}
