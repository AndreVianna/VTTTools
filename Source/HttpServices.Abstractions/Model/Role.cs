namespace HttpServices.Abstractions.Model;

public class Role
    : Role<string>;

public class Role<TKey>
    : IdentityRole<TKey>
    where TKey : IEquatable<TKey> {
    public virtual TKey? ApiClientId { get; set; }
}
