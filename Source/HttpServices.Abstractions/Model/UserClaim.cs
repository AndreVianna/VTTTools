namespace HttpServices.Abstractions.Model;

public class UserClaim()
    : UserClaim<Guid>();

public class UserClaim<TKey>()
    : IdentityUserClaim<TKey>()
    where TKey : IEquatable<TKey>{
    public virtual TKey ApiClientId { get; set; } = default!;
}
