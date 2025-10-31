namespace VttTools.Auth.Services;

public class ProfileService(
    UserManager<User> userManager,
    ILogger<ProfileService> logger) : IProfileService {

    public async Task<ProfileResponse> GetProfileAsync(Guid userId, CancellationToken ct = default) {
        try {
            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user is null) {
                logger.LogWarning("Profile request for non-existent user ID: {UserId}", userId);
                return new ProfileResponse {
                    Success = false,
                    Message = "User not found"
                };
            }

            logger.LogInformation("Profile retrieved for user: {UserId}, EmailConfirmed: {EmailConfirmed}", userId, user.EmailConfirmed);
            var response = MapUserToProfileResponse(user);
            logger.LogInformation("ProfileResponse: EmailConfirmed={EmailConfirmed}, Email={Email}", response.EmailConfirmed, response.Email);
            return response;
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error getting profile for user ID: {UserId}", userId);
            return new ProfileResponse {
                Success = false,
                Message = "Internal server error"
            };
        }
    }

    public async Task<ProfileResponse> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken ct = default) {
        try {
            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user is null) {
                logger.LogWarning("Profile update attempted for non-existent user ID: {UserId}", userId);
                return new ProfileResponse {
                    Success = false,
                    Message = "User not found"
                };
            }

            if (request.Name is not null) {
                user.Name = request.Name;
            }

            if (request.DisplayName is not null) {
                user.DisplayName = request.DisplayName;
            }

            if (request.Email is not null && request.Email != user.Email) {
                var existingUser = await userManager.FindByEmailAsync(request.Email);
                if (existingUser is not null) {
                    logger.LogWarning("Profile update failed - email already in use: {Email}", request.Email);
                    return new ProfileResponse {
                        Success = false,
                        Message = "Email address is already in use"
                    };
                }
                user.Email = request.Email;
                user.UserName = request.Email;
            }

            if (request.PhoneNumber is not null) {
                user.PhoneNumber = request.PhoneNumber;
            }

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded) {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                logger.LogWarning("Profile update failed for user {UserId}: {Errors}", userId, errors);
                return new ProfileResponse {
                    Success = false,
                    Message = errors
                };
            }

            logger.LogInformation("Profile updated successfully for user: {UserId}", userId);
            return MapUserToProfileResponse(user);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error updating profile for user ID: {UserId}", userId);
            return new ProfileResponse {
                Success = false,
                Message = "Internal server error"
            };
        }
    }

    public async Task<ProfileResponse> UpdateAvatarAsync(Guid userId, Guid avatarResourceId, CancellationToken ct = default) {
        try {
            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user is null) {
                logger.LogWarning("Avatar update attempted for non-existent user ID: {UserId}", userId);
                return new ProfileResponse {
                    Success = false,
                    Message = "User not found"
                };
            }

            user.AvatarResourceId = avatarResourceId;

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded) {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                logger.LogWarning("Avatar update failed for user {UserId}: {Errors}", userId, errors);
                return new ProfileResponse {
                    Success = false,
                    Message = errors
                };
            }

            logger.LogInformation("Avatar updated successfully for user: {UserId}", userId);
            return MapUserToProfileResponse(user);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error updating avatar for user ID: {UserId}", userId);
            return new ProfileResponse {
                Success = false,
                Message = "Internal server error"
            };
        }
    }

    public async Task<ProfileResponse> RemoveAvatarAsync(Guid userId, CancellationToken ct = default) {
        try {
            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user is null) {
                logger.LogWarning("Avatar removal attempted for non-existent user ID: {UserId}", userId);
                return new ProfileResponse {
                    Success = false,
                    Message = "User not found"
                };
            }

            user.AvatarResourceId = null;

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded) {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                logger.LogWarning("Avatar removal failed for user {UserId}: {Errors}", userId, errors);
                return new ProfileResponse {
                    Success = false,
                    Message = errors
                };
            }

            logger.LogInformation("Avatar removed successfully for user: {UserId}", userId);
            return MapUserToProfileResponse(user);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error removing avatar for user ID: {UserId}", userId);
            return new ProfileResponse {
                Success = false,
                Message = "Internal server error"
            };
        }
    }

    private static ProfileResponse MapUserToProfileResponse(User user)
        => new() {
            Id = user.Id,
            Name = user.Name,
            DisplayName = user.DisplayName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            EmailConfirmed = user.EmailConfirmed,
            PhoneNumber = user.PhoneNumber,
            AvatarResourceId = user.AvatarResourceId,
            AvatarUrl = user.AvatarResourceId.HasValue
                ? $"/api/resources/{user.AvatarResourceId.Value}"
                : null,
            Success = true,
            Message = null
        };
}