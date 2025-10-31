namespace VttTools.Auth.Services;

using VttTools.Auth.ApiContracts;

public interface IRecoveryCodeService {
    Task<GenerateRecoveryCodesResponse> GenerateNewCodesAsync(Guid userId, GenerateRecoveryCodesRequest request, CancellationToken ct = default);
    Task<RecoveryCodesStatusResponse> GetStatusAsync(Guid userId, CancellationToken ct = default);
}
