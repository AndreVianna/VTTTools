namespace HttpServices.ApiConsumers.Model;

public class ApiConsumer()
    : ApiConsumer<string>();

public class ApiConsumer<TKey>() {
    public virtual TKey Id { get; set; } = default!;
    public virtual string Name { get; set; } = null!;
    public virtual string HashedSecret { get; set; } = null!;
}