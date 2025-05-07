namespace VttTools.Extensions;

public static class ApplicationBuilderExtensions {
    public static void ApplyRequiredConfiguration(this IApplicationBuilder app, IWebHostEnvironment environment) {
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
}