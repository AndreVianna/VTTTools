namespace VttTools.Admin.Library.Services;

public interface ILibraryConfigService {
    Task<LibraryConfigResponse> GetConfigAsync(CancellationToken ct = default);
}