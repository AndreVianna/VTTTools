namespace VttTools.WebApp.Server.Clients;

public static class GameSessionsMapper {
    internal static GameSessionListItem ToListItem(this GameSession gameSession)
        => new() {
            Id = gameSession.Id,
            OwnerId = gameSession.OwnerId,
            Title = gameSession.Title,
            Status = gameSession.Status,
            PlayerCount = gameSession.Players.Count,
        };

    [return: NotNullIfNotNull(nameof(gameSession))]
    internal static GameSessionDetails? ToDetails(this GameSession? gameSession)
        => gameSession is null ? null : new() {
            Id = gameSession.Id,
            OwnerId = gameSession.OwnerId,
            Title = gameSession.Title,
            Status = gameSession.Status,
            Players = [.. gameSession.Players],
            SceneId = gameSession.SceneId,
            Messages = [.. gameSession.Messages],
            Events = [.. gameSession.Events],
        };
}
