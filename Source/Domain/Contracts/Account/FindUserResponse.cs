namespace Domain.Contracts.Account;

public sealed record FindUserResponse {
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required string Email { get; init; }
    public string? PhoneNumber { get; init; }
    public bool AccountConfirmed { get; init; }
    public bool TwoFactorEnabled { get; init; }
    public TwoFactorType TwoFactorType { get; init; }
    public DateTimeOffset? LockoutEnd { get; init; }
    public int AccessFailedCount { get; init; }
}
