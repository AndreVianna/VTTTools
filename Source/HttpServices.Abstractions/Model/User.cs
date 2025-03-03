namespace HttpServices.Abstractions.Model;

public class User
    : User<NamedUserProfile>;

public class User<TProfile>
    : User<string, TProfile>
    , IIdentityUser<TProfile>
    where TProfile : class, IUserProfile, new();

public class User<TKey, TProfile>
    : IdentityUser<TKey>
    , IIdentityUser<TKey, TProfile>
    where TKey : IEquatable<TKey>
    where TProfile : class, IUserProfile, new() {
    public virtual TKey? ApiClientId { get; set; }

    public virtual string Identifier { get; set; } = string.Empty;
    public virtual IdentifierType IdentifierType { get; set; } = IdentifierType.Email;

    public virtual TProfile? Profile { get; set; }

    [PersonalData]
    public virtual bool AccountConfirmed => EmailConfirmed || PhoneNumberConfirmed;

    [PersonalData]
    public virtual TwoFactorType TwoFactorType { get; set; }
}
