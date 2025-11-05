namespace VttTools.Auth.Services;

public interface IProfileService {
    Task<ProfileResponse> GetProfileAsync(Guid userId, CancellationToken ct = default);
    Task<ProfileResponse> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken ct = default);
    Task<ProfileResponse> UpdateAvatarAsync(Guid userId, Guid avatarId, CancellationToken ct = default);
    Task<ProfileResponse> RemoveAvatarAsync(Guid userId, CancellationToken ct = default);
}