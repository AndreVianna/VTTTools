namespace IdentityService.Data.Users;

public class UsersDataContext(DbContextOptions<UsersDataContext> options)
    : RoleBasedUsersDbContext(options);