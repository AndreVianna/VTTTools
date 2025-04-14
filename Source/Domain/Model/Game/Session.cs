namespace VttTools.Model.Game;

public class Session {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public User Owner { get; set; } = null!;
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    public HashSet<Player> Players { get; set; } = [];
    public HashSet<Map> Maps { get; set; } = [];
    public int? ActiveMap { get; set; }
    public HashSet<Message> Messages { get; set; } = [];
}
