namespace HttpServices.Data;

public class ApiDbContext(DbContextOptions options)
    : ApiDbContext<Client>(options);

public class ApiDbContext<TClient>(DbContextOptions options)
    : ApiDbContext<string, TClient>(options)
    where TClient : Client;

public class ApiDbContext<TKey, TClient>(DbContextOptions options)
    : DbContext(options)
    where TKey : IEquatable<TKey>
    where TClient : Client<TKey> {
    public virtual DbSet<TClient> Clients { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TClient>(b => {
            b.ToTable("Clients");
            b.HasKey(i => i.Id);

            b.Property(i => i.Id).ValueGeneratedOnAdd().SetDefaultValueGeneration();
            b.Property(e => e.Name).HasMaxLength(256).IsRequired();
            b.Property(e => e.HashedSecret).IsRequired();
        });
    }
}