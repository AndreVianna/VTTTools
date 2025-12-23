using Adventure = VttTools.Data.Library.Entities.Adventure;
using AiModel = VttTools.Data.AI.Entities.AiModel;
using Asset = VttTools.Data.Assets.Entities.Asset;
using AssetStatEntry = VttTools.Data.Assets.Entities.AssetStatEntry;
using AuditLog = VttTools.Data.Audit.Entities.AuditLog;
using Campaign = VttTools.Data.Library.Entities.Campaign;
using Encounter = VttTools.Data.Library.Entities.Encounter;
using EncounterRegionVertex = VttTools.Data.Library.Entities.EncounterRegionVertex;
using GameSession = VttTools.Data.Game.Entities.GameSession;
using GameSystem = VttTools.Data.Common.Entities.GameSystem;
using Job = VttTools.Data.Jobs.Entities.Job;
using MaintenanceMode = VttTools.Data.Maintenance.Entities.MaintenanceMode;
using PromptTemplate = VttTools.Data.AI.Entities.PromptTemplate;
using Provider = VttTools.Data.AI.Entities.Provider;
using Resource = VttTools.Data.Media.Entities.Resource;
using Schedule = VttTools.Data.Game.Entities.Schedule;
using StatBlock = VttTools.Data.Game.Entities.StatBlock;
using World = VttTools.Data.Library.Entities.World;

namespace VttTools.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<User, Role, Guid, UserClaim, UserRole, UserLogin, RoleClaim, UserToken>(options) {
    public DbSet<Resource> Resources { get; set; }
    public DbSet<Asset> Assets { get; set; }
    public DbSet<AssetStatEntry> AssetStatEntries { get; set; }
    public DbSet<World> Worlds { get; set; }
    public DbSet<Campaign> Campaigns { get; set; }
    public DbSet<Adventure> Adventures { get; set; }
    public DbSet<Encounter> Encounters { get; set; }
    public DbSet<EncounterRegionVertex> EncounterRegionVertices { get; set; }
    public DbSet<GameSession> GameSessions { get; set; }
    public DbSet<GameSystem> GameSystems { get; set; }
    public DbSet<Schedule> Schedule { get; set; }
    public DbSet<StatBlock> StatBlocks { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<MaintenanceMode> MaintenanceMode { get; set; }
    public DbSet<PromptTemplate> PromptTemplates { get; set; }
    public DbSet<Provider> AiProviderConfigs { get; set; }
    public DbSet<AiModel> AiProviderModels { get; set; }
    public DbSet<Job> Jobs { get; set; }

    protected override void OnModelCreating(ModelBuilder builder) {
        base.OnModelCreating(builder);
        builder.Ignore<Size>();
        builder.Ignore<NamedSize>();
        IdentitySchemaBuilder.ConfigureModel(builder);
        IdentitySchemaSeeder.Seed(builder);
        ResourceSchemaBuilder.ConfigureModel(builder);
        AssetSchemaBuilder.ConfigureModel(builder);
        StatBlockSchemaBuilder.ConfigureModel(builder);
        WorldSchemaBuilder.ConfigureModel(builder);
        CampaignSchemaBuilder.ConfigureModel(builder);
        AdventureSchemaBuilder.ConfigureModel(builder);
        EncounterSchemaBuilder.ConfigureModel(builder);
        ScheduleSchemaBuilder.ConfigureModel(builder);
        GameSessionSchemaBuilder.ConfigureModel(builder);
        GameSystemSchemaBuilder.ConfigureModel(builder);
        AuditLogSchemaBuilder.ConfigureModel(builder);
        MaintenanceModeSchemaBuilder.ConfigureModel(builder);
        PromptTemplateSchemaBuilder.ConfigureModel(builder);
        AiProviderConfigSchemaBuilder.ConfigureModel(builder);
        JobSchemaBuilder.ConfigureModel(builder);
        //ApplicationSchemaSeeder.Seed(builder);
    }
}