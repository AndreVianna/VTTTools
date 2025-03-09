using HttpServices.ApiConsumers.Data;

namespace GameService.Data;

public class ServiceDbContext(DbContextOptions<ServiceDbContext> options)
    : ApiDbContext(options) {
}
