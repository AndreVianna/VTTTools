namespace WebApi.Identity.EntityFrameworkCore.Entities;

public class User
    : IUserIdentity {
    public User() { }
    public User(string identifier) : this() {
        Identifier = identifier;
    }

    public Guid Id { get; set; }

    [MaxLength(256)]
    public string Identifier { get; set; } = string.Empty;

    [MaxLength(256)]
    [ProtectedPersonalData]
    public string? Email { get; set; }
    [MaxLength(32)]
    [ProtectedPersonalData]
    public string? PhoneNumber { get; set; }
    [MaxLength(36)]
    public string? ConcurrencyStamp { get; set; } = Guid.CreateVersion7().ToString();
    public bool AccountConfirmed { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public TwoFactorType TwoFactorType { get; set; }
    public DateTimeOffset? LockoutEnd { get; set; }
    public bool LockoutEnabled { get; set; }
    public int AccessFailedCount { get; set; }

    public ICollection<UserLogin> Logins { get; set; } = new HashSet<UserLogin>();
    public ICollection<UserClaim> Claims { get; set; } = new HashSet<UserClaim>();
    public ICollection<UserRole> Roles { get; set; } = new HashSet<UserRole>();

    public override string ToString() => Identifier;
}
