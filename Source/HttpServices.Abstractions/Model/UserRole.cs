namespace HttpServices.Abstractions.Model;

public class UserRole()
    : UserRole<Guid>();

public class UserRole<TKey>()
    : IdentityUserRole<TKey>()
    where TKey : IEquatable<TKey> {
    public virtual TKey ApiClientId { get; set; } = default!;
}
