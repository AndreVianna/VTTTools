namespace Domain.Model;

public record Token {
    public required Guid Id { get; set; }
    public required Guid MapId { get; set; }
    public required string Name { get; set; }
    public string? ImageUrl { get; set; }
    public Position Position { get; set; } // grid position
    public Size Size { get; set; } // grid position
    public bool IsLocked { get; init; }
    public Guid? ControlledBy { get; init; }
}
