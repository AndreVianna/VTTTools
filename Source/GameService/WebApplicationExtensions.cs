// ReSharper disable once CheckNamespace
namespace Microsoft.AspNetCore.Builder;

internal static class WebApplicationExtensions {
    public static void MapGameSessionManagementEndpoints(this WebApplication app) {
        var sessions = app.MapGroup("/api/sessions")
                          .RequireAuthorization();

        sessions.MapPost("/", async (
            HttpContext context,
            [FromBody] CreateSessionRequest request,
            [FromServices] ISessionService sessionService) => {
                var userId = GetUserId(context.User);
                var data = new CreateSessionData {
                    Name = request.Name,
                };
                var result = await sessionService.CreateSessionAsync(userId, data);
                return result.IsSuccessful
                           ? Results.Created($"/api/sessions/{result.Value.Id}", result.Value)
                           : Results.ValidationProblem(result.Errors.GroupedBySource());
            });

        sessions.MapGet("/", async (
            HttpContext context,
            [FromServices] ISessionService sessionService) => {
                var userId = GetUserId(context.User);
                var userSessions = await sessionService.GetSessionsAsync(userId);
                return Results.Ok(userSessions);
            });

        sessions.MapGet("/{id:guid}", async (
            HttpContext context,
            [FromRoute] Guid id,
            [FromServices] ISessionService sessionService) => {
                var userId = GetUserId(context.User);
                var session = await sessionService.GetSessionAsync(userId, id);
                return session != null
                    ? Results.Ok(session)
                    : Results.NotFound();
            });

        sessions.MapPut("/{id:guid}", async (
            HttpContext context,
            [FromRoute] Guid id,
            [FromBody] UpdateSessionRequest request,
            [FromServices] ISessionService sessionService) => {
                try {
                    var userId = GetUserId(context.User);
                    var data = new UpdateSessionData {
                        Name = request.Name,
                    };
                    var result = await sessionService.UpdateSessionAsync(userId, id, data);
                    return result.Status switch {
                        HttpStatusCode.BadRequest => Results.ValidationProblem(result.Errors.GroupedBySource()),
                        _ => Results.StatusCode((int)result.Status),
                    };
                }
                catch (Exception ex) {
                    return Results.InternalServerError(ex);
                }
            });

        sessions.MapDelete("/{id:guid}", async (
            HttpContext context,
            [FromRoute] Guid id,
            [FromServices] ISessionService sessionService) => {
                try {
                    var userId = GetUserId(context.User);
                    var result = await sessionService.DeleteSessionAsync(userId, id);
                    return result.Status switch {
                        HttpStatusCode.BadRequest => Results.ValidationProblem(result.Errors.GroupedBySource()),
                        _ => Results.StatusCode((int)result.Status),
                    };
                }
                catch (Exception ex) {
                    return Results.InternalServerError(ex);
                }
            });

        sessions.MapPost("/{id:guid}/join", async (
            HttpContext context,
            [FromRoute] Guid id,
            [FromBody] JoinSessionRequest request,
            [FromServices] ISessionService sessionService) => {
                try {
                    var userId = GetUserId(context.User);
                    var result = await sessionService.JoinSessionAsync(userId, id, request.JoinAs);
                    return result.Status switch {
                        HttpStatusCode.BadRequest => Results.ValidationProblem(result.Errors.GroupedBySource()),
                        _ => Results.StatusCode((int)result.Status),
                    };
                }
                catch (Exception ex) {
                    return Results.InternalServerError(ex);
                }
            });

        sessions.MapPost("/{id:guid}/leave", async (
            HttpContext context,
            [FromRoute] Guid id,
            [FromServices] ISessionService sessionService) => {
                try {
                    var userId = GetUserId(context.User);
                    var result = await sessionService.LeaveSessionAsync(userId, id);
                    return Results.StatusCode((int)result.Status);
                }
                catch (Exception ex) {
                    return Results.InternalServerError(ex);
                }
            });

        sessions.MapPost("/{id:guid}/maps/{map:int}/activate", async (
            HttpContext context,
            [FromRoute] Guid id,
            [FromRoute] int map,
            [FromServices] ISessionService sessionService) => {
                try {
                    var userId = GetUserId(context.User);
                    var result = await sessionService.SetActiveMapAsync(userId, id, map);
                    return result.Status switch {
                        HttpStatusCode.BadRequest => Results.ValidationProblem(result.Errors.GroupedBySource()),
                        _ => Results.StatusCode((int)result.Status),
                    };
                }
                catch (Exception ex) {
                    return Results.InternalServerError(ex);
                }
            });

        sessions.MapPost("/{id:guid}/start", async (
            HttpContext context,
            [FromRoute] Guid id,
            [FromServices] ISessionService sessionService) => {
                try {
                    var userId = GetUserId(context.User);
                    var result = await sessionService.StartSessionAsync(userId, id);
                    return Results.StatusCode((int)result.Status);
                }
                catch (Exception ex) {
                    return Results.InternalServerError(ex);
                }
            });

        sessions.MapPost("/{id:guid}/stop", async (
            HttpContext context,
            [FromRoute] Guid id,
            [FromServices] ISessionService sessionService) => {
                try {
                    var userId = GetUserId(context.User);
                    var result = await sessionService.StopSessionAsync(userId, id);
                    return Results.StatusCode((int)result.Status);
                }
                catch (Exception ex) {
                    return Results.InternalServerError(ex);
                }
            });
    }

    private static Guid GetUserId(ClaimsPrincipal principal) {
        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userIdClaim?.Value, out var userId)
                   ? userId
                   : Guid.Empty;
    }
}
