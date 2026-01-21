using RoleEntity = VttTools.Data.Identity.Entities.Role;
using UserEntity = VttTools.Data.Identity.Entities.User;

namespace VttTools.Data.Extensions;

public static class IdentityExtensions {
    public static IdentityBuilder AddIdentityInfrastructure(
        this IHostApplicationBuilder builder,
        Action<IdentityOptions>? configureOptions = null) {
        var identityBuilder = builder.Services.AddIdentity<UserEntity, RoleEntity>(options => configureOptions?.Invoke(options))
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

        return identityBuilder;
    }
}