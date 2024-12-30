namespace Domain.Auth;

[EntityTypeConfiguration(typeof(UserToken))]
public class UserToken
    : IdentityUserToken<Guid>
    , IEntityTypeConfiguration<UserToken> {
    public void Configure(EntityTypeBuilder<UserToken> builder) {
        builder.ToTable("UserTokens");
        builder.Property(e => e.LoginProvider).HasMaxLength(64);
        builder.Property(e => e.Name).HasMaxLength(32);
    }
}
