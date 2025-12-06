namespace VttTools.Admin.Services;

public sealed class LibraryConfigService(
    IOptions<PublicLibraryOptions> options,
    ILogger<LibraryConfigService> logger) : ILibraryConfigService {

    private readonly Guid _masterUserId = options.Value.MasterUserId;

    public Task<LibraryConfigResponse> GetConfigAsync(CancellationToken ct = default) {
        try {
            logger.LogInformation("Retrieving library configuration");

            return Task.FromResult(new LibraryConfigResponse {
                MasterUserId = _masterUserId
            });
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving library configuration");
            throw;
        }
    }
}