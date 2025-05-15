namespace VttTools.Game.EndpointMappers;

internal static class GameSessionEndpointsMapper {
    public static void MapGameSessionEndpoints(this IEndpointRouteBuilder app) {
        var sessions = app.MapGroup("/api/sessions")
                          .RequireAuthorization();

        sessions.MapGet("/", GameSessionHandlers.GetGameSessionsHandler);
        sessions.MapGet("/{id:guid}", GameSessionHandlers.GetGameSessionByIdHandler);
        sessions.MapPost("/", GameSessionHandlers.CreateGameSessionHandler);
        sessions.MapPatch("/{id:guid}", GameSessionHandlers.UpdateGameSessionHandler);
        sessions.MapDelete("/{id:guid}", GameSessionHandlers.DeleteGameSessionHandler);
        sessions.MapPost("/{id:guid}/join", GameSessionHandlers.JoinGameSessionHandler);
        sessions.MapPost("/{id:guid}/leave", GameSessionHandlers.LeaveGameSessionHandler);
        sessions.MapPost("/{id:guid}/scenes/{scene:guid}/activate", GameSessionHandlers.ActivateSceneHandler);
        sessions.MapPost("/{id:guid}/start", GameSessionHandlers.StartGameSessionHandler);
        sessions.MapPost("/{id:guid}/stop", GameSessionHandlers.StopGameSessionHandler);
    }
}