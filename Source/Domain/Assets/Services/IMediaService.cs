namespace VttTools.Assets.Services;

public interface IMediaService {
    Task<string> UploadImageAsync(Stream imageStream, string fileName, CancellationToken ct = default);
    Task DeleteImageAsync(string imageUrl, CancellationToken ct = default);
}