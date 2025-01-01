namespace IdentityService.Data.Model;

[EntityTypeConfiguration(typeof(User))]
public class User
    : IdentityUser<Guid>
    , IEntityTypeConfiguration<User> {
    [Required]
    [ProtectedPersonalData]
#pragma warning disable CS8765 // Nullability of type of parameter doesn't match overridden member (possibly because of nullability attributes).
    public override string Email { get; set; } = null!;
#pragma warning restore CS8765

    [Required]
    [ProtectedPersonalData]
    public virtual string Name { get; set; } = null!;

    [ProtectedPersonalData]
    public virtual string? PreferredName { get; set; }

    public virtual bool AccountConfirmed => EmailConfirmed || PhoneNumberConfirmed;

    public virtual TwoFactorType TwoFactorType { get; set; }

    public void Configure(EntityTypeBuilder<User> builder) {
        builder.ToTable("Users");
        builder.Property(x => x.Id)
            .ValueGeneratedOnAdd()
            .HasValueGenerator<SequentialGuidValueGenerator>();
        builder.Property(e => e.Name).HasMaxLength(256);
        builder.Property(e => e.PreferredName).HasMaxLength(256);
        builder.Property(e => e.PhoneNumber).HasMaxLength(25);
        builder.Property(e => e.SecurityStamp).HasMaxLength(50);
        builder.Property(e => e.ConcurrencyStamp).HasMaxLength(50);
        builder.Property(e => e.TwoFactorType).HasConversion<string>();
    }
}
