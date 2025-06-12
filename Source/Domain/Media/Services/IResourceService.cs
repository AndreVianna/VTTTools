namespace VttTools.Media.Services;

public interface IResourceService {
    Task<Result> SaveResourceAsync(Resource resource, Stream stream, CancellationToken ct = default);
    Task<Result> DeleteResourceAsync(string id, CancellationToken ct = default);
    Task<StreamData?> ServeResourceAsync(string id, CancellationToken ct = default);
}