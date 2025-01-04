// ReSharper disable once CheckNamespace

using Microsoft.AspNetCore.Mvc;

namespace Microsoft.AspNetCore.Builder;

internal static class WebApplicationExtensions {
    public static void MapGameSessionManagementEndpoints(this WebApplication app) {
        app.MapPost("/sessions", [Authorize] async (string name, Guid userId, [FromServices] GameSessionService sessionService) => {
            var session = await sessionService.CreateSessionAsync(name, userId);
            return Results.Created($"/sessions/{session.Id}", session);
        });

        app.MapGet("/sessions/{id:guid}", [Authorize] async (Guid id, [FromServices] GameSessionService sessionService) => {
            var session = await sessionService.GetSessionAsync(id);
            return session != null
                       ? Results.Ok(session)
                       : Results.NotFound();
        });
    }
}
