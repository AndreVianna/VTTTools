namespace VttTools.Admin.Handlers;

public static class UserAdminHandlers {
    public static async Task<IResult> SearchUsersHandler(
        [FromQuery] int skip,
        [FromQuery] int take,
        [FromQuery] string? search,
        [FromQuery] string? role,
        [FromQuery] string? status,
        [FromQuery] string? sortBy,
        [FromQuery] string? sortOrder,
        IUserAdminService service,
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

            var response = await service.SearchUsersAsync(request, ct);
            return Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while searching users");
        }
    }

    public static async Task<IResult> GetUserByIdHandler(
        Guid userId,
        IUserAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.GetUserByIdAsync(userId, ct);

            return response is null ? Results.NotFound() : Results.Ok(response);
        }
        catch (UserNotFoundException) {
            return Results.NotFound();
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while retrieving user details");
        }
    }

    public static async Task<IResult> LockUserHandler(
        Guid userId,
        ClaimsPrincipal user,
        IUserAdminService service,
        CancellationToken ct) {
        try {
            var adminUserIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminUserIdClaim) || !Guid.TryParse(adminUserIdClaim, out var adminUserId)) {
                return Results.BadRequest(new { error = "Invalid user claims" });
            }

            if (userId == adminUserId) {
                return Results.BadRequest(new { error = "Cannot modify your own account" });
            }

            var response = await service.LockUserAsync(userId, ct);

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

    public static async Task<IResult> UnlockUserHandler(
        Guid userId,
        IUserAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.UnlockUserAsync(userId, ct);

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
        IUserAdminService service,
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
        IUserAdminService service,
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
        IUserAdminService service,
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

    public static async Task<IResult> RemoveRoleHandler(
        Guid userId,
        string roleName,
        ClaimsPrincipal user,
        IUserAdminService service,
        CancellationToken ct) {
        try {
            var adminUserIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminUserIdClaim) || !Guid.TryParse(adminUserIdClaim, out var adminUserId)) {
                return Results.BadRequest(new { error = "Invalid user claims" });
            }

            var response = await service.RemoveRoleAsync(userId, roleName, adminUserId, ct);

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

    public static async Task<IResult> GetUserAuditTrailHandler(
        Guid userId,
        [FromQuery] int page,
        [FromQuery] int pageSize,
        IUserAdminService service,
        CancellationToken ct) {
        try {
            if (page < 1) {
                return Results.BadRequest(new { error = "Page must be greater than 0" });
            }

            if (pageSize is < 1 or > 100) {
                return Results.BadRequest(new { error = "PageSize must be between 1 and 100" });
            }

            var response = await service.GetUserAuditTrailAsync(userId, page, pageSize, ct);
            return Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while retrieving audit trail");
        }
    }

    public static async Task<IResult> GetUserStatsHandler(
        IUserAdminService service,
        CancellationToken ct) {
        try {
            var response = await service.GetUserStatsAsync(ct);
            return Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while retrieving user statistics");
        }
    }
}
