namespace VttTools.Extensions;

public static class PublicLibraryExtensions {
    public static IHostApplicationBuilder AddPublicLibrary(this IHostApplicationBuilder builder) {
        builder.Services.Configure<PublicLibraryOptions>(
            builder.Configuration.GetSection(PublicLibraryOptions.SectionName));
        return builder;
    }
}