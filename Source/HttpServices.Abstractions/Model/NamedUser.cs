namespace HttpServices.Abstractions.Model;

public class NamedUser
    : NamedUser<string>
    , IUserIdentity;

public class NamedUser<TKey>
    : IdentityUser<TKey>
    where TKey : IEquatable<TKey> {
    public virtual TKey? ApiClientId { get; set; }

    [ProtectedPersonalData]
    public virtual string? Name { get; set; }

    [PersonalData]
    public virtual bool AccountConfirmed => EmailConfirmed || PhoneNumberConfirmed;

    [PersonalData]
    public virtual TwoFactorType TwoFactorType { get; set; }
}
