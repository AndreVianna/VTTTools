namespace ApiService.Data.Model;

public class ApiClient
    : ApiClient<Guid>;

public class ApiClient<TKey> {
    [Key]
    public virtual required TKey Id { get; init; }

    [MaxLength(64)]
    public virtual required string Name { get; init; }

    [MaxLength(256)]
    public virtual required string HashedSecret { get; init; }

    public void Configure(EntityTypeBuilder<ApiClient> builder) {
        builder.ToTable("Clients");
        builder.Property(x => x.Id)
            .ValueGeneratedOnAdd()
            .HasValueGenerator<SequentialGuidValueGenerator>();
    }
}
