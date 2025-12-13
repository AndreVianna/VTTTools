using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Game.Handlers;

internal static class GameSessionHandlers {
    internal static async Task<IResult> CreateGameSessionHandler(
        HttpContext context,
        [FromBody] CreateGameSessionRequest request,
        [FromServices] IGameSessionService service) {
        var userId = context.User.GetUserId();
        var data = new CreateGameSessionData {
            Title = request.Title,
            EncounterId = request.EncounterId,
        };
        var result = await service.CreateGameSessionAsync(userId, data);
        return result.IsSuccessful
                   ? Results.Created($"/api/sessions/{result.Value.Id}", result.Value)
                   : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> GetGameSessionsHandler(
        HttpContext context,
        [FromServices] IGameSessionService service) {
        var userId = context.User.GetUserId();
        var userGameSessions = await service.GetGameSessionsAsync(userId);
        return Results.Ok(userGameSessions);
    }

    internal static async Task<IResult> GetGameSessionByIdHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IGameSessionService service) {
        var userId = context.User.GetUserId();
        return await service.GetGameSessionByIdAsync(userId, id) is { } session
            ? Results.Ok(session)
            : Results.NotFound();
    }

    internal static async Task<IResult> UpdateGameSessionHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromBody] UpdateGameSessionRequest request,
        [FromServices] IGameSessionService service) {
        var userId = context.User.GetUserId();
        var data = new UpdateGameSessionData {
            Title = request.Title,
        };
        var result = await service.UpdateGameSessionAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.NoContent()  // 204 No GeneratedContentType (no user-facing side effects)
            : result.Errors[0].Message == "Session not found"
                ? Results.NotFound()
                : result.Errors[0].Message == "Not authorized"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> DeleteGameSessionHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IGameSessionService service) {
        var userId = context.User.GetUserId();
        var result = await service.DeleteGameSessionAsync(userId, id);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "Session not found"
                ? Results.NotFound()
                : result.Errors[0].Message == "Not authorized"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> JoinGameSessionHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromBody] JoinGameSessionRequest request,
        [FromServices] IGameSessionService service) {
        var userId = context.User.GetUserId();
        var result = await service.JoinGameSessionAsync(userId, id, request.JoinAs);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "Session not found"
                ? Results.NotFound()
                : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> LeaveGameSessionHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IGameSessionService service) {
        var userId = context.User.GetUserId();
        var result = await service.LeaveGameSessionAsync(userId, id);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "Session not found"
                ? Results.NotFound()
                : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> ActivateEncounterHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromRoute] Guid encounter,
        [FromServices] IGameSessionService service) {
        var userId = context.User.GetUserId();
        var result = await service.SetActiveEncounterAsync(userId, id, encounter);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "Session not found"
                ? Results.NotFound()
                : result.Errors[0].Message == "Not authorized"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> StartGameSessionHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IGameSessionService service) {
        var userId = context.User.GetUserId();
        var result = await service.StartGameSessionAsync(userId, id);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "Session not found"
                ? Results.NotFound()
                : result.Errors[0].Message == "Not authorized"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> StopGameSessionHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IGameSessionService service) {
        var userId = context.User.GetUserId();
        var result = await service.StopGameSessionAsync(userId, id);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "Session not found"
                ? Results.NotFound()
                : result.Errors[0].Message == "Not authorized"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }
}