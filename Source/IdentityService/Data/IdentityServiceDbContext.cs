namespace IdentityService.Data;

public class IdentityServiceDbContext(DbContextOptions<IdentityServiceDbContext> options)
    : IdentityApiDbContext(options) {
}
