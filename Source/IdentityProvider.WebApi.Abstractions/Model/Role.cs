namespace WebApi.Model;

public record Role {
    public Guid Id { get; init; }
    public required string Name { get; init; }
}
