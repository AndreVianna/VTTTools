namespace VttTools.Admin.EndpointMappers;

public static class UserAdminEndpointsMapper {
    public static IEndpointRouteBuilder MapUserAdminEndpoints(this IEndpointRouteBuilder app) {
        var usersGroup = app.MapGroup("/api/admin/users")
            .RequireRateLimiting("admin");

        usersGroup.MapGet("/search", UserAdminHandlers.SearchUsersHandler)
            .WithName("SearchUsers")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        usersGroup.MapGet("/{userId:guid}", UserAdminHandlers.GetUserByIdHandler)
            .WithName("GetUserById")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        usersGroup.MapPost("/{userId:guid}/lock", UserAdminHandlers.LockUserHandler)
            .WithName("LockUser")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        usersGroup.MapPost("/{userId:guid}/unlock", UserAdminHandlers.UnlockUserHandler)
            .WithName("UnlockUser")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        usersGroup.MapPost("/{userId:guid}/verify-email", UserAdminHandlers.VerifyEmailHandler)
            .WithName("VerifyEmail")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        usersGroup.MapPost("/{userId:guid}/password-reset", UserAdminHandlers.SendPasswordResetHandler)
            .WithName("SendPasswordReset")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        usersGroup.MapPost("/{userId:guid}/roles", UserAdminHandlers.AssignRoleHandler)
            .WithName("AssignRole")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        usersGroup.MapDelete("/{userId:guid}/roles/{roleName}", UserAdminHandlers.RemoveRoleHandler)
            .WithName("RemoveRole")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        usersGroup.MapGet("/{userId:guid}/audit", UserAdminHandlers.GetUserAuditTrailHandler)
            .WithName("GetUserAuditTrail")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        usersGroup.MapGet("/stats", UserAdminHandlers.GetUserStatsHandler)
            .WithName("GetUserStats")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        return app;
    }
}
