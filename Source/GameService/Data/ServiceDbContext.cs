namespace GameService.Data;

public class ServiceDbContext(DbContextOptions<ServiceDbContext> options)
    : MultiTenantDataContext(options) {
}
