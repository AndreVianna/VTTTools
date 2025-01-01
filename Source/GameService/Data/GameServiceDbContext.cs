namespace GameService.Data;

public class GameServiceDbContext(DbContextOptions<GameServiceDbContext> options, IConfiguration configuration)
    : ApiDbContext(options) {
}
