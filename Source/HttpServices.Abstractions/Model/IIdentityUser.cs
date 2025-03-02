namespace HttpServices.Abstractions.Model;

public interface IIdentityUser<TProfile>
    : IIdentityUser<string, TProfile>
    where TProfile : class, IUserProfile;

public interface IIdentityUser<TKey, TProfile>
    where TKey : IEquatable<TKey>
    where TProfile : class, IUserProfile {
    TKey Id { get; set; }
    string? Email { get; set; }
    bool EmailConfirmed { get; set; }
    string? NormalizedEmail { get; set; }
    string? UserName { get; set; }
    string? NormalizedUserName { get; set; }

    string? PasswordHash { get; set; }

    TProfile? Profile { get; set; }

    bool AccountConfirmed { get; }
    bool LockoutEnabled { get; set; }
    int AccessFailedCount { get; set; }
    DateTimeOffset? LockoutEnd { get; set; }

    bool TwoFactorEnabled { get; set; }
    TwoFactorType TwoFactorType { get; set; }

    string? SecurityStamp { get; set; }
    string? ConcurrencyStamp { get; set; }

    string? PhoneNumber { get; set; }
    bool PhoneNumberConfirmed { get; set; }
}
