namespace HttpServices.Abstractions.Model;

public class ApiClientUser()
    : ApiClientUser<Guid>();

public class ApiClientUser<TKey>()
    : IdentityUser<TKey>()
    where TKey : IEquatable<TKey> {
    [Required]
    [ProtectedPersonalData]
#pragma warning disable CS8765 // Nullability of type of parameter doesn't match overridden member (possibly because of nullability attributes).
    public override string Email { get; set; } = null!;
#pragma warning restore CS8765

    [Required]
    [ProtectedPersonalData]
    public virtual string Name { get; set; } = null!;

    [ProtectedPersonalData]
    public virtual string? PreferredName { get; set; }

    public virtual bool AccountConfirmed => EmailConfirmed || PhoneNumberConfirmed;

    public virtual TwoFactorType TwoFactorType { get; set; }
}
