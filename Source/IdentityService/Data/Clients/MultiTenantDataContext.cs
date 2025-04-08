namespace IdentityService.Data.Clients;

public class MultiTenantDataContext(DbContextOptions<MultiTenantDataContext> options)
    : WebApi.Tenants.Data.MultiTenantDataContext(options);