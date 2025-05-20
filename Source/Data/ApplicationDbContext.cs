using Adventure = VttTools.Data.Library.Entities.Adventure;
using Asset = VttTools.Data.Assets.Entities.Asset;
using GameSession = VttTools.Data.Game.Entities.GameSession;
using Scene = VttTools.Data.Library.Entities.Scene;

namespace VttTools.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<User, Role, Guid, UserClaim, UserRole, UserLogin, RoleClaim, UserToken>(options) {
    public DbSet<Asset> Assets { get; set; }
    public DbSet<Adventure> Adventures { get; set; }
    public DbSet<Scene> Scenes { get; set; }
    public DbSet<GameSession> GameSessions { get; set; }

    protected override void OnModelCreating(ModelBuilder builder) {
        base.OnModelCreating(builder);
        IdentitySchemaBuilder.ConfigureModel(builder);
        IdentitySchemaBuilder.SeedIdentity(builder);
        AssetSchemaBuilder.ConfigureModel(builder);
        EpicSchemaBuilder.ConfigureModel(builder);
        CampaignSchemaBuilder.ConfigureModel(builder);
        AdventureSchemaBuilder.ConfigureModel(builder);
        SceneSchemaBuilder.ConfigureModel(builder);
        GameSessionSchemaBuilder.ConfigureModel(builder);
    }
}