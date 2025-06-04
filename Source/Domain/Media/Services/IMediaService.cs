namespace VttTools.Media.Services;

public interface IMediaService {
    Task<Result> SaveUploadedFileAsync(ResourceInfo file, Stream fileStream, string fileName, CancellationToken ct = default);
    Task<Result> DeleteFileAsync(string id, CancellationToken ct = default);
}