namespace HttpServices.Abstractions.Model;

public class ApiClient()
    : ApiClient<string>();

public class ApiClient<TKey>() {
    public virtual TKey Id { get; set; } = default!;
    public virtual string Name { get; set; } = null!;
    public virtual string HashedSecret { get; set; } = null!;
}