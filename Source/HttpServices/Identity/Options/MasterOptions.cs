namespace HttpServices.Identity.Options;

public record MasterOptions {
    [SetsRequiredMembers]
    public MasterOptions() {
        Identifier ??= Email; // Default to email
    }
    public string Id { get; init; } = Guid.Empty.ToString();
    public required string Identifier { get; init; }
    public string? Email { get; init; } = "master@host.com";
    public string? Name { get; init; } = "Master";
    public string? HashedSecret { get; init; }
}