namespace HttpServices.Data;

public class ApiDbContext(DbContextOptions options)
    : ApiDbContext<ApiClient>(options);

public class ApiDbContext<TClient>(DbContextOptions options)
    : ApiDbContext<TClient, Guid>(options)
    where TClient : ApiClient;

public class ApiDbContext<TClient, TKey>(DbContextOptions options)
    : DbContext(options)
    where TClient : ApiClient<TKey>
    where TKey : IEquatable<TKey> {
    public virtual DbSet<TClient> Clients { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TClient>().ToTable("Clients");
        if (typeof(TKey) == typeof(Guid))
            modelBuilder.Entity<TClient>().Property(x => x.Id).HasValueGenerator<SequentialGuidValueGenerator>();

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApiDbContext).Assembly);
    }
}
