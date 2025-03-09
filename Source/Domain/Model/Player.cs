namespace Domain.Model;

public record Player {
    public Guid UserId { get; init; }
    public required UserGameRole Role { get; init; }
}
