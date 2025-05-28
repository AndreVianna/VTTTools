namespace VttTools.Media.Services;

public interface IMediaService {
    Task<Result> SaveUploadedFileAsync(string type, Guid id, ResourceFileInfo file, Stream fileStream, CancellationToken ct = default);
    Task<Result> DeleteFileAsync(string type, Guid id, CancellationToken ct = default);
}