namespace HttpServices.Identity.Data;

internal static class UserRoleDbContextBuilder {
    public static void ConfigureModel<TKey, TUser, TRole, TUserRole, TRoleClaim>(DbContext context, ModelBuilder modelBuilder)
        where TKey : IEquatable<TKey>
        where TUser : UserIdentity<TKey>
        where TRole : Role<TKey>
        where TUserRole : UserRole<TKey>
        where TRoleClaim : RoleClaim<TKey> {
        var storeOptions = context.GetService<IDbContextOptions>()
                                  .Extensions.OfType<CoreOptionsExtension>()
                                  .FirstOrDefault()?.ApplicationServiceProvider
                                 ?.GetService<IOptions<IdentityOptions>>()
                                 ?.Value.Stores;
        var maxKeyLength = storeOptions?.MaxLengthForKeys ?? 0;
        if (maxKeyLength == 0) maxKeyLength = 128;
        modelBuilder.Entity<TRole>(b => {
                                       b.ToTable("Roles");
                                       b.HasKey(e => e.Id);

                                       b.Property(i => i.Id).HasMaxLength(maxKeyLength);
                                       b.Property(e => e.Name).HasMaxLength(64).IsRequired();
                                       b.Property(e => e.NormalizedName).HasMaxLength(64).IsRequired();
                                       b.Property(e => e.ConcurrencyStamp).IsConcurrencyToken().HasMaxLength(36);

                                       b.HasMany<TRoleClaim>().WithOne().HasForeignKey(e => e.RoleId).IsRequired();

                                       b.HasIndex(r => r.NormalizedName).HasDatabaseName("RoleNameIndex").IsUnique();
                                   });

        modelBuilder.Entity<TRoleClaim>(b => {
                                            b.ToTable("RoleClaims");
                                            b.HasKey(rc => rc.Id);

                                            b.Property(e => e.Id).HasMaxLength(maxKeyLength);
                                            b.Property(e => e.ClaimType).HasMaxLength(64);
                                            b.Property(e => e.ClaimValue).HasMaxLength(256);
                                        });

        modelBuilder.Entity<TUserRole>(b => {
                                           b.ToTable("UserRoles");
                                           b.HasKey(r => new { r.UserId, r.RoleId });
                                           b.HasOne<TUser>().WithMany().HasForeignKey(i => i.UserId).IsRequired();
                                           b.HasOne<TRole>().WithMany().HasForeignKey(i => i.RoleId).IsRequired();
                                       });
    }
}
