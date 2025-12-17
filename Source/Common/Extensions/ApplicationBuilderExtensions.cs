namespace VttTools.Extensions;

public static class ApplicationBuilderExtensions {
    public static void ApplyRequiredConfiguration(this IApplicationBuilder app, IWebHostEnvironment environment) {
        if (environment.IsProduction())
            app.UseExceptionHandler();

        if (environment.IsProduction())
            app.UseHttpsRedirection();

        app.UseRouting();
        app.UseCors("AllowAllOrigins");
        app.UseAuthentication();
        app.UseMiddleware<InternalApiKeyMiddleware>();
        app.UseAuthorization();
    }

    [System.Diagnostics.CodeAnalysis.SuppressMessage("Style", "IDE0022:Use expression body for method", Justification = "<Pending>")]
    public static void MapDefaultEndpoints(this IEndpointRouteBuilder app) {
        //app.MapOpenApi();
        // ReSharper disable once ArrangeMethodOrOperatorBody
        app.MapDetailedHealthCheckEndpoints();
    }
}