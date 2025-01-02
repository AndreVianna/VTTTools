namespace HttpServices.Abstractions.Model;

public class Role()
    : Role<Guid>();

public class Role<TKey>()
    : IdentityRole<TKey>()
    where TKey : IEquatable<TKey> {
    [Required]
    public virtual TKey ApiClientId { get; set; } = default!;
}
