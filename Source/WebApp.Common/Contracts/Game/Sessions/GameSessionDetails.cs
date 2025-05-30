namespace VttTools.WebApp.Contracts.Game.Sessions;

public sealed class GameSessionDetails {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public Guid OwnerId { get; init; }
    public string Title { get; init; } = string.Empty;
    public GameSessionStatus Status { get; init; } = GameSessionStatus.Draft;
    public List<Participant> Players { get; init; } = [];
    public Guid? SceneId { get; init; }
    public List<GameSessionMessage> Messages { get; init; } = [];
    public List<GameSessionEvent> Events { get; init; } = [];
}