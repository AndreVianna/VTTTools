namespace HttpServices.Abstractions.Model;

public class ApiClient()
    : ApiClient<Guid>();

public class ApiClient<TKey>() {
    [Key]
    public virtual TKey Id { get; init; } = default!;

    [MaxLength(64)]
    public virtual string Name { get; set; } = null!;

    [MaxLength(256)]
    public virtual string HashedSecret { get; set; } = null!;
}
