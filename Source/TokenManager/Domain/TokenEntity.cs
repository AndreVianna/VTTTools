namespace VttTools.TokenManager.Domain;

public sealed record TokenEntity(
    string Id,
    string Name,
    EntityType Type,
    string? Subtype,
    string? Size,
    string? Role,
    IReadOnlyList<string>? Tags,
    IReadOnlyList<string>? Environments
) {
    public IReadOnlyList<string> TagsOrEmpty => Tags ?? [];
    public IReadOnlyList<string> EnvironmentsOrEmpty => Environments ?? [];
}
