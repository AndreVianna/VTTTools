namespace HttpServices.Data;

public class ApiDbContext(DbContextOptions options)
    : ApiDbContext<Consumer>(options);

public class ApiDbContext<TConsumer>(DbContextOptions options)
    : ApiDbContext<string, TConsumer>(options)
    where TConsumer : Consumer;

public class ApiDbContext<TKey, TConsumer>(DbContextOptions options)
    : DbContext(options)
    where TConsumer : Consumer<TKey>
    where TKey : IEquatable<TKey> {
    public virtual DbSet<TConsumer> Consumers { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TConsumer>(b => {
            b.ToTable("Consumers");
            b.HasKey(i => i.Id);

            b.Property(i => i.Id).ValueGeneratedOnAdd().SetDefaultValueGeneration();
            b.Property(e => e.Name).HasMaxLength(256).IsRequired();
            b.Property(e => e.HashedSecret).IsRequired();
        });
    }
}