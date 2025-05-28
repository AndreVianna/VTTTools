using AdventureEntity = VttTools.Data.Library.Entities.Adventure;

namespace VttTools.Data.Builders;

/// <summary>
/// Configures the EF model for the Adventure entity.
/// </summary>
internal static class AdventureSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<AdventureEntity>(entity => {
            entity.ToTable("Adventures");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.CampaignId);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(4096);
            entity.Property(e => e.Type).IsRequired().HasConversion<string>();
            entity.ComplexProperty(s => s.Display, displayBuilder => {
                displayBuilder.IsRequired();
                displayBuilder.Property(s => s.FileName);
                displayBuilder.Property(s => s.Type).IsRequired().HasConversion<string>().HasDefaultValue(ResourceType.Undefined);
                displayBuilder.ComplexProperty(s => s.Size, sizeBuilder => {
                    sizeBuilder.IsRequired();
                    sizeBuilder.Property(s => s.Width).IsRequired().HasDefaultValue(0);
                    sizeBuilder.Property(s => s.Height).IsRequired().HasDefaultValue(0);
                });
            });
            entity.Property(e => e.IsPublished).IsRequired();
            entity.Property(e => e.IsPublic).IsRequired();
            entity.HasMany(e => e.Scenes).WithOne(e => e.Adventure)
                  .HasForeignKey(ep => ep.AdventureId).OnDelete(DeleteBehavior.Cascade);
        });

    public static void SeedAdventures(ModelBuilder builder) {
        builder.Entity<AdventureEntity>().HasData(new AdventureEntity {
            Id = Guid.Parse("0196f86e-6669-78ee-95eb-4303c232295c"),
            OwnerId = Guid.Parse("019639ea-c7de-7a01-8548-41edfccde206"),
            Name = "Test 1",
            Type = AdventureType.Generic,
            Description = "Test 1",
            IsPublished = false,
            IsPublic = false,
        });
        builder.Entity<AdventureEntity>().HasData(new AdventureEntity {
            Id = Guid.Parse("0196f86e-9220-769d-bf71-173f30d7177a"),
            OwnerId = Guid.Parse("019639ea-c7de-7a01-8548-41edfccde206"),
            Name = "Test 2",
            Type = AdventureType.Generic,
            Description = "Test 2",
            IsPublished = false,
            IsPublic = false,
        });
        builder.Entity<AdventureEntity>().HasData(new AdventureEntity {
            Id = Guid.Parse("0196f86e-ce48-7b61-8dfa-3c1d535cc6c4"),
            OwnerId = Guid.Parse("019639ea-c7de-7a01-8548-41edfccde206"),
            Name = "Test 3",
            Type = AdventureType.Generic,
            Description = "Test 3",
            IsPublished = false,
            IsPublic = false,
        });
        builder.Entity<AdventureEntity>().HasData(new AdventureEntity {
            Id = Guid.Parse("0196f86e-f929-7768-9b42-33e61727b389"),
            OwnerId = Guid.Empty,
            Name = "Test 4",
            Type = AdventureType.Generic,
            Description = "Test 4",
            IsPublished = true,
            IsPublic = true,
        });
        builder.Entity<AdventureEntity>().HasData(new AdventureEntity {
            Id = Guid.Parse("0196f86f-1c09-76a5-9f50-89ec627e5d00"),
            OwnerId = Guid.Empty,
            Name = "Test 5",
            Type = AdventureType.Generic,
            Description = "Test 5",
            IsPublished = true,
            IsPublic = true,
        });
        builder.Entity<AdventureEntity>().HasData(new AdventureEntity {
            Id = Guid.Parse("0196f86f-4212-78eb-8354-a990b4937911"),
            OwnerId = Guid.Empty,
            Name = "Test 6",
            Type = AdventureType.Generic,
            Description = "Test 6",
            IsPublished = true,
            IsPublic = true,
        });
    }
}