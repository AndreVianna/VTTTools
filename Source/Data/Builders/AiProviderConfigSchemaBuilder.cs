using AiModel = VttTools.Data.AI.Entities.AiModel;
using Provider = VttTools.Data.AI.Entities.Provider;

namespace VttTools.Data.Builders;

internal static class AiProviderConfigSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) {
        builder.Entity<Provider>(entity => {
            entity.ToTable("AiProviderConfigs");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name).IsRequired().HasConversion<string>();
            entity.Property(e => e.BaseUrl).IsRequired().HasMaxLength(512);
            entity.Property(e => e.HealthEndpoint).IsRequired().HasMaxLength(256);
            entity.Property(e => e.IsEnabled).IsRequired().HasDefaultValue(true);

            entity.HasMany(e => e.Models)
                .WithOne(m => m.Provider)
                .HasForeignKey(m => m.ProviderId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.Name).IsUnique();
        });

        builder.Entity<AiModel>(entity => {
            entity.ToTable("AiProviderModels");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.ProviderId).IsRequired();
            entity.Property(e => e.ContentType).IsRequired().HasConversion<string>();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Endpoint).IsRequired().HasMaxLength(256);
            entity.Property(e => e.IsDefault).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.IsEnabled).IsRequired().HasDefaultValue(true);

            entity.HasOne(e => e.Provider)
                .WithMany(p => p.Models)
                .HasForeignKey(e => e.ProviderId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.ProviderId);
            entity.HasIndex(e => e.ContentType);
            entity.HasIndex(e => new { e.ContentType, e.IsDefault });
        });
    }
}
