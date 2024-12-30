namespace AuthService.Data.Model;

[EntityTypeConfiguration(typeof(ApiClient))]
public class ApiClient
    : IEntityTypeConfiguration<ApiClient> {
    [Key]
    [MaxLength(48)]
    public required string Id { get; init; }

    [MaxLength(64)]
    public required string Name { get; init; }

    [MaxLength(256)]
    public required string HashedSecret { get; init; }

    public void Configure(EntityTypeBuilder<ApiClient> builder) {
        builder.ToTable("Clients");
        builder.Property(x => x.Id)
            .ValueGeneratedOnAdd()
            .HasValueGenerator<SequentialGuidValueGenerator>();
    }
}
