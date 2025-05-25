namespace VttTools.Data.Game.Entities;

public class GameSession {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid OwnerId { get; set; }
    [MaxLength(128)]
    public string Title { get; set; } = string.Empty;
    public GameSessionStatus Status { get; set; } = GameSessionStatus.Draft;
    public ICollection<Player> Players { get; set; } = [];
    public Guid? SceneId { get; set; }
    public ICollection<GameSessionMessage> Messages { get; set; } = [];
    public ICollection<GameSessionEvent> Events { get; set; } = [];
}