namespace IdentityService.Data.Model;

[EntityTypeConfiguration(typeof(UserClaim))]
public class UserClaim
    : IdentityUserClaim<Guid>
    , IEntityTypeConfiguration<UserClaim> {
    public void Configure(EntityTypeBuilder<UserClaim> builder) {
        builder.ToTable("UserClaims");
        builder.Property(e => e.ClaimType).HasMaxLength(128);
    }
}
