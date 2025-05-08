namespace VttTools.Extensions;

public static class ApplicationBuilderExtensions {
    public static void ApplyRequiredConfiguration(this IApplicationBuilder app, IWebHostEnvironment environment) {
        if (environment.IsProduction())
            app.UseExceptionHandler();

        if (environment.IsProduction())
            app.UseHttpsRedirection();
        app.UseRouting();
        app.UseAuthentication();
        app.UseAuthorization();
    }
}