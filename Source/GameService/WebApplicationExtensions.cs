// ReSharper disable once CheckNamespace
namespace Microsoft.AspNetCore.Builder;

internal static class WebApplicationExtensions {
    public static void MapGameSessionManagementEndpoints(this WebApplication app) {
        var sessions = app.MapGroup("/api/sessions")
            .RequireAuthorization();

        // Create a new game session
        sessions.MapPost("/", async (
            [FromBody] CreateSessionRequest request,
            ClaimsPrincipal principal,
            [FromServices] ISessionService sessionService) => {
                var userId = GetUserId(principal);
                var session = await sessionService.CreateSessionAsync(request.Name, userId);
                return Results.Created($"/api/sessions/{session.Id}", session);
            });

        // Get sessions for the current principal
        sessions.MapGet("/", async (
            ClaimsPrincipal principal,
            [FromServices] ISessionService sessionService) => {
                var userId = GetUserId(principal);
                var userSessions = await sessionService.GetUserSessionsAsync(userId);
                return Results.Ok(userSessions);
            });

        // Get specific session
        sessions.MapGet("/{id:guid}", async (
            Guid id,
            [FromServices] ISessionService sessionService) => {
                var session = await sessionService.GetSessionAsync(id);
                return session != null
                    ? Results.Ok(session)
                    : Results.NotFound();
            });

        // Update session
        sessions.MapPut("/{id:guid}", async (
            Guid id,
            [FromBody] UpdateSessionRequest request,
            ClaimsPrincipal _,
            [FromServices] ISessionService sessionService) => {
                try {
                    await sessionService.UpdateSessionAsync(id, request.Name);
                    return Results.NoContent();
                }
                catch (KeyNotFoundException) {
                    return Results.NotFound();
                }
                catch (UnauthorizedAccessException) {
                    return Results.Forbid();
                }
            });

        // Delete session
        sessions.MapDelete("/{id:guid}", async (
            Guid id,
            ClaimsPrincipal principal,
            [FromServices] ISessionService sessionService) => {
                try {
                    var userId = GetUserId(principal);
                    await sessionService.DeleteSessionAsync(id, userId);
                    return Results.NoContent();
                }
                catch (KeyNotFoundException) {
                    return Results.NotFound();
                }
                catch (UnauthorizedAccessException) {
                    return Results.Forbid();
                }
            });

        // Join session
        sessions.MapPost("/{id:guid}/join", async (
            Guid id,
            [FromBody] JoinSessionRequest request,
            ClaimsPrincipal principal,
            [FromServices] ISessionService sessionService) => {
                try {
                    var userId = GetUserId(principal);
                    await sessionService.JoinSessionAsync(id, userId, request.Role);
                    return Results.NoContent();
                }
                catch (KeyNotFoundException) {
                    return Results.NotFound();
                }
            });

        // Leave session
        sessions.MapPost("/{id:guid}/leave", async (
            Guid id,
            ClaimsPrincipal principal,
            [FromServices] ISessionService sessionService) => {
                try {
                    var userId = GetUserId(principal);
                    await sessionService.LeaveSessionAsync(id, userId);
                    return Results.NoContent();
                }
                catch (KeyNotFoundException) {
                    return Results.NotFound();
                }
                catch (InvalidOperationException ex) {
                    return Results.BadRequest(ex.Message);
                }
            });

        // Set active map
        sessions.MapPost("/{id:guid}/maps/{map:int}/activate", async (
            Guid id,
            int map,
            ClaimsPrincipal _,
            [FromServices] ISessionService sessionService) => {
                try {
                    await sessionService.SetActiveMapAsync(id, map);
                    return Results.NoContent();
                }
                catch (KeyNotFoundException ex) when (ex.Message.Contains("Session")) {
                    return Results.NotFound("Session not found");
                }
                catch (KeyNotFoundException) {
                    return Results.NotFound("Map not found in this session");
                }
            });

        // Start session
        sessions.MapPost("/{id:guid}/start", async (
            Guid id,
            ClaimsPrincipal principal,
            [FromServices] ISessionService sessionService) => {
                try {
                    var userId = GetUserId(principal);
                    await sessionService.StartSessionAsync(id, userId);
                    return Results.NoContent();
                }
                catch (KeyNotFoundException) {
                    return Results.NotFound();
                }
                catch (UnauthorizedAccessException) {
                    return Results.Forbid();
                }
            });
    }

    private static Guid GetUserId(ClaimsPrincipal principal) {
        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userIdClaim?.Value, out var userId)
                   ? userId
                   : throw new UnauthorizedAccessException("Invalid principal ID");
    }
}

// Request DTOs
public record CreateSessionRequest(string Name);
public record UpdateSessionRequest(string Name);
public record JoinSessionRequest(PlayerType Role = PlayerType.Player);
