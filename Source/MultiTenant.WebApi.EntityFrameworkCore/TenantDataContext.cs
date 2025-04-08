namespace WebApi.Tenants.EntityFrameworkCore;

public class TenantDataContext(DbContextOptions options)
    : TenantDataContext<TenantEntity>(options);

public class TenantDataContext<TTenant>(DbContextOptions options)
    : DbContext(options)
    where TTenant : TenantEntity, new() {
    public DbSet<TTenant> Tenants { get; set; } = null!;
    public DbSet<TenantTokenEntity> Tokens { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);
        TenantDataContextBuilder.ConfigureModel<TTenant>(this, modelBuilder);
    }
}