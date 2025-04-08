namespace WebApi.Model;

public record User
    : IUserIdentity {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public string Identifier { get; init; } = string.Empty;
    public string? Email { get; init; }
    public string? PhoneNumber { get; init; }
    public bool AccountConfirmed { get; init; }
    public bool IsLocked { get; init; }
    public bool TwoFactorEnabled { get; init; }
    public TwoFactorType TwoFactorType { get; init; }

    public Login[] Logins { get; init; } = [];
    public Role[] Roles { get; init; } = [];
    public Claim[] Claims { get; init; } = [];

    public override string ToString() => Identifier;
}