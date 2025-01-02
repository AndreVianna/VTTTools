namespace HttpServices.Abstractions.Model;

public class Consumer()
    : Consumer<string>();

public class Consumer<TKey>() {
    public virtual TKey Id { get; init; } = default!;
    public virtual string Name { get; set; } = null!;
    public virtual string HashedSecret { get; set; } = null!;
}
