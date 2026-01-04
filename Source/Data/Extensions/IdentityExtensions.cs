using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

using UserEntity = VttTools.Data.Identity.Entities.User;
using RoleEntity = VttTools.Data.Identity.Entities.Role;

namespace VttTools.Data.Extensions;

public static class IdentityExtensions {
    /// <summary>
    /// Configures ASP.NET Identity with EF Core stores.
    /// Encapsulates Identity entity types - callers don't need to reference them directly.
    /// </summary>
    /// <param name="builder">The host application builder.</param>
    /// <param name="configureOptions">Optional action to configure Identity options.</param>
    /// <returns>The IdentityBuilder for further configuration.</returns>
    public static IdentityBuilder AddIdentityInfrastructure(
        this IHostApplicationBuilder builder,
        Action<IdentityOptions>? configureOptions = null) {
        var identityBuilder = builder.Services.AddIdentity<UserEntity, RoleEntity>(options => {
            configureOptions?.Invoke(options);
        })
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

        return identityBuilder;
    }
}
