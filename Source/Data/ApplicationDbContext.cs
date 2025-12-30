using Adventure = VttTools.Data.Library.Adventures.Entities.Adventure;
using AiModel = VttTools.Data.AI.Entities.AiModel;
using Asset = VttTools.Data.Assets.Entities.Asset;
using AssetStatEntry = VttTools.Data.Assets.Entities.AssetStatEntry;
using AuditLog = VttTools.Data.Audit.Entities.AuditLog;
using Campaign = VttTools.Data.Library.Campaigns.Entities.Campaign;
using Encounter = VttTools.Data.Library.Encounters.Entities.Encounter;
using EncounterActor = VttTools.Data.Library.Encounters.Entities.EncounterActor;
using EncounterEffect = VttTools.Data.Library.Encounters.Entities.EncounterEffect;
using EncounterObject = VttTools.Data.Library.Encounters.Entities.EncounterObject;
using GameSession = VttTools.Data.Game.Entities.GameSession;
using GameSystem = VttTools.Data.Common.Entities.GameSystem;
using Job = VttTools.Data.Jobs.Entities.Job;
using MaintenanceMode = VttTools.Data.Maintenance.Entities.MaintenanceMode;
using PromptTemplate = VttTools.Data.AI.Entities.PromptTemplate;
using Provider = VttTools.Data.AI.Entities.Provider;
using Resource = VttTools.Data.Media.Entities.Resource;
using Schedule = VttTools.Data.Game.Entities.Schedule;
using Shape = VttTools.Data.Common.Entities.Shape;
using ShapeVertex = VttTools.Data.Common.Entities.ShapeVertex;
using Stage = VttTools.Data.Library.Stages.Entities.Stage;
using StageElement = VttTools.Data.Library.Stages.Entities.StageElement;
using StageLight = VttTools.Data.Library.Stages.Entities.StageLight;
using StageRegion = VttTools.Data.Library.Stages.Entities.StageRegion;
using StageRegionVertex = VttTools.Data.Library.Stages.Entities.StageRegionVertex;
using StageSound = VttTools.Data.Library.Stages.Entities.StageSound;
using StageWall = VttTools.Data.Library.Stages.Entities.StageWall;
using StageWallSegment = VttTools.Data.Library.Stages.Entities.StageWallSegment;
using StatBlock = VttTools.Data.Game.Entities.StatBlock;
using World = VttTools.Data.Library.Worlds.Entities.World;

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
    public DbSet<EncounterActor> EncounterActors { get; set; }
    public DbSet<EncounterObject> EncounterProps { get; set; }
    public DbSet<EncounterEffect> EncounterEffects { get; set; }
    public DbSet<Shape> Shapes { get; set; }
    public DbSet<ShapeVertex> ShapeVertices { get; set; }
    public DbSet<Stage> Stages { get; set; }
    public DbSet<StageWall> StageWalls { get; set; }
    public DbSet<StageWallSegment> StageWallSegments { get; set; }
    public DbSet<StageRegion> StageRegions { get; set; }
    public DbSet<StageRegionVertex> StageRegionVertices { get; set; }
    public DbSet<StageLight> StageLights { get; set; }
    public DbSet<StageElement> StageElements { get; set; }
    public DbSet<StageSound> StageSounds { get; set; }
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
        StageSchemaBuilder.ConfigureModel(builder);
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