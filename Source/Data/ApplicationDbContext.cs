using Adventure = VttTools.Data.Library.Entities.Adventure;
using Asset = VttTools.Data.Assets.Entities.Asset;
using Barrier = VttTools.Data.Library.Entities.Barrier;
using Effect = VttTools.Data.Library.Entities.Effect;
using GameSession = VttTools.Data.Game.Entities.GameSession;
using Region = VttTools.Data.Library.Entities.Region;
using Resource = VttTools.Data.Media.Entities.Resource;
using Scene = VttTools.Data.Library.Entities.Scene;
using Schedule = VttTools.Data.Game.Entities.Schedule;
using Source = VttTools.Data.Library.Entities.Source;
using StatBlock = VttTools.Data.Game.Entities.StatBlock;
using Structure = VttTools.Data.Library.Entities.Structure;

namespace VttTools.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<User, Role, Guid, UserClaim, UserRole, UserLogin, RoleClaim, UserToken>(options) {
    public DbSet<Resource> Resources { get; set; }
    public DbSet<Asset> Assets { get; set; }
    public DbSet<Structure> Structures { get; set; }
    public DbSet<Barrier> Barriers { get; set; }
    public DbSet<Region> Regions { get; set; }
    public DbSet<Source> Sources { get; set; }
    public DbSet<Effect> Effects { get; set; }
    public DbSet<Adventure> Adventures { get; set; }
    public DbSet<Scene> Scenes { get; set; }
    public DbSet<GameSession> GameSessions { get; set; }
    public DbSet<Schedule> Schedule { get; set; }
    public DbSet<StatBlock> StatBlocks { get; set; }

    protected override void OnModelCreating(ModelBuilder builder) {
        base.OnModelCreating(builder);
        IdentitySchemaBuilder.ConfigureModel(builder);
        IdentitySchemaBuilder.SeedIdentity(builder);
        ResourceSchemaBuilder.ConfigureModel(builder);
        AssetSchemaBuilder.ConfigureModel(builder);
        StructureSchemaBuilder.ConfigureModel(builder);
        BarrierSchemaBuilder.ConfigureModel(builder);
        RegionSchemaBuilder.ConfigureModel(builder);
        SourceSchemaBuilder.ConfigureModel(builder);
        EffectSchemaBuilder.ConfigureModel(builder);
        StatBlockSchemaBuilder.ConfigureModel(builder);
        EpicSchemaBuilder.ConfigureModel(builder);
        CampaignSchemaBuilder.ConfigureModel(builder);
        AdventureSchemaBuilder.ConfigureModel(builder);
        SceneSchemaBuilder.ConfigureModel(builder);
        ScheduleSchemaBuilder.ConfigureModel(builder);
        GameSessionSchemaBuilder.ConfigureModel(builder);
    }
}
