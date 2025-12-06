namespace VttTools.Auth.ApiContracts;

public record ProfileResponse : Response {
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public bool EmailConfirmed { get; init; }
    public string? PhoneNumber { get; init; }
    public Guid? AvatarId { get; init; }
    public string? AvatarUrl { get; init; }
    public UnitSystem PreferredUnitSystem { get; init; } = UnitSystem.Imperial;
    public bool Success { get; init; }
    public string? Message { get; init; }
}