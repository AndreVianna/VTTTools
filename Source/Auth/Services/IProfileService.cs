namespace VttTools.Auth.Services;

using VttTools.Auth.ApiContracts;

public interface IProfileService {
    Task<ProfileResponse> GetProfileAsync(Guid userId, CancellationToken ct = default);
    Task<ProfileResponse> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken ct = default);
    Task<ProfileResponse> UpdateAvatarAsync(Guid userId, Guid avatarResourceId, CancellationToken ct = default);
    Task<ProfileResponse> RemoveAvatarAsync(Guid userId, CancellationToken ct = default);
}