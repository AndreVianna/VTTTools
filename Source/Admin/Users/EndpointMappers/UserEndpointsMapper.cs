namespace VttTools.Admin.Users.EndpointMappers;

public static class UserEndpointsMapper {
    public static IEndpointRouteBuilder MapUserEndpoints(this IEndpointRouteBuilder app) {
        var usersGroup = app.MapGroup("/api/admin/users")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        usersGroup.MapGet("/search", UserHandlers.SearchHandler)
            .WithName("Search")
            .RequireRateLimiting("read");

        usersGroup.MapGet("/{userId:guid}", UserHandlers.GetByIdHandler)
            .WithName("GetById")
            .RequireRateLimiting("read");

        usersGroup.MapPost("/{userId:guid}/lock", UserHandlers.LockHandler)
            .WithName("Lock")
            .RequireRateLimiting("write");

        usersGroup.MapPost("/{userId:guid}/unlock", UserHandlers.UnlockHandler)
            .WithName("Unlock")
            .RequireRateLimiting("write");

        usersGroup.MapPost("/{userId:guid}/verify-email", UserHandlers.VerifyEmailHandler)
            .WithName("VerifyEmail")
            .RequireRateLimiting("write");

        usersGroup.MapPost("/{userId:guid}/password-reset", UserHandlers.SendPasswordResetHandler)
            .WithName("SendPasswordReset")
            .RequireRateLimiting("sensitive");

        usersGroup.MapPost("/{userId:guid}/roles", UserHandlers.AssignRoleHandler)
            .WithName("AssignRole")
            .RequireRateLimiting("write");

        usersGroup.MapDelete("/{userId:guid}/roles/{roleName}", UserHandlers.RevokeRoleHandler)
            .WithName("RevokeRole")
            .RequireRateLimiting("write");

        usersGroup.MapGet("/{userId:guid}/audit", UserHandlers.GetAuditTrailHandler)
            .WithName("GetAuditTrail")
            .RequireRateLimiting("read");

        usersGroup.MapGet("summary", UserHandlers.GetSummaryHandler)
            .WithName("GetSummary")
            .RequireRateLimiting("read");

        return app;
    }
}