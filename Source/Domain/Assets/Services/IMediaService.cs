namespace VttTools.Assets.Services;

public interface IMediaService {
    Task<Result> UploadImageAsync(Guid id, string fileName, Stream imageStream, CancellationToken ct = default);
    Task<Result> DeleteImageAsync(Guid id, CancellationToken ct = default);
}