namespace VttTools.Auth.Services;

public class ProfileService(
    IUserStorage userStorage,
    ILogger<ProfileService> logger) : IProfileService {

    public async Task<ProfileResponse> GetProfileAsync(Guid userId, CancellationToken ct = default) {
        try {
            var user = await userStorage.FindByIdAsync(userId, ct);
            if (user is null) {
                logger.LogWarning("Profile request for non-existent user ID: {UserId}", userId);
                return new() { Success = false, Message = "User not found" };
            }

            logger.LogInformation("Profile retrieved for user: {UserId}, EmailConfirmed: {EmailConfirmed}", userId, user.EmailConfirmed);
            return MapUserToProfileResponse(user);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error getting profile for user ID: {UserId}", userId);
            return new() { Success = false, Message = "Internal server error" };
        }
    }

    public async Task<ProfileResponse> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken ct = default) {
        try {
            var user = await userStorage.FindByIdAsync(userId, ct);
            if (user is null) {
                logger.LogWarning("Profile update attempted for non-existent user ID: {UserId}", userId);
                return new() { Success = false, Message = "User not found" };
            }

            if (request.Email is not null && request.Email != user.Email) {
                var existingUser = await userStorage.FindByEmailAsync(request.Email, ct);
                if (existingUser is not null) {
                    logger.LogWarning("Profile update failed - email already in use: {Email}", request.Email);
                    return new() { Success = false, Message = "Email address is already in use" };
                }
            }

            var updatedUser = user with {
                Name = request.Name ?? user.Name,
                DisplayName = request.DisplayName ?? user.DisplayName,
                Email = request.Email ?? user.Email,
                UnitSystem = request.PreferredUnitSystem ?? user.UnitSystem,
            };

            var result = await userStorage.UpdateAsync(updatedUser, ct);
            if (!result.IsSuccessful) {
                var errors = string.Join(", ", result.Errors.Select(e => e.Message));
                logger.LogWarning("Profile update failed for user {UserId}: {Errors}", userId, errors);
                return new() { Success = false, Message = errors };
            }

            var refreshedUser = await userStorage.FindByIdAsync(userId, ct);
            logger.LogInformation("Profile updated successfully for user: {UserId}", userId);
            return MapUserToProfileResponse(refreshedUser!);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error updating profile for user ID: {UserId}", userId);
            return new() { Success = false, Message = "Internal server error" };
        }
    }

    public async Task<ProfileResponse> UpdateAvatarAsync(Guid userId, Guid avatarId, CancellationToken ct = default) {
        try {
            var user = await userStorage.FindByIdAsync(userId, ct);
            if (user is null) {
                logger.LogWarning("Avatar update attempted for non-existent user ID: {UserId}", userId);
                return new() { Success = false, Message = "User not found" };
            }

            var updatedUser = user with { AvatarId = avatarId };

            var result = await userStorage.UpdateAsync(updatedUser, ct);
            if (!result.IsSuccessful) {
                var errors = string.Join(", ", result.Errors.Select(e => e.Message));
                logger.LogWarning("Avatar update failed for user {UserId}: {Errors}", userId, errors);
                return new() { Success = false, Message = errors };
            }

            var refreshedUser = await userStorage.FindByIdAsync(userId, ct);
            logger.LogInformation("Avatar updated successfully for user: {UserId}", userId);
            return MapUserToProfileResponse(refreshedUser!);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error updating avatar for user ID: {UserId}", userId);
            return new() { Success = false, Message = "Internal server error" };
        }
    }

    public async Task<ProfileResponse> RemoveAvatarAsync(Guid userId, CancellationToken ct = default) {
        try {
            var user = await userStorage.FindByIdAsync(userId, ct);
            if (user is null) {
                logger.LogWarning("Avatar removal attempted for non-existent user ID: {UserId}", userId);
                return new() { Success = false, Message = "User not found" };
            }

            var updatedUser = user with { AvatarId = null };

            var result = await userStorage.UpdateAsync(updatedUser, ct);
            if (!result.IsSuccessful) {
                var errors = string.Join(", ", result.Errors.Select(e => e.Message));
                logger.LogWarning("Avatar removal failed for user {UserId}: {Errors}", userId, errors);
                return new() { Success = false, Message = errors };
            }

            var refreshedUser = await userStorage.FindByIdAsync(userId, ct);
            logger.LogInformation("Avatar removed successfully for user: {UserId}", userId);
            return MapUserToProfileResponse(refreshedUser!);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error removing avatar for user ID: {UserId}", userId);
            return new() { Success = false, Message = "Internal server error" };
        }
    }

    private static ProfileResponse MapUserToProfileResponse(User user)
        => new() {
            Id = user.Id,
            Name = user.Name,
            DisplayName = user.DisplayName,
            Email = user.Email,
            EmailConfirmed = user.EmailConfirmed,
            PhoneNumber = null,
            AvatarId = user.AvatarId,
            AvatarUrl = user.AvatarId.HasValue ? $"/api/resources/{user.AvatarId.Value}" : null,
            PreferredUnitSystem = user.UnitSystem,
            Success = true,
            Message = null,
        };
}
