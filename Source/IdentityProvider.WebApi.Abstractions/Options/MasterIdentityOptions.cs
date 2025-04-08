namespace WebApi.Options;

public record MasterIdentityOptions {
    [SetsRequiredMembers]
    public MasterIdentityOptions() {
        Identifier ??= Email; // Default to email
    }
    public required string Identifier { get; init; }
    public string? Email { get; init; } = "master@host.com";
    public string? Name { get; init; } = "Master";
    public string? HashedSecret { get; init; }
}