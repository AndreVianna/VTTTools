namespace VttTools.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<User, Role, Guid, UserClaim, UserRole, UserLogin, RoleClaim, UserToken>(options) {
    public DbSet<Session> Sessions { get; set; }

    protected override void OnModelCreating(ModelBuilder builder) {
        base.OnModelCreating(builder);
        ApplicationDbContextBuilder.ConfigureModel(builder);
    }
}