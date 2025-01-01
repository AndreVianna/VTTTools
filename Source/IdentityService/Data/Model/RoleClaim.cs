namespace IdentityService.Data.Model;

[EntityTypeConfiguration(typeof(RoleClaim))]
public class RoleClaim
    : IdentityRoleClaim<Guid>
    , IEntityTypeConfiguration<RoleClaim> {
    public void Configure(EntityTypeBuilder<RoleClaim> builder) {
        builder.ToTable("RoleClaims");
        builder.Property(e => e.ClaimType).HasMaxLength(128);
    }
}
