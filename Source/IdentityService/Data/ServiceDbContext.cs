using HttpServices.Identity.Model;

using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Options;

namespace IdentityService.Data;

public class ServiceDbContext(DbContextOptions<ServiceDbContext> options)
    : IdentityProviderApiDbContext(options) {
    public DbSet<UserProfile> Profiles { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder) {
        base.OnModelCreating(builder);
        ServiceDbContextBuilder.ConfigureModel(this, builder);
    }
}

internal static class ServiceDbContextBuilder {
    public static void ConfigureModel(DbContext context, ModelBuilder modelBuilder) {
        var storeOptions = context.GetService<IDbContextOptions>()
                                  .Extensions.OfType<CoreOptionsExtension>()
                                  .FirstOrDefault()?
                                  .ApplicationServiceProvider?
                                  .GetService<IOptions<IdentityOptions>>()?
                                  .Value.Stores;
        var maxKeyLength = storeOptions?.MaxLengthForKeys ?? 0;
        if (maxKeyLength == 0)
            maxKeyLength = 128;
        var encryptPersonalData = storeOptions?.ProtectPersonalData ?? false;
        var converter = encryptPersonalData
                            ? new PersonalDataConverter(context.GetService<IPersonalDataProtector>())
                            : null;

        modelBuilder.Entity<UserProfile>(b => {
            b.ToTable("Profiles");
            b.HasKey(e => e.Id);
            b.Property(e => e.Id).HasMaxLength(maxKeyLength);
            b.HasOne<UserIdentity>()
             .WithOne()
             .HasPrincipalKey<UserIdentity>(e => e.Id)
             .HasForeignKey<UserProfile>(e => e.Id);
            b.ConvertPersonalDataProperties(converter);
        });
    }
}
