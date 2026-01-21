namespace VttTools.Identity.Model;

public record Role {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public required string Name { get; init; }
    public IReadOnlyList<string> Claims { get; init; } = [];
}