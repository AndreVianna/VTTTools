// ReSharper disable once CheckNamespace
namespace Microsoft.AspNetCore.Builder;

internal static partial class WebApplicationBuilderExtensions {
    public static void AddUserAccountHandler(this WebApplicationBuilder builder)
        => builder.Services.AddScoped<IUserAccountHandler, UserAccountHandler>();
}
