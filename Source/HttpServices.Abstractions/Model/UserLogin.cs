namespace HttpServices.Abstractions.Model;

public class UserLogin()
    : UserLogin<Guid>();

public class UserLogin<TKey>()
    : IdentityUserLogin<TKey>()
    where TKey : IEquatable<TKey>{
    public virtual TKey ApiClientId { get; set; } = default!;
}
