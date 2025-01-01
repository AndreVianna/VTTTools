namespace HttpServices.Abstractions.Contracts.Account;

public sealed record FindUserResponse {
    public required string Id { get; init; }
    public required string Name { get; init; }
    public string? PreferredName { get; init; }
    public required string Email { get; init; }
    public bool EmailConfirmed { get; init; }
    public string? PhoneNumber { get; init; }
    public bool PhoneNumberConfirmed { get; init; }
    public bool TwoFactorEnabled { get; init; }
    public DateTimeOffset? LockoutEnd { get; init; }
    public bool LockoutEnabled { get; init; }
    public int AccessFailedCount { get; init; }
}
