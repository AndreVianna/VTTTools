namespace WebApi.Model;

public record Login {
    public required string Provider { get; init; }
    public string? HashedSecret { get; init; }
    public string? Token { get; init; }
    public string? SecurityStamp { get; init; }

    public override string ToString() => Provider;
}
