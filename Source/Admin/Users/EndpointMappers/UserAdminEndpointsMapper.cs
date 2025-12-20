namespace VttTools.Admin.Users.EndpointMappers;

public static class UserAdminEndpointsMapper {
    public static IEndpointRouteBuilder MapUserAdminEndpoints(this IEndpointRouteBuilder app) {
        var usersGroup = app.MapGroup("/api/admin/users")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        usersGroup.MapGet("/search", UserAdminHandlers.SearchUsersHandler)
            .WithName("SearchUsers")
            .RequireRateLimiting("read");

        usersGroup.MapGet("/{userId:guid}", UserAdminHandlers.GetUserByIdHandler)
            .WithName("GetUserById")
            .RequireRateLimiting("read");

        usersGroup.MapPost("/{userId:guid}/lock", UserAdminHandlers.LockUserHandler)
            .WithName("LockUser")
            .RequireRateLimiting("write");

        usersGroup.MapPost("/{userId:guid}/unlock", UserAdminHandlers.UnlockUserHandler)
            .WithName("UnlockUser")
            .RequireRateLimiting("write");

        usersGroup.MapPost("/{userId:guid}/verify-email", UserAdminHandlers.VerifyEmailHandler)
            .WithName("VerifyEmail")
            .RequireRateLimiting("write");

        usersGroup.MapPost("/{userId:guid}/password-reset", UserAdminHandlers.SendPasswordResetHandler)
            .WithName("SendPasswordReset")
            .RequireRateLimiting("sensitive");

        usersGroup.MapPost("/{userId:guid}/roles", UserAdminHandlers.AssignRoleHandler)
            .WithName("AssignRole")
            .RequireRateLimiting("write");

        usersGroup.MapDelete("/{userId:guid}/roles/{roleName}", UserAdminHandlers.RemoveRoleHandler)
            .WithName("RemoveRole")
            .RequireRateLimiting("write");

        usersGroup.MapGet("/{userId:guid}/audit", UserAdminHandlers.GetUserAuditTrailHandler)
            .WithName("GetUserAuditTrail")
            .RequireRateLimiting("read");

        usersGroup.MapGet("/stats", UserAdminHandlers.GetUserStatsHandler)
            .WithName("GetUserStats")
            .RequireRateLimiting("read");

        return app;
    }
}