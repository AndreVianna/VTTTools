namespace VttTools.AssetImageManager.Application.Services;

public interface IEntityLoaderService {
    Task<EntityLoadResult> LoadAndValidateAsync(
        string inputPath,
        EntityOutputOptions? options = null,
        CancellationToken ct = default);
}
