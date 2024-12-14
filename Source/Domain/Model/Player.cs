namespace Domain.Model;

public record Player {
    public Guid UserId { get; init; }
    public required PlayerRole Role { get; init; }
}
