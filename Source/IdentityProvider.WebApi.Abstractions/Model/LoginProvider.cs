namespace WebApi.Model;

public record LoginProvider {
    public required string Id { get; init; }
    public required string Name { get; init; }
}
