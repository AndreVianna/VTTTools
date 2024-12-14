namespace Domain.Model;

public record GameSession {
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required Guid OwnerId { get; init; }
    public HashSet<Player> Players { get; init; } = [];
    public List<Map> Maps { get; init; } = [];
    public Guid? ActiveMapId { get; init; }
    public Map? ActiveMap => Maps.Find(m => m.Id == ActiveMapId);
}
