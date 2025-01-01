namespace IdentityService.Data.Model;

[EntityTypeConfiguration(typeof(UserRole))]
public class UserRole
    : IdentityUserRole<Guid>
    , IEntityTypeConfiguration<UserRole> {
    public void Configure(EntityTypeBuilder<UserRole> builder)
        => builder.ToTable("UserRoles");
}
