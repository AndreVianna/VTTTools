namespace Domain.Auth;

[EntityTypeConfiguration(typeof(Role))]
public class Role
    : IdentityRole<Guid>
    , IEntityTypeConfiguration<Role> {
    public void Configure(EntityTypeBuilder<Role> builder) {
        builder.ToTable("Roles");
        builder.Property(x => x.Id)
            .ValueGeneratedOnAdd()
            .HasValueGenerator<SequentialGuidValueGenerator>();
        builder.Property(e => e.Name).HasMaxLength(64);
        builder.Property(e => e.NormalizedName).HasMaxLength(64);
        builder.Property(e => e.ConcurrencyStamp).HasMaxLength(50);
    }
}
