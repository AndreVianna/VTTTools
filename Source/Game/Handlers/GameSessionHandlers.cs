using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Game.Handlers;

internal static class GameSessionHandlers {
    internal static async Task<IResult> CreateGameSessionHandler(
        HttpContext context,
        [FromBody] CreateGameSessionRequest request,
        [FromServices] IGameSessionService service) {
        var userId = context.User.ExtractUserId();
        var data = new CreateGameSessionData {
            Title = request.Title,
            SceneId = request.SceneId,
        };
        var result = await service.CreateGameSessionAsync(userId, data);
        return result.IsSuccessful
                   ? Results.Created($"/api/sessions/{result.Value.Id}", result.Value)
                   : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> GetGameSessionsHandler(
        HttpContext context,
        [FromServices] IGameSessionService service) {
        var userId = context.User.ExtractUserId();
        var userGameSessions = await service.GetGameSessionsAsync(userId);
        return Results.Ok(userGameSessions);
    }

    internal static async Task<IResult> GetGameSessionByIdHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IGameSessionService service) {
        var userId = context.User.ExtractUserId();
        return await service.GetGameSessionByIdAsync(userId, id) is { } session
            ? Results.Ok(session)
            : Results.NotFound();
    }

    internal static async Task<IResult> UpdateGameSessionHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromBody] UpdateGameSessionRequest request,
        [FromServices] IGameSessionService service) {
        var userId = context.User.ExtractUserId();
        var data = new UpdateGameSessionData {
            Title = request.Title,
        };
        var result = await service.UpdateGameSessionAsync(userId, id, data);
        return result.Status switch {
            HttpStatusCode.BadRequest => Results.ValidationProblem(result.Errors.GroupedBySource()),
            HttpStatusCode.OK => Results.Ok(result.Value),
            _ => Results.StatusCode((int)result.Status),
        };
    }

    internal static async Task<IResult> DeleteGameSessionHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IGameSessionService service) {
        var userId = context.User.ExtractUserId();
        var result = await service.DeleteGameSessionAsync(userId, id);
        return Results.StatusCode((int)result.Status);
    }

    internal static async Task<IResult> JoinGameSessionHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromBody] JoinGameSessionRequest request,
        [FromServices] IGameSessionService service) {
        var userId = context.User.ExtractUserId();
        var result = await service.JoinGameSessionAsync(userId, id, request.JoinAs);
        return result.Status switch {
            HttpStatusCode.BadRequest => Results.ValidationProblem(result.Errors.GroupedBySource()),
            _ => Results.StatusCode((int)result.Status),
        };
    }

    internal static async Task<IResult> LeaveGameSessionHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IGameSessionService service) {
        var userId = context.User.ExtractUserId();
        var result = await service.LeaveGameSessionAsync(userId, id);
        return Results.StatusCode((int)result.Status);
    }

    internal static async Task<IResult> ActivateSceneHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromRoute] Guid scene,
        [FromServices] IGameSessionService service) {
        var userId = context.User.ExtractUserId();
        var result = await service.SetActiveSceneAsync(userId, id, scene);
        return Results.StatusCode((int)result.Status);
    }

    internal static async Task<IResult> StartGameSessionHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IGameSessionService service) {
        var userId = context.User.ExtractUserId();
        var result = await service.StartGameSessionAsync(userId, id);
        return Results.StatusCode((int)result.Status);
    }

    internal static async Task<IResult> StopGameSessionHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IGameSessionService service) {
        var userId = context.User.ExtractUserId();
        var result = await service.StopGameSessionAsync(userId, id);
        return Results.StatusCode((int)result.Status);
    }
}