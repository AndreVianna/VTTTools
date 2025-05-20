namespace VttTools.Data.Game.Entities;

public class GameSession {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid OwnerId { get; set; }
    [MaxLength(128)]
    public string Title { get; set; } = string.Empty;
    public GameSessionStatus Status { get; set; } = GameSessionStatus.Draft;
    public List<Player> Players { get; set; } = [];
    public Guid? SceneId { get; set; }
    public List<GameSessionMessage> Messages { get; set; } = [];
    public List<GameSessionEvent> Events { get; set; } = [];
}