namespace VttTools.GameService.Extensions;

internal static class WebApplicationBuilderExtensions {
    internal static void ApplyRequiredConfiguration(this IApplicationBuilder app, IWebHostEnvironment environment) {
        if (environment.IsProduction())
            app.UseExceptionHandler();

        app.UseHttpsRedirection();
        app.UseStaticFiles();
        app.UseRouting();
        app.UseCors();
        app.UseAuthentication();
        app.UseAuthorization();

        if (environment.IsProduction())
            app.UseHttpsRedirection();
    }

    internal static void MapApplicationEndpoints(this IEndpointRouteBuilder app) {
        app.MapOpenApi();
        app.MapHealthCheckEndpoints();
        app.MapMeetingEndpoints();
        app.MapAdventureEndpoints();
        app.MapEpisodeEndpoints();
        app.MapAssetEndpoints();
    }
}