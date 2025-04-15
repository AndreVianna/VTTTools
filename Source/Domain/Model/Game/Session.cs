namespace VttTools.Model.Game;

public class Session {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid OwnerId { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    public HashSet<SessionPlayer> Players { get; set; } = [];
    public HashSet<SessionMap> Maps { get; set; } = [];
    public int? ActiveMap { get; set; }
    public HashSet<SessionMessage> Messages { get; set; } = [];
}
