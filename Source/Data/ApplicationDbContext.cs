namespace VttTools.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<User, Role, Guid, UserClaim, UserRole, UserLogin, RoleClaim, UserToken>(options) {
    public DbSet<Adventure> Adventures { get; set; }
    public DbSet<Episode> Episodes { get; set; }

    public DbSet<Asset> Assets { get; set; }

    public DbSet<Meeting> Meetings { get; set; }

    protected override void OnModelCreating(ModelBuilder builder) {
        base.OnModelCreating(builder);
        IdentitySchemaBuilder.ConfigureModel(builder);
        IdentitySchemaBuilder.SeedIdentity(builder);
        EpicSchemaBuilder.ConfigureModel(builder);
        CampaignSchemaBuilder.ConfigureModel(builder);
        AdventureSchemaBuilder.ConfigureModel(builder);
        EpisodeSchemaBuilder.ConfigureModel(builder);
        AssetSchemaBuilder.ConfigureModel(builder);
        MeetingSchemaBuilder.ConfigureModel(builder);
    }
}