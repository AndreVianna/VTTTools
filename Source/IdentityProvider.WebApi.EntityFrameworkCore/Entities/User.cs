namespace WebApi.Identity.EntityFrameworkCore.Entities;

[method: SetsRequiredMembers]
public class User()
    : IUserIdentity {
    public Guid Id { get; set; }

    [MaxLength(256)]
    public required string Identifier { get; set; } = string.Empty;

    [MaxLength(256)]
    [ProtectedPersonalData]
    public string? Email { get; set; }
    public bool EmailIsConfirmed { get; set; }

    [MaxLength(32)]
    [ProtectedPersonalData]
    public string? PhoneNumber { get; set; }
    public bool PhoneNumberIsConfirmed { get; set; }

    [MaxLength(36)]
    public string? ConcurrencyStamp { get; set; } = Guid.CreateVersion7().ToString();

    public bool AccountIsConfirmed { get; set; }
    public bool TwoFactorIsSetup { get; set; }
    public bool CanBeLockedOut { get; set; }
    public DateTimeOffset? LockoutEnd { get; set; }
    public byte FailedSignInCount { get; set; }
    public bool IsBlocked { get; set; }

    public ICollection<UserLogin> Logins { get; set; } = new HashSet<UserLogin>();
    public ICollection<UserClaim> Claims { get; set; } = new HashSet<UserClaim>();
    public ICollection<UserRole> Roles { get; set; } = new HashSet<UserRole>();

    public override string ToString() => Identifier;
}
