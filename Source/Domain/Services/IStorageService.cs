
namespace Domain.Services;

public interface IStorageService {
    Task<string> UploadImageAsync(Stream imageStream, string fileName, CancellationToken ct = default);
    Task DeleteImageAsync(string imageUrl, CancellationToken ct = default);
}
