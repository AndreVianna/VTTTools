namespace WebApi.Tenants.EntityFrameworkCore.Builders;

internal static class TenantDataContextBuilder {
    public static void ConfigureModel<TTenant>(DbContext context, ModelBuilder modelBuilder)
        where TTenant : TenantEntity {
        var converter = new PersonalDataConverter(context.GetService<IPersonalDataProtector>());

        modelBuilder.Entity<TTenant>(b => {
            b.ToTable("Tenants");
            b.HasKey(i => i.Id);
            b.Property(i => i.Id).ValueGeneratedOnAdd()
                                 .SetDefaultValueGeneration();

            b.Property(e => e.Name).HasMaxLength(256)
                                   .IsRequired();

            b.HasMany(e => e.Tokens).WithOne(t => (TTenant)t.Tenant)
                                    .HasForeignKey(e => e.TenantId)
                                    .IsRequired()
                                    .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TenantTokenEntity>(b => {
            b.ToTable("TenantTokens");
            b.HasKey(i => i.Id);
            b.Property(i => i.Id).ValueGeneratedOnAdd()
             .SetDefaultValueGeneration();
            b.Property(i => i.CreatedAt).IsRequired();
            b.Property(i => i.Value).IsRequired();
            b.ConvertPersonalDataProperties(converter);
        });
    }
}
