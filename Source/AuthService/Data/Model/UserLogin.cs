namespace Domain.Auth;

[EntityTypeConfiguration(typeof(UserLogin))]
public class UserLogin
    : IdentityUserLogin<Guid>
    , IEntityTypeConfiguration<UserLogin> {
    public void Configure(EntityTypeBuilder<UserLogin> builder) {
        builder.ToTable("UserLogins");
        builder.Property(e => e.LoginProvider).HasMaxLength(64);
        builder.Property(e => e.ProviderKey).HasMaxLength(128);
        builder.Property(e => e.ProviderDisplayName).HasMaxLength(64);
    }
}
