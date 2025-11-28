namespace VttTools.Domain.Admin.Services;

public interface ILibraryConfigService {
    Task<LibraryConfigResponse> GetConfigAsync(CancellationToken ct = default);
}
