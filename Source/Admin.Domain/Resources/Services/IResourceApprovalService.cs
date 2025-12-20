namespace VttTools.Admin.Resources.Services;

public interface IResourceApprovalService {
    Task<Result<Guid>> ApproveAsync(ApproveResourceData data, CancellationToken ct = default);
    Task<Result<Guid>> RegenerateAsync(RegenerateResourceData data, CancellationToken ct = default);
    Task<Result> RejectAsync(RejectResourceData data, CancellationToken ct = default);
}
