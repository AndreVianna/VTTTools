namespace HttpServices.Abstractions.Model;

public class RoleClaim()
    : RoleClaim<Guid>();

public class RoleClaim<TKey>()
    : IdentityRoleClaim<TKey>()
    where TKey : IEquatable<TKey>{
    public virtual TKey ApiClientId { get; set; } = default!;
}
