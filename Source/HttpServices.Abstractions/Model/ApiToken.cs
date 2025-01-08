namespace HttpServices.Abstractions.Model;

public class ApiToken()
    : ApiToken<string>();

public class ApiToken<TKey>()
    where TKey : IEquatable<TKey> {
    public virtual TKey Id { get; set; } = default!;
    public virtual TKey? ClientId { get; set; }
    public virtual string? Name { get; set; }
    public virtual DateTimeOffset? Expiration { get; set; }

    [ProtectedPersonalData]
    public virtual string Value { get; set; } = default!;
}
