namespace GameService.Data;

public class GameServiceDbContext(DbContextOptions<GameServiceDbContext> options)
    : ApiDbContext(options) {
}
