namespace HttpServices.ApiConsumers.Data;

internal static class ApiDbContextBuilder {
    public static void ConfigureModel<TClient, TToken>(DbContext context, ModelBuilder modelBuilder)
        where TClient : ApiConsumer
        where TToken : ApiConsumerToken {
        ConfigureModel<string, TClient, TToken>(context, modelBuilder);
        var storeOptions = context.GetService<IDbContextOptions>()
                                  .Extensions.OfType<CoreOptionsExtension>()
                                  .FirstOrDefault()?.ApplicationServiceProvider?
                                  .GetService<IOptions<IdentityOptions>>()?
                                  .Value.Stores;
        var maxKeyLength = storeOptions?.MaxLengthForKeys ?? 0;
        if (maxKeyLength == 0)
            maxKeyLength = 128;

        modelBuilder.Entity<TClient>(b => b.Property(i => i.Id).HasMaxLength(maxKeyLength));
        modelBuilder.Entity<TToken>(b => b.Property(i => i.Id).HasMaxLength(maxKeyLength));
    }

    public static void ConfigureModel<TKey, TClient, TToken>(DbContext context, ModelBuilder modelBuilder)
        where TKey : IEquatable<TKey>
        where TClient : ApiConsumer<TKey>
        where TToken : ApiConsumerToken<TKey> {
        var converter = new PersonalDataConverter(context.GetService<IPersonalDataProtector>());

        modelBuilder.Entity<TClient>(b => {
            b.ToTable("ApiConsumers");
            b.HasKey(i => i.Id);
            b.Property(i => i.Id).ValueGeneratedOnAdd()
                                 .SetDefaultValueGeneration();

            b.Property(e => e.Name).HasMaxLength(256).IsRequired();

            b.HasMany<TToken>().WithOne().HasForeignKey(e => e.ApiConsumerId).IsRequired(false).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TToken>(b => {
            b.ToTable("ApiConsumerTokens");
            b.HasKey(i => i.Id);
            b.Property(i => i.Id).ValueGeneratedOnAdd()
                                 .SetDefaultValueGeneration();

            b.ConvertPersonalDataProperties(converter);
        });
    }
}