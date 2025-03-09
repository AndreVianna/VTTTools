namespace HttpServices.Identity.Model;

public class UserIdentity
    : UserIdentity<string>
    , IUserIdentity;

public class UserIdentity<TKey>
    : IdentityUser<TKey>
    , IUserIdentity<TKey>
    where TKey : IEquatable<TKey> {
    public virtual TKey? ApiClientId { get; set; }

    public virtual string Identifier { get; set; } = string.Empty;
    public virtual IdentifierType IdentifierType { get; set; } = IdentifierType.Email;

    [PersonalData]
    public virtual bool AccountConfirmed => EmailConfirmed || PhoneNumberConfirmed;

    [PersonalData]
    public virtual TwoFactorType TwoFactorType { get; set; }
}
