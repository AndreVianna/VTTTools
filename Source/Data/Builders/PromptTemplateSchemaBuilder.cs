using PromptTemplate = VttTools.Data.AI.Entities.PromptTemplate;

namespace VttTools.Data.Builders;

internal static class PromptTemplateSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder) => builder.Entity<PromptTemplate>(entity => {
        entity.ToTable("PromptTemplates");
        entity.HasKey(e => e.Id);

        entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
        entity.Property(e => e.Category).IsRequired().HasConversion<string>();
        entity.Property(e => e.Version).IsRequired().HasMaxLength(16).HasDefaultValue("1.0-draft");
        entity.Property(e => e.SystemPrompt).IsRequired().HasMaxLength(4096);
        entity.Property(e => e.UserPromptTemplate).IsRequired().HasMaxLength(4096);
        entity.Property(e => e.NegativePromptTemplate).HasMaxLength(2048);
        entity.Property(e => e.ReferenceImageId).IsRequired(false);

        entity.HasIndex(e => e.Name);
        entity.HasIndex(e => e.Category);
        entity.HasIndex(e => new { e.Name, e.Version }).IsUnique();
    });
}
