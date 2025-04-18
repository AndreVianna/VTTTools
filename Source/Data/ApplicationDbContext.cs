namespace VttTools.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<User, Role, Guid, UserClaim, UserRole, UserLogin, RoleClaim, UserToken>(options) {
    public DbSet<Meeting> Meetings { get; set; }
    public DbSet<Adventure> Adventures { get; set; }
    public DbSet<Episode> Episodes { get; set; }
    public DbSet<Asset> Assets { get; set; }
    public DbSet<Campaign> Campaigns { get; set; }
    public DbSet<Epic> Epics { get; set; }

    protected override void OnModelCreating(ModelBuilder builder) {
        base.OnModelCreating(builder);
        IdentitySchemaBuilder.ConfigureModel(builder);
        IdentitySchemaBuilder.SeedIdentity(builder);
        MeetingSchemaBuilder.ConfigureModel(builder);
        AdventureSchemaBuilder.ConfigureModel(builder);
        EpisodeSchemaBuilder.ConfigureModel(builder);
        AssetSchemaBuilder.ConfigureModel(builder);
        CampaignSchemaBuilder.ConfigureModel(builder);
        EpicSchemaBuilder.ConfigureModel(builder);
    }
}