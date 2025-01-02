namespace HttpServices.Abstractions.Model;

public class Client()
    : Client<string>();

public class Client<TKey>() {
    public virtual TKey Id { get; init; } = default!;
    public virtual string Name { get; set; } = null!;
    public virtual string HashedSecret { get; set; } = null!;
}
