namespace HttpServices.ApiConsumers.Model;

public class ApiConsumerToken()
    : ApiConsumerToken<string>();

public class ApiConsumerToken<TKey>()
    where TKey : IEquatable<TKey> {
    public virtual TKey Id { get; set; } = default!;
    public virtual TKey? ApiConsumerId { get; set; }
    public virtual string? Name { get; set; }
    public virtual DateTimeOffset? Expiration { get; set; }

    [ProtectedPersonalData]
    public virtual string Value { get; set; } = null!;
}
