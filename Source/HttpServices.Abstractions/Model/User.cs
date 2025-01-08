namespace HttpServices.Abstractions.Model;

public class User()
    : User<string>();

public class User<TKey>()
    : IdentityUser<TKey>()
    where TKey : IEquatable<TKey> {
    public virtual TKey? ClientId { get; set; }

    [PersonalData]
    public virtual bool AccountConfirmed => EmailConfirmed || PhoneNumberConfirmed;

    [PersonalData]
    public virtual TwoFactorType TwoFactorType { get; set; }
}
