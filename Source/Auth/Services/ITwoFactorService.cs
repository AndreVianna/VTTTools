namespace VttTools.Auth.Services;

using VttTools.Auth.ApiContracts;
using VttTools.Common.ApiContracts;

public interface ITwoFactorService {
    Task<TwoFactorSetupResponse> InitiateSetupAsync(Guid userId, CancellationToken ct = default);
    Task<TwoFactorVerifyResponse> VerifySetupAsync(Guid userId, VerifySetupRequest request, CancellationToken ct = default);
    Task<TwoFactorDisableResponse> DisableTwoFactorAsync(Guid userId, DisableTwoFactorRequest request, CancellationToken ct = default);
}
