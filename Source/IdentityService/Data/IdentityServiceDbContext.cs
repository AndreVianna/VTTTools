namespace IdentityService.Data;

public class IdentityServiceDbContext(DbContextOptions<IdentityServiceDbContext> options)
    : IdentityProviderApiDbContext<UserProfile>(options);