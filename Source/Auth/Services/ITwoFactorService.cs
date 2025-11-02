namespace VttTools.Auth.Services;

public interface ITwoFactorService {
    Task<TwoFactorSetupResponse> InitiateSetupAsync(Guid userId, CancellationToken ct = default);
    Task<TwoFactorVerifyResponse> VerifySetupAsync(Guid userId, VerifySetupRequest request, CancellationToken ct = default);
    Task<TwoFactorDisableResponse> DisableTwoFactorAsync(Guid userId, DisableTwoFactorRequest request, CancellationToken ct = default);
}