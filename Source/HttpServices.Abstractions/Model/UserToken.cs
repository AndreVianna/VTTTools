namespace HttpServices.Abstractions.Model;

public class UserToken()
    : UserToken<Guid>();

public class UserToken<TKey>()
    : IdentityUserToken<TKey>()
    where TKey : IEquatable<TKey> {
    public virtual TKey ApiClientId { get; set; } = default!;
}
