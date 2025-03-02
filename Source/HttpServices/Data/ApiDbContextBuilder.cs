namespace HttpServices.Data;

internal static class ApiDbContextBuilder {
    public static void ConfigureModel<TKey, TClient, TToken>(DbContext context, ModelBuilder modelBuilder)
        where TKey : IEquatable<TKey>
        where TClient : ApiClient<TKey>
        where TToken : ApiToken<TKey> {
        var converter = new PersonalDataConverter(context.GetService<IPersonalDataProtector>());

        modelBuilder.Entity<TClient>(b => {
            b.ToTable("Clients");
            b.HasKey(i => i.Id);

            b.Property(i => i.Id).ValueGeneratedOnAdd().SetDefaultValueGeneration();
            b.Property(e => e.Name).HasMaxLength(256).IsRequired();

            b.HasMany<TToken>().WithOne().HasForeignKey(e => e.ApiClientId).IsRequired(false).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TToken>(b => {
            b.ToTable("Tokens");
            b.HasKey(i => i.Id);

            b.Property(i => i.Id).ValueGeneratedOnAdd().SetDefaultValueGeneration();

            b.ConvertPersonalDataProperties(converter);
        });
    }
}