namespace HttpServices.Model;

public record MasterUserOptions
    : IIdentityUser<MasterUserProfileOptions> {
    public static readonly string DefaultId = Guid.Empty.ToString();
    public const string DefaultEmail = "master@host.com";
    public string Id { get; set; } = DefaultId;
    public string? Email { get; set; } = DefaultEmail;
    public required string Password { get; init; }
    public MasterUserProfileOptions? Profile { get; set; }
    public bool AccountConfirmed => true;

    public bool EmailConfirmed { get; set; }
    public string? NormalizedEmail { get; set; }
    public string? UserName { get; set; }
    public string? NormalizedUserName { get; set; }
    public string? PasswordHash { get; set; }
    public bool LockoutEnabled { get; set; }
    public int AccessFailedCount { get; set; }
    public DateTimeOffset? LockoutEnd { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public TwoFactorType TwoFactorType { get; set; }
    public string? SecurityStamp { get; set; }
    public string? ConcurrencyStamp { get; set; }
    public string? PhoneNumber { get; set; }
    public bool PhoneNumberConfirmed { get; set; }
}