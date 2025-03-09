namespace HttpServices.Identity.Model;

public interface IUserIdentity
    : IUserIdentity<string>;

public interface IUserIdentity<TKey>
    : IBasicUserIdentity<TKey>
    where TKey : IEquatable<TKey> {
    string? NormalizedEmail { get; set; }
    string? NormalizedUserName { get; set; }

    bool EmailConfirmed { get; set; }
    bool PhoneNumberConfirmed { get; set; }
    bool AccountConfirmed { get; }

    bool LockoutEnabled { get; set; }
    int AccessFailedCount { get; set; }
    DateTimeOffset? LockoutEnd { get; set; }

    bool TwoFactorEnabled { get; set; }
    TwoFactorType TwoFactorType { get; set; }

    string? SecurityStamp { get; set; }
    string? ConcurrencyStamp { get; set; }
}
