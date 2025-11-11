using Adventure = VttTools.Data.Library.Entities.Adventure;
using Asset = VttTools.Data.Assets.Entities.Asset;
using AuditLog = VttTools.Data.Audit.Entities.AuditLog;
using Campaign = VttTools.Data.Library.Entities.Campaign;
using Effect = VttTools.Data.Assets.Entities.Effect;
using Epic = VttTools.Data.Library.Entities.Epic;
using GameSession = VttTools.Data.Game.Entities.GameSession;
using MaintenanceMode = VttTools.Data.Maintenance.Entities.MaintenanceMode;
using Resource = VttTools.Data.Media.Entities.Resource;
using Encounter = VttTools.Data.Library.Entities.Encounter;
using Schedule = VttTools.Data.Game.Entities.Schedule;
using StatBlock = VttTools.Data.Game.Entities.StatBlock;

namespace VttTools.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<User, Role, Guid, UserClaim, UserRole, UserLogin, RoleClaim, UserToken>(options) {
    public DbSet<Resource> Resources { get; set; }
    public DbSet<Asset> Assets { get; set; }
    public DbSet<Effect> Effects { get; set; }
    public DbSet<Epic> Epics { get; set; }
    public DbSet<Campaign> Campaigns { get; set; }
    public DbSet<Adventure> Adventures { get; set; }
    public DbSet<Encounter> Encounters { get; set; }
    public DbSet<GameSession> GameSessions { get; set; }
    public DbSet<Schedule> Schedule { get; set; }
    public DbSet<StatBlock> StatBlocks { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<MaintenanceMode> MaintenanceMode { get; set; }

    protected override void OnModelCreating(ModelBuilder builder) {
        base.OnModelCreating(builder);
        builder.Ignore<Size>();
        builder.Ignore<NamedSize>();
        builder.Ignore<ResourceMetadata>();
        IdentitySchemaBuilder.ConfigureModel(builder);
        IdentitySchemaSeeder.Seed(builder);
        ResourceSchemaBuilder.ConfigureModel(builder);
        AssetSchemaBuilder.ConfigureModel(builder);
        EffectSchemaBuilder.ConfigureModel(builder);
        StatBlockSchemaBuilder.ConfigureModel(builder);
        EpicSchemaBuilder.ConfigureModel(builder);
        CampaignSchemaBuilder.ConfigureModel(builder);
        AdventureSchemaBuilder.ConfigureModel(builder);
        EncounterSchemaBuilder.ConfigureModel(builder);
        ScheduleSchemaBuilder.ConfigureModel(builder);
        GameSessionSchemaBuilder.ConfigureModel(builder);
        AuditLogSchemaBuilder.ConfigureModel(builder);
        MaintenanceModeSchemaBuilder.ConfigureModel(builder);
        //ApplicationSchemaSeeder.Seed(builder);
    }
}