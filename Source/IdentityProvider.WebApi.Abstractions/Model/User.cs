namespace WebApi.Model;

public record User
    : IUserIdentity {
    public string Identifier { get; init; } = string.Empty; // must be unique;
    public string? Email { get; init; }
    public bool EmailIsConfirmed { get; init; }
    public string? PhoneNumber { get; init; }
    public bool PhoneNumberIsConfirmed { get; init; }
    public bool AccountIsConfirmed { get; init; }
    public bool TwoFactorIsSetup { get; init; }
    public bool CanBeLockedOut { get; init; }
    public DateTimeOffset? LockoutEnd { get; init; }
    public byte FailedSignInCount { get; init; }
    public bool IsBlocked { get; init; }

    public Login[] Logins { get; init; } = [];
    public string[] Roles { get; init; } = [];

    public override string ToString() => Identifier;
}