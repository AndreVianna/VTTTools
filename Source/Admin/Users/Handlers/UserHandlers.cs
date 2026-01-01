using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Admin.Users.Handlers;

public static class UserHandlers {
    public static async Task<IResult> SearchHandler(
        [FromQuery] int skip,
        [FromQuery] int take,
        [FromQuery] string? search,
        [FromQuery] string? role,
        [FromQuery] string? status,
        [FromQuery] string? sortBy,
        [FromQuery] string? sortOrder,
        IUserService service,
        CancellationToken ct) {
        try {
            var request = new UserSearchRequest {
                Skip = skip,
                Take = take,
                Search = search,
                Role = role,
                Status = status,
                SortBy = sortBy,
                SortOrder = sortOrder
            };

            var response = await service.SearchAsync(request, ct);
            return Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while searching users");
        }
    }

    public static async Task<IResult> GetByIdHandler(
        Guid userId,
        IUserService service,
        CancellationToken ct) {
        try {
            var response = await service.GetByIdAsync(userId, ct);

            return response is null ? Results.NotFound() : Results.Ok(response);
        }
        catch (UserNotFoundException) {
            return Results.NotFound();
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while retrieving user details");
        }
    }

    public static async Task<IResult> LockHandler(
        Guid userId,
        ClaimsPrincipal user,
        IUserService service,
        CancellationToken ct) {
        try {
            var adminUserIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminUserIdClaim) || !Guid.TryParse(adminUserIdClaim, out var adminUserId)) {
                return Results.BadRequest(new { error = "Invalid user claims" });
            }

            if (userId == adminUserId) {
                return Results.BadRequest(new { error = "Cannot modify your own account" });
            }

            var response = await service.LockAsync(userId, ct);

            return !response.Success ? Results.BadRequest(new { error = "Failed to lock user account" }) : Results.Ok(response);
        }
        catch (CannotModifySelfException) {
            return Results.BadRequest(new { error = "Cannot modify your own account" });
        }
        catch (LastAdminException) {
            return Results.BadRequest(new { error = "Cannot lock the last administrator account" });
        }
        catch (UserNotFoundException) {
            return Results.NotFound();
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while locking the user account");
        }
    }

    public static async Task<IResult> UnlockHandler(
        Guid userId,
        IUserService service,
        CancellationToken ct) {
        try {
            var response = await service.UnlockAsync(userId, ct);

            return !response.Success ? Results.BadRequest(new { error = "Failed to unlock user account" }) : Results.Ok(response);
        }
        catch (UserNotFoundException) {
            return Results.NotFound();
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while unlocking the user account");
        }
    }

    public static async Task<IResult> VerifyEmailHandler(
        Guid userId,
        IUserService service,
        CancellationToken ct) {
        try {
            var response = await service.VerifyEmailAsync(userId, ct);

            return !response.Success ? Results.BadRequest(new { error = "Failed to verify email" }) : Results.Ok(response);
        }
        catch (UserNotFoundException) {
            return Results.NotFound();
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while verifying email");
        }
    }

    public static async Task<IResult> SendPasswordResetHandler(
        Guid userId,
        IUserService service,
        CancellationToken ct) {
        try {
            var response = await service.SendPasswordResetAsync(userId, ct);
            return Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while sending password reset");
        }
    }

    public static async Task<IResult> AssignRoleHandler(
        Guid userId,
        [FromBody] AssignRoleRequest request,
        ClaimsPrincipal user,
        IUserService service,
        CancellationToken ct) {
        try {
            var adminUserIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminUserIdClaim) || !Guid.TryParse(adminUserIdClaim, out var adminUserId)) {
                return Results.BadRequest(new { error = "Invalid user claims" });
            }

            var response = await service.AssignRoleAsync(userId, request.RoleName, adminUserId, ct);

            return !response.Success ? Results.BadRequest(new { error = "Failed to assign role" }) : Results.Ok(response);
        }
        catch (CannotModifySelfException) {
            return Results.BadRequest(new { error = "Cannot modify your own roles" });
        }
        catch (ArgumentException ex) {
            return Results.BadRequest(new { error = ex.Message });
        }
        catch (UserNotFoundException) {
            return Results.NotFound();
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while assigning role");
        }
    }

    public static async Task<IResult> RevokeRoleHandler(
        Guid userId,
        string roleName,
        ClaimsPrincipal user,
        IUserService service,
        CancellationToken ct) {
        try {
            var adminUserIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminUserIdClaim) || !Guid.TryParse(adminUserIdClaim, out var adminUserId)) {
                return Results.BadRequest(new { error = "Invalid user claims" });
            }

            var response = await service.RevokeRoleAsync(userId, roleName, adminUserId, ct);

            return !response.Success ? Results.BadRequest(new { error = "Failed to remove role" }) : Results.Ok(response);
        }
        catch (CannotModifySelfException) {
            return Results.BadRequest(new { error = "Cannot modify your own roles" });
        }
        catch (LastAdminException) {
            return Results.BadRequest(new { error = "Cannot remove the last administrator role" });
        }
        catch (UserNotFoundException) {
            return Results.NotFound();
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while removing role");
        }
    }

    public static async Task<IResult> GetAuditTrailHandler(
        Guid userId,
        [FromQuery] int page,
        [FromQuery] int pageSize,
        IUserService service,
        CancellationToken ct) {
        try {
            if (page < 1) {
                return Results.BadRequest(new { error = "Page must be greater than 0" });
            }

            if (pageSize is < 1 or > 100) {
                return Results.BadRequest(new { error = "PageSize must be between 1 and 100" });
            }

            var response = await service.GetAuditTrailAsync(userId, page, pageSize, ct);
            return Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while retrieving audit trail");
        }
    }

    public static async Task<IResult> GetSummaryHandler(
        IUserService service,
        CancellationToken ct) {
        try {
            var response = await service.GetSummaryAsync(ct);
            return Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while retrieving user statistics");
        }
    }
}