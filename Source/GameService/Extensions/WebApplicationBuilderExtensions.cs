namespace VttTools.GameService.Extensions;

internal static class WebApplicationBuilderExtensions {
    internal static void ApplyRequiredConfiguration(this IApplicationBuilder app, IWebHostEnvironment environment) {
        if (!environment.IsDevelopment())
            app.UseExceptionHandler();

        app.UseHttpsRedirection();
        app.UseStaticFiles();
        app.UseRouting();
        app.UseCors();
        app.UseAuthentication();
        app.UseMiddleware<MyAuthorizationMiddleware>();

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